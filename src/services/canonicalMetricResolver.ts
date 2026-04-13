import type { CanonicalMetricKey, CanonicalVideoRow } from "./analyticsContract"

export type CoverageRowStatus =
 | "received"
 | "missing"
 | "not_applicable"
 | "not_connected"

export interface ResolvedMetricValue {
 value: number | null
 status: CoverageRowStatus
 reason: "actual" | "derived" | "fallback" | "missing"
}

const fallbackKeys: Record<CanonicalMetricKey, string[]> = {
 views: ["Views", "viewCount", "views"],
 watchHours: ["Watch Time (Hours)", "watchHours", "estimatedMinutesWatched"],
 likes: ["Likes", "likeCount", "likes"],
 comments: ["Comments", "commentCount", "comments"],
 shares: ["Shares", "shareCount", "shares"],
 subscribersGained: ["Subs +", "Subscribers Gained", "subscribersGained"],
 impressions: ["Impressions", "videoThumbnailImpressions", "impressions"],
 revenue: [
  "Revenue",
  "estimatedRevenue",
  "Estimated revenue",
  "Your estimated revenue (USD)",
 ],
 cpm: ["CPM", "cpm"],
 rpm: ["RPM", "rpm"],
 ctr: ["Click-Through Rate (CTR)", "CTR (%)", "ctr"],
 newViewers: ["New Viewers", "newViewers"],
 returningViewers: ["Returning Viewers", "returningViewers"],
 casualViewers: ["Casual viewers", "casualViewers"],
 regularViewers: ["Regular viewers", "regularViewers"],
 uniqueViewers: ["Unique viewers", "uniqueViewers"],
 avdSeconds: ["AVD (Average View Duration)", "Duration (sec)", "avdSeconds"],
 avp: ["AVP (%)", "averageViewPercentage", "avp"],
 engagedViews: ["Engaged views", "engagedViews"],
 stw: ["STW %", "Stayed to watch (%)", "stw"],
 endScreenClickRate: [
  "End screen click rate",
  "Clicks per end screen element shown (%)",
  "endScreenClickRate",
 ],
 cardClickRate: ["Card click rate", "annotationClickThroughRate", "cardClickRate"],
}

const numeric = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
 }
 return null
}

const lookupFromCacheStats = (
 row: CanonicalVideoRow,
 metricKey: CanonicalMetricKey,
): number | null => {
 if (!row.videoId) return null

 let cache: Record<string, unknown> = {}
 try {
  cache = JSON.parse(localStorage.getItem("yt_analytics_cache") || "{}") as Record<string, unknown>
 } catch {
  cache = {}
 }

 const stats = (cache.stats || {}) as Record<string, Record<string, unknown>>
 const byVideo = stats[row.videoId] || {}

 if (metricKey === "views") return numeric(byVideo.viewCount)
 if (metricKey === "likes") return numeric(byVideo.likeCount)
 if (metricKey === "comments") return numeric(byVideo.commentCount)
 if (metricKey === "avdSeconds") return numeric(byVideo.durationSeconds)
 return null
}

const derive = (row: CanonicalVideoRow, metricKey: CanonicalMetricKey): number | null => {
 if (metricKey === "watchHours") {
  const avdCell = row.metrics.avdSeconds
  const viewsCell = row.metrics.views
  if (
   avdCell &&
   avdCell.status !== "unavailable" &&
   viewsCell &&
   viewsCell.status !== "unavailable" &&
   avdCell.value !== null &&
   viewsCell.value !== null
  ) {
   return (avdCell.value * viewsCell.value) / 3600
  }
 }
 if (metricKey === "rpm") {
  const revenue = row.metrics.revenue
  const views = row.metrics.views
  if (
   revenue &&
   revenue.status !== "unavailable" &&
   views &&
   views.status !== "unavailable" &&
   revenue.value !== null &&
   views.value !== null &&
   views.value > 0
  ) {
   return (revenue.value / views.value) * 1000
  }
 }
 return null
}

export const resolveMetricNumber = (
 row: CanonicalVideoRow,
 metricKey: CanonicalMetricKey,
): ResolvedMetricValue => {
 const metricCell = row.metrics[metricKey]
 if (metricCell && metricCell.status !== "unavailable" && metricCell.value !== null) {
  return {
   value: metricCell.value,
   status: "received",
   reason: metricCell.status === "derived" ? "derived" : "actual",
  }
 }

 const fallbackFromRow = fallbackKeys[metricKey]
  .map((key) => numeric((row as unknown as Record<string, unknown>)[key]))
  .find((value): value is number => value !== null)
 if (fallbackFromRow !== undefined) {
  if (metricKey === "watchHours") {
   const looksLikeMinutes = fallbackFromRow > 24 * 365
   return {
    value: looksLikeMinutes ? fallbackFromRow / 60 : fallbackFromRow,
    status: "received",
    reason: "fallback",
   }
  }
  return { value: fallbackFromRow, status: "received", reason: "fallback" }
 }

 const cacheFallback = lookupFromCacheStats(row, metricKey)
 if (cacheFallback !== null) {
  return { value: cacheFallback, status: "received", reason: "fallback" }
 }

 const derived = derive(row, metricKey)
 if (derived !== null && Number.isFinite(derived)) {
  return { value: derived, status: "received", reason: "derived" }
 }

 return { value: null, status: "missing", reason: "missing" }
}
