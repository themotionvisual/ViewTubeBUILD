import {
 VT_SYNC_LOCAL_DB_NAME,
 VT_SYNC_LOCAL_DB_VERSION,
 VT_SYNC_LOCAL_STORE_NAMES,
 type VtSyncChannelIndexRecord,
 type VtSyncDatasetRawReportRecord,
 type VtSyncDatasetTableRowsRecord,
 type VtSyncInventoryCursorRecord,
 type VtSyncLocalDbStoreName,
 type VtSyncSyncRunRecord,
 type VtSyncVideoInventoryRecord,
} from "./contracts"
import {
 decodeVtSyncDataset,
 encodeVtSyncDataset,
 type VtSyncPackedDatasetChunk,
 type VtSyncPackedDatasetManifestV2,
} from "./packedDataset"

type VtSyncPackedManifestRecord = {
 id: string
 record: Omit<VtSyncDatasetTableRowsRecord, "rows">
 manifest: VtSyncPackedDatasetManifestV2
 schema: { id: string; columns: string[] }
}

type VtSyncPackedChunkRecord = VtSyncPackedDatasetChunk & {
 recordId: string
 datasetId: string
 channelId: string
 generation: string
}

type VtSyncPackedRawReportRecord = {
 id: string
 record: Omit<VtSyncDatasetRawReportRecord, "rows">
 packed: Awaited<ReturnType<typeof encodeVtSyncDataset>>
}

type VtSyncChannelDimensionRecord = {
 id: string
 channelId: string
 fields: Pick<VtSyncChannelIndexRecord, "title" | "handle" | "publicVideoCount">
}

type VtSyncVideoDimensionRecord = {
 id: string
 channelId: string
 videoId: string
 fields: Record<string, unknown>
}

const VIDEO_DIMENSION_FIELDS = new Set([
 "title", "thumbnail", "publishedAt", "format", "category", "categoryId", "categoryName",
 "tags", "topics", "privacyStatus", "duration", "durationRaw", "durationSeconds", "definition",
 "caption", "description", "descriptionSnippet", "defaultLanguage", "defaultAudioLanguage",
 "localized", "localizations", "liveBroadcastContent", "liveStreamingDetails", "recordingDetails",
 "player", "embeddable", "license", "madeForKids", "selfDeclaredMadeForKids", "publicStatsViewable",
])

export type VtSyncPackedStorageDiagnostic = {
 id: string
 channelId: string
 datasetId: string
 rowCount: number
 encodedBytes: number
 logicalBytes: number
 compressionRatio: number
 generationHealth: "verified" | "corrupt"
}

const hasIndexedDb = (): boolean =>
 typeof indexedDB !== "undefined" && typeof indexedDB.open === "function"

export const buildVtSyncInventoryId = (channelId: string, videoId: string): string =>
 `${channelId}::${videoId}`

export const openVtSyncLocalDb = async (): Promise<IDBDatabase> =>
 new Promise((resolve, reject) => {
  if (!hasIndexedDb()) {
   reject(new Error("IndexedDB is not available for VT Sync local storage."))
   return
  }
  const request = indexedDB.open(VT_SYNC_LOCAL_DB_NAME, VT_SYNC_LOCAL_DB_VERSION)
  request.onupgradeneeded = () => {
   const db = request.result
   Object.values(VT_SYNC_LOCAL_STORE_NAMES).forEach((storeName) => {
    if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: "id" })
   })
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error || new Error("Failed to open VT Sync local database."))
 })

const withStore = async <T>(
 storeName: VtSyncLocalDbStoreName,
 mode: IDBTransactionMode,
 action: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> => {
 const db = await openVtSyncLocalDb()
 return new Promise<T | undefined>((resolve, reject) => {
 const tx = db.transaction(storeName, mode)
 const store = tx.objectStore(storeName)
 const request = action(store)
 let requestResult: T | undefined
 if (request) {
   request.onsuccess = () => {
    requestResult = request.result
   }
   request.onerror = () => reject(request.error)
  }
  tx.oncomplete = () => {
   db.close()
   resolve(requestResult)
  }
  tx.onerror = () => {
   db.close()
   reject(tx.error)
  }
  tx.onabort = () => {
   db.close()
   reject(tx.error)
  }
 })
}

const putRecord = async <T extends Record<string, unknown>>(
 storeName: VtSyncLocalDbStoreName,
 record: T,
): Promise<void> => {
 await withStore(storeName, "readwrite", (store) => {
  store.put(record)
 })
}

const putMany = async <T extends Record<string, unknown>>(
 storeName: VtSyncLocalDbStoreName,
 records: T[],
): Promise<void> => {
 if (!records.length) return
 const db = await openVtSyncLocalDb()
 await new Promise<void>((resolve, reject) => {
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  records.forEach((record) => store.put(record))
  tx.oncomplete = () => {
   db.close()
   resolve()
  }
  tx.onerror = () => {
   db.close()
   reject(tx.error)
  }
  tx.onabort = () => {
   db.close()
   reject(tx.error)
  }
 })
}

const getAll = async <T>(storeName: VtSyncLocalDbStoreName): Promise<T[]> => {
 const result = await withStore<T[]>(storeName, "readonly", (store) => store.getAll())
 return result || []
}

const deleteMany = async (storeName: VtSyncLocalDbStoreName, ids: string[]): Promise<void> => {
 if (!ids.length) return
 const db = await openVtSyncLocalDb()
 await new Promise<void>((resolve, reject) => {
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  ids.forEach((id) => store.delete(id))
  tx.oncomplete = () => {
   db.close()
   resolve()
  }
  tx.onerror = () => {
   db.close()
   reject(tx.error)
  }
  tx.onabort = () => {
   db.close()
   reject(tx.error)
  }
 })
}

const latestDatasetRecordId = (channelId: string | undefined, datasetId: string, kind: "raw" | "table") =>
 `latest_api::${encodeURIComponent(channelId || "unscoped")}::${encodeURIComponent(datasetId)}::${kind}`

const getById = async <T>(storeName: VtSyncLocalDbStoreName, id: string): Promise<T | null> => {
 const result = await withStore<T>(storeName, "readonly", (store) => store.get(id))
 return result || null
}

export const clearVtSyncLocalDb = async (): Promise<void> => {
 if (!hasIndexedDb()) return
 try {
  const db = await openVtSyncLocalDb()
  await new Promise<void>((resolve, reject) => {
   const storeNames = Object.values(VT_SYNC_LOCAL_STORE_NAMES)
   const tx = db.transaction(storeNames, "readwrite")
   storeNames.forEach((storeName) => tx.objectStore(storeName).clear())
   tx.oncomplete = () => {
    db.close()
    resolve()
   }
   tx.onerror = () => {
    db.close()
    reject(tx.error)
   }
   tx.onabort = () => {
    db.close()
    reject(tx.error)
   }
  })
 } catch {
  // Reset remains best-effort on browsers that block or disable IndexedDB.
 }
}

export const clearVtSyncVideoCatalogForChannel = async (channelId: string): Promise<void> => {
 const records = await listVtSyncVideoInventory(channelId)
 await Promise.all([
  deleteMany(VT_SYNC_LOCAL_STORE_NAMES.videoInventory, records.map((record) => record.id)),
  withStore(VT_SYNC_LOCAL_STORE_NAMES.channelIndex, "readwrite", (store) => store.delete(channelId)),
  withStore(VT_SYNC_LOCAL_STORE_NAMES.syncCursors, "readwrite", (store) => store.delete(channelId)),
 ])
}

export const putVtSyncChannelIndex = async (record: VtSyncChannelIndexRecord): Promise<void> => {
 const { title, handle, publicVideoCount, ...operational } = record
 await Promise.all([
  putRecord(VT_SYNC_LOCAL_STORE_NAMES.channelDimensions, {
   id: record.id,
   channelId: record.channelId,
   fields: { title, handle, publicVideoCount },
  } satisfies VtSyncChannelDimensionRecord),
  putRecord(VT_SYNC_LOCAL_STORE_NAMES.channelIndex, operational),
 ])
}

export const getVtSyncChannelIndex = async (channelId: string): Promise<VtSyncChannelIndexRecord | null> => {
 const [record, dimension] = await Promise.all([
  getById<VtSyncChannelIndexRecord>(VT_SYNC_LOCAL_STORE_NAMES.channelIndex, channelId),
  getById<VtSyncChannelDimensionRecord>(VT_SYNC_LOCAL_STORE_NAMES.channelDimensions, channelId),
 ])
 return record ? { ...record, ...(dimension?.fields || {}) } : null
}

export const putVtSyncInventoryCursor = async (record: VtSyncInventoryCursorRecord): Promise<void> =>
 putRecord(VT_SYNC_LOCAL_STORE_NAMES.syncCursors, record)

export const getVtSyncInventoryCursor = async (channelId: string): Promise<VtSyncInventoryCursorRecord | null> =>
 getById<VtSyncInventoryCursorRecord>(VT_SYNC_LOCAL_STORE_NAMES.syncCursors, channelId)

export const putVtSyncSyncRun = async (record: VtSyncSyncRunRecord): Promise<void> =>
 putRecord(VT_SYNC_LOCAL_STORE_NAMES.syncRuns, record)

export const listVtSyncSyncRuns = async (): Promise<VtSyncSyncRunRecord[]> =>
 getAll<VtSyncSyncRunRecord>(VT_SYNC_LOCAL_STORE_NAMES.syncRuns)

export const replaceLatestVtSyncSyncRun = async (record: VtSyncSyncRunRecord): Promise<void> => {
 await putVtSyncSyncRun(record)
 const runs = await listVtSyncSyncRuns()
 await deleteMany(
  VT_SYNC_LOCAL_STORE_NAMES.syncRuns,
  runs.filter((candidate) => candidate.channelId === record.channelId && candidate.id !== record.id).map((candidate) => candidate.id),
 )
}

export const getVtSyncSyncRun = async (runId: string): Promise<VtSyncSyncRunRecord | null> =>
 getById<VtSyncSyncRunRecord>(VT_SYNC_LOCAL_STORE_NAMES.syncRuns, runId)

export const putVtSyncVideoInventoryRecords = async (
 records: VtSyncVideoInventoryRecord[],
): Promise<void> => {
 const dimensions: VtSyncVideoDimensionRecord[] = records.map((record) => ({
  id: record.id,
  channelId: record.channelId,
  videoId: record.videoId,
  fields: {
   publishedAt: record.publishedAt,
   title: record.title,
   thumbnail: record.thumbnail,
  },
 }))
 const operational = records.map(({ publishedAt: _publishedAt, title: _title, thumbnail: _thumbnail, ...record }) => record)
 await Promise.all([
  putMany(VT_SYNC_LOCAL_STORE_NAMES.videoDimensions, dimensions),
  putMany(VT_SYNC_LOCAL_STORE_NAMES.videoInventory, operational),
 ])
}

export const listVtSyncVideoInventory = async (channelId: string): Promise<VtSyncVideoInventoryRecord[]> => {
 const [records, dimensions] = await Promise.all([
  getAll<VtSyncVideoInventoryRecord>(VT_SYNC_LOCAL_STORE_NAMES.videoInventory),
  getAll<VtSyncVideoDimensionRecord>(VT_SYNC_LOCAL_STORE_NAMES.videoDimensions),
 ])
 const dimensionsById = new Map(dimensions.map((record) => [record.id, record]))
 return records
  .filter((record) => record.channelId === channelId)
  .map((record) => ({ ...record, ...(dimensionsById.get(record.id)?.fields || {}) }))
  .sort((left, right) => {
   const leftPage = left.pageNumber ?? Number.MAX_SAFE_INTEGER
   const rightPage = right.pageNumber ?? Number.MAX_SAFE_INTEGER
   if (leftPage !== rightPage) return leftPage - rightPage
   const leftIndex = left.pageIndex ?? Number.MAX_SAFE_INTEGER
   const rightIndex = right.pageIndex ?? Number.MAX_SAFE_INTEGER
   if (leftIndex !== rightIndex) return leftIndex - rightIndex
   return left.videoId.localeCompare(right.videoId)
  })
}

export const getVtSyncKnownVideoIds = async (channelId: string): Promise<Set<string>> => {
 const records = await listVtSyncVideoInventory(channelId)
 return new Set(records.map((record) => record.videoId).filter(Boolean))
}

export const putVtSyncDatasetRawReport = async (record: VtSyncDatasetRawReportRecord): Promise<void> => {
 if (!record.channelId) {
  await putRecord(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports, record)
  return
 }
 const { rows, ...metadata } = record
 const packed = await encodeVtSyncDataset({
  channelId: record.channelId,
  datasetId: `raw:${record.datasetId}`,
  rows,
  capturedAt: record.capturedAt,
 })
 await putRecord(VT_SYNC_LOCAL_STORE_NAMES.rawReportBlobs, {
  id: record.id,
  record: metadata,
  packed,
 } satisfies VtSyncPackedRawReportRecord)
 await withStore(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports, "readwrite", (store) => store.delete(record.id))
}

export const listVtSyncDatasetRawReports = async (): Promise<VtSyncDatasetRawReportRecord[]> => {
 let [legacy, packed] = await Promise.all([
  getAll<VtSyncDatasetRawReportRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports),
  getAll<VtSyncPackedRawReportRecord>(VT_SYNC_LOCAL_STORE_NAMES.rawReportBlobs),
 ])
 const packedIds = new Set(packed.map((record) => record.id))
 const migratable = legacy.filter((record) => record.channelId && !packedIds.has(record.id))
 if (migratable.length) {
  for (const record of migratable) await putVtSyncDatasetRawReport(record)
  ;[legacy, packed] = await Promise.all([
   getAll<VtSyncDatasetRawReportRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports),
   getAll<VtSyncPackedRawReportRecord>(VT_SYNC_LOCAL_STORE_NAMES.rawReportBlobs),
  ])
 }
 const decoded = await Promise.all(packed.map(async (entry) => ({
  ...entry.record,
  rows: await decodeVtSyncDataset(entry.packed),
 })))
 const currentPackedIds = new Set(decoded.map((record) => record.id))
 return [...legacy.filter((record) => !currentPackedIds.has(record.id)), ...decoded]
}

export const deleteVtSyncDatasetRawReport = async (id: string): Promise<void> => {
 await Promise.all([
  withStore(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports, "readwrite", (store) => store.delete(id)),
  withStore(VT_SYNC_LOCAL_STORE_NAMES.rawReportBlobs, "readwrite", (store) => store.delete(id)),
 ])
}

/**
 * Store the newest authoritative API report under a stable key, then remove
 * superseded diagnostics. The successful put happens before cleanup so a
 * failed write never destroys the last usable report.
 */
export const replaceLatestVtSyncDatasetRawReport = async (
 record: Omit<VtSyncDatasetRawReportRecord, "id">,
): Promise<void> => {
 const id = latestDatasetRecordId(record.channelId, record.datasetId, "raw")
 await putVtSyncDatasetRawReport({ ...record, id })
 const records = await listVtSyncDatasetRawReports()
 await Promise.all(records
   .filter((candidate) => candidate.id !== id
    && candidate.source !== "local_import"
    && candidate.datasetId === record.datasetId && (
    candidate.channelId === record.channelId || candidate.channelId === undefined
   ))
   .map((candidate) => deleteVtSyncDatasetRawReport(candidate.id)))
}

export const putVtSyncDatasetTableRows = async (record: VtSyncDatasetTableRowsRecord): Promise<void> =>
 record.channelId ? putPackedDatasetTableRows(record) : putRecord(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows, record)

const chunksForManifest = async (manifest: VtSyncPackedManifestRecord): Promise<VtSyncPackedDatasetChunk[]> => {
 const chunks = await getAll<VtSyncPackedChunkRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks)
 return chunks
  .filter((chunk) => chunk.recordId === manifest.id && chunk.generation === manifest.manifest.generation)
  .sort((left, right) => left.rowStart - right.rowStart)
  .map((chunk) => ({
   id: chunk.id,
   rowStart: chunk.rowStart,
   rowCount: chunk.rowCount,
   byteLength: chunk.byteLength,
   checksum: chunk.checksum,
   compression: chunk.compression,
   data: chunk.data,
  }))
}

const splitVideoDimensions = async (
 channelId: string,
 rows: Array<Record<string, unknown>>,
): Promise<Array<Record<string, unknown>>> => {
 const existing = await getAll<VtSyncVideoDimensionRecord>(VT_SYNC_LOCAL_STORE_NAMES.videoDimensions)
 const byId = new Map(existing.filter((record) => record.channelId === channelId).map((record) => [record.videoId, record]))
 const facts = rows.map((row) => {
  const videoId = String(row.id ?? row.videoId ?? "")
  if (!videoId) return row
  const fields = Object.fromEntries(Object.entries(row).filter(([key]) => VIDEO_DIMENSION_FIELDS.has(key)))
  const current = byId.get(videoId)
  byId.set(videoId, {
   id: buildVtSyncInventoryId(channelId, videoId),
   channelId,
   videoId,
   fields: mergeDefinedFields(current?.fields || {}, fields),
  })
  return Object.fromEntries(Object.entries(row).filter(([key]) => !VIDEO_DIMENSION_FIELDS.has(key)))
 })
 await putMany(VT_SYNC_LOCAL_STORE_NAMES.videoDimensions, [...byId.values()])
 return facts
}

const joinVideoDimensions = async (
 channelId: string,
 rows: Array<Record<string, unknown>>,
): Promise<Array<Record<string, unknown>>> => {
 const dimensions = await getAll<VtSyncVideoDimensionRecord>(VT_SYNC_LOCAL_STORE_NAMES.videoDimensions)
 const byVideoId = new Map(dimensions.filter((record) => record.channelId === channelId).map((record) => [record.videoId, record.fields]))
 return rows.map((row) => {
  const videoId = String(row.id ?? row.videoId ?? "")
  return { ...(byVideoId.get(videoId) || {}), ...row }
 })
}

const decodeManifestRecord = async (record: VtSyncPackedManifestRecord): Promise<VtSyncDatasetTableRowsRecord> => {
 const decoded = await decodeVtSyncDataset({
  manifest: record.manifest,
  schema: record.schema,
  chunks: await chunksForManifest(record),
 })
 return {
  ...record.record,
  rows: record.manifest.datasetId === "videos"
   ? await joinVideoDimensions(record.manifest.channelId, decoded)
   : decoded,
 }
}

const putPackedDatasetTableRows = async (record: VtSyncDatasetTableRowsRecord): Promise<void> => {
 const channelId = record.channelId
 if (!channelId) {
  await putRecord(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows, record)
  return
 }
 const previous = await getById<VtSyncPackedManifestRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests, record.id)
 const rows = record.datasetId === "videos"
  ? await splitVideoDimensions(channelId, record.rows)
  : record.rows
 const packed = await encodeVtSyncDataset({
  channelId,
  datasetId: record.datasetId,
  rows,
  capturedAt: record.capturedAt,
 })
 const chunkRecords: VtSyncPackedChunkRecord[] = packed.chunks.map((chunk) => ({
  ...chunk,
  recordId: record.id,
  datasetId: record.datasetId,
  channelId,
  generation: packed.manifest.generation,
 }))
 await putMany(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks, chunkRecords)

 // Verify bytes read back from IndexedDB before the manifest points readers at
 // this generation. A failed staging generation leaves the previous manifest
 // untouched and removes only its own orphaned chunks.
 try {
  const storedChunks = (await getAll<VtSyncPackedChunkRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks))
   .filter((chunk) => chunk.recordId === record.id && chunk.generation === packed.manifest.generation)
   .sort((left, right) => left.rowStart - right.rowStart)
   .map((chunk) => ({
    id: chunk.id,
    rowStart: chunk.rowStart,
    rowCount: chunk.rowCount,
    byteLength: chunk.byteLength,
    checksum: chunk.checksum,
    compression: chunk.compression,
    data: chunk.data,
   }))
  if (storedChunks.length !== packed.chunks.length) throw new Error("VT-SYNC packed generation staging was incomplete.")
  await decodeVtSyncDataset({ ...packed, chunks: storedChunks })
 } catch (error) {
  await deleteMany(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks, chunkRecords.map((chunk) => chunk.id))
  throw error
 }
 const recordMetadata = Object.fromEntries(
  Object.entries(record).filter(([key]) => key !== "rows"),
 ) as Omit<VtSyncDatasetTableRowsRecord, "rows">
 await putRecord(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests, {
  id: record.id,
  record: recordMetadata,
  manifest: packed.manifest,
  schema: packed.schema,
 } satisfies VtSyncPackedManifestRecord)
 await withStore(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows, "readwrite", (store) => store.delete(record.id))

 if (previous && previous.manifest.generation !== packed.manifest.generation) {
  const allChunks = await getAll<VtSyncPackedChunkRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks)
  await deleteMany(
   VT_SYNC_LOCAL_STORE_NAMES.datasetChunks,
   allChunks
    .filter((chunk) => chunk.recordId === record.id && chunk.generation === previous.manifest.generation)
    .map((chunk) => chunk.id),
  )
 }
}

export const listVtSyncDatasetTableRows = async (): Promise<VtSyncDatasetTableRowsRecord[]> => {
 let [legacy, manifests] = await Promise.all([
  getAll<VtSyncDatasetTableRowsRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows),
  getAll<VtSyncPackedManifestRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests),
 ])
 const packedIds = new Set(manifests.map((record) => record.id))
 const migratable = legacy.filter((record) => record.channelId && !packedIds.has(record.id))
 if (migratable.length) {
  // Migration is resumable record-by-record. A legacy row record is removed
  // only after its staged packed generation has decoded and verified.
  for (const record of migratable) await putPackedDatasetTableRows(record)
  ;[legacy, manifests] = await Promise.all([
   getAll<VtSyncDatasetTableRowsRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows),
   getAll<VtSyncPackedManifestRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests),
  ])
 }
 const packed = await Promise.all(manifests.map(decodeManifestRecord))
 const currentPackedIds = new Set(packed.map((record) => record.id))
 return [...legacy.filter((record) => !currentPackedIds.has(record.id)), ...packed]
}

export const getVtSyncPackedStorageDiagnostics = async (): Promise<VtSyncPackedStorageDiagnostic[]> => {
 const manifests = await getAll<VtSyncPackedManifestRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests)
 return Promise.all(manifests.map(async (record) => {
  const chunks = await chunksForManifest(record)
  const encodedBytes = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  try {
   const rows = await decodeManifestRecord(record).then((entry) => entry.rows)
   const logicalBytes = new TextEncoder().encode(JSON.stringify(rows)).byteLength
   return {
    id: record.id,
    channelId: record.manifest.channelId,
    datasetId: record.manifest.datasetId,
    rowCount: rows.length,
    encodedBytes,
    logicalBytes,
    compressionRatio: logicalBytes ? encodedBytes / logicalBytes : 0,
    generationHealth: "verified" as const,
   }
  } catch {
   return {
    id: record.id,
    channelId: record.manifest.channelId,
    datasetId: record.manifest.datasetId,
    rowCount: record.manifest.rowCount,
    encodedBytes,
    logicalBytes: 0,
    compressionRatio: 0,
    generationHealth: "corrupt" as const,
   }
  }
 }))
}

export const deleteVtSyncDatasetTableRows = async (id: string): Promise<void> => {
 const manifest = await getById<VtSyncPackedManifestRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests, id)
 await Promise.all([
  withStore(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows, "readwrite", (store) => store.delete(id)),
  withStore(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests, "readwrite", (store) => store.delete(id)),
 ])
 if (manifest) {
  const chunks = await getAll<VtSyncPackedChunkRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks)
  await deleteMany(
   VT_SYNC_LOCAL_STORE_NAMES.datasetChunks,
   chunks.filter((chunk) => chunk.recordId === id).map((chunk) => chunk.id),
  )
 }
}

/** Replace only API-owned rows for this channel/dataset; manual CSV records survive. */
export const replaceLatestVtSyncDatasetTableRows = async (
 record: Omit<VtSyncDatasetTableRowsRecord, "id" | "provenance">,
): Promise<void> => {
 const id = latestDatasetRecordId(record.channelId, record.datasetId, "table")
 await putVtSyncDatasetTableRows({ ...record, id, provenance: "api" })
 const records = await listVtSyncDatasetTableRows()
 await Promise.all(records
  .filter((candidate) => candidate.id !== id
   && candidate.provenance === "api"
   && candidate.datasetId === record.datasetId
   && (candidate.channelId === record.channelId || candidate.channelId === undefined))
 .map((candidate) => deleteVtSyncDatasetTableRows(candidate.id)))
}

const rowIdentity = (datasetId: string, row: Record<string, unknown>, index: number): string => {
 if (datasetId === "videos") return String(row.id ?? row.videoId ?? `row:${index}`)
 if (datasetId === "daily") return String(row.date ?? row.day ?? `row:${index}`)
 if (datasetId === "monthly" || datasetId === "monthly_api") return String(row.month ?? row.date ?? `row:${index}`)
 if (datasetId === "channel_totals") return String(row.window ?? `row:${index}`)
 return String(row.id ?? row.videoId ?? row.date ?? row.day ?? row.month ?? row.term ?? `row:${index}`)
}

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
 Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)

const mergeDefinedFields = (
 current: Record<string, unknown>,
 incoming: Record<string, unknown>,
): Record<string, unknown> => {
 const merged = { ...current }
 Object.entries(incoming).forEach(([key, value]) => {
  if (value === undefined) return
  merged[key] = isPlainRecord(value) && isPlainRecord(merged[key])
   ? mergeDefinedFields(merged[key] as Record<string, unknown>, value)
   : value
 })
 return merged
}

/** Merge a partial/current-window dataset into the complete generation. */
export const upsertLatestVtSyncDatasetTableRows = async (
 record: Omit<VtSyncDatasetTableRowsRecord, "id" | "provenance">,
): Promise<void> => {
 const id = latestDatasetRecordId(record.channelId, record.datasetId, "table")
 const manifest = await getById<VtSyncPackedManifestRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetManifests, id)
 const legacy = manifest
  ? null
  : await getById<VtSyncDatasetTableRowsRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows, id)
 const currentRows = manifest ? (await decodeManifestRecord(manifest)).rows : legacy?.rows || []
 const order: string[] = []
 const rowsById = new Map<string, Record<string, unknown>>()
 currentRows.forEach((row, index) => {
  const key = rowIdentity(record.datasetId, row, index)
  order.push(key)
  rowsById.set(key, row)
 })
 record.rows.forEach((row, index) => {
  const key = rowIdentity(record.datasetId, row, currentRows.length + index)
  const current = rowsById.get(key)
  if (!current) order.push(key)
  rowsById.set(key, current ? mergeDefinedFields(current, row) : row)
 })
 await putPackedDatasetTableRows({
  ...record,
  id,
  provenance: "api",
  rows: order.map((key) => rowsById.get(key)!).filter(Boolean),
 })
}
