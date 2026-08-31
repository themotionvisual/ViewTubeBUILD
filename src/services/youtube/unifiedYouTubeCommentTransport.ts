import { accountUrl } from "../account/accountCoordinator"

export type UnifiedCommentThreadPage = {
 items?: unknown[]
 nextPageToken?: string
}

export class UnifiedYouTubeCommentError extends Error {
 readonly code?: string
 readonly status: number
 readonly reconnectRequired: boolean

 constructor(message: string, options: { code?: string; status: number; reconnectRequired?: boolean }) {
  super(message)
  this.name = "UnifiedYouTubeCommentError"
  this.code = options.code
  this.status = options.status
  this.reconnectRequired = options.reconnectRequired === true || options.status === 401 || options.status === 409
 }
}

const readJson = async <T,>(response: Response, fallback: string): Promise<T> => {
 const payload = await response.json().catch(() => null) as {
  error?: { code?: string; message?: string; reconnectRequired?: boolean } | string
 } | null
 if (!response.ok) {
  const error = payload?.error
  const message = typeof error === "string" ? error : error?.message
  throw new UnifiedYouTubeCommentError(message || fallback, {
   code: typeof error === "object" ? error?.code : undefined,
   status: response.status,
   reconnectRequired: typeof error === "object" && error?.reconnectRequired,
  })
 }
 return payload as T
}

export const fetchUnifiedCommentThreads = async (
 maxResults = 100,
 pageToken?: string,
 signal?: AbortSignal,
): Promise<UnifiedCommentThreadPage> => {
 const params = new URLSearchParams({ maxResults: String(maxResults) })
 if (pageToken) params.set("pageToken", pageToken)
 const response = await fetch(accountUrl(`/api/account/youtube/comment-threads?${params.toString()}`), {
  credentials: "include",
  headers: { Accept: "application/json" },
  signal,
 })
 return readJson<UnifiedCommentThreadPage>(response, "ViewTube could not load comments.")
}

export const fetchAllUnifiedCommentThreads = async (maxResults = 100, signal?: AbortSignal): Promise<any[]> => {
 const items: any[] = []
 let pageToken = ""
 do {
  const page = await fetchUnifiedCommentThreads(maxResults, pageToken || undefined, signal)
  items.push(...(Array.isArray(page.items) ? page.items : []))
  pageToken = String(page.nextPageToken || "")
 } while (pageToken)
 return items
}
