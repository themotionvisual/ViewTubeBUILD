import { readBrainUserControls, canBrainUseCapability } from "./BrainUserControls"
import {
 buildAlgorithmIntelligencePortfolio,
 type AlgorithmIntelligencePortfolio,
 type AlgorithmProjectContext,
} from "./AlgorithmIntelligenceOrchestrator"
import type { ExternalAnomalySignal } from "./AnomalySignalBridge"
import type { OpportunityEvidence } from "./OpportunityIntelligence"
import type { AlgorithmSignal } from "./AlgorithmStrategyEngine"
import { createAlgorithmRecommendationHandoff } from "./AlgorithmWorkflowRecipes"
import { createPrimingStepHandoff } from "./AlgorithmPrimingWorkflow"

export type AlgorithmIntelligenceAccessResult<T> =
 | { status: "ok"; value: T }
 | { status: "disabled" | "analytics_disabled" | "projects_disabled" | "approval_required" | "not_found"; message: string }

export const readAlgorithmIntelligenceForBrain = async (input: {
 channelId: string
 project?: AlgorithmProjectContext | null
 anomalies?: ExternalAnomalySignal[]
 opportunities?: OpportunityEvidence[]
 directSignals?: AlgorithmSignal[]
}): Promise<AlgorithmIntelligenceAccessResult<AlgorithmIntelligencePortfolio>> => {
 const controls = readBrainUserControls(input.channelId)
 if (!controls.enabled) {
  return { status: "disabled", message: "ViewTube Brain is disabled by the creator." }
 }
 if (!canBrainUseCapability(controls, "analytics")) {
  return { status: "analytics_disabled", message: "Analytics access is disabled in Brain User Controls." }
 }
 if (input.project && !canBrainUseCapability(controls, "projects")) {
  return { status: "projects_disabled", message: "Project access is disabled in Brain User Controls." }
 }
 const value = await buildAlgorithmIntelligencePortfolio(input)
 return { status: "ok", value }
}

export const executeAlgorithmRecommendationForBrain = async (input: {
 portfolio: AlgorithmIntelligencePortfolio
 recommendationId: string
 projectId?: string | null
 creatorApproved?: boolean
 creatorDecisions?: Array<{ type: string; choice: string }>
}) => {
 const controls = readBrainUserControls(input.portfolio.channelId)
 if (!controls.enabled) return { status: "disabled" as const, message: "ViewTube Brain is disabled by the creator." }
 const recommendation = input.portfolio.recommendations.find((candidate) => candidate.id === input.recommendationId)
 if (!recommendation) return { status: "not_found" as const, message: "Algorithm recommendation was not found." }
 if (controls.externalActionsRequireApproval && input.creatorApproved !== true) {
  return { status: "approval_required" as const, message: "Creator approval is required before the recommendation can create a tool handoff." }
 }
 return createAlgorithmRecommendationHandoff({ recommendation, projectId: input.projectId, creatorDecisions: input.creatorDecisions })
}

export const executePrimingStepForBrain = async (input: {
 portfolio: AlgorithmIntelligencePortfolio
 stepId: string
 creatorApproved?: boolean
 creatorDecisions?: Array<{ type: string; choice: string }>
}) => {
 const controls = readBrainUserControls(input.portfolio.channelId)
 if (!controls.enabled) return { status: "disabled" as const, message: "ViewTube Brain is disabled by the creator." }
 if (!canBrainUseCapability(controls, "projects")) return { status: "projects_disabled" as const, message: "Project access is disabled in Brain User Controls." }
 if (!input.portfolio.primingPlan) return { status: "not_found" as const, message: "No active priming plan exists in this portfolio." }
 return createPrimingStepHandoff({ plan: input.portfolio.primingPlan, stepId: input.stepId, creatorApproved: input.creatorApproved, creatorDecisions: input.creatorDecisions })
}
