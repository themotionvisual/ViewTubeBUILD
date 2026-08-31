const PACKED_DATASET_FORMAT = "viewtube-packed-dataset" as const
const PACKED_DATASET_VERSION = 2 as const
const DEFAULT_CHUNK_SIZE = 2_048

type StructuredValue =
 | ["undefined"]
 | ["null"]
 | ["string", string]
 | ["number", number | "NaN" | "+Infinity" | "-Infinity"]
 | ["boolean", 0 | 1]
 | ["bigint", string]
 | ["date", string]
 | ["array", StructuredValue[]]
 | ["object", Array<[string, StructuredValue]>]

type PackedColumn = {
 key: string
 states: string
 numbers?: number[]
 stringIndexes?: number[]
 structuredIndexes?: number[]
}

type PackedChunkEnvelope = {
 rowCount: number
 dictionary: string[]
 columns: PackedColumn[]
}

export type VtSyncPackedDatasetChunk = {
 id: string
 rowStart: number
 rowCount: number
 byteLength: number
 checksum: string
 compression: "gzip" | "none"
 data: Uint8Array
}

export type VtSyncPackedDatasetManifestV2 = {
 format: typeof PACKED_DATASET_FORMAT
 version: typeof PACKED_DATASET_VERSION
 channelId: string
 datasetId: string
 schemaId: string
 schemaHash: string
 generation: string
 rowCount: number
 primaryKey: string[]
 chunks: Array<Omit<VtSyncPackedDatasetChunk, "data">>
 capturedAt: string
}

export type VtSyncPackedDatasetV2 = {
 manifest: VtSyncPackedDatasetManifestV2
 schema: { id: string; columns: string[] }
 chunks: VtSyncPackedDatasetChunk[]
}

const primaryKeyForDataset = (datasetId: string): string[] => {
 if (datasetId === "videos") return ["id"]
 if (datasetId === "daily") return ["date"]
 if (datasetId === "monthly" || datasetId === "monthly_api") return ["month"]
 if (datasetId === "channel_totals") return ["window"]
 return []
}

const toHex = (bytes: Uint8Array): string =>
 Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")

const sha256 = async (data: Uint8Array): Promise<string> => {
 if (!globalThis.crypto?.subtle) throw new Error("SHA-256 is unavailable in this browser.")
 const digest = await globalThis.crypto.subtle.digest("SHA-256", data as BufferSource)
 return toHex(new Uint8Array(digest))
}

const streamTransform = async (
 data: Uint8Array,
 mode: "compress" | "decompress",
): Promise<Uint8Array | null> => {
 const Stream = mode === "compress" ? globalThis.CompressionStream : globalThis.DecompressionStream
 if (typeof Stream !== "function") return null
 const stream = new Blob([data as BlobPart]).stream().pipeThrough(new Stream("gzip"))
 return new Uint8Array(await new Response(stream).arrayBuffer())
}

const encodeStructured = (value: unknown): StructuredValue => {
 if (value === undefined) return ["undefined"]
 if (value === null) return ["null"]
 if (typeof value === "string") return ["string", value]
 if (typeof value === "number") {
  if (Number.isNaN(value)) return ["number", "NaN"]
  if (value === Number.POSITIVE_INFINITY) return ["number", "+Infinity"]
  if (value === Number.NEGATIVE_INFINITY) return ["number", "-Infinity"]
  return ["number", value]
 }
 if (typeof value === "boolean") return ["boolean", value ? 1 : 0]
 if (typeof value === "bigint") return ["bigint", value.toString()]
 if (value instanceof Date) return ["date", value.toISOString()]
 if (Array.isArray(value)) return ["array", value.map(encodeStructured)]
 if (typeof value === "object") {
  return ["object", Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, encodeStructured(entry)])]
 }
 throw new Error(`VT-SYNC cannot pack values of type ${typeof value}.`)
}

const decodeStructured = (value: StructuredValue): unknown => {
 switch (value[0]) {
  case "undefined": return undefined
  case "null": return null
  case "string": return value[1]
  case "number":
   return value[1] === "NaN" ? Number.NaN
    : value[1] === "+Infinity" ? Number.POSITIVE_INFINITY
     : value[1] === "-Infinity" ? Number.NEGATIVE_INFINITY
      : value[1]
  case "boolean": return value[1] === 1
  case "bigint": return BigInt(value[1])
  case "date": return new Date(value[1])
  case "array": return value[1].map(decodeStructured)
  case "object": {
   const result: Record<string, unknown> = {}
   value[1].forEach(([key, entry]) => {
    Object.defineProperty(result, key, {
     value: decodeStructured(entry),
     enumerable: true,
     configurable: true,
     writable: true,
    })
   })
   return result
  }
 }
}

const encodeChunkEnvelope = (rows: Array<Record<string, unknown>>, columns: string[]): PackedChunkEnvelope => {
 const dictionary: string[] = []
 const dictionaryIndex = new Map<string, number>()
 const intern = (value: string): number => {
  const existing = dictionaryIndex.get(value)
  if (existing !== undefined) return existing
  const index = dictionary.length
  dictionary.push(value)
  dictionaryIndex.set(value, index)
  return index
 }

 return {
  rowCount: rows.length,
  dictionary,
  columns: columns.map((key) => {
   const states: string[] = []
   const numbers: number[] = []
   const stringIndexes: number[] = []
   const structuredIndexes: number[] = []
   rows.forEach((row) => {
    if (!Object.prototype.hasOwnProperty.call(row, key)) {
     states.push("m")
     return
    }
    const value = row[key]
    if (value === undefined) states.push("u")
    else if (value === null) states.push("l")
    else if (typeof value === "number" && Number.isFinite(value)) {
     states.push("n")
     numbers.push(value)
    } else if (typeof value === "string") {
     states.push("s")
     stringIndexes.push(intern(value))
    } else if (typeof value === "boolean") states.push(value ? "t" : "f")
    else {
     states.push("j")
     structuredIndexes.push(intern(JSON.stringify(encodeStructured(value))))
    }
   })
   return {
    key,
    states: states.join(""),
    ...(numbers.length ? { numbers } : {}),
    ...(stringIndexes.length ? { stringIndexes } : {}),
    ...(structuredIndexes.length ? { structuredIndexes } : {}),
   }
  }),
 }
}

const decodeChunkEnvelope = (envelope: PackedChunkEnvelope): Array<Record<string, unknown>> => {
 const rows = Array.from({ length: envelope.rowCount }, () => ({} as Record<string, unknown>))
 envelope.columns.forEach((column) => {
  let numberIndex = 0
  let stringIndex = 0
  let structuredIndex = 0
  Array.from(column.states).forEach((state, rowIndex) => {
   let value: unknown
   if (state === "m") return
   if (state === "u") value = undefined
   else if (state === "l") value = null
   else if (state === "n") value = column.numbers?.[numberIndex++]
   else if (state === "s") value = envelope.dictionary[column.stringIndexes?.[stringIndex++] ?? -1]
   else if (state === "t") value = true
   else if (state === "f") value = false
   else if (state === "j") {
    const encoded = envelope.dictionary[column.structuredIndexes?.[structuredIndex++] ?? -1]
    value = decodeStructured(JSON.parse(encoded) as StructuredValue)
   } else throw new Error(`Unknown VT-SYNC packed value state: ${state}`)
   Object.defineProperty(rows[rowIndex], column.key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
   })
  })
 })
 return rows
}

const generationId = (): string =>
 `${Date.now().toString(36)}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`

export const encodeVtSyncDataset = async ({
 channelId,
 datasetId,
 rows,
 capturedAt,
 chunkSize = DEFAULT_CHUNK_SIZE,
}: {
 channelId: string
 datasetId: string
 rows: Array<Record<string, unknown>>
 capturedAt: string
 chunkSize?: number
}): Promise<VtSyncPackedDatasetV2> => {
 if (!Number.isInteger(chunkSize) || chunkSize < 1) throw new Error("VT-SYNC packed chunk size must be a positive integer.")
 const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
 const schemaId = `${datasetId}:v2`
 const schemaHash = await sha256(new TextEncoder().encode(JSON.stringify(columns)))
 const generation = generationId()
 const chunks: VtSyncPackedDatasetChunk[] = []

 for (let rowStart = 0; rowStart < rows.length; rowStart += chunkSize) {
  const chunkRows = rows.slice(rowStart, rowStart + chunkSize)
  const logicalBytes = new TextEncoder().encode(JSON.stringify(encodeChunkEnvelope(chunkRows, columns)))
  const compressed = await streamTransform(logicalBytes, "compress")
  const data = compressed && compressed.byteLength < logicalBytes.byteLength ? compressed : logicalBytes
  const compression = data === compressed ? "gzip" as const : "none" as const
  chunks.push({
   id: `${channelId}::${datasetId}::${generation}::${chunks.length}`,
   rowStart,
   rowCount: chunkRows.length,
   byteLength: data.byteLength,
   checksum: await sha256(data),
   compression,
   data,
  })
 }

 const manifestChunks = chunks.map((chunk) => ({
  id: chunk.id,
  rowStart: chunk.rowStart,
  rowCount: chunk.rowCount,
  byteLength: chunk.byteLength,
  checksum: chunk.checksum,
  compression: chunk.compression,
 }))
 return {
  manifest: {
   format: PACKED_DATASET_FORMAT,
   version: PACKED_DATASET_VERSION,
   channelId,
   datasetId,
   schemaId,
   schemaHash,
   generation,
   rowCount: rows.length,
   primaryKey: primaryKeyForDataset(datasetId),
   chunks: manifestChunks,
   capturedAt,
  },
  schema: { id: schemaId, columns },
  chunks,
 }
}

export const decodeVtSyncDataset = async (dataset: VtSyncPackedDatasetV2): Promise<Array<Record<string, unknown>>> => {
 if (dataset.manifest.format !== PACKED_DATASET_FORMAT || dataset.manifest.version !== PACKED_DATASET_VERSION)
  throw new Error("Unsupported VT-SYNC packed dataset.")
 const expectedSchemaHash = await sha256(new TextEncoder().encode(JSON.stringify(dataset.schema.columns)))
 if (expectedSchemaHash !== dataset.manifest.schemaHash) throw new Error("VT-SYNC packed dataset schema checksum failed.")

 const rows: Array<Record<string, unknown>> = []
 for (const chunk of [...dataset.chunks].sort((left, right) => left.rowStart - right.rowStart)) {
  if (await sha256(chunk.data) !== chunk.checksum) throw new Error(`VT-SYNC packed chunk checksum failed: ${chunk.id}`)
  const logicalBytes = chunk.compression === "gzip"
   ? await streamTransform(chunk.data, "decompress")
   : chunk.data
  if (!logicalBytes) throw new Error("This browser cannot decompress VT-SYNC data.")
  const envelope = JSON.parse(new TextDecoder().decode(logicalBytes)) as PackedChunkEnvelope
  const decoded = decodeChunkEnvelope(envelope)
  if (decoded.length !== chunk.rowCount) throw new Error(`VT-SYNC packed chunk row count failed: ${chunk.id}`)
  rows.push(...decoded)
 }
 if (rows.length !== dataset.manifest.rowCount) throw new Error("VT-SYNC packed dataset row count failed.")
 return rows
}

export const VT_SYNC_PACKED_DATASET_VERSION = PACKED_DATASET_VERSION
export const VT_SYNC_PACKED_DATASET_CHUNK_SIZE = DEFAULT_CHUNK_SIZE
