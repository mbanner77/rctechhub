export interface IService {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  technologies: string[];
  duration: string;
  phase: number;
  rating?: number;
  dependencies?: string[];
  included: string[];
  notIncluded?: string[];
  process: {
    title: string;
    description: string;
  }[];
  // Neue Felder für zusätzliche Kategorisierung
  technologyCategory?: "SAP" | "Microsoft" | "Open Source" | string;
  processCategory?: "Operate" | "Innovate" | "Ideate" | string;
  isStarterPackage?: boolean;
}
