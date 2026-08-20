export const GOOGLE_OAUTH_TERMS_ACK_KEY = "vt_google_oauth_terms_ack_v1"
export const GOOGLE_OAUTH_CONSENT_REQUEST_EVENT = "vt_google_oauth_consent_request"

type ConsentResolver = (accepted: boolean) => void

let pendingConsentResolver: ConsentResolver | null = null

export const hasAcceptedGoogleOAuthTerms = (): boolean => {
 if (typeof window === "undefined") return false
 return localStorage.getItem(GOOGLE_OAUTH_TERMS_ACK_KEY) === "1"
}

export const acceptGoogleOAuthTerms = (): void => {
 if (typeof window === "undefined") return
 localStorage.setItem(GOOGLE_OAUTH_TERMS_ACK_KEY, "1")
}

export const resolveGoogleOAuthTermsConsent = (accepted: boolean): void => {
 const resolver = pendingConsentResolver
 pendingConsentResolver = null
 resolver?.(accepted)
}

export const requestGoogleOAuthTermsConsent = async (): Promise<boolean> => {
 if (hasAcceptedGoogleOAuthTerms()) return true

 if (typeof window === "undefined") return false

 return new Promise((resolve) => {
  pendingConsentResolver = resolve
  window.dispatchEvent(new Event(GOOGLE_OAUTH_CONSENT_REQUEST_EVENT))
 })
}
