import { reportDiagnostic } from "../diagnostics"

export type GoogleProxyErrorCode =
 | "AUTH_REQUIRED"
 | "INVALID_DESTINATION"
 | "GOOGLE_RECONNECT_REQUIRED"
 | "GOOGLE_SCOPE_REQUIRED"
 | "GOOGLE_QUOTA_EXHAUSTED"
 | "GOOGLE_RATE_LIMITED"
 | "GOOGLE_UPSTREAM_UNAVAILABLE"
 | "GOOGLE_PROXY_TIMEOUT"

export interface GoogleProxyErrorDetails {
 code: GoogleProxyErrorCode
 message: string
 retryable: boolean
 reconnectRequired: boolean
 upstreamStatus?: number
 requestId?: string
}

const KNOWN_CODES = new Set<GoogleProxyErrorCode>([
 "AUTH_REQUIRED",
 "INVALID_DESTINATION",
 "GOOGLE_RECONNECT_REQUIRED",
 "GOOGLE_SCOPE_REQUIRED",
 "GOOGLE_QUOTA_EXHAUSTED",
 "GOOGLE_RATE_LIMITED",
 "GOOGLE_UPSTREAM_UNAVAILABLE",
 "GOOGLE_PROXY_TIMEOUT",
])

const fallbackDetails = (response: Response): GoogleProxyErrorDetails => {
 if (response.status === 401) {
  return { code: "AUTH_REQUIRED", message: "Sign in to ViewTube and reconnect Google.", retryable: false, reconnectRequired: true }
 }
 if (response.status === 403) {
  return { code: "GOOGLE_SCOPE_REQUIRED", message: "Reconnect Google to grant the required capability.", retryable: false, reconnectRequired: false }
 }
 if (response.status === 429) {
  return { code: "GOOGLE_RATE_LIMITED", message: "Google is rate limiting requests. Try again shortly.", retryable: true, reconnectRequired: false }
 }
 if (response.status === 502 || response.status === 503) {
  return { code: "GOOGLE_UPSTREAM_UNAVAILABLE", message: "Google is temporarily unavailable.", retryable: true, reconnectRequired: false }
 }
 if (response.status === 504) {
  return { code: "GOOGLE_PROXY_TIMEOUT", message: "The Google request timed out.", retryable: true, reconnectRequired: false }
 }
 return { code: "GOOGLE_UPSTREAM_UNAVAILABLE", message: `Google request failed (${response.status}).`, retryable: false, reconnectRequired: false }
}

export const readGoogleProxyError = async (response: Response): Promise<GoogleProxyErrorDetails | null> => {
 if (response.ok) return null
 const fallback = fallbackDetails(response)
 const payload = await response.clone().json().catch(() => null) as {
  error?: string | Partial<GoogleProxyErrorDetails> & { message?: string }
 } | null
 const error = payload?.error
 if (!error || typeof error === "string") {
  return { ...fallback, message: typeof error === "string" && error ? error : fallback.message }
 }
 const code = String(error.code || "") as GoogleProxyErrorCode
 if (!KNOWN_CODES.has(code)) {
  return { ...fallback, message: String(error.message || fallback.message) }
 }
 return {
  code,
  message: String(error.message || fallback.message),
  retryable: error.retryable === true,
  reconnectRequired: error.reconnectRequired === true,
  upstreamStatus: Number.isFinite(Number(error.upstreamStatus)) ? Number(error.upstreamStatus) : undefined,
  requestId: error.requestId ? String(error.requestId) : undefined,
 }
}

export class GoogleRequestError extends Error {
 readonly details: GoogleProxyErrorDetails

 constructor(details: GoogleProxyErrorDetails) {
  super(details.message)
  this.name = "GoogleRequestError"
  this.details = details
 }
}

export const isGoogleReconnectRequiredError = (error: unknown): error is GoogleRequestError =>
 error instanceof GoogleRequestError && error.details.reconnectRequired

const retryDelayMs = (response: Response, attempt: number): number => {
 const retryAfter = Number(response.headers.get("retry-after"))
 if (Number.isFinite(retryAfter) && retryAfter >= 0) return Math.min(30_000, retryAfter * 1000)
 const ceiling = Math.min(8_000, 400 * 2 ** Math.max(0, attempt - 1))
 return Math.round(Math.random() * ceiling)
}

const delay = (milliseconds: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
 if (signal?.aborted) {
  reject(signal.reason || new DOMException("Aborted", "AbortError"))
  return
 }
 const timer = globalThis.setTimeout(resolve, milliseconds)
 signal?.addEventListener("abort", () => {
  globalThis.clearTimeout(timer)
  reject(signal.reason || new DOMException("Aborted", "AbortError"))
 }, { once: true })
})

export const requestGoogleWithRetry = async (
 request: () => Promise<Response>,
 options: { maxAttempts?: number; signal?: AbortSignal; operation?: string } = {},
): Promise<Response> => {
 const maxAttempts = Math.max(1, Math.min(3, options.maxAttempts || 3))
 let attempts = 1
 let response = await request()
 for (let attempt = 1; attempt < maxAttempts; attempt += 1) {
  const details = await readGoogleProxyError(response)
  if (!details?.retryable) break
  await delay(retryDelayMs(response, attempt), options.signal)
  response = await request()
  attempts += 1
 }
 const details = await readGoogleProxyError(response)
 if (details) {
  reportDiagnostic({
   area: "google-read",
   event: details.code,
   level: details.retryable ? "warn" : "error",
   whatHappened: details.message,
   whatItMeans: details.reconnectRequired ? "Google must be reconnected before more requests run." : "The Google request did not complete.",
   debugData: {
    operation: options.operation || "google-read",
    requestId: details.requestId,
    failureCode: details.code,
    attempts,
    retryable: details.retryable,
    reconnectRequired: details.reconnectRequired,
    upstreamStatus: details.upstreamStatus,
   },
  })
 }
 if (details?.reconnectRequired) throw new GoogleRequestError(details)
 return response
}
