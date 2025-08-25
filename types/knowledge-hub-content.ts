export interface IKnowledgeHubContent {
  id: string;
  type: "template" | "best-practice" | "unknown";
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  category: string;
  downloads: number;
  featured?: boolean;
  tags?: string[];
  downloadUrl?: string;
  externalUrl?: string;
}
