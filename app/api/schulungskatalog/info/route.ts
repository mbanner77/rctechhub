import { NextResponse } from 'next/server';
import path from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import { list } from '@/lib/blob-storage';

const CATALOG_BLOB_PATH = 'realcore-data/schulungskatalog/';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const SCHULUNG_DIR = path.join(UPLOAD_DIR, 'schulung-catalog');

export async function GET() {
  try {
    // First, try to find the catalog in blob storage
    try {
      const blobs = await list({ prefix: CATALOG_BLOB_PATH });
      
      // Filter for PDF files and sort by last modified (newest first)
      const pdfBlobs = blobs.blobs
        .filter(blob => blob.pathname.toLowerCase().endsWith('.pdf'))
        .sort((a, b) => 
          new Date(b.uploadedAt || 0).getTime() - 
          new Date(a.uploadedAt || 0).getTime()
        );
      
      if (pdfBlobs.length > 0) {
        const catalog = pdfBlobs[0];
        return NextResponse.json({
          url: catalog.url,
          filename: 'Training Catalog.pdf',
          size: catalog.size,
          local: false
        });
      }
    } catch (blobError) {
      console.error('[TRAINING_CATALOG] Blob error:', blobError);
      // Continue despite blob error, as we can fall back to local storage
    }
    
    // If not found in blob storage, try to find the most recent catalog file locally
    if (existsSync(SCHULUNG_DIR)) {
      try {
        // Get all files in the directory
        const files = readdirSync(SCHULUNG_DIR)
          .filter(file => file.toLowerCase().endsWith('.pdf'))
          // Sort by modification time (most recent first)
          .map(file => {
            const filePath = path.join(SCHULUNG_DIR, file);
            return {
              name: file,
              path: filePath,
              mtime: statSync(filePath).mtime.getTime()
            };
          })
          .sort((a, b) => b.mtime - a.mtime);
        
        // If we found at least one file
        if (files.length > 0) {
          const latestFile = files[0];
          return NextResponse.json({
            url: `/uploads/schulung-catalog/${latestFile.name}`,
            filename: 'Training Catalog.pdf',
            local: true
          });
        }
      } catch (err) {
        console.error('[TRAINING_CATALOG] Error reading local directory:', err);
      }
    }
    
    // No catalog found in either storage location
    return NextResponse.json({ message: 'No catalog found' }, { status: 404 });
    
  } catch (error) {
    console.error('[TRAINING_CATALOG] Error retrieving catalog info:', error);
    return NextResponse.json(
      { error: `Error retrieving catalog info: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
