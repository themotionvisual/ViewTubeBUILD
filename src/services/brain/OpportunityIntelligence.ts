import type { AlgorithmSignal } from "./AlgorithmStrategyEngine"

export type OpportunityKind =
 | "emerging_search"
 | "catalog_gap"
 | "audience_interest"
 | "session_adjacency"
 | "topic_resurgence"
 | "format_opportunity"
 | "packaging_opportunity"

export interface OpportunityEvidence {
 id: string
 kind: OpportunityKind
 channelId: string
 videoId?: string | null
 entity?: string | null
 metric?: string | null
 currentValue?: number | null
 baselineValue?: number | null
 relativeDelta?: number | null
 confidence: number
 impactScore: number
 evidenceIds: string[]
 context?: AlgorithmSignal["context"]
}

export const opportunityToAlgorithmSignal = (opportunity: OpportunityEvidence): AlgorithmSignal => {
 const kind: AlgorithmSignal["kind"] = (() => {
  switch (opportunity.kind) {
   case "emerging_search": return "search_breakout"
   case "session_adjacency": return "session_opportunity"
   case "topic_resurgence": return "back_catalog_resurgence"
   case "packaging_opportunity": return "packaging_decline"
   case "audience_interest": return "traffic_expansion"
   case "format_opportunity": return "traffic_expansion"
   case "catalog_gap": return "unknown"
  }
 })()

 return {
  id: `opportunity:${opportunity.id}`,
  origin: "opportunity",
  kind,
  channelId: opportunity.channelId,
  videoId: opportunity.videoId,
  entity: opportunity.entity,
  metric: opportunity.metric,
  currentValue: opportunity.currentValue,
  baselineValue: opportunity.baselineValue,
  relativeDelta: opportunity.relativeDelta,
  impactScore: opportunity.impactScore,
  confidence: opportunity.confidence,
  evidenceIds: [...new Set(opportunity.evidenceIds)],
  context: opportunity.context,
 }
}

export const deriveOpportunitySignals = (opportunities: OpportunityEvidence[]): AlgorithmSignal[] =>
 opportunities.map(opportunityToAlgorithmSignal)
