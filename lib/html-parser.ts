import React from 'react'
import parse, { HTMLReactParserOptions, Element, domToReact, DOMNode } from 'html-react-parser'

/**
 * Parses HTML content with special handling for Quill.js editor markup
 * @param htmlString - The HTML string to parse
 * @returns Parsed React elements or null if no content
 */
export const parseQuillHTML = (htmlString: string) => {
  if (!htmlString) return null;

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === 'tag' && domNode instanceof Element) {
        // Remove Quill UI elements that shouldn't be displayed
        if (domNode.attribs?.class?.includes('ql-ui')) {
          return React.createElement(React.Fragment);
        }
        
        // Handle Quill list items with proper styling
        if (domNode.name === 'li' && domNode.attribs?.['data-list']) {
          const listType = domNode.attribs['data-list'];
          const children = domToReact(domNode.children as DOMNode[], options);
          
          // Apply proper list styling based on Quill list type
          const className = listType === 'ordered' 
            ? 'list-decimal list-inside' 
            : listType === 'bullet' 
              ? 'list-disc list-inside'
              : '';
              
          return React.createElement('li', {
            className,
            style: { marginLeft: '1rem' }
          }, children);
        }

        // Handle ordered lists
        if (domNode.name === 'ol') {
          const children = domToReact(domNode.children as DOMNode[], options);
          return React.createElement('ol', {
            className: 'list-decimal list-inside space-y-1 ml-4'
          }, children);
        }

        // Handle unordered lists
        if (domNode.name === 'ul') {
          const children = domToReact(domNode.children as DOMNode[], options);
          return React.createElement('ul', {
            className: 'list-disc list-inside space-y-1 ml-4'
          }, children);
        }
      }
    }
  };

  return parse(htmlString, options);
};
