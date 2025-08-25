/**
 * Helper functions to work with download counts
 */

/**
 * Fetches the current download counts from the API
 * @returns An object with item IDs as keys and download counts as values
 */
export async function fetchDownloadCounts(): Promise<Record<string, number>> {
  try {
    // Add cache-busting query parameter to prevent caching
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(`/api/downloads${cacheBuster}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add cache control headers to prevent caching
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      // Ensure we're not using cached data
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch download counts: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching download counts:', error);
    return {};
  }
}

/**
 * Updates the defaultKnowledgeHubContent with the latest download counts
 * @param content - The original content array
 * @param counts - The download counts object
 * @returns The updated content array with the latest download counts
 */
export function updateContentWithDownloadCounts<T extends { id: string; downloads: number }>(
  content: T[],
  counts: Record<string, number>
): T[] {
  return content.map(item => {
    if (counts[item.id] !== undefined) {
      return { ...item, downloads: counts[item.id] };
    }
    return item;
  });
}

/**
 * Utility function to reset the download history in localStorage
 * This can be useful for debugging or when the download count behavior needs to be reset
 */
export function resetDownloadHistory(): void {
  try {
    localStorage.removeItem('downloadedItems');
    console.log('Download history has been reset');
  } catch (error) {
    console.error('Error resetting download history:', error);
  }
}
