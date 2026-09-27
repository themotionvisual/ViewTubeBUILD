import type { VtSyncSnapshot } from "../../features/vt-sync-local/adapters/contracts"
import {
 getCanonicalIntelligenceDatasetCatalog,
 type MetricComparisonContext,
 type MetricEntityScope,
 type MetricFormatScope,
 type MetricAvailabilityForComparison,
} from "../analytics-canon"
import type { AlgorithmMetricObservation } from "./AlgorithmEvaluationEngine"
import type {
 AlgorithmEvaluationTarget,
 AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"

export interface CanonicalMetricFieldRule {
 field: string
 unit: MetricComparisonContext["unit"]
 aggregation: MetricComparisonContext["aggregation"]
}

export interface CanonicalMetricResolutionRule {
 metric: string
 datasetIds: string[]
 fields: CanonicalMetricFieldRule[]
}

type CanonicalCatalog = ReturnType<typeof getCanonicalIntelligenceDatasetCatalog>
type CanonicalDataset = CanonicalCatalog[number]

/**
 * Phase 6 semantic metric registry.
 *
 * A semantic evaluation metric can resolve from more than one canonical source
 * field. Unit and aggregation live on each source field rather than on the
 * semantic metric because similarly named concepts can be represented by
 * fundamentally different measurements (for example APV percent vs AVD
 * seconds). The comparability policy must see that distinction.
 */
export const CANONICAL_ALGORITHM_METRIC_RULES: CanonicalMetricResolutionRule[] = [
 {
  metric: "ctr",
  datasetIds: ["videos", "daily", "weekly", "monthly", "channel_totals"],
  fields: [
   { field: "impressionsCtr", unit: "percent", aggregation: "average" },
   { field: "impressionsClickThroughRate", unit: "percent", aggregation: "average" },
   { field: "clickThroughRate", unit: "percent", aggregation: "average" },
   { field: "ctr", unit: "percent", aggregation: "average" },
  ],
 },
 {
  metric: "watch_quality",
  datasetIds: ["videos", "retentions", "daily", "weekly", "monthly", "channel_totals"],
  fields: [
   { field: "averagePercentageViewed", unit: "percent", aggregation: "average" },
   { field: "avgPercentageViewed", unit: "percent", aggregation: "average" },
   { field: "averageViewPercentage", unit: "percent", aggregation: "average" },
   { field: "avgViewDuration", unit: "seconds", aggregation: "average" },
   { field: "averageViewDuration", unit: "seconds", aggregation: "average" },
  ],
 },
 {
  metric: "qualified_views",
  datasetIds: ["videos", "daily", "weekly", "monthly", "channel_totals"],
  fields: [
   { field: "engagedViews", unit: "count", aggregation: "sum" },
   { field: "views", unit: "count", aggregation: "sum" },
  ],
 },
 {
  metric: "session_continuation",
  datasetIds: ["playlists", "daily", "weekly", "monthly", "videos"],
  fields: [
   { field: "viewsPerPlaylistStart", unit: "rate", aggregation: "average" },
   { field: "endScreenElementClickRate", unit: "percent", aggregation: "average" },
   { field: "endScreenClickRate", unit: "percent", aggregation: "average" },
   { field: "endScreenClicks", unit: "count", aggregation: "sum" },
  ],
 },
 {
  metric: "followup_demand",
  datasetIds: ["traffic_detail_search_terms", "traffic_detail_suggested_videos", "traffic", "videos"],
  fields: [
   { field: "views", unit: "count", aggregation: "sum" },
   { field: "engagedViews", unit: "count", aggregation: "sum" },
   { field: "trafficViewShare", unit: "percent", aggregation: "average" },
  ],
 },
]

const numericValue = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string" || !value.trim()) return null
 const parsed = Number(value.replace(/[$,% ,]/g, ""))
 return Number.isFinite(parsed) ? parsed : null
}

const observedAtFor = (snapshot: VtSyncSnapshot) => {
 const parsed = Date.parse(snapshot.capturedAt || "")
 return Number.isFinite(parsed) ? parsed : Date.now()
}

const findVideoRow = (
 rows: Array<Record<string, unknown>>,
 videoId: string,
): { row: Record<string, unknown>; index: number } | null => {
 const index = rows.findIndex((row) => String(row.videoId || row.video || row.id || "") === videoId)
 return index >= 0 ? { row: rows[index], index } : null
}

const formatScopeFor = (value: unknown): MetricFormatScope => {
 const format = String(value || "").trim().toLowerCase()
 if (!format) return "unknown"
 if (format === "all") return "all"
 if (format.includes("short")) return "shorts"
 if (format.includes("long")) return "long"
 if (format.includes("live")) return "live"
 if (format.includes("story")) return "story"
 return "unknown"
}

const entityScopeForDataset = (datasetId: string): MetricEntityScope => {
 const id = datasetId.toLowerCase()
 if (id === "videos" || id.includes("retention")) return "video"
 if (id.includes("search")) return "search_term"
 if (id.includes("traffic")) return "traffic_source"
 if (id.includes("playlist")) return "playlist"
 if (id.includes("geo") || id.includes("city") || id.includes("province") || id.includes("dma")) return "geography"
 if (id.includes("audience") || id.includes("demographic") || id.includes("subscriber")) return "audience"
 if (id.includes("daily") || id.includes("weekly") || id.includes("monthly") || id.includes("channel")) return "channel"
 return "unknown"
}

const availabilityFor = (dataset: CanonicalDataset): MetricAvailabilityForComparison => {
 if (dataset.status === "available" || dataset.status === "stale") return "available"
 if (dataset.status === "partial") return "partial"
 return "unavailable"
}

const coverageFor = (dataset: CanonicalDataset): number | null => {
 if (dataset.status === "available") return 1
 if (dataset.status === "partial") return 0.6
 if (dataset.status === "stale") return 0.35
 return null
}

const comparisonContextFor = (input: {
 rule: CanonicalMetricResolutionRule
 field: CanonicalMetricFieldRule
 dataset: CanonicalDataset
 window?: MetricComparisonContext["window"]
 matchedVideoRow?: Record<string, unknown> | null
}): MetricComparisonContext => ({
 metricKey: input.rule.metric,
 unit: input.field.unit,
 entityScope: input.matchedVideoRow ? "video" : entityScopeForDataset(input.dataset.id),
 formatScope: input.matchedVideoRow
  ? formatScopeFor(
    input.matchedVideoRow.format
    || input.matchedVideoRow.contentType
    || input.matchedVideoRow.creatorContentType,
   )
  : "all",
 window: input.window || "unknown",
 aggregation: input.matchedVideoRow ? "snapshot" : input.field.aggregation,
 coverage: coverageFor(input.dataset),
 availability: availabilityFor(input.dataset),
})

export interface ResolvedCanonicalAlgorithmMetric {
 value: number
 evidenceId: string
 datasetId: string
 sourceField: string
 comparisonContext: MetricComparisonContext
}

export const resolveAlgorithmMetricFromCanonicalCatalog = (input: {
 catalog: CanonicalCatalog
 snapshotId: string
 videoId?: string | null
 window?: MetricComparisonContext["window"]
 rule: CanonicalMetricResolutionRule
}): ResolvedCanonicalAlgorithmMetric | null => {
 const ordered = input.rule.datasetIds
  .map((id) => input.catalog.find((dataset) => dataset.id === id))
  .filter(Boolean)

 for (const dataset of ordered) {
  if (!dataset || dataset.status === "failed" || dataset.status === "unavailable") continue

  if (input.videoId) {
   const matched = findVideoRow(dataset.sampleRows, input.videoId)
   if (matched) {
    for (const fieldRule of input.rule.fields) {
     const value = numericValue(matched.row[fieldRule.field])
     if (value == null) continue
     return {
      value,
      evidenceId: `${input.snapshotId}:${dataset.id}:${matched.index + 1}:${fieldRule.field}`,
      datasetId: dataset.id,
      sourceField: fieldRule.field,
      comparisonContext: comparisonContextFor({
       rule: input.rule,
       field: fieldRule,
       dataset,
       window: input.window,
       matchedVideoRow: matched.row,
      }),
     }
    }
   }
  }

  for (const fieldRule of input.rule.fields) {
   const summary = dataset.metrics[fieldRule.field]
   if (summary) {
    const value = fieldRule.aggregation === "sum" ? summary.sum : summary.average
    if (Number.isFinite(value)) {
     return {
      value,
      evidenceId: `${input.snapshotId}:${dataset.id}:summary:${fieldRule.field}`,
      datasetId: dataset.id,
      sourceField: fieldRule.field,
      comparisonContext: comparisonContextFor({
       rule: input.rule,
       field: fieldRule,
       dataset,
       window: input.window,
      }),
     }
    }
   }
  }

  for (const fieldRule of input.rule.fields) {
   const values = dataset.sampleRows
    .map((row) => numericValue(row[fieldRule.field]))
    .filter((value): value is number => value != null)
   if (!values.length) continue
   const value = fieldRule.aggregation === "sum"
    ? values.reduce((total, candidate) => total + candidate, 0)
    : values.reduce((total, candidate) => total + candidate, 0) / values.length
   return {
    value,
    evidenceId: `${input.snapshotId}:${dataset.id}:sample:${fieldRule.field}`,
    datasetId: dataset.id,
    sourceField: fieldRule.field,
    comparisonContext: comparisonContextFor({
     rule: input.rule,
     field: fieldRule,
     dataset,
     window: input.window,
    }),
   }
  }
 }
 return null
}

export const collectCanonicalAlgorithmObservations = (input: {
 snapshot: VtSyncSnapshot
 event: AlgorithmIntelligenceEvent
}): AlgorithmMetricObservation[] => {
 const requiredMetrics = [...new Set(input.event.evaluationTargets.map((target) => target.metric))]
 const observedAt = observedAtFor(input.snapshot)
 const catalog = getCanonicalIntelligenceDatasetCatalog(input.snapshot, 5000)
 const window = (input.snapshot.selectedTimeWindow || "lifetime") as MetricComparisonContext["window"]

 return requiredMetrics.flatMap((metric) => {
  if (metric === "diagnosis_complete") return []
  const rule = CANONICAL_ALGORITHM_METRIC_RULES.find((candidate) => candidate.metric === metric)
  if (!rule) return []
  const resolved = resolveAlgorithmMetricFromCanonicalCatalog({
   catalog,
   snapshotId: input.snapshot.snapshotId,
   videoId: input.event.videoId,
   window,
   rule,
  })
  if (!resolved) return []
  return [{
   metric,
   value: resolved.value,
   observedAt,
   evidenceId: resolved.evidenceId,
   comparisonContext: resolved.comparisonContext,
  }]
 })
}

export const hydrateEvaluationTargetsWithCanonicalBaseline = (input: {
 event: AlgorithmIntelligenceEvent
 baselineSnapshot?: VtSyncSnapshot | null
}): AlgorithmEvaluationTarget[] => {
 if (!input.baselineSnapshot) return input.event.evaluationTargets
 const baselineObservations = collectCanonicalAlgorithmObservations({
  snapshot: input.baselineSnapshot,
  event: input.event,
 })

 return input.event.evaluationTargets.map((target) => {
  const baseline = baselineObservations.find((observation) => observation.metric === target.metric)
  if (!baseline) return target
  return {
   ...target,
   baselineValue: target.baselineValue ?? baseline.value,
   baselineComparisonContext: target.baselineComparisonContext ?? baseline.comparisonContext ?? null,
  }
 })
}

export const buildCanonicalEvaluationEvidence = (input: {
 event: AlgorithmIntelligenceEvent
 currentSnapshot: VtSyncSnapshot
 baselineSnapshot?: VtSyncSnapshot | null
}) => ({
 observations: collectCanonicalAlgorithmObservations({
  snapshot: input.currentSnapshot,
  event: input.event,
 }),
 evaluationTargets: hydrateEvaluationTargetsWithCanonicalBaseline({
  event: input.event,
  baselineSnapshot: input.baselineSnapshot,
 }),
 currentSnapshotId: input.currentSnapshot.snapshotId,
 baselineSnapshotId: input.baselineSnapshot?.snapshotId || null,
})
