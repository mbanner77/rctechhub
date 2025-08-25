export interface UnitCard {
    id?: number,
    title: string,
    subtitle: string,
    description: string,
    tags: string[],
    category: string,
    image?: string,
    introduction: string,
    slogan: string,
    quote?: string,
    advantages: (string | Advantage)[],
    challenges: (string | Challenge)[],
    caseStudies: CaseStudy[],
    approach: Approach[],
    resources: Resource[],
    heroImage?: string,
    backgroundPattern?: string,
    expertIds?: string[],
    active?: boolean,
}

export interface Advantage {
    title: string,
    description: string,
    catchPhrase?: string,
    outcome?: string,
    colorClass?: string,
}

export interface Challenge {
    title: string,
    description: string,
}

export interface CaseStudy {
    id?: string,
    title: string,
    description: string,
    summary?: string,
    challenge?: string,
    solution?: string,
    results?: string,
    tags: string[],
    industry?: string,
    category: string,
    client_name: string,
    client?: string,
    clientLogo?: string,
    location?: string,
    image?: string,
    pdf?: string,
}

export interface Approach {
    title: string,
    description: string,
    steps: Step[]
}

export interface Step {
    title: string,
    description: string,
    activities: string[],
    results: string[]
}

export interface Resource {
    title: string,
    description: string,
    duration?: string,
    format?: string,
    price?: string,
    icon?: string,
    pdf?: string
}