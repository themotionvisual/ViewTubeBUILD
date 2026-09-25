export type VaultVideoThumbnailCapture = (file: File) => Promise<string | null>

const browserCapture: VaultVideoThumbnailCapture = async (file) => {
 if (typeof document === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return null
 const objectUrl = URL.createObjectURL(file)
 try {
  return await new Promise<string | null>((resolve) => {
   const video = document.createElement("video")
   const canvas = document.createElement("canvas")
   video.preload = "metadata"
   video.muted = true
   video.playsInline = true

   const cleanup = () => {
    video.removeAttribute("src")
    video.load()
   }

   video.onerror = () => {
    cleanup()
    resolve(null)
   }

   video.onloadedmetadata = () => {
    const width = video.videoWidth || 320
    const height = video.videoHeight || 180
    const maxWidth = 480
    const scale = Math.min(1, maxWidth / width)
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const target = Number.isFinite(video.duration) && video.duration > 0
     ? Math.min(video.duration * 0.15, 2)
     : 0
    video.currentTime = target
   }

   video.onseeked = () => {
    const context = canvas.getContext("2d")
    if (!context) {
     cleanup()
     resolve(null)
     return
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.72)
    cleanup()
    resolve(dataUrl)
   }

   video.src = objectUrl
  })
 } finally {
  URL.revokeObjectURL(objectUrl)
 }
}

export const extractVaultVideoThumbnail = async (
 file: File,
 capture: VaultVideoThumbnailCapture = browserCapture,
): Promise<string | null> => {
 if (!file.type.startsWith("video/")) return null
 return capture(file)
}
