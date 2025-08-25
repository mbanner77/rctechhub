import { NextResponse } from 'next/server';
import { put, list } from '@/lib/blob-storage';
import { defaultKnowledgeHubContent } from '@/data/default-data';
import FileManager from '@/app/api/shared/file-manager';

// Define types for our download counts
interface DownloadCounts {
  [key: string]: number;
}

// Blob storage filename - separate files for dev and prod
const getDownloadCountsBlob = () => {
  const fileName = 'services/download-counts.json';
  return FileManager.isDevelopment() ? `${FileManager.getDevelopPath()}${fileName}` : fileName;
};

// In-memory cache for download counts
let memoryCache: DownloadCounts | null = null;

// Cache expiration time - we'll save to Blob storage every minute to reduce API calls
let lastSaveTime = 0;
const SAVE_INTERVAL = 60000; // 1 minute in milliseconds

// Initialize the download counts
const initializeDownloadCounts = async (): Promise<DownloadCounts> => {
  try {
    // First check if we have data in the memory cache
    if (memoryCache) {
      return memoryCache;
    }
    
    // Create initial counts from default data
    const initialCounts = defaultKnowledgeHubContent.reduce<DownloadCounts>((acc, item) => {
      acc[item.id] = item.downloads || 0;
      return acc;
    }, {});

    // Try to get counts from Blob storage
    try {
      const blobList = await list();
      const countBlob = blobList.blobs.find(blob => blob.pathname === getDownloadCountsBlob());
      
      if (countBlob) {
        // Fetch the blob content
        const response = await fetch(countBlob.url);
        if (response.ok) {
          const blobData = await response.json() as DownloadCounts;
          
          // Merge blob data with initial counts to ensure we have all IDs
          for (const id in initialCounts) {
            if (blobData[id] === undefined) {
              blobData[id] = initialCounts[id];
            }
          }
          
          memoryCache = blobData;
          return blobData;
        }
      }
    } catch (blobError) {
      console.error('Error reading download counts from Blob storage:', blobError);
    }
    
    // If no data in blob storage or fetch fails, use initial counts
    memoryCache = initialCounts;
    
    // Save initial counts to Blob storage
    try {
      await put(
        getDownloadCountsBlob(), 
        JSON.stringify(initialCounts, null, 2),
        { 
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false, // We want the same filename every time
          allowOverwrite: true,    // We need to overwrite the file each time
          cacheControlMaxAge: 60   // 1 minute cache - minimum allowed
        }
      );
      console.log('Initial download counts saved to Blob storage');
    } catch (putError) {
      console.error('Failed to create download counts in Blob storage:', putError);
    }
    
    return initialCounts;
  } catch (error) {
    console.error('Failed to initialize download counts:', error);
    return {};
  }
};

// Get the current download counts
const getDownloadCounts = async (): Promise<DownloadCounts> => {
  try {
    // This will return cached values if available, otherwise fetch from blob storage
    return await initializeDownloadCounts();
  } catch (error) {
    console.error('Failed to get download counts:', error);
    return memoryCache || {};
  }
};

// Save the download counts
const saveDownloadCounts = async (counts: DownloadCounts): Promise<void> => {
  try {
    // Always update the memory cache
    memoryCache = { ...counts };
    
    const now = Date.now();
    
    // Only write to Blob storage periodically to reduce API calls
    if (now - lastSaveTime > SAVE_INTERVAL) {
      try {
        await put(
          getDownloadCountsBlob(), 
          JSON.stringify(counts, null, 2),
          { 
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false, // We want the same filename every time
            allowOverwrite: true,    // We need to overwrite the file each time
            cacheControlMaxAge: 60   // 1 minute cache - minimum allowed
          }
        );
        lastSaveTime = now;
        console.log('Download counts saved to Blob storage');
      } catch (putError) {
        console.error('Failed to save download counts to Blob storage:', putError);
      }
    }
  } catch (error) {
    console.error('Failed to save download counts:', error);
  }
};

// Increment the download count for a specific item
export async function POST(request: Request) {
  try {
    const { itemId } = await request.json();
    
    if (!itemId) {
      return NextResponse.json({ success: false, message: 'Item ID is required' }, { status: 400 });
    }

    const counts = await getDownloadCounts();
    
    // Increment the count or initialize to 1 if it doesn't exist
    counts[itemId] = (counts[itemId] || 0) + 1;
    
    // Save the updated counts
    await saveDownloadCounts(counts);

    return NextResponse.json({ 
      success: true, 
      itemId, 
      downloads: counts[itemId]
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process download'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Return the current download counts
export async function GET() {
  try {
    // Set headers to prevent caching issues in production
    const counts = await getDownloadCounts();
    
    return NextResponse.json(counts, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error retrieving download counts:', error);
    return NextResponse.json({ error: 'Failed to retrieve download counts' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
