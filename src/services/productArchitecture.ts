export type MasterTableType =
 | "master_channel_identity"
 | "master_video_core"
 | "master_video_metadata_enriched"
 | "master_audience"
 | "master_geography"
 | "master_traffic"
 | "master_device_playback"
 | "master_retention"
 | "master_monetization"
 | "master_external_signals"
 | "master_formula_metrics"
 | "master_coverage_registry"

export type IngestMode = "connected" | "import" | "hybrid" | "public_handle"

export type MetricAccuracyClass =
 | "exact"
 | "derived_exact"
 | "estimated"
 | "unavailable"

export type CoverageStatus = "received" | "missing" | "not_applicable" | "not_connected"

export type CoverageScope =
 | "channel"
 | "video_shared"
 | "short_only"
 | "long_only"
 | "geo"
 | "demographic"
 | "traffic"
 | "device"
 | "retention"
 | "monetization"
 | "history"

export interface CoverageRegistryRow {
 categoryName: string
 canonicalKey: string
 source: "youtube" | "ga4" | "history_placeholder" | "derived"
 scope: CoverageScope
 example: string
 exampleChannel: string
 status: CoverageStatus
}

export interface MetricRegistryRow {
 canonicalKey: string
 aliases: string[]
 applicability: CoverageScope
 sourceCapability: "api" | "csv_only" | "derived" | "unsupported"
}

export interface SyncDiagnosticsFailure {
 group: string
 ids: string
 metrics: string[]
 status?: number
 reason: string
 requestClass?: string
 capabilityKey?: string
 reasonCode?: string
 accountContext?: "creator" | "content_owner" | "unknown"
 attemptedShape?: {
  dimensions?: string
  includesSort?: boolean
  includesStartIndex?: boolean
  includesMaxResults?: boolean
  includeContentType?: boolean
 }
 outcome?:
  | "failed"
  | "split_retry"
  | "suppressed"
  | "quarantined"
  | "fallback_succeeded"
}

export interface SyncDiagnosticsGroup {
 metricsAttempted: string[]
 idsTried: number
 failedAttempts: number
 rowsReturned: number
}

export interface SyncDiagnostics {
 attemptedGroups: Record<string, SyncDiagnosticsGroup>
 disabledMetrics: string[]
 failureReasons: SyncDiagnosticsFailure[]
 knownInvalidCombos: string[]
 // Gate A: bounded split-on-400 retries for filtered video queries.
 splitRetries: number
 // Debug helpers for request sizing.
 maxRequestChars: number
 requestCharCounts: number[]
}

export interface DomainTableRow extends Record<string, unknown> {
 canonicalKey: string
 displayName: string
 source: string
 scope: CoverageScope
 accuracyClass: MetricAccuracyClass
 value: string | number | null
 sampledFrom?: string
 sampledAt: string
}

export interface MasterTableBundle {
 generatedAt: string
 ingestMode: IngestMode
 tables: Record<MasterTableType, DomainTableRow[]>
}

export const MASTER_TABLE_LABELS: Record<MasterTableType, string> = {
 master_channel_identity: "Channel Identity",
 master_video_core: "Video Core",
 master_video_metadata_enriched: "Video Metadata Enriched",
 master_audience: "Audience",
 master_geography: "Geography",
 master_traffic: "Traffic",
 master_device_playback: "Device & Playback",
 master_retention: "Retention",
 master_monetization: "Monetization",
 master_external_signals: "External Signals",
 master_formula_metrics: "Formula Metrics",
 master_coverage_registry: "Coverage Registry",
}

export const INGEST_MODE_STORAGE_KEY = "vt_ingest_mode"

export const getStoredIngestMode = (): IngestMode => {
 try {
  const raw = localStorage.getItem(INGEST_MODE_STORAGE_KEY)
  if (
   raw === "connected" ||
   raw === "import" ||
   raw === "hybrid" ||
   raw === "public_handle"
  ) {
   return raw
  }
 } catch {
  // no-op
 }
 return "connected"
}

export const setStoredIngestMode = (mode: IngestMode): void => {
 localStorage.setItem(INGEST_MODE_STORAGE_KEY, mode)
}
