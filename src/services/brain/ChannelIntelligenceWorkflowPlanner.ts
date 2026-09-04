import type { ViewTubePayloadKind } from "../viewTubeToolChains"
import {
 recommendNextViewTubeWorkflow,
 type BrainOrchestrationGoal,
 type BrainOrchestrationMode,
} from "../brainAdaptiveOrchestrator"
import {
 buildChannelIntelligenceSnapshot,
 type ChannelIntelligenceSnapshot,
} from "./ChannelIntelligence"
import {
 rankAlgorithmRecommendations,
 type AlgorithmRecommendation,
 type AlgorithmSignal,
} from "./AlgorithmStrategyEngine"
import { createAlgorithmRecommendationHandoff } from "./AlgorithmWorkflowRecipes"

export interface ChannelIntelligenceWorkflowPlan {
 channelId: string
 generatedAt: string
 intelligence: ChannelIntelligenceSnapshot
 algorithmRecommendations: AlgorithmRecommendation[]
 workflow: ReturnType<typeof recommendNextViewTubeWorkflow>
 primaryAlgorithmRecommendation: AlgorithmRecommendation | null
}

const profileToolPreferences = (intelligence: ChannelIntelligenceSnapshot) => {
 const preferred = intelligence.patterns
  .filter((pattern) => pattern.kind === "creator_preference")
  .map((pattern) => pattern.id.replace("creator-preference:", ""))
 const avoided = intelligence.patterns
  .filter((pattern) => pattern.kind === "creator_avoidance")
  .map((pattern) => pattern.id.replace("creator-avoidance:", ""))
 return { preferred, avoided }
}

export const planChannelIntelligenceWorkflow = async (input: {
 channelId: string
 goal: BrainOrchestrationGoal
 signals: AlgorithmSignal[]
 payloadKind?: ViewTubePayloadKind
 sourceToolId?: string
 mode?: BrainOrchestrationMode
 niche?: string | null
 formats?: string[]
}): Promise<ChannelIntelligenceWorkflowPlan> => {
 const intelligence = await buildChannelIntelligenceSnapshot(input.channelId)
 const algorithmRecommendations = rankAlgorithmRecommendations({
  signals: input.signals,
  intelligence,
 })
 const preferences = profileToolPreferences(intelligence)
 const workflow = recommendNextViewTubeWorkflow({
  goal: input.goal,
  payloadKind: input.payloadKind,
  sourceToolId: input.sourceToolId,
  mode: input.mode || "guided",
  channel: {
   channelId: input.channelId,
   niche: input.niche,
   formats: input.formats,
   priorities: [input.goal],
   preferredTools: preferences.preferred,
   avoidedTools: preferences.avoided,
  },
 })

 return {
  channelId: input.channelId,
  generatedAt: new Date().toISOString(),
  intelligence,
  algorithmRecommendations,
  workflow,
  primaryAlgorithmRecommendation: algorithmRecommendations[0] || null,
 }
}

/**
 * Execution remains creator-controlled. Planning and ranking are deterministic,
 * but a recommendation is only converted into a canonical ActionPacket/Handoff
 * when the caller explicitly invokes this function.
 */
export const executePlannedAlgorithmRecommendation = async (input: {
 plan: ChannelIntelligenceWorkflowPlan
 recommendationId?: string
 projectId?: string | null
 creatorDecisions?: Array<{ type: string; choice: string }>
}) => {
 const recommendation = input.recommendationId
  ? input.plan.algorithmRecommendations.find((candidate) => candidate.id === input.recommendationId) || null
  : input.plan.primaryAlgorithmRecommendation

 if (!recommendation) {
  return {
   status: "no_recommendation" as const,
   message: "No algorithm recommendation is available to execute.",
  }
 }

 return createAlgorithmRecommendationHandoff({
  recommendation,
  projectId: input.projectId,
  creatorDecisions: input.creatorDecisions,
 })
}
