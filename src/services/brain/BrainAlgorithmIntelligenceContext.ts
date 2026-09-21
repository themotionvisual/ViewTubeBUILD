import {
 buildAlgorithmIntelligenceContext,
 buildAlgorithmIntelligencePortfolio,
 type AlgorithmIntelligencePortfolio,
 type AlgorithmProjectContext,
} from "./AlgorithmIntelligenceOrchestrator"
import type { ExternalAnomalySignal } from "./AnomalySignalBridge"
import type { OpportunityEvidence } from "./OpportunityIntelligence"
import type { AlgorithmSignal } from "./AlgorithmStrategyEngine"

export interface BrainAlgorithmIntelligenceRequest {
 channelId: string
 project?: AlgorithmProjectContext | null
 anomalies?: ExternalAnomalySignal[]
 opportunities?: OpportunityEvidence[]
 directSignals?: AlgorithmSignal[]
 anomalyThresholds?: { minimumImpact?: number; minimumConfidence?: number }
}

export interface BrainAlgorithmIntelligenceResult {
 portfolio: AlgorithmIntelligencePortfolio
 context: string
}

/**
 * Brain-facing entry point for the Algorithm Intelligence & Momentum system.
 * The caller decides which evidence sources are available; this service never
 * fetches YouTube data directly and never executes a tool action.
 */
export const buildBrainAlgorithmIntelligence = async (
 input: BrainAlgorithmIntelligenceRequest,
): Promise<BrainAlgorithmIntelligenceResult> => {
 const portfolio = await buildAlgorithmIntelligencePortfolio(input)
 return {
  portfolio,
  context: buildAlgorithmIntelligenceContext(portfolio),
 }
}
