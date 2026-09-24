import type { BrainConfidenceLevel } from "../../types"
import {
 listAlgorithmIntelligenceEvents,
 recordAlgorithmIntelligenceEvent,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import type { AlgorithmEvaluationResult } from "./AlgorithmEvaluationEngine"

export interface AlgorithmLearningCandidate {
 id: string
 channelId: string
 category: "priming_tactic" | "algorithm_recommendation" | "anomaly_value" | "opportunity_value"
 statement: string
 confidence: BrainConfidenceLevel
 sourceEventIds: string[]
 evidenceIds: string[]
 sampleSize: number
 decisiveSampleSize: number
 positiveRate: number
 traceIds: string[]
 outputRefs: string[]
 status: "candidate" | "insufficient_evidence"
}

const MINIMUM_POSITIVE_RATE = 2 / 3

const confidenceFor = (decisiveSampleSize: number, positiveRate: number): BrainConfidenceLevel => {
 if (decisiveSampleSize >= 5 && positiveRate >= .8) return "high"
 if (decisiveSampleSize >= 3 && positiveRate >= MINIMUM_POSITIVE_RATE) return "medium"
 return "low"
}

const extractEvaluation = (event: AlgorithmIntelligenceEvent): AlgorithmEvaluationResult | null => {
 const value = event.metadata?.evaluation
 return value && typeof value === "object" ? value as AlgorithmEvaluationResult : null
}

const categoryFor = (event: AlgorithmIntelligenceEvent): AlgorithmLearningCandidate["category"] => {
 if (event.primingStepId || event.primingPlanId) return "priming_tactic"
 if (event.recommendationId) return "algorithm_recommendation"
 if (event.sourceSystem === "anomaly") return "anomaly_value"
 return "opportunity_value"
}

export const deriveAlgorithmLearningCandidates = (channelId: string): AlgorithmLearningCandidate[] => {
 const evaluations = listAlgorithmIntelligenceEvents({ channelId, kind: "OUTCOME_MEASURED" })
 const groups = new Map<string, AlgorithmIntelligenceEvent[]>()
 evaluations.forEach((event) => {
  const key = event.primingStepId
   ? `priming:${event.primingStepId}`
   : event.recommendationId
    ? `recommendation:${event.recommendationId.split(":").slice(-1)[0]}`
    : `${event.sourceSystem}:${event.sourceId || "unknown"}`
  const rows = groups.get(key) || []
  rows.push(event)
  groups.set(key, rows)
 })

 return [...groups.entries()].map(([key, rows]) => {
  const results = rows.map(extractEvaluation).filter(Boolean) as AlgorithmEvaluationResult[]
  const positives = results.filter((result) => result.status === "positive").length
  const negatives = results.filter((result) => result.status === "negative").length
  const decisive = positives + negatives
  const positiveRate = decisive ? positives / decisive : 0
  const sampleSize = results.length
  const decisiveSampleSize = decisive
  const status = decisiveSampleSize >= 3 && positiveRate >= MINIMUM_POSITIVE_RATE
   ? "candidate" as const
   : "insufficient_evidence" as const
  const category = categoryFor(rows[0])
  const label = rows[0].primingStepId || rows[0].recommendationId || rows[0].sourceId || key
  return {
   id: `algorithm-learning:${key}`,
   channelId,
   category,
   statement: status === "candidate"
    ? `${label} has produced positive measured outcomes in ${positives}/${decisive || sampleSize} decisive evaluations.`
    : `${label} does not yet have enough repeated measured evidence for durable channel learning.`,
   confidence: confidenceFor(decisiveSampleSize, positiveRate),
   sourceEventIds: rows.map((row) => row.id),
   evidenceIds: [...new Set(rows.flatMap((row) => row.evidenceIds))],
   sampleSize,
   decisiveSampleSize,
   positiveRate,
   traceIds: [...new Set(rows.map((row) => row.traceId).filter((value): value is string => Boolean(value)))],
   outputRefs: [...new Set(rows.map((row) => row.outputRef).filter((value): value is string => Boolean(value)))],
   status,
  }
 })
}

/**
 * Records a learning candidate in the Algorithm Intelligence ledger only.
 * Promotion into durable Channel Profile memory remains a separate governed step.
 */
export const recordAlgorithmLearningCandidates = (channelId: string) => {
 const candidates = deriveAlgorithmLearningCandidates(channelId).filter((candidate) => candidate.status === "candidate")
 return candidates.map((candidate) => recordAlgorithmIntelligenceEvent({
  id: `algorithm-event:learning-candidate:${candidate.id}`,
  channelId,
  kind: "LEARNING_CANDIDATE_CREATED",
  sourceSystem: "learning",
  sourceId: candidate.id,
  parentEventIds: candidate.sourceEventIds,
  evidenceIds: candidate.evidenceIds,
  confidence: candidate.confidence,
  title: "Algorithm learning candidate",
  summary: candidate.statement,
  metadata: { candidate },
 }))
}
