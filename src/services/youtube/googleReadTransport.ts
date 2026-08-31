import {
 accountUrl,
 isAccountServerUnavailableError,
 isUnifiedAccountServerEnabled,
 markUnifiedAccountServerUnavailable,
} from "../account/accountCoordinator"
import { getValidAccessToken } from "../auth/authSession"
import { readGoogleProxyError, requestGoogleWithRetry } from "./googleProxyErrors"

const MAX_ATTEMPTS = 3
export const SERVER_ACCOUNT_SESSION_TOKEN = "__viewtube_server_account_session__"

// Keep the Google-read proxy circuit breaker local to this transport. Do not
// mark the entire unified account server unavailable just because one proxy
// route rejected the request; doing that flips auth mode globally and can turn
// a fallback Google 401 into a full ViewTube logout.
let accountProxyDisabledForSession = false

export const _resetAccountProxyDisabledForTest = (): void => {
 accountProxyDisabledForSession = false
}

const shouldFallbackFromAccountProxy = async (response: Response): Promise<boolean> => {
 if (response.status === 404) return true
 const details = await readGoogleProxyError(response)
 return details?.code === "PROXY_ORIGIN_REJECTED"
}

const runDirectRequest = async (url: string, signal?: AbortSignal): Promise<Response> => {
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

const runRequest = async (url: string, signal?: AbortSignal): Promise<Response> => {
 if (isUnifiedAccountServerEnabled() && !accountProxyDisabledForSession) {
  try {
   const response = await fetch(accountUrl("/api/account/google-proxy"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ url }),
    signal,
   })

   if (await shouldFallbackFromAccountProxy(response)) {
    accountProxyDisabledForSession = true
    markUnifiedAccountServerUnavailable()
    return runDirectRequest(url, signal)
   }

   return response
  } catch (error) {
   if (isAccountServerUnavailableError(error) || error instanceof Error && error.message === "ACCOUNT_SERVER_UNAVAILABLE") {
    // A true account-server outage may still disable the unified server mode,
    // preserving the existing legacy fallback behavior.
    markUnifiedAccountServerUnavailable()
   } else {
    throw error
   }
  }
 }

 return runDirectRequest(url, signal)
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
