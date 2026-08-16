import { getAccessToken } from "../auth/authSession"
import { isUnifiedYouTubeWriteTransportEnabled, uploadUnifiedVideo, type UploadMetadata } from "./youtubeWriteTransport"

export class YouTubeUploadService {
 /**
  * Uploads a video blob to YouTube using the resumable upload protocol.
  */
 public static async uploadVideo(
  file: Blob,
 metadata: UploadMetadata,
  onProgress?: (progress: number) => void
 ): Promise<any> {
  if (isUnifiedYouTubeWriteTransportEnabled()) return uploadUnifiedVideo(file, metadata, onProgress)

  const token = await getAccessToken()
  if (!token) throw new Error("No access token available")
  const initialResponse = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
   method: "POST",
   headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Upload-Content-Length": String(file.size), "X-Upload-Content-Type": file.type || "video/*" },
   body: JSON.stringify({ snippet: { title: metadata.title, description: metadata.description, categoryId: metadata.categoryId || "22", tags: metadata.tags || [] }, status: { privacyStatus: metadata.privacyStatus || "private" } }),
  })
  if (!initialResponse.ok) throw new Error("Failed to initiate legacy YouTube upload.")
  const uploadUrl = initialResponse.headers.get("Location")
  if (!uploadUrl) throw new Error("No upload URL returned from YouTube")
  return new Promise((resolve, reject) => {
   const xhr = new XMLHttpRequest()
   xhr.open("PUT", uploadUrl, true)
   xhr.setRequestHeader("Content-Type", file.type || "video/*")
   if (xhr.upload && onProgress) xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) onProgress((event.loaded / event.total) * 100)
   }
   xhr.onload = () => xhr.status === 200 || xhr.status === 201
    ? resolve(JSON.parse(xhr.responseText || "{}"))
    : reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`))
   xhr.onerror = () => reject(new Error("Network error during upload"))
   xhr.send(file)
  })
 }
}
