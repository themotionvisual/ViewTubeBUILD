import { listAlgorithmIntelligenceEvents, recordAlgorithmIntelligenceEvent, type AlgorithmIntelligenceEvent } from "./AlgorithmIntelligenceEventLedger"
import { listAlgorithmLifecycleObservations, type AlgorithmLifecycleObservation } from "./AlgorithmLifecycleObservationStore"
import { listDueAlgorithmMonitoringCheckpoints, type AlgorithmMonitoringCheckpoint } from "./AlgorithmMonitoringSchedule"

export interface ResolvedMonitoringMetric {
 metric: string
 value: number
 observedAt: number
 lifecycleHour: number
 evidenceId: string | null
}

export interface AlgorithmMonitoringResolution {
 status: "resolved" | "partial" | "missing_evidence" | "not_video_scoped"
 sourceEventId: string
 checkpointId: string
 checkpoint: AlgorithmMonitoringCheckpoint
 metrics: ResolvedMonitoringMetric[]
 missingMetrics: string[]
 event: AlgorithmIntelligenceEvent | null
}

const observationToleranceMs = (checkpoint: AlgorithmMonitoringCheckpoint) => {
 const hours = checkpoint.horizonHours <= 6 ? 2 : checkpoint.horizonHours <= 24 ? 6 : 12
 return hours * 60 * 60 * 1000
}

const closestObservation = (input: {
 observations: AlgorithmLifecycleObservation[]
 event: AlgorithmIntelligenceEvent
 checkpoint: AlgorithmMonitoringCheckpoint
 metric: string
}) => {
 const tolerance = observationToleranceMs(input.checkpoint)
 return input.observations
  .filter((row) => row.channelId === input.event.channelId)
  .filter((row) => row.videoId === input.event.videoId)
  .filter((row) => row.metric === input.metric)
  .filter((row) => Math.abs(row.observedAt - input.checkpoint.dueAt) <= tolerance)
  .sort((left, right) => Math.abs(left.observedAt - input.checkpoint.dueAt) - Math.abs(right.observedAt - input.checkpoint.dueAt))[0] || null
}

export const resolveAlgorithmMonitoringCheckpoint = (input: {
 event: AlgorithmIntelligenceEvent
 checkpoint: AlgorithmMonitoringCheckpoint
 observations?: AlgorithmLifecycleObservation[]
 record?: boolean
}): AlgorithmMonitoringResolution => {
 const { event, checkpoint } = input
 if (!event.videoId) {
  return { status: "not_video_scoped", sourceEventId: event.id, checkpointId: checkpoint.id, checkpoint, metrics: [], missingMetrics: checkpoint.metrics, event: null }
 }
 const observations = input.observations || listAlgorithmLifecycleObservations({ channelId: event.channelId, videoId: event.videoId })
 const matches = checkpoint.metrics.map((metric) => ({ metric, row: closestObservation({ observations, event, checkpoint, metric }) }))
 const resolvedMetrics: ResolvedMonitoringMetric[] = matches
  .filter((match): match is { metric: string; row: AlgorithmLifecycleObservation } => Boolean(match.row))
  .map(({ metric, row }) => ({ metric, value: row.value, observedAt: row.observedAt, lifecycleHour: row.lifecycleHour, evidenceId: row.evidenceId || null }))
 const missingMetrics = matches.filter((match) => !match.row).map((match) => match.metric)
 if (missingMetrics.length) {
  return { status: resolvedMetrics.length ? "partial" : "missing_evidence", sourceEventId: event.id, checkpointId: checkpoint.id, checkpoint, metrics: resolvedMetrics, missingMetrics, event: null }
 }
 if (input.record === false) {
  return { status: "resolved", sourceEventId: event.id, checkpointId: checkpoint.id, checkpoint, metrics: resolvedMetrics, missingMetrics: [], event: null }
 }
 const recorded = recordAlgorithmIntelligenceEvent({
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
  evidenceIds: [...event.evidenceIds, ...resolvedMetrics.map((metric) => metric.evidenceId).filter(Boolean) as string[]],
  confidence: event.confidence,
  title: `${checkpoint.label} monitoring checkpoint`,
  summary: checkpoint.role === "final_evaluation"
   ? "Matching lifecycle evidence exists at the declared final horizon. The action is ready for final measured outcome evaluation."
   : "Matching lifecycle evidence was captured for this intermediate horizon. This remains observation-only and cannot count as a separate learning outcome.",
  metadata: { monitoringCheckpointId: checkpoint.id, monitoringRole: checkpoint.role, horizonHours: checkpoint.horizonHours, metrics: resolvedMetrics, missingMetrics: [], autoResolved: true, learnableOutcome: false },
 })
 return { status: "resolved", sourceEventId: event.id, checkpointId: checkpoint.id, checkpoint, metrics: resolvedMetrics, missingMetrics: [], event: recorded }
}

export const resolveDueAlgorithmMonitoringCheckpoints = (input: { channelId: string; now?: number; maximum?: number }) => {
 const due = listDueAlgorithmMonitoringCheckpoints({ channelId: input.channelId, now: input.now, maximum: input.maximum })
 const observations = listAlgorithmLifecycleObservations({ channelId: input.channelId })
 const resolutions = due.map(({ event, checkpoint }) => resolveAlgorithmMonitoringCheckpoint({ event, checkpoint, observations }))
 return {
  channelId: input.channelId,
  processed: resolutions.length,
  resolved: resolutions.filter((row) => row.status === "resolved").length,
  partial: resolutions.filter((row) => row.status === "partial").length,
  missingEvidence: resolutions.filter((row) => row.status === "missing_evidence").length,
  notVideoScoped: resolutions.filter((row) => row.status === "not_video_scoped").length,
  resolutions,
 }
}

export const summarizeAlgorithmMonitoringResolution = (channelId: string) => {
 const checkpointEvents = listAlgorithmIntelligenceEvents({ channelId, kind: "CHECKPOINT_REACHED" })
 return {
  resolvedCheckpoints: checkpointEvents.length,
  autoResolvedCheckpoints: checkpointEvents.filter((event) => event.metadata?.autoResolved === true).length,
  intermediateObservations: checkpointEvents.filter((event) => event.metadata?.monitoringRole === "observe").length,
  finalHorizonsReached: checkpointEvents.filter((event) => event.metadata?.monitoringRole === "final_evaluation").length,
 }
}
