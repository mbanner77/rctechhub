import { cookies } from "next/headers";
import { put, list, del } from "@vercel/blob";

import { IFileManager } from "./Interfaces/IFileManager";
import { ICookieStore } from "./Interfaces/ICookieStore";

import { Cache } from './cache';

export default class FileManager implements IFileManager {
  private static instance: FileManager;
  private static DEVELOP_PATH: string = "develop/";
  private static ENVIRONMENT: string = process.env.ENVIRONMENT || "Develop";
  private static IS_DEV: boolean = FileManager.ENVIRONMENT === "Develop" ||
    process.env.NODE_ENV === 'development';
    
  public static isDevelopment: any = () => {
    return FileManager.IS_DEV;
  }

  public static getDevelopPath: () => string = () => {
    return FileManager.DEVELOP_PATH;
  }
  private static JSONCache = Cache.getInstance();

  constructor() {
    console.log("Singleton instance created!");
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  // Hilfsfunktion zum Überprüfen, ob ein Blob existiert
  public async blobExists(key: string): Promise<{ url: string } | undefined> {
    try {
      const { blobs } = await list({ prefix: key.substring(0, key.lastIndexOf("/")) });
      const exactMatch = blobs.find((blob) => blob.pathname === key);
      return exactMatch;
    } catch (error) {
      console.error("Error checking if blob exists:", error);
      return;
    }
  }

  // Hilfsfunktion zur Überprüfung der Authentifizierung
  public async isAuthenticated(): Promise<boolean> {
    try {
      const cookieStore: ICookieStore = await cookies();
      const sessionCookie = await cookieStore.get("admin_session");
      return !!sessionCookie;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  }

  /**
   * Method to upload PDF files. Should be merged with "uploadFile" in the future by using a more Generic (Design Pattern) approach on uploading files. 
   * To avoid unnecessary go-live conflicts, the code is redundant for now - No test automation and therefore no clarity, if the other code structures would fail. 
   * @param fileBlob 
   * @param fileNameAndPath 
   * @returns object  
   */
  public async uploadPdfFile(fileBlob: Buffer, fileNameAndPath: string): Promise<string> {
    // remove leading slash(es) if present
    fileNameAndPath = fileNameAndPath.replace(/^\/+/, "");
    if (FileManager.IS_DEV && !fileNameAndPath.startsWith(FileManager.DEVELOP_PATH))
      fileNameAndPath = `${FileManager.DEVELOP_PATH}${fileNameAndPath}`;

    const isPdf = fileNameAndPath.match(/\.pdf$/i);
    if (!isPdf) console.warn('FileManager.uploadPdfFile: A non pdf has been uploaded.');

    const { url } = await put(fileNameAndPath, fileBlob as Buffer | ArrayBuffer, {
      contentType: "application/pdf",
      access: "public",
      allowOverwrite: true,
    });
    
    if (!url) console.error('FileManager.uploadPdfFile: No url for file has been returned.')
    return url;
  }

  public async uploadFile(file: object, fileName: string): Promise<boolean> {
    // remove leading slash(es) if present
    fileName = fileName.replace(/^\/+/, "");

    // TODO: Replace with FileManager.IS_DEV in the future 
    if (FileManager.ENVIRONMENT === "Develop" && !fileName.startsWith(FileManager.DEVELOP_PATH))
      fileName = `${FileManager.DEVELOP_PATH}${fileName}`;

    const existingFile = await this.getFile(fileName);

    try {
      if (existingFile !== null) {
        const fileBasePath = fileName.substring(0, fileName.lastIndexOf("/"));
        const backupPath = `${fileBasePath}/backup.json`;

        await put(backupPath, JSON.stringify(existingFile), {
          contentType: "application/json",
          access: "public",
          addRandomSuffix: true,
        });
      }
      FileManager.JSONCache.uploadFile(file, fileName);
      
      console.log(`[FILE-MANAGER] Uploading file to ${fileName}`);
      const { url } = await put(fileName, JSON.stringify(file, null, 2), {
        contentType: "application/json",
        access: "public",
        allowOverwrite: true,
      });
      console.log(`[FILE-MANAGER] File uploaded successfully to ${url}`);

      return true;
    } catch (error) {
      console.error(`[FILE-MANAGER] Error uploading file to ${fileName}:`, error);
      return false;
    }
  }

  public async deleteFile(fileNameAndPath: string): Promise<boolean> {
    // remove leading slash(es) if present
    fileNameAndPath = fileNameAndPath.replace(/^\/+/, "");

    // TODO: Replace with FileManager.IS_DEV in the future 
    if (FileManager.ENVIRONMENT === "Develop" && !fileNameAndPath.startsWith(FileManager.DEVELOP_PATH))
      fileNameAndPath = `${FileManager.DEVELOP_PATH}${fileNameAndPath}`;
    
    await del(fileNameAndPath);

    return true;    
  }

  /**
   * Get mock data for a specific data type
   * This is only used in development environment
   * First checks if a file exists in blob storage, if not checks the folder structure
   * @param dataType The type of data to get mock for (e.g., 'schulungen')
   */
  public async getMockData(dataType: string): Promise<any> {
    try {
      // First, check if real data exists in blob storage
      const filePath = `${dataType.toLowerCase()}.json`;
      const fileData = await this.getFile(filePath);

      if (fileData) {
        console.info(`[FILE-MANAGER] Found real data for ${dataType}, using it instead of mock data`);
        return fileData;
      }

      // If no real data found, check if folder exists with data
      try {
        const { blobs } = await list({ prefix: dataType.toLowerCase() + '/' });
        if (blobs.length > 0) {
          console.info(`[FILE-MANAGER] Found folder data for ${dataType}, using latest file`);
          // Sort by uploadedAt desc and get the latest one
          const latestBlob = blobs
            .filter(blob => blob.pathname.toLowerCase().endsWith('.json'))
            .sort((a, b) =>
              new Date(b.uploadedAt || 0).getTime() -
              new Date(a.uploadedAt || 0).getTime()
            )[0];

          if (latestBlob) {
            const response = await fetch(latestBlob.url, { cache: "no-store" });
            if (response.ok) {
              return await response.json();
            }
          }
        }
      } catch (err) {
        console.warn(`[FILE-MANAGER] Error checking folder for ${dataType}:`, err);
        // Continue to use hardcoded mock data
      }

      // If still no data found, use hardcoded mock data
      switch (dataType.toLowerCase()) {
        case 'schulungen':
          const { mockSchulungen } = await import('./mock-data/schulungen');
          return mockSchulungen;
        case 'unit-cards':
          // Use existing pathfinder units as mock data for unit cards
          const { pathfinderUnits } = await import('../../pathfinder/pathfinder-units');
          // Convert pathfinder units to unit card format
          const convertedUnits = pathfinderUnits.map((unit: any, index: number) => ({
            id: unit.id === 'digital-core' ? 1 : 
                unit.id === 'platform-elevation' ? 2 :
                unit.id === 'adaptive-integration' ? 3 :
                unit.id === 'data-driven-decisions' ? 4 :
                unit.id === 'business-simplified' ? 5 :
                unit.id === 'xaas-transformation' ? 6 : index + 1,
            title: unit.title,
            subtitle: unit.shortDescription || unit.description.substring(0, 100) + '...',
            description: unit.description,
            tags: unit.technologies || [],
            category: unit.id.includes('core') ? 'core-systems' :
                     unit.id.includes('platform') || unit.id.includes('elevation') ? 'cloud-platform' :
                     unit.id.includes('integration') ? 'integration' :
                     unit.id.includes('data') ? 'data-analytics' : 'transformation',
            image: unit.image,
            introduction: unit.shortDescription || unit.description,
            slogan: unit.quote || unit.slogan || '',
            quote: unit.quote || '',
            heroImage: unit.image,
            backgroundPattern: unit.backgroundPattern || '/tech-pattern-blue.png',
            expertIds: [],
            active: true,
            advantages: unit.benefits ? unit.benefits.map((benefit: any) => ({
              title: benefit.title,
              description: benefit.description,
              catchPhrase: benefit.outcome || ''
            })) : [],
            challenges: unit.challenges || [],
            caseStudies: unit.caseStudies || [],
            approach: unit.steps || [],
            resources: unit.workshops ? unit.workshops.map((workshop: any) => ({
              title: workshop.title || 'Workshop',
              description: workshop.description || workshop.shortDescription || ''
            })) : []
          }));
          return convertedUnits;
        // Add more data types here as needed
        default:
          console.warn(`[FILE-MANAGER] No mock data available for type: ${dataType}`);
          return null;
      }
    } catch (error) {
      console.error(`[FILE-MANAGER] Error loading mock data for ${dataType}:`, error);
      return null;
    }
  }

  public async getFile(fileName: string): Promise<any> {
    // remove leading slash(es) if present
    fileName = fileName.replace(/^\/+/, "");
    // prefix the file name with the develop path if in development environment
    if (FileManager.ENVIRONMENT === "Develop" && !fileName.startsWith(FileManager.DEVELOP_PATH))
      fileName = `${FileManager.DEVELOP_PATH}${fileName}`;

    const exactMatch: any = await this.blobExists(fileName);

    // If file doesn't exist, return null instead of throwing an error
    if (!exactMatch) {
      console.warn(`[FILE-MANAGER] File not found: ${fileName}`);
      return null;
    }

    const response = await fetch(exactMatch.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    if (fileName.toLowerCase().endsWith('.pdf')) {
      return await response.arrayBuffer();
    } else {
      let file: any = await FileManager.JSONCache.getFile(fileName);
      if ( !file ) {
        file = await response.json()
      }
      return file;
    }
  }
}
