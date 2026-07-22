import { accountUrl, isUnifiedAccountServerEnabled } from "../account/accountCoordinator"
import { getValidAccessToken } from "../auth/authSession"

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504])
const MAX_ATTEMPTS = 3
export const SERVER_ACCOUNT_SESSION_TOKEN = "__viewtube_server_account_session__"

const delay = (milliseconds: number) =>
 new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

const runRequest = async (url: string, signal?: AbortSignal): Promise<Response> => {
 if (isUnifiedAccountServerEnabled()) {
  return fetch(accountUrl("/api/account/google-proxy"), {
   method: "POST",
   credentials: "include",
   headers: { "Content-Type": "application/json", Accept: "application/json" },
   body: JSON.stringify({ url }),
   signal,
  })
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
 let response = await runRequest(url, options.signal)
 for (let attempt = 1; attempt < maxAttempts && TRANSIENT_STATUSES.has(response.status); attempt += 1) {
  await delay(400 * 2 ** (attempt - 1))
  response = await runRequest(url, options.signal)
 }
 return response
}
