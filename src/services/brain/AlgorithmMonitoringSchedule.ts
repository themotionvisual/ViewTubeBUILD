import {
 listAlgorithmIntelligenceEvents,
 recordAlgorithmIntelligenceEvent,
 type AlgorithmEvaluationTarget,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"

export type AlgorithmMonitoringCheckpointRole = "observe" | "final_evaluation"

export interface AlgorithmMonitoringCheckpoint {
 id: string
 horizonHours: number
 dueAt: number
 role: AlgorithmMonitoringCheckpointRole
 metrics: string[]
 label: string
}

export interface AlgorithmMonitoringSchedule {
 version: "algorithm-monitoring-v1"
 sourceEventId: string
 createdAt: number
 finalEvaluationHour: number
 checkpoints: AlgorithmMonitoringCheckpoint[]
}

const DEFAULT_HORIZONS = [1, 6, 24, 48, 72, 168] as const

const uniqueSorted = (values: number[]) => [...new Set(values.filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b)

const finalEvaluationHourFor = (targets: AlgorithmEvaluationTarget[]) =>
 Math.max(...targets.map((target) => target.windowHours || 24), 24)

/**
 * Creates one monitoring schedule for one recommendation/priming execution.
 * Intermediate horizons are observation-only; only the final declared horizon
 * is eligible to become the action's measured outcome. This prevents one action
 * from being counted as repeated learning evidence merely because it was checked
 * several times.
 */
export const buildAlgorithmMonitoringSchedule = (input: {
 sourceEventId: string
 startedAt?: number
 evaluationTargets: AlgorithmEvaluationTarget[]
 horizons?: number[]
}): AlgorithmMonitoringSchedule => {
 const startedAt = input.startedAt || Date.now()
 const finalEvaluationHour = finalEvaluationHourFor(input.evaluationTargets)
 const configured = uniqueSorted([...(input.horizons || DEFAULT_HORIZONS), finalEvaluationHour])
 const horizons = configured.filter((hour) => hour <= finalEvaluationHour)
 const metrics = [...new Set(input.evaluationTargets.map((target) => target.metric))]
 return {
  version: "algorithm-monitoring-v1",
  sourceEventId: input.sourceEventId,
  createdAt: startedAt,
  finalEvaluationHour,
  checkpoints: horizons.map((horizonHours) => ({
   id: `algorithm-monitor:${input.sourceEventId}:${horizonHours}h`,
   horizonHours,
   dueAt: startedAt + horizonHours * 60 * 60 * 1000,
   role: horizonHours === finalEvaluationHour ? "final_evaluation" : "observe",
   metrics,
   label: `T+${horizonHours}h`,
  })),
 }
}

export const monitoringScheduleForEvent = (event: AlgorithmIntelligenceEvent): AlgorithmMonitoringSchedule => {
 const existing = event.metadata?.monitoringSchedule
 if (existing && typeof existing === "object") return existing as AlgorithmMonitoringSchedule
 return buildAlgorithmMonitoringSchedule({
  sourceEventId: event.id,
  startedAt: event.createdAt,
  evaluationTargets: event.evaluationTargets,
 })
}

/** Adds a stable monitoring schedule to an existing intelligence event. */
export const attachAlgorithmMonitoringSchedule = (
 event: AlgorithmIntelligenceEvent,
): AlgorithmIntelligenceEvent => {
 const monitoringSchedule = monitoringScheduleForEvent(event)
 return recordAlgorithmIntelligenceEvent({
  ...event,
  id: event.id,
  metadata: {
   ...event.metadata,
   monitoringSchedule,
  },
 })
}

export interface DueAlgorithmMonitoringCheckpoint {
 event: AlgorithmIntelligenceEvent
 checkpoint: AlgorithmMonitoringCheckpoint
 overdueByMs: number
 alreadyRecorded: boolean
}

export const listDueAlgorithmMonitoringCheckpoints = (input: {
 channelId: string
 now?: number
 maximum?: number
 includeRecorded?: boolean
}): DueAlgorithmMonitoringCheckpoint[] => {
 const now = input.now || Date.now()
 const maximum = Math.max(1, Math.min(250, input.maximum || 60))
 const events = listAlgorithmIntelligenceEvents({ channelId: input.channelId })
 const recordedIds = new Set(
  events
   .filter((event) => event.kind === "CHECKPOINT_REACHED")
   .map((event) => String(event.metadata?.monitoringCheckpointId || event.sourceId || ""))
   .filter(Boolean),
 )
 return events
  .filter((event) => ["RECOMMENDATION_EXECUTED", "PRIMING_STEP_EXECUTED", "RECOMMENDATION_CREATED", "PRIMING_STEP_PREPARED"].includes(event.kind))
  .flatMap((event) => monitoringScheduleForEvent(event).checkpoints.map((checkpoint) => ({
   event,
   checkpoint,
   overdueByMs: Math.max(0, now - checkpoint.dueAt),
   alreadyRecorded: recordedIds.has(checkpoint.id),
  })))
  .filter((row) => row.checkpoint.dueAt <= now)
  .filter((row) => input.includeRecorded || !row.alreadyRecorded)
  .sort((left, right) => right.overdueByMs - left.overdueByMs)
  .slice(0, maximum)
}

/**
 * Records observation checkpoint lineage only. It deliberately does not create
 * OUTCOME_MEASURED events and therefore cannot increase a learning candidate's
 * sample size. Final outcome evaluation remains owned by BrainEvaluationLoop.
 */
export const recordDueAlgorithmMonitoringCheckpoints = (input: {
 channelId: string
 now?: number
 maximum?: number
}) => listDueAlgorithmMonitoringCheckpoints(input).map(({ event, checkpoint }) =>
 recordAlgorithmIntelligenceEvent({
  id: `algorithm-checkpoint:${checkpoint.id}`,
  channelId: event.channelId,
  projectId: event.projectId,
  videoId: event.videoId,
  kind: "CHECKPOINT_REACHED",
  sourceSystem: "evaluation",
  sourceId: checkpoint.id,
  parentEventIds: [event.id],
  recommendationId: event.recommendationId,
  primingPlanId: event.primingPlanId,
  primingStepId: event.primingStepId,
  actionPacketId: event.actionPacketId,
  workflowId: event.workflowId,
  evidenceIds: event.evidenceIds,
  confidence: event.confidence,
  title: `${checkpoint.label} monitoring checkpoint`,
  summary: checkpoint.role === "final_evaluation"
   ? "The action reached its declared final evaluation horizon and is ready for measured outcome evaluation."
   : "The action reached an intermediate observation horizon. This checkpoint is monitoring evidence only and is not a separate learning outcome.",
  metadata: {
   monitoringCheckpointId: checkpoint.id,
   monitoringRole: checkpoint.role,
   horizonHours: checkpoint.horizonHours,
   metrics: checkpoint.metrics,
   learnableOutcome: false,
  },
 }))
