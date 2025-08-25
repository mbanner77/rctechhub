/**
 * Training (Schulung) type definition
 */
export interface Schulung {
  id: string;
  title: string;
  category: "Online-Kurs" | "Workshop" | "Webinar"; // Fixed categories
  duration: string; // e.g. "2 hours" or "1 day"
  price: number;
  image: string;
  hours?: number;
  days?: number;
  unitId?: string; // ID of the associated pathfinder unit
  pdfDocument?: {
    filename: string;
    deleted: boolean;
    fileUrl: string;
    uploadDate?: string;
  };
}

/**
 * @deprecated Please use the FileManager.getMockData('schulungen') method instead
 * for development environments, and proper data storage for production.
 * This will be removed in a future release.
 */
export const defaultSchulungen: Schulung[] = [];
