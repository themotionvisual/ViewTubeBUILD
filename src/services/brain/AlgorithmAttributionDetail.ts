import type { BrainConfidenceLevel } from "../../types"
import {
 getAlgorithmEventLineage,
 listAlgorithmIntelligenceEvents,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import { buildAlgorithmRecommendationCalibration } from "./AlgorithmRecommendationCalibration"
import { monitoringScheduleForEvent } from "./AlgorithmMonitoringSchedule"
import { listAlgorithmLifecycleObservations } from "./AlgorithmLifecycleObservationStore"
import type { AlgorithmEvaluationResult } from "./AlgorithmEvaluationEngine"

export type AlgorithmAttributionStage =
 | "signal"
 | "decision"
 | "execution"
 | "monitoring"
 | "outcome"
 | "learning"

export interface AlgorithmAttributionTimelineItem {
 id: string
 stage: AlgorithmAttributionStage
 kind: AlgorithmIntelligenceEvent["kind"]
 title: string
 summary: string
 createdAt: number
 evidenceIds: string[]
 confidence: BrainConfidenceLevel
 status: string | null
 event: AlgorithmIntelligenceEvent
}

export interface AlgorithmAttributionDetail {
 channelId: string
 rootEventId: string
 root: AlgorithmIntelligenceEvent
 recommendationId: string | null
 primingPlanId: string | null
 primingStepId: string | null
 actionPacketId: string | null
 workflowId: string | null
 videoId: string | null
 command: string | null
 timeline: AlgorithmAttributionTimelineItem[]
 sourceEvents: AlgorithmIntelligenceEvent[]
 decisionEvents: AlgorithmIntelligenceEvent[]
 executionEvents: AlgorithmIntelligenceEvent[]
 checkpointEvents: AlgorithmIntelligenceEvent[]
 outcomeEvents: AlgorithmIntelligenceEvent[]
 learningEvents: AlgorithmIntelligenceEvent[]
 monitoringSchedule: ReturnType<typeof monitoringScheduleForEvent> | null
 lifecycleEvidence: ReturnType<typeof listAlgorithmLifecycleObservations>
 calibration: {
  confidenceBucket: ReturnType<typeof buildAlgorithmRecommendationCalibration>["buckets"][number] | null
  command: ReturnType<typeof buildAlgorithmRecommendationCalibration>["byCommand"][number] | null
  overallSuccessRate: number | null
  warnings: string[]
 }
 counts: {
  evidenceRefs: number
  checkpointsReached: number
  measuredOutcomes: number
  learningEvents: number
 }
}

const stageFor = (event: AlgorithmIntelligenceEvent): AlgorithmAttributionStage => {
 if (["ANOMALY_ESCALATED", "OPPORTUNITY_IDENTIFIED", "PRIMING_PLAN_CREATED"].includes(event.kind)) return "signal"
 if (event.kind === "RECOMMENDATION_CREATED" || event.kind === "PRIMING_STEP_PREPARED") return "decision"
 if (event.kind === "RECOMMENDATION_EXECUTED" || event.kind === "PRIMING_STEP_EXECUTED") return "execution"
 if (event.kind === "CHECKPOINT_REACHED") return "monitoring"
 if (event.kind === "OUTCOME_MEASURED") return "outcome"
 return "learning"
}

const evaluationStatus = (event: AlgorithmIntelligenceEvent) =>
 (event.metadata?.evaluation as AlgorithmEvaluationResult | undefined)?.status || null

const sameAttribution = (root: AlgorithmIntelligenceEvent, candidate: AlgorithmIntelligenceEvent) => {
 if (candidate.id === root.id) return true
 if (root.recommendationId && candidate.recommendationId === root.recommendationId) return true
 if (root.primingStepId && candidate.primingStepId === root.primingStepId) return true
 if (root.primingPlanId && candidate.primingPlanId === root.primingPlanId && root.primingStepId == null) return true
 if (root.actionPacketId && candidate.actionPacketId === root.actionPacketId) return true
 if (root.workflowId && candidate.workflowId === root.workflowId) return true
 return false
}

const uniqueEvents = (events: AlgorithmIntelligenceEvent[]) => {
 const byId = new Map<string, AlgorithmIntelligenceEvent>()
 events.forEach((event) => byId.set(event.id, event))
 return [...byId.values()].sort((left, right) => left.createdAt - right.createdAt)
}

const resolveRoot = (channelId: string, eventId: string) =>
 listAlgorithmIntelligenceEvents({ channelId }).find((event) => event.id === eventId) || null

export const buildAlgorithmAttributionDetail = (input: {
 channelId: string
 eventId: string
 maximumLifecycleEvidence?: number
}): AlgorithmAttributionDetail | null => {
 const root = resolveRoot(input.channelId, input.eventId)
 if (!root) return null
 const all = listAlgorithmIntelligenceEvents({ channelId: input.channelId })
 const lineage = getAlgorithmEventLineage(root.id)
 const related = all.filter((event) => sameAttribution(root, event))
 const events = uniqueEvents([...lineage, ...related])
 const timeline: AlgorithmAttributionTimelineItem[] = events.map((event) => ({
  id: event.id,
  stage: stageFor(event),
  kind: event.kind,
  title: event.title,
  summary: event.summary,
  createdAt: event.createdAt,
  evidenceIds: event.evidenceIds,
  confidence: event.confidence,
  status: evaluationStatus(event),
  event,
 }))
 const sourceEvents = events.filter((event) => stageFor(event) === "signal")
 const decisionEvents = events.filter((event) => stageFor(event) === "decision")
 const executionEvents = events.filter((event) => stageFor(event) === "execution")
 const checkpointEvents = events.filter((event) => stageFor(event) === "monitoring")
 const outcomeEvents = events.filter((event) => stageFor(event) === "outcome")
 const learningEvents = events.filter((event) => stageFor(event) === "learning")
 const execution = executionEvents.at(-1) || decisionEvents.at(-1) || root
 const calibration = buildAlgorithmRecommendationCalibration(input.channelId)
 const command = String(
  root.metadata?.command
  || execution.metadata?.command
  || decisionEvents.at(-1)?.metadata?.command
  || "",
 ).trim() || null
 const confidence = execution.confidence || root.confidence
 const lifecycleEvidence = root.videoId
  ? listAlgorithmLifecycleObservations({ channelId: input.channelId, videoId: root.videoId })
    .filter((row) => execution.evaluationTargets.some((target) => target.metric === row.metric))
    .slice(0, Math.max(1, Math.min(250, input.maximumLifecycleEvidence || 80)))
  : []
 const evidenceRefs = new Set(events.flatMap((event) => event.evidenceIds))

 return {
  channelId: input.channelId,
  rootEventId: root.id,
  root,
  recommendationId: root.recommendationId || execution.recommendationId || null,
  primingPlanId: root.primingPlanId || execution.primingPlanId || null,
  primingStepId: root.primingStepId || execution.primingStepId || null,
  actionPacketId: root.actionPacketId || execution.actionPacketId || null,
  workflowId: root.workflowId || execution.workflowId || null,
  videoId: root.videoId || execution.videoId || null,
  command,
  timeline,
  sourceEvents,
  decisionEvents,
  executionEvents,
  checkpointEvents,
  outcomeEvents,
  learningEvents,
  monitoringSchedule: execution.evaluationTargets.length ? monitoringScheduleForEvent(execution) : null,
  lifecycleEvidence,
  calibration: {
   confidenceBucket: calibration.buckets.find((bucket) => bucket.confidence === confidence) || null,
   command: command ? calibration.byCommand.find((row) => row.command === command) || null : null,
   overallSuccessRate: calibration.overallSuccessRate,
   warnings: calibration.warnings,
  },
  counts: {
   evidenceRefs: evidenceRefs.size,
   checkpointsReached: checkpointEvents.length,
   measuredOutcomes: outcomeEvents.length,
   learningEvents: learningEvents.length,
  },
 }
}

export const buildAlgorithmAttributionSummary = (input: { channelId: string; eventId: string }) => {
 const detail = buildAlgorithmAttributionDetail(input)
 if (!detail) return null
 const latestOutcome = detail.outcomeEvents.at(-1)
 const status = latestOutcome ? evaluationStatus(latestOutcome) : null
 return {
  eventId: detail.rootEventId,
  title: detail.root.title,
  command: detail.command,
  status,
  evidenceRefs: detail.counts.evidenceRefs,
  checkpointsReached: detail.counts.checkpointsReached,
  measuredOutcomes: detail.counts.measuredOutcomes,
  calibrationSuccessRate: detail.calibration.command?.successRate ?? detail.calibration.confidenceBucket?.successRate ?? null,
  lineage: detail.timeline.map((item) => `${item.stage}:${item.kind}:${item.title}`),
 }
}
