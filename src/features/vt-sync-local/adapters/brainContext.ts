import { VT_SYNC_CATEGORY_OPTIONS } from "../upstream/syncCategoryRegistry"
import { VT_SYNC_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
import type { VtSyncBrainContext, VtSyncSnapshot } from "./contracts"
import {
 applyVtSyncPrivacyFilters,
 readVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
} from "./privacyPolicy"

const sum = (rows: Array<Record<string, unknown>>, key: string): number =>
 rows.reduce((total, row) => {
  const value = row[key]
  if (typeof value === "number" && Number.isFinite(value)) return total + value
  if (typeof value === "string") {
   const parsed = Number(value.replace(/[$,% ,]/g, ""))
   return Number.isFinite(parsed) ? total + parsed : total
  }
  return total
 }, 0)

const topVideos = (snapshot: VtSyncSnapshot) =>
 [...snapshot.videos]
  .sort((left, right) => (right.metrics?.views || 0) - (left.metrics?.views || 0))
  .slice(0, 5)
  .map((video) => ({ title: video.title, views: video.metrics?.views || 0, format: video.format || "unknown" }))

export const buildVtSyncBrainContext = (
 snapshot: VtSyncSnapshot,
 privacyFilters: VtSyncPrivacyFilters = readVtSyncPrivacyFilters(),
): VtSyncBrainContext => {
 const rawVideoCount = snapshot.videos.length
 snapshot = applyVtSyncPrivacyFilters(snapshot, privacyFilters)
 const completedBundles = snapshot.syncManifest?.bundles_completed?.length || 0
 const failedBundles = snapshot.syncManifest?.bundles_failed?.length || 0
 const hasPrivacyExclusions = privacyFilters.excludePrivate || privacyFilters.excludeUnlisted
 const videoViews = snapshot.videos.reduce((total, video) => total + (video.metrics?.views || 0), 0)
 const videoWatchHours = snapshot.videos.reduce((total, video) => total + (video.metrics?.watchTime || 0), 0)
 const totalViews = hasPrivacyExclusions
  ? videoViews
  : Number((snapshot.channelTotals as any)?.lifetime?.views || 0) || videoViews
 const watchHours = hasPrivacyExclusions
  ? videoWatchHours
  : Number((snapshot.channelTotals as any)?.lifetime?.watchTime || 0) || videoWatchHours
 const warnings: string[] = []
 if (snapshot.source === "empty") warnings.push("No VT-SYNC or ViewTube analytics snapshot is currently loaded.")
 if (failedBundles > 0) warnings.push(`${failedBundles} sync bundles failed in the latest manifest; answer with partial-data caveats.`)
 if (snapshot.videos.length === 0) warnings.push("Video-level data is missing; do not make per-video ranking claims.")
 if (rawVideoCount > snapshot.videos.length) warnings.push(`${rawVideoCount - snapshot.videos.length} private or unlisted video rows are excluded from Brain evidence by the current VT-SYNC privacy settings.`)

 return {
  title: "VT-SYNC Analytics Brain Context",
  summary: [
   `Channel: ${snapshot.channelName || "Unknown channel"}`,
   `Videos: ${snapshot.videos.length}`,
   `Lifetime views: ${totalViews.toLocaleString()}`,
   `Watch hours: ${Math.round(watchHours).toLocaleString()}`,
   `Completed sync bundles: ${completedBundles}`,
   `Failed sync bundles: ${failedBundles}`,
  ].join(" | "),
  promptPrefix: [
   "You are ViewTube Brain answering from the VT-SYNC analytics bridge.",
   "Use VT-SYNC local snapshot facts first, then identify missing data and safe next sync categories.",
   "Do not invent metrics. If a metric is absent, name the missing sync category or table contract.",
   "Use concise operator-ready answers: finding, evidence, action, confidence.",
  ].join("\n"),
  facts: {
   channelIdentity: {
    channelName: snapshot.channelName,
    channelCustomUrl: snapshot.channelCustomUrl,
    subscriberCount: snapshot.subscriberCount,
    channelVideoCount: snapshot.channelVideoCount,
    channelViewCount: snapshot.channelViewCount,
   },
   totals: hasPrivacyExclusions
    ? { privacyFilteredVideos: { views: totalViews, watchTime: watchHours } }
    : snapshot.channelTotals || null,
   privacyPolicy: {
    ...privacyFilters,
    sourceVideoRows: rawVideoCount,
    includedVideoRows: snapshot.videos.length,
    excludedVideoRows: rawVideoCount - snapshot.videos.length,
   },
   rowCounts: {
    videos: snapshot.videos.length,
    dailyMetrics: snapshot.dailyMetrics.length,
    trafficSources: snapshot.trafficSources.length,
    searchTerms: snapshot.searchTerms.length,
    geography: snapshot.geography.length + snapshot.cities.length + snapshot.provinces.length + snapshot.dmaRegions.length,
    demographics: snapshot.demographics.length + snapshot.demographicsByAge.length + snapshot.demographicsByGender.length,
    playlists: snapshot.playlistsData.length,
    retentions: snapshot.retentions.length,
   },
   topVideos: topVideos(snapshot),
   topTrafficSources: [...snapshot.trafficSources]
    .sort((left, right) => Number(right.views || 0) - Number(left.views || 0))
    .slice(0, 8),
   topSearchTerms: [...snapshot.searchTerms]
    .sort((left, right) => Number(right.views || 0) - Number(left.views || 0))
    .slice(0, 8),
   dailyTotals: {
    views: sum(snapshot.dailyMetrics as Array<Record<string, unknown>>, "views"),
    watchTime: sum(snapshot.dailyMetrics as Array<Record<string, unknown>>, "watchTime"),
    revenue: sum(snapshot.dailyMetrics as Array<Record<string, unknown>>, "revenue"),
   },
   syncCategoryRegistry: VT_SYNC_CATEGORY_OPTIONS.map((category) => ({
    id: category.id,
    label: category.label,
    phase: category.phase,
    sourceApi: category.sourceApi,
    canonicalTargets: category.canonicalTargets,
   })),
   tableContracts: VT_SYNC_TABLE_DEFINITIONS.map((table) => ({
    id: table.id,
    label: table.label,
    performanceHubDatasetId: table.performanceHubDatasetId,
    defaultSort: table.defaultSort,
    pinnedGroups: table.pinnedGroups,
    collapsedGroups: table.collapsedGroups,
   })),
  },
  recommendedResponseFormat: [
   "1. Direct answer",
   "2. Evidence from VT-SYNC local tables",
   "3. Recommended sync category or table to refresh next",
   "4. Confidence and missing-data caveat",
  ],
  warnings,
 }
}

export const buildVtSyncBrainContextText = (
 snapshot: VtSyncSnapshot,
 privacyFilters: VtSyncPrivacyFilters = readVtSyncPrivacyFilters(),
): string => {
 const context = buildVtSyncBrainContext(snapshot, privacyFilters)
 return `${context.promptPrefix}\n\n${context.summary}\n\nFacts:\n${JSON.stringify(context.facts, null, 2)}\n\nResponse format:\n${context.recommendedResponseFormat.join("\n")}`
}
