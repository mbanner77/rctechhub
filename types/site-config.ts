export type CurrencyCode = "EUR" | "CHF"

export interface ContactInfo {
  company?: string
  addressLine1?: string
  addressLine2?: string
  phone?: string
  email?: string
}

export interface ISiteConfig {
  currency: CurrencyCode
  contactEUR?: ContactInfo
  contactCHF?: ContactInfo
}
