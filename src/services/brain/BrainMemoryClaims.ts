import type {
 AIBrainLearningEntry,
 BrainMemoryClaim,
 BrainReflectionDecision,
 ChannelKnowledgeHypothesis,
} from "../../types"
import {
 getBrainMemoryClaimDB,
 getLatestChannelKnowledgeModelDB,
 getLatestToolContextPackDB,
 listBrainMemoryClaimsDB,
 saveBrainMemoryClaimDB,
 saveChannelKnowledgeModelDB,
 saveToolContextPackDB,
} from "./Persistence"

const makeId = (prefix: string): string => {
 const random = typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`
 return `${prefix}_${random}`
}

const claimScope = (entry: AIBrainLearningEntry): BrainMemoryClaim["scope"] => {
 if (entry.category === "analytics_insight" || entry.category === "sync_observation") return "analytics"
 if (entry.category === "answer_quality" || entry.category === "correction") return "answer_policy"
 if (entry.category === "tool_workflow") return "workflow"
 if (entry.category === "creator_goal" || entry.category === "preference") return "creator"
 return "channel"
}

const explicitEntry = (entry: AIBrainLearningEntry): boolean =>
 ["journal", "micro_poll"].includes(entry.source)
 || (entry.source === "copilot" && entry.confidence === "high" && ["creator_goal", "channel_fact", "content_style", "preference"].includes(entry.category))

const normalizedValue = (entry: AIBrainLearningEntry): string =>
 `${entry.summary}${entry.detail && entry.detail !== entry.summary ? `: ${entry.detail}` : ""}`.replace(/\s+/g, " ").trim()

export const reflectBrainOutcome = async (
 entry: AIBrainLearningEntry,
): Promise<BrainReflectionDecision> => {
 const affectedContextPacks = entry.category === "answer_quality" || entry.category === "correction"
  ? ["answer_policy"]
  : entry.category === "analytics_insight"
   ? ["performance", "analytics_tools"]
   : ["channel_knowledge", "creator_tools"]
 if (entry.category === "correction" && entry.metadata?.confirmed !== true) {
  return { learningEntryId: entry.id, decision: "hold", confidence: entry.confidence, reason: "Corrections require creator confirmation before changing a durable claim.", affectedContextPacks }
 }
 if (entry.category === "sync_observation") {
  return { learningEntryId: entry.id, decision: "hold", confidence: entry.confidence, reason: "Data coverage observations are not durable channel facts.", affectedContextPacks }
 }
 if (entry.category === "answer_quality" && entry.recurrenceCount < 3) {
  return { learningEntryId: entry.id, decision: "hold", confidence: entry.confidence, reason: "Answer policy changes require a recurring pattern.", affectedContextPacks }
 }
 if (!explicitEntry(entry) && entry.confidence !== "high" && entry.recurrenceCount < 3) {
  return { learningEntryId: entry.id, decision: "ask_user", confidence: entry.confidence, reason: "The inferred learning needs repetition or creator confirmation.", affectedContextPacks }
 }
 return { learningEntryId: entry.id, decision: "promote", confidence: entry.confidence, reason: explicitEntry(entry) ? "The creator stated this directly." : "Repeated evidence passed the promotion threshold.", affectedContextPacks }
}

export const promoteBrainClaim = async (
 entry: AIBrainLearningEntry,
): Promise<{ claim: BrainMemoryClaim | null; decision: BrainReflectionDecision }> => {
 const decision = await reflectBrainOutcome(entry)
 if (decision.decision !== "promote") return { claim: null, decision }
 const now = new Date().toISOString()
 const scope = claimScope(entry)
 const value = normalizedValue(entry)
 const claims = await listBrainMemoryClaimsDB(entry.channelId)
 const equivalent = claims.find((claim) => claim.status === "active" && claim.scope === scope && claim.category === entry.category && claim.value.toLowerCase() === value.toLowerCase())
 if (equivalent) {
  const claim = { ...equivalent, updatedAt: now, evidence: Array.from(new Set([...equivalent.evidence, ...entry.evidence])), learningEntryIds: Array.from(new Set([...equivalent.learningEntryIds, entry.id])) }
  await saveBrainMemoryClaimDB(claim)
  return { claim, decision: { ...decision, claimId: claim.id } }
 }

 const superseded = claims.find((claim) => claim.status === "active" && claim.scope === scope && claim.category === entry.category)
 const claim: BrainMemoryClaim = {
  id: makeId("brain_claim"),
  channelId: entry.channelId,
  scope,
  category: entry.category,
  value,
  evidence: entry.evidence,
  confidence: entry.confidence,
  source: entry.source,
  createdAt: now,
  updatedAt: now,
  validFrom: now,
  validTo: scope === "analytics" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
  confirmationState: explicitEntry(entry) ? "explicit" : "inferred",
  status: "active",
  supersedesClaimId: superseded?.id,
  learningEntryIds: [entry.id],
 }
 if (superseded) {
  await saveBrainMemoryClaimDB({ ...superseded, status: "superseded", supersededByClaimId: claim.id, updatedAt: now })
 }
 await saveBrainMemoryClaimDB(claim)
 return { claim, decision: { ...decision, claimId: claim.id, decision: superseded ? "supersede" : "promote" } }
}

export const undoBrainMemoryClaim = async (claimId: string): Promise<BrainMemoryClaim | null> => {
 const claim = await getBrainMemoryClaimDB(claimId)
 if (!claim) return null
 const updatedAt = new Date().toISOString()
 const undone = { ...claim, status: "undone" as const, updatedAt }
 await saveBrainMemoryClaimDB(undone)
 if (claim.supersedesClaimId) {
  const previous = await getBrainMemoryClaimDB(claim.supersedesClaimId)
  if (previous?.status === "superseded" && previous.supersededByClaimId === claim.id) {
   await saveBrainMemoryClaimDB({ ...previous, status: "active", supersededByClaimId: undefined, updatedAt })
  }
 }
 return undone
}

export const listActiveBrainMemoryClaims = async (channelId?: string | null): Promise<BrainMemoryClaim[]> => {
 const now = Date.now()
 return (await listBrainMemoryClaimsDB(channelId)).filter((claim) =>
  claim.status === "active" && (!claim.validTo || new Date(claim.validTo).getTime() > now))
}

export const rebuildAffectedToolContextPacks = async (input: {
 channelId?: string | null
 affectedContextPacks: string[]
}): Promise<void> => {
 const claims = await listActiveBrainMemoryClaims(input.channelId)
 const contextBlock = claims.slice(0, 16).map((claim) => `- [${claim.scope}/${claim.category}] ${claim.value}`).join("\n")
 const pack = await getLatestToolContextPackDB(input.channelId)
 if (pack) {
  const base = pack.contextBlock.split("\nSTRUCTURED BRAIN CLAIMS\n")[0]
  await saveToolContextPackDB({
   ...pack,
   createdAt: new Date().toISOString(),
   contextBlock: `${base}\nSTRUCTURED BRAIN CLAIMS\n${contextBlock}`.trim(),
  })
 }

 if (input.affectedContextPacks.includes("channel_knowledge")) {
  const model = await getLatestChannelKnowledgeModelDB(input.channelId)
  if (model) {
   const hypotheses: ChannelKnowledgeHypothesis[] = claims
    .filter((claim) => claim.scope === "creator" || claim.scope === "channel")
    .slice(0, 8)
    .map((claim) => ({ id: `claim_hypothesis_${claim.id}`, label: claim.category.replace(/_/g, " "), summary: claim.value, confidence: claim.confidence, evidenceIds: claim.evidence }))
   const nonClaimHypotheses = model.creatorCommunication.filter((item) => !item.id.startsWith("claim_hypothesis_"))
   await saveChannelKnowledgeModelDB({ ...model, updatedAt: new Date().toISOString(), creatorCommunication: [...nonClaimHypotheses, ...hypotheses] })
  }
 }
}
