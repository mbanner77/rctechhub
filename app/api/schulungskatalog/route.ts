import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put, list, del } from '@vercel/blob';
import { ICookieStore } from '../shared/Interfaces/ICookieStore';

// Base path for storing training catalog files
const CATALOG_BLOB_BASE_PATH = 'realcore-data/schulungskatalog/';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore: ICookieStore = await cookies();
  const sessionCookie = await cookieStore.get('admin_session');
  return !!sessionCookie;
}

// Endpoint for uploading the catalog
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Generate a timestamped filename to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const blobPath = `${CATALOG_BLOB_BASE_PATH}catalog-${timestamp}.${fileExtension}`;

    // Upload new catalog file
    const result = await put(blobPath, file, {
      contentType: file.type,
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: file.name
    });
  } catch (error) {
    console.error('[TRAINING_CATALOG] Error uploading:', error);
    return NextResponse.json(
      { error: `Error uploading the catalog: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    );
  }
}

// Endpoint for retrieving the catalog
export async function GET() {
  try {
    const blobs = await list({ prefix: CATALOG_BLOB_BASE_PATH });
    
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
        fileName: 'Training Catalog.pdf', // Default name if no actual name is available
        size: catalog.size
      });
    } else {
      return NextResponse.json({ message: 'No catalog found' }, { status: 404 });
    }
  } catch (error) {
    console.error('[TRAINING_CATALOG] Error retrieving:', error);
    return NextResponse.json(
      { error: `Error retrieving the catalog: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Endpoint for deleting the catalog
export async function DELETE() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const blobs = await list({ prefix: CATALOG_BLOB_BASE_PATH });
    
    // Filter for PDF files and sort by last modified (newest first)
    const pdfBlobs = blobs.blobs
      .filter(blob => blob.pathname.toLowerCase().endsWith('.pdf'))
      .sort((a, b) => 
        new Date(b.uploadedAt || 0).getTime() - 
        new Date(a.uploadedAt || 0).getTime()
      );
    
    if (pdfBlobs.length > 0) {
      await del(pdfBlobs[0].url);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ message: 'No catalog found to delete' }, { status: 404 });
    }
  } catch (error) {
    console.error('[TRAINING_CATALOG] Error deleting:', error);
    return NextResponse.json(
      { error: `Error deleting the catalog: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
