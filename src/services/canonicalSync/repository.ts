import JSZip from "jszip"
import { rowsToCsv } from "../dataExport"
import type {
 AnalyticsWindow,
 CanonicalMetricContract,
 CanonicalTrafficBackfillResult,
 CanonicalTrafficDataset,
 CanonicalTrafficDiagnosticEntry,
 CanonicalTrafficMergeResult,
 CanonicalTrafficSyncResult,
 CanonicalAudienceSplitRow,
 CanonicalChannelDailyRow,
 CanonicalGeographyRow,
 CanonicalSyncOverview,
 CanonicalSyncRun,
 CanonicalSyncStage,
 CanonicalTrafficRow,
 CanonicalTrafficVisualDataset,
 CanonicalVideoRecord,
 VideoCatalogExportRow,
} from "./contracts"
import { CANONICAL_METRIC_CONTRACTS } from "./contracts"
import type { CanonicalBundleManifest } from "./presentation"
import {
 buildCanonicalSyncOverview,
 getCanonicalOwnerModeEnabled,
 listCanonicalAudienceSplits,
 listCanonicalChannelDailyRows,
 listCanonicalChannelRecords,
 listCanonicalGeographyRows,
 listCanonicalPlaylistRecords,
 listCanonicalPlaylistWindowSummaries,
 listCanonicalRawAuditEntries,
 listCanonicalRetentionSeries,
 listCanonicalShadowDiffs,
 listCanonicalSyncRuns,
 listCanonicalTrafficRows,
 listCanonicalTrafficDiagnostics,
 listCanonicalVideoRecords,
 listChannelWindowSummaries,
 putCanonicalAudienceSplits,
 putCanonicalChannelDailyRows,
  putCanonicalChannelRecord,
  putCanonicalExportView,
 putCanonicalGeographyRows,
  putCanonicalPlaylistRecords,
  putCanonicalPlaylistWindowSummaries,
  putCanonicalRawAuditEntries,
  putCanonicalRetentionSeries,
  putCanonicalShadowDiff,
  putCanonicalSyncRun,
 putCanonicalTrafficRows,
 putCanonicalTrafficDiagnostics,
  putCanonicalVideoRecords,
  putChannelWindowSummaries,
  setCanonicalSyncEnabled,
} from "./storage"
import { syncChannelBootstrap } from "./channelBootstrapSync"
import { syncChannelDailySeries } from "./channelDailySync"
import { syncChannelWindowSummaries } from "./channelWindowSync"
import { syncVideoInventory } from "./videoInventorySync"
import { syncVideoMetrics } from "./videoMetricsSync"
import { syncOwnerModeReach } from "./ownerModeSync"
import { syncPlaylists } from "./playlistSync"
import { syncRetentionSeries } from "./retentionSync"
import { buildShadowDiff } from "./shadowValidation"
import { syncViewerCohorts } from "./viewerCohortSync"
import { syncTrafficRows } from "./trafficSync"
import { syncAudienceSegmentRows } from "./audienceSegmentSync"
import { syncDemographicRows } from "./demographicSync"
import { syncGeographyRows } from "./geographySync"
import { syncRevenueMetrics } from "./revenueSync"
import { buildCanonicalPresentationDatasetFromRecords } from "./presentation"
import { getWindowRange } from "./query"
import {
 buildCanonicalTrafficCoverageSummary,
 buildCanonicalTrafficDatasetFromRows,
 buildCanonicalTrafficVisualDatasetFromRows,
} from "./trafficPresentation"
import { mergeTrafficCsvFiles } from "./trafficCsvMerge"
import { syncTrafficAnalytics } from "../youtube/trafficAnalyticsSync"

const buildSyncRun = (
 channelId = "pending",
 windows: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"],
): CanonicalSyncRun => ({
 id: `canonical-sync::${new Date().toISOString()}`,
 channelId,
 startedAt: new Date().toISOString(),
 status: "running",
 videoCount: 0,
 windows,
 stageStatus: {
  channel_bootstrap: "pending",
  channel_window: "pending",
  channel_daily: "pending",
  video_inventory: "pending",
  video_metrics: "pending",
  viewer_cohorts: "pending",
  traffic_sync: "pending",
  audience_segments: "pending",
  demographics_sync: "pending",
  geography_sync: "pending",
  playlist_sync: "pending",
  owner_mode: "pending",
  retention_sync: "pending",
  shadow_diff: "pending",
 },
})

const buildFamilySyncRun = (
 channelId = "pending",
 windows: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"],
 stageStatus: CanonicalSyncRun["stageStatus"],
): CanonicalSyncRun => ({
 id: `canonical-sync::${new Date().toISOString()}`,
 channelId,
 startedAt: new Date().toISOString(),
 status: "running",
 videoCount: 0,
 windows,
 stageStatus,
})

const sortVideosNewestFirst = (
 records: CanonicalVideoRecord[],
): CanonicalVideoRecord[] =>
 records
  .slice()
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))

const ensureCanonicalChannelBootstrap = async (
 syncRunId: string,
 options: { includeChannelWindows?: boolean } = {},
): Promise<{
 channel: Awaited<ReturnType<typeof syncChannelBootstrap>>["channel"]
}> => {
 const existingChannels = await listCanonicalChannelRecords()
 const existing = existingChannels[0]
 if (existing) {
  if (options.includeChannelWindows) {
   const summaries = await listChannelWindowSummaries(existing.channelId)
   if (summaries.length === 0) {
    const channelWindows = await syncChannelWindowSummaries(
     existing.channelId,
     syncRunId,
     existing.publishedAt || undefined,
    )
    await putChannelWindowSummaries(channelWindows.summaries)
    await putCanonicalRawAuditEntries(channelWindows.audit)
   }
  }
  return { channel: existing }
 }

 const bootstrap = await syncChannelBootstrap(syncRunId)
 await putCanonicalChannelRecord(bootstrap.channel)
 await putCanonicalRawAuditEntries([bootstrap.audit])
 if (options.includeChannelWindows) {
  const channelWindows = await syncChannelWindowSummaries(
   bootstrap.channel.channelId,
   syncRunId,
   bootstrap.channel.publishedAt || undefined,
  )
  await putChannelWindowSummaries(channelWindows.summaries)
  await putCanonicalRawAuditEntries(channelWindows.audit)
 }
 return { channel: bootstrap.channel }
}

export const runCanonicalBootstrapSync = async (): Promise<{
 overview: CanonicalSyncOverview
 channelWindowSummaries: Awaited<ReturnType<typeof listChannelWindowSummaries>>
}> => {
 setCanonicalSyncEnabled(true)
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d"], {
  channel_bootstrap: "pending",
  channel_window: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id, {
   includeChannelWindows: true,
  })
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: {
    ...syncRun.stageStatus,
    channel_bootstrap: "complete",
    channel_window: "complete",
   },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  const [overview, channelWindowSummaries] = await Promise.all([
   buildCanonicalSyncOverview(),
   listChannelWindowSummaries(channel.channelId),
  ])
  return { overview, channelWindowSummaries }
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
 throw error
 }
}

const stageStatusFromOverview = (
 overview: CanonicalSyncOverview | null,
): Partial<Record<CanonicalSyncStage, "pending" | "complete" | "failed">> => ({
 channel_bootstrap: Number(overview?.channelCount || 0) > 0 ? "complete" : "pending",
 channel_window: Number(overview?.channelCount || 0) > 0 ? "complete" : "pending",
 channel_daily:
  Number(overview?.channelDailyRowCount || 0) > 0 ? "complete" : "pending",
 video_inventory: Number(overview?.videoCount || 0) > 0 ? "complete" : "pending",
 video_metrics:
  Number(overview?.metricCoverage.videoMetricsCount || 0) > 0
   ? "complete"
   : "pending",
 viewer_cohorts:
  Number(overview?.metricCoverage.viewerCohortsCount || 0) > 0
   ? "complete"
   : "pending",
 traffic_sync:
  Number(overview?.trafficRowCount || 0) > 0 ? "complete" : "pending",
 audience_segments:
  Number(overview?.audienceSplitCount || 0) > 0 ? "complete" : "pending",
 demographics_sync:
  Number(overview?.audienceSplitCount || 0) > 0 ? "complete" : "pending",
 geography_sync:
  Number(overview?.geographyRowCount || 0) > 0 ? "complete" : "pending",
 playlist_sync:
  Number(overview?.playlistCount || 0) > 0 ? "complete" : "pending",
 owner_mode:
  Number(overview?.metricCoverage.ownerReachCount || 0) > 0
   ? "complete"
   : "pending",
 retention_sync:
  Number(overview?.retentionSeriesCount || 0) > 0 ? "complete" : "pending",
 shadow_diff: overview?.latestDiff ? "complete" : "pending",
})

export const runCanonicalPhaseOneSync = async (): Promise<CanonicalSyncOverview> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d"], {
  channel_bootstrap: "pending",
  channel_window: "pending",
  channel_daily: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id, {
   includeChannelWindows: true,
  })
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: {
    ...syncRun.stageStatus,
    channel_bootstrap: "complete",
    channel_window: "complete",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const daily = await syncChannelDailySeries(
   channel.channelId,
   syncRun.id,
   channel.publishedAt || undefined,
  )
  await putCanonicalChannelDailyRows(daily.rows)
  await putCanonicalRawAuditEntries(daily.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, channel_daily: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalPhaseTwoSync = async (): Promise<CanonicalSyncOverview> => {
 const previousOverview = await buildCanonicalSyncOverview()
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d"], {
  ...stageStatusFromOverview(previousOverview),
  channel_bootstrap: "pending",
  channel_window: "pending",
  video_inventory: "pending",
  video_metrics: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id, {
   includeChannelWindows: true,
  })
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: {
    ...syncRun.stageStatus,
    channel_bootstrap: "complete",
    channel_window: "complete",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const inventory = await syncVideoInventory(channel.channelId, syncRun.id)
  await putCanonicalVideoRecords(inventory.records, "video_inventory", "data_api")
  await putCanonicalRawAuditEntries(inventory.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.records.length,
   stageStatus: { ...syncRun.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const metrics = await syncVideoMetrics(channel.channelId, inventory.records, syncRun.id)
  await putCanonicalVideoRecords(metrics.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(metrics.audit)
  syncRun = {
   ...syncRun,
   videoCount: metrics.records.length,
   stageStatus: { ...syncRun.stageStatus, video_metrics: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalPhaseThreeSync = async (): Promise<CanonicalSyncOverview> => {
 const previousOverview = await buildCanonicalSyncOverview()
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d", "7d"], {
  ...stageStatusFromOverview(previousOverview),
  channel_bootstrap: "pending",
  viewer_cohorts: "pending",
  traffic_sync: "pending",
  audience_segments: "pending",
  demographics_sync: "pending",
  geography_sync: "pending",
  playlist_sync: "pending",
  owner_mode: "pending",
  retention_sync: "pending",
  shadow_diff: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id, {
   includeChannelWindows: true,
  })
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: {
    ...syncRun.stageStatus,
    channel_bootstrap: "complete",
    channel_window: "complete",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const inventory = await ensureCanonicalInventory(channel.channelId, syncRun.id, {
   forceRefresh: false,
  })
  syncRun = {
   ...syncRun,
   videoCount: inventory.length,
   stageStatus: { ...syncRun.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  let metricRecords = inventory
  if (Number(previousOverview.metricCoverage.videoMetricsCount || 0) <= 0) {
   const metrics = await syncVideoMetrics(channel.channelId, inventory, syncRun.id)
   await putCanonicalVideoRecords(metrics.records, "video_metrics", "analytics_api")
   await putCanonicalRawAuditEntries(metrics.audit)
   metricRecords = metrics.records
  }

  const revenue = await syncRevenueMetrics(channel.channelId, metricRecords, syncRun.id)
  await putCanonicalVideoRecords(revenue.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(revenue.audit)
  syncRun = {
   ...syncRun,
   videoCount: revenue.records.length,
   stageStatus: { ...syncRun.stageStatus, video_metrics: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const cohorts = await syncViewerCohorts(channel.channelId, revenue.records, syncRun.id)
  await putCanonicalVideoRecords(cohorts.records, "viewer_cohorts", "analytics_api")
  await putCanonicalRawAuditEntries(cohorts.audit)
  syncRun = {
   ...syncRun,
   videoCount: cohorts.records.length,
   stageStatus: { ...syncRun.stageStatus, viewer_cohorts: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const ownerMode = await syncOwnerModeReach(channel.channelId, cohorts.records, syncRun.id)
  await putCanonicalVideoRecords(ownerMode.records, "owner_mode", "owner_api")
  await putCanonicalRawAuditEntries(ownerMode.audit)
  syncRun = {
   ...syncRun,
   videoCount: ownerMode.records.length,
   stageStatus: {
    ...syncRun.stageStatus,
    owner_mode: getCanonicalOwnerModeEnabled() ? "complete" : "failed",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const traffic = await syncTrafficRows(channel.channelId, ownerMode.records, syncRun.id)
  await putCanonicalTrafficRows(traffic.rows)
  await putCanonicalTrafficDiagnostics(traffic.diagnostics)
  await putCanonicalRawAuditEntries(traffic.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, traffic_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const audience = await syncAudienceSegmentRows(
   channel.channelId,
   ownerMode.records,
   syncRun.id,
  )
  await putCanonicalAudienceSplits(audience.rows)
  await putCanonicalRawAuditEntries(audience.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, audience_segments: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const demographics = await syncDemographicRows(
   channel.channelId,
   ownerMode.records,
   syncRun.id,
  )
  await putCanonicalAudienceSplits(demographics.rows)
  await putCanonicalRawAuditEntries(demographics.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, demographics_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const geography = await syncGeographyRows(channel.channelId, ownerMode.records, syncRun.id)
  await putCanonicalGeographyRows(geography.rows)
  await putCanonicalRawAuditEntries(geography.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, geography_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const playlists = await syncPlaylists(channel.channelId, syncRun.id)
  await putCanonicalPlaylistRecords(playlists.playlists)
  await putCanonicalPlaylistWindowSummaries(playlists.summaries)
  await putCanonicalRawAuditEntries(playlists.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, playlist_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const retentionTargets = buildRetentionTargetVideoIds(ownerMode.records)
  if (retentionTargets.length > 0) {
   const retention = await syncRetentionSeries(
    channel.channelId,
    retentionTargets,
    syncRun.id,
   )
   await putCanonicalRetentionSeries(retention.series)
   await putCanonicalRawAuditEntries(retention.audit)
  }
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, retention_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const diff = buildShadowDiff(channel.channelId, ownerMode.records)
  await putCanonicalShadowDiff(diff)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, shadow_diff: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

const ensureCanonicalInventory = async (
 channelId: string,
 syncRunId: string,
 options: { forceRefresh?: boolean; limit?: number } = {},
): Promise<CanonicalVideoRecord[]> => {
 let records =
  options.forceRefresh ? [] : await listCanonicalVideoRecords(channelId)
 if (records.length === 0) {
  const inventory = await syncVideoInventory(channelId, syncRunId)
  await putCanonicalVideoRecords(inventory.records, "video_inventory", "data_api")
  await putCanonicalRawAuditEntries(inventory.audit)
  records = inventory.records
 }
 const sorted = sortVideosNewestFirst(records)
 return typeof options.limit === "number" ? sorted.slice(0, options.limit) : sorted
}

const finalizeFamilySyncRun = async (
 syncRun: CanonicalSyncRun,
 status: CanonicalSyncRun["status"],
 error?: string,
) => {
 await putCanonicalSyncRun({
  ...syncRun,
  completedAt: new Date().toISOString(),
  status,
  error,
 })
}

const latestValue = (
 record: CanonicalVideoRecord,
 window: AnalyticsWindow,
 metricKey: string,
): number | null => record.metricsByWindow?.[window]?.[metricKey] ?? null

const latestMetricMeta = (
 record: CanonicalVideoRecord,
 window: AnalyticsWindow,
 metricKey: string,
) => record.metricMetaByWindow?.[window]?.[metricKey] || null

const buildRetentionTargetVideoIds = (
 records: CanonicalVideoRecord[],
): string[] => {
 const newestFirst = records
  .slice()
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
 const shorts = newestFirst.filter((record) => record.isShort)
 const longForm = newestFirst.filter((record) => !record.isShort)
 const byViews = (left: CanonicalVideoRecord, right: CanonicalVideoRecord) =>
  (latestValue(right, "lifetime", "views") || latestValue(right, "365d", "views") || 0) -
  (latestValue(left, "lifetime", "views") || latestValue(left, "365d", "views") || 0)
 const orderedTargets = [
  ...longForm.slice(0, 25),
  ...shorts.slice(0, 25),
  ...longForm.slice().sort(byViews).slice(0, 10),
  ...shorts.slice().sort(byViews).slice(0, 10),
 ]
 return Array.from(new Set(orderedTargets.map((record) => record.videoId)))
}

const toExportRows = (records: CanonicalVideoRecord[]): VideoCatalogExportRow[] =>
 records.map((record) => ({
  videoId: record.videoId,
  title: record.title,
  description: record.description,
  publishedAt: record.publishedAt,
  thumbnail: record.thumbnail,
  mediumThumbnail: record.thumbnails.medium?.url || "",
  maxresThumbnail: record.thumbnails.maxres?.url || "",
  tags: record.tags.join(" | "),
  categoryId: record.categoryId || "",
  categoryName: record.categoryName || "",
  defaultLanguage: record.defaultLanguage || "",
  privacyStatus: record.privacyStatus || "",
  uploadStatus: record.uploadStatus || "",
  definition: record.definition || "",
  dimension: record.dimension || "",
  durationSeconds: record.durationSeconds,
  creatorContentType: record.creatorContentType || "",
  format: record.format,
  isShort: record.isShort,
  lifetimeViews: latestValue(record, "lifetime", "views"),
  lifetimeLikes: latestValue(record, "lifetime", "likes"),
  lifetimeComments: latestValue(record, "lifetime", "comments"),
  lifetimeRevenue: latestValue(record, "lifetime", "estimatedRevenue"),
  window365dViews: latestValue(record, "365d", "views"),
  window90dViews: latestValue(record, "90d", "views"),
  window28dViews: latestValue(record, "28d", "views"),
  window28dUniqueViewers: latestValue(record, "28d", "uniqueViewers"),
  window90dUniqueViewers: latestValue(record, "90d", "uniqueViewers"),
  window28dWatchHours:
   latestValue(record, "28d", "estimatedMinutesWatched") === null
    ? null
    : Number(latestValue(record, "28d", "estimatedMinutesWatched")) / 60,
  window28dRevenue: latestValue(record, "28d", "estimatedRevenue"),
  window28dEngagedViews: latestValue(record, "28d", "engagedViews"),
 }))

const triggerDownload = (filename: string, content: string, mimeType: string) => {
 const blob = new Blob([content], { type: mimeType })
 const url = URL.createObjectURL(blob)
 const anchor = document.createElement("a")
 anchor.href = url
 anchor.download = filename
 document.body.appendChild(anchor)
 anchor.click()
 anchor.remove()
 URL.revokeObjectURL(url)
}

export const buildVideoMetricRows = (
 records: CanonicalVideoRecord[],
 window: AnalyticsWindow,
): Record<string, unknown>[] => {
 const LONG_FORM_ONLY_METRICS = new Set([
  "videoThumbnailImpressions",
  "videoThumbnailImpressionsClickRate",
  "cpm",
  "cardImpressions",
  "cardClicks",
  "cardClickRate",
  "cardTeaserImpressions",
  "cardTeaserClicks",
  "cardTeaserClickRate",
  "endScreenElementImpressions",
  "endScreenElementClicks",
  "endScreenElementClickRate",
  "audienceWatchRatio",
  "relativeRetentionPerformance",
  "startedWatching",
  "stoppedWatching",
  "totalSegmentImpressions",
 ])
 const EXPORT_ONLY_DERIVED_METRICS = [
  "watchHours",
  "youtubePremiumWatchHours",
  "likesVsDislikesPercent",
  "netSubscribers",
  "engagementRate",
 ] as const
 const CONTRACT_EXPORT_METRICS = Array.from(
  new Set(
   CANONICAL_METRIC_CONTRACTS.filter(
    (metric: CanonicalMetricContract) =>
     metric.metricKey !== "creatorContentType" &&
     metric.supportedWindows.includes(window) &&
     (metric.scope === "video" || metric.scope === "owner_only"),
   ).map((metric: CanonicalMetricContract) => metric.metricKey),
  ),
 )
 const METRIC_KEY_ALIASES: Record<string, string[]> = {
  estimatedYouTubePremiumRevenue: [
   "estimatedYouTubePremiumRevenue",
   "estimatedRedPartnerRevenue",
  ],
 }
 const RAW_TO_EXPORT_METRIC_KEY: Record<string, string> = {
  estimatedRedPartnerRevenue: "estimatedYouTubePremiumRevenue",
 }
 const BASE_VIDEO_COLUMNS = [
  "videoId",
  "title",
  "format",
  "creatorContentType",
  "categoryName",
  "publishedAt",
 ] as const
 const getMetricValue = (
  record: CanonicalVideoRecord,
  metricKey: string,
 ): number | null => {
  const aliases = METRIC_KEY_ALIASES[metricKey] || [metricKey]
  for (const alias of aliases) {
   const value = record.metricsByWindow?.[window]?.[alias]
   if (typeof value === "number") return value
  }
  return null
 }
 const roundMetric = (value: number | null, digits = 3): number | null => {
  if (value === null || !Number.isFinite(value)) return null
  return Number(value.toFixed(digits))
 }
 const deriveMetricValue = (
  record: CanonicalVideoRecord,
  metricKey: string,
 ): number | null => {
  const direct = getMetricValue(record, metricKey)
  if (direct !== null) return direct
  const views = getMetricValue(record, "views")
  const likes = getMetricValue(record, "likes")
  const dislikes = getMetricValue(record, "dislikes")
  const comments = getMetricValue(record, "comments")
  const shares = getMetricValue(record, "shares")
  const estimatedRevenue = getMetricValue(record, "estimatedRevenue")
  const estimatedMinutesWatched = getMetricValue(record, "estimatedMinutesWatched")
  const estimatedRedMinutesWatched = getMetricValue(record, "estimatedRedMinutesWatched")
  const subscribersGained = getMetricValue(record, "subscribersGained")
  const subscribersLost = getMetricValue(record, "subscribersLost")
  switch (metricKey) {
   case "watchHours":
    return roundMetric(
     estimatedMinutesWatched === null ? null : estimatedMinutesWatched / 60,
    )
   case "youtubePremiumWatchHours":
    return roundMetric(
     estimatedRedMinutesWatched === null ? null : estimatedRedMinutesWatched / 60,
    )
   case "rpm":
    return views && estimatedRevenue !== null && views > 0
     ? roundMetric((estimatedRevenue / views) * 1000)
     : null
   case "likesVsDislikesPercent":
    return likes !== null && dislikes !== null && likes + dislikes > 0
     ? roundMetric((likes / (likes + dislikes)) * 100, 2)
     : null
   case "netSubscribers":
    return subscribersGained !== null && subscribersLost !== null
     ? subscribersGained - subscribersLost
     : null
   case "engagementRate":
    return views && likes !== null && comments !== null && shares !== null && views > 0
     ? roundMetric(((likes + comments + shares) / views) * 100, 2)
     : null
   default:
    return null
  }
 }
 const metricKeys = Array.from(
  records.reduce((set, record) => {
   Object.keys(record.metricsByWindow?.[window] || {}).forEach((metricKey) => {
    set.add(RAW_TO_EXPORT_METRIC_KEY[metricKey] || metricKey)
   })
   CONTRACT_EXPORT_METRICS.forEach((metricKey) => set.add(metricKey))
   EXPORT_ONLY_DERIVED_METRICS.forEach((metricKey) => set.add(metricKey))
   return set
  }, new Set<string>()),
 ).sort((left, right) => {
  const leftLongOnly = LONG_FORM_ONLY_METRICS.has(left)
  const rightLongOnly = LONG_FORM_ONLY_METRICS.has(right)
  if (leftLongOnly !== rightLongOnly) return leftLongOnly ? 1 : -1
  return left.localeCompare(right)
 })
 return records.map((record) => {
  const row: Record<string, unknown> = {
   videoId: record.videoId,
   title: record.title,
   format: record.format,
   creatorContentType: record.creatorContentType || "",
   categoryName: record.categoryName || "",
   publishedAt: record.publishedAt,
  }
  metricKeys.forEach((metricKey) => {
   row[metricKey] = deriveMetricValue(record, metricKey)
  })
  const orderedRow: Record<string, unknown> = {}
  BASE_VIDEO_COLUMNS.forEach((columnKey) => {
   orderedRow[columnKey] = row[columnKey]
  })
  metricKeys.forEach((metricKey) => {
   orderedRow[metricKey] = row[metricKey]
  })
  return orderedRow
 })
}

const COHORT_METRICS = [
 "uniqueViewers",
 "averageViewsPerViewer",
 "uniqueReach",
 "newViewers",
 "returningViewers",
 "casualViewers",
 "regularViewers",
] as const

const buildViewerCohortRows = (
 records: CanonicalVideoRecord[],
 window: Extract<AnalyticsWindow, "7d" | "28d" | "90d">,
): Record<string, unknown>[] =>
 records.map((record) => {
  const row: Record<string, unknown> = {
   videoId: record.videoId,
   title: record.title,
   format: record.format,
   creatorContentType: record.creatorContentType || "",
   publishedAt: record.publishedAt,
  }
  COHORT_METRICS.forEach((metricKey) => {
   row[metricKey] = latestValue(record, window, metricKey)
   row[`${metricKey}_availability`] =
    latestMetricMeta(record, window, metricKey)?.availability || "pending"
   row[`${metricKey}_reason`] =
    latestMetricMeta(record, window, metricKey)?.reasonCode || ""
  })
  return row
 })

const buildChannelDailyRows = (
 rows: CanonicalChannelDailyRow[],
): Record<string, unknown>[] =>
 rows.map((row) => ({
  channelId: row.channelId,
  date: row.date,
  ...row.metrics,
 }))

const buildTrafficCsvRows = (rows: CanonicalTrafficRow[]): Record<string, unknown>[] =>
 rows.map((row) => ({
  channelId: row.channelId,
  datasetKind: row.datasetKind,
  source: row.source,
  entityType: row.entityType,
  entityId: row.entityId,
  window: row.window,
  date: row.date || "",
  trafficSourceType: row.trafficSourceType,
  trafficSourceDetail: row.trafficSourceDetail || "",
  sourceLabel: row.sourceLabel || "",
  sourceTitle: row.sourceTitle || "",
  sourceVideoId: row.sourceVideoId || "",
  ...row.metrics,
 }))

const buildTrafficDiagnosticRows = (
 rows: CanonicalTrafficDiagnosticEntry[],
): Record<string, unknown>[] =>
 rows.map((row) => ({
  channelId: row.channelId,
  source: row.source,
  window: row.window || "",
  datasetKind: row.datasetKind || "",
  code: row.code,
  severity: row.severity,
  message: row.message,
  packageName: row.packageName || "",
  fileName: row.fileName || "",
  memberRole: row.memberRole || "",
  trafficSourceType: row.trafficSourceType || "",
  requestShape: row.requestShape || "",
  reason: row.reason || "",
  createdAt: row.createdAt,
 }))

const buildAudienceSplitCsvRows = (
 rows: CanonicalAudienceSplitRow[],
): Record<string, unknown>[] =>
 rows.map((row) => ({
  channelId: row.channelId,
  entityType: row.entityType,
  entityId: row.entityId,
  window: row.window,
  splitDimension: row.splitDimension,
  splitKey: row.splitKey,
  ...row.metrics,
 }))

const buildGeographyCsvRows = (
 rows: CanonicalGeographyRow[],
): Record<string, unknown>[] =>
 rows.map((row) => ({
  channelId: row.channelId,
  entityType: row.entityType,
  entityId: row.entityId,
  window: row.window,
  country: row.country,
  province: row.province || "",
  city: row.city || "",
  ...row.metrics,
 }))

const buildRetentionPointRows = (
 retentionSeries: Awaited<ReturnType<typeof listCanonicalRetentionSeries>>,
): Record<string, unknown>[] =>
 retentionSeries.flatMap((series) =>
  series.points.map((point, index) => ({
   channelId: series.channelId,
   videoId: series.videoId,
   window: series.window,
   pointIndex: index + 1,
   elapsedVideoTimeRatio: point.elapsedVideoTimeRatio,
   audienceType: series.filters.audienceType || "ALL",
   subscribedStatus: series.filters.subscribedStatus || "ALL",
   youtubeProduct: series.filters.youtubeProduct || "ALL",
   audienceWatchRatio: point.audienceWatchRatio.value,
   relativeRetentionPerformance: point.relativeRetentionPerformance.value,
   startedWatching: point.startedWatching.value,
   stoppedWatching: point.stoppedWatching.value,
   totalSegmentImpressions: point.totalSegmentImpressions.value,
  })),
 )

const triggerBlobDownload = (filename: string, blob: Blob) => {
 const url = URL.createObjectURL(blob)
 const anchor = document.createElement("a")
 anchor.href = url
 anchor.download = filename
 document.body.appendChild(anchor)
 anchor.click()
 anchor.remove()
 URL.revokeObjectURL(url)
}

export const buildCanonicalTrafficDataset = async (
 channelId?: string,
): Promise<CanonicalTrafficDataset> => {
 const [rows, diagnostics] = await Promise.all([
  listCanonicalTrafficRows(channelId),
  listCanonicalTrafficDiagnostics(channelId),
 ])
 return buildCanonicalTrafficDatasetFromRows(rows, diagnostics)
}

export const buildCanonicalTrafficVisualDataset = async (
 channelId?: string,
): Promise<CanonicalTrafficVisualDataset> => {
 const dataset = await buildCanonicalTrafficDataset(channelId)
 return buildCanonicalTrafficVisualDatasetFromRows(dataset.rows, dataset.dictionary)
}

export const runCanonicalTrafficSync = async (
 channelId?: string,
 options: { recordLimit?: number } = {},
): Promise<CanonicalTrafficSyncResult> => {
 const resolvedChannelId =
  channelId || (await ensureCanonicalChannelBootstrap(`canonical-traffic-bootstrap::${new Date().toISOString()}`)).channel.channelId
 const videos = await ensureCanonicalInventory(
  resolvedChannelId,
  `canonical-traffic-inventory::${new Date().toISOString()}`,
  { limit: options.recordLimit },
 )
 const syncRunId = `canonical-traffic::${new Date().toISOString()}`
 const traffic = await syncTrafficRows(resolvedChannelId, videos, syncRunId)
 await putCanonicalTrafficRows(traffic.rows)
 await putCanonicalTrafficDiagnostics(traffic.diagnostics)
 await putCanonicalRawAuditEntries(traffic.audit)
 const coverage = buildCanonicalTrafficCoverageSummary(traffic.rows, traffic.diagnostics)
 return {
  rowCount: traffic.rows.length,
  diagnosticCount: traffic.diagnostics.length,
  coverage,
  rows: traffic.rows,
  diagnostics: traffic.diagnostics,
 }
}

export const runCanonicalTrafficReportingBackfill = async (
 channelId?: string,
): Promise<CanonicalTrafficBackfillResult> => {
 const channels = channelId ? [] : await listCanonicalChannelRecords()
 const resolvedChannelId = channelId || channels[0]?.channelId || ""
 if (!resolvedChannelId) {
  throw new Error("Run canonical shadow sync first so traffic has channel context.")
 }
 const syncRunId = `canonical-traffic-reporting::${new Date().toISOString()}`
 const { startDate, endDate } = getWindowRange("365d")
 const result = await syncTrafficAnalytics({
  channelId: resolvedChannelId,
  startDate,
  endDate,
  includeReporting: true,
  reportingMode: "discover",
 })
 const syncedAt = new Date().toISOString()
 const rows: CanonicalTrafficRow[] = result.trafficReportingBulk.map((row) => ({
  channelId: resolvedChannelId,
  datasetKind: "traffic_reporting_bulk" as const,
  source: "reporting_api" as const,
  entityType: row.videoId ? "video" : "channel",
  entityId: row.videoId || resolvedChannelId,
  window: "365d" as AnalyticsWindow,
  date: row.date || null,
  trafficSourceType: String(row.trafficSourceType || "UNKNOWN"),
  trafficSourceDetail: row.trafficSourceDetail || null,
  sourceLabel: row.sourceLabel || null,
  sourceTitle: row.sourceTitle || null,
  sourceVideoId: row.sourceVideoId || null,
  metrics: {
   views: typeof row.views === "number" ? row.views : null,
   watchHours: typeof row.watchHours === "number" ? row.watchHours : null,
   watchMinutes: typeof row.watchMinutes === "number" ? row.watchMinutes : null,
   averageViewDuration:
    typeof row.averageViewDuration === "number" ? row.averageViewDuration : null,
   impressions: typeof row.impressions === "number" ? row.impressions : null,
   ctr: typeof row.ctr === "number" ? row.ctr : null,
  },
  metricMeta: {
   views: {
    source: "reporting_api",
    availability: typeof row.views === "number" ? "available" : "unavailable",
    confidence: "raw_direct",
    syncedAt,
   },
   watchHours: {
    source: "reporting_api",
    availability: typeof row.watchHours === "number" ? "available" : "unavailable",
    confidence: "raw_direct",
    syncedAt,
   },
   watchMinutes: {
    source: "reporting_api",
    availability: typeof row.watchMinutes === "number" ? "available" : "unavailable",
    confidence: "raw_direct",
    syncedAt,
   },
   averageViewDuration: {
    source: "reporting_api",
    availability:
     typeof row.averageViewDuration === "number" ? "available" : "unavailable",
    confidence: "raw_direct",
    syncedAt,
   },
   impressions: {
    source: "reporting_api",
    availability: typeof row.impressions === "number" ? "available" : "unavailable",
    confidence: "raw_direct",
    syncedAt,
   },
   ctr: {
    source: "reporting_api",
    availability: typeof row.ctr === "number" ? "available" : "unavailable",
    confidence: "raw_direct",
    syncedAt,
   },
  },
  syncedAt,
 }))
 const diagnostics: CanonicalTrafficDiagnosticEntry[] = result.trafficDiagnostics.entries.map(
  (entry, index) => ({
   id: `${syncRunId}::${entry.code}::${index}`,
   channelId: resolvedChannelId,
   createdAt: syncedAt,
   source: "reporting_api",
   syncRunId,
   window: "365d",
   datasetKind: "traffic_reporting_bulk",
   code: entry.code,
   severity: entry.severity,
   message: entry.message,
   trafficSourceType: entry.sourceType,
   requestShape: entry.requestShape,
   reason: entry.reason,
  }),
 )
 if (rows.length > 0) {
  await putCanonicalTrafficRows(rows)
 }
 if (diagnostics.length > 0) {
  await putCanonicalTrafficDiagnostics(diagnostics)
 }
 const coverage = buildCanonicalTrafficCoverageSummary(rows, diagnostics)
 return {
  rowCount: rows.length,
  diagnosticCount: diagnostics.length,
  coverage,
  rows,
  diagnostics,
  reportingJobDiscovered: diagnostics.some((entry) => entry.code === "reporting_job_discovered"),
 }
}

export const mergeCanonicalTrafficCsvFamily = async (
 files: File[],
 channelId?: string,
): Promise<CanonicalTrafficMergeResult> => {
 const channels = channelId ? [] : await listCanonicalChannelRecords()
 const resolvedChannelId = channelId || channels[0]?.channelId || ""
 if (!resolvedChannelId) {
  throw new Error("Run canonical shadow sync first so traffic has channel context.")
 }
 const syncRunId = `canonical-traffic-csv::${new Date().toISOString()}`
 const result = await mergeTrafficCsvFiles(resolvedChannelId, files, syncRunId)
 if (result.rows.length > 0) {
  await putCanonicalTrafficRows(result.rows)
 }
 if (result.diagnostics.length > 0) {
  await putCanonicalTrafficDiagnostics(result.diagnostics)
 }
 return result
}

export const runCanonicalShadowSync = async (): Promise<CanonicalSyncOverview> => {
 setCanonicalSyncEnabled(true)
 let syncRun = buildSyncRun()
 await putCanonicalSyncRun(syncRun)
 try {
  const bootstrap = await syncChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: bootstrap.channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalChannelRecord(bootstrap.channel)
  await putCanonicalRawAuditEntries([bootstrap.audit])
  await putCanonicalSyncRun(syncRun)

  const channelWindows = await syncChannelWindowSummaries(
   bootstrap.channel.channelId,
   syncRun.id,
   bootstrap.channel.publishedAt,
  )
  await putChannelWindowSummaries(channelWindows.summaries)
  await putCanonicalRawAuditEntries(channelWindows.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, channel_window: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const channelDaily = await syncChannelDailySeries(
   bootstrap.channel.channelId,
   syncRun.id,
   bootstrap.channel.publishedAt,
  )
  await putCanonicalChannelDailyRows(channelDaily.rows)
  await putCanonicalRawAuditEntries(channelDaily.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, channel_daily: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const inventory = await syncVideoInventory(bootstrap.channel.channelId, syncRun.id)
  await putCanonicalVideoRecords(inventory.records, "video_inventory", "data_api")
  await putCanonicalRawAuditEntries(inventory.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.records.length,
   stageStatus: { ...syncRun.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const metrics = await syncVideoMetrics(
   bootstrap.channel.channelId,
   inventory.records,
   syncRun.id,
  )
  await putCanonicalVideoRecords(metrics.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(metrics.audit)
  syncRun = {
   ...syncRun,
   videoCount: metrics.records.length,
   stageStatus: { ...syncRun.stageStatus, video_metrics: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const cohorts = await syncViewerCohorts(
   bootstrap.channel.channelId,
   metrics.records,
   syncRun.id,
  )
  await putCanonicalVideoRecords(cohorts.records, "viewer_cohorts", "analytics_api")
  await putCanonicalRawAuditEntries(cohorts.audit)
  syncRun = {
   ...syncRun,
   videoCount: cohorts.records.length,
   stageStatus: { ...syncRun.stageStatus, viewer_cohorts: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const traffic = await syncTrafficRows(
   bootstrap.channel.channelId,
   cohorts.records,
   syncRun.id,
  )
  await putCanonicalTrafficRows(traffic.rows)
  await putCanonicalTrafficDiagnostics(traffic.diagnostics)
  await putCanonicalRawAuditEntries(traffic.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, traffic_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const audienceSegments = await syncAudienceSegmentRows(
   bootstrap.channel.channelId,
   cohorts.records,
   syncRun.id,
  )
  await putCanonicalAudienceSplits(audienceSegments.rows)
  await putCanonicalRawAuditEntries(audienceSegments.audit)
  const demographicSegments = await syncDemographicRows(
   bootstrap.channel.channelId,
   cohorts.records,
   syncRun.id,
  )
  await putCanonicalAudienceSplits(demographicSegments.rows)
  await putCanonicalRawAuditEntries(demographicSegments.audit)
  syncRun = {
   ...syncRun,
   stageStatus: {
    ...syncRun.stageStatus,
    audience_segments: "complete",
    demographics_sync: "complete",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const geography = await syncGeographyRows(
   bootstrap.channel.channelId,
   cohorts.records,
   syncRun.id,
  )
  await putCanonicalGeographyRows(geography.rows)
  await putCanonicalRawAuditEntries(geography.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, geography_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const playlistSync = await syncPlaylists(bootstrap.channel.channelId, syncRun.id)
  await putCanonicalPlaylistRecords(playlistSync.playlists)
  await putCanonicalPlaylistWindowSummaries(playlistSync.summaries)
  await putCanonicalRawAuditEntries(playlistSync.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, playlist_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const ownerMode = await syncOwnerModeReach(
   bootstrap.channel.channelId,
   cohorts.records,
   syncRun.id,
  )
  await putCanonicalVideoRecords(ownerMode.records, "owner_mode", "owner_api")
  await putCanonicalRawAuditEntries(ownerMode.audit)
  syncRun = {
   ...syncRun,
   videoCount: ownerMode.records.length,
   stageStatus: {
    ...syncRun.stageStatus,
    owner_mode: getCanonicalOwnerModeEnabled() ? "complete" : "failed",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const diff = buildShadowDiff(bootstrap.channel.channelId, ownerMode.records)
  await putCanonicalShadowDiff(diff)
  syncRun = {
   ...syncRun,
   completedAt: new Date().toISOString(),
   status: "complete",
   stageStatus: { ...syncRun.stageStatus, shadow_diff: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  return buildCanonicalSyncOverview()
 } catch (error) {
  syncRun = {
   ...syncRun,
   completedAt: new Date().toISOString(),
   status: "failed",
   error: error instanceof Error ? error.message : String(error),
  }
  await putCanonicalSyncRun(syncRun)
 throw error
}
}

export const runCanonicalVideoMetricsSync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d"], {
  channel_bootstrap: "pending",
  channel_window: "pending",
  video_inventory: "pending",
  video_metrics: "pending",
  viewer_cohorts: "pending",
  owner_mode: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id, {
   includeChannelWindows: true,
  })
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: {
    ...syncRun.stageStatus,
    channel_bootstrap: "complete",
    channel_window: "complete",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const inventory = await syncVideoInventory(channel.channelId, syncRun.id)
  await putCanonicalVideoRecords(inventory.records, "video_inventory", "data_api")
  await putCanonicalRawAuditEntries(inventory.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.records.length,
   stageStatus: { ...syncRun.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const metrics = await syncVideoMetrics(channel.channelId, inventory.records, syncRun.id)
  await putCanonicalVideoRecords(metrics.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(metrics.audit)
  syncRun = {
   ...syncRun,
   videoCount: metrics.records.length,
   stageStatus: { ...syncRun.stageStatus, video_metrics: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const cohorts = await syncViewerCohorts(channel.channelId, metrics.records, syncRun.id)
  await putCanonicalVideoRecords(cohorts.records, "viewer_cohorts", "analytics_api")
  await putCanonicalRawAuditEntries(cohorts.audit)
  syncRun = {
   ...syncRun,
   videoCount: cohorts.records.length,
   stageStatus: { ...syncRun.stageStatus, viewer_cohorts: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const ownerMode = await syncOwnerModeReach(channel.channelId, cohorts.records, syncRun.id)
  await putCanonicalVideoRecords(ownerMode.records, "owner_mode", "owner_api")
  await putCanonicalRawAuditEntries(ownerMode.audit)
  syncRun = {
   ...syncRun,
   videoCount: ownerMode.records.length,
   stageStatus: {
    ...syncRun.stageStatus,
    owner_mode: getCanonicalOwnerModeEnabled() ? "complete" : "failed",
   },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalDailyMetricsSync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime"], {
  channel_bootstrap: "pending",
  channel_daily: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const daily = await syncChannelDailySeries(
   channel.channelId,
   syncRun.id,
   channel.publishedAt || undefined,
  )
  await putCanonicalChannelDailyRows(daily.rows)
  await putCanonicalRawAuditEntries(daily.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, channel_daily: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalAudienceSync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d", "7d"], {
 channel_bootstrap: "pending",
 audience_segments: "pending",
  demographics_sync: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  const inventory = await ensureCanonicalInventory(channel.channelId, syncRun.id)
  const result = await syncAudienceSegmentRows(channel.channelId, inventory, syncRun.id)
  await putCanonicalAudienceSplits(result.rows)
  await putCanonicalRawAuditEntries(result.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.length,
   stageStatus: { ...syncRun.stageStatus, audience_segments: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const demoResult = await syncDemographicRows(channel.channelId, inventory, syncRun.id)
  await putCanonicalAudienceSplits(demoResult.rows)
  await putCanonicalRawAuditEntries(demoResult.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.length,
   stageStatus: { ...syncRun.stageStatus, demographics_sync: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalDemographicsSync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "28d"], {
  channel_bootstrap: "pending",
  demographics_sync: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  const inventory = await ensureCanonicalInventory(channel.channelId, syncRun.id)
  const result = await syncDemographicRows(channel.channelId, inventory, syncRun.id)
  await putCanonicalAudienceSplits(result.rows)
  await putCanonicalRawAuditEntries(result.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.length,
   stageStatus: { ...syncRun.stageStatus, demographics_sync: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalGeographySync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d"], {
  channel_bootstrap: "pending",
  geography_sync: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  const inventory = await ensureCanonicalInventory(channel.channelId, syncRun.id)
  const result = await syncGeographyRows(channel.channelId, inventory, syncRun.id)
  await putCanonicalGeographyRows(result.rows)
  await putCanonicalRawAuditEntries(result.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.length,
   stageStatus: { ...syncRun.stageStatus, geography_sync: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalRevenueSync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d"], {
  channel_bootstrap: "pending",
  video_inventory: "pending",
  video_metrics: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  const inventory = await ensureCanonicalInventory(channel.channelId, syncRun.id, {
   forceRefresh: true,
  })
  syncRun = {
   ...syncRun,
   videoCount: inventory.length,
   stageStatus: { ...syncRun.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  const result = await syncRevenueMetrics(channel.channelId, inventory, syncRun.id)
  await putCanonicalVideoRecords(result.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(result.audit)
  syncRun = {
   ...syncRun,
   videoCount: result.records.length,
   stageStatus: { ...syncRun.stageStatus, video_metrics: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalViewerCohortSync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["7d", "28d", "90d"], {
  channel_bootstrap: "pending",
  viewer_cohorts: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  const inventory = await ensureCanonicalInventory(channel.channelId, syncRun.id)
  const result = await syncViewerCohorts(channel.channelId, inventory, syncRun.id)
  await putCanonicalVideoRecords(result.records, "viewer_cohorts", "analytics_api")
  await putCanonicalRawAuditEntries(result.audit)
  syncRun = {
   ...syncRun,
   videoCount: result.records.length,
   stageStatus: { ...syncRun.stageStatus, viewer_cohorts: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const runCanonicalPlaylistSync = async (): Promise<
 CanonicalSyncOverview
> => {
 let syncRun = buildFamilySyncRun("pending", ["lifetime", "365d", "90d", "28d"], {
  channel_bootstrap: "pending",
  playlist_sync: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id)
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: { ...syncRun.stageStatus, channel_bootstrap: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  const result = await syncPlaylists(channel.channelId, syncRun.id)
  await putCanonicalPlaylistRecords(result.playlists)
  await putCanonicalPlaylistWindowSummaries(result.summaries)
  await putCanonicalRawAuditEntries(result.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, playlist_sync: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const getCanonicalSyncOverview = async (): Promise<
 CanonicalSyncOverview
> => buildCanonicalSyncOverview()

export const getCanonicalVideoCatalog = async (
 channelId?: string,
): Promise<CanonicalVideoRecord[]> => {
 const channels = channelId ? [] : await listCanonicalChannelRecords()
 const resolvedChannelId = channelId || channels[0]?.channelId
 return listCanonicalVideoRecords(resolvedChannelId)
}

export const downloadCanonicalVideoCatalog = async (
 format: "csv" | "json",
 channelId?: string,
): Promise<{ rowCount: number; filename: string }> => {
 const records = await getCanonicalVideoCatalog(channelId)
 const exportRows = toExportRows(records)
 const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
 const filename = `viewtube_canonical_video_catalog_${timestamp}.${format}`
 if (format === "json") {
  const content = JSON.stringify(exportRows, null, 2)
  triggerDownload(filename, content, "application/json;charset=utf-8")
 } else {
  const content = rowsToCsv(exportRows as unknown as Record<string, unknown>[])
  triggerDownload(filename, content, "text/csv;charset=utf-8")
 }
 await putCanonicalExportView(filename, {
  channelId: channelId || records[0]?.channelId || "",
  rowCount: exportRows.length,
  format,
 })
 return { rowCount: exportRows.length, filename }
}

export const buildCanonicalDataBundle = async (
 channelId?: string,
): Promise<{
 blob: Blob
 manifest: CanonicalBundleManifest
 filename: string
}> => {
 const [
  channels,
  channelWindowSummaries,
 channelDailyRows,
 videos,
 trafficRows,
  trafficDiagnostics,
 audienceSplits,
  geographyRows,
  playlists,
  playlistWindowSummaries,
  retentionSeries,
  rawAudit,
  shadowDiffs,
  syncRuns,
 ] = await Promise.all([
  listCanonicalChannelRecords(),
  listChannelWindowSummaries(channelId),
  listCanonicalChannelDailyRows(channelId),
  listCanonicalVideoRecords(channelId),
  listCanonicalTrafficRows(channelId),
  listCanonicalTrafficDiagnostics(channelId),
  listCanonicalAudienceSplits(channelId),
  listCanonicalGeographyRows(channelId),
  listCanonicalPlaylistRecords(channelId),
  listCanonicalPlaylistWindowSummaries(channelId),
  listCanonicalRetentionSeries(channelId),
  listCanonicalRawAuditEntries(channelId),
  listCanonicalShadowDiffs(channelId),
  listCanonicalSyncRuns(),
 ])

 const filteredChannels = channelId
  ? channels.filter((channel) => channel.channelId === channelId)
  : channels
 const resolvedChannelId = channelId || filteredChannels[0]?.channelId || ""
 const presentation = buildCanonicalPresentationDatasetFromRecords({
  channels: filteredChannels,
  channelWindowSummaries,
  videos,
  audienceSplits,
  playlists,
  playlistWindowSummaries,
  retentionSeries,
  trafficRows,
  geographyRows,
  shadowDiffs,
  syncRuns,
  ownerModeEnabled: getCanonicalOwnerModeEnabled(),
 })
 const trafficDataset = buildCanonicalTrafficDatasetFromRows(
  trafficRows,
  trafficDiagnostics,
 )

 const zip = new JSZip()
 const files: CanonicalBundleManifest["fileInventory"] = []
 const addJson = (path: string, value: unknown, rowCount?: number) => {
  zip.file(path, JSON.stringify(value, null, 2))
  files.push({ path, format: "json", rowCount })
 }
 const addCsv = (path: string, rows: Record<string, unknown>[]) => {
  zip.file(path, rowsToCsv(rows))
  files.push({ path, format: "csv", rowCount: rows.length })
 }

 addJson("channel/channel_records.json", filteredChannels, filteredChannels.length)
 addJson(
  "channel/channel_window_summaries.json",
  channelWindowSummaries,
  channelWindowSummaries.length,
 )
 addJson("channel/channel_daily_series.json", channelDailyRows, channelDailyRows.length)
 addCsv("channel/channel_daily_series.csv", buildChannelDailyRows(channelDailyRows))
 addJson("videos/video_records.json", videos, videos.length)
 addCsv(
  "videos/video_catalog.csv",
  toExportRows(videos) as unknown as Record<string, unknown>[],
 )
 ;(["lifetime", "365d", "90d", "28d", "7d"] as AnalyticsWindow[]).forEach((window) => {
  addCsv(`videos/video_metrics_${window}.csv`, buildVideoMetricRows(videos, window))
 })
 addJson("traffic/traffic_rows.json", trafficRows, trafficRows.length)
 addCsv("traffic/traffic_rows.csv", buildTrafficCsvRows(trafficRows))
 addJson("traffic/traffic_summary.json", trafficDataset.summaryRows, trafficDataset.summaryRows.length)
 addCsv("traffic/traffic_summary.csv", buildTrafficCsvRows(trafficDataset.summaryRows))
 addJson("traffic/traffic_detail.json", trafficDataset.detailRows, trafficDataset.detailRows.length)
 addCsv("traffic/traffic_detail.csv", buildTrafficCsvRows(trafficDataset.detailRows))
 addJson("traffic/traffic_daily.json", trafficDataset.dailyRows, trafficDataset.dailyRows.length)
 addCsv("traffic/traffic_daily.csv", buildTrafficCsvRows(trafficDataset.dailyRows))
 addJson("traffic/traffic_video.json", trafficDataset.videoRows, trafficDataset.videoRows.length)
 addCsv("traffic/traffic_video.csv", buildTrafficCsvRows(trafficDataset.videoRows))
 addJson(
  "traffic/traffic_reporting_bulk.json",
  trafficDataset.reportingRows,
  trafficDataset.reportingRows.length,
 )
 addJson(
  "traffic/traffic_diagnostics.json",
  trafficDataset.diagnostics,
  trafficDataset.diagnostics.length,
 )
 addCsv(
  "traffic/traffic_diagnostics.csv",
  buildTrafficDiagnosticRows(trafficDataset.diagnostics),
 )
 addJson("traffic/traffic_dictionary.json", trafficDataset.dictionary)
 addJson("audience/audience_split_rows.json", audienceSplits, audienceSplits.length)
 addJson("audience/audience_splits.json", audienceSplits, audienceSplits.length)
 addCsv("audience/audience_split_rows.csv", buildAudienceSplitCsvRows(audienceSplits))
 ;(["7d", "28d", "90d"] as const).forEach((window) => {
  addCsv(`audience/viewer_cohorts_${window}.csv`, buildViewerCohortRows(videos, window))
 })
 addJson("geography/geography_rows.json", geographyRows, geographyRows.length)
 addCsv("geography/geography_rows.csv", buildGeographyCsvRows(geographyRows))
 addJson("playlists/playlist_records.json", playlists, playlists.length)
 addJson(
  "playlists/playlist_window_summaries.json",
  playlistWindowSummaries,
  playlistWindowSummaries.length,
 )
 addJson("retention/retention_series.json", retentionSeries, retentionSeries.length)
 addCsv("retention/retention_points.csv", buildRetentionPointRows(retentionSeries))
 addJson("audit/raw_audit.json", rawAudit, rawAudit.length)
 addJson("audit/shadow_diffs.json", shadowDiffs, shadowDiffs.length)
 addJson(
  "presentation/presentation_dataset.json",
  presentation,
  presentation.videoRows.length,
 )

 const manifest: CanonicalBundleManifest = {
  version: "1.0.0",
  generatedAt: presentation.meta.generatedAt,
  channelId: resolvedChannelId,
  totalVideoCount: videos.length,
  playlistCount: playlists.length,
  retentionSeriesCount: retentionSeries.length,
  audienceSplitCount: audienceSplits.length,
  supportedWindows: presentation.meta.supportedWindows,
  ownerModeEnabled: getCanonicalOwnerModeEnabled(),
  fileInventory: files,
  syncRuns: syncRuns
   .slice()
   .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
   .map((run) => ({
    id: run.id,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
   })),
 }
 addJson("manifest/summary.json", manifest)

 const blob = await zip.generateAsync({ type: "blob" })
 const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
 const filename = `viewtube_canonical_bundle_${timestamp}.zip`
 await putCanonicalExportView(filename, {
  channelId: resolvedChannelId,
  fileCount: files.length,
  videoCount: videos.length,
  playlistCount: playlists.length,
  retentionSeriesCount: retentionSeries.length,
  audienceSplitCount: audienceSplits.length,
 })
 return { blob, manifest, filename }
}

export const downloadCanonicalDataBundle = async (
 channelId?: string,
): Promise<CanonicalBundleManifest> => {
 const { blob, manifest, filename } = await buildCanonicalDataBundle(channelId)
 triggerBlobDownload(filename, blob)
 return manifest
}

export const downloadCanonicalTrafficBundle = async (
 channelId?: string,
): Promise<{ filename: string; fileCount: number }> => {
 const dataset = await buildCanonicalTrafficDataset(channelId)
 const visual = buildCanonicalTrafficVisualDatasetFromRows(
  dataset.rows,
  dataset.dictionary,
 )
 const zip = new JSZip()
 zip.file("traffic/traffic_summary.json", JSON.stringify(dataset.summaryRows, null, 2))
 zip.file("traffic/traffic_detail.json", JSON.stringify(dataset.detailRows, null, 2))
 zip.file("traffic/traffic_daily.json", JSON.stringify(dataset.dailyRows, null, 2))
 zip.file("traffic/traffic_video.json", JSON.stringify(dataset.videoRows, null, 2))
 zip.file(
  "traffic/traffic_reporting_bulk.json",
  JSON.stringify(dataset.reportingRows, null, 2),
 )
 zip.file(
  "traffic/traffic_diagnostics.json",
  JSON.stringify(dataset.diagnostics, null, 2),
 )
 zip.file("traffic/traffic_dictionary.json", JSON.stringify(dataset.dictionary, null, 2))
 zip.file("traffic/traffic_visual_dataset.json", JSON.stringify(visual, null, 2))
 zip.file("traffic/traffic_summary.csv", rowsToCsv(buildTrafficCsvRows(dataset.summaryRows)))
 zip.file("traffic/traffic_detail.csv", rowsToCsv(buildTrafficCsvRows(dataset.detailRows)))
 zip.file("traffic/traffic_daily.csv", rowsToCsv(buildTrafficCsvRows(dataset.dailyRows)))
 zip.file("traffic/traffic_video.csv", rowsToCsv(buildTrafficCsvRows(dataset.videoRows)))
 zip.file(
  "traffic/traffic_diagnostics.csv",
  rowsToCsv(buildTrafficDiagnosticRows(dataset.diagnostics)),
 )
 const blob = await zip.generateAsync({ type: "blob" })
 const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
 const filename = `viewtube_canonical_traffic_bundle_${timestamp}.zip`
 triggerBlobDownload(filename, blob)
 return { filename, fileCount: Object.keys(zip.files).length }
}

export const getLatestCanonicalDiff = async () => {
 const diffs = await listCanonicalShadowDiffs()
 return diffs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null
}

const getActiveChannelId = async (): Promise<string> => {
 const channels = await listCanonicalChannelRecords()
 return channels[0]?.channelId || ""
}

const getRetentionTargetVideos = async (
 explicitVideoIds?: string[],
): Promise<string[]> => {
 if (explicitVideoIds && explicitVideoIds.length > 0) return explicitVideoIds
 const videos = await listCanonicalVideoRecords()
 return buildRetentionTargetVideoIds(videos)
}

export const runCanonicalRetentionSync = async (
 videoIds?: string[],
 window: AnalyticsWindow = "lifetime",
): Promise<CanonicalSyncOverview> => {
 const bootstrap = await ensureCanonicalChannelBootstrap(
  `canonical-retention-bootstrap::${new Date().toISOString()}`,
 )
 const channelId = bootstrap.channel.channelId || (await getActiveChannelId())
 let targetVideoIds = await getRetentionTargetVideos(videoIds)
 if (targetVideoIds.length === 0) {
  const inventory = await ensureCanonicalInventory(
   channelId,
   `canonical-retention-inventory::${new Date().toISOString()}`,
  )
  targetVideoIds = inventory
   .slice()
   .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
   .slice(0, 5)
   .map((record) => record.videoId)
 }
 if (!channelId || targetVideoIds.length === 0) {
  throw new Error("Run a canonical video sync first so retention has channel/video context.")
 }
 const syncRun: CanonicalSyncRun = {
  id: `canonical-retention::${new Date().toISOString()}`,
  channelId,
  startedAt: new Date().toISOString(),
  status: "running",
  videoCount: targetVideoIds.length,
  windows: [window],
  stageStatus: { retention_sync: "pending" },
 }
 await putCanonicalSyncRun(syncRun)
 try {
  const retention = await syncRetentionSeries(channelId, targetVideoIds, syncRun.id, {
   window,
  })
  await putCanonicalRetentionSeries(retention.series)
  await putCanonicalRawAuditEntries(retention.audit)
  await putCanonicalSyncRun({
   ...syncRun,
   completedAt: new Date().toISOString(),
   status: "complete",
   stageStatus: { retention_sync: "complete" },
  })
  return buildCanonicalSyncOverview()
 } catch (error) {
  await putCanonicalSyncRun({
   ...syncRun,
   completedAt: new Date().toISOString(),
   status: "failed",
   error: error instanceof Error ? error.message : String(error),
   stageStatus: { retention_sync: "failed" },
  })
 throw error
 }
}

export const runCanonicalDefaultSync = async (): Promise<CanonicalSyncOverview> => {
 setCanonicalSyncEnabled(true)
 let syncRun = buildSyncRun("pending", ["lifetime", "365d", "90d", "28d", "7d"])
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id, {
   includeChannelWindows: true,
  })
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: {
    ...syncRun.stageStatus,
    channel_bootstrap: "complete",
    channel_window: "complete",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const daily = await syncChannelDailySeries(
   channel.channelId,
   syncRun.id,
   channel.publishedAt || undefined,
  )
  await putCanonicalChannelDailyRows(daily.rows)
  await putCanonicalRawAuditEntries(daily.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, channel_daily: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const inventory = await syncVideoInventory(channel.channelId, syncRun.id)
  await putCanonicalVideoRecords(inventory.records, "video_inventory", "data_api")
  await putCanonicalRawAuditEntries(inventory.audit)
  syncRun = {
   ...syncRun,
   videoCount: inventory.records.length,
   stageStatus: { ...syncRun.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const metrics = await syncVideoMetrics(channel.channelId, inventory.records, syncRun.id)
  await putCanonicalVideoRecords(metrics.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(metrics.audit)

  const revenue = await syncRevenueMetrics(channel.channelId, metrics.records, syncRun.id)
  await putCanonicalVideoRecords(revenue.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(revenue.audit)
  syncRun = {
   ...syncRun,
   videoCount: revenue.records.length,
   stageStatus: { ...syncRun.stageStatus, video_metrics: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const traffic = await syncTrafficRows(channel.channelId, revenue.records, syncRun.id)
  await putCanonicalTrafficRows(traffic.rows)
  await putCanonicalTrafficDiagnostics(traffic.diagnostics)
  await putCanonicalRawAuditEntries(traffic.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, traffic_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const audience = await syncAudienceSegmentRows(channel.channelId, revenue.records, syncRun.id)
  await putCanonicalAudienceSplits(audience.rows)
  await putCanonicalRawAuditEntries(audience.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, audience_segments: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const demographics = await syncDemographicRows(channel.channelId, revenue.records, syncRun.id)
  await putCanonicalAudienceSplits(demographics.rows)
  await putCanonicalRawAuditEntries(demographics.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, demographics_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const geography = await syncGeographyRows(channel.channelId, revenue.records, syncRun.id)
  await putCanonicalGeographyRows(geography.rows)
  await putCanonicalRawAuditEntries(geography.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, geography_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const playlists = await syncPlaylists(channel.channelId, syncRun.id)
  await putCanonicalPlaylistRecords(playlists.playlists)
  await putCanonicalPlaylistWindowSummaries(playlists.summaries)
  await putCanonicalRawAuditEntries(playlists.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, playlist_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const retentionTargets = buildRetentionTargetVideoIds(revenue.records)
  if (retentionTargets.length > 0) {
   const retention = await syncRetentionSeries(
    channel.channelId,
    retentionTargets,
    syncRun.id,
   )
   await putCanonicalRetentionSeries(retention.series)
   await putCanonicalRawAuditEntries(retention.audit)
  }
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, retention_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const diff = buildShadowDiff(channel.channelId, revenue.records)
  await putCanonicalShadowDiff(diff)
  syncRun = {
   ...syncRun,
   completedAt: new Date().toISOString(),
   status: "complete",
   stageStatus: { ...syncRun.stageStatus, shadow_diff: "complete" },
  }
  await putCanonicalSyncRun(syncRun)
  return buildCanonicalSyncOverview()
 } catch (error) {
  syncRun = {
   ...syncRun,
   completedAt: new Date().toISOString(),
   status: "failed",
   error: error instanceof Error ? error.message : String(error),
  }
  await putCanonicalSyncRun(syncRun)
  throw error
 }
}

export const runCanonicalTestSync = async (): Promise<CanonicalSyncOverview> => {
 let syncRun = buildFamilySyncRun("pending", ["28d"], {
  channel_bootstrap: "pending",
  channel_window: "pending",
  channel_daily: "pending",
  video_inventory: "pending",
  video_metrics: "pending",
  traffic_sync: "pending",
  audience_segments: "pending",
  demographics_sync: "pending",
  geography_sync: "pending",
  playlist_sync: "pending",
 })
 await putCanonicalSyncRun(syncRun)
 try {
  const { channel } = await ensureCanonicalChannelBootstrap(syncRun.id, {
   includeChannelWindows: true,
  })
  syncRun = {
   ...syncRun,
   channelId: channel.channelId,
   stageStatus: {
    ...syncRun.stageStatus,
    channel_bootstrap: "complete",
    channel_window: "complete",
   },
  }
  await putCanonicalSyncRun(syncRun)

  const daily = await syncChannelDailySeries(
   channel.channelId,
   syncRun.id,
   channel.publishedAt || undefined,
  )
  await putCanonicalChannelDailyRows(daily.rows)
  await putCanonicalRawAuditEntries(daily.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, channel_daily: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const inventory = await ensureCanonicalInventory(channel.channelId, syncRun.id, {
   limit: 25,
  })
  syncRun = {
   ...syncRun,
   videoCount: inventory.length,
   stageStatus: { ...syncRun.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const metrics = await syncVideoMetrics(
   channel.channelId,
   inventory,
   syncRun.id,
   ["28d"],
  )
  await putCanonicalVideoRecords(metrics.records, "video_metrics", "analytics_api")
  await putCanonicalRawAuditEntries(metrics.audit)
  syncRun = {
   ...syncRun,
   videoCount: metrics.records.length,
   stageStatus: { ...syncRun.stageStatus, video_metrics: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const traffic = await syncTrafficRows(channel.channelId, metrics.records, syncRun.id, [
   "28d",
  ])
  await putCanonicalTrafficRows(traffic.rows)
  await putCanonicalTrafficDiagnostics(traffic.diagnostics)
  await putCanonicalRawAuditEntries(traffic.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, traffic_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const audience = await syncAudienceSegmentRows(
   channel.channelId,
   metrics.records.slice(0, 25),
   syncRun.id,
   ["28d"],
  )
  await putCanonicalAudienceSplits(audience.rows)
  await putCanonicalRawAuditEntries(audience.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, audience_segments: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const demographics = await syncDemographicRows(
   channel.channelId,
   metrics.records.slice(0, 25),
   syncRun.id,
   ["28d"],
  )
  await putCanonicalAudienceSplits(demographics.rows)
  await putCanonicalRawAuditEntries(demographics.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, demographics_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const geography = await syncGeographyRows(
   channel.channelId,
   metrics.records.slice(0, 25),
   syncRun.id,
   ["28d"],
  )
  await putCanonicalGeographyRows(geography.rows)
  await putCanonicalRawAuditEntries(geography.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, geography_sync: "complete" },
  }
  await putCanonicalSyncRun(syncRun)

  const playlists = await syncPlaylists(channel.channelId, syncRun.id)
  await putCanonicalPlaylistRecords(playlists.playlists)
  await putCanonicalPlaylistWindowSummaries(playlists.summaries)
  await putCanonicalRawAuditEntries(playlists.audit)
  syncRun = {
   ...syncRun,
   stageStatus: { ...syncRun.stageStatus, playlist_sync: "complete" },
  }
  await finalizeFamilySyncRun(syncRun, "complete")
  return buildCanonicalSyncOverview()
 } catch (error) {
  await finalizeFamilySyncRun(
   syncRun,
   "failed",
   error instanceof Error ? error.message : String(error),
  )
  throw error
 }
}

export const getCanonicalExpansionSummary = async () => {
 const [playlists, retentionSeries] = await Promise.all([
  listCanonicalPlaylistRecords(),
  listCanonicalRetentionSeries(),
 ])
 return {
  playlists: playlists.length,
  retentionSeries: retentionSeries.length,
 }
}
