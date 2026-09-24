import type {
 BrainConfidenceLevel,
 BrainMemoryClaim,
 ChannelKnowledgeHypothesis,
 ChannelKnowledgeModel,
} from "../../types"

export type ChannelKnowledgeClass =
 | "FACT"
 | "CREATOR_PREFERENCE"
 | "CHANNEL_IDENTITY"
 | "CONTENT_PATTERN"
 | "AUDIENCE_OBSERVATION"
 | "PERFORMANCE_PATTERN"
 | "PACKAGING_PATTERN"
 | "WORKFLOW_PREFERENCE"
 | "HYPOTHESIS"
 | "LEARNING_CANDIDATE"
 | "VALIDATED_LEARNING"
 | "REJECTED_LEARNING"
 | "SUPERSEDED_LEARNING"

export type ChannelKnowledgeLifecycleState =
 | "active"
 | "stale"
 | "superseded"
 | "undone"
 | "hypothesis"
 | "candidate"
 | "rejected"

export type ChannelKnowledgeLearningReviewDecision =
 | "hold"
 | "reject"
 | "approve_for_profile_review"
 | null

export interface ChannelKnowledgeLearningInput {
 id: string
 channelId: string
 statement: string
 confidence: BrainConfidenceLevel
 evidenceIds: string[]
 sampleSize: number
 reviewDecision: ChannelKnowledgeLearningReviewDecision
 sourceEventIds?: string[]
}

export interface ChannelKnowledgeRecord {
 id: string
 channelId: string
 knowledgeClass: ChannelKnowledgeClass
 lifecycleState: ChannelKnowledgeLifecycleState
 statement: string
 confidence: BrainConfidenceLevel
 evidenceRefs: string[]
 source:
  | "brain_memory_claim"
  | "channel_knowledge_model"
  | "learning_candidate"
 sourceId: string
 scope: string
 createdAt: string
 updatedAt: string
 validFrom: string | null
 validTo: string | null
 confirmationState: BrainMemoryClaim["confirmationState"] | null
 supersedesId: string | null
 supersededById: string | null
 contradiction: boolean
 metadata: Record<string, unknown>
}

export interface ChannelKnowledgeProjection {
 version: "vt-channel-knowledge-projection-v1"
 channelId: string
 generatedAt: string
 records: ChannelKnowledgeRecord[]
}

export interface ChannelKnowledgeRetrieval {
 records: Array<ChannelKnowledgeRecord & { retrievalScore: number }>
 contradictions: Array<ChannelKnowledgeRecord & { retrievalScore: number }>
}

const claimClass = (claim: BrainMemoryClaim): ChannelKnowledgeClass => {
 if (claim.knowledgeClass === "VALIDATED_LEARNING") return "VALIDATED_LEARNING"
 switch (claim.category) {
  case "preference":
   return "CREATOR_PREFERENCE"
  case "creator_goal":
   return "CHANNEL_IDENTITY"
  case "content_style":
   return "CONTENT_PATTERN"
  case "analytics_insight":
   return "PERFORMANCE_PATTERN"
  case "tool_workflow":
  case "answer_quality":
   return "WORKFLOW_PREFERENCE"
  case "channel_fact":
   return "FACT"
  case "anti_pattern":
   return "CONTENT_PATTERN"
  default:
   return claim.scope === "analytics" ? "PERFORMANCE_PATTERN" : "HYPOTHESIS"
 }
}

const lifecycleForClaim = (
 claim: BrainMemoryClaim,
 nowMs: number,
): ChannelKnowledgeLifecycleState => {
 if (claim.status === "superseded") return "superseded"
 if (claim.status === "undone") return "undone"
 if (claim.validTo) {
  const validToMs = Date.parse(claim.validTo)
  if (Number.isFinite(validToMs) && validToMs <= nowMs) return "stale"
 }
 return "active"
}

const recordFromClaim = (
 claim: BrainMemoryClaim,
 channelId: string,
 nowMs: number,
): ChannelKnowledgeRecord | null => {
 if (claim.channelId && claim.channelId !== channelId) return null
 return {
  id: claim.id,
  channelId,
  knowledgeClass: claimClass(claim),
  lifecycleState: lifecycleForClaim(claim, nowMs),
  statement: claim.value,
  confidence: claim.confidence,
  evidenceRefs: [...claim.evidence],
  source: "brain_memory_claim",
  sourceId: claim.id,
  scope: claim.scope,
  createdAt: claim.createdAt,
  updatedAt: claim.updatedAt,
  validFrom: claim.validFrom,
  validTo: claim.validTo || null,
  confirmationState: claim.confirmationState,
  supersedesId: claim.supersedesClaimId || null,
  supersededById: claim.supersededByClaimId || null,
  contradiction: false,
  metadata: {
   category: claim.category,
   knowledgeClass: claim.knowledgeClass || null,
   learningEntryIds: [...claim.learningEntryIds],
  },
 }
}

const hypothesisGroups = (
 model: ChannelKnowledgeModel,
): Array<{ scope: string; rows: ChannelKnowledgeHypothesis[]; contradiction?: boolean }> => [
 { scope: "niche", rows: model.niche },
 { scope: "secondary_niche", rows: model.secondaryNiches || [] },
 { scope: "content_pillar", rows: model.contentPillars || [] },
 { scope: "topic_cluster", rows: model.topicClusters || [] },
 { scope: "search_language", rows: model.searchLanguage || [] },
 { scope: "content_format", rows: model.contentFormats },
 { scope: "audience", rows: model.audience },
 { scope: "visual_identity", rows: model.visualIdentity },
 { scope: "creator_communication", rows: model.creatorCommunication },
 { scope: "growth_opportunity", rows: model.growthOpportunities },
 { scope: "success_driver", rows: model.successDrivers || [] },
 { scope: "contradiction", rows: model.contradictions, contradiction: true },
]

const recordsFromModel = (
 model: ChannelKnowledgeModel | null,
 channelId: string,
): ChannelKnowledgeRecord[] => {
 if (!model || (model.channelId && model.channelId !== channelId)) return []
 return hypothesisGroups(model).flatMap(({ scope, rows, contradiction = false }) =>
  rows.map((row) => ({
   id: row.id,
   channelId,
   knowledgeClass: "HYPOTHESIS" as const,
   lifecycleState: "hypothesis" as const,
   statement: row.summary,
   confidence: row.confidence,
   evidenceRefs: [...row.evidenceIds],
   source: "channel_knowledge_model" as const,
   sourceId: model.id,
   scope,
   createdAt: model.createdAt,
   updatedAt: model.updatedAt,
   validFrom: model.createdAt,
   validTo: null,
   confirmationState: null,
   supersedesId: null,
   supersededById: null,
   contradiction,
   metadata: {
    label: row.label,
    sourceSnapshotId: model.sourceSnapshotId || null,
    evidenceFingerprint: model.evidenceFingerprint || null,
   },
  })),
 )
}

const recordFromLearningCandidate = (
 candidate: ChannelKnowledgeLearningInput,
 channelId: string,
 now: string,
): ChannelKnowledgeRecord | null => {
 if (candidate.channelId !== channelId) return null
 const rejected = candidate.reviewDecision === "reject"
 return {
  id: candidate.id,
  channelId,
  knowledgeClass: rejected ? "REJECTED_LEARNING" : "LEARNING_CANDIDATE",
  lifecycleState: rejected ? "rejected" : "candidate",
  statement: candidate.statement,
  confidence: candidate.confidence,
  evidenceRefs: [...candidate.evidenceIds],
  source: "learning_candidate",
  sourceId: candidate.id,
  scope: "learning",
  createdAt: now,
  updatedAt: now,
  validFrom: now,
  validTo: null,
  confirmationState: null,
  supersedesId: null,
  supersededById: null,
  contradiction: false,
  metadata: {
   sampleSize: candidate.sampleSize,
   reviewDecision: candidate.reviewDecision,
   sourceEventIds: [...(candidate.sourceEventIds || [])],
   // Governance approval permits profile review only. It is intentionally not
   // represented as VALIDATED_LEARNING until the canonical promotion path runs.
   validated: false,
  },
 }
}

export const buildChannelKnowledgeProjection = (input: {
 channelId: string
 claims: BrainMemoryClaim[]
 knowledgeModel: ChannelKnowledgeModel | null
 learningCandidates: ChannelKnowledgeLearningInput[]
 now?: string
}): ChannelKnowledgeProjection => {
 const now = input.now || new Date().toISOString()
 const parsedNow = Date.parse(now)
 const nowMs = Number.isFinite(parsedNow) ? parsedNow : Date.now()

 const claimRecords = input.claims.flatMap((item) => {
  const record = recordFromClaim(item, input.channelId, nowMs)
  return record ? [record] : []
 })
 const modelRecords = recordsFromModel(input.knowledgeModel, input.channelId)
 const learningRecords = input.learningCandidates.flatMap((item) => {
  const record = recordFromLearningCandidate(item, input.channelId, now)
  return record ? [record] : []
 })

 return {
  version: "vt-channel-knowledge-projection-v1",
  channelId: input.channelId,
  generatedAt: now,
  records: [...claimRecords, ...modelRecords, ...learningRecords],
 }
}

const tokenize = (value: string): Set<string> => new Set(
 value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .split(/\s+/)
  .filter((token) => token.length > 2),
)

const confidenceWeight = (confidence: BrainConfidenceLevel): number =>
 confidence === "high" ? 1 : confidence === "medium" ? 0.65 : 0.35

const stableKnowledge = (knowledgeClass: ChannelKnowledgeClass): boolean =>
 knowledgeClass === "CREATOR_PREFERENCE"
 || knowledgeClass === "CHANNEL_IDENTITY"
 || knowledgeClass === "WORKFLOW_PREFERENCE"
 || knowledgeClass === "FACT"

const freshnessWeight = (record: ChannelKnowledgeRecord, nowMs: number): number => {
 if (stableKnowledge(record.knowledgeClass)) return 1
 const updatedMs = Date.parse(record.updatedAt)
 if (!Number.isFinite(updatedMs)) return 0.5
 const ageDays = Math.max(0, (nowMs - updatedMs) / (24 * 60 * 60 * 1000))
 return Math.max(0.2, 1 - ageDays / 180)
}

const relevanceWeight = (query: Set<string>, statement: string): number => {
 if (!query.size) return 1
 const statementTokens = tokenize(statement)
 const hits = [...query].filter((token) => statementTokens.has(token)).length
 return hits / query.size
}

const retrievalScore = (
 record: ChannelKnowledgeRecord,
 query: Set<string>,
 nowMs: number,
): number =>
 relevanceWeight(query, record.statement) * 0.6
 + confidenceWeight(record.confidence) * 0.25
 + freshnessWeight(record, nowMs) * 0.15


type ScoredChannelKnowledgeRecord = ChannelKnowledgeRecord & { retrievalScore: number }

const normalizedStatementKey = (value: string): string =>
 value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ")

const confirmationAuthority = (
 state: ChannelKnowledgeRecord["confirmationState"],
): number => {
 if (state === "confirmed") return 4
 if (state === "explicit") return 3
 if (state === "inferred") return 2
 return 0
}

const sourceAuthority = (source: ChannelKnowledgeRecord["source"]): number => {
 if (source === "brain_memory_claim") return 3
 if (source === "learning_candidate") return 2
 return 1
}

const lifecycleAuthority = (state: ChannelKnowledgeLifecycleState): number => {
 if (state === "active") return 5
 if (state === "hypothesis") return 4
 if (state === "candidate") return 3
 if (state === "stale") return 2
 if (state === "superseded") return 1
 return 0
}

const confidenceAuthority = (confidence: BrainConfidenceLevel): number =>
 confidence === "high" ? 3 : confidence === "medium" ? 2 : 1

const preferredDuplicate = (
 left: ScoredChannelKnowledgeRecord,
 right: ScoredChannelKnowledgeRecord,
): ScoredChannelKnowledgeRecord => {
 const leftAuthority = [
  confirmationAuthority(left.confirmationState),
  sourceAuthority(left.source),
  lifecycleAuthority(left.lifecycleState),
  confidenceAuthority(left.confidence),
  left.retrievalScore,
  Date.parse(left.updatedAt) || 0,
 ]
 const rightAuthority = [
  confirmationAuthority(right.confirmationState),
  sourceAuthority(right.source),
  lifecycleAuthority(right.lifecycleState),
  confidenceAuthority(right.confidence),
  right.retrievalScore,
  Date.parse(right.updatedAt) || 0,
 ]
 for (let index = 0; index < leftAuthority.length; index += 1) {
  if (leftAuthority[index] !== rightAuthority[index]) {
   return leftAuthority[index] > rightAuthority[index] ? left : right
  }
 }
 return left.id.localeCompare(right.id) <= 0 ? left : right
}

const mergeDuplicateGroup = (
 records: ScoredChannelKnowledgeRecord[],
): ScoredChannelKnowledgeRecord => {
 const winner = records.reduce(preferredDuplicate)
 const ordered = [
  winner,
  ...records.filter((record) => record.id !== winner.id),
 ]
 const mergedRecordIds = [...new Set(ordered.map((record) => record.id))]
 const mergedSources = [...new Set(ordered.map((record) => record.source))]
 const evidenceRefs = [...new Set(ordered.flatMap((record) => record.evidenceRefs))]
 return {
  ...winner,
  evidenceRefs,
  retrievalScore: Math.max(...records.map((record) => record.retrievalScore)),
  metadata: {
   ...winner.metadata,
   mergedRecordIds,
   mergedSources,
  },
 }
}

const deduplicateKnowledgeRecords = (
 records: ScoredChannelKnowledgeRecord[],
): ScoredChannelKnowledgeRecord[] => {
 const groups = new Map<string, ScoredChannelKnowledgeRecord[]>()
 records.forEach((record) => {
  const key = normalizedStatementKey(record.statement) || `id:${record.id}`
  const rows = groups.get(key) || []
  rows.push(record)
  groups.set(key, rows)
 })
 return [...groups.values()]
  .map(mergeDuplicateGroup)
  .sort((left, right) => right.retrievalScore - left.retrievalScore)
}

export const retrieveChannelKnowledge = (
 projection: ChannelKnowledgeProjection,
 input: {
  query: string
  limit?: number
  includeCandidates?: boolean
  includeStale?: boolean
  now?: string
 },
): ChannelKnowledgeRetrieval => {
 const now = input.now || projection.generatedAt
 const parsedNow = Date.parse(now)
 const nowMs = Number.isFinite(parsedNow) ? parsedNow : Date.now()
 const query = tokenize(input.query)
 const allowedStates = new Set<ChannelKnowledgeLifecycleState>([
  "active",
  "hypothesis",
  ...(input.includeCandidates ? ["candidate" as const] : []),
  ...(input.includeStale ? ["stale" as const] : []),
 ])

 const scored = projection.records
  .filter((record) => allowedStates.has(record.lifecycleState))
  .map((record) => ({
   ...record,
   retrievalScore: retrievalScore(record, query, nowMs),
  }))
  .sort((left, right) => right.retrievalScore - left.retrievalScore)

 const records = deduplicateKnowledgeRecords(
  scored.filter((record) => !record.contradiction),
 )
 const contradictions = deduplicateKnowledgeRecords(
  scored.filter((record) => record.contradiction),
 )
 const limit = Math.max(1, input.limit || 12)
 return {
  records: records.slice(0, limit),
  contradictions: contradictions.slice(0, limit),
 }
}
