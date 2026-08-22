import type { AnalyticsWindow } from "../analytics/DataStore"
import { formatTrafficSourceNickname } from "../dataUtils"
import { getCanonicalSyncOverview } from "./repository"
import { selectRowsForWindow } from "./windowing"
import {
 listCanonicalAudienceSplits,
 listCanonicalChannelDailyRows,
 listCanonicalGeographyRows,
 listCanonicalTrafficRows,
 listChannelWindowSummaries,
} from "./storage"
import type {
 CanonicalAudienceSplitRow,
 CanonicalChannelDailyRow,
 CanonicalGeographyRow,
 CanonicalTrafficRow,
 ChannelWindowSummary,
} from "./contracts"

export type CanonicalTableDatasetProvenance =
 | "canonical"
 | "legacy_fallback"
 | "csv_additive"

export type CanonicalTableDatasetReadiness = "idle" | "pending" | "ready"

export type CanonicalTableDatasetId =
 | "master"
 | "daily"
 | "daily_statistics"
 | "weekly_statistics"
 | "monthly_statistics"
 | "window_statistics"
 | "traffic"
 | "traffic_sources"
 | "traffic_youtube_search_terms"
 | "traffic_external_websites"
 | "traffic_suggested_videos"
 | "traffic_channel_pages"
 | "traffic_playlists"
 | "traffic_notifications"
 | "traffic_end_screens"
 | "traffic_cards_annotations"
 | "traffic_hashtags"
 | "traffic_sound_pages"
 | "traffic_shorts_links"
 | "traffic_advertising"
 | "traffic_browse_features"
 | "traffic_other_features"
 | "audience"
 | "demographics"
 | "demographics_by_age"
 | "demographics_by_gender"
 | "country"
 | "geography"
 | "geography_city"
 | "geography_province_us"
 | "device"

export type CanonicalTableDatasetSnapshot = {
 datasetId: CanonicalTableDatasetId
 rows: Array<Record<string, unknown>>
 provenance: CanonicalTableDatasetProvenance
 readiness: CanonicalTableDatasetReadiness
 requestedWindow?: AnalyticsWindow
 resolvedWindow?: AnalyticsWindow | null
 availableWindows?: AnalyticsWindow[]
 hasRequestedWindowData?: boolean
 usedFallbackWindow?: boolean
}

export type CanonicalTableDatasetMap = Partial<
 Record<CanonicalTableDatasetId, CanonicalTableDatasetSnapshot>
>

const TRAFFIC_DATASET_IDS: CanonicalTableDatasetId[] = [
 "traffic",
 "traffic_sources",
 "traffic_youtube_search_terms",
 "traffic_external_websites",
 "traffic_suggested_videos",
 "traffic_channel_pages",
 "traffic_playlists",
 "traffic_notifications",
 "traffic_end_screens",
 "traffic_cards_annotations",
 "traffic_hashtags",
 "traffic_sound_pages",
 "traffic_shorts_links",
 "traffic_advertising",
 "traffic_browse_features",
 "traffic_other_features",
]

const DEMOGRAPHIC_DATASET_IDS: CanonicalTableDatasetId[] = [
 "audience",
 "demographics",
 "demographics_by_age",
 "demographics_by_gender",
]

const GEOGRAPHY_DATASET_IDS: CanonicalTableDatasetId[] = [
 "country",
 "geography",
 "geography_city",
 "geography_province_us",
]

const getNumber = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const parsed = Number(value.replace(/,/g, "").replace(/%/g, "").trim())
 return Number.isFinite(parsed) ? parsed : 0
}

const toIsoMonth = (value: string): string => value.slice(0, 7)

const toIsoWeek = (value: string): string => {
 const parsed = new Date(value)
 if (Number.isNaN(parsed.getTime())) return value
 const date = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()))
 const day = date.getUTCDay() || 7
 date.setUTCDate(date.getUTCDate() + 4 - day)
 const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
 const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
 return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`
}

const sumMetric = (rows: CanonicalChannelDailyRow[], metricKey: string): number =>
 rows.reduce((total, row) => total + getNumber(row.metrics?.[metricKey]), 0)

const avgMetric = (rows: CanonicalChannelDailyRow[], metricKey: string): number => {
 const values = rows
  .map((row) => getNumber(row.metrics?.[metricKey]))
  .filter((value) => Number.isFinite(value) && value > 0)
 if (values.length === 0) return 0
 return values.reduce((total, value) => total + value, 0) / values.length
}

const buildDailyRow = (row: CanonicalChannelDailyRow): Record<string, unknown> => {
 const views = getNumber(row.metrics?.views)
 const watchHours = getNumber(row.metrics?.watchHours)
 const engagedViews = getNumber(row.metrics?.engagedViews)
 const subscribers = getNumber(row.metrics?.subscribers)
 const subscribersGained = getNumber(row.metrics?.subscribersGained)
 const subscribersLost = getNumber(row.metrics?.subscribersLost)
  const revenue = getNumber(row.metrics?.revenue)
  const cpm = getNumber(row.metrics?.cpm)
  const ctr = getNumber(row.metrics?.ctr)
  const impressions = getNumber(row.metrics?.impressions)
 const adImpressions = getNumber(row.metrics?.adImpressions)
 const monetizedPlaybacks = getNumber(row.metrics?.monetizedPlaybacks)
 return {
  Date: row.date,
  Day: row.date,
  Views: views,
  "Engaged views": engagedViews,
  Subscribers: subscribers,
  Likes: getNumber(row.metrics?.likes),
  Dislikes: getNumber(row.metrics?.dislikes),
  Comments: getNumber(row.metrics?.comments),
  "Comments added": getNumber(row.metrics?.comments),
  Shares: getNumber(row.metrics?.shares),
  Saves: getNumber(row.metrics?.videosAddedToPlaylists),
  "Videos added to playlists": getNumber(row.metrics?.videosAddedToPlaylists),
  "Watch Hrs": watchHours,
  "Watch time (hours)": watchHours,
  "Average view duration": getNumber(row.metrics?.averageViewDuration),
  "Average percentage viewed (%)": getNumber(row.metrics?.averageViewPercentage),
  "Subscribers Gained": subscribersGained,
  "Subscribers gained": subscribersGained,
  "Subscribers lost": subscribersLost,
  "Subs +": subscribersGained,
  Impressions: impressions,
  CTR: ctr,
  "Impressions click-through rate (%)": ctr,
  Revenue: revenue,
  "Estimated revenue (USD)": revenue,
  "YouTube ad revenue (USD)": getNumber(row.metrics?.estimatedAdRevenue),
  "Ad impressions": adImpressions,
  "Estimated monetized playbacks": monetizedPlaybacks,
  RPM: views > 0 && revenue > 0 ? (revenue / views) * 1000 : 0,
  CPM: cpm,
  "CPM (USD)": cpm,
  "Data source": "Canonical",
 }
}

const aggregateDailyRows = (
 rows: CanonicalChannelDailyRow[],
 keyLabel: "Week" | "Month",
 keyBuilder: (value: string) => string,
): Array<Record<string, unknown>> => {
 const grouped = new Map<string, CanonicalChannelDailyRow[]>()
 rows.forEach((row) => {
  const key = keyBuilder(row.date)
  const current = grouped.get(key) || []
  current.push(row)
  grouped.set(key, current)
 })
 return Array.from(grouped.entries())
  .map(([key, groupRows]) => {
   const views = sumMetric(groupRows, "views")
   const watchHours = sumMetric(groupRows, "watchHours")
   const revenue = sumMetric(groupRows, "revenue")
   const subscribersGained = sumMetric(groupRows, "subscribersGained")
   const subscribersLost = sumMetric(groupRows, "subscribersLost")
   const impressions = sumMetric(groupRows, "impressions")
   const ctr = impressions > 0 ? (views / impressions) * 100 : avgMetric(groupRows, "ctr")
   const cpm = avgMetric(groupRows, "cpm")
   return {
    [keyLabel]: key,
    Views: views,
    Likes: sumMetric(groupRows, "likes"),
    Comments: sumMetric(groupRows, "comments"),
    Shares: sumMetric(groupRows, "shares"),
    "Watch Hrs": watchHours,
    "Watch time (hours)": watchHours,
    "Average view duration": avgMetric(groupRows, "averageViewDuration"),
    "Average percentage viewed (%)": avgMetric(groupRows, "averageViewPercentage"),
    "Subscribers Gained": subscribersGained,
    "Subscribers gained": subscribersGained,
    "Subscribers lost": subscribersLost,
    "Subs +": subscribersGained,
    Impressions: impressions,
    CTR: ctr,
    "Impressions click-through rate (%)": ctr,
    Revenue: revenue,
    "Estimated revenue (USD)": revenue,
    RPM: views > 0 && revenue > 0 ? (revenue / views) * 1000 : 0,
    CPM: cpm,
    "CPM (USD)": cpm,
    "Data source": "Canonical",
   }
  })
  .sort((left, right) => String(left[keyLabel]).localeCompare(String(right[keyLabel])))
}

const buildWindowRows = (
 dailyRows: CanonicalChannelDailyRow[],
 windowSummaries: ChannelWindowSummary[],
): Array<Record<string, unknown>> => {
 const fromSummaries = windowSummaries.map((summary) => {
  const views = getNumber(summary.metrics?.views)
  const watchHours = getNumber(summary.metrics?.watchHours)
  const revenue = getNumber(summary.metrics?.revenue)
  const subscribersGained = getNumber(summary.metrics?.subscribersGained)
  const subscribersLost = getNumber(summary.metrics?.subscribersLost)
  const impressions = getNumber(summary.metrics?.impressions)
  const ctr = impressions > 0 ? (views / impressions) * 100 : getNumber(summary.metrics?.ctr)
  const cpm = getNumber(summary.metrics?.cpm)
  return {
   Window: summary.window,
   Views: views,
   Likes: getNumber(summary.metrics?.likes),
   Comments: getNumber(summary.metrics?.comments),
   Shares: getNumber(summary.metrics?.shares),
   "Watch Hrs": watchHours,
   "Watch time (hours)": watchHours,
   "Average view duration": getNumber(summary.metrics?.averageViewDuration),
   "Average percentage viewed (%)": getNumber(summary.metrics?.averageViewPercentage),
   "Subscribers Gained": subscribersGained,
   "Subscribers gained": subscribersGained,
   "Subscribers lost": subscribersLost,
   "Subs +": subscribersGained,
   Impressions: impressions,
   CTR: ctr,
   "Impressions click-through rate (%)": ctr,
   Revenue: revenue,
   "Estimated revenue (USD)": revenue,
   RPM: views > 0 && revenue > 0 ? (revenue / views) * 1000 : 0,
   CPM: cpm,
   "CPM (USD)": cpm,
   "Data source": "Canonical",
  }
 })
 if (fromSummaries.length > 0) return fromSummaries

 const now = new Date()
 const windows: Array<{ label: string; days: number | null }> = [
  { label: "7d", days: 7 },
  { label: "28d", days: 28 },
  { label: "90d", days: 90 },
  { label: "365d", days: 365 },
  { label: "lifetime", days: null },
 ]
 return windows.map(({ label, days }) => {
  const rows =
   days === null
    ? dailyRows
    : dailyRows.filter((row) => {
       const date = new Date(row.date)
       if (Number.isNaN(date.getTime())) return false
       return (now.getTime() - date.getTime()) / 86400000 <= days
      })
  const views = sumMetric(rows, "views")
  const watchHours = sumMetric(rows, "watchHours")
  const revenue = sumMetric(rows, "revenue")
  const subscribersGained = sumMetric(rows, "subscribersGained")
  const subscribersLost = sumMetric(rows, "subscribersLost")
  const impressions = sumMetric(rows, "impressions")
  const ctr = impressions > 0 ? (views / impressions) * 100 : avgMetric(rows, "ctr")
  const cpm = avgMetric(rows, "cpm")
  return {
   Window: label,
   Views: views,
   Likes: sumMetric(rows, "likes"),
   Comments: sumMetric(rows, "comments"),
   Shares: sumMetric(rows, "shares"),
   "Watch Hrs": watchHours,
   "Watch time (hours)": watchHours,
   "Average view duration": avgMetric(rows, "averageViewDuration"),
   "Average percentage viewed (%)": avgMetric(rows, "averageViewPercentage"),
   "Subscribers Gained": subscribersGained,
   "Subscribers gained": subscribersGained,
   "Subscribers lost": subscribersLost,
   "Subs +": subscribersGained,
   Impressions: impressions,
   CTR: ctr,
   "Impressions click-through rate (%)": ctr,
   Revenue: revenue,
   "Estimated revenue (USD)": revenue,
   RPM: views > 0 && revenue > 0 ? (revenue / views) * 1000 : 0,
   CPM: cpm,
   "CPM (USD)": cpm,
   "Data source": "Canonical",
  }
 })
}

const normalizeTrafficCategory = (row: CanonicalTrafficRow): CanonicalTableDatasetId => {
 const type = String(row.trafficSourceType || "").toUpperCase()
 if (type === "YT_SEARCH") return "traffic_youtube_search_terms"
 if (type === "EXT_URL") return "traffic_external_websites"
 if (type === "RELATED_VIDEO" || type === "YT_RELATED") return "traffic_suggested_videos"
 if (type === "YT_CHANNEL") return "traffic_channel_pages"
 if (type === "PLAYLIST") return "traffic_playlists"
 if (type === "NOTIFICATION") return "traffic_notifications"
 if (type === "END_SCREEN") return "traffic_end_screens"
 if (type === "ANNOTATION" || type === "CAMPAIGN_CARD") return "traffic_cards_annotations"
 if (type === "HASHTAGS") return "traffic_hashtags"
 if (type === "SOUND_PAGE") return "traffic_sound_pages"
 if (type === "SHORTS_CONTENT_LINKS" || type === "RELATED_SHORTS") return "traffic_shorts_links"
 if (type === "ADVERTISING") return "traffic_advertising"
 if (type === "BROWSE" || type === "SUBSCRIBER") return "traffic_browse_features"
 return "traffic_other_features"
}

const resolvedEntityHandleText = (row: CanonicalTrafficRow): string => {
 const handle = String(row.resolvedEntityHandle || "").trim()
 if (!handle) return ""
 return handle.startsWith("@") ? handle : `@${handle}`
}

const buildTrafficDisplayTitle = (row: CanonicalTrafficRow): string => {
 const rawDetail = String(
  row.sourceTitle || row.trafficSourceDetail || row.sourceVideoId || row.sourceLabel || "",
 ).trim()
 const resolvedTitle = String(row.resolvedEntityTitle || "").trim()
 const resolvedId = String(row.resolvedEntityId || "").trim()
 const handle = resolvedEntityHandleText(row)
 const subtitle = String(row.resolvedEntitySubtitle || "").trim()

 if (String(row.trafficSourceType || "").toUpperCase() === "YT_CHANNEL") {
  const parts = [resolvedTitle || rawDetail, handle || subtitle || resolvedId].filter(Boolean)
  return parts.join(" · ") || rawDetail || formatTrafficSourceNickname(row.trafficSourceType || "Unknown")
 }

 if (resolvedTitle) {
  const parts = [resolvedTitle]
  const secondary = subtitle || resolvedId
  if (secondary && secondary !== resolvedTitle) parts.push(secondary)
  return parts.join(" · ")
 }

 return rawDetail || formatTrafficSourceNickname(row.sourceLabel || row.trafficSourceType || "Unknown")
}

const buildTrafficBaseRow = (row: CanonicalTrafficRow): Record<string, unknown> => {
 const views = getNumber(row.metrics?.views)
 const watchHours = getNumber(row.metrics?.watchHours)
 const impressions = getNumber(row.metrics?.impressions)
 const ctr = impressions > 0 ? (views / impressions) * 100 : getNumber(row.metrics?.ctr)
 const sourceTitle = buildTrafficDisplayTitle(row)
 const resolvedType = String(row.resolvedEntityType || "").trim()
 return {
  Date: row.date || "",
  "Traffic source": formatTrafficSourceNickname(row.sourceLabel || row.trafficSourceType || "Unknown"),
  "Source type": row.trafficSourceType || "",
  "Source title": sourceTitle,
  Views: views,
  "Watch Hrs": watchHours,
  "Watch time (hours)": watchHours,
  "Engaged views": getNumber(row.metrics?.engagedViews),
  "Average view duration": getNumber(row.metrics?.averageViewDuration),
  "Average percentage viewed (%)": getNumber(
   row.metrics?.averagePercentageViewed,
  ),
  Impressions: impressions,
  "Impressions click-through rate (%)": ctr,
  "Traffic group": row.trafficSourceType || "UNKNOWN",
  "Data source": "Canonical",
  "Channel ID":
   resolvedType === "channel"
    ? row.resolvedEntityId || row.trafficSourceDetail || ""
    : "",
  "Channel title": resolvedType === "channel" ? row.resolvedEntityTitle || "" : "",
  "Channel handle": resolvedType === "channel" ? resolvedEntityHandleText(row) : "",
  __trafficCategory: normalizeTrafficCategory(row),
  __sourceVideoId: row.sourceVideoId || "",
  __resolvedEntityId: row.resolvedEntityId || "",
 }
}

const aggregateTrafficRows = (
 rows: CanonicalTrafficRow[],
 datasetId: CanonicalTableDatasetId,
): Array<Record<string, unknown>> => {
 const filtered = rows.filter((row) => {
  if (row.entityType !== "channel") return false
  if (datasetId === "traffic" || datasetId === "traffic_sources") {
   return row.datasetKind === "traffic_summary"
  }
  return normalizeTrafficCategory(row) === datasetId
 })
 const prefersDetailTitle = new Set<CanonicalTableDatasetId>([
  "traffic_youtube_search_terms",
  "traffic_external_websites",
  "traffic_suggested_videos",
  "traffic_channel_pages",
  "traffic_playlists",
  "traffic_notifications",
  "traffic_end_screens",
  "traffic_cards_annotations",
  "traffic_hashtags",
  "traffic_sound_pages",
  "traffic_shorts_links",
  "traffic_advertising",
 ])
 const detailPreferredRows =
  prefersDetailTitle.has(datasetId) &&
  filtered.some(
   (row) =>
    row.datasetKind === "traffic_detail" &&
    !!String(row.sourceTitle || row.trafficSourceDetail || row.sourceVideoId || "").trim(),
  )
   ? filtered.filter(
      (row) =>
       row.datasetKind === "traffic_detail" &&
       !!String(row.sourceTitle || row.trafficSourceDetail || row.sourceVideoId || "").trim(),
     )
   : filtered
 const grouped = new Map<string, Record<string, unknown>>()
 detailPreferredRows.forEach((row) => {
  const base = buildTrafficBaseRow(row)
  const key = [
   String(base["Traffic source"]),
   String(base["Source type"]),
   String(base["Source title"]),
   String(base["Channel ID"] || ""),
   String(base.__resolvedEntityId || ""),
   String(base.Date || ""),
  ].join("::")
  const current = grouped.get(key)
  if (!current) {
   grouped.set(key, { ...base })
   return
  }
  ;["Views", "Watch Hrs", "Watch time (hours)", "Engaged views", "Impressions"].forEach(
   (field) => {
    current[field] = getNumber(current[field]) + getNumber(base[field])
   },
  )
  current["Average view duration"] =
   getNumber(current["Average view duration"]) || getNumber(base["Average view duration"])
  current["Average percentage viewed (%)"] =
   getNumber(current["Average percentage viewed (%)"]) ||
   getNumber(base["Average percentage viewed (%)"])
  if (!String(current["Channel ID"] || "").trim()) current["Channel ID"] = base["Channel ID"]
  if (!String(current["Channel title"] || "").trim())
   current["Channel title"] = base["Channel title"]
  if (!String(current["Channel handle"] || "").trim())
   current["Channel handle"] = base["Channel handle"]
 })
 return Array.from(grouped.values())
  .map<Record<string, unknown>>((row) => {
   const views = getNumber(row.Views)
   const impressions = getNumber(row.Impressions)
   return {
    ...row,
    "Viewer %": 0,
    "Impressions click-through rate (%)":
     impressions > 0 ? (views / impressions) * 100 : getNumber(row["Impressions click-through rate (%)"]),
   }
  })
  .map<Record<string, unknown>>((row, _index, allRows) => {
   const totalViews = allRows.reduce((sum, entry) => sum + getNumber(entry.Views), 0)
   return {
    ...row,
    "Viewer %": totalViews > 0 ? (getNumber(row.Views) / totalViews) * 100 : 0,
   }
  })
  .sort((left, right) => getNumber(right.Views) - getNumber(left.Views))
}

const splitDemographicKey = (
 splitKey: string,
): { ageGroup: string; gender: string } => {
 const parts = splitKey.split("_")
 if (parts.length <= 1) return { ageGroup: splitKey || "Unknown", gender: "Unknown" }
 return {
  ageGroup: parts.slice(0, -1).join("_") || "Unknown",
  gender: parts[parts.length - 1] || "Unknown",
 }
}

const buildDemographicRows = (
 rows: CanonicalAudienceSplitRow[],
 datasetId: CanonicalTableDatasetId,
): Array<Record<string, unknown>> => {
 const filtered = rows.filter(
  (row) => row.entityType === "channel" && row.splitDimension === "demographic",
 )
 if (datasetId === "audience" || datasetId === "demographics") {
  const totalWatchHours = filtered.reduce(
   (total, row) => total + getNumber(row.metrics?.estimatedMinutesWatched) / 60,
   0,
  )
  return filtered
   .map((row) => {
    const { ageGroup, gender } = splitDemographicKey(row.splitKey)
    const watchHours = getNumber(row.metrics?.estimatedMinutesWatched) / 60
    return {
     "Viewer age": ageGroup,
     "Viewer gender": gender,
     "Viewer percentage (%)": getNumber(row.metrics?.viewerPercentage),
     "Views (%)": getNumber(row.metrics?.viewerPercentage),
     "Watch time (hours) (%)":
      totalWatchHours > 0 ? (watchHours / totalWatchHours) * 100 : 0,
     Views: getNumber(row.metrics?.views),
     "Watch Hrs": watchHours,
     "Data source": "Canonical",
    }
   })
   .sort(
    (left, right) =>
     getNumber(right["Viewer percentage (%)"]) -
     getNumber(left["Viewer percentage (%)"]),
   )
  }

 const grouped = new Map<string, { viewer: number; views: number; watchHours: number }>()
 filtered.forEach((row) => {
  const { ageGroup, gender } = splitDemographicKey(row.splitKey)
  const key = datasetId === "demographics_by_age" ? ageGroup : gender
  const current = grouped.get(key) || { viewer: 0, views: 0, watchHours: 0 }
  current.viewer += getNumber(row.metrics?.viewerPercentage)
  current.views += getNumber(row.metrics?.views)
  current.watchHours += getNumber(row.metrics?.estimatedMinutesWatched) / 60
  grouped.set(key, current)
 })
 const totalWatchHours = Array.from(grouped.values()).reduce(
  (total, row) => total + row.watchHours,
  0,
 )
 return Array.from(grouped.entries())
  .map(([key, value]) =>
   datasetId === "demographics_by_age"
    ? {
       "Age Group": key,
       "Viewer percentage (%)": value.viewer,
       "Views (%)": value.viewer,
       "Watch time (hours) (%)":
        totalWatchHours > 0 ? (value.watchHours / totalWatchHours) * 100 : 0,
       Views: value.views,
       "Watch Hrs": value.watchHours,
       "Data source": "Canonical",
      }
    : {
       Gender: key,
       "Viewer percentage (%)": value.viewer,
       "Views (%)": value.viewer,
       "Watch time (hours) (%)":
        totalWatchHours > 0 ? (value.watchHours / totalWatchHours) * 100 : 0,
       Views: value.views,
       "Watch Hrs": value.watchHours,
       "Data source": "Canonical",
      },
  )
  .sort(
   (left, right) =>
    getNumber(right["Viewer percentage (%)"]) -
    getNumber(left["Viewer percentage (%)"]),
  )
}

const buildGeographyRows = (
 rows: CanonicalGeographyRow[],
 datasetId: CanonicalTableDatasetId,
): Array<Record<string, unknown>> => {
 const filtered = rows.filter((row) => row.entityType === "channel")
 if (datasetId === "country" || datasetId === "geography") {
  return filtered
   .filter((row) => row.country)
   .map((row) => ({
    Geography: row.country,
    Country: row.country,
    Views: getNumber(row.metrics?.views),
    "Watch Hrs": getNumber(row.metrics?.estimatedMinutesWatched) / 60,
    "Average view duration": getNumber(row.metrics?.averageViewDuration),
    "Average percentage viewed (%)": getNumber(row.metrics?.averageViewPercentage),
    "Data source": "Canonical",
   }))
   .sort((left, right) => getNumber(right.Views) - getNumber(left.Views))
 }
 if (datasetId === "geography_city") {
  return filtered
   .filter((row) => row.city)
   .map((row) => ({
    City: row.city,
    Geography: row.country,
    Views: getNumber(row.metrics?.views),
    "Watch Hrs": getNumber(row.metrics?.estimatedMinutesWatched) / 60,
    "Data source": "Canonical",
   }))
   .sort((left, right) => getNumber(right.Views) - getNumber(left.Views))
 }
 return filtered
  .filter((row) => row.country === "US" && row.province)
  .map((row) => ({
   Province: row.province,
   Geography: row.country,
   Views: getNumber(row.metrics?.views),
   "Watch Hrs": getNumber(row.metrics?.estimatedMinutesWatched) / 60,
   "Data source": "Canonical",
  }))
  .sort((left, right) => getNumber(right.Views) - getNumber(left.Views))
}

const getStageReadiness = (
 rows: Array<Record<string, unknown>>,
 stageState: "pending" | "complete" | "failed" | undefined,
): CanonicalTableDatasetReadiness => {
 if (stageState === "complete" || rows.length > 0) return "ready"
 if (stageState === "failed" || stageState === "pending") return "pending"
 return "idle"
}

const getDailyStageReadiness = (
 rows: CanonicalChannelDailyRow[],
 stageState: "pending" | "complete" | "failed" | undefined,
): CanonicalTableDatasetReadiness => {
 const hasRequiredMetricCoverage = rows.some((row) =>
  ["views", "watchHours", "revenue"].every((metricKey) =>
   Object.prototype.hasOwnProperty.call(row.metrics || {}, metricKey),
  ),
 )
 if (hasRequiredMetricCoverage) return "ready"
 if (stageState === "complete" || stageState === "pending" || stageState === "failed") {
  return "pending"
 }
 return "idle"
}

const toProvenance = (
 readiness: CanonicalTableDatasetReadiness,
 rows: Array<Record<string, unknown>>,
): CanonicalTableDatasetProvenance =>
 readiness === "idle" && rows.length === 0 ? "legacy_fallback" : "canonical"

export const loadCanonicalTableDatasets = async (
 analyticsWindow: AnalyticsWindow,
): Promise<CanonicalTableDatasetMap> => {
 const [overview, dailyRows, trafficRows, audienceSplits, geographyRows, windowSummaries] =
  await Promise.all([
   getCanonicalSyncOverview(),
   listCanonicalChannelDailyRows(),
   listCanonicalTrafficRows(),
   listCanonicalAudienceSplits(),
   listCanonicalGeographyRows(),
   listChannelWindowSummaries(),
  ])

 const stageStatus = overview.lastRun?.stageStatus || {}
 const filteredDailyRows = dailyRows
  .slice()
  .sort((left, right) => left.date.localeCompare(right.date))
 const selectedTrafficRows = selectRowsForWindow(trafficRows, analyticsWindow)
 const selectedAudienceRows = selectRowsForWindow(audienceSplits, analyticsWindow)
 const selectedGeographyRows = selectRowsForWindow(geographyRows, analyticsWindow)

 const dailySnapshots: CanonicalTableDatasetMap = {
 daily: {
   datasetId: "daily",
   rows: filteredDailyRows.map(buildDailyRow),
   readiness: getDailyStageReadiness(filteredDailyRows, stageStatus.channel_daily),
   provenance: "canonical",
  },
  daily_statistics: {
   datasetId: "daily_statistics",
   rows: filteredDailyRows.map(buildDailyRow),
   readiness: getDailyStageReadiness(filteredDailyRows, stageStatus.channel_daily),
   provenance: "canonical",
  },
  weekly_statistics: {
   datasetId: "weekly_statistics",
   rows: aggregateDailyRows(filteredDailyRows, "Week", toIsoWeek),
   readiness: getStageReadiness(
    aggregateDailyRows(filteredDailyRows, "Week", toIsoWeek),
    stageStatus.channel_daily,
   ),
   provenance: "canonical",
  },
  monthly_statistics: {
   datasetId: "monthly_statistics",
   rows: aggregateDailyRows(filteredDailyRows, "Month", toIsoMonth),
   readiness: getStageReadiness(
    aggregateDailyRows(filteredDailyRows, "Month", toIsoMonth),
    stageStatus.channel_daily,
   ),
   provenance: "canonical",
  },
  window_statistics: {
   datasetId: "window_statistics",
   rows: buildWindowRows(filteredDailyRows, windowSummaries),
   readiness: getStageReadiness(
    buildWindowRows(filteredDailyRows, windowSummaries),
    stageStatus.channel_window,
   ),
   provenance: "canonical",
  },
 }

 const trafficSnapshots = Object.fromEntries(
  TRAFFIC_DATASET_IDS.map((datasetId) => {
   const rows = aggregateTrafficRows(selectedTrafficRows.rows, datasetId)
   const readiness = getStageReadiness(rows, stageStatus.traffic_sync)
   return [
    datasetId,
    {
     datasetId,
     rows,
     readiness,
     provenance: toProvenance(readiness, rows),
     requestedWindow: analyticsWindow,
     resolvedWindow: selectedTrafficRows.resolvedWindow,
     availableWindows: selectedTrafficRows.availableWindows,
     hasRequestedWindowData: selectedTrafficRows.hasRequestedWindowData,
     usedFallbackWindow: selectedTrafficRows.usedFallbackWindow,
    } satisfies CanonicalTableDatasetSnapshot,
   ]
  }),
 ) as CanonicalTableDatasetMap

 const demographicSnapshots = Object.fromEntries(
  DEMOGRAPHIC_DATASET_IDS.map((datasetId) => {
   const rows = buildDemographicRows(selectedAudienceRows.rows, datasetId)
   const readiness = getStageReadiness(rows, stageStatus.demographics_sync)
   return [
    datasetId,
    {
     datasetId,
     rows,
     readiness,
     provenance: toProvenance(readiness, rows),
     requestedWindow: analyticsWindow,
     resolvedWindow: selectedAudienceRows.resolvedWindow,
     availableWindows: selectedAudienceRows.availableWindows,
     hasRequestedWindowData: selectedAudienceRows.hasRequestedWindowData,
     usedFallbackWindow: selectedAudienceRows.usedFallbackWindow,
    } satisfies CanonicalTableDatasetSnapshot,
   ]
  }),
 ) as CanonicalTableDatasetMap

 const geographySnapshots = Object.fromEntries(
  GEOGRAPHY_DATASET_IDS.map((datasetId) => {
   const rows = buildGeographyRows(selectedGeographyRows.rows, datasetId)
   const readiness = getStageReadiness(rows, stageStatus.geography_sync)
   return [
    datasetId,
    {
     datasetId,
     rows,
     readiness,
     provenance: toProvenance(readiness, rows),
     requestedWindow: analyticsWindow,
     resolvedWindow: selectedGeographyRows.resolvedWindow,
     availableWindows: selectedGeographyRows.availableWindows,
     hasRequestedWindowData: selectedGeographyRows.hasRequestedWindowData,
     usedFallbackWindow: selectedGeographyRows.usedFallbackWindow,
    } satisfies CanonicalTableDatasetSnapshot,
   ]
  }),
 ) as CanonicalTableDatasetMap

 return {
  ...dailySnapshots,
  ...trafficSnapshots,
  ...demographicSnapshots,
  ...geographySnapshots,
 }
}
