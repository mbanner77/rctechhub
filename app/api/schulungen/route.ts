import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Schulung } from '@/types/schulung';
import { ICookieStore } from '../shared/Interfaces/ICookieStore';
import FileManager from '../shared/file-manager';
import { revalidatePath } from 'next/cache';

// Path for storing schulungen data in blob storage
const SCHULUNGEN_BLOB_PATH = 'realcore-data/pathfinder/schulungen/data.json';

// Get instance of file manager
const fileManager = FileManager.getInstance();

// Helper function for authentication check
async function isAuthenticated(): Promise<boolean> {
  const cookieStore: ICookieStore = await cookies();
  const sessionCookie = await cookieStore.get('admin_session');
  return !!sessionCookie;
}

// GET /api/schulungen
export async function GET() {
  try {
    // Get schulungen from blob storage
    let schulungen = await fileManager.getFile(SCHULUNGEN_BLOB_PATH);
    
    // If no data in blob storage
    if (!schulungen || !Array.isArray(schulungen) || schulungen.length === 0) {
      // If in development mode and no data exists, use mock data
      if (FileManager.isDevelopment()) {
        const mockData = await fileManager.getMockData('schulungen');
        if (mockData) {
          schulungen = mockData;
          console.info('[API] Using mock data for schulungen in development environment');
          
          // Create a response with the mock data and a dev message
          const responseData = [...schulungen]; // Ensure it's treated as an array
          // Add a non-enumerable property so it won't interfere with array methods
          Object.defineProperty(responseData, '_devMessage', {
            value: 'Using mock data in development environment',
            enumerable: true
          });
          
          return NextResponse.json(responseData);
        }
      }
      
      // In production, return empty array if no data exists
      // This will trigger UI message indicating no data available
      return NextResponse.json([]);
    }
    
    return NextResponse.json(schulungen);
  } catch (error) {
    console.error('Error loading trainings:', error);
    return NextResponse.json(
      { error: 'Error loading trainings' },
      { status: 500 }
    );
  }
}

// POST /api/schulungen
export async function POST(request: Request) {
  try {
    // Check authentication
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const schulungen = await request.json();
    
    if (!Array.isArray(schulungen)) {
      return NextResponse.json(
        { error: 'Invalid format. Array expected.' },
        { status: 400 }
      );
    }
    
    // Validate each training object
    for (const schulung of schulungen) {
      if (!schulung.id || !schulung.title || !schulung.category || !schulung.duration) {
        return NextResponse.json(
          { error: 'Invalid training object. Required fields missing.' },
          { status: 400 }
        );
      }
    }
    
    // Create backup of existing data first
    const existingData = await fileManager.getFile(SCHULUNGEN_BLOB_PATH);
    if (existingData) {
      const backupPath = `realcore-data/pathfinder/schulungen/backup-${Date.now()}.json`;
      await fileManager.uploadFile(existingData, backupPath);
    }
    
    // Save the trainings to blob storage
    const success = await fileManager.uploadFile(schulungen, SCHULUNGEN_BLOB_PATH);
    
    if (success) {
      // Revalidate paths that display schulungen
      revalidatePath('/pathfinder', 'page');
      revalidatePath('/pathfinder/[id]', 'page');
      
      return NextResponse.json({
        success: true,
        message: 'Schulungen saved successfully',
        count: schulungen.length
      });
    } else {
      throw new Error('Failed to save schulungen');
    }
  } catch (error) {
    console.error('Error saving trainings:', error);
    return NextResponse.json(
      { error: 'Error saving trainings' },
      { status: 500 }
    );
  }
}
