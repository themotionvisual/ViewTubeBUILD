import type { SuperToolId } from "../../types"
import { createBrainSuperToolHandoff } from "./BrainSuperToolBridge"
import type { AlgorithmRecommendation } from "./AlgorithmStrategyEngine"

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

export const createAlgorithmRecommendationHandoff = async (input: {
 recommendation: AlgorithmRecommendation
 projectId?: string | null
 creatorDecisions?: Array<{ type: string; choice: string }>
}) => {
 const { recommendation } = input
 if (recommendation.command === "HOLD") {
  return {
   status: "hold" as const,
   recommendation,
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
 })

 return {
  status: "handoff_created" as const,
  recommendation,
  result,
 }
}

export const createAlgorithmRecommendationQueue = async (input: {
 recommendations: AlgorithmRecommendation[]
 projectId?: string | null
 maximum?: number
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
  }))
 }
 return results
}
