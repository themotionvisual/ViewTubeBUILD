export type CanonicalStatAvailability = "available" | "unavailable"
export type CanonicalStatConfidence = "raw_direct" | "derived_exact" | "unavailable"

export interface CanonicalStatCell {
 value: number | null
 unit:
  | "count"
  | "percent"
  | "currency"
  | "hours"
  | "minutes"
  | "ratio"
 availability: CanonicalStatAvailability
 confidence: CanonicalStatConfidence
 sourceField?: string
 windowScope?: "video" | "channel" | "window" | "unknown"
 reasonCode?: string
}

export type CanonicalStatKey =
 | "watch_hours"
 | "engagement_rate"
 | "rpm"
 | "subscriber_conversion"
 | "ctr_percent"
 | "impressions"
 | "attention_minutes_per_impression"
 | "like_rate_per_1k_views"
 | "comment_rate_per_1k_views"
 | "share_rate_per_1k_views"
 | "watch_time_per_video_minute"
 | "relative_lift_vs_channel_median_avd"
 | "relative_lift_vs_channel_median_apv"
 | "relative_lift_vs_channel_median_ctr"
 | "relative_lift_vs_channel_median_rpm"
 | "retention_30_percent_viewers"

export interface CanonicalStatFieldMap {
 views?: string
 likes?: string
 comments?: string
 shares?: string
 subscribersGained?: string
 impressions?: string
 ctr?: string
 estimatedRevenue?: string
 estimatedMinutesWatched?: string
 avgViewDurationSeconds?: string
 videoLengthSeconds?: string
 avgPercentageViewed?: string
 stayedToWatchAt30?: string
}

export interface CanonicalMedianMap {
 avd?: number
 apv?: number
 ctr?: number
 rpm?: number
}

const asNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const fromField = (row: Record<string, unknown>, key?: string): number | null => {
 if (!key) return null
 return asNumber(row[key])
}

const unavailable = (unit: CanonicalStatCell["unit"], reasonCode: string): CanonicalStatCell => ({
 value: null,
 unit,
 availability: "unavailable",
 confidence: "unavailable",
 windowScope: "unknown",
 reasonCode,
})

const rawDirect = (
 value: number,
 unit: CanonicalStatCell["unit"],
 sourceField?: string,
): CanonicalStatCell => ({
 value,
 unit,
 availability: "available",
 confidence: "raw_direct",
 sourceField,
 windowScope: "video",
})

const derivedExact = (
 value: number,
 unit: CanonicalStatCell["unit"],
 sourceField?: string,
): CanonicalStatCell => ({
 value,
 unit,
 availability: "available",
 confidence: "derived_exact",
 sourceField,
 windowScope: "video",
})

const safeDivide = (numerator: number | null, denominator: number | null): number | null => {
 if (numerator === null || denominator === null || denominator <= 0) return null
 const value = numerator / denominator
 return Number.isFinite(value) ? value : null
}

export const buildCanonicalStatsForRow = (
 row: Record<string, unknown>,
 fields: CanonicalStatFieldMap,
 medians: CanonicalMedianMap = {},
): Record<CanonicalStatKey, CanonicalStatCell> => {
 const views = fromField(row, fields.views)
 const likes = fromField(row, fields.likes)
 const comments = fromField(row, fields.comments)
 const shares = fromField(row, fields.shares)
 const subscribersGained = fromField(row, fields.subscribersGained)
 const impressionsRaw = fromField(row, fields.impressions)
 const ctrRaw = fromField(row, fields.ctr)
 const estimatedRevenue = fromField(row, fields.estimatedRevenue)
 const estimatedMinutesWatched = fromField(row, fields.estimatedMinutesWatched)
 const avgViewDurationSeconds = fromField(row, fields.avgViewDurationSeconds)
 const videoLengthSeconds = fromField(row, fields.videoLengthSeconds)
 const avgPercentageViewed = fromField(row, fields.avgPercentageViewed)
 const stayedToWatchAt30 = fromField(row, fields.stayedToWatchAt30)

 const watchHoursValue = safeDivide(estimatedMinutesWatched, 60)

 const engagementRateValue =
  views !== null && views > 0
   ? (((likes ?? 0) + (comments ?? 0) + (shares ?? 0)) / views) * 100
   : null

 const rpmValue =
  views !== null && views > 0 && estimatedRevenue !== null
   ? (estimatedRevenue / views) * 1000
   : null

 const subscriberConversionValue =
  views !== null && views > 0 && subscribersGained !== null
   ? (subscribersGained / views) * 100
   : null

 const ctrPercentValue =
  ctrRaw !== null
   ? ctrRaw <= 1
     ? ctrRaw * 100
     : ctrRaw
   : views !== null && impressionsRaw !== null && impressionsRaw > 0
    ? (views / impressionsRaw) * 100
    : null

 const impressionsValue =
  impressionsRaw !== null
   ? impressionsRaw
   : views !== null && ctrRaw !== null
    ? ctrRaw > 0 && (ctrRaw <= 1 ? ctrRaw * 100 : ctrRaw) > 0
      ? views / ((ctrRaw <= 1 ? ctrRaw * 100 : ctrRaw) / 100)
      : null
    : null

 const attentionPerImpressionValue =
  estimatedMinutesWatched !== null && impressionsValue !== null && impressionsValue > 0
   ? estimatedMinutesWatched / impressionsValue
   : null

 const likeRatePer1kValue =
  views !== null && views > 0 && likes !== null ? (likes / views) * 1000 : null
 const commentRatePer1kValue =
  views !== null && views > 0 && comments !== null ? (comments / views) * 1000 : null
 const shareRatePer1kValue =
  views !== null && views > 0 && shares !== null ? (shares / views) * 1000 : null

 const watchTimePerVideoMinuteValue =
  avgViewDurationSeconds !== null && videoLengthSeconds !== null && videoLengthSeconds > 0
   ? avgViewDurationSeconds / videoLengthSeconds
   : null

 const avdLiftValue =
  avgViewDurationSeconds !== null && medians.avd && medians.avd > 0
   ? ((avgViewDurationSeconds - medians.avd) / medians.avd) * 100
   : null
 const apvLiftValue =
  avgPercentageViewed !== null && medians.apv && medians.apv > 0
   ? ((avgPercentageViewed - medians.apv) / medians.apv) * 100
   : null
 const ctrLiftValue =
  ctrPercentValue !== null && medians.ctr && medians.ctr > 0
   ? ((ctrPercentValue - medians.ctr) / medians.ctr) * 100
   : null
 const rpmLiftValue =
  rpmValue !== null && medians.rpm && medians.rpm > 0
   ? ((rpmValue - medians.rpm) / medians.rpm) * 100
   : null

 const retention30Cell =
  stayedToWatchAt30 !== null
   ? rawDirect(stayedToWatchAt30, "percent", fields.stayedToWatchAt30)
   : unavailable("percent", "missing_raw_retention_30")

 return {
  watch_hours:
   watchHoursValue !== null
    ? derivedExact(watchHoursValue, "hours", fields.estimatedMinutesWatched)
    : unavailable("hours", "missing_estimated_minutes_watched"),
  engagement_rate:
   engagementRateValue !== null
    ? derivedExact(engagementRateValue, "percent", "likes+comments+shares/views")
    : unavailable("percent", "missing_engagement_prereqs"),
  rpm:
   rpmValue !== null
    ? derivedExact(rpmValue, "currency", "estimatedRevenue/views*1000")
    : unavailable("currency", "missing_rpm_prereqs"),
  subscriber_conversion:
   subscriberConversionValue !== null
    ? derivedExact(subscriberConversionValue, "percent", "subscribersGained/views")
    : unavailable("percent", "missing_subscriber_conversion_prereqs"),
  ctr_percent:
   ctrPercentValue !== null
    ? ctrRaw !== null
      ? rawDirect(ctrPercentValue, "percent", fields.ctr)
      : derivedExact(ctrPercentValue, "percent", "views/impressions*100")
    : unavailable("percent", "missing_ctr_prereqs"),
  impressions:
   impressionsValue !== null
    ? impressionsRaw !== null
      ? rawDirect(impressionsValue, "count", fields.impressions)
      : derivedExact(impressionsValue, "count", "views/(ctr/100)")
    : unavailable("count", "missing_impressions_prereqs"),
  attention_minutes_per_impression:
   attentionPerImpressionValue !== null
    ? derivedExact(attentionPerImpressionValue, "minutes", "estimatedMinutesWatched/impressions")
    : unavailable("minutes", "missing_attention_per_impression_prereqs"),
  like_rate_per_1k_views:
   likeRatePer1kValue !== null
    ? derivedExact(likeRatePer1kValue, "ratio", "likes/views*1000")
    : unavailable("ratio", "missing_like_rate_prereqs"),
  comment_rate_per_1k_views:
   commentRatePer1kValue !== null
    ? derivedExact(commentRatePer1kValue, "ratio", "comments/views*1000")
    : unavailable("ratio", "missing_comment_rate_prereqs"),
  share_rate_per_1k_views:
   shareRatePer1kValue !== null
    ? derivedExact(shareRatePer1kValue, "ratio", "shares/views*1000")
    : unavailable("ratio", "missing_share_rate_prereqs"),
  watch_time_per_video_minute:
   watchTimePerVideoMinuteValue !== null
    ? derivedExact(watchTimePerVideoMinuteValue, "ratio", "avgViewDuration/videoLength")
    : unavailable("ratio", "missing_watch_time_per_video_minute_prereqs"),
  relative_lift_vs_channel_median_avd:
   avdLiftValue !== null
    ? derivedExact(avdLiftValue, "percent", "(avd-medianAvd)/medianAvd*100")
    : unavailable("percent", "missing_channel_median_avd"),
  relative_lift_vs_channel_median_apv:
   apvLiftValue !== null
    ? derivedExact(apvLiftValue, "percent", "(apv-medianApv)/medianApv*100")
    : unavailable("percent", "missing_channel_median_apv"),
  relative_lift_vs_channel_median_ctr:
   ctrLiftValue !== null
    ? derivedExact(ctrLiftValue, "percent", "(ctr-medianCtr)/medianCtr*100")
    : unavailable("percent", "missing_channel_median_ctr"),
  relative_lift_vs_channel_median_rpm:
   rpmLiftValue !== null
    ? derivedExact(rpmLiftValue, "percent", "(rpm-medianRpm)/medianRpm*100")
    : unavailable("percent", "missing_channel_median_rpm"),
  retention_30_percent_viewers: retention30Cell,
 }
}

export const collectAvailableCanonicalStats = (
 rows: Array<Record<string, unknown>>,
 fields: CanonicalStatFieldMap,
 medians: CanonicalMedianMap = {},
): Set<CanonicalStatKey> => {
 const available = new Set<CanonicalStatKey>()
 for (const row of rows) {
  const stats = buildCanonicalStatsForRow(row, fields, medians)
  ;(Object.keys(stats) as CanonicalStatKey[]).forEach((key) => {
   if (stats[key].availability === "available") {
    available.add(key)
   }
  })
 }
 return available
}
