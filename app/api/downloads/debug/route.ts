import { NextResponse } from 'next/server';
import { list, put } from '@/lib/blob-storage';

// Define constants and types
const DOWNLOAD_COUNTS_BLOB = 'download-counts.json';

interface DownloadCounts {
  [key: string]: number;
}

/**
 * Helper function to fetch download counts from Blob storage
 */
async function fetchBlobDownloadCounts(): Promise<{
  blobList: Awaited<ReturnType<typeof list>> | null;
  countBlob: any | null;
  countData: DownloadCounts | null;
}> {
  try {
    // Get list of blobs
    const blobList = await list();
    
    // Find the download counts blob
    const countBlob = blobList.blobs.find(blob => blob.pathname === DOWNLOAD_COUNTS_BLOB);
    if (!countBlob) {
      console.log(`${DOWNLOAD_COUNTS_BLOB} not found in blob storage`);
      return { blobList, countBlob: null, countData: null };
    }
    
    // Get the download counts data
    const response = await fetch(countBlob.url);
    if (!response.ok) {
      console.error('Failed to fetch blob content:', response.status, response.statusText);
      return { blobList, countBlob, countData: null };
    }
    
    const countData = await response.json() as DownloadCounts;
    return { blobList, countBlob, countData };
  } catch (error) {
    console.error('Error fetching download counts from Blob storage:', error);
    return { blobList: null, countBlob: null, countData: null };
  }
}

// Debug endpoint for Blob storage
export async function GET() {
  try {
    // Get download counts from Blob storage
    const { blobList, countBlob: downloadCountsBlob, countData: downloadCountsData } = await fetchBlobDownloadCounts();
    
    // Return debug information
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      blobStorage: {
        configured: true,
        blobs: blobList ? blobList.blobs.map(blob => ({
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          url: blob.url
        })) : [],
        downloadCountsBlob: downloadCountsBlob ? {
          pathname: downloadCountsBlob.pathname,
          url: downloadCountsBlob.url,
          size: downloadCountsBlob.size,
          uploadedAt: downloadCountsBlob.uploadedAt
        } : null,
        downloadCountsData
      },
      env: {
        hasBlob: process.env.BLOB_READ_WRITE_TOKEN ? 'Configured' : 'Not configured',
        nodeEnv: process.env.NODE_ENV
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
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

// POST handler for testing download increments directly
export async function POST(request: Request) {
  try {
    const { itemId, action } = await request.json();
    
    if (!itemId) {
      return NextResponse.json({ success: false, message: 'Item ID is required' }, { status: 400 });
    }
    
    // Check if BLOB storage is configured properly
    // Get existing download counts
    const { countData } = await fetchBlobDownloadCounts();
    let downloadCountsData: DownloadCounts = countData || {};
    
    // Perform the requested action
    if (action === 'increment') {
      // Increment the download count for the specified item
      downloadCountsData[itemId] = (downloadCountsData[itemId] || 0) + 1;
      
      // Save back to blob storage
      await put(
        DOWNLOAD_COUNTS_BLOB, 
        JSON.stringify(downloadCountsData, null, 2),
        { 
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60
        }
      );
      
      return NextResponse.json({
        success: true,
        action: 'increment',
        itemId,
        newCount: downloadCountsData[itemId],
        timestamp: new Date().toISOString()
      });
    } else if (action === 'reset') {
      // Reset the download count for the specified item
      if (downloadCountsData[itemId] !== undefined) {
        downloadCountsData[itemId] = 0;
        
        // Save back to blob storage
        await put(
          DOWNLOAD_COUNTS_BLOB, 
          JSON.stringify(downloadCountsData, null, 2),
          { 
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60
          }
        );
      }
      
      return NextResponse.json({
        success: true,
        action: 'reset',
        itemId,
        newCount: 0,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action. Valid actions: increment, reset' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error in debug POST endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
