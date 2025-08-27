export type ConsultingPhaseOffer = {
  id: string
  title: string
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
