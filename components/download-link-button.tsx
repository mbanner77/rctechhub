"use client"

import { useState, useEffect } from 'react'
import type React from "react"
import { useDownloadCounter } from "@/hooks/useDownloadCounter"
import { fetchDownloadCounts } from "@/lib/download-helpers"

interface DownloadLinkButtonProps {
  title: string
  type: "template" | "bestpractice" | "whitepaper"
  // We keep the original onDownload for backward compatibility
  onDownload?: (title: string, type: "template" | "bestpractice" | "whitepaper") => void
  // Add new props for the download counter functionality
  itemId?: string
  initialCount?: number
  downloadUrl?: string
  children: React.ReactNode
  showCount?: boolean
}

export default function DownloadLinkButton({ 
  title, 
  type, 
  onDownload, 
  itemId, 
  initialCount = 0, 
  downloadUrl,
  showCount = true,
  children 
}: DownloadLinkButtonProps) {
  const [count, setCount] = useState(initialCount);
  const { incrementDownloadCount, isLoading } = useDownloadCounter();
  
  // Fetch current download count when component mounts
  useEffect(() => {
    // Only fetch if we have an itemId
    if (itemId) {
      const fetchCurrentCount = async () => {
        try {
          const counts = await fetchDownloadCounts();
          // Only update if we got a valid count and it's different from what we have
          if (counts && counts[itemId] !== undefined && counts[itemId] !== count) {
            console.log(`Updating count for ${itemId} from ${count} to ${counts[itemId]}`);
            setCount(counts[itemId]);
          }
        } catch (error) {
          console.error('Error fetching download count:', error);
        }
      };
      
      fetchCurrentCount();
    }
  }, [itemId]);

  // Fetch the current download count from the backend when the component mounts
  // This ensures the count persists after page refresh
  useEffect(() => {
    if (itemId) {
      // Fetch the current download count from the API
      const fetchCurrentCount = async () => {
        try {
          const counts = await fetchDownloadCounts();
          // Update local state if the count exists in the backend
          if (counts[itemId] !== undefined) {
            setCount(counts[itemId]);
          }
        } catch (error) {
          console.error('Error fetching download count:', error);
        }
      };
      
      fetchCurrentCount();
    }
  }, [itemId]);

  // Fetch the current download count from the backend when the component mounts
  // This ensures the count persists after page refresh
  useEffect(() => {
    if (itemId) {
      // Fetch the current download count from the API
      const fetchCurrentCount = async () => {
        try {
          const counts = await fetchDownloadCounts();
          // Update local state if the count exists in the backend
          if (counts[itemId] !== undefined) {
            setCount(counts[itemId]);
          }
        } catch (error) {
          console.error('Error fetching download count:', error);
        }
      };
      
      fetchCurrentCount();
    }
  }, [itemId]);

  const handleClick = async () => {
    // Support legacy onDownload function
    if (onDownload) {
      onDownload(title, type);
    }
    
    // If we have an itemId, use the download counter API
    if (itemId) {
      const newCount = await incrementDownloadCount(itemId);
      if (newCount !== null) {
        setCount(newCount);
      }
    }
    
    // Trigger the actual download if URL is provided
    if (downloadUrl) {
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', title);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        className="text-gray-600 hover:text-green-600 text-sm font-normal text-left"
        onClick={handleClick}
        disabled={isLoading}
      >
        {children}
      </button>
      
      {showCount && itemId && (
        <span className="text-xs text-gray-500 mt-1 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
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
          {count} Downloads
        </span>
      )}
    </div>
  )
}
