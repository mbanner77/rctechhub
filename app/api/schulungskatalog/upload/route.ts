import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { cookies } from 'next/headers';
import { ICookieStore } from '../../shared/Interfaces/ICookieStore';

// Path for saving the catalog
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const SCHULUNG_DIR = path.join(UPLOAD_DIR, 'schulung-catalog');
// We'll dynamically generate the file path when saving
let catalogFilename = '';

// Helper function for authentication check
async function isAuthenticated(): Promise<boolean> {
  const cookieStore: ICookieStore = await cookies();
  const sessionCookie = await cookieStore.get('admin_session');
  return !!sessionCookie;
}

// Ensure the uploads and schulung-catalog directories exist
async function ensureUploadDir() {
  if (!existsSync(SCHULUNG_DIR)) {
    await mkdir(SCHULUNG_DIR, { recursive: true });
  }
}

// POST /api/schulungskatalog/upload - Upload catalog
export async function POST(request: Request) {
  try {
    // Check authentication first
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }
    
    // Generate a safe filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    catalogFilename = `catalog-${timestamp}.${fileExtension}`;
    
    // Ensure upload directory exists
    await ensureUploadDir();
    
    // Create the full path for the file
    const filePath = path.join(SCHULUNG_DIR, catalogFilename);
    
    // Convert file to ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      success: true,
      filename: file.name,
      url: `/uploads/schulung-catalog/${catalogFilename}`
    });
    
  } catch (error) {
    console.error('[TRAINING_CATALOG] Error uploading catalog:', error);
    return NextResponse.json(
      { error: 'Error uploading the catalog' },
      { status: 500 }
    );
  }
}
