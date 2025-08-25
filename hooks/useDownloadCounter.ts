import { useState, useEffect } from 'react';

/**
 * Custom hook to handle template downloads
 * Increments the download counter when a template is downloaded
 * Uses localStorage to prevent duplicate downloads from the same user
 */
export function useDownloadCounter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track downloaded items in state
  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({});

  // Load previously downloaded items from localStorage on component mount
  useEffect(() => {
    try {
      const storedDownloads = localStorage.getItem('downloadedItems');
      if (storedDownloads) {
        setDownloadedItems(JSON.parse(storedDownloads));
      }
    } catch (err) {
      console.error('Error loading download history from localStorage:', err);
    }
  }, []);

  /**
   * Check if the user has already downloaded an item
   * @param itemId - The ID of the item to check
   * @returns boolean indicating if the item has already been downloaded
   */
  const hasDownloaded = (itemId: string): boolean => {
    return downloadedItems[itemId] === true;
  };

  /**
   * Increment the download counter for a specific item
   * Prevents duplicate counting by checking localStorage first
   * @param itemId - The ID of the item being downloaded
   * @returns The updated download count or null if already downloaded
   */
  const incrementDownloadCount = async (itemId: string): Promise<number | null> => {
    // Check if this item has already been downloaded by this user
    // But always allow the download, we're just not incrementing the counter
    const alreadyDownloaded = hasDownloaded(itemId);
    if (alreadyDownloaded) {
      console.log(`Item ${itemId} already downloaded by this user`);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If not already downloaded, increment the counter
      if (!alreadyDownloaded) {
        // Try up to 3 times with a delay between attempts
        let attemptCount = 0;
        let success = false;
        let data: any = null;
        
        while (attemptCount < 3 && !success) {
          try {
            const response = await fetch('/api/downloads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Add a cache-busting query parameter
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              },
              body: JSON.stringify({ 
                itemId,
                timestamp: Date.now() // Add timestamp to prevent caching
              }),
            });
            
            if (response.ok) {
              data = await response.json();
              success = true;
            } else {
              throw new Error('Failed to update download count');
            }
          } catch (fetchErr) {
            console.error(`Error incrementing download count (attempt ${attemptCount + 1}):`, fetchErr);
            attemptCount++;
            
            if (attemptCount < 3) {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * attemptCount));
            }
          }
        }
        
        if (!success) {
          throw new Error('Failed to update download count after multiple attempts');
        }
        
        // Mark this item as downloaded in localStorage
        const updatedDownloads = { ...downloadedItems, [itemId]: true };
        setDownloadedItems(updatedDownloads);
        try {
          localStorage.setItem('downloadedItems', JSON.stringify(updatedDownloads));
        } catch (storageErr) {
          console.error('Error saving download history to localStorage:', storageErr);
        }
        
        return data?.downloads || null;
      }
      
      return null;
    } catch (err) {
      console.error('Error in download process:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    incrementDownloadCount,
    isLoading,
    error,
    hasDownloaded,
  };
}
