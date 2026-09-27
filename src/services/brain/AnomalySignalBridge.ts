import type { AlgorithmSignal } from "./AlgorithmStrategyEngine"
import type { DerivedSignal } from "./EvidenceRecord"

export interface ExternalAnomalySignal {
 id: string
 channelId: string
 family: string
 anomalyType: string
 datasetId: string
 entity?: string | null
 metric?: string | null
 currentValue?: number | null
 baselineValue?: number | null
 relativeDelta?: number | null
 impactScore: number
 confidence: number
 relatedVideoIds?: string[]
 evidenceIds: string[]
 context?: AlgorithmSignal["context"]
}

const mapKind = (input: ExternalAnomalySignal): AlgorithmSignal["kind"] => {
 const family = input.family.toLowerCase()
 const anomalyType = input.anomalyType.toLowerCase()
 const metric = (input.metric || "").toLowerCase()

 if (family === "search") return "search_breakout"
 if (family === "external") return "external_breakout"
 if (family === "audience" || family === "demographic") return "audience_mix_shift"
 if (family === "revenue") return "revenue_shift"
 if (family === "retention") {
  return anomalyType.includes("drop") || anomalyType.includes("decline")
   ? "retention_decline"
   : "retention_strength"
 }
 if (family === "traffic") {
  return anomalyType.includes("drop") || anomalyType.includes("contraction")
   ? "traffic_contraction"
   : "traffic_expansion"
 }
 if (family === "video" && (metric.includes("views") || metric.includes("watch"))) {
  return anomalyType.includes("drop") ? "traffic_contraction" : "back_catalog_resurgence"
 }
 return "unknown"
}

export const anomalyToDerivedSignal = (anomaly: ExternalAnomalySignal): DerivedSignal => ({
 id: `derived:anomaly:${anomaly.id}`,
 kind: "anomaly",
 channelId: anomaly.channelId,
 videoId: anomaly.relatedVideoIds?.[0] || null,
 label: [anomaly.entity || anomaly.family, anomaly.anomalyType].filter(Boolean).join(" "),
 metric: anomaly.metric,
 currentValue: anomaly.currentValue,
 baselineValue: anomaly.baselineValue,
 delta: (
  typeof anomaly.currentValue === "number"
  && typeof anomaly.baselineValue === "number"
 )
  ? anomaly.currentValue - anomaly.baselineValue
  : null,
 relativeDelta: anomaly.relativeDelta,
 confidence: anomaly.confidence,
 impact: anomaly.impactScore,
 evidenceIds: [...new Set(anomaly.evidenceIds)],
 derivation: {
  method: "external-anomaly-normalization",
  version: "v1",
  deterministic: true,
 },
 metadata: {
  family: anomaly.family,
  anomalyType: anomaly.anomalyType,
  datasetId: anomaly.datasetId,
 },
})

/**
 * This bridge intentionally does NOT detect anomalies.
 * It only converts an already-detected, evidence-backed anomaly into a generic
 * algorithm decision signal so the parent intelligence system can consider it.
 */
export const anomalyToAlgorithmSignal = (anomaly: ExternalAnomalySignal): AlgorithmSignal => {
 const derived = anomalyToDerivedSignal(anomaly)
 return {
  id: `anomaly:${anomaly.id}`,
  origin: "anomaly",
  kind: mapKind(anomaly),
  channelId: anomaly.channelId,
  videoId: derived.videoId,
  entity: anomaly.entity,
  metric: derived.metric,
  currentValue: derived.currentValue,
  baselineValue: derived.baselineValue,
  relativeDelta: derived.relativeDelta,
  impactScore: derived.impact ?? anomaly.impactScore,
  confidence: derived.confidence,
  evidenceIds: derived.evidenceIds,
  context: anomaly.context,
 }
}

export const escalateAnomaliesToAlgorithmSignals = (
 anomalies: ExternalAnomalySignal[],
 input?: { minimumImpact?: number; minimumConfidence?: number },
): AlgorithmSignal[] => {
 const minimumImpact = input?.minimumImpact ?? 55
 const minimumConfidence = input?.minimumConfidence ?? 60
 return anomalies
  .filter((anomaly) => anomaly.impactScore >= minimumImpact && anomaly.confidence >= minimumConfidence)
  .map(anomalyToAlgorithmSignal)
}
