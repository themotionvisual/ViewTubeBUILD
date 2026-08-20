import { accountUrl, isUnifiedAccountServerEnabled } from "../account/accountCoordinator"

export type UploadMetadata = {
 title: string
 description: string
 categoryId?: string
 tags?: string[]
 privacyStatus?: "public" | "private" | "unlisted"
}

const request = async (path: string, init: RequestInit = {}): Promise<Response> => {
 const headers = new Headers(init.headers)
 if (!headers.has("Accept")) headers.set("Accept", "application/json")
 return fetch(accountUrl(path), { ...init, headers, credentials: "include" })
}

const parseError = async (response: Response, fallback: string): Promise<never> => {
 const payload = await response.json().catch(() => null) as { error?: { message?: string } | string } | null
 const error = payload?.error
 const message = typeof error === "string" ? error : error?.message
 throw new Error(message || fallback)
}

export const isUnifiedYouTubeWriteTransportEnabled = () => isUnifiedAccountServerEnabled()

export const postUnifiedCommentReply = async (parentId: string, text: string) => {
 const response = await request("/api/account/youtube/comment-replies", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parentId, text }),
 })
 if (!response.ok) return parseError(response, "Failed to post comment reply.")
 return response.json()
}

export const postUnifiedTopLevelComment = async (videoId: string, text: string) => {
 const response = await request("/api/account/youtube/comment-threads", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId, text }),
 })
 if (!response.ok) return parseError(response, "Failed to post comment.")
 return response.json()
}

export const updateUnifiedComment = async (commentId: string, text: string) => {
 const response = await request(`/api/account/youtube/comments/${encodeURIComponent(commentId)}`, {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
 })
 if (!response.ok) return parseError(response, "Failed to update comment.")
 return response.json()
}

export const updateUnifiedVideo = async (videoId: string, details: Record<string, unknown>) => {
 const response = await request(`/api/account/youtube/videos/${encodeURIComponent(videoId)}`, {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(details),
 })
 if (!response.ok) return parseError(response, "Failed to update video.")
 return response.json()
}

export const updateUnifiedThumbnail = async (videoId: string, file: File) => {
 const response = await request(`/api/account/youtube/thumbnails/${encodeURIComponent(videoId)}`, {
  method: "POST", headers: { "Content-Type": file.type }, body: file,
 })
 if (!response.ok) return parseError(response, "Failed to update thumbnail.")
 return response.json()
}

export const addUnifiedPlaylistItem = async (playlistId: string, videoId: string) => {
 const response = await request("/api/account/youtube/playlist-items", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playlistId, videoId }),
 })
 if (!response.ok) return parseError(response, "Failed to add video to playlist.")
 return response.json()
}

export const removeUnifiedPlaylistItem = async (playlistItemId: string) => {
 const response = await request(`/api/account/youtube/playlist-items/${encodeURIComponent(playlistItemId)}`, { method: "DELETE" })
 if (!response.ok) return parseError(response, "Failed to remove video from playlist.")
 return response.json()
}

export const uploadUnifiedVideo = async (
 file: Blob,
 metadata: UploadMetadata,
 onProgress?: (progress: number) => void,
) => {
 const start = await request("/api/account/youtube/uploads", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ contentLength: file.size, contentType: file.type || "video/*", metadata }),
 })
 if (!start.ok) return parseError(start, "Failed to create video upload session.")
 const session = await start.json() as { sessionId?: string; chunkSize?: number }
 if (!session.sessionId || !session.chunkSize) throw new Error("ViewTube did not create a valid upload session.")

 for (let offset = 0; offset < file.size; offset += session.chunkSize) {
  const chunk = file.slice(offset, Math.min(file.size, offset + session.chunkSize))
  const end = offset + chunk.size - 1
  const response = await request(`/api/account/youtube/uploads/${encodeURIComponent(session.sessionId)}`, {
   method: "PUT",
   headers: { "Content-Type": file.type || "video/*", "Content-Range": `bytes ${offset}-${end}/${file.size}` },
   body: chunk,
  })
  if (!response.ok) return parseError(response, "Video upload interrupted. Retry the upload.")
  const payload = await response.json() as { complete?: boolean; video?: unknown }
  onProgress?.(((end + 1) / file.size) * 100)
  if (payload.complete) return payload.video
 }
 throw new Error("YouTube did not complete the upload session.")
}
