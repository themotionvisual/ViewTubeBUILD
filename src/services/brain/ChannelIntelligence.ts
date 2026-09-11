import type { BrainConfidenceLevel } from "../../types"
import { loadBrainChannelProfile } from "./ChannelProfileAdapter"
import { listBrainOutcomes, summarizeBrainOutcomes, type BrainOutcomeRecord } from "./BrainOutcomeLedger"
import { getBrainWorkflowResults, type BrainWorkflowResult } from "../brainWorkflowLearning"

export type ChannelIntelligencePatternKind =
 | "workflow_strength"
 | "workflow_weakness"
 | "creator_preference"
 | "creator_avoidance"
 | "validated_claim"

export interface ChannelIntelligencePattern {
 id: string
 kind: ChannelIntelligencePatternKind
 statement: string
 confidence: BrainConfidenceLevel
 evidenceCount: number
 evidenceIds: string[]
}

export interface ChannelIntelligenceSnapshot {
 channelId: string
 generatedAt: string
 personalizationEnabled: boolean
 analyticsAvailable: boolean
 profileSummary: string
 learnedClaims: string[]
 outcomeSummary: ReturnType<typeof summarizeBrainOutcomes>
 workflowResults: BrainWorkflowResult[]
 patterns: ChannelIntelligencePattern[]
}

const confidenceForCount = (count: number): BrainConfidenceLevel =>
 count >= 5 ? "high" : count >= 2 ? "medium" : "low"

const workflowPatternRows = (rows: BrainWorkflowResult[]): ChannelIntelligencePattern[] => {
 const byChain = new Map<string, BrainWorkflowResult[]>()
 rows.forEach((row) => {
  const list = byChain.get(row.chainId) || []
  list.push(row)
  byChain.set(row.chainId, list)
 })

 return [...byChain.entries()].flatMap(([chainId, chainRows]) => {
  const positive = chainRows.filter((row) => row.outcome === "accepted" || row.outcome === "completed")
  const negative = chainRows.filter((row) => row.outcome === "rejected" || row.outcome === "abandoned")
  if (chainRows.length < 2) return []

  if (positive.length / chainRows.length >= 0.66) {
   return [{
    id: `workflow-strength:${chainId}`,
    kind: "workflow_strength" as const,
    statement: `${chainId} has been accepted or completed in ${positive.length}/${chainRows.length} recent channel outcomes.`,
    confidence: confidenceForCount(chainRows.length),
    evidenceCount: chainRows.length,
    evidenceIds: chainRows.map((row) => row.id),
   }]
  }

  if (negative.length / chainRows.length >= 0.5) {
   return [{
    id: `workflow-weakness:${chainId}`,
    kind: "workflow_weakness" as const,
    statement: `${chainId} has been rejected or abandoned in ${negative.length}/${chainRows.length} recent channel outcomes.`,
    confidence: confidenceForCount(chainRows.length),
    evidenceCount: chainRows.length,
    evidenceIds: chainRows.map((row) => row.id),
   }]
  }
  return []
 })
}

const outcomeToolPatterns = (rows: BrainOutcomeRecord[]): ChannelIntelligencePattern[] => {
 const counts = new Map<string, { positive: number; negative: number; ids: string[] }>()
 rows.forEach((row) => {
  const key = row.targetToolId || row.sourceToolId
  const current = counts.get(key) || { positive: 0, negative: 0, ids: [] }
  if (row.outcome === "accepted" || row.outcome === "completed") current.positive += 1
  if (row.outcome === "rejected" || row.outcome === "abandoned") current.negative += 1
  current.ids.push(row.id)
  counts.set(key, current)
 })

 return [...counts.entries()].flatMap(([toolId, value]) => {
  const total = value.positive + value.negative
  if (total < 2) return []
  if (value.positive / total >= 0.7) {
   return [{
    id: `creator-preference:${toolId}`,
    kind: "creator_preference" as const,
    statement: `Channel outcomes show a positive preference for ${toolId} (${value.positive}/${total} accepted or completed).`,
    confidence: confidenceForCount(total),
    evidenceCount: total,
    evidenceIds: value.ids,
   }]
  }
  if (value.negative / total >= 0.6) {
   return [{
    id: `creator-avoidance:${toolId}`,
    kind: "creator_avoidance" as const,
    statement: `Channel outcomes show repeated rejection or abandonment around ${toolId} (${value.negative}/${total}).`,
    confidence: confidenceForCount(total),
    evidenceCount: total,
    evidenceIds: value.ids,
   }]
  }
  return []
 })
}

export const deriveChannelIntelligencePatterns = (input: {
 workflowResults: BrainWorkflowResult[]
 outcomes: BrainOutcomeRecord[]
 learnedClaims?: Array<{ id: string; value: string; confidence?: BrainConfidenceLevel }>
}): ChannelIntelligencePattern[] => {
 const claims: ChannelIntelligencePattern[] = (input.learnedClaims || []).slice(0, 12).map((claim) => ({
  id: `validated-claim:${claim.id}`,
  kind: "validated_claim",
  statement: claim.value,
  confidence: claim.confidence || "medium",
  evidenceCount: 1,
  evidenceIds: [claim.id],
 }))
 return [
  ...claims,
  ...workflowPatternRows(input.workflowResults),
  ...outcomeToolPatterns(input.outcomes),
 ]
}

export const buildChannelIntelligenceSnapshot = async (
 channelId: string,
): Promise<ChannelIntelligenceSnapshot> => {
 const profile = await loadBrainChannelProfile(channelId)
 const outcomes = listBrainOutcomes(channelId)
 const workflowResults = getBrainWorkflowResults(channelId)
 const profileSummary = [
  profile.toolContextPack ? JSON.stringify(profile.toolContextPack) : "",
  profile.knowledgeModel ? JSON.stringify(profile.knowledgeModel) : "",
  profile.nicheKnowledge ? JSON.stringify(profile.nicheKnowledge) : "",
 ].filter(Boolean).join("\n").slice(0, 2800) || "No durable channel profile has been learned yet."

 return {
  channelId,
  generatedAt: new Date().toISOString(),
  personalizationEnabled: profile.personalizationEnabled,
  analyticsAvailable: profile.analyticsEnabled && Boolean(profile.evidencePacket),
  profileSummary,
  learnedClaims: profile.memoryClaims.slice(0, 12).map((claim) => claim.value),
  outcomeSummary: summarizeBrainOutcomes(channelId),
  workflowResults: workflowResults.slice(0, 100),
  patterns: deriveChannelIntelligencePatterns({
   workflowResults,
   outcomes,
   learnedClaims: profile.memoryClaims.map((claim) => ({
    id: claim.id,
    value: claim.value,
    confidence: claim.confidence,
   })),
  }),
 }
}

export const buildChannelIntelligenceContext = async (channelId: string): Promise<string> => {
 const snapshot = await buildChannelIntelligenceSnapshot(channelId)
 const patternLines = snapshot.patterns.slice(0, 10).map((pattern) =>
  `- ${pattern.kind}: ${pattern.statement} [${pattern.confidence}; n=${pattern.evidenceCount}]`,
 )
 return [
  "CHANNEL INTELLIGENCE",
  `channelId=${channelId}`,
  `personalization=${snapshot.personalizationEnabled ? "on" : "off"}`,
  `analytics=${snapshot.analyticsAvailable ? "available" : "unavailable"}`,
  `workflowAcceptance=${snapshot.outcomeSummary.acceptanceRate}%`,
  "",
  "DURABLE PROFILE",
  snapshot.profileSummary,
  "",
  "LEARNED PATTERNS",
  ...(patternLines.length ? patternLines : ["- No repeated channel-specific workflow pattern has enough evidence yet."]),
 ].join("\n")
}
