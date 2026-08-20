import type {
 AnalyticsWindow,
 CanonicalMetricMetaMap,
 CanonicalNumericMetricMap,
 CanonicalRawAuditEntry,
 CanonicalTrafficDiagnosticEntry,
 CanonicalTrafficRow,
 CanonicalVideoRecord,
} from "./contracts"
import { getWindowRange } from "./query"
import {
 normalizeTrafficSourceType,
 syncTrafficAnalytics,
 type NormalizedTrafficRow,
 type TrafficDiagnosticEntry,
} from "../youtube/trafficAnalyticsSync"

const TRAFFIC_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"]

const TRAFFIC_METRIC_KEYS = [
 "views",
 "watchHours",
 "watchMinutes",
 "averageViewDuration",
 "engagedViews",
 "averagePercentageViewed",
 "impressions",
 "ctr",
 "premiumViews",
 "premiumWatchHours",
 "playlistWatchHours",
 "viewsFromPlaylist",
 "viewsPerPlaylistStart",
] as const

const unavailableMetricSet = (rows: NormalizedTrafficRow[]): Set<string> => {
 const unavailable = new Set<string>()
 TRAFFIC_METRIC_KEYS.forEach((metricKey) => {
  if (!rows.some((row) => typeof row[metricKey] === "number")) {
   unavailable.add(metricKey)
  }
 })
 return unavailable
}

const buildMetricMaps = (
 row: NormalizedTrafficRow,
 unavailableMetrics: Set<string>,
 syncedAt: string,
 source: CanonicalTrafficRow["source"],
): { metrics: CanonicalNumericMetricMap; metricMeta: CanonicalMetricMetaMap } => {
 const metrics: CanonicalNumericMetricMap = {}
 const metricMeta: CanonicalMetricMetaMap = {}
 TRAFFIC_METRIC_KEYS.forEach((metricKey) => {
  const raw = row[metricKey]
  const numeric = typeof raw === "number" && Number.isFinite(raw) ? raw : null
  metrics[metricKey] = numeric
  metricMeta[metricKey] = {
   source,
   availability: numeric !== null ? "available" : unavailableMetrics.has(metricKey)
    ? "unavailable"
    : "unsupported",
   reasonCode:
    numeric !== null
     ? undefined
     : unavailableMetrics.has(metricKey)
      ? "traffic_metric_not_returned"
      : "traffic_metric_not_supported",
   confidence: "raw_direct",
   syncedAt,
  }
 })
 return { metrics, metricMeta }
}

const compactAuditPayload = (
 rows: NormalizedTrafficRow[],
 diagnosticsCount: number,
 source: CanonicalTrafficRow["source"],
 datasetKind: CanonicalTrafficRow["datasetKind"],
) => ({
 source,
 datasetKind,
 rowCount: rows.length,
 sample: rows.slice(0, 5).map((row) => ({
  date: row.date,
  videoId: row.videoId,
  trafficSourceType: row.trafficSourceType,
  trafficSourceDetail: row.trafficSourceDetail,
  views: row.views,
  watchHours: row.watchHours,
 })),
 diagnosticsCount,
})

const mapTrafficDiagnostic = (
 channelId: string,
 syncRunId: string,
 window: AnalyticsWindow,
 source: CanonicalTrafficDiagnosticEntry["source"],
 entry: TrafficDiagnosticEntry,
 index: number,
 datasetKind?: CanonicalTrafficDiagnosticEntry["datasetKind"],
): CanonicalTrafficDiagnosticEntry => ({
 id: `${syncRunId}::traffic_diagnostic::${window}::${source}::${entry.code}::${index}`,
 channelId,
 createdAt: new Date().toISOString(),
 source,
 syncRunId,
 window,
 datasetKind,
 code: entry.code,
 severity: entry.severity,
 message: entry.message,
 trafficSourceType: entry.sourceType,
 requestShape: entry.requestShape,
 reason: entry.reason,
})

const toDatasetKind = (
 row: NormalizedTrafficRow,
 source: CanonicalTrafficRow["source"],
): CanonicalTrafficRow["datasetKind"] => {
 if (source === "reporting_api" || row.trafficTableType === "traffic_reporting_bulk") {
  return "traffic_reporting_bulk"
 }
 if (row.trafficTableType === "playback_location_daily_by_type") {
  return "traffic_playback_location_daily"
 }
 if (row.trafficTableType === "playback_location_overview") {
  return "traffic_playback_location"
 }
 if (row.trafficTableType === "traffic_daily_by_type") return "traffic_daily"
 if (row.trafficTableType === "traffic_video_by_type") return "traffic_video"
 if (row.trafficTableType === "traffic_detail_by_type") return "traffic_detail"
 return "traffic_summary"
}

const normalizeRow = (
 row: NormalizedTrafficRow,
 channelId: string,
 window: AnalyticsWindow,
 unavailableMetrics: Set<string>,
 source: CanonicalTrafficRow["source"],
 syncedAt: string,
): CanonicalTrafficRow => {
 const datasetKind = toDatasetKind(row, source)
 const entityType = datasetKind === "traffic_video" && row.videoId ? "video" : "channel"
 const entityId = entityType === "video" && row.videoId ? row.videoId : channelId
 const { metrics, metricMeta } = buildMetricMaps(row, unavailableMetrics, syncedAt, source)
 return {
  channelId,
  datasetKind,
  source,
  entityType,
  entityId,
  window,
  date: row.date || null,
  trafficSourceType: String(row.trafficSourceType || "UNKNOWN"),
  trafficSourceDetail: row.trafficSourceDetail || null,
  sourceLabel: row.sourceLabel || null,
  sourceTitle: row.sourceTitle || null,
  sourceVideoId: row.sourceVideoId || null,
  resolvedEntityId: row.resolvedEntityId || null,
  resolvedEntityType: row.resolvedEntityType || null,
  resolvedEntityTitle: row.resolvedEntityTitle || null,
  resolvedEntityHandle: row.resolvedEntityHandle || null,
  resolvedEntityUrl: row.resolvedEntityUrl || null,
  resolvedEntitySubtitle: row.resolvedEntitySubtitle || null,
  metrics,
  metricMeta,
  syncedAt,
 }
}

export const syncTrafficRows = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = TRAFFIC_WINDOWS,
): Promise<{
 rows: CanonicalTrafficRow[]
 diagnostics: CanonicalTrafficDiagnosticEntry[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const rows: CanonicalTrafficRow[] = []
 const diagnostics: CanonicalTrafficDiagnosticEntry[] = []
 const audit: CanonicalRawAuditEntry[] = []
 const targetVideoIds = records
  .slice()
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
  .slice(0, 50)
  .map((record) => record.videoId)

 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window)
  const result = await syncTrafficAnalytics({
   startDate,
   endDate,
   channelId,
   targetVideoIds,
   includeReporting: false,
   reportingMode: "diagnose",
   detailVideoLimit: 50,
  })
  const syncedAt = new Date().toISOString()
  const grouped: Array<{
   source: CanonicalTrafficRow["source"]
   datasetKind: CanonicalTrafficRow["datasetKind"]
   entries: NormalizedTrafficRow[]
  }> = [
   {
    source: "analytics_api",
    datasetKind: "traffic_summary",
    entries: result.trafficOverview,
   },
   {
    source: "analytics_api",
    datasetKind: "traffic_daily",
    entries: result.trafficDailyByType,
   },
   {
    source: "analytics_api",
    datasetKind: "traffic_video",
    entries: result.trafficVideoByType,
   },
   {
    source: "analytics_api",
    datasetKind: "traffic_detail",
   entries: result.trafficDetailByType,
  },
   {
    source: "analytics_api",
    datasetKind: "traffic_playback_location",
    entries: result.playbackLocationOverview,
   },
   {
    source: "analytics_api",
    datasetKind: "traffic_playback_location_daily",
    entries: result.playbackLocationDailyByType,
   },
  ]

  grouped.forEach(({ source, datasetKind, entries }) => {
   const unavailableMetrics = unavailableMetricSet(entries)
   rows.push(
    ...entries.map((entry) =>
     normalizeRow(entry, channelId, window, unavailableMetrics, source, syncedAt),
    ),
   )
   audit.push({
    id: `${syncRunId}::traffic_sync::${datasetKind}::${window}`,
    channelId,
    syncRunId,
    stage: "traffic_sync",
    source,
    window,
    recordedAt: syncedAt,
    payload: compactAuditPayload(entries, result.trafficDiagnostics.entries.length, source, datasetKind),
   })
  })

  diagnostics.push(
   ...result.trafficDiagnostics.entries.map((entry, index) =>
    mapTrafficDiagnostic(channelId, syncRunId, window, "analytics_api", entry, index),
   ),
  )
 }

 return { rows, diagnostics, audit }
}
