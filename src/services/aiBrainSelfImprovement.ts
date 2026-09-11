import type {
 AIBrainConversationDigest,
 AIBrainFeedbackSignal,
 AIBrainLearningCategory,
 AIBrainLearningEntry,
 AIBrainPromotionCandidate,
 AIBrainReflectionTrace,
 AIBrainReflectionStep,
 AIBrainSkillResource,
 BrainConfidenceLevel,
 CreatorBrainResponse,
} from "../types"
import {
 getAIBrainLearningEntryDB,
 listAIBrainLearningEntriesDB,
 saveAIBrainLearningEntryDB,
} from "./brain/Persistence"
import {
 promoteBrainClaim,
 rebuildAffectedToolContextPacks,
 undoBrainMemoryClaim,
} from "./brain/BrainMemoryClaims"
import { resolveBrainTaskProfile } from "./brain/BrainTaskProfileRegistry"
import {
 readBrainUserControls,
 shouldBrainLearnFromInteraction,
} from "./brain/BrainUserControls"

const nowIso = () => new Date().toISOString()

const makeId = (prefix: string): string => {
 const random =
  typeof crypto !== "undefined" && "randomUUID" in crypto
   ? crypto.randomUUID()
   : `${Date.now()}-${Math.random().toString(36).slice(2)}`
 return `${prefix}_${random}`
}

const normalizeText = (value: unknown): string =>
 String(value || "").replace(/\s+/g, " ").trim()

const confidenceRank: Record<BrainConfidenceLevel, number> = {
 low: 1,
 medium: 2,
 high: 3,
}

const isHighEnoughForPromotion = (entry: AIBrainLearningEntry): boolean =>
 entry.confidence === "high" || entry.recurrenceCount >= 3

const creatorInitiatedLearning = (metadata?: Record<string, unknown>): boolean =>
 metadata?.creatorInitiated === true || metadata?.confirmed === true

const blockedLearningEntry = (input: {
 channelId?: string | null
 source: AIBrainLearningEntry["source"]
 summary: string
 detail?: string
 category?: AIBrainLearningCategory
 confidence?: BrainConfidenceLevel
 evidence?: string[]
 metadata?: Record<string, unknown>
}): AIBrainLearningEntry => {
 const createdAt = nowIso()
 const category = input.category || classifyAIBrainLearningEvent({
  text: `${input.summary} ${input.detail || ""}`,
  source: input.source,
  metadata: input.metadata,
 })
 return {
  id: makeId("learning_blocked"),
  channelId: input.channelId || null,
  category,
  source: input.source,
  summary: normalizeText(input.summary) || "Brain learning disabled",
  detail: normalizeText(input.detail || input.summary),
  evidence: (input.evidence || []).map(normalizeText).filter(Boolean),
  confidence: input.confidence || "low",
  status: "dismissed",
  createdAt,
  updatedAt: createdAt,
  recurrenceCount: 1,
  relatedEntryIds: [],
  metadata: {
   ...(input.metadata || {}),
   blockedByUserControls: true,
  },
 }
}

export const listAIBrainSkillResources = (): AIBrainSkillResource[] => [
 {
  id: "self-improvement-ledger",
  title: "Learning Ledger",
  sourceSkill: "self-improvement",
  summary: "Capture corrections, knowledge gaps, feature requests, and recurring patterns as durable learning entries.",
  runtimeRules: [
   "Capture user corrections immediately as learning entries.",
   "Classify sync failures as observations, not facts.",
   "Promote only repeated or high-confidence learnings into durable memory.",
   "Keep feature requests separate from confirmed channel facts.",
   "Honor the creator's Brain personalization and learning controls before storing anything durable.",
  ],
  docPath: "docs/VT Brain/AI_BRAIN_SELF_IMPROVEMENT_WORKFLOWS.md",
  status: "active",
 },
 {
  id: "post-conversation-reflection",
  title: "Post-Conversation Reflection",
  sourceSkill: "self-improving-agent",
  summary: "After meaningful work, decide whether the Brain learned a durable preference, workflow, correction, or channel fact.",
  runtimeRules: [
   "Do not create artifacts for every interaction.",
   "Promote repeated workflows into reusable guidance.",
   "Keep improvements specific to this creator and this channel.",
   "Prefer short prevention rules over long incident writeups.",
  ],
  docPath: "docs/VT Brain/AI_BRAIN_SKILL_RESOURCE_REGISTRY.md",
  status: "active",
 },
 {
  id: "reflecting-chain",
  title: "Self-Reflecting Chain",
  sourceSkill: "self-reflecting-chain",
  summary: "Reason over learning events with observation, evidence, hypothesis, contradiction check, confidence, and next action.",
  runtimeRules: [
   "Every promoted learning needs evidence and a confidence label.",
   "When confidence is low, ask a targeted creator question instead of guessing.",
   "Backtrack when a new learning contradicts existing Brain memory.",
   "Overall confidence is limited by the weakest reflection step.",
  ],
  docPath: "docs/VT Brain/AI_BRAIN_REFLECTING_CHAIN_REFERENCE.md",
  status: "active",
 },
]

export const classifyAIBrainLearningEvent = (input: {
 text?: string
 feedback?: AIBrainFeedbackSignal["rating"]
 source?: AIBrainLearningEntry["source"]
 metadata?: Record<string, unknown>
}): AIBrainLearningCategory => {
 const text = normalizeText(input.text).toLowerCase()

 if (input.feedback === "inaccurate" || /\b(wrong|incorrect|not true|actually|correction)\b/.test(text)) {
  return "correction"
 }
 if (input.feedback === "not_useful" || /\b(not useful|bad answer|unhelpful|generic)\b/.test(text)) {
  return "answer_quality"
 }
 if (input.feedback === "save_insight") return "preference"
 if (input.source === "vt_sync" || /\b(sync|manifest|failed bundle|freshness|missing analytics)\b/.test(text)) {
  return "sync_observation"
 }
 if (input.source === "daily_oracle" || /\b(oracle|quick win|priority|completed action)\b/.test(text)) {
  return "tool_workflow"
 }
 if (/\b(goal|target|milestone|subscriber|revenue|watch time)\b/.test(text)) return "creator_goal"
 if (/\b(style|tone|format|editing|thumbnail|hook|voice|pacing)\b/.test(text)) return "content_style"
 if (/\b(audience|viewer|comments|community|retention)\b/.test(text)) return "audience_insight"
 if (/\b(views|ctr|rpm|impressions|analytics|traffic|search terms)\b/.test(text)) return "analytics_insight"
 if (/\b(feature|can you add|i wish|should support)\b/.test(text)) return "feature_request"
 if (/\b(never|avoid|do not|don't recommend|anti-pattern)\b/.test(text)) return "anti_pattern"
 if (/\b(channel is|my niche|my channel|fact)\b/.test(text)) return "channel_fact"

 return "preference"
}

export const buildAIBrainReflectionTrace = (
 entry: AIBrainLearningEntry,
): AIBrainReflectionTrace => {
 const hasEvidence = entry.evidence.length > 0
 const isCorrection = entry.category === "correction" || entry.category === "answer_quality"
 const weakConfidence = entry.confidence === "low"
 const evidenceConfidence: BrainConfidenceLevel = hasEvidence ? entry.confidence : "low"
 const contradictionDecision = isCorrection ? "hold" : weakConfidence ? "ask_user" : "proceed"
 const finalDecision = isHighEnoughForPromotion(entry) && !isCorrection ? "promote" : "hold"
 const steps: AIBrainReflectionStep[] = [
  {
   id: "observation",
   label: "Observation",
   result: entry.summary,
   confidence: entry.confidence,
   assumptions: ["The event was captured from a meaningful creator interaction."],
   potentialErrors: ["The text may describe a one-off preference instead of a durable pattern."],
   decision: "proceed" as const,
  },
  {
   id: "evidence",
   label: "Evidence",
   result: hasEvidence ? entry.evidence.join(" | ") : "No direct evidence attached yet.",
   confidence: evidenceConfidence,
   assumptions: hasEvidence ? ["Attached evidence is relevant to the learning."] : ["Missing evidence lowers confidence."],
   potentialErrors: hasEvidence ? ["Evidence may be stale or partial."] : ["The Brain could overfit to unsupported text."],
   decision: hasEvidence ? "proceed" as const : "ask_user" as const,
  },
  {
   id: "hypothesis",
   label: "Hypothesis",
   result: `This may improve future ${entry.category.replace(/_/g, " ")} guidance for the creator.`,
   confidence: entry.confidence,
   assumptions: ["The learning should affect recommendations only after confidence is checked."],
   potentialErrors: ["The learning may conflict with a stronger existing Brain memory."],
   decision: weakConfidence ? "ask_user" as const : "proceed" as const,
  },
  {
   id: "contradiction_check",
   label: "Contradiction Check",
   result: isCorrection
    ? "Treat as corrective feedback; do not overwrite durable memory until confirmed."
    : "No automatic contradiction was detected by the lightweight reflector.",
   confidence: isCorrection ? "medium" as const : entry.confidence,
   assumptions: ["Full semantic contradiction checks happen in the deeper reflection pass."],
   potentialErrors: ["A subtle conflict may require user confirmation."],
   decision: contradictionDecision,
  },
  {
   id: "next_action",
   label: "Next Action",
   result: finalDecision === "promote"
    ? "Promote this learning into Brain context."
    : "Hold as learning evidence and use it to ask better questions.",
   confidence: finalDecision === "promote" ? entry.confidence : "medium",
   assumptions: ["Promotion must stay inside Brain OS and cannot execute tool mutations."],
   potentialErrors: ["Promotion could make future answers too narrow if the pattern is not recurring."],
   decision: finalDecision,
  },
 ]

 const weakest = steps.reduce((lowest, step) =>
  confidenceRank[step.confidence] < confidenceRank[lowest.confidence] ? step : lowest,
 )

 return {
  id: makeId("reflection"),
  learningEntryId: entry.id,
  createdAt: nowIso(),
  overallConfidence: weakest.confidence,
  weakestStep: weakest.id,
  steps,
  backtracks: isCorrection ? ["Correction captured; durable memory promotion blocked until confirmed."] : [],
  finalConclusion: finalDecision === "promote"
   ? "This learning is eligible for Brain context promotion."
   : "This learning should inform future questions and answer quality, but should not overwrite durable memory yet.",
 }
}

export const captureAIBrainLearningEvent = async (input: {
 channelId?: string | null
 source: AIBrainLearningEntry["source"]
 summary: string
 detail?: string
 category?: AIBrainLearningCategory
 confidence?: BrainConfidenceLevel
 evidence?: string[]
 metadata?: Record<string, unknown>
}): Promise<AIBrainLearningEntry> => {
 const controls = readBrainUserControls(input.channelId)
 const explicitCreatorAction = creatorInitiatedLearning(input.metadata)
 if (!controls.enabled || !controls.personalization || (!controls.learnFromInteractions && !explicitCreatorAction)) {
  return blockedLearningEntry(input)
 }

 const createdAt = nowIso()
 const category = input.category || classifyAIBrainLearningEvent({
  text: `${input.summary} ${input.detail || ""}`,
  source: input.source,
  metadata: input.metadata,
 })
 const summary = normalizeText(input.summary) || "Untitled Brain learning"
 const detail = normalizeText(input.detail || input.summary)
 const existing = (await listAIBrainLearningEntriesDB(input.channelId || null)).find((entry) =>
  entry.category === category
  && entry.status !== "dismissed"
  && (entry.summary.toLowerCase() === summary.toLowerCase() || entry.detail.toLowerCase() === detail.toLowerCase()))
 const strongerConfidence = existing && confidenceRank[existing.confidence] > confidenceRank[input.confidence || "medium"]
  ? existing.confidence
  : input.confidence || "medium"
 const entry: AIBrainLearningEntry = {
  ...(existing || {}),
  id: makeId("learning"),
  channelId: input.channelId || null,
  category,
  source: input.source,
  summary,
  detail,
  evidence: Array.from(new Set([...(existing?.evidence || []), ...(input.evidence || []).map(normalizeText).filter(Boolean)])),
  confidence: strongerConfidence,
  status: "captured",
  createdAt: existing?.createdAt || createdAt,
  updatedAt: createdAt,
  recurrenceCount: (existing?.recurrenceCount || 0) + 1,
  relatedEntryIds: existing?.relatedEntryIds || [],
  metadata: { ...(existing?.metadata || {}), ...(input.metadata || {}) },
 }
 if (existing) entry.id = existing.id
 entry.reflectionTrace = buildAIBrainReflectionTrace(entry)
 entry.status = "reflected"
 await saveAIBrainLearningEntryDB(entry)
 return entry
}

export const listAIBrainLearningEntries = async (input: {
 channelId?: string | null
 limit?: number
} = {}): Promise<AIBrainLearningEntry[]> => {
 const entries = await listAIBrainLearningEntriesDB(input.channelId)
 return typeof input.limit === "number" ? entries.slice(0, input.limit) : entries
}

export const promoteAIBrainLearning = async (
 entryOrId: AIBrainLearningEntry | string,
): Promise<AIBrainPromotionCandidate> => {
 const entry =
  typeof entryOrId === "string" ? await getAIBrainLearningEntryDB(entryOrId) : entryOrId
 if (!entry) {
  return {
   entryId: String(entryOrId),
   target: "brain_memory",
   reason: "Learning entry was not found.",
   allowed: false,
   confidence: "low",
   blockedBy: ["missing_entry"],
  }
 }

 const controls = readBrainUserControls(entry.channelId)
 const explicitCreatorAction = creatorInitiatedLearning(entry.metadata)
 if (!controls.enabled || !controls.personalization || (!controls.learnFromInteractions && !explicitCreatorAction)) {
  return {
   entryId: entry.id,
   target: "brain_memory",
   reason: "Creator User Controls currently block durable Brain learning.",
   allowed: false,
   confidence: entry.confidence,
   blockedBy: ["user_controls_block_learning"],
  }
 }

 const promotedClaim = await promoteBrainClaim(entry)
 const blockedBy: string[] = promotedClaim.claim ? [] : [
  promotedClaim.decision.decision === "ask_user" ? "confidence_below_promotion_threshold" : "feedback_requires_confirmation",
 ]
 if (entry.category === "sync_observation") blockedBy.splice(0, blockedBy.length, "sync_observation_is_not_channel_fact")

 const candidate: AIBrainPromotionCandidate = {
  entryId: entry.id,
  target: "brain_memory",
  reason: blockedBy.length
   ? "Learning is retained as evidence until confidence improves."
   : "Learning is high-confidence or recurring and can update Brain context.",
  allowed: Boolean(promotedClaim.claim),
  confidence: entry.confidence,
  blockedBy,
 }

 if (!candidate.allowed) return candidate

 await rebuildAffectedToolContextPacks({
  channelId: entry.channelId,
  affectedContextPacks: promotedClaim.decision.affectedContextPacks,
 })

 const promoted: AIBrainLearningEntry = {
  ...entry,
  status: "promoted",
  promotionTarget: "brain_memory",
  updatedAt: nowIso(),
 }
 await saveAIBrainLearningEntryDB(promoted)
 return candidate
}

/** Explicit creator teaching can be promoted even when passive learning is off. */
export const teachAIBrainExplicitly = async (input: {
 channelId?: string | null
 summary: string
 detail?: string
 category?: AIBrainLearningCategory
 evidence?: string[]
}) => {
 const controls = readBrainUserControls(input.channelId)
 if (!controls.enabled || !controls.personalization) {
  throw new Error("Enable Brain personalization before teaching a durable channel rule.")
 }
 const entry = await captureAIBrainLearningEvent({
  channelId: input.channelId || null,
  source: "journal",
  summary: input.summary,
  detail: input.detail,
  category: input.category,
  confidence: "high",
  evidence: input.evidence,
  metadata: { confirmed: true, creatorInitiated: true },
 })
 const promotion = await promoteAIBrainLearning(entry)
 return { entry, promotion }
}

export const saveAIBrainChannelRule = (input: {
 channelId?: string | null
 rule: string
 evidence?: string[]
}) => teachAIBrainExplicitly({
 channelId: input.channelId,
 summary: input.rule,
 detail: input.rule,
 category: /never|avoid|do not|don't/i.test(input.rule) ? "anti_pattern" : "preference",
 evidence: input.evidence,
})

/** Prevent one captured learning from being promoted in the future. */
export const dismissAIBrainLearning = async (
 entryId: string,
): Promise<AIBrainLearningEntry | null> => {
 const entry = await getAIBrainLearningEntryDB(entryId)
 if (!entry) return null
 const dismissed: AIBrainLearningEntry = {
  ...entry,
  status: "dismissed",
  updatedAt: nowIso(),
  metadata: { ...(entry.metadata || {}), dismissedByCreator: true },
 }
 await saveAIBrainLearningEntryDB(dismissed)
 return dismissed
}

/** Undo a durable promoted memory claim from the existing Learning Ledger. */
export const forgetAIBrainClaim = (claimId: string) => undoBrainMemoryClaim(claimId)

export const buildAIBrainSelfImprovementPrompt = (
 entries: AIBrainLearningEntry[],
): string => {
 const resources = listAIBrainSkillResources()
 return [
  "You are the ViewTube Brain self-improvement layer.",
  "Improve creator personalization by reflecting on learning entries. Do not execute tool mutations.",
  "Use these runtime rules:",
  ...resources.flatMap((resource) => resource.runtimeRules.map((rule) => `- ${rule}`)),
  "",
  "Recent learning entries:",
  JSON.stringify(entries.slice(0, 12), null, 2),
 ].join("\n")
}

export const buildConversationAnalyticDigest = (input: {
 channelId?: string | null
 userText: string
 response?: CreatorBrainResponse | string
 learningEntryIds?: string[]
}): AIBrainConversationDigest => {
 const responseText = typeof input.response === "string"
  ? input.response
  : input.response?.keyInsight || input.response?.headline || ""
 const mode: AIBrainConversationDigest["answerMode"] = typeof input.response === "object" && input.response?.mode
  ? input.response.mode
  : resolveBrainTaskProfile(`${input.userText} ${responseText}`).answerMode

 return {
  id: makeId("conversation_digest"),
  channelId: input.channelId || null,
  createdAt: nowIso(),
  userIntent: normalizeText(input.userText),
  answerMode: mode,
  keyFacts: responseText ? [normalizeText(responseText).slice(0, 240)] : [],
  unresolvedQuestions: [],
  learningEntryIds: input.learningEntryIds || [],
 }
}

export const scoreAIBrainAnswerUsefulness = (input: {
 response: CreatorBrainResponse | string
 feedback?: AIBrainFeedbackSignal["rating"]
}): number => {
 if (input.feedback === "helpful" || input.feedback === "save_insight") return 92
 if (input.feedback === "ask_follow_up") return 74
 if (input.feedback === "not_useful") return 38
 if (input.feedback === "inaccurate") return 18
 const text = typeof input.response === "string"
  ? input.response
  : `${input.response.headline} ${input.response.keyInsight} ${input.response.actions.join(" ")}`
 let score = 50
 if (text.length > 120) score += 10
 if (/\b(because|evidence|views|goal|next)\b/i.test(text)) score += 12
 if (/\?/.test(text)) score += 8
 if (/\*\*|`/.test(text)) score -= 15
 return Math.max(0, Math.min(100, score))
}
