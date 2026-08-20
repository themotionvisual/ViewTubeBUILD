import { VT_SYNC_LOCAL_SNAPSHOT_KEY, type VtSyncSnapshot, type VtSyncVideoItem } from "./contracts"
import { VT_SYNC_TABLE_DEFINITIONS } from "../upstream/tableRegistry"

let memorySnapshot: VtSyncSnapshot | null = null
let snapshotVersion = 0
const snapshotListeners = new Set<() => void>()

export const VT_SYNC_SNAPSHOT_UPDATED_EVENT = "vt_sync_snapshot_updated"

export const getVtSyncSnapshotVersion = (): number => snapshotVersion

export const subscribeToVtSyncSnapshot = (listener: () => void): (() => void) => {
 snapshotListeners.add(listener)
 return () => snapshotListeners.delete(listener)
}

const publishVtSyncSnapshotUpdate = () => {
 snapshotVersion += 1
 snapshotListeners.forEach((listener) => listener())
 window.dispatchEvent(new CustomEvent(VT_SYNC_SNAPSHOT_UPDATED_EVENT, {
  detail: { version: snapshotVersion },
 }))
}

const arrayFields = [
 "videos",
 "dailyMetrics",
 "monthlyMetrics",
 "trafficSources",
 "trafficDetails",
 "searchTerms",
 "demographics",
 "geography",
 "devices",
 "operatingSystems",
 "playbackLocations",
 "subscriptionStatuses",
 "formatSubscriberStatuses",
 "playlistsData",
 "adTypes",
 "cities",
 "provinces",
 "dmaRegions",
 "continentsData",
 "extWebsites",
 "suggestedVideos",
 "hashtags",
 "soundPages",
 "creatorContentTypes",
 "demographicsByAge",
 "demographicsByGender",
 "trafficAdvertising",
 "audienceWatchBehavior",
 "sharingService",
 "newReturningViewers",
 "revenueSource",
 "subscriptionSource",
 "trafficChannelPages",
 "trafficOtherFeatures",
 "trafficSubscriberData",
 "trafficShorts",
 "trafficShortsContentLink",
 "trafficBrowseFeatures",
 "trafficCampaignCard",
 "trafficCard",
 "trafficEndScreen",
 "trafficLiveRedirect",
 "trafficNotification",
 "trafficNoLinkEmbedded",
 "trafficNoLinkOther",
 "trafficPlaylist",
 "trafficYtPlaylistPage",
 "trafficByDay",
 "retentions",
] as const

const readStoredSnapshot = (): VtSyncSnapshot | null => {
 if (typeof window === "undefined") return null
 if (memorySnapshot) return normalizeVtSyncSnapshot(memorySnapshot)
 try {
  const raw = window.localStorage.getItem(VT_SYNC_LOCAL_SNAPSHOT_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw) as Partial<VtSyncSnapshot>
  return parsed && typeof parsed === "object" ? normalizeVtSyncSnapshot(parsed) : null
 } catch {
  return null
 }
}

const normalizeFormattedTableExports = (rawTableExports: unknown): Record<string, unknown[]> => {
 if (!rawTableExports || typeof rawTableExports !== "object") return {}
 const out: Record<string, unknown[]> = {}
 Object.entries(rawTableExports as Record<string, unknown>).forEach(([tableId, value]) => {
  if (Array.isArray(value)) {
   out[tableId] = value
   return
  }
  if (!value || typeof value !== "object") return
  const formatted = value as { headers?: unknown; rows?: unknown }
  const rows = Array.isArray(formatted.rows) ? formatted.rows : []
  const headers = Array.isArray(formatted.headers) ? formatted.headers.map(String) : []
  if (!rows.length) {
   out[tableId] = []
   return
  }
  const table = VT_SYNC_TABLE_DEFINITIONS.find((definition) => definition.id === tableId)
  const keyByHeader = new Map((table?.columns || []).map((column) => [column.label, column.key]))
  out[tableId] = rows.map((row) => {
   if (!Array.isArray(row)) return row as unknown
   const record: Record<string, unknown> = {}
   row.forEach((cell, index) => {
    const header = headers[index] || `column_${index}`
    record[keyByHeader.get(header) || header] = cell
   })
   return record
  })
 })
 return out
}

const normalizeMetricAliases = (row: Record<string, unknown>): Record<string, unknown> => ({
 ...row,
 watchTime: row.watchTime ?? (typeof row.estimatedMinutesWatched === "number" ? row.estimatedMinutesWatched / 60 : undefined),
 avgDuration: row.avgDuration ?? row.averageViewDuration ?? row.avgViewDuration,
 avgPercentageViewed: row.avgPercentageViewed ?? row.averageViewPercentage ?? row.averagePercentageViewed,
 revenue: row.revenue ?? row.estimatedRevenue,
 youtubePremiumRevenue: row.youtubePremiumRevenue ?? row.estimatedRedPartnerRevenue,
})

const placeholderVideosFromUploadRows = (rows: unknown[], runId?: string): VtSyncVideoItem[] =>
 rows
  .map((row) => {
   if (typeof row === "string") return row
   if (!row || typeof row !== "object") return ""
   const record = row as Record<string, unknown>
   return String(record.videoId || record.id || record.video || "")
  })
  .filter(Boolean)
  .map((id) => ({
   id,
   title: "Metadata pending",
   thumbnail: "",
   publishedAt: "",
   format: "unknown",
   category: "Metadata pending",
   tags: [],
   topics: [],
   privacyStatus: "Metadata pending",
   duration: "",
   definition: "",
   caption: "",
   descriptionSnippet: `Upload playlist ID captured for ${id}. Video metadata has not been synced into this snapshot yet.`,
   metrics: {},
   vtSyncPlaceholder: true,
   vtSyncPlaceholderReason: "uploads_playlist_only",
   vtSyncRunId: runId,
  } as VtSyncVideoItem))

const normalizeArrayFieldRows = (field: string, value: unknown): unknown[] => {
 if (!Array.isArray(value)) return []
 return value.flatMap((entry) => {
  if (!entry || typeof entry !== "object") {
   return field === "dailyMetrics" || field === "trafficByDay" ? [] : [entry]
  }
  const row = normalizeMetricAliases(entry as Record<string, unknown>)
  const date = row.date ?? row.day
  const trafficSource = row.term ?? row.source ?? row.sourceType ?? row.insightTrafficSourceType
  if (field === "dailyMetrics") {
   // Daily Stats is a channel-wide day series. Never admit a traffic-source
   // dimension into this store, even when a legacy/import record is mislabeled.
   if (!date || trafficSource) return []
   return [{ ...row, date, avgViewDuration: row.avgViewDuration ?? row.averageViewDuration, averagePercentageViewed: row.averagePercentageViewed ?? row.averageViewPercentage }]
  }
  if (field === "monthlyMetrics") {
   const month = row.date ?? row.month
   if (!month || trafficSource) return []
   return [{ ...row, date: String(month), month: String(row.month ?? month), avgViewDuration: row.avgViewDuration ?? row.averageViewDuration, averagePercentageViewed: row.averagePercentageViewed ?? row.averageViewPercentage }]
  }
  if (field === "trafficByDay") {
   // Traffic × Day always has both dimensions. A channel-wide daily row must
   // not be recoverable through this field.
   if (!date || !trafficSource) return []
   return [{ ...row, day: String(row.day ?? row.date), term: String(trafficSource) }]
  }
  if (field === "devices") return { ...row, device: row.device ?? row.deviceType }
  if (field === "playbackLocations") return { ...row, location: row.location ?? row.insightPlaybackLocationType }
  if (field === "subscriptionStatuses") return { ...row, status: row.status ?? row.subscribedStatus }
  if (field === "formatSubscriberStatuses") return { ...row, formatCode: row.formatCode ?? row.creatorContentType, status: row.status ?? row.subscribedStatus }
  if (field === "demographics") {
    let formattedCohort = row.cohort;
    if (!formattedCohort) {
      const g = row.gender ? String(row.gender).charAt(0).toUpperCase() + String(row.gender).slice(1).toLowerCase() : "";
      const a = row.ageGroup ? String(row.ageGroup).replace("age", "Ages ") : "";
      if (g && a) formattedCohort = `${g === "User_specified" ? "Other" : g} : ${a}`;
      else formattedCohort = `${g === "User_specified" ? "Other" : g} ${a}`.trim();
    }
    return { ...row, cohort: formattedCohort, viewsPct: row.viewsPct ?? row.viewerPercentage, watchTimePct: row.watchTimePct }
  }
  if (field === "demographicsByAge" || field === "demographicsByGender") {
    let formattedCohort = row.cohort ?? row.ageGroup ?? row.gender;
    if (typeof formattedCohort === "string") {
      formattedCohort = formattedCohort.replace("age", "Ages ").replace("user_specified", "Other")
      if (formattedCohort === "male") formattedCohort = "Male"
      if (formattedCohort === "female") formattedCohort = "Female"
    }
    return { ...row, cohort: formattedCohort, viewsPct: row.viewsPct ?? row.viewerPercentage }
  }
  return row
 })
}

const snapshotArrayValue = (raw: Record<string, unknown>, field: string): unknown => {
 const current = raw[field]
 if (Array.isArray(current) && current.length > 0) return current
 if (field === "monthlyMetrics") {
  const legacyMonthly = (raw.tableExports as Record<string, unknown> | undefined)?.monthly_api
  if (Array.isArray(legacyMonthly)) return legacyMonthly
 }
 if (field === "trafficSources") {
  const legacyOverview = raw.trafficOverview ?? raw.traffic_overview
  if (Array.isArray(legacyOverview)) return legacyOverview
 }
 return current ?? (
  field === "extWebsites" ? raw.externalWebsites :
  field === "playlistsData" ? raw.playlists :
  field === "retentions" ? raw.retention :
  undefined
 )
}

const fullRowCountByField = (snapshot: VtSyncSnapshot): Record<string, number> =>
 Object.fromEntries(
  arrayFields.map((field) => [field, Array.isArray(snapshot[field]) ? snapshot[field].length : 0]),
 )

const withCompactPreviewMetadata = (snapshot: VtSyncSnapshot): VtSyncSnapshot => {
 const fullCounts = fullRowCountByField(snapshot)
 const compactSnapshot: VtSyncSnapshot = {
  ...snapshot,
  videos: snapshot.videos.slice(0, 25),
  dailyMetrics: snapshot.dailyMetrics.slice(0, 30),
  monthlyMetrics: snapshot.monthlyMetrics.slice(0, 24),
  trafficSources: snapshot.trafficSources.slice(0, 25),
  trafficDetails: [],
  searchTerms: [],
  demographics: snapshot.demographics.slice(0, 25),
  geography: snapshot.geography.slice(0, 25),
  devices: snapshot.devices.slice(0, 25),
  operatingSystems: snapshot.operatingSystems.slice(0, 25),
  playbackLocations: snapshot.playbackLocations.slice(0, 25),
  subscriptionStatuses: snapshot.subscriptionStatuses.slice(0, 25),
  formatSubscriberStatuses: snapshot.formatSubscriberStatuses.slice(0, 25),
  playlistsData: snapshot.playlistsData.slice(0, 25),
  adTypes: snapshot.adTypes.slice(0, 25),
  cities: [],
  provinces: [],
  dmaRegions: [],
  continentsData: [],
  extWebsites: [],
  suggestedVideos: [],
  hashtags: [],
  soundPages: [],
  creatorContentTypes: [],
  demographicsByAge: [],
  demographicsByGender: [],
  trafficAdvertising: [],
  audienceWatchBehavior: [],
  sharingService: [],
  newReturningViewers: [],
  revenueSource: [],
  subscriptionSource: [],
  trafficChannelPages: [],
  trafficOtherFeatures: [],
  trafficSubscriberData: [],
  trafficShorts: [],
  trafficShortsContentLink: [],
  trafficBrowseFeatures: [],
  trafficCampaignCard: [],
  trafficCard: [],
  trafficEndScreen: [],
  trafficLiveRedirect: [],
  trafficNotification: [],
  trafficNoLinkEmbedded: [],
  trafficNoLinkOther: [],
  trafficPlaylist: [],
  trafficYtPlaylistPage: [],
  trafficByDay: snapshot.trafficByDay.slice(0, 25),
  retentions: [],
  tableExports: {},
 }
 const visibleCounts = fullRowCountByField(compactSnapshot)
 return {
  ...compactSnapshot,
  storageMetadata: {
   storageMode: "compact_preview",
   isCompacted: true,
   fullRowCountByField: fullCounts,
   visiblePreviewRowCountByField: visibleCounts,
   warning: "localStorage contains a compact boot preview; IndexedDB owns complete Analytics table rows.",
  },
  datasetFreshness: {
   ...(snapshot.datasetFreshness || {}),
   storage: {
    runId: snapshot.syncManifest?.run_id || snapshot.snapshotId,
    phase: "browser_storage",
    source: "current_run",
    status: "synced",
    rows: snapshot.videos.length,
    updatedAt: new Date().toISOString(),
    missingMetrics: [],
   },
  },
 }
}

const storageSafeSnapshot = (snapshot: VtSyncSnapshot): VtSyncSnapshot =>
 withCompactPreviewMetadata(snapshot)

export const saveVtSyncSnapshot = (snapshot: VtSyncSnapshot): void => {
 if (typeof window === "undefined") return
 memorySnapshot = normalizeVtSyncSnapshot({
  ...snapshot,
  storageMetadata: {
   storageMode: "full",
   isCompacted: false,
   fullRowCountByField: fullRowCountByField(snapshot),
   visiblePreviewRowCountByField: fullRowCountByField(snapshot),
  },
 })
 // localStorage is a compact boot manifest only. Complete table rows live in
 // IndexedDB; retaining the full in-memory snapshot keeps the active UI lossless
 // without repeatedly attempting writes that are known to exceed browser quota.
 try {
  window.localStorage.setItem(VT_SYNC_LOCAL_SNAPSHOT_KEY, JSON.stringify(storageSafeSnapshot(memorySnapshot)))
 } catch (error) {
  try {
   window.localStorage.removeItem(VT_SYNC_LOCAL_SNAPSHOT_KEY)
   window.localStorage.setItem(VT_SYNC_LOCAL_SNAPSHOT_KEY, JSON.stringify(storageSafeSnapshot(memorySnapshot)))
  } catch (fallbackError) {
   memorySnapshot = normalizeVtSyncSnapshot({
    ...memorySnapshot,
    storageMetadata: {
     ...(memorySnapshot.storageMetadata || {}),
     storageMode: "memory_only",
     isCompacted: false,
    },
   })
   console.warn("Analytics could not persist the compact recovery snapshot; keeping the full snapshot in page memory only.", fallbackError)
  }
 }
 publishVtSyncSnapshotUpdate()
}

const emptySnapshot = (): VtSyncSnapshot => ({
 source: "empty",
 snapshotId: `vt-sync-empty-${Date.now()}`,
 capturedAt: new Date().toISOString(),
 selectedTimeWindow: "lifetime",
 channelName: null,
 channelDescription: null,
 channelCustomUrl: null,
 avatarUrl: null,
 subscriberCount: null,
 channelVideoCount: null,
 channelViewCount: null,
 channelPublishedAt: null,
 channelTotals: null,
 videos: [],
 dailyMetrics: [],
 monthlyMetrics: [],
 trafficSources: [],
 trafficDetails: [],
 searchTerms: [],
 demographics: [],
 geography: [],
 devices: [],
 operatingSystems: [],
 deviceOs: [],
 trafficByDay: [],
 playbackLocations: [],
 subscriptionStatuses: [],
 formatSubscriberStatuses: [],
 playlistsData: [],
 adTypes: [],
 cities: [],
 provinces: [],
 dmaRegions: [],
 continentsData: [],
 extWebsites: [],
 suggestedVideos: [],
 hashtags: [],
 soundPages: [],
 creatorContentTypes: [],
 demographicsByAge: [],
 demographicsByGender: [],
 trafficAdvertising: [],
 audienceWatchBehavior: [],
 sharingService: [],
 newReturningViewers: [],
 revenueSource: [],
 subscriptionSource: [],
 trafficChannelPages: [],
 trafficOtherFeatures: [],
 trafficSubscriberData: [],
 trafficShorts: [],
 trafficShortsContentLink: [],
 trafficBrowseFeatures: [],
 trafficCampaignCard: [],
 trafficCard: [],
 trafficEndScreen: [],
 trafficLiveRedirect: [],
 trafficNotification: [],
 trafficNoLinkEmbedded: [],
 trafficNoLinkOther: [],
 trafficPlaylist: [],
 trafficYtPlaylistPage: [],
 retentions: [],
 syncManifest: null,
 tableExports: {},
 datasetFreshness: {},
 storageMetadata: {
  storageMode: "unknown",
  isCompacted: false,
 },
})

export const normalizeVtSyncSnapshot = (input?: Partial<VtSyncSnapshot> | Record<string, unknown> | null): VtSyncSnapshot => {
 const raw = input && typeof input === "object" ? input as Record<string, unknown> : {}
 const tableExports = normalizeFormattedTableExports(raw.tableExports)
 if (Array.isArray(raw.channelTotalsData)) tableExports.channel_totals = raw.channelTotalsData as unknown[]
 if (Array.isArray(raw.retention)) tableExports.retention = raw.retention as unknown[]

 const base = emptySnapshot()
 const normalized: VtSyncSnapshot = {
  ...base,
  ...raw,
  source: (raw.source === "vt-sync" || raw.source === "viewtubex-cache" || raw.source === "manual" || raw.source === "empty") ? raw.source : "manual",
  snapshotId: typeof raw.snapshotId === "string" && raw.snapshotId ? raw.snapshotId : `vt-sync-import-${Date.now()}`,
  capturedAt: typeof raw.capturedAt === "string" && raw.capturedAt ? raw.capturedAt : new Date().toISOString(),
  channelTotals: (raw.channelTotals || null) as VtSyncSnapshot["channelTotals"],
  syncManifest: (raw.syncManifest || null) as VtSyncSnapshot["syncManifest"],
  tableExports,
  datasetFreshness: (raw.datasetFreshness || {}) as VtSyncSnapshot["datasetFreshness"],
  storageMetadata: (
   raw.storageMetadata && typeof raw.storageMetadata === "object" ?
    raw.storageMetadata
   : {
    storageMode: "unknown",
    isCompacted: false,
   }
  ) as VtSyncSnapshot["storageMetadata"],
 }

 arrayFields.forEach((field) => {
  const value = snapshotArrayValue(raw, field)
  ;(normalized as unknown as Record<string, unknown>)[field] = normalizeArrayFieldRows(field, value)
 })

 const uploadRows = tableExports.uploads_playlist || []
 if (normalized.videos.length === 0 && uploadRows.length > 0) {
  const runId = String(normalized.syncManifest?.run_id || normalized.snapshotId || "")
  normalized.videos = placeholderVideosFromUploadRows(uploadRows, runId)
  normalized.datasetFreshness = {
   ...(normalized.datasetFreshness || {}),
   videos: {
    runId,
    phase: "uploads_playlist",
    source: "placeholder",
    status: "placeholder",
    rows: normalized.videos.length,
    updatedAt: normalized.capturedAt,
    missingMetrics: ["snippet", "contentDetails", "statistics", "youtubeAnalytics"],
   },
   uploads_playlist: {
    runId,
    phase: "uploads_playlist",
    source: normalized.source === "manual" ? "manual_import" : "current_run",
    status: "synced",
    rows: uploadRows.length,
    updatedAt: normalized.capturedAt,
   },
  }
 }

 return normalized
}

export const getVtSyncSnapshot = (input?: Partial<VtSyncSnapshot>): VtSyncSnapshot => {
 const stored = readStoredSnapshot()
 const base = stored || emptySnapshot()
 if (!input) return normalizeVtSyncSnapshot(base)
 return normalizeVtSyncSnapshot({
  ...base,
  ...input,
 })
}

export const toVtSyncRawAppExport = (snapshot: VtSyncSnapshot): Record<string, unknown> => ({
 videos: snapshot.videos,
 dailyMetrics: snapshot.dailyMetrics,
 monthlyMetrics: snapshot.monthlyMetrics,
 trafficSources: snapshot.trafficSources,
 trafficDetails: snapshot.trafficDetails,
 searchTerms: snapshot.searchTerms,
 demographics: snapshot.demographics,
 geography: snapshot.geography,
 devices: snapshot.devices,
 operatingSystems: snapshot.operatingSystems,
 playbackLocations: snapshot.playbackLocations,
 subscriptionStatuses: snapshot.subscriptionStatuses,
 formatSubscriberStatuses: snapshot.formatSubscriberStatuses,
 playlistsData: snapshot.playlistsData,
 adTypes: snapshot.adTypes,
 cities: snapshot.cities,
 provinces: snapshot.provinces,
 extWebsites: snapshot.extWebsites,
 suggestedVideos: snapshot.suggestedVideos,
 hashtags: snapshot.hashtags,
 soundPages: snapshot.soundPages,
 creatorContentTypes: snapshot.creatorContentTypes,
 demographicsByAge: snapshot.demographicsByAge,
 demographicsByGender: snapshot.demographicsByGender,
 trafficAdvertising: snapshot.trafficAdvertising,
 audienceWatchBehavior: snapshot.audienceWatchBehavior,
 revenueSource: snapshot.revenueSource,
 subscriptionSource: snapshot.subscriptionSource,
 newReturningViewers: snapshot.newReturningViewers,
 sharingService: snapshot.sharingService,
 trafficChannelPages: snapshot.trafficChannelPages,
 trafficOtherFeatures: snapshot.trafficOtherFeatures,
 trafficSubscriberData: snapshot.trafficSubscriberData,
 trafficShorts: snapshot.trafficShorts,
 trafficBrowseFeatures: snapshot.trafficBrowseFeatures,
 trafficCampaignCard: snapshot.trafficCampaignCard,
 trafficCard: snapshot.trafficCard,
 trafficEndScreen: snapshot.trafficEndScreen,
 trafficLiveRedirect: snapshot.trafficLiveRedirect,
 trafficNotification: snapshot.trafficNotification,
 trafficNoLinkEmbedded: snapshot.trafficNoLinkEmbedded,
 trafficNoLinkOther: snapshot.trafficNoLinkOther,
 trafficPlaylist: snapshot.trafficPlaylist,
 trafficYtPlaylistPage: snapshot.trafficYtPlaylistPage,
 trafficByDay: snapshot.trafficByDay,
 retentions: snapshot.retentions,
 dmaRegions: snapshot.dmaRegions,
 continentsData: snapshot.continentsData,
 channelTotals: snapshot.channelTotals,
})
