import { useState, useEffect } from 'react';
import { useDownloadCounter } from '@/hooks/useDownloadCounter';
import { fetchDownloadCounts } from '@/lib/download-helpers';

interface DownloadCounterProps {
  itemId: string;
  initialCount: number;
  className?: string;
}

/**
 * Component that displays a download count and updates it when the user clicks download
 * Prevents duplicate downloads from the same user using localStorage
 */
export function DownloadCounter({ itemId, initialCount, className = '' }: DownloadCounterProps) {
  const [count, setCount] = useState(initialCount);
  const { incrementDownloadCount, isLoading, hasDownloaded } = useDownloadCounter();
  const [isAlreadyDownloaded, setIsAlreadyDownloaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check if the item has already been downloaded on mount
  // and fetch the current download count from the backend
  useEffect(() => {
    // Check if already downloaded from localStorage
    setIsAlreadyDownloaded(hasDownloaded(itemId));
    
    // Fetch the current download count from the API to ensure it persists after refresh
    const fetchCurrentCount = async () => {
      try {
        const counts = await fetchDownloadCounts();
        // Only update the count if it's higher than what we have
        // This ensures we don't display lower counts due to caching or old data
        if (counts[itemId] !== undefined && counts[itemId] > count) {
          setCount(counts[itemId]);
        } else if (counts[itemId] === undefined && retryCount < 3) {
          // If the item doesn't exist in the counts yet, retry up to 3 times
          // This helps in cases where the API might be slow to initialize
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000); // Wait 2 seconds before retrying
        }
      } catch (error) {
        console.error('Error fetching download count:', error);
      }
    };
    
    fetchCurrentCount();
  }, [itemId, hasDownloaded, retryCount]);

  // Handles the download click event
  const handleDownload = async () => {
    if (isAlreadyDownloaded) {
      // If already downloaded, don't increment the counter again
      // But still allow the download action to happen
      console.log('Already downloaded, not incrementing counter');
      return;
    }

    const newCount = await incrementDownloadCount(itemId);
    if (newCount !== null) {
      setCount(newCount);
      setIsAlreadyDownloaded(true);
    }
  };

  return (
    <div className={className}>
      <span className="inline-flex items-center">
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
      </span>
      <button 
        onClick={handleDownload}
        disabled={isLoading}
        className={`ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          isAlreadyDownloaded 
            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
            : 'bg-gray-100 hover:bg-gray-200 text-black focus:ring-blue-500'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
      >
        {isLoading ? 'Downloading...' : isAlreadyDownloaded ? 'Download Again' : 'Download'}
      </button>
    </div>
  );
}
