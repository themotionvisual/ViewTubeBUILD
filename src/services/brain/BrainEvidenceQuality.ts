import type {
 CanonicalIntelligenceDatasetManifest,
 CanonicalIntelligenceDatasetStatus,
 CanonicalIntelligenceEvidenceBundle,
} from "../analytics-canon"

export type BrainEvidenceEpistemicState =
 | "OBSERVED"
 | "STALE"
 | "MISSING"

export type BrainEvidenceConfidence = "high" | "medium" | "low" | "insufficient"
export type BrainEvidenceScopeMatch = "exact" | "mismatch" | "unscoped" | "not_requested"

export interface BrainEvidenceDatasetQuality {
 datasetId: string
 status: CanonicalIntelligenceDatasetStatus
 epistemicState: BrainEvidenceEpistemicState
 sourceOwner: "analytics-canon"
 sourceSnapshotId: string
 channelId: string | null
 evidenceRefs: string[]
 missingMetrics: string[]
 sources: CanonicalIntelligenceDatasetManifest["sources"]
 rowCount: number
 updatedAt: string | null
}

export interface BrainEvidenceQualityReport {
 version: "vt-brain-evidence-quality-v1"
 generatedAt: string
 sourceSnapshotId: string
 channelId: string | null
 selectedWindow: CanonicalIntelligenceEvidenceBundle["selectedWindow"]
 scopeMatch: BrainEvidenceScopeMatch
 confidence: BrainEvidenceConfidence
 coverageRatio: number
 evidenceReferenceCount: number
 datasets: BrainEvidenceDatasetQuality[]
 freshness: {
  staleDatasetIds: string[]
  newestDatasetAt: string | null
 }
 missingness: {
  unavailableDatasetIds: string[]
  failedDatasetIds: string[]
  partialDatasetIds: string[]
  omittedDatasetIds: string[]
 }
 limitations: string[]
}

const epistemicStateFor = (
 status: CanonicalIntelligenceDatasetStatus,
): BrainEvidenceEpistemicState => {
 if (status === "stale") return "STALE"
 if (status === "failed" || status === "unavailable") return "MISSING"
 return "OBSERVED"
}

const usabilityWeight = (status: CanonicalIntelligenceDatasetStatus): number => {
 if (status === "available") return 1
 if (status === "partial") return 0.6
 if (status === "stale") return 0.35
 return 0
}

const resolveScopeMatch = (
 actualChannelId: string | null,
 expectedChannelId?: string | null,
): BrainEvidenceScopeMatch => {
 if (expectedChannelId === undefined) return "not_requested"
 if (!actualChannelId || !expectedChannelId) return "unscoped"
 return actualChannelId === expectedChannelId ? "exact" : "mismatch"
}

const confidenceFor = (input: {
 coverageRatio: number
 scopeMatch: BrainEvidenceScopeMatch
 staleCount: number
 failedCount: number
}): BrainEvidenceConfidence => {
 if (input.scopeMatch === "mismatch") return "insufficient"
 if (input.coverageRatio <= 0) return "insufficient"
 if (
  input.coverageRatio >= 0.8
  && input.staleCount === 0
  && input.failedCount === 0
 ) return "high"
 if (input.coverageRatio >= 0.5 && input.failedCount <= 1) return "medium"
 return "low"
}

/**
 * Brain-side quality projection over analytics-canon evidence.
 *
 * This module owns no analytics storage. It preserves canonical provenance and
 * missingness while deriving bounded confidence/coverage metadata for reasoning
 * and prompt assembly.
 */
export const buildBrainEvidenceQuality = (
 bundle: CanonicalIntelligenceEvidenceBundle,
 options: { expectedChannelId?: string | null } = {},
): BrainEvidenceQualityReport => {
 const datasets: BrainEvidenceDatasetQuality[] = bundle.datasets.map((dataset) => ({
  datasetId: dataset.id,
  status: dataset.status,
  epistemicState: epistemicStateFor(dataset.status),
  sourceOwner: "analytics-canon",
  sourceSnapshotId: bundle.snapshotId,
  channelId: bundle.channelId,
  evidenceRefs: [...dataset.evidenceRefs],
  missingMetrics: [...dataset.missingMetrics],
  sources: [...dataset.sources],
  rowCount: dataset.rowCount,
  updatedAt: dataset.updatedAt || null,
 }))

 const denominator = datasets.length || bundle.coverage.total
 const usableWeight = datasets.reduce((sum, dataset) => sum + usabilityWeight(dataset.status), 0)
 const coverageRatio = denominator > 0 ? usableWeight / denominator : 0
 const scopeMatch = resolveScopeMatch(bundle.channelId, options.expectedChannelId)
 const staleDatasetIds = datasets.filter((dataset) => dataset.status === "stale").map((dataset) => dataset.datasetId)
 const failedDatasetIds = datasets.filter((dataset) => dataset.status === "failed").map((dataset) => dataset.datasetId)
 const unavailableDatasetIds = datasets.filter((dataset) => dataset.status === "unavailable").map((dataset) => dataset.datasetId)
 const partialDatasetIds = datasets.filter((dataset) => dataset.status === "partial").map((dataset) => dataset.datasetId)
 const updated = datasets
  .map((dataset) => dataset.updatedAt)
  .filter((value): value is string => Boolean(value))
  .sort()
 const limitations: string[] = []

 if (scopeMatch === "mismatch") {
  limitations.push("Canonical evidence belongs to a different channel than the active Brain task.")
 }
 if (scopeMatch === "unscoped") {
  limitations.push("Canonical evidence could not be matched to a concrete active channel.")
 }
 if (staleDatasetIds.length) limitations.push("Some canonical evidence is stale.")
 if (partialDatasetIds.length) limitations.push("Some canonical evidence is partial.")
 if (failedDatasetIds.length) limitations.push("Some canonical evidence sources failed.")
 if (unavailableDatasetIds.length) limitations.push("Some canonical evidence is unavailable.")
 if (bundle.omittedDatasetIds.length) limitations.push("Some evidence detail was omitted by context limits.")

 return {
  version: "vt-brain-evidence-quality-v1",
  generatedAt: new Date().toISOString(),
  sourceSnapshotId: bundle.snapshotId,
  channelId: bundle.channelId,
  selectedWindow: bundle.selectedWindow,
  scopeMatch,
  confidence: confidenceFor({
   coverageRatio,
   scopeMatch,
   staleCount: staleDatasetIds.length,
   failedCount: failedDatasetIds.length,
  }),
  coverageRatio,
  evidenceReferenceCount: datasets.reduce((sum, dataset) => sum + dataset.evidenceRefs.length, 0),
  datasets,
  freshness: {
   staleDatasetIds,
   newestDatasetAt: updated.at(-1) || null,
  },
  missingness: {
   unavailableDatasetIds,
   failedDatasetIds,
   partialDatasetIds,
   omittedDatasetIds: [...bundle.omittedDatasetIds],
  },
  limitations,
 }
}
