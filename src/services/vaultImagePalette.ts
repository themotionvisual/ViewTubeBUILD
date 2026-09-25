const toHex = (value: number) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")

const quantize = (value: number) => Math.min(255, Math.round(value / 32) * 32)

export const extractDominantPaletteFromRgba = (
 data: Uint8ClampedArray,
 count = 5,
): string[] => {
 const bins = new Map<string, { count: number; r: number; g: number; b: number }>()
 for (let index = 0; index < data.length; index += 4) {
  const alpha = data[index + 3] || 0
  if (alpha === 0) continue
  const r = data[index] || 0
  const g = data[index + 1] || 0
  const b = data[index + 2] || 0
  const key = `${quantize(r)}:${quantize(g)}:${quantize(b)}`
  const current = bins.get(key) || { count: 0, r: 0, g: 0, b: 0 }
  current.count += 1
  current.r += r
  current.g += g
  current.b += b
  bins.set(key, current)
 }

 return [...bins.values()]
  .sort((a, b) => b.count - a.count)
  .slice(0, Math.max(1, count))
  .map((entry) => {
   const divisor = Math.max(1, entry.count)
   const r = Math.round(entry.r / divisor)
   const g = Math.round(entry.g / divisor)
   const b = Math.round(entry.b / divisor)
   return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  })
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
  URL.revokeObjectURL(url)
 }
}

export const computeVaultImagePalette = async (
 file: File,
 count = 5,
): Promise<string[]> => {
 if (!file.type.startsWith("image/")) return []
 if (typeof document === "undefined") return []

 try {
  const canvas = document.createElement("canvas")
  canvas.width = 24
  canvas.height = 24
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return []

  if (typeof createImageBitmap === "function") {
   const bitmap = await createImageBitmap(file)
   try {
    context.drawImage(bitmap, 0, 0, 24, 24)
   } finally {
    bitmap.close()
   }
  } else {
   const image = await imageElementFromFile(file)
   context.drawImage(image, 0, 0, 24, 24)
  }

  return extractDominantPaletteFromRgba(
   context.getImageData(0, 0, 24, 24).data,
   count,
  )
 } catch {
  return []
 }
}
