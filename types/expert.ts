export interface Expert {
  id: string
  name: string
  firstName: string
  role: string
  technologies: string[]
  email?: string
  expertise?: string[]
  image?: string
  bio?: string
  experience?: string
  certifications?: string
  phone?: string
  location?: string
  linkedin?: string
  languages?: string[]
  education?: {
    degree: string
    institution: string
    year: string
  }[]
  projects?: string[]
  publications?: string[]
  awards?: {
    title: string
    organization: string
    year: string
  }[]
  speakingEngagements?: {
    title: string
    event: string
    location: string
    date: string
  }[]
  showContactDialog: boolean
  isContactPerson?: boolean
}
