import type { VaultAsset } from "../types"
import { listVaultAssets } from "./vaultAdapter"

const bitsToHex = (bits: number[]): string => {
 let out = ""
 for (let index = 0; index < bits.length; index += 4) {
  const nibble =
   ((bits[index] || 0) << 3)
   | ((bits[index + 1] || 0) << 2)
   | ((bits[index + 2] || 0) << 1)
   | (bits[index + 3] || 0)
  out += nibble.toString(16)
 }
 return out
}

export const hammingDistanceHex = (left: string, right: string): number => {
 const a = left.trim().toLowerCase()
 const b = right.trim().toLowerCase()
 if (!a || !b || a.length !== b.length) return Number.POSITIVE_INFINITY
 let distance = 0
 for (let index = 0; index < a.length; index += 1) {
  const av = Number.parseInt(a[index], 16)
  const bv = Number.parseInt(b[index], 16)
  if (Number.isNaN(av) || Number.isNaN(bv)) return Number.POSITIVE_INFINITY
  let xor = av ^ bv
  while (xor) {
   distance += xor & 1
   xor >>= 1
  }
 }
 return distance
}

const hashRgba = (data: Uint8ClampedArray): string => {
 const luminance: number[] = []
 for (let index = 0; index < data.length; index += 4) {
  const r = data[index] || 0
  const g = data[index + 1] || 0
  const b = data[index + 2] || 0
  luminance.push((r * 299 + g * 587 + b * 114) / 1000)
 }
 const average = luminance.reduce((sum, value) => sum + value, 0) / Math.max(1, luminance.length)
 return bitsToHex(luminance.map((value) => value >= average ? 1 : 0))
}

const imageElementFromFile = async (file: File): Promise<HTMLImageElement> => {
 const url = URL.createObjectURL(file)
 try {
  const image = new Image()
  image.decoding = "async"
  image.src = url
  await image.decode()
  return image
 } finally {
  // revoke after decode; decoded pixels remain available to canvas
  URL.revokeObjectURL(url)
 }
}

export const computeVaultImagePerceptualHash = async (file: File): Promise<string | null> => {
 if (!file.type.startsWith("image/")) return null
 if (typeof document === "undefined") return null

 try {
  const canvas = document.createElement("canvas")
  canvas.width = 8
  canvas.height = 8
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return null

  if (typeof createImageBitmap === "function") {
   const bitmap = await createImageBitmap(file)
   try {
    context.drawImage(bitmap, 0, 0, 8, 8)
   } finally {
    bitmap.close()
   }
  } else {
   const image = await imageElementFromFile(file)
   context.drawImage(image, 0, 0, 8, 8)
  }

  return hashRgba(context.getImageData(0, 0, 8, 8).data)
 } catch {
  return null
 }
}

export const findVaultSimilarAssets = (
 source: Pick<VaultAsset, "id" | "kind" | "metadata">,
 maxDistance = 8,
): VaultAsset[] => {
 if (source.kind !== "image") return []
 const sourceHash = String(source.metadata?.perceptualHash || "").trim().toLowerCase()
 if (!sourceHash) return []

 return listVaultAssets()
  .filter((asset) => asset.id !== source.id && asset.kind === "image")
  .map((asset) => ({
   asset,
   distance: hammingDistanceHex(
    sourceHash,
    String(asset.metadata?.perceptualHash || "").trim().toLowerCase(),
   ),
  }))
  .filter((entry) => Number.isFinite(entry.distance) && entry.distance <= maxDistance)
  .sort((a, b) => a.distance - b.distance || b.asset.updatedAt - a.asset.updatedAt)
  .map((entry) => entry.asset)
}
