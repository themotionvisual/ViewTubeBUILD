import type { ViewTubePayloadKind } from "../viewTubeToolChains"
import {
 recommendNextViewTubeWorkflow,
 type BrainOrchestrationGoal,
 type BrainOrchestrationMode,
} from "../brainAdaptiveOrchestrator"
import type { ChannelIntelligenceSnapshot } from "./ChannelIntelligence"
import {
 buildAlgorithmIntelligencePortfolio,
 type AlgorithmIntelligencePortfolio,
 type AlgorithmProjectContext,
} from "./AlgorithmIntelligenceOrchestrator"
import type { ExternalAnomalySignal } from "./AnomalySignalBridge"
import type { OpportunityEvidence } from "./OpportunityIntelligence"
import type { AlgorithmRecommendation, AlgorithmSignal } from "./AlgorithmStrategyEngine"
import { createAlgorithmRecommendationHandoff } from "./AlgorithmWorkflowRecipes"

export interface ChannelIntelligenceWorkflowPlan {
 channelId: string
 generatedAt: string
 intelligence: ChannelIntelligenceSnapshot
 portfolio: AlgorithmIntelligencePortfolio
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

/**
 * Compatibility planner over the canonical Algorithm Intelligence portfolio.
 * New callers should supply anomaly/opportunity/project inputs through this
 * function rather than creating a second strategy path.
 */
export const planChannelIntelligenceWorkflow = async (input: {
 channelId: string
 goal: BrainOrchestrationGoal
 signals?: AlgorithmSignal[]
 anomalies?: ExternalAnomalySignal[]
 opportunities?: OpportunityEvidence[]
 project?: AlgorithmProjectContext | null
 payloadKind?: ViewTubePayloadKind
 sourceToolId?: string
 mode?: BrainOrchestrationMode
 niche?: string | null
 formats?: string[]
}): Promise<ChannelIntelligenceWorkflowPlan> => {
 const portfolio = await buildAlgorithmIntelligencePortfolio({
  channelId: input.channelId,
  project: input.project,
  anomalies: input.anomalies,
  opportunities: input.opportunities,
  directSignals: input.signals,
 })
 const intelligence = portfolio.channelIntelligence
 const algorithmRecommendations = portfolio.recommendations
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
  generatedAt: portfolio.generatedAt,
  intelligence,
  portfolio,
  algorithmRecommendations,
  workflow,
  primaryAlgorithmRecommendation: portfolio.primaryRecommendation,
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
