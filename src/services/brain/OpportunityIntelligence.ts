import type { AlgorithmSignal } from "./AlgorithmStrategyEngine"
import type { DerivedSignal } from "./EvidenceRecord"

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

export const opportunityToDerivedSignal = (opportunity: OpportunityEvidence): DerivedSignal => ({
 id: `derived:opportunity:${opportunity.id}`,
 kind: "opportunity",
 channelId: opportunity.channelId,
 videoId: opportunity.videoId,
 label: `Opportunity: ${opportunity.entity || opportunity.kind.replaceAll("_", " ")}`,
 metric: opportunity.metric,
 currentValue: opportunity.currentValue,
 baselineValue: opportunity.baselineValue,
 delta: (
  typeof opportunity.currentValue === "number"
  && typeof opportunity.baselineValue === "number"
 )
  ? opportunity.currentValue - opportunity.baselineValue
  : null,
 relativeDelta: opportunity.relativeDelta,
 confidence: opportunity.confidence,
 impact: opportunity.impactScore,
 evidenceIds: [...new Set(opportunity.evidenceIds)],
 derivation: {
  method: "opportunity-evidence-normalization",
  version: "v1",
  deterministic: true,
 },
 metadata: {
  sourceKind: opportunity.kind,
 },
})

export const opportunityToAlgorithmSignal = (opportunity: OpportunityEvidence): AlgorithmSignal => {
 const derived = opportunityToDerivedSignal(opportunity)
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
  videoId: derived.videoId,
  entity: opportunity.entity,
  metric: derived.metric,
  currentValue: derived.currentValue,
  baselineValue: derived.baselineValue,
  relativeDelta: derived.relativeDelta,
  impactScore: derived.impact ?? opportunity.impactScore,
  confidence: derived.confidence,
  evidenceIds: derived.evidenceIds,
  context: opportunity.context,
 }
}

export const deriveOpportunitySignals = (opportunities: OpportunityEvidence[]): AlgorithmSignal[] =>
 opportunities.map(opportunityToAlgorithmSignal)
