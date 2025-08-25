import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { defaultKnowledgeHubContent } from '@/data/default-data';

// Type for download counts
interface DownloadCounts {
  [key: string]: number;
}

// Blob storage filename
const DOWNLOAD_COUNTS_BLOB = 'download-counts.json';

/**
 * POST handler to reset download counts in Blob storage using default data
 * Use this endpoint only for initial setup or admin reset!
 */
export async function POST() {
  try {
    // Build download counts from default data
    const initialCounts: DownloadCounts = defaultKnowledgeHubContent.reduce((acc, item) => {
      acc[item.id] = item.downloads || 0;
      return acc;
    }, {} as DownloadCounts);

    // Overwrite Blob storage with initial counts
    await put(
      DOWNLOAD_COUNTS_BLOB,
      JSON.stringify(initialCounts, null, 2),
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
      message: 'Download counts have been reset from default data.',
      counts: initialCounts
    });
  } catch (error) {
    console.error('Failed to reset download counts:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
