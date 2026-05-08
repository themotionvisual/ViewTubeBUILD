import { getAccessToken } from "../authSession"

export interface UploadMetadata {
 title: string
 description: string
 privacyStatus: "public" | "unlisted" | "private"
 tags?: string[]
 categoryId?: string
}

export class YouTubeUploadService {
 private static UPLOAD_URL =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"

 /**
  * Initiates a resumable upload and returns the upload URI.
  */
 public static async getUploadUri(
  metadata: UploadMetadata,
  fileSize: number,
  fileType: string,
 ): Promise<string> {
  const token = getAccessToken()
  if (!token) throw new Error("Not authenticated")

  const response = await fetch(this.UPLOAD_URL, {
   method: "POST",
   headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Upload-Content-Length": fileSize.toString(),
    "X-Upload-Content-Type": fileType,
   },
   body: JSON.stringify({
    snippet: {
     title: metadata.title,
     description: metadata.description,
     tags: metadata.tags,
     categoryId: metadata.categoryId || "22", // Default to People & Blogs
    },
    status: {
     privacyStatus: metadata.privacyStatus,
    },
   }),
  })

  if (!response.ok) {
   const error = await response.json()
   throw new Error(`Failed to initiate upload: ${error.error?.message || response.statusText}`)
  }

  const uploadUri = response.headers.get("Location")
  if (!uploadUri) throw new Error("No upload URI returned from YouTube")

  return uploadUri
 }

 /**
  * Uploads the actual video file to the resumable URI.
  */
 public static async uploadFile(
  uploadUri: string,
  file: Blob,
  onProgress?: (progress: number) => void,
 ): Promise<any> {
  return new Promise((resolve, reject) => {
   const xhr = new XMLHttpRequest()
   xhr.open("PUT", uploadUri, true)

   if (xhr.upload && onProgress) {
    xhr.upload.onprogress = (e) => {
     if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100
      onProgress(percentComplete)
     }
    }
   }

   xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
     resolve(JSON.parse(xhr.responseText))
    } else {
     reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`))
    }
   }

   xhr.onerror = () => reject(new Error("Network error during upload"))
   xhr.send(file)
  })
 }
}
