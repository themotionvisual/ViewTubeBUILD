import type { SuperToolId } from "../../types"
import { createBrainSuperToolHandoff } from "./BrainSuperToolBridge"
import type { AlgorithmRecommendation } from "./AlgorithmStrategyEngine"
import {
 recordAlgorithmIntelligenceEvent,
 type AlgorithmEvaluationTarget,
} from "./AlgorithmIntelligenceEventLedger"
import { attachAlgorithmMonitoringSchedule } from "./AlgorithmMonitoringSchedule"

export const ALGORITHM_COMMAND_TARGETS: Partial<Record<AlgorithmRecommendation["command"], SuperToolId>> = {
 AMPLIFY: "audience-loop-studio",
 REPACKAGE: "packaging-lab-pro",
 RETARGET: "packaging-lab-pro",
 REINFORCE_SESSION: "packaging-lab-pro",
 CREATE_FOLLOWUP: "creator-canvas-os",
 INSPECT: "cinematic-analytics-lab",
}

const objectiveFor = (recommendation: AlgorithmRecommendation) => {
 switch (recommendation.command) {
  case "AMPLIFY": return "Turn a validated momentum signal into a controlled amplification plan without changing the underlying evidence trail."
  case "REPACKAGE": return "Create one controlled packaging experiment tied to the detected performance signal and its evaluation checkpoint."
  case "RETARGET": return "Re-align promise, audience and packaging around the detected audience/watch-quality mismatch."
  case "REINFORCE_SESSION": return "Create a stronger next-video/end-screen/session path from the detected adjacency opportunity."
  case "CREATE_FOLLOWUP": return "Turn an emerging demand/performance signal into a channel-specific follow-up concept or derivative asset plan."
  case "INSPECT": return "Open the affected analytics context and validate the signal before a creator intervention is approved."
  case "HOLD": return "Hold the current strategy and monitor the defined checkpoint without creating a write action."
 }
}

/**
 * Selectively forward-ported from the stronger Phase 6 branch.
 * These targets are the existing product policy for controlled recommendation
 * evaluation; analytics-canon/AlgorithmEvaluationEngine still own measurement.
 */
export const evaluationTargetsForAlgorithmRecommendation = (
 recommendation: AlgorithmRecommendation,
): AlgorithmEvaluationTarget[] => {
 switch (recommendation.command) {
  case "REPACKAGE": return [
   { metric: "ctr", direction: "increase", minimumRelativeChange: .05, windowHours: 72 },
   { metric: "watch_quality", direction: "hold", minimumRelativeChange: .05, windowHours: 72 },
  ]
  case "RETARGET": return [
   { metric: "watch_quality", direction: "increase", minimumRelativeChange: .05, windowHours: 168 },
  ]
  case "REINFORCE_SESSION": return [
   { metric: "session_continuation", direction: "increase", minimumRelativeChange: .05, windowHours: 168 },
  ]
  case "AMPLIFY": return [
   { metric: "qualified_views", direction: "increase", minimumRelativeChange: .05, windowHours: 72 },
   { metric: "watch_quality", direction: "hold", minimumRelativeChange: .05, windowHours: 72 },
  ]
  case "CREATE_FOLLOWUP": return [
   { metric: "followup_demand", direction: "inspect", windowHours: 168 },
  ]
  case "INSPECT": return [
   { metric: "diagnosis_complete", direction: "inspect", windowHours: 24 },
  ]
  case "HOLD": return [
   { metric: "watch_quality", direction: "hold", minimumRelativeChange: .05, windowHours: 48 },
  ]
 }
}

const checkpointAtFor = (targets: AlgorithmEvaluationTarget[]) => {
 const hours = Math.max(...targets.map((target) => target.windowHours || 24), 24)
 return Date.now() + hours * 60 * 60 * 1000
}

export const createAlgorithmRecommendationHandoff = async (input: {
 recommendation: AlgorithmRecommendation
 projectId?: string | null
 creatorDecisions?: Array<{ type: string; choice: string }>
 traceId?: string | null
 outputRef?: string | null
}) => {
 const { recommendation } = input
 const evaluationTargets = evaluationTargetsForAlgorithmRecommendation(recommendation)

 if (recommendation.command === "HOLD") {
  const event = attachAlgorithmMonitoringSchedule(recordAlgorithmIntelligenceEvent({
   channelId: recommendation.channelId,
   projectId: input.projectId,
   videoId: typeof recommendation.payload.videoId === "string" ? recommendation.payload.videoId : null,
   kind: "RECOMMENDATION_CREATED",
   sourceSystem: "decision",
   sourceId: recommendation.signalId,
   recommendationId: recommendation.id,
   traceId: input.traceId || null,
   outputRef: input.outputRef || null,
   evidenceIds: recommendation.evidenceIds,
   confidence: recommendation.confidence,
   title: recommendation.title,
   summary: recommendation.rationale,
   evaluationTargets,
   checkpointAt: checkpointAtFor(evaluationTargets),
   metadata: {
    command: recommendation.command,
    checkpoint: recommendation.checkpoint,
    hold: true,
   },
  }))
  return {
   status: "hold" as const,
   recommendation,
   event,
   message: recommendation.checkpoint,
  }
 }

 const destinationToolId = recommendation.targetToolId || ALGORITHM_COMMAND_TARGETS[recommendation.command]
 if (!destinationToolId) {
  return {
   status: "no_target" as const,
   recommendation,
   message: "No compatible destination tool is registered for this recommendation yet.",
  }
 }

 const result = await createBrainSuperToolHandoff({
  channelId: recommendation.channelId,
  projectId: input.projectId,
  sourceToolId: "brain-command-center",
  destinationToolId,
  objective: objectiveFor(recommendation),
  payload: {
   algorithmRecommendationId: recommendation.id,
   command: recommendation.command,
   recommendationTitle: recommendation.title,
   rationale: recommendation.rationale,
   checkpoint: recommendation.checkpoint,
   guardrails: recommendation.guardrails,
   signal: recommendation.payload,
  },
  evidenceIds: recommendation.evidenceIds,
  creatorDecisions: input.creatorDecisions,
  confidence: recommendation.confidence,
  traceId: input.traceId || null,
  outputRef: input.outputRef || null,
 })

 const event = attachAlgorithmMonitoringSchedule(recordAlgorithmIntelligenceEvent({
  channelId: recommendation.channelId,
  projectId: input.projectId,
  videoId: typeof recommendation.payload.videoId === "string" ? recommendation.payload.videoId : null,
  kind: "RECOMMENDATION_EXECUTED",
  sourceSystem: "workflow",
  sourceId: recommendation.signalId,
  recommendationId: recommendation.id,
  actionPacketId: result.packet.id,
  workflowId: result.chain.id,
  traceId: input.traceId || null,
  outputRef: input.outputRef || null,
  evidenceIds: recommendation.evidenceIds,
  confidence: recommendation.confidence,
  title: recommendation.title,
  summary: recommendation.rationale,
  evaluationTargets,
  checkpointAt: checkpointAtFor(evaluationTargets),
  metadata: {
   command: recommendation.command,
   destinationToolId,
   checkpoint: recommendation.checkpoint,
  },
 }))

 return {
  status: "handoff_created" as const,
  recommendation,
  result,
  event,
 }
}

export const createAlgorithmRecommendationQueue = async (input: {
 recommendations: AlgorithmRecommendation[]
 projectId?: string | null
 maximum?: number
 traceId?: string | null
 outputRef?: string | null
}) => {
 const maximum = Math.max(1, Math.min(10, input.maximum || 3))
 const actionable = input.recommendations
  .filter((recommendation) => recommendation.command !== "HOLD")
  .slice(0, maximum)

 const results = []
 for (const recommendation of actionable) {
  results.push(await createAlgorithmRecommendationHandoff({
   recommendation,
   projectId: input.projectId,
   traceId: input.traceId,
   outputRef: input.outputRef,
  }))
 }
 return results
}
