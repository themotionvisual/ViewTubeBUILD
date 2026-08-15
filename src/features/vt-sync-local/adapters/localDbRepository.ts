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

export const clearVtSyncLocalDb = async (): Promise<void> =>
 new Promise((resolve) => {
  if (!hasIndexedDb()) {
   resolve()
   return
  }
  const request = indexedDB.deleteDatabase(VT_SYNC_LOCAL_DB_NAME)
  request.onsuccess = () => resolve()
  request.onerror = () => resolve()
  request.onblocked = () => resolve()
 })

export const putVtSyncChannelIndex = async (record: VtSyncChannelIndexRecord): Promise<void> =>
 putRecord(VT_SYNC_LOCAL_STORE_NAMES.channelIndex, record)

export const getVtSyncChannelIndex = async (channelId: string): Promise<VtSyncChannelIndexRecord | null> =>
 getById<VtSyncChannelIndexRecord>(VT_SYNC_LOCAL_STORE_NAMES.channelIndex, channelId)

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
): Promise<void> => putMany(VT_SYNC_LOCAL_STORE_NAMES.videoInventory, records)

export const listVtSyncVideoInventory = async (channelId: string): Promise<VtSyncVideoInventoryRecord[]> => {
 const records = await getAll<VtSyncVideoInventoryRecord>(VT_SYNC_LOCAL_STORE_NAMES.videoInventory)
 return records
  .filter((record) => record.channelId === channelId)
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

export const putVtSyncDatasetRawReport = async (record: VtSyncDatasetRawReportRecord): Promise<void> =>
 putRecord(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports, record)

export const listVtSyncDatasetRawReports = async (): Promise<VtSyncDatasetRawReportRecord[]> =>
 getAll<VtSyncDatasetRawReportRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports)

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
 await deleteMany(
  VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports,
  records
   .filter((candidate) => candidate.id !== id
    && candidate.source !== "local_import"
    && candidate.datasetId === record.datasetId && (
    candidate.channelId === record.channelId || candidate.channelId === undefined
   ))
   .map((candidate) => candidate.id),
 )
}

export const putVtSyncDatasetTableRows = async (record: VtSyncDatasetTableRowsRecord): Promise<void> =>
 putRecord(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows, record)

export const listVtSyncDatasetTableRows = async (): Promise<VtSyncDatasetTableRowsRecord[]> =>
 getAll<VtSyncDatasetTableRowsRecord>(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows)

export const deleteVtSyncDatasetTableRows = async (id: string): Promise<void> => {
 await withStore(VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows, "readwrite", (store) => store.delete(id))
}

/** Replace only API-owned rows for this channel/dataset; manual CSV records survive. */
export const replaceLatestVtSyncDatasetTableRows = async (
 record: Omit<VtSyncDatasetTableRowsRecord, "id" | "provenance">,
): Promise<void> => {
 const id = latestDatasetRecordId(record.channelId, record.datasetId, "table")
 await putVtSyncDatasetTableRows({ ...record, id, provenance: "api" })
 const records = await listVtSyncDatasetTableRows()
 await deleteMany(
  VT_SYNC_LOCAL_STORE_NAMES.datasetTableRows,
  records
   .filter((candidate) => candidate.id !== id
    && candidate.provenance === "api"
    && candidate.datasetId === record.datasetId
    && (candidate.channelId === record.channelId || candidate.channelId === undefined))
   .map((candidate) => candidate.id),
 )
}
