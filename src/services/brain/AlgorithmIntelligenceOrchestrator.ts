import { buildChannelIntelligenceSnapshot, type ChannelIntelligenceSnapshot } from "./ChannelIntelligence"
import {
 buildAlgorithmPrimingPlan,
 type AlgorithmPrimingPlan,
 type PrimingVideoContext,
} from "./AlgorithmPrimingEngine"
import {
 deriveOpportunitySignals,
 type OpportunityEvidence,
} from "./OpportunityIntelligence"
import {
 escalateAnomaliesToAlgorithmSignals,
 type ExternalAnomalySignal,
} from "./AnomalySignalBridge"
import {
 rankAlgorithmRecommendations,
 type AlgorithmRecommendation,
 type AlgorithmSignal,
} from "./AlgorithmStrategyEngine"

export interface AlgorithmProjectContext {
 channelId: string
 projectId?: string | null
 videoId?: string | null
 title?: string | null
 topic?: string | null
 format?: string | null
 plannedPublishAt?: string | null
 targetAudience?: string[]
 supportingVideoIds?: string[]
 evidenceIds?: string[]
}

export interface AlgorithmIntelligencePortfolio {
 channelId: string
 generatedAt: string
 channelIntelligence: ChannelIntelligenceSnapshot
 primingPlan: AlgorithmPrimingPlan | null
 anomalySignals: AlgorithmSignal[]
 opportunitySignals: AlgorithmSignal[]
 directSignals: AlgorithmSignal[]
 allDecisionSignals: AlgorithmSignal[]
 recommendations: AlgorithmRecommendation[]
 primaryRecommendation: AlgorithmRecommendation | null
 architecture: {
  channelIntelligenceRole: string
  anomalyRole: string
  opportunityRole: string
  primingRole: string
  decisionRole: string
 }
}

const uniqueSignals = (signals: AlgorithmSignal[]) => {
 const seen = new Set<string>()
 return signals.filter((signal) => {
  if (seen.has(signal.id)) return false
  seen.add(signal.id)
  return true
 })
}

/**
 * Parent orchestration layer for Algorithm Intelligence & Momentum.
 *
 * Important boundaries:
 * - Channel Intelligence describes durable channel context/patterns.
 * - Anomaly Intelligence detects unusual changes elsewhere and only feeds this layer through the bridge.
 * - Opportunity Intelligence identifies strategically useful openings that may not be statistical anomalies.
 * - Algorithm Priming proactively prepares a specific launch/project and is NOT generated from anomaly detection.
 * - Algorithm Strategy ranks signals into recommendations; execution remains a separate approved workflow step.
 */
export const buildAlgorithmIntelligencePortfolio = async (input: {
 channelId: string
 project?: AlgorithmProjectContext | null
 anomalies?: ExternalAnomalySignal[]
 opportunities?: OpportunityEvidence[]
 directSignals?: AlgorithmSignal[]
 anomalyThresholds?: { minimumImpact?: number; minimumConfidence?: number }
}): Promise<AlgorithmIntelligencePortfolio> => {
 const channelIntelligence = await buildChannelIntelligenceSnapshot(input.channelId)

 const anomalySignals = escalateAnomaliesToAlgorithmSignals(
  input.anomalies || [],
  input.anomalyThresholds,
 )
 const opportunitySignals = deriveOpportunitySignals(input.opportunities || [])
 const directSignals = (input.directSignals || []).map((signal) => ({
  ...signal,
  origin: signal.origin || "creator" as const,
 }))
 const allDecisionSignals = uniqueSignals([
  ...anomalySignals,
  ...opportunitySignals,
  ...directSignals,
 ])
 const recommendations = rankAlgorithmRecommendations({
  signals: allDecisionSignals,
  intelligence: channelIntelligence,
 })

 let primingPlan: AlgorithmPrimingPlan | null = null
 if (input.project) {
  const video: PrimingVideoContext = {
   channelId: input.project.channelId,
   projectId: input.project.projectId,
   videoId: input.project.videoId,
   title: input.project.title,
   topic: input.project.topic,
   format: input.project.format,
   plannedPublishAt: input.project.plannedPublishAt,
   targetAudience: input.project.targetAudience,
   supportingVideoIds: input.project.supportingVideoIds,
   evidenceIds: input.project.evidenceIds,
  }
  primingPlan = buildAlgorithmPrimingPlan({ video, intelligence: channelIntelligence })
 }

 return {
  channelId: input.channelId,
  generatedAt: new Date().toISOString(),
  channelIntelligence,
  primingPlan,
  anomalySignals,
  opportunitySignals,
  directSignals,
  allDecisionSignals,
  recommendations,
  primaryRecommendation: recommendations[0] || null,
  architecture: {
   channelIntelligenceRole: "Describe durable channel context, validated learnings and repeated workflow/outcome patterns.",
   anomalyRole: "Detect unusual changes independently, then escalate only material evidence-backed signals.",
   opportunityRole: "Identify strategically useful openings even when they are not statistical anomalies.",
   primingRole: "Proactively prepare a specific video/project before, during and after launch.",
   decisionRole: "Compare evidence sources and rank controlled recommendations without executing them automatically.",
  },
 }
}

export const buildAlgorithmIntelligenceContext = (portfolio: AlgorithmIntelligencePortfolio): string => {
 const anomalyLines = portfolio.anomalySignals.slice(0, 5).map((signal) =>
  `- ${signal.kind}: ${signal.entity || signal.metric || signal.id} [impact=${signal.impactScore}; confidence=${signal.confidence}]`,
 )
 const opportunityLines = portfolio.opportunitySignals.slice(0, 5).map((signal) =>
  `- ${signal.kind}: ${signal.entity || signal.metric || signal.id} [impact=${signal.impactScore}; confidence=${signal.confidence}]`,
 )
 const recommendationLines = portfolio.recommendations.slice(0, 5).map((recommendation) =>
  `- ${recommendation.command}: ${recommendation.title} [score=${recommendation.score}; origin=${recommendation.signalOrigin}]`,
 )
 const primingLines = portfolio.primingPlan?.steps.slice(0, 6).map((candidate) =>
  `- ${candidate.phase}: ${candidate.title} (${candidate.relativeTiming})`,
 ) || []

 return [
  "ALGORITHM INTELLIGENCE & MOMENTUM",
  `channelId=${portfolio.channelId}`,
  "",
  "CHANNEL INTELLIGENCE",
  ...portfolio.channelIntelligence.patterns.slice(0, 5).map((pattern) => `- ${pattern.statement}`),
  "",
  "ANOMALY SIGNALS",
  ...(anomalyLines.length ? anomalyLines : ["- No material anomaly signals escalated."]),
  "",
  "OPPORTUNITY SIGNALS",
  ...(opportunityLines.length ? opportunityLines : ["- No opportunity signals supplied."]),
  "",
  "PRIMING PLAN",
  ...(primingLines.length ? primingLines : ["- No active project priming plan requested."]),
  "",
  "DECISION RECOMMENDATIONS",
  ...(recommendationLines.length ? recommendationLines : ["- No recommendation has enough evidence yet."]),
 ].join("\n")
}
