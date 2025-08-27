export interface BTPService {
  id: string
  name: string
  description: string
  category: string
  icon: string
  tags: string[]
  features: string[]
  benefits: string[]
  useCases: string[]
  documentation: string
  pricing: string
  freeTier?: boolean
  trialAvailable: boolean
  technicalDetails: {
    [key: string]: string
  }
  trial?: boolean
  environments?: ("Cloud Foundry" | "Kyma" | "ABAP" | "Neo")[]
  implementationTime?: "Schnell" | "Mittel" | "Komplex"
  costLevel?: "Niedrig" | "Mittel" | "Hoch"
  skillLevel?: "Anfänger" | "Fortgeschritten" | "Experte"
  rating?: number
  relatedServices?: string[]
  regions?: string[]
  certifications?: string[]
  ratingCount?: number
  lastUpdated?: string
  successMetrics?: { name: string; value: string }[]
  customerReferences?: { name: string; industry: string; quote: string }[]
  architecturePatterns?: string[]
}

export interface ArchitectureTemplate {
  id: string
  name: string
  description: string
  category: string
  services: string[]
  useCases: string[]
  benefits: string[]
  diagram?: string
  implementationSteps?: {
    phase: string
    tasks: string[]
  }[]
  resources?: {
    type: string
    items: {
      name: string
      url: string
    }[]
  }[]
  technicalDetails?: {
    complexity: string
    implementationTime: string
    requiredSkills: string[]
  }
}

export type BTPServiceCategory =
  | "Integration"
  | "Extension"
  | "Data & Analytics"
  | "Database"
  | "Application Development"
  | "Intelligent Technologies"
  | "Mobile"
  | "Security"
  | "DevOps"
  | "Governance"
  | "Industry Cloud"
  | "User Experience"
  | "Content Management"

export interface ServiceComparisonItem {
  serviceId: string
  selected: boolean
}

export interface UserServicePreferences {
  favorites: string[]
  recentlyViewed: string[]
  comparisons: ServiceComparisonItem[]
  ratings?: Record<string, number>
  notes?: Record<string, string>
}

export interface ServiceRating {
  serviceId: string
  rating: number
  comment?: string
  date: string
}

export interface IntegrationScenario {
  id: string
  name: string
  description: string
  primaryService: string
  connectedServices: string[]
  diagram: string
  benefits: string[]
  implementationSteps: string[]
  useCases?: string[]
  challenges?: string[]
  bestPractices?: string[]
}
