import type {
 CanonicalChannelDailyRow,
 CanonicalChannelRecord,
 CanonicalVideoRecord,
 ChannelWindowSummary,
} from "../../../services/canonicalSync/contracts"
import {
 buildVtSyncInventoryId,
 putVtSyncChannelIndex,
 putVtSyncDatasetRawReport,
 putVtSyncDatasetTableRows,
 putVtSyncSyncRun,
 putVtSyncVideoInventoryRecords,
} from "./localDbRepository"
import { getVtSyncSnapshot, saveVtSyncSnapshot } from "./snapshot"
import type { VtSyncChannelTotals, VtSyncVideoItem } from "./contracts"

const windowKey = (summary: ChannelWindowSummary): string => {
 if ((summary.period || "current") === "current") return summary.window
 return `prev${summary.window.replace("d", "")}`
}

const toTotalMetrics = (summary: ChannelWindowSummary): Record<string, number | null> => ({
 ...summary.metrics,
 watchTime: summary.metrics.watchHours ?? null,
 avgDuration: summary.metrics.averageViewDuration ?? null,
 avgPercentageViewed: summary.metrics.averageViewPercentage ?? null,
})

const toVtVideo = (video: CanonicalVideoRecord): VtSyncVideoItem => {
 const lifetime = video.metricsByWindow.lifetime || {}
 return {
  id: video.videoId,
  title: video.title,
  thumbnail: video.thumbnail,
  publishedAt: video.publishedAt,
  format: video.format,
  category: video.categoryName || video.categoryId || "",
  tags: video.tags,
  topics: video.topicDetails.topicNames,
  privacyStatus: video.privacyStatus,
  duration: video.durationRaw || String(video.durationSeconds || ""),
  definition: video.definition,
  caption: video.caption === "true" ? "Yes" : video.caption === "false" ? "No" : video.caption || undefined,
  descriptionSnippet: video.description,
  metrics: { ...lifetime },
 }
}

const toDailyRow = (row: CanonicalChannelDailyRow) => ({
 date: row.date,
 ...row.metrics,
 watchTime: row.metrics.watchHours ?? undefined,
 avgDuration: row.metrics.averageViewDuration ?? undefined,
 avgPercentageViewed: row.metrics.averageViewPercentage ?? undefined,
})

export const publishInitialBootstrapToVtSync = async (input: {
 channel: CanonicalChannelRecord
 videos: CanonicalVideoRecord[]
 periods: ChannelWindowSummary[]
 dailyRows: CanonicalChannelDailyRow[]
 runId: string
}): Promise<void> => {
 const capturedAt = new Date().toISOString()
 const uploadsPlaylistId = input.channel.uploadsPlaylistId || ""
 const vtVideos = input.videos.map(toVtVideo)
 const dailyRows = input.dailyRows.map(toDailyRow)
 const channelTotals = Object.fromEntries(
  input.periods.map((summary) => [windowKey(summary), toTotalMetrics(summary)]),
 ) as VtSyncChannelTotals

 await putVtSyncChannelIndex({
  id: input.channel.channelId,
  channelId: input.channel.channelId,
  uploadsPlaylistId,
  title: input.channel.title,
  handle: input.channel.handle,
  publicVideoCount: input.channel.publicVideoCount,
  firstSyncedAt: input.channel.syncedAt,
  lastInventorySyncedAt: capturedAt,
  knownVideoCount: input.videos.length,
  lastInventoryRunId: input.runId,
 })
 await putVtSyncVideoInventoryRecords(input.videos.map((video) => ({
  id: buildVtSyncInventoryId(input.channel.channelId, video.videoId),
  channelId: input.channel.channelId,
  videoId: video.videoId,
  uploadsPlaylistId,
  firstSeenAt: video.syncedAt,
  lastSeenAt: capturedAt,
  firstInventoryRunId: input.runId,
  lastInventoryRunId: input.runId,
  publishedAt: video.publishedAt,
  title: video.title,
  thumbnail: video.thumbnail,
  status: video.privacyStatus === "private" ? "private" : video.privacyStatus === "unlisted" ? "unlisted" : "active",
 })))
 const datasets = [
  { id: "videos", rows: vtVideos as Array<Record<string, unknown>>, source: "youtube_data_v3" as const },
  { id: "channel_totals", rows: input.periods.map((summary) => ({ window: windowKey(summary), ...toTotalMetrics(summary) })), source: "youtube_analytics_v2" as const },
  { id: "daily", rows: dailyRows, source: "youtube_analytics_v2" as const },
 ]
 for (const dataset of datasets) {
  await putVtSyncDatasetRawReport({
   id: `${input.runId}::${dataset.id}`,
   runId: input.runId,
   datasetId: dataset.id,
   phase: "initial_channel_bootstrap",
   capturedAt,
   columns: Array.from(new Set(dataset.rows.flatMap((row) => Object.keys(row)))),
   rows: dataset.rows,
   source: dataset.source,
  })
  await putVtSyncDatasetTableRows({
   id: `${input.runId}::${dataset.id}`,
   runId: input.runId,
   datasetId: dataset.id,
   phase: "initial_channel_bootstrap",
   capturedAt,
   rows: dataset.rows,
   provenance: "api",
  })
 }
 await putVtSyncSyncRun({
  id: input.runId,
  channelId: input.channel.channelId,
  startedAt: input.channel.syncedAt,
  completedAt: capturedAt,
  phase: "initial_channel_bootstrap",
  status: input.periods.some((summary) => summary.coverage === "partial") ? "partial" : "complete",
  rowsRead: input.videos.length + input.periods.length + dailyRows.length,
  rowsWritten: input.videos.length + input.periods.length + dailyRows.length,
  knownVideoCount: input.videos.length,
 })

 const current = getVtSyncSnapshot()
 saveVtSyncSnapshot({
  ...current,
  source: "vt-sync",
  snapshotId: input.runId,
  capturedAt,
  channelId: input.channel.channelId,
  channelName: input.channel.title,
  channelDescription: input.channel.description,
  channelCustomUrl: input.channel.url || input.channel.handle || null,
  avatarUrl: input.channel.thumbnails.high?.url || input.channel.thumbnails.medium?.url || input.channel.thumbnails.default?.url || null,
  subscriberCount: input.channel.currentSubscribers,
  channelVideoCount: input.channel.publicVideoCount,
  channelViewCount: input.channel.publicViewCount,
  channelTotals,
  videos: vtVideos,
  dailyMetrics: dailyRows,
  tableExports: {
   ...(current.tableExports || {}),
   videos: vtVideos,
   channel_totals: datasets[1].rows,
   daily: dailyRows,
  },
  syncManifest: {
   run_id: input.runId,
   started_at: input.channel.syncedAt,
   completed_at: capturedAt,
   stop_reason: "initial_channel_bootstrap_committed",
  },
 })
}
