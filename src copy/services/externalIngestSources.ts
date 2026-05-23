import type { IngestSourceContract } from "./analyticsContract"

export interface ExternalIngestSource {
 id: IngestSourceContract
 label: string
 enabled: boolean
 mode: "api" | "file_import"
 notes: string
}

export const EXTERNAL_INGEST_SOURCES: ExternalIngestSource[] = [
 {
  id: "youtube_data_v3",
  label: "YouTube Data API v3",
  enabled: true,
  mode: "api",
  notes: "Active source for channel/video metadata and upload state.",
 },
 {
  id: "youtube_analytics_v2",
  label: "YouTube Analytics API v2",
  enabled: true,
  mode: "api",
  notes: "Active source for canonical metric timelines and video-level analytics.",
 },
 {
  id: "youtube_reporting",
  label: "YouTube Reporting API",
  enabled: false,
  mode: "api",
  notes: "Staged connector scaffolded; enable when reporting jobs and OAuth scopes are configured.",
 },
 {
  id: "google_search_console",
  label: "Google Search Console",
  enabled: false,
  mode: "api",
  notes: "Planned first Google connector for query/impression/click/CTR enrichment.",
 },
 {
  id: "csv",
  label: "CSV Imports",
  enabled: true,
  mode: "file_import",
  notes: "Supports channel-disconnected analytics workflows and CSV-only metrics.",
 },
 {
  id: "google_sheets",
  label: "Google Sheets Imports",
  enabled: true,
  mode: "file_import",
  notes: "Sheets export bridge remains available for non-connected channel analysis.",
 },
]

export const getEnabledIngestSources = (): ExternalIngestSource[] =>
 EXTERNAL_INGEST_SOURCES.filter((source) => source.enabled)

