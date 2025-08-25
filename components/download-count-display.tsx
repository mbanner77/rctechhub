"use client"

import { useState } from 'react';

interface DownloadCountDisplayProps {
  count: number;
  className?: string;
}

/**
 * Simple component to display download counts
 */
export default function DownloadCountDisplay({ count, className = '' }: DownloadCountDisplayProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-1 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
        />
      </svg>
      <span className="text-sm text-gray-500">{count} Downloads</span>
    </div>
  );
}
