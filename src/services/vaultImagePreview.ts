export type VaultImagePreviewCapture = (file: File) => Promise<string | null>

const browserCapture: VaultImagePreviewCapture = async (file) => {
 if (typeof document === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function" || typeof Image === "undefined") return null
 const objectUrl = URL.createObjectURL(file)
 try {
  return await new Promise<string | null>((resolve) => {
   const image = new Image()
   image.onload = () => {
    const canvas = document.createElement("canvas")
    const width = image.naturalWidth || 1
    const height = image.naturalHeight || 1
    const maxWidth = 640
    const scale = Math.min(1, maxWidth / width)
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const context = canvas.getContext("2d")
    if (!context) {
     resolve(null)
     return
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    resolve(canvas.toDataURL("image/jpeg", 0.76))
   }
   image.onerror = () => resolve(null)
   image.src = objectUrl
  })
 } finally {
  URL.revokeObjectURL(objectUrl)
 }
}

export const extractVaultImagePreview = async (
 file: File,
 capture: VaultImagePreviewCapture = browserCapture,
): Promise<string | null> => {
 if (!file.type.startsWith("image/")) return null
 return capture(file)
}
