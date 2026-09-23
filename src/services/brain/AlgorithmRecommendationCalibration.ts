import type { BrainConfidenceLevel } from "../../types"
import { listAlgorithmIntelligenceEvents, type AlgorithmIntelligenceEvent } from "./AlgorithmIntelligenceEventLedger"
import type { AlgorithmEvaluationResult } from "./AlgorithmEvaluationEngine"

export interface AlgorithmCalibrationBucket {
 confidence: BrainConfidenceLevel
 measured: number
 positive: number
 negative: number
 mixed: number
 neutral: number
 successRate: number | null
 calibrationGap: number | null
}

export interface AlgorithmRecommendationCalibration {
 channelId: string
 measuredRecommendations: number
 overallSuccessRate: number | null
 buckets: AlgorithmCalibrationBucket[]
 byCommand: Array<{
  command: string
  measured: number
  positive: number
  successRate: number | null
 }>
 warnings: string[]
}

const expectedProbability: Record<BrainConfidenceLevel, number> = {
 low: .4,
 medium: .65,
 high: .8,
}

const evaluationOf = (event: AlgorithmIntelligenceEvent) =>
 (event.metadata?.evaluation as AlgorithmEvaluationResult | undefined) || null

const sourceRecommendationEvent = (channelId: string, outcome: AlgorithmIntelligenceEvent) => {
 const events = listAlgorithmIntelligenceEvents({ channelId })
 const direct = outcome.parentEventIds
  .map((id) => events.find((event) => event.id === id))
  .find(Boolean)
 if (direct?.recommendationId) return direct
 return outcome.recommendationId
  ? events.find((event) => event.recommendationId === outcome.recommendationId && event.kind === "RECOMMENDATION_CREATED") || null
  : null
}

export const buildAlgorithmRecommendationCalibration = (channelId: string): AlgorithmRecommendationCalibration => {
 const outcomes = listAlgorithmIntelligenceEvents({ channelId, kind: "OUTCOME_MEASURED" })
  .filter((event) => Boolean(event.recommendationId))
  .filter((event) => ["positive", "negative", "mixed", "neutral"].includes(evaluationOf(event)?.status || ""))

 const rows = outcomes.map((outcome) => ({
  outcome,
  evaluation: evaluationOf(outcome)!,
  recommendation: sourceRecommendationEvent(channelId, outcome),
 }))
 const buckets = (["low", "medium", "high"] as BrainConfidenceLevel[]).map((confidence) => {
  const selected = rows.filter((row) => (row.recommendation?.confidence || row.outcome.confidence) === confidence)
  const positive = selected.filter((row) => row.evaluation.status === "positive").length
  const negative = selected.filter((row) => row.evaluation.status === "negative").length
  const mixed = selected.filter((row) => row.evaluation.status === "mixed").length
  const neutral = selected.filter((row) => row.evaluation.status === "neutral").length
  const decisive = positive + negative
  const successRate = decisive ? positive / decisive : null
  return {
   confidence,
   measured: selected.length,
   positive,
   negative,
   mixed,
   neutral,
   successRate,
   calibrationGap: successRate == null ? null : successRate - expectedProbability[confidence],
  }
 })

 const commands = new Map<string, { measured: number; positive: number; negative: number }>()
 rows.forEach(({ recommendation, evaluation }) => {
  const command = recommendationCommandOf(recommendation)
  const bucket = commands.get(command) || { measured: 0, positive: 0, negative: 0 }
  bucket.measured += 1
  if (evaluation.status === "positive") bucket.positive += 1
  if (evaluation.status === "negative") bucket.negative += 1
  commands.set(command, bucket)
 })
 const byCommand = [...commands.entries()].map(([command, value]) => ({
  command,
  measured: value.measured,
  positive: value.positive,
  successRate: value.positive + value.negative ? value.positive / (value.positive + value.negative) : null,
 }))
  .sort((left, right) => right.measured - left.measured)

 const positive = rows.filter((row) => row.evaluation.status === "positive").length
 const negative = rows.filter((row) => row.evaluation.status === "negative").length
 const decisive = positive + negative
 const warnings = buckets.flatMap((bucket) => {
  if (bucket.measured < 3 || bucket.calibrationGap == null) return []
  if (bucket.calibrationGap <= -.2) return [`${bucket.confidence} confidence recommendations are overconfident by about ${Math.round(Math.abs(bucket.calibrationGap) * 100)} points.`]
  if (bucket.calibrationGap >= .2) return [`${bucket.confidence} confidence recommendations are outperforming their expected calibration by about ${Math.round(bucket.calibrationGap * 100)} points.`]
  return []
 })

 return {
  channelId,
  measuredRecommendations: rows.length,
  overallSuccessRate: decisive ? positive / decisive : null,
  buckets,
  byCommand,
  warnings,
 }
}
