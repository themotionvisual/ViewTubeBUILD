import {
 accountUrl,
 isAccountServerUnavailableError,
 isUnifiedAccountServerEnabled,
 markUnifiedAccountServerUnavailable,
} from "../account/accountCoordinator"
import { getValidAccessToken } from "../auth/authSession"
import { requestGoogleWithRetry } from "./googleProxyErrors"

const MAX_ATTEMPTS = 3
export const SERVER_ACCOUNT_SESSION_TOKEN = "__viewtube_server_account_session__"
// Patterns that indicate the server host is present but its account surface
// is not usable at all (misconfigured origin allowlist, dead proxy handler).
// Anonymous-user 401s are handled separately below — "Authentication required"
// means "sign in via the server flow", not "server broken".
const ACCOUNT_PROXY_FALLBACK_PATTERNS = [
 "Request origin is not allowed",
 "Account request failed",
]

const shouldFallbackFromAccountProxy = async (response: Response): Promise<boolean> => {
 // 404 means the /api/account/google-proxy route does not exist on this
 // deployment (static-only, or handler unregistered). Definite fallback.
 if (response.status === 404) return true
 if (response.status !== 401 && response.status !== 403) return false

 const bodyText = await response.clone().text().catch(() => "")
 return ACCOUNT_PROXY_FALLBACK_PATTERNS.some((pattern) => bodyText.includes(pattern))
}

const runRequest = async (url: string, signal?: AbortSignal): Promise<Response> => {
 if (isUnifiedAccountServerEnabled()) {
  try {
   const response = await fetch(accountUrl("/api/account/google-proxy"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ url }),
    signal,
   })
   if (await shouldFallbackFromAccountProxy(response)) {
    markUnifiedAccountServerUnavailable()
    throw new Error("ACCOUNT_SERVER_UNAVAILABLE")
   }
   return response
  } catch (error) {
   if (isAccountServerUnavailableError(error) || error instanceof Error && error.message === "ACCOUNT_SERVER_UNAVAILABLE") {
    markUnifiedAccountServerUnavailable()
   } else {
    throw error
   }
  }
 }

 const token = await getValidAccessToken()
 if (!token) {
  return new Response(JSON.stringify({ error: { message: "YouTube authorization is required." } }), {
   status: 401,
   headers: { "Content-Type": "application/json" },
  })
 }

 return fetch(url, {
  method: "GET",
  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  signal,
 })
}

export const authorizedGoogleRead = async (
 url: string,
 options: { signal?: AbortSignal; maxAttempts?: number } = {},
): Promise<Response> => {
 const maxAttempts = Math.max(1, options.maxAttempts || MAX_ATTEMPTS)
 return requestGoogleWithRetry(
  () => runRequest(url, options.signal),
  { maxAttempts, signal: options.signal, operation: new URL(url).pathname },
 )
}
