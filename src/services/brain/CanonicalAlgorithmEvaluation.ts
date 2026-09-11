import type { VtSyncSnapshot } from "../../features/vt-sync-local/adapters/contracts"
import { getCanonicalIntelligenceDatasetCatalog } from "../analytics-canon"
import type { AlgorithmMetricObservation } from "./AlgorithmEvaluationEngine"
import type {
 AlgorithmEvaluationTarget,
 AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"

export interface CanonicalMetricResolutionRule {
 metric: string
 datasetIds: string[]
 fields: string[]
 aggregation: "sum" | "average"
}

type CanonicalCatalog = ReturnType<typeof getCanonicalIntelligenceDatasetCatalog>

/**
 * Phase 6 semantic metric registry.
 *
 * These are evaluation concepts used by the Brain, not new analytics fields.
 * Resolution stays on top of analytics-canon and only maps a concept to an
 * already-canonical metric when that evidence actually exists.
 */
export const CANONICAL_ALGORITHM_METRIC_RULES: CanonicalMetricResolutionRule[] = [
 {
  metric: "ctr",
  datasetIds: ["videos", "daily", "weekly", "monthly", "channel_totals"],
  fields: ["impressionsCtr", "impressionsClickThroughRate", "clickThroughRate", "ctr"],
  aggregation: "average",
 },
 {
  metric: "watch_quality",
  datasetIds: ["videos", "retentions", "daily", "weekly", "monthly", "channel_totals"],
  fields: ["averagePercentageViewed", "avgPercentageViewed", "averageViewPercentage", "avgViewDuration", "averageViewDuration"],
  aggregation: "average",
 },
 {
  metric: "qualified_views",
  datasetIds: ["videos", "daily", "weekly", "monthly", "channel_totals"],
  fields: ["engagedViews", "views"],
  aggregation: "sum",
 },
 {
  metric: "session_continuation",
  datasetIds: ["playlists", "daily", "weekly", "monthly", "videos"],
  fields: ["viewsPerPlaylistStart", "endScreenElementClickRate", "endScreenClickRate", "endScreenClicks"],
  aggregation: "average",
 },
 {
  metric: "followup_demand",
  datasetIds: ["traffic_detail_search_terms", "traffic_detail_suggested_videos", "traffic", "videos"],
  fields: ["views", "engagedViews", "trafficViewShare"],
  aggregation: "sum",
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

export const resolveAlgorithmMetricFromCanonicalCatalog = (input: {
 catalog: CanonicalCatalog
 snapshotId: string
 videoId?: string | null
 rule: CanonicalMetricResolutionRule
}): { value: number; evidenceId: string } | null => {
 const ordered = input.rule.datasetIds
  .map((id) => input.catalog.find((dataset) => dataset.id === id))
  .filter(Boolean)

 for (const dataset of ordered) {
  if (!dataset || dataset.status === "failed" || dataset.status === "unavailable") continue

  if (input.videoId) {
   const matched = findVideoRow(dataset.sampleRows, input.videoId)
   if (matched) {
    for (const field of input.rule.fields) {
     const value = numericValue(matched.row[field])
     if (value == null) continue
     return {
      value,
      evidenceId: `${input.snapshotId}:${dataset.id}:${matched.index + 1}:${field}`,
     }
    }
   }
  }

  for (const field of input.rule.fields) {
   const summary = dataset.metrics[field]
   if (summary) {
    const value = input.rule.aggregation === "sum" ? summary.sum : summary.average
    if (Number.isFinite(value)) {
     return {
      value,
      evidenceId: `${input.snapshotId}:${dataset.id}:summary:${field}`,
     }
    }
   }
  }

  for (const field of input.rule.fields) {
   const values = dataset.sampleRows
    .map((row) => numericValue(row[field]))
    .filter((value): value is number => value != null)
   if (!values.length) continue
   const value = input.rule.aggregation === "sum"
    ? values.reduce((total, candidate) => total + candidate, 0)
    : values.reduce((total, candidate) => total + candidate, 0) / values.length
   return {
    value,
    evidenceId: `${input.snapshotId}:${dataset.id}:sample:${field}`,
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
 // Request enough canonical rows to resolve a concrete video when present. The
 // catalog remains privacy-filtered because analytics-canon owns row exposure.
 const catalog = getCanonicalIntelligenceDatasetCatalog(input.snapshot, 5000)
 return requiredMetrics.flatMap((metric) => {
  // Workflow/tool completion is intentionally not fabricated from analytics.
  if (metric === "diagnosis_complete") return []
  const rule = CANONICAL_ALGORITHM_METRIC_RULES.find((candidate) => candidate.metric === metric)
  if (!rule) return []
  const resolved = resolveAlgorithmMetricFromCanonicalCatalog({
   catalog,
   snapshotId: input.snapshot.snapshotId,
   videoId: input.event.videoId,
   rule,
  })
  if (!resolved) return []
  return [{
   metric,
   value: resolved.value,
   observedAt,
   evidenceId: resolved.evidenceId,
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
  if (target.baselineValue != null) return target
  const baseline = baselineObservations.find((observation) => observation.metric === target.metric)
  return baseline?.value == null ? target : { ...target, baselineValue: baseline.value }
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
