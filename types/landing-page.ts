export interface ILandingPageData {
  hero: {
    title: string
    subtitle: string
    primaryButtonText: string
    secondaryButtonText: string
    backgroundImage: string
    heroImage: string
  }
  featureCards: Array<{
    id: string
    icon: string
    title: string
    description: string
  }>
  technologySection: {
    title: string
    subtitle: string
    image: string
    features: Array<{
      title: string
      description: string
    }>
    buttonText: string
  }
  approachSection: {
    title: string
    subtitle: string
    image: string
    features: Array<{
      title: string
      description: string
    }>
    buttonText: string
  }
  successStories: Array<{
    id: string
    title: string
    industry: string
    backgroundImage: string
    tags: string[]
    description: string
    achievement: {
      icon: string
      text: string
    }
  }>
  statsSection: {
    title: string
    subtitle: string
    stats: Array<{
      value: number
      label: string
      suffix?: string
    }>
  }
  innovationSection: {
    title: string
    subtitle: string
    image: string
    features: Array<{
      title: string
      description: string
    }>
    buttonText: string
  }
  ctaSection: {
    title: string
    subtitle: string
    primaryButtonText: string
    secondaryButtonText: string
  }
}
