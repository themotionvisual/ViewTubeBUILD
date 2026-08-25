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
const shouldFallbackFromAccountProxy = async (response: Response): Promise<boolean> => {
 // 404 means the /api/account/google-proxy route does not exist on this
 // deployment (static-only, or handler unregistered). Definite fallback.
 if (response.status === 404) return true
 return false
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
