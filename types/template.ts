export interface Template {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  imageUrl: string
  downloadUrl: string
  lastUpdated: string
  version: string
  author: string
  rating: number
  downloads: number
  longDescription?: string
  features?: string[]
  requirements?: string[]
  setupInstructions?: string[]
  useCases?: string[]
  relatedTemplates?: string[]
  previewImages?: string[]
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  count: number
}
