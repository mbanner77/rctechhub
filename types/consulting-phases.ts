export type ConsultingPhaseOffer = {
  id: string
  title: string
  price?: number
  shortDescription?: string
  defaultSelected?: boolean
}

export type ConsultingPhase = {
  id: string
  title: string
  description?: string
  offers: ConsultingPhaseOffer[]
}

export type ConsultingPhasesData = {
  introTitle: string
  introText: string
  ctaText?: string
  phases: ConsultingPhase[]
}
