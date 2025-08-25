import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { list, put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { ICookieStore } from '../../shared/Interfaces/ICookieStore';
import FileManager from '../../shared/file-manager';

// Base path for storing case studies
const CASE_STUDIES_BLOB_PATH = 'realcore-data/pathfinder/case-studies/data.json';
const CASE_STUDIES_BLOB_PREFIX = 'realcore-data/pathfinder/case-studies/';

// Auth helper
async function isAuthenticated(): Promise<boolean> {
  const cookieStore: ICookieStore = await cookies();
  const sessionCookie = await cookieStore.get('admin_session');
  return !!sessionCookie;
}

// GET - retrieve all case studies
export async function GET() {
  try {
    // Case studies are available to all users (no auth check)
    const fileManager = FileManager.getInstance();
    const caseStudies = await fileManager.getFile(CASE_STUDIES_BLOB_PATH);
    
    return NextResponse.json(caseStudies || []);
  } catch (error) {
    console.error('[CASE-STUDIES] Error retrieving case studies:', error);
    return NextResponse.json(
      { error: 'Error retrieving case studies' }, 
      { status: 500 }
    );
  }
}

// POST - save case studies
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const caseStudies = await request.json();
    const fileManager = FileManager.getInstance();

    // Create backup of existing data first
    const existingData = await fileManager.getFile(CASE_STUDIES_BLOB_PATH);
    if (existingData) {
      const backupPath = `${CASE_STUDIES_BLOB_PREFIX}backup-${Date.now()}.json`;
      await fileManager.uploadFile(existingData, backupPath);
    }
    
    // Save the new data
    const success = await fileManager.uploadFile(caseStudies, CASE_STUDIES_BLOB_PATH);
    
    if (success) {
      // Revalidate paths that display case studies
      revalidatePath('/pathfinder', 'page');
      revalidatePath('/pathfinder/[id]', 'page');
      
      return NextResponse.json({
        success: true,
        message: 'Case studies saved successfully',
        count: caseStudies.length
      });
    } else {
      throw new Error('Failed to save case studies');
    }
  } catch (error) {
    console.error('[CASE-STUDIES] Error saving case studies:', error);
    return NextResponse.json(
      { error: `Error saving case studies: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    );
  }
}
