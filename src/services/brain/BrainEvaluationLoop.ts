import {
 listAlgorithmIntelligenceEvents,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import {
 recordAlgorithmEvaluation,
 type AlgorithmMetricObservation,
} from "./AlgorithmEvaluationEngine"
import { recordAlgorithmLearningCandidates } from "./AlgorithmLearningCandidates"

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

export const listDueAlgorithmEvaluations = (input: {
 channelId: string
 now?: number
 maximum?: number
}): DueAlgorithmEvaluation[] => {
 const now = input.now || Date.now()
 const maximum = Math.max(1, Math.min(100, input.maximum || 25))
 const measuredParents = new Set(
  listAlgorithmIntelligenceEvents({ channelId: input.channelId, kind: "OUTCOME_MEASURED" })
   .flatMap((event) => event.parentEventIds),
 )
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

export const summarizeAlgorithmLearningLoop = (channelId: string) => {
 const events = listAlgorithmIntelligenceEvents({ channelId })
 const count = (kind: AlgorithmIntelligenceEvent["kind"]) => events.filter((event) => event.kind === kind).length
 const measured = events.filter((event) => event.kind === "OUTCOME_MEASURED")
 const positive = measured.filter((event) => (event.metadata?.evaluation as { status?: string } | undefined)?.status === "positive").length
 const negative = measured.filter((event) => (event.metadata?.evaluation as { status?: string } | undefined)?.status === "negative").length
 return {
  totalEvents: events.length,
  anomalyEscalations: count("ANOMALY_ESCALATED"),
  opportunities: count("OPPORTUNITY_IDENTIFIED"),
  primingExecutions: count("PRIMING_STEP_EXECUTED"),
  recommendationExecutions: count("RECOMMENDATION_EXECUTED"),
  measuredOutcomes: measured.length,
  positiveMeasuredOutcomes: positive,
  negativeMeasuredOutcomes: negative,
  learningCandidates: count("LEARNING_CANDIDATE_CREATED"),
  dueEvaluations: listDueAlgorithmEvaluations({ channelId }).length,
 }
}
