"use client"

import React, { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "@/styles/rich-text-editor.css";

interface RichTextEditorProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (html: string) => void;
  className?: string;
  minHeightPx?: number;
}

export default function RichTextEditor({
  id,
  label,
  placeholder = "",
  value,
  onChange,
  className = "mb-4",
  minHeightPx = 140,
}: RichTextEditorProps) {
  const { quill, quillRef } = useQuill({
    placeholder,
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "blockquote", "code"],
        ["clean"],
      ],
    },
    theme: "snow",
  });

  // Initialize content
  useEffect(() => {
    if (quill && typeof value === "string") {
      const current = quill.root.innerHTML;
      if (value !== current) {
        const delta = quill.clipboard.convert({ html: value || "" });
        quill.setContents(delta, "silent");
      }
      // Ensure min height
      quill.root.style.minHeight = `${minHeightPx}px`;
    }
  }, [quill]);

  // Update when external value changes
  useEffect(() => {
    if (quill && typeof value === "string") {
      const current = quill.root.innerHTML;
      if (value !== current) {
        const delta = quill.clipboard.convert({ html: value || "" });
        quill.setContents(delta, "silent");
      }
    }
  }, [value, quill]);

  // Emit changes
  useEffect(() => {
    if (!quill) return;
    const handler = () => {
      onChange(quill.root.innerHTML);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [quill, onChange]);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium">
          {label}
        </label>
      )}
      <div id={id} ref={quillRef as React.RefObject<HTMLDivElement>} className="rich-text-editor" />
    </div>
  );
}
