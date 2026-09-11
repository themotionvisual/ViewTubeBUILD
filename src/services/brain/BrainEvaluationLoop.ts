import type { VtSyncSnapshot } from "../../features/vt-sync-local/adapters/contracts"
import {
 listAlgorithmIntelligenceEvents,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import {
 recordAlgorithmEvaluation,
 type AlgorithmMetricObservation,
} from "./AlgorithmEvaluationEngine"
import { recordAlgorithmLearningCandidates } from "./AlgorithmLearningCandidates"
import { buildCanonicalEvaluationEvidence } from "./CanonicalAlgorithmEvaluation"

export interface DueAlgorithmEvaluation {
 event: AlgorithmIntelligenceEvent
 dueAt: number
 overdueByMs: number
 requiredMetrics: string[]
}

const EVALUATABLE_KINDS = new Set<AlgorithmIntelligenceEvent["kind"]>([
 "RECOMMENDATION_CREATED",
 "RECOMMENDATION_EXECUTED",
 "PRIMING_STEP_PREPARED",
 "PRIMING_STEP_EXECUTED",
])

const TERMINAL_EVALUATION_STATUSES = new Set(["positive", "neutral", "negative", "mixed"])

const terminallyMeasuredParentIds = (channelId: string) => new Set(
 listAlgorithmIntelligenceEvents({ channelId, kind: "OUTCOME_MEASURED" })
  .filter((event) => {
   const status = (event.metadata?.evaluation as { status?: string } | undefined)?.status || ""
   return TERMINAL_EVALUATION_STATUSES.has(status)
  })
  .flatMap((event) => event.parentEventIds),
)

export const listDueAlgorithmEvaluations = (input: {
 channelId: string
 now?: number
 maximum?: number
}): DueAlgorithmEvaluation[] => {
 const now = input.now || Date.now()
 const maximum = Math.max(1, Math.min(100, input.maximum || 25))
 const measuredParents = terminallyMeasuredParentIds(input.channelId)
 return listAlgorithmIntelligenceEvents({ channelId: input.channelId })
  .filter((event) => EVALUATABLE_KINDS.has(event.kind))
  .filter((event) => Boolean(event.checkpointAt) && (event.checkpointAt || 0) <= now)
  .filter((event) => !measuredParents.has(event.id))
  .map((event) => ({
   event,
   dueAt: event.checkpointAt || event.createdAt,
   overdueByMs: Math.max(0, now - (event.checkpointAt || event.createdAt)),
   requiredMetrics: [...new Set(event.evaluationTargets.map((target) => target.metric))],
  }))
  .sort((left, right) => right.overdueByMs - left.overdueByMs)
  .slice(0, maximum)
}

export const processAlgorithmEvaluation = (input: {
 channelId: string
 eventId: string
 observations: AlgorithmMetricObservation[]
 now?: number
 refreshLearningCandidates?: boolean
}) => {
 const event = listAlgorithmIntelligenceEvents({ channelId: input.channelId })
  .find((candidate) => candidate.id === input.eventId)
 if (!event) throw new Error(`Unknown Algorithm Intelligence event: ${input.eventId}`)
 const result = recordAlgorithmEvaluation({
  sourceEventId: event.id,
  observations: input.observations,
  now: input.now,
 })
 const learningEvents = input.refreshLearningCandidates === false
  ? []
  : recordAlgorithmLearningCandidates(input.channelId)
 return {
  ...result,
  learningEvents,
 }
}

/**
 * Evaluate one Brain action from canonical VT-SYNC evidence.
 *
 * A baseline snapshot is optional because some targets are inspection-only. For
 * increase/decrease/hold targets, a missing baseline deliberately yields
 * insufficient data instead of inventing a comparison.
 */
export const processCanonicalAlgorithmEvaluation = (input: {
 channelId: string
 eventId: string
 currentSnapshot: VtSyncSnapshot
 baselineSnapshot?: VtSyncSnapshot | null
 now?: number
 refreshLearningCandidates?: boolean
}) => {
 const event = listAlgorithmIntelligenceEvents({ channelId: input.channelId })
  .find((candidate) => candidate.id === input.eventId)
 if (!event) throw new Error(`Unknown Algorithm Intelligence event: ${input.eventId}`)

 const evidence = buildCanonicalEvaluationEvidence({
  event,
  currentSnapshot: input.currentSnapshot,
  baselineSnapshot: input.baselineSnapshot,
 })
 const result = recordAlgorithmEvaluation({
  sourceEventId: event.id,
  observations: evidence.observations,
  evaluationTargets: evidence.evaluationTargets,
  now: input.now,
  metadata: {
   evidenceSource: "analytics-canon",
   currentSnapshotId: evidence.currentSnapshotId,
   baselineSnapshotId: evidence.baselineSnapshotId,
  },
 })
 const learningEvents = input.refreshLearningCandidates === false
  ? []
  : recordAlgorithmLearningCandidates(input.channelId)
 return {
  ...result,
  observations: evidence.observations,
  evaluationTargets: evidence.evaluationTargets,
  learningEvents,
 }
}

/**
 * Process currently-due checkpoints against one current canonical snapshot.
 * Callers may provide a baseline resolver so each event can be compared with the
 * snapshot captured before its intervention. Events with insufficient evidence
 * remain due and can be retried after another sync/import.
 */
export const processDueCanonicalAlgorithmEvaluations = (input: {
 channelId: string
 currentSnapshot: VtSyncSnapshot
 baselineSnapshotForEvent?: (event: AlgorithmIntelligenceEvent) => VtSyncSnapshot | null | undefined
 now?: number
 maximum?: number
 refreshLearningCandidates?: boolean
}) => {
 const due = listDueAlgorithmEvaluations({
  channelId: input.channelId,
  now: input.now,
  maximum: input.maximum,
 })
 const results = due.map(({ event }) => processCanonicalAlgorithmEvaluation({
  channelId: input.channelId,
  eventId: event.id,
  currentSnapshot: input.currentSnapshot,
  baselineSnapshot: input.baselineSnapshotForEvent?.(event) || null,
  now: input.now,
  refreshLearningCandidates: false,
 }))
 const learningEvents = input.refreshLearningCandidates === false
  ? []
  : recordAlgorithmLearningCandidates(input.channelId)
 return {
  processed: results.length,
  results,
  learningEvents,
 }
}

export const summarizeAlgorithmLearningLoop = (channelId: string) => {
 const events = listAlgorithmIntelligenceEvents({ channelId })
 const count = (kind: AlgorithmIntelligenceEvent["kind"]) => events.filter((event) => event.kind === kind).length
 const measured = events.filter((event) => event.kind === "OUTCOME_MEASURED")
 const statusCount = (status: string) => measured.filter((event) =>
  (event.metadata?.evaluation as { status?: string } | undefined)?.status === status,
 ).length
 return {
  totalEvents: events.length,
  anomalyEscalations: count("ANOMALY_ESCALATED"),
  opportunities: count("OPPORTUNITY_IDENTIFIED"),
  primingExecutions: count("PRIMING_STEP_EXECUTED"),
  recommendationExecutions: count("RECOMMENDATION_EXECUTED"),
  measuredOutcomes: measured.length,
  positiveMeasuredOutcomes: statusCount("positive"),
  negativeMeasuredOutcomes: statusCount("negative"),
  mixedMeasuredOutcomes: statusCount("mixed"),
  neutralMeasuredOutcomes: statusCount("neutral"),
  insufficientDataEvaluations: statusCount("insufficient_data"),
  learningCandidates: count("LEARNING_CANDIDATE_CREATED"),
  dueEvaluations: listDueAlgorithmEvaluations({ channelId }).length,
 }
}
