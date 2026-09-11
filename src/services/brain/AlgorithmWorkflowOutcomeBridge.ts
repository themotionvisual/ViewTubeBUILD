import { listAlgorithmIntelligenceEvents, findAlgorithmEventByActionPacket } from "./AlgorithmIntelligenceEventLedger"
import { processAlgorithmEvaluation } from "./BrainEvaluationLoop"
import type { AlgorithmMetricObservation } from "./AlgorithmEvaluationEngine"

export type AlgorithmWorkflowOutcomeStatus =
 | "opened"
 | "accepted"
 | "completed"
 | "dismissed"
 | "rejected"
 | "corrected"
 | "abandoned"

export interface AlgorithmWorkflowOutcome {
 channelId: string
 actionPacketId?: string | null
 workflowId?: string | null
 eventId?: string | null
 status: AlgorithmWorkflowOutcomeStatus
 completedAt?: number | null
 evidenceIds?: string[]
 metadata?: Record<string, unknown>
}

const WORKFLOW_NATIVE_METRICS = new Set([
 "diagnosis_complete",
 "workflow_completed",
 "creator_accepted",
])

const workflowObservation = (outcome: AlgorithmWorkflowOutcome): AlgorithmMetricObservation[] => {
 const observedAt = outcome.completedAt || Date.now()
 const evidenceId = outcome.evidenceIds?.[0] || null
 const observations: AlgorithmMetricObservation[] = []
 if (outcome.status === "completed") {
  observations.push({ metric: "diagnosis_complete", value: 1, observedAt, evidenceId })
  observations.push({ metric: "workflow_completed", value: 1, observedAt, evidenceId })
 }
 if (["dismissed", "rejected", "abandoned"].includes(outcome.status)) {
  observations.push({ metric: "diagnosis_complete", value: 0, observedAt, evidenceId })
  observations.push({ metric: "workflow_completed", value: 0, observedAt, evidenceId })
 }
 if (outcome.status === "accepted") {
  observations.push({ metric: "creator_accepted", value: 1, observedAt, evidenceId })
 }
 if (outcome.status === "rejected") {
  observations.push({ metric: "creator_accepted", value: 0, observedAt, evidenceId })
 }
 return observations
}

export const resolveAlgorithmEventForWorkflowOutcome = (outcome: AlgorithmWorkflowOutcome) => {
 if (outcome.eventId) {
  return listAlgorithmIntelligenceEvents({ channelId: outcome.channelId })
   .find((event) => event.id === outcome.eventId) || null
 }
 if (outcome.actionPacketId) {
  const event = findAlgorithmEventByActionPacket(outcome.actionPacketId)
  if (event?.channelId === outcome.channelId) return event
 }
 if (outcome.workflowId) {
  return listAlgorithmIntelligenceEvents({ channelId: outcome.channelId })
   .find((event) => event.workflowId === outcome.workflowId) || null
 }
 return null
}

/**
 * Converts explicit workflow lifecycle evidence into Brain evaluation evidence.
 * This is deliberately separate from analytics-canon: tool completion must come
 * from the workflow/outcome system and must never be inferred from analytics.
 *
 * Workflow evidence is only allowed to satisfy targets explicitly declared as
 * workflow-native. A completed workflow cannot accidentally satisfy CTR,
 * retention, qualified views, or any other analytics target.
 */
export const recordAlgorithmWorkflowOutcome = (outcome: AlgorithmWorkflowOutcome) => {
 const event = resolveAlgorithmEventForWorkflowOutcome(outcome)
 if (!event) return { status: "unattributed" as const, event: null, evaluation: null }

 const workflowTargets = event.evaluationTargets.filter((target) => WORKFLOW_NATIVE_METRICS.has(target.metric))
 if (!workflowTargets.length) {
  return { status: "no_workflow_target" as const, event, evaluation: null }
 }

 const observations = workflowObservation(outcome)
  .filter((observation) => workflowTargets.some((target) => target.metric === observation.metric))
 if (!observations.length) {
  return { status: "non_terminal" as const, event, evaluation: null }
 }

 const result = processAlgorithmEvaluation({
  channelId: outcome.channelId,
  eventId: event.id,
  observations,
 })
 return {
  status: "evaluated" as const,
  event,
  observations,
  evaluation: result.evaluation,
  recorded: result.recorded,
  learningEvents: result.learningEvents,
 }
}
