export const computeVaultFileHash = async (file: File): Promise<string | null> => {
 if (typeof crypto === "undefined" || !crypto.subtle) return null
 const buffer = await file.arrayBuffer()
 const digest = await crypto.subtle.digest("SHA-256", buffer)
 const hex = Array.from(new Uint8Array(digest))
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("")
 return `sha256:${hex}`
}
