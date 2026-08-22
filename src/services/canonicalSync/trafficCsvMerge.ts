import type { CsvFileWithTag } from "../../types"
import { buildCsvFilesWithTags } from "../csvPackageIngestion"
import type {
 AnalyticsWindow,
 CanonicalMetricMetaMap,
 CanonicalNumericMetricMap,
 CanonicalTrafficDiagnosticEntry,
 CanonicalTrafficMergeResult,
 CanonicalTrafficRow,
} from "./contracts"
import { normalizeTrafficSourceType } from "../youtube/trafficAnalyticsSync"

const TRAFFIC_DETAIL_CATEGORY_TO_TYPE: Record<string, string> = {
 traffic_youtube_search: "YT_SEARCH",
 traffic_external: "EXT_URL",
 traffic_suggested_videos: "RELATED_VIDEO",
 traffic_youtube_features: "SUBSCRIBER",
 traffic_shorts_feed: "SHORTS",
}

const numeric = (value: unknown): number | null =>
 typeof value === "number" && Number.isFinite(value) ? value : null

const stringValue = (value: unknown): string => String(value ?? "").trim()

const defaultWindow = (value?: AnalyticsWindow): AnalyticsWindow => value || "lifetime"

const buildMetricMaps = (
 row: Record<string, unknown>,
 syncedAt: string,
): { metrics: CanonicalNumericMetricMap; metricMeta: CanonicalMetricMetaMap } => {
 const metrics: CanonicalNumericMetricMap = {
  views: numeric(row["Views"]),
  watchHours: numeric(row["Watch time (hours)"]),
  engagedViews: numeric(row["Engaged views"]),
  averagePercentageViewed: numeric(row["Average percentage viewed (%)"]),
  averageViewDuration: numeric(row["Average view duration"]),
  impressions: numeric(row["Impressions"]),
  ctr: numeric(row["Impressions click-through rate (%)"]),
 }
 const metricMeta: CanonicalMetricMetaMap = {}
 Object.entries(metrics).forEach(([metricKey, metricValue]) => {
  metricMeta[metricKey] = {
   source: "csv",
   availability: metricValue === null ? "unavailable" : "available",
   reasonCode: metricValue === null ? "csv_metric_missing" : undefined,
   confidence: "raw_direct",
   syncedAt,
  }
 })
 return { metrics, metricMeta }
}

const trafficTypeFromRow = (row: Record<string, unknown>, file: CsvFileWithTag): string => {
 const explicit =
  stringValue(row["Source type"]) ||
  stringValue(row["Traffic source type"]) ||
  TRAFFIC_DETAIL_CATEGORY_TO_TYPE[file.detectedCategory || ""] ||
  stringValue(row["Traffic source"])
 return normalizeTrafficSourceType(explicit) || explicit || "UNKNOWN"
}

const summaryRowsFromFile = (
 channelId: string,
 file: CsvFileWithTag,
 syncedAt: string,
): CanonicalTrafficRow[] =>
 (file.data || []).map((row) => {
  const sourceType = trafficTypeFromRow(row, file)
  const { metrics, metricMeta } = buildMetricMaps(row, syncedAt)
  return {
   channelId,
   datasetKind: "traffic_summary",
   source: "csv",
   entityType: "channel",
   entityId: channelId,
   window: defaultWindow(file.analyticsWindow),
   trafficSourceType: sourceType,
   trafficSourceDetail: null,
   sourceLabel: stringValue(row["Traffic source"]) || sourceType,
   sourceTitle: stringValue(row["Traffic source"]) || null,
   sourceVideoId: null,
   metrics,
   metricMeta,
   syncedAt,
  }
 })

const detailRowsFromFile = (
 channelId: string,
 file: CsvFileWithTag,
 syncedAt: string,
): CanonicalTrafficRow[] =>
 (file.data || []).map((row) => {
  const sourceType = trafficTypeFromRow(row, file)
  const detail =
   stringValue(row["Source title"]) ||
   stringValue(row["Traffic source"]) ||
   stringValue(row["Source detail"])
  const { metrics, metricMeta } = buildMetricMaps(row, syncedAt)
  return {
   channelId,
   datasetKind: "traffic_detail",
   source: "csv",
   entityType: "channel",
   entityId: channelId,
   window: defaultWindow(file.analyticsWindow),
   trafficSourceType: sourceType,
   trafficSourceDetail: detail || null,
   sourceLabel: detail || sourceType,
   sourceTitle: detail || null,
   sourceVideoId: null,
   metrics,
   metricMeta,
   syncedAt,
  }
 })

const buildSkippedDiagnostic = (
 channelId: string,
 syncRunId: string,
 file: CsvFileWithTag,
 message: string,
): CanonicalTrafficDiagnosticEntry => ({
 id: `${syncRunId}::traffic_csv::skip::${file.id}`,
 channelId,
 createdAt: new Date().toISOString(),
 source: "csv",
 syncRunId,
 code: "traffic_csv_member_skipped",
 severity: "warning",
 message,
 packageName: file.packageName,
 fileName: file.name,
 memberRole: file.packageMemberRole,
})

export const mergeTrafficCsvFiles = async (
 channelId: string,
 files: File[],
 syncRunId: string,
): Promise<CanonicalTrafficMergeResult> => {
 const tagged = await buildCsvFilesWithTags(files, "traffic")
 const rows: CanonicalTrafficRow[] = []
 const diagnostics: CanonicalTrafficDiagnosticEntry[] = []
 const acceptedFiles: string[] = []
 const skippedFiles: string[] = []
 const syncedAt = new Date().toISOString()

 tagged.forEach((file) => {
  const mergeTarget = file.mergeTargetDataset
  const memberRole = file.packageMemberRole
  const isTrafficFamily =
   mergeTarget === "traffic_summary" || mergeTarget === "traffic_detail"
  const isBannedMember = memberRole === "chart_data" || memberRole === "totals"
  if (isBannedMember) {
   skippedFiles.push(file.name)
   diagnostics.push(
    buildSkippedDiagnostic(
     channelId,
     syncRunId,
     file,
     "Chart data.csv and Totals.csv are excluded from canonical traffic ingestion.",
    ),
   )
   return
  }
  if (!isTrafficFamily) return
  if (memberRole !== "table_data" && memberRole !== "loose_table_data") {
   skippedFiles.push(file.name)
   diagnostics.push(
    buildSkippedDiagnostic(
     channelId,
     syncRunId,
     file,
     "Traffic CSV member skipped because it is not a table-data style file.",
    ),
   )
   return
  }
  acceptedFiles.push(file.name)
  if (mergeTarget === "traffic_summary") {
   rows.push(...summaryRowsFromFile(channelId, file, syncedAt))
   return
  }
  rows.push(...detailRowsFromFile(channelId, file, syncedAt))
 })

 return {
  acceptedFiles,
  skippedFiles,
  rowCount: rows.length,
  diagnosticCount: diagnostics.length,
  rows,
  diagnostics,
 }
}
