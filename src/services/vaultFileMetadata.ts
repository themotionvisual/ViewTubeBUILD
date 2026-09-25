export type VaultMediaProbeResult = {
 width?: number
 height?: number
 duration?: number
}

export type VaultMediaProbe = (file: File) => Promise<VaultMediaProbeResult>

const browserMediaProbe: VaultMediaProbe = async (file) => {
 if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return {}
 const objectUrl = URL.createObjectURL(file)
 try {
  if (file.type.startsWith("image/") && typeof Image !== "undefined") {
   return await new Promise<VaultMediaProbeResult>((resolve) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => resolve({})
    image.src = objectUrl
   })
  }

  if ((file.type.startsWith("video/") || file.type.startsWith("audio/")) && typeof document !== "undefined") {
   return await new Promise<VaultMediaProbeResult>((resolve) => {
    const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio")
    media.preload = "metadata"
    media.onloadedmetadata = () => {
     const video = media instanceof HTMLVideoElement ? media : null
     resolve({
      width: video?.videoWidth || undefined,
      height: video?.videoHeight || undefined,
      duration: Number.isFinite(media.duration) ? media.duration : undefined,
     })
    }
    media.onerror = () => resolve({})
    media.src = objectUrl
   })
  }

  return {}
 } finally {
  URL.revokeObjectURL(objectUrl)
 }
}

export const extractVaultFileMetadata = async (
 file: File,
 probe: VaultMediaProbe = browserMediaProbe,
): Promise<Record<string, unknown>> => {
 const dotIndex = file.name.lastIndexOf(".")
 const extension = dotIndex >= 0 ? file.name.slice(dotIndex + 1).toLowerCase() : ""
 const base: Record<string, unknown> = {
  byteSize: file.size,
  mimeType: file.type || null,
  extension: extension || null,
  lastModified: file.lastModified,
 }

 if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
  return base
 }

 const result = await probe(file)
 const metadata: Record<string, unknown> = { ...base }

 if (result.width && result.height) {
  metadata.width = result.width
  metadata.height = result.height
  metadata.aspectRatio = result.width / result.height
 }
 if (typeof result.duration === "number" && Number.isFinite(result.duration)) {
  metadata.durationSeconds = result.duration
 }

 return metadata
}
