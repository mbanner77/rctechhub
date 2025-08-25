import { NextResponse } from 'next/server';
import FileManager from '../../shared/file-manager';

// This constant should match the path used in admin/case-studies/route.ts
const CASE_STUDIES_BLOB_PATH = 'realcore-data/pathfinder/case-studies/data.json';
import { getBlobContent, listFiles } from '@/lib/blob-storage';

export interface CaseStudy {
  id: string;
  title: string;
  industry: string;
  tags: string[];
  client: string;
  unitId?: string;
  clientLogo?: string;
  location?: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  image?: string;
  pdf?: string;
}

export async function GET(request: Request) {
  try {
    // Get the unitId from query params if provided
    const url = new URL(request.url);
    const unitId = url.searchParams.get('unitId');
    
    // Get the FileManager instance
    const fileManager = FileManager.getInstance();
    
    // Get case studies from the same path used by the admin API
    const caseStudiesData = await fileManager.getFile(CASE_STUDIES_BLOB_PATH);
    
    if (!caseStudiesData || !Array.isArray(caseStudiesData) || caseStudiesData.length === 0) {
      console.log("[CASE-STUDIES] No case studies found in data file");
      return NextResponse.json([], { status: 200 });
    }
    
    // Filter by unitId if provided
    if (unitId) {
      const filteredCaseStudies = caseStudiesData.filter(
        (caseStudy: CaseStudy) => caseStudy.unitId === unitId || caseStudy.unitId === 'all'
      );
      console.log(`[CASE-STUDIES] Found ${filteredCaseStudies.length} case studies for unitId ${unitId}`);
      return NextResponse.json(filteredCaseStudies, { status: 200 });
    }
    
    // If no unitId provided, return all case studies
    console.log(`[CASE-STUDIES] Returning all ${caseStudiesData.length} case studies`);
    return NextResponse.json(caseStudiesData, { status: 200 });
    
  } catch (error) {
    console.error('Error in GET /api/case-studies/by-unit:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Fallstudien' },
      { status: 500 }
    );
  }
}
