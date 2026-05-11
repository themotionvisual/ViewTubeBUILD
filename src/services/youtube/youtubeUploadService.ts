import { getAccessToken } from "../authSession"

interface UploadMetadata {
 title: string
 description: string
 categoryId?: string
 tags?: string[]
 privacyStatus?: "public" | "private" | "unlisted"
}

export class YouTubeUploadService {
 private static UPLOAD_BASE_URL = "https://www.googleapis.com/upload/youtube/v3/videos"

 /**
  * Uploads a video blob to YouTube using the resumable upload protocol.
  */
 public static async uploadVideo(
  file: Blob,
  metadata: UploadMetadata,
  onProgress?: (progress: number) => void
 ): Promise<any> {
  const token = await getAccessToken()
  if (!token) throw new Error("No access token available")

  // 1. Initial request to get resumable session URL
  const initialResponse = await fetch(`${this.UPLOAD_BASE_URL}?uploadType=resumable&part=snippet,status`, {
   method: "POST",
   headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Upload-Content-Length": file.size.toString(),
    "X-Upload-Content-Type": file.type || "video/*",
   },
   body: JSON.stringify({
    snippet: {
     title: metadata.title,
     description: metadata.description,
     categoryId: metadata.categoryId || "22", // Default to People & Blogs
     tags: metadata.tags || [],
    },
    status: {
     privacyStatus: metadata.privacyStatus || "private",
    },
   }),
  })

  if (!initialResponse.ok) {
   const error = await initialResponse.json()
   throw new Error(`Failed to initiate upload: ${JSON.stringify(error)}`)
  }

  const uploadUrl = initialResponse.headers.get("Location")
  if (!uploadUrl) throw new Error("No upload URL returned from YouTube")

  // 2. Perform the actual upload
  // Note: For simplicity in this first version, we'll upload in one chunk.
  // Resumable uploads allow splitting, but browser blobs are easy to send whole.
  return new Promise((resolve, reject) => {
   const xhr = new XMLHttpRequest()
   xhr.open("PUT", uploadUrl, true)
   xhr.setRequestHeader("Content-Type", file.type || "video/*")

   if (xhr.upload && onProgress) {
    xhr.upload.onprogress = (e) => {
     if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100
      onProgress(percentComplete)
     }
    }
   }

   xhr.onload = () => {
    if (xhr.status === 200 || xhr.status === 201) {
     try {
      resolve(JSON.parse(xhr.responseText))
     } catch (e) {
      resolve(xhr.responseText)
     }
    } else {
     reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`))
    }
   }

   xhr.onerror = () => reject(new Error("Network error during upload"))
   xhr.send(file)
  })
 }
}
