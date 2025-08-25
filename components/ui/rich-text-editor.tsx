"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "@/styles/rich-text-editor.css";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Text eingeben...",
  readOnly = false,
  className = "",
}: RichTextEditorProps) {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "header",
    "list",
    "script",
    "indent",
    "link",
  ];

  const { quill, quillRef } = useQuill({
    modules,
    formats,
    placeholder,
    readOnly,
    theme: "snow",
  });

  const isInitialized = useRef(false);
  const lastValue = useRef(value);
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced onChange to improve performance while typing
  const debouncedOnChange = useCallback(
    (html: string) => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      changeTimeoutRef.current = setTimeout(() => {
        onChange?.(html);
      }, 150);
    },
    [onChange]
  );

  useEffect(() => {
    if (quill) {
      // Set initial content if provided and not already initialized
      if (!isInitialized.current) {
        if (value) {
          quill.clipboard.dangerouslyPasteHTML(value);
        }
        isInitialized.current = true;
        lastValue.current = value;
      }

      // Listen for text changes with debouncing
      const handleTextChange = () => {
        const html = quill.root.innerHTML;
        // Only call onChange if the content actually changed to prevent loops
        if (html !== lastValue.current) {
          lastValue.current = html;
          debouncedOnChange(html);
        }
      };

      quill.on("text-change", handleTextChange);

      return () => {
        quill.off("text-change", handleTextChange);
        if (changeTimeoutRef.current) {
          clearTimeout(changeTimeoutRef.current);
        }
      };
    }
  }, [quill, debouncedOnChange]);

  // Update content when value prop changes externally
  useEffect(() => {
    if (quill && isInitialized.current && value !== lastValue.current) {
      const currentSelection = quill.getSelection();
      // Use a more efficient method to set content
      const delta = quill.clipboard.convert({ html: value || "" });
      // 'silent' prevents triggering text-change event
      quill.setContents(delta, "silent");
      lastValue.current = value;
      if (currentSelection) {
        quill.setSelection(currentSelection);
      }
    }
  }, [value, quill]);

  return (
    <div className={`rich-text-editor ${className}`}>
      {!quill && (
        <div className="border border-gray-300 rounded-lg p-3 min-h-[120px] bg-gray-50 flex items-center justify-center text-gray-500">
          Editor wird geladen...
        </div>
      )}
      <div
        ref={quillRef}
        style={{
          display: quill ? "block" : "none",
        }}
      />
    </div>
  );
}
