import type { CsvMajorFamily } from "../types"

export type AnalyticsSyncSpeedClass = "fast" | "medium" | "bulk_delayed" | "manual_csv_only"
export type AnalyticsSyncQuotaCostClass = "low" | "medium" | "high"
export type AnalyticsSyncSource = "youtube_analytics_api" | "youtube_reporting_api" | "youtube_data_api" | "csv_import"
export type AnalyticsSyncAction =
 | "core_video_data"
 | "daily_metrics"
 | "video_metrics"
 | "traffic"
 | "geography"
 | "audience"
 | "surfaces_discovery"
 | "revenue_monetization"
 | "reporting_bulk"
 | "comments"
 | "deep_data"

export type AnalyticsSyncRegistryRow = {
 action: AnalyticsSyncAction
 datasetFamily: CsvMajorFamily | "comments" | "reporting_bulk"
 label: string
 description: string
 source: AnalyticsSyncSource
 grain: string
 speedClass: AnalyticsSyncSpeedClass
 quotaCostClass: AnalyticsSyncQuotaCostClass
 requiresOAuth: boolean
 fallbackToCsv: boolean
 notes: string
 enrichmentMode?: "core" | "video_metrics" | "traffic" | "segments" | "all"
 batchMode?: "initial" | "next"
}

export const ANALYTICS_SYNC_REGISTRY: AnalyticsSyncRegistryRow[] = [
 {
  action: "core_video_data",
  datasetFamily: "video_data",
  label: "Sync Core Video Data",
  description: "Channel profile, videos, and baseline hard-number metrics.",
  source: "youtube_analytics_api",
  grain: "video",
  speedClass: "fast",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Best first sync for charts and tables.",
  enrichmentMode: "core",
  batchMode: "initial",
 },
 {
  action: "video_metrics",
  datasetFamily: "video_data",
  label: "Sync More Video Metrics",
  description: "Daily metrics, extra per-video metrics, and format splits.",
  source: "youtube_analytics_api",
  grain: "video,daily",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Adds richer video columns and daily metrics.",
  enrichmentMode: "video_metrics",
  batchMode: "initial",
 },
 {
  action: "daily_metrics",
  datasetFamily: "daily_metrics",
  label: "Sync Daily Metrics",
  description: "Channel day-by-day analytics window data.",
  source: "youtube_analytics_api",
  grain: "day",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Currently rides the video-metrics enrichment path.",
  enrichmentMode: "video_metrics",
  batchMode: "initial",
 },
 {
  action: "traffic",
  datasetFamily: "traffic",
  label: "Sync Traffic",
  description: "Traffic source overview, daily, video, and supported detail breakdowns.",
  source: "youtube_analytics_api",
  grain: "source,day,video",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Uses Analytics API first and keeps diagnostics for unsupported detail shapes.",
  enrichmentMode: "traffic",
  batchMode: "initial",
 },
 {
  action: "geography",
  datasetFamily: "geography",
  label: "Sync Geography",
  description: "Country-level geography plus supported city and province splits.",
  source: "youtube_analytics_api",
  grain: "country,city,province",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Currently grouped in the deep segments pass.",
  enrichmentMode: "segments",
  batchMode: "initial",
 },
 {
  action: "audience",
  datasetFamily: "audience",
  label: "Sync Audience",
  description: "Age, gender, and subscribed-status audience data.",
  source: "youtube_analytics_api",
  grain: "demographic",
  speedClass: "medium",
  quotaCostClass: "medium",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Currently grouped in the deep segments pass.",
  enrichmentMode: "segments",
  batchMode: "initial",
 },
 {
  action: "surfaces_discovery",
  datasetFamily: "surfaces_discovery",
  label: "Sync Surfaces & Discovery",
  description: "Playback location and other discovery surfaces where supported.",
  source: "youtube_reporting_api",
  grain: "surface",
  speedClass: "bulk_delayed",
  quotaCostClass: "low",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Most of this family is CSV-first or Reporting-first today.",
  enrichmentMode: "all",
  batchMode: "initial",
 },
 {
  action: "revenue_monetization",
  datasetFamily: "revenue_monetization",
  label: "Sync Revenue & Monetization",
  description: "Revenue, ad-type, and monetization-specific statistics.",
  source: "youtube_analytics_api",
  grain: "video,dimension",
  speedClass: "medium",
  quotaCostClass: "high",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Some detail cuts remain CSV-only depending on report shape.",
  enrichmentMode: "all",
  batchMode: "initial",
 },
 {
  action: "reporting_bulk",
  datasetFamily: "reporting_bulk",
  label: "Sync Reporting Bulk",
  description: "Warehouse-style historical report jobs with 48-hour startup delay.",
  source: "youtube_reporting_api",
  grain: "bulk",
  speedClass: "bulk_delayed",
  quotaCostClass: "low",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Use for broad historical coverage, not first-screen readiness.",
 },
 {
  action: "comments",
  datasetFamily: "comments",
  label: "Sync Comments",
  description: "Full comments and replies with pagination and date limits.",
  source: "youtube_data_api",
  grain: "comment",
  speedClass: "medium",
  quotaCostClass: "high",
  requiresOAuth: true,
  fallbackToCsv: false,
  notes: "Later path only; not part of default analytics sync.",
 },
 {
  action: "deep_data",
  datasetFamily: "traffic",
  label: "Sync All Deep Data",
  description: "Manual deep pass across traffic, audience, geography, and current extended metrics.",
  source: "youtube_analytics_api",
  grain: "mixed",
  speedClass: "medium",
  quotaCostClass: "high",
  requiresOAuth: true,
  fallbackToCsv: true,
  notes: "Current catch-all path while the family-specific sync registry is being split out.",
  enrichmentMode: "all",
  batchMode: "initial",
 },
]
