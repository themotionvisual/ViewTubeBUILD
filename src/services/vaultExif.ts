export type VaultExifMetadata = {
 make?: string
 model?: string
 orientation?: number
 dateTime?: string
 dateTimeOriginal?: string
 imageWidth?: number
 imageHeight?: number
 pixelWidth?: number
 pixelHeight?: number
}

const readAscii = (
 view: DataView,
 tiffStart: number,
 entryOffset: number,
 littleEndian: boolean,
 count: number,
): string | undefined => {
 if (count <= 0) return undefined
 const valueOffset = count <= 4
  ? entryOffset + 8
  : tiffStart + view.getUint32(entryOffset + 8, littleEndian)
 if (valueOffset < 0 || valueOffset + count > view.byteLength) return undefined
 let out = ""
 for (let i = 0; i < count; i += 1) {
  const code = view.getUint8(valueOffset + i)
  if (code === 0) break
  out += String.fromCharCode(code)
 }
 const trimmed = out.trim()
 return trimmed || undefined
}

const readNumeric = (
 view: DataView,
 entryOffset: number,
 littleEndian: boolean,
 type: number,
): number | undefined => {
 if (type === 3) return view.getUint16(entryOffset + 8, littleEndian)
 if (type === 4) return view.getUint32(entryOffset + 8, littleEndian)
 return undefined
}

const parseIfd = (
 view: DataView,
 tiffStart: number,
 relativeOffset: number,
 littleEndian: boolean,
 out: VaultExifMetadata,
): number | null => {
 const ifdOffset = tiffStart + relativeOffset
 if (ifdOffset < 0 || ifdOffset + 2 > view.byteLength) return null
 const count = view.getUint16(ifdOffset, littleEndian)
 let exifIfdOffset: number | null = null

 for (let index = 0; index < count; index += 1) {
  const entryOffset = ifdOffset + 2 + index * 12
  if (entryOffset + 12 > view.byteLength) break
  const tag = view.getUint16(entryOffset, littleEndian)
  const type = view.getUint16(entryOffset + 2, littleEndian)
  const valueCount = view.getUint32(entryOffset + 4, littleEndian)
  const numeric = readNumeric(view, entryOffset, littleEndian, type)

  if (tag === 0x010f && type === 2) out.make = readAscii(view, tiffStart, entryOffset, littleEndian, valueCount)
  else if (tag === 0x0110 && type === 2) out.model = readAscii(view, tiffStart, entryOffset, littleEndian, valueCount)
  else if (tag === 0x0112 && numeric != null) out.orientation = numeric
  else if (tag === 0x0132 && type === 2) out.dateTime = readAscii(view, tiffStart, entryOffset, littleEndian, valueCount)
  else if (tag === 0x0100 && numeric != null) out.imageWidth = numeric
  else if (tag === 0x0101 && numeric != null) out.imageHeight = numeric
  else if (tag === 0x8769 && numeric != null) exifIfdOffset = numeric
  else if (tag === 0x9003 && type === 2) out.dateTimeOriginal = readAscii(view, tiffStart, entryOffset, littleEndian, valueCount)
  else if (tag === 0xa002 && numeric != null) out.pixelWidth = numeric
  else if (tag === 0xa003 && numeric != null) out.pixelHeight = numeric
 }

 return exifIfdOffset
}

export const parseJpegExifBuffer = (buffer: ArrayBuffer): VaultExifMetadata => {
 const view = new DataView(buffer)
 if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return {}

 let offset = 2
 while (offset + 4 <= view.byteLength) {
  if (view.getUint8(offset) !== 0xff) {
   offset += 1
   continue
  }
  const marker = view.getUint8(offset + 1)
  if (marker === 0xd9 || marker === 0xda) break
  if (offset + 4 > view.byteLength) break
  const segmentLength = view.getUint16(offset + 2, false)
  if (segmentLength < 2 || offset + 2 + segmentLength > view.byteLength) break

  if (marker === 0xe1) {
   const payloadStart = offset + 4
   if (payloadStart + 6 <= view.byteLength) {
    const header = String.fromCharCode(
     view.getUint8(payloadStart),
     view.getUint8(payloadStart + 1),
     view.getUint8(payloadStart + 2),
     view.getUint8(payloadStart + 3),
    )
    if (header === "Exif" && view.getUint8(payloadStart + 4) === 0 && view.getUint8(payloadStart + 5) === 0) {
     const tiffStart = payloadStart + 6
     if (tiffStart + 8 > view.byteLength) return {}
     const byteOrder = view.getUint16(tiffStart, false)
     const littleEndian = byteOrder === 0x4949
     if (!littleEndian && byteOrder !== 0x4d4d) return {}
     if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) return {}
     const firstIfd = view.getUint32(tiffStart + 4, littleEndian)
     const out: VaultExifMetadata = {}
     const exifIfd = parseIfd(view, tiffStart, firstIfd, littleEndian, out)
     if (exifIfd != null) parseIfd(view, tiffStart, exifIfd, littleEndian, out)
     return out
    }
   }
  }

  offset += 2 + segmentLength
 }
 return {}
}

export const extractVaultExifMetadata = async (file: File): Promise<VaultExifMetadata> => {
 if (!/^image\/(jpeg|jpg)$/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return {}
 try {
  return parseJpegExifBuffer(await file.arrayBuffer())
 } catch {
  return {}
 }
}
