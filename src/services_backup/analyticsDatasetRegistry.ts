import type {
 AnalyticsDatasetFamilyRegistryRow,
 AnalyticsDatasetSourcePolicy,
 CsvMajorFamily,
 CsvSubtableId,
} from "../types"
import { ANALYTICS_SYNC_REGISTRY } from "./analytics/SyncPipeline"
import { CSV_MAJOR_FAMILY_STYLES, CSV_FAMILY_DEFINITIONS } from "./csvTaxonomy"

export const ANALYTICS_DATASET_SOURCE_POLICIES: AnalyticsDatasetSourcePolicy[] = [
 {
  id: "youtube_analytics_api",
  label: "Fast API Sync",
  sourceType: "youtube_analytics_api",
  speedClass: "fast",
  requiresOAuth: true,
  bestFor: "Core video metrics, daily metrics, traffic, audience, geography, and supported monetization rows.",
  guidance: "Use first for connected, interactive channel analytics.",
 },
 {
  id: "youtube_data_api",
  label: "Public Channel / Video Data",
  sourceType: "youtube_data_api",
  speedClass: "fast",
  requiresOAuth: false,
  bestFor: "Video metadata, titles, thumbnails, identifiers, and public lifetime counts.",
  guidance: "Use for metadata and public resource totals, not detailed breakdown tables.",
 },
 {
  id: "youtube_reporting_api",
  label: "Reporting / Bulk History",
  sourceType: "youtube_reporting_api",
  speedClass: "bulk_delayed",
  requiresOAuth: true,
  bestFor: "Historical bulk warehousing and slower reporting-backed families.",
  guidance: "Use for broader delayed coverage, not first-screen readiness.",
 },
 {
  id: "studio_csv",
  label: "CSV Uploads",
  sourceType: "studio_csv",
  speedClass: "manual_csv_only",
  requiresOAuth: false,
  bestFor: "Studio-only metrics, upload verification, exact breakdown exports, and retention packages.",
  guidance: "Use when the API path cannot expose the exact YouTube Studio table shape.",
 },
]

const prioritizeSources = (majorFamily: CsvMajorFamily): AnalyticsDatasetSourcePolicy["sourceType"][] => {
 switch (majorFamily) {
  case "video_data":
   return ["youtube_analytics_api", "youtube_data_api", "studio_csv"]
  case "daily_metrics":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "traffic":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "geography":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "audience":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  case "surfaces_discovery":
   return ["studio_csv", "youtube_reporting_api", "youtube_analytics_api"]
  case "revenue_monetization":
   return ["youtube_analytics_api", "studio_csv", "youtube_reporting_api"]
  default:
   return ["studio_csv"]
 }
}

const csvOnlyGapLabels = (majorFamily: CsvMajorFamily): string[] => {
 switch (majorFamily) {
  case "video_data":
   return ["Impressions", "CTR", "Stayed to watch (%)"]
  case "daily_metrics":
   return [
    "Stayed to watch (%)",
    "New viewers",
    "Casual viewers",
    "Returning viewers",
    "Regular viewers",
   ]
  case "audience":
   return ["Retention packages", "New / returning viewer windows"]
  case "surfaces_discovery":
   return ["Some cards, end-screen, subtitle, post, and translation exports"]
  case "revenue_monetization":
   return ["Revenue source and ad-type Studio cuts"]
  default:
   return []
 }
}

export const ANALYTICS_DATASET_FAMILY_REGISTRY: AnalyticsDatasetFamilyRegistryRow[] = (
 Object.keys(CSV_MAJOR_FAMILY_STYLES) as CsvMajorFamily[]
)
 .filter((majorFamily) => majorFamily !== "unknown")
 .map((majorFamily) => {
  const familyDefs = Object.values(CSV_FAMILY_DEFINITIONS).filter(
   (definition) => definition.majorFamily === majorFamily,
  )
  const subtableIds = Array.from(
   new Set(familyDefs.map((definition) => definition.subtableId)),
  ) as CsvSubtableId[]
  const syncActionLabels = ANALYTICS_SYNC_REGISTRY.filter(
   (row) => row.datasetFamily === majorFamily,
  ).map((row) => row.label)

  return {
   majorFamily,
   label: CSV_MAJOR_FAMILY_STYLES[majorFamily].label,
   subtableIds,
   syncActionLabels,
   sourcePriority: prioritizeSources(majorFamily),
   csvOnlyGaps: csvOnlyGapLabels(majorFamily),
  }
 })

export const getAnalyticsDatasetFamilyRegistryRow = (
 majorFamily: CsvMajorFamily,
): AnalyticsDatasetFamilyRegistryRow => {
 return (
  ANALYTICS_DATASET_FAMILY_REGISTRY.find((row) => row.majorFamily === majorFamily) || {
   majorFamily,
   label: CSV_MAJOR_FAMILY_STYLES[majorFamily]?.label || majorFamily,
   subtableIds: [],
   syncActionLabels: [],
   sourcePriority: ["studio_csv"],
   csvOnlyGaps: [],
  }
 )
}
