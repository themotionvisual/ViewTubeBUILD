import type {
 CanonicalIntelligenceDatasetManifest,
 CanonicalIntelligenceEvidenceBundle,
 CanonicalIntelligenceMetricSummary,
} from "../analytics-canon"

export type StatisticsEvidenceConfidence = "high" | "medium" | "low" | "insufficient"

export interface StatisticsMetricEvidence {
 datasetId: string
 metric: string
 count: number
 sum: number
 average: number
 minimum: number
 maximum: number
 range: number
 evidenceRef: string | null
}

export interface StatisticsIntelligenceSnapshot {
 version: "vt-statistics-intelligence-v1"
 generatedAt: string
 sourceSnapshotId: string
 channelId: string | null
 selectedWindow: CanonicalIntelligenceEvidenceBundle["selectedWindow"]
 confidence: StatisticsEvidenceConfidence
 coverageRatio: number
 freshness: {
  newestDatasetAt: string | null
  staleDatasetIds: string[]
 }
 missingness: {
  unavailableDatasetIds: string[]
  failedDatasetIds: string[]
  partialDatasetIds: string[]
  omittedDatasetIds: string[]
 }
 metrics: StatisticsMetricEvidence[]
 limitations: string[]
}

const finite = (value: number): number => Number.isFinite(value) ? value : 0

const metricEvidence = (
 dataset: CanonicalIntelligenceDatasetManifest,
 metric: string,
 summary: CanonicalIntelligenceMetricSummary,
): StatisticsMetricEvidence => ({
 datasetId: dataset.id,
 metric,
 count: finite(summary.count),
 sum: finite(summary.sum),
 average: finite(summary.average),
 minimum: finite(summary.minimum),
 maximum: finite(summary.maximum),
 range: finite(summary.maximum) - finite(summary.minimum),
 evidenceRef: dataset.evidenceRefs[0] || null,
})

const confidenceFor = (
 bundle: CanonicalIntelligenceEvidenceBundle,
 metricCount: number,
): StatisticsEvidenceConfidence => {
 const total = Math.max(1, bundle.coverage.total)
 const represented = bundle.coverage.represented / total
 if (metricCount === 0 || represented < 0.2) return "insufficient"
 if (represented >= 0.8 && bundle.coverage.failed === 0 && bundle.coverage.stale === 0) return "high"
 if (represented >= 0.5 && bundle.coverage.failed <= 1) return "medium"
 return "low"
}

/**
 * Deterministic statistics layer over analytics-canon evidence.
 *
 * This module intentionally performs no model calls and owns no analytics
 * storage. It converts canonical evidence into bounded calculations that can
 * be supplied to BrainRuntime and specialist intelligence without asking an
 * LLM to calculate or invent metrics.
 */
export const buildStatisticsIntelligence = (
 bundle: CanonicalIntelligenceEvidenceBundle,
): StatisticsIntelligenceSnapshot => {
 const metrics = bundle.datasets.flatMap((dataset) =>
  Object.entries(dataset.metrics).map(([metric, summary]) =>
   metricEvidence(dataset, metric, summary),
  ),
 )
 const updated = bundle.datasets
  .map((dataset) => dataset.updatedAt)
  .filter((value): value is string => Boolean(value))
  .sort()

 const coverageRatio = bundle.coverage.total > 0
  ? bundle.coverage.represented / bundle.coverage.total
  : 0

 const limitations: string[] = []
 if (bundle.coverage.stale > 0) limitations.push("Some canonical datasets are stale.")
 if (bundle.coverage.partial > 0) limitations.push("Some canonical datasets have partial coverage.")
 if (bundle.coverage.failed > 0) limitations.push("One or more canonical datasets failed.")
 if (bundle.omittedDatasetIds.length > 0) limitations.push("Evidence bundle omitted datasets because of request/context limits.")
 if (metrics.length === 0) limitations.push("No deterministic metric summaries were available.")

 return {
  version: "vt-statistics-intelligence-v1",
  generatedAt: new Date().toISOString(),
  sourceSnapshotId: bundle.snapshotId,
  channelId: bundle.channelId,
  selectedWindow: bundle.selectedWindow,
  confidence: confidenceFor(bundle, metrics.length),
  coverageRatio,
  freshness: {
   newestDatasetAt: updated.at(-1) || null,
   staleDatasetIds: bundle.datasets.filter((d) => d.status === "stale").map((d) => d.id),
  },
  missingness: {
   unavailableDatasetIds: bundle.datasets.filter((d) => d.status === "unavailable").map((d) => d.id),
   failedDatasetIds: bundle.datasets.filter((d) => d.status === "failed").map((d) => d.id),
   partialDatasetIds: bundle.datasets.filter((d) => d.status === "partial").map((d) => d.id),
   omittedDatasetIds: [...bundle.omittedDatasetIds],
  },
  metrics,
  limitations,
 }
}
