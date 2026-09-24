import type { BrainConfidenceLevel } from "../../types"
import {
 listAlgorithmIntelligenceEvents,
 recordAlgorithmIntelligenceEvent,
 type AlgorithmEvaluationTarget,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"

export type AlgorithmEvaluationStatus = "pending" | "insufficient_data" | "positive" | "neutral" | "negative" | "mixed"

export interface AlgorithmMetricObservation {
 metric: string
 value: number | null
 observedAt: number
 evidenceId?: string | null
}

export interface AlgorithmTargetEvaluation {
 metric: string
 status: "met" | "missed" | "neutral" | "unavailable"
 baselineValue: number | null
 observedValue: number | null
 relativeChange: number | null
 target: AlgorithmEvaluationTarget
}

export interface AlgorithmEvaluationResult {
 eventId: string
 channelId: string
 status: AlgorithmEvaluationStatus
 confidence: BrainConfidenceLevel
 targetResults: AlgorithmTargetEvaluation[]
 evidenceIds: string[]
 explanation: string
 evaluatedAt: number
}

const relativeChange = (baseline: number | null | undefined, current: number | null | undefined) => {
 if (baseline == null || current == null || baseline === 0) return null
 return (current - baseline) / Math.abs(baseline)
}

const evaluateTarget = (target: AlgorithmEvaluationTarget, observation: AlgorithmMetricObservation | undefined): AlgorithmTargetEvaluation => {
 const baseline = target.baselineValue ?? null
 const current = observation?.value ?? null
 const delta = relativeChange(baseline, current)
 if (current == null) return { metric: target.metric, status: "unavailable", baselineValue: baseline, observedValue: null, relativeChange: null, target }
 if (target.direction === "inspect") return { metric: target.metric, status: "neutral", baselineValue: baseline, observedValue: current, relativeChange: delta, target }
 if (baseline == null) return { metric: target.metric, status: "unavailable", baselineValue: null, observedValue: current, relativeChange: null, target }
 const threshold = target.minimumRelativeChange ?? 0
 const met = target.targetValue != null
  ? target.direction === "increase" ? current >= target.targetValue : target.direction === "decrease" ? current <= target.targetValue : Math.abs(current - target.targetValue) <= Math.abs(target.targetValue) * Math.max(threshold, 0.01)
  : target.direction === "increase" ? (delta ?? 0) >= threshold
   : target.direction === "decrease" ? (delta ?? 0) <= -threshold
   : Math.abs(delta ?? 0) <= Math.max(threshold, 0.05)
 return { metric: target.metric, status: met ? "met" : "missed", baselineValue: baseline, observedValue: current, relativeChange: delta, target }
}

const confidenceFor = (available: number, total: number): BrainConfidenceLevel => {
 if (!total || available === 0) return "low"
 const ratio = available / total
 return ratio >= .8 ? "high" : ratio >= .5 ? "medium" : "low"
}

export const evaluateAlgorithmEvent = (input: { event: AlgorithmIntelligenceEvent; observations: AlgorithmMetricObservation[]; now?: number }): AlgorithmEvaluationResult => {
 const now = input.now || Date.now()
 const targetResults = input.event.evaluationTargets.map((target) => evaluateTarget(target, input.observations.find((observation) => observation.metric === target.metric)))
 const available = targetResults.filter((result) => result.status !== "unavailable")
 const met = targetResults.filter((result) => result.status === "met").length
 const missed = targetResults.filter((result) => result.status === "missed").length
 let status: AlgorithmEvaluationStatus = "pending"
 if (input.event.checkpointAt && now < input.event.checkpointAt) status = "pending"
 else if (!available.length) status = "insufficient_data"
 else if (met && missed) status = "mixed"
 else if (met) status = "positive"
 else if (missed) status = "negative"
 else status = "neutral"
 const evidenceIds = [...new Set(input.observations.map((observation) => observation.evidenceId).filter(Boolean) as string[])]
 const explanation = status === "positive" ? `${met}/${targetResults.length} evaluation targets were met.`
  : status === "negative" ? `${missed}/${targetResults.length} evaluation targets were missed.`
   : status === "mixed" ? `${met} targets were met and ${missed} were missed.`
    : status === "insufficient_data" ? "The checkpoint was reached but the required metric observations are unavailable."
     : status === "pending" ? "The evaluation checkpoint has not been reached yet."
      : "The observed result is neutral relative to the defined targets."
 return { eventId: input.event.id, channelId: input.event.channelId, status, confidence: confidenceFor(available.length, targetResults.length), targetResults, evidenceIds, explanation, evaluatedAt: now }
}

export const recordAlgorithmEvaluation = (input: {
 sourceEventId: string
 observations: AlgorithmMetricObservation[]
 now?: number
 evaluationTargets?: AlgorithmEvaluationTarget[]
 metadata?: Record<string, unknown>
}) => {
 const event = listAlgorithmIntelligenceEvents().find((candidate) => candidate.id === input.sourceEventId)
 if (!event) throw new Error(`Unknown Algorithm Intelligence event: ${input.sourceEventId}`)
 const effectiveEvent = input.evaluationTargets ? { ...event, evaluationTargets: input.evaluationTargets } : event
 const evaluation = evaluateAlgorithmEvent({ event: effectiveEvent, observations: input.observations, now: input.now })
 const recorded = recordAlgorithmIntelligenceEvent({
  id: `algorithm-outcome:${event.id}`,
  channelId: event.channelId,
  projectId: event.projectId,
  videoId: event.videoId,
  kind: "OUTCOME_MEASURED",
  sourceSystem: "evaluation",
  sourceId: event.id,
  parentEventIds: [event.id],
  recommendationId: event.recommendationId,
  primingPlanId: event.primingPlanId,
  primingStepId: event.primingStepId,
  actionPacketId: event.actionPacketId,
  workflowId: event.workflowId,
  traceId: event.traceId || null,
  outputRef: event.outputRef || null,
  evidenceIds: evaluation.evidenceIds,
  confidence: evaluation.confidence,
  title: `Evaluation: ${event.title}`,
  summary: evaluation.explanation,
  evaluationTargets: effectiveEvent.evaluationTargets,
  metadata: { ...(input.metadata || {}), evaluation },
 })
 return { evaluation, recorded }
}
