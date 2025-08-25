import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@/lib/blob-storage';
import { ICookieStore } from '../../../shared/Interfaces/ICookieStore';

// Base path for storing case study files (images and PDFs)
const CASE_STUDIES_FILES_BLOB_PREFIX = 'realcore-data/pathfinder/case-studies/files/';

// Auth helper
async function isAuthenticated(): Promise<boolean> {
  const cookieStore: ICookieStore = await cookies();
  const sessionCookie = await cookieStore.get('admin_session');
  return !!sessionCookie;
}

// Endpoint for uploading case study files (images and PDFs)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'pdf'
    
    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 });
    }
    
    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed for type image' }, { status: 400 });
    }
    
    if (type === 'pdf' && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed for type pdf' }, { status: 400 });
    }

    // Generate a timestamped filename to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || (type === 'pdf' ? 'pdf' : 'jpg');
    const safeFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
      
    const blobPath = `${CASE_STUDIES_FILES_BLOB_PREFIX}${type}/${timestamp}-${safeFileName}`;

    // Upload the file
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
    console.error('[CASE-STUDIES] Error uploading file:', error);
    return NextResponse.json(
      { error: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    );
  }
}
