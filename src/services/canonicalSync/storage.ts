import {
 CANONICAL_SYNC_DB_NAME,
 CANONICAL_SYNC_DB_VERSION,
 CANONICAL_SYNC_ENABLED_KEY,
 CANONICAL_SYNC_OWNER_ID_KEY,
 CANONICAL_SYNC_OWNER_MODE_ENABLED_KEY,
 CANONICAL_SYNC_EXPORT_FORMAT_KEY,
 CANONICAL_SYNC_STORE_NAMES,
 CANONICAL_SYNC_VALIDATION_MODE_KEY,
 type CanonicalAudienceSplitRow,
 type CanonicalChannelDailyRow,
 type CanonicalChannelRecord,
 type CanonicalGeographyRow,
 type CanonicalTrafficDiagnosticEntry,
  type CanonicalPlaylistRecord,
 type CanonicalPlaylistWindowSummary,
 type CanonicalRawAuditEntry,
  type CanonicalRetentionSeries,
  type CanonicalSyncOverview,
  type CanonicalSyncRun,
 type CanonicalTrafficRow,
 type CanonicalVideoMetricMetaByWindow,
 type CanonicalVideoRecord,
 type ChannelWindowSummary,
 type ShadowDiffRecord,
} from "./contracts"
import { buildMergeLedger, buildVideoIdentityKey, mergeVideoRecordIdentity } from "./mergeEngine"

const normalizeStoredVideoRecord = (
 record: CanonicalVideoRecord & { id?: string },
): CanonicalVideoRecord => {
 const metricMetaByWindow: CanonicalVideoMetricMetaByWindow = {
  ...(record.metricMetaByWindow || {}),
 }
 const metricsByWindow = Object.fromEntries(
  Object.entries(record.metricsByWindow || {}).map(([window, metrics]) => {
   const normalizedMetrics: Record<string, number | null> = {}
   const normalizedMeta = {
    ...(metricMetaByWindow[window as keyof CanonicalVideoMetricMetaByWindow] || {}),
   }
   Object.entries(metrics || {}).forEach(([metricKey, metricValue]) => {
    if (
     metricValue &&
     typeof metricValue === "object" &&
     "value" in metricValue
    ) {
     const legacyMetric = metricValue as {
      value: number | null
      source?: string
      availability?: string
      reasonCode?: string
      confidence?: string
      syncedAt?: string
     }
     normalizedMetrics[metricKey] = legacyMetric.value ?? null
     normalizedMeta[metricKey] = {
      source: legacyMetric.source || "analytics_api",
      availability: legacyMetric.availability || "pending",
      reasonCode: legacyMetric.reasonCode,
      confidence: legacyMetric.confidence || "raw_direct",
      syncedAt: legacyMetric.syncedAt || record.syncedAt,
     }
     return
    }
    normalizedMetrics[metricKey] =
     typeof metricValue === "number" ? metricValue : metricValue === null ? null : null
   })
   metricMetaByWindow[window as keyof CanonicalVideoMetricMetaByWindow] =
    normalizedMeta
   return [window, normalizedMetrics]
  }),
 ) as CanonicalVideoRecord["metricsByWindow"]

 return {
  ...record,
  identityKey:
   record.identityKey || buildVideoIdentityKey(record.channelId, record.videoId),
  metricsByWindow,
  metricMetaByWindow,
  mergeLedger:
   record.mergeLedger || buildMergeLedger(record.channelId, record.videoId),
 }
}

type StoreName =
 (typeof CANONICAL_SYNC_STORE_NAMES)[keyof typeof CANONICAL_SYNC_STORE_NAMES]

const openCanonicalSyncDb = async (): Promise<IDBDatabase> =>
 new Promise((resolve, reject) => {
  const request = indexedDB.open(
   CANONICAL_SYNC_DB_NAME,
   CANONICAL_SYNC_DB_VERSION,
  )
  request.onupgradeneeded = () => {
   const db = request.result
   Object.values(CANONICAL_SYNC_STORE_NAMES).forEach((storeName) => {
    if (!db.objectStoreNames.contains(storeName)) {
     db.createObjectStore(storeName, { keyPath: "id" })
    }
   })
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
 })

const putRecord = async <T extends Record<string, unknown>>(
 storeName: StoreName,
 record: T,
): Promise<void> => {
 const db = await openCanonicalSyncDb()
 await new Promise<void>((resolve, reject) => {
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  const request = store.put(record)
  request.onsuccess = () => resolve()
  request.onerror = () => reject(request.error)
 })
}

const putMany = async <T extends Record<string, unknown>>(
 storeName: StoreName,
 records: T[],
): Promise<void> => {
 if (records.length === 0) return
 const db = await openCanonicalSyncDb()
 await new Promise<void>((resolve, reject) => {
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  records.forEach((record) => store.put(record))
  tx.oncomplete = () => resolve()
  tx.onerror = () => reject(tx.error)
  tx.onabort = () => reject(tx.error)
 })
}

const getAll = async <T>(storeName: StoreName): Promise<T[]> => {
 const db = await openCanonicalSyncDb()
 return new Promise<T[]>((resolve, reject) => {
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)
  const request = store.getAll()
  request.onsuccess = () => resolve((request.result || []) as T[])
  request.onerror = () => reject(request.error)
 })
}

const getById = async <T>(
 storeName: StoreName,
 id: string,
): Promise<T | null> => {
 const db = await openCanonicalSyncDb()
 return new Promise<T | null>((resolve, reject) => {
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)
  const request = store.get(id)
  request.onsuccess = () => resolve((request.result as T | undefined) || null)
  request.onerror = () => reject(request.error)
 })
}

export const clearCanonicalSyncDb = async (): Promise<void> =>
 new Promise((resolve) => {
  const request = indexedDB.deleteDatabase(CANONICAL_SYNC_DB_NAME)
  request.onsuccess = () => resolve()
  request.onerror = () => resolve()
  request.onblocked = () => resolve()
 })

export const setCanonicalSyncEnabled = (enabled: boolean): void => {
 localStorage.setItem(CANONICAL_SYNC_ENABLED_KEY, enabled ? "1" : "0")
}

export const getCanonicalSyncEnabled = (): boolean =>
 localStorage.getItem(CANONICAL_SYNC_ENABLED_KEY) === "1"

export const setCanonicalSyncValidationMode = (mode: string): void => {
 localStorage.setItem(CANONICAL_SYNC_VALIDATION_MODE_KEY, mode)
}

export const getCanonicalSyncValidationMode = (): string =>
 localStorage.getItem(CANONICAL_SYNC_VALIDATION_MODE_KEY) || "shadow"

export const setCanonicalSyncExportFormat = (format: string): void => {
 localStorage.setItem(CANONICAL_SYNC_EXPORT_FORMAT_KEY, format)
}

export const getCanonicalSyncExportFormat = (): string =>
 localStorage.getItem(CANONICAL_SYNC_EXPORT_FORMAT_KEY) || "csv"

export const setCanonicalOwnerModeEnabled = (enabled: boolean): void => {
 localStorage.setItem(CANONICAL_SYNC_OWNER_MODE_ENABLED_KEY, enabled ? "1" : "0")
}

export const getCanonicalOwnerModeEnabled = (): boolean =>
 localStorage.getItem(CANONICAL_SYNC_OWNER_MODE_ENABLED_KEY) === "1"

export const setCanonicalOwnerId = (ownerId: string): void => {
 const normalized = ownerId.trim()
 if (!normalized) {
  localStorage.removeItem(CANONICAL_SYNC_OWNER_ID_KEY)
  return
 }
 localStorage.setItem(CANONICAL_SYNC_OWNER_ID_KEY, normalized)
}

export const getCanonicalOwnerId = (): string =>
 localStorage.getItem(CANONICAL_SYNC_OWNER_ID_KEY) || ""

export const putCanonicalChannelRecord = async (
 record: CanonicalChannelRecord,
): Promise<void> =>
 putRecord(CANONICAL_SYNC_STORE_NAMES.channelRecords, {
  ...record,
  id: record.channelId,
 })

export const putChannelWindowSummaries = async (
 summaries: ChannelWindowSummary[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.channelWindowSummaries,
  summaries.map((summary) => ({
   ...summary,
   id: summary.period === "previous"
    ? `${summary.channelId}::previous::${summary.window}`
    : `${summary.channelId}::${summary.window}`,
  })),
 )

export const putCanonicalVideoRecords = async (
 records: CanonicalVideoRecord[],
 stage:
  | "video_inventory"
  | "video_metrics"
  | "viewer_cohorts"
  | "owner_mode" = "video_metrics",
 source: "data_api" | "analytics_api" | "owner_api" | "csv" | "derived" = "analytics_api",
): Promise<void> => {
 if (records.length === 0) return
 const existing = await listCanonicalVideoRecords()
 const byId = new Map(existing.map((record) => [record.identityKey, record]))
 await putMany(
  CANONICAL_SYNC_STORE_NAMES.videoRecords,
  records.map((record) => {
   const identityKey = record.identityKey || buildVideoIdentityKey(record.channelId, record.videoId)
   const merged = mergeVideoRecordIdentity(
    byId.get(identityKey) || null,
    {
     ...record,
     identityKey,
     mergeLedger:
      record.mergeLedger || buildMergeLedger(record.channelId, record.videoId),
    },
    stage,
    source,
   )
   return {
    ...merged,
    id: identityKey,
   }
  }),
 )
}

export const replaceCanonicalVideoInventory = async (
 channelId: string,
 records: CanonicalVideoRecord[],
): Promise<void> => {
 const db = await openCanonicalSyncDb()
 await new Promise<void>((resolve, reject) => {
  const tx = db.transaction(CANONICAL_SYNC_STORE_NAMES.videoRecords, "readwrite")
  const store = tx.objectStore(CANONICAL_SYNC_STORE_NAMES.videoRecords)
  const request = store.getAll()

  request.onsuccess = () => {
   const stored = (request.result || []) as Array<CanonicalVideoRecord & { id: string }>
   const existingByIdentity = new Map(
    stored.map((record) => {
     const normalized = normalizeStoredVideoRecord(record)
     return [normalized.identityKey, normalized] as const
    }),
   )
   const incomingIds = new Set(
    records.map((record) => record.identityKey || buildVideoIdentityKey(channelId, record.videoId)),
   )

   stored.forEach((record) => {
    if (record.channelId === channelId && !incomingIds.has(record.id)) store.delete(record.id)
   })

   records.forEach((record) => {
    const identityKey = record.identityKey || buildVideoIdentityKey(channelId, record.videoId)
    const merged = mergeVideoRecordIdentity(
     existingByIdentity.get(identityKey) || null,
     { ...record, channelId, identityKey },
     "video_inventory",
     "data_api",
    )
    store.put({ ...merged, id: identityKey })
   })
  }
  request.onerror = () => reject(request.error)
  tx.oncomplete = () => resolve()
  tx.onerror = () => reject(tx.error)
  tx.onabort = () => reject(tx.error)
 })
}

export const putCanonicalChannelDailyRows = async (
 rows: CanonicalChannelDailyRow[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.channelDailySeries,
  rows.map((row) => ({
   ...row,
   id: `${row.channelId}::${row.date}`,
  })),
 )

export const putCanonicalTrafficRows = async (
 rows: CanonicalTrafficRow[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.trafficRows,
  rows.map((row) => ({
   ...row,
   id: [
    row.datasetKind,
    row.channelId,
    row.source,
    row.entityType,
    row.entityId,
    row.window,
    row.date || "ALL_DATES",
    row.trafficSourceType,
    row.trafficSourceDetail || "ALL",
   ].join("::"),
  })),
 )

export const putCanonicalTrafficDiagnostics = async (
 entries: CanonicalTrafficDiagnosticEntry[],
): Promise<void> => putMany(CANONICAL_SYNC_STORE_NAMES.trafficDiagnostics, entries)

export const putCanonicalRetentionSeries = async (
 series: CanonicalRetentionSeries[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.retentionSeries,
  series.map((entry) => ({
   ...entry,
   id: [
    entry.channelId,
    entry.videoId,
    entry.window,
    entry.filters.audienceType || "all_audience_types",
    entry.filters.subscribedStatus || "all_subscribed_statuses",
    entry.filters.youtubeProduct || "all_products",
   ].join("::"),
  })),
 )

export const putCanonicalPlaylistRecords = async (
 records: CanonicalPlaylistRecord[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.playlistRecords,
  records.map((record) => ({
   ...record,
   id: `${record.channelId}::${record.playlistId}`,
  })),
 )

export const putCanonicalPlaylistWindowSummaries = async (
 summaries: CanonicalPlaylistWindowSummary[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.playlistWindowSummaries,
  summaries.map((summary) => ({
   ...summary,
   id: `${summary.channelId}::${summary.playlistId}::${summary.window}`,
  })),
 )

export const putCanonicalAudienceSplits = async (
 splits: CanonicalAudienceSplitRow[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.audienceSplitRows,
  splits.map((split) => ({
   ...split,
   id: [
    split.channelId,
    split.entityType,
    split.entityId,
    split.window,
    split.splitDimension,
    split.splitKey,
   ].join("::"),
  })),
 )

export const putCanonicalGeographyRows = async (
 rows: CanonicalGeographyRow[],
): Promise<void> =>
 putMany(
  CANONICAL_SYNC_STORE_NAMES.geographyRows,
  rows.map((row) => ({
   ...row,
   id: [
    row.channelId,
    row.entityType,
    row.entityId,
    row.window,
    row.country || "ALL",
    row.province || "ALL",
    row.city || "ALL",
   ].join("::"),
  })),
 )

export const putCanonicalSyncRun = async (
 run: CanonicalSyncRun,
): Promise<void> => putRecord(CANONICAL_SYNC_STORE_NAMES.syncRuns, run)

export const putCanonicalRawAuditEntries = async (
 entries: CanonicalRawAuditEntry[],
): Promise<void> => putMany(CANONICAL_SYNC_STORE_NAMES.rawAudit, entries)

export const putCanonicalShadowDiff = async (
 diff: ShadowDiffRecord,
): Promise<void> => putRecord(CANONICAL_SYNC_STORE_NAMES.shadowDiffs, diff)

export const putCanonicalExportView = async (
 id: string,
 payload: Record<string, unknown>,
): Promise<void> =>
 putRecord(CANONICAL_SYNC_STORE_NAMES.exportViews, {
  id,
  payload,
  createdAt: new Date().toISOString(),
 })

export const listCanonicalChannelRecords = async (): Promise<
 CanonicalChannelRecord[]
> => getAll(CANONICAL_SYNC_STORE_NAMES.channelRecords)

export const listCanonicalVideoRecords = async (
 channelId?: string,
): Promise<CanonicalVideoRecord[]> => {
 const records = await getAll<
  CanonicalVideoRecord & { id: string }
 >(CANONICAL_SYNC_STORE_NAMES.videoRecords)
 const normalizedRecords = records.map(normalizeStoredVideoRecord)
 return channelId
  ? normalizedRecords.filter((record) => record.channelId === channelId)
  : normalizedRecords
}

export const listChannelWindowSummaries = async (
 channelId?: string,
): Promise<ChannelWindowSummary[]> => {
 const summaries = await getAll<
  ChannelWindowSummary & { id: string }
 >(CANONICAL_SYNC_STORE_NAMES.channelWindowSummaries)
 const normalized = summaries.map((summary) => ({
  ...summary,
  period: summary.period || "current" as const,
 }))
 return channelId
  ? normalized.filter((summary) => summary.channelId === channelId)
  : normalized
}

export const listCanonicalChannelDailyRows = async (
 channelId?: string,
): Promise<CanonicalChannelDailyRow[]> => {
 const rows = await getAll<CanonicalChannelDailyRow & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.channelDailySeries,
 )
 return channelId ? rows.filter((row) => row.channelId === channelId) : rows
}

export const listCanonicalTrafficRows = async (
 channelId?: string,
 entityType?: "channel" | "video",
 datasetKind?: CanonicalTrafficRow["datasetKind"],
): Promise<CanonicalTrafficRow[]> => {
 const rows = await getAll<CanonicalTrafficRow & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.trafficRows,
 )
 return rows.filter((row) => {
  if (channelId && row.channelId !== channelId) return false
  if (entityType && row.entityType !== entityType) return false
  if (datasetKind && row.datasetKind !== datasetKind) return false
  return true
 })
}

export const listCanonicalTrafficDiagnostics = async (
 channelId?: string,
): Promise<CanonicalTrafficDiagnosticEntry[]> => {
 const rows = await getAll<CanonicalTrafficDiagnosticEntry & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.trafficDiagnostics,
 )
 return channelId ? rows.filter((row) => row.channelId === channelId) : rows
}

export const listCanonicalRetentionSeries = async (
 channelId?: string,
 videoId?: string,
): Promise<CanonicalRetentionSeries[]> => {
 const series = await getAll<CanonicalRetentionSeries & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.retentionSeries,
 )
 return series.filter((entry) => {
  if (channelId && entry.channelId !== channelId) return false
  if (videoId && entry.videoId !== videoId) return false
  return true
 })
}

export const listCanonicalPlaylistRecords = async (
 channelId?: string,
): Promise<CanonicalPlaylistRecord[]> => {
 const records = await getAll<CanonicalPlaylistRecord & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.playlistRecords,
 )
 return channelId
  ? records.filter((record) => record.channelId === channelId)
  : records
}

export const listCanonicalPlaylistWindowSummaries = async (
 channelId?: string,
): Promise<CanonicalPlaylistWindowSummary[]> => {
 const summaries = await getAll<CanonicalPlaylistWindowSummary & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.playlistWindowSummaries,
 )
 return channelId
  ? summaries.filter((summary) => summary.channelId === channelId)
  : summaries
}

export const listCanonicalAudienceSplits = async (
 channelId?: string,
 entityType?: "channel" | "video",
): Promise<CanonicalAudienceSplitRow[]> => {
 const splits = await getAll<CanonicalAudienceSplitRow & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.audienceSplitRows,
 )
 return splits.filter((entry) => {
  if (channelId && entry.channelId !== channelId) return false
  if (entityType && entry.entityType !== entityType) return false
  return true
 })
}

export const listCanonicalGeographyRows = async (
 channelId?: string,
 entityType?: "channel" | "video",
): Promise<CanonicalGeographyRow[]> => {
 const rows = await getAll<CanonicalGeographyRow & { id: string }>(
  CANONICAL_SYNC_STORE_NAMES.geographyRows,
 )
 return rows.filter((row) => {
  if (channelId && row.channelId !== channelId) return false
  if (entityType && row.entityType !== entityType) return false
  return true
 })
}

export const listCanonicalSyncRuns = async (): Promise<CanonicalSyncRun[]> =>
 getAll(CANONICAL_SYNC_STORE_NAMES.syncRuns)

export const listCanonicalRawAuditEntries = async (
 channelId?: string,
): Promise<CanonicalRawAuditEntry[]> => {
 const entries = await getAll<CanonicalRawAuditEntry>(
  CANONICAL_SYNC_STORE_NAMES.rawAudit,
 )
 return channelId ? entries.filter((entry) => entry.channelId === channelId) : entries
}

export const listCanonicalShadowDiffs = async (
 channelId?: string,
): Promise<ShadowDiffRecord[]> => {
 const diffs = await getAll<ShadowDiffRecord>(
  CANONICAL_SYNC_STORE_NAMES.shadowDiffs,
 )
 return channelId ? diffs.filter((diff) => diff.channelId === channelId) : diffs
}

export const getCanonicalSyncRun = async (
 id: string,
): Promise<CanonicalSyncRun | null> =>
 getById(CANONICAL_SYNC_STORE_NAMES.syncRuns, id)

const STALE_CANONICAL_RUN_MS = 10 * 60 * 1000

const normalizeStaleSyncRuns = async (
 runs: CanonicalSyncRun[],
): Promise<CanonicalSyncRun[]> => {
 const now = Date.now()
 const normalized = await Promise.all(
  runs.map(async (run) => {
   if (run.status !== "running" || run.completedAt) return run
   const startedAt = new Date(run.startedAt).getTime()
   if (!Number.isFinite(startedAt)) return run
   if (now - startedAt < STALE_CANONICAL_RUN_MS) return run
   const nextRun: CanonicalSyncRun = {
    ...run,
    status: "failed",
    completedAt: new Date(startedAt + STALE_CANONICAL_RUN_MS).toISOString(),
    error:
     run.error ||
     "Canonical sync run was interrupted or abandoned before completion.",
   }
   await putCanonicalSyncRun(nextRun)
   return nextRun
  }),
 )
 return normalized
}

export const buildCanonicalSyncOverview = async (): Promise<
 CanonicalSyncOverview
> => {
 const [
  channels,
  channelDailyRows,
  videos,
  playlists,
  trafficRows,
  trafficDiagnostics,
  retentionSeries,
  audienceSplits,
  geographyRows,
  runs,
  diffs,
 ] =
  await Promise.all([
  listCanonicalChannelRecords(),
  listCanonicalChannelDailyRows(),
  listCanonicalVideoRecords(),
  listCanonicalPlaylistRecords(),
  listCanonicalTrafficRows(),
  listCanonicalTrafficDiagnostics(),
  listCanonicalRetentionSeries(),
  listCanonicalAudienceSplits(),
  listCanonicalGeographyRows(),
  listCanonicalSyncRuns(),
  listCanonicalShadowDiffs(),
  ])
 const normalizedRuns = await normalizeStaleSyncRuns(runs)
 const lastRun =
  normalizedRuns.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] || null
 const latestDiff =
  diffs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null
 const hasMetricAcrossWindows = (
  record: CanonicalVideoRecord,
  metricKeys: string[],
 ): boolean =>
  Object.values(record.metricsByWindow || {}).some((metrics) =>
   metricKeys.some(
    (metricKey) =>
     typeof metrics?.[metricKey] === "number" &&
     Number.isFinite(metrics[metricKey] as number),
   ),
  )
 const videoMetricsCount = videos.filter((record) =>
  hasMetricAcrossWindows(record, [
   "views",
   "estimatedMinutesWatched",
   "likes",
   "comments",
   "shares",
   "estimatedRevenue",
   "engagedViews",
  ]),
 ).length
 const revenueMetricsCount = videos.filter((record) =>
  hasMetricAcrossWindows(record, [
   "estimatedRevenue",
   "estimatedAdRevenue",
   "estimatedYouTubePremiumRevenue",
   "cpm",
   "playbackBasedCpm",
   "adImpressions",
   "monetizedPlaybacks",
  ]),
 ).length
 const viewerCohortsCount = videos.filter((record) =>
  hasMetricAcrossWindows(record, [
   "uniqueViewers",
   "averageViewsPerViewer",
   "uniqueReach",
   "newViewers",
   "returningViewers",
   "casualViewers",
   "regularViewers",
  ]),
 ).length
 const ownerReachCount = videos.filter((record) =>
  hasMetricAcrossWindows(record, [
   "videoThumbnailImpressions",
   "videoThumbnailImpressionsClickRate",
  ]),
 ).length
 return {
  enabled: getCanonicalSyncEnabled(),
  ownerModeEnabled: getCanonicalOwnerModeEnabled(),
  channelCount: channels.length,
  videoCount: videos.length,
  playlistCount: playlists.length,
  channelDailyRowCount: channelDailyRows.length,
  trafficRowCount: trafficRows.length,
  trafficDiagnosticCount: trafficDiagnostics.length,
  retentionSeriesCount: retentionSeries.length,
  audienceSplitCount: audienceSplits.length,
  geographyRowCount: geographyRows.length,
  metricCoverage: {
   videoMetricsCount,
   revenueMetricsCount,
   viewerCohortsCount,
   ownerReachCount,
  },
  lastRun,
  latestDiff,
  channels,
 }
}
