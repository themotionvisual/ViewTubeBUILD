import type {
 AIBrainAnswerModule,
 AIBrainConversationTurn,
 BrainAnswerEvaluation,
 BrainOrchestratorResult,
 BrainResponseCitation,
 CreatorBrainLearningQuestion,
 CreatorBrainResponse,
 CreatorGrowthContext,
 NicheKnowledgeProfile,
} from "../../types"
import {
 buildCreatorBrainLocalFallback,
 formatCreatorBrainResponse,
 type AIBrainContextSnapshot,
} from "../aiBrainCommandInterface"
import {
 beginAIBrainTurn,
 completeAIBrainTurn,
 formatCreatorGrowthModules,
 sanitizeCreatorFacingBrainCopy,
} from "../aiBrainConversationStore"
import { captureAIBrainLearningEvent } from "../aiBrainSelfImprovement"
import {
 generateStructuredBrainResponse,
 groundCurrentNicheResearch,
 type StructuredBrainModelOutput,
} from "../gemini"
import { buildBrainContextPack } from "./BrainContextBroker"
import {
 inferBrainIntent,
 selectBrainCapabilities,
 shouldUseCurrentGrounding,
} from "./BrainCapabilityRegistry"
import {
 cacheCurrentNicheResearch,
 readCachedCurrentNicheResearch,
 resolveNicheKnowledge,
} from "./NicheKnowledge"

const makeId = (prefix: string): string => {
 const random = typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`
 return `${prefix}_${random}`
}

const words = (value: string): Set<string> => new Set(
 value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 3),
)

const similarity = (left: string, right: string): number => {
 const a = words(left)
 const b = words(right)
 if (!a.size || !b.size) return 0
 const intersection = Array.from(a).filter((word) => b.has(word)).length
 return intersection / new Set([...a, ...b]).size
}

const responseText = (response: CreatorBrainResponse): string => [
 response.headline,
 response.keyInsight,
 response.body,
 ...(response.modules || []).flatMap((module) => [module.title, module.body]),
 ...response.actions,
].join(" ")

const unsupportedNumbers = (
 response: CreatorBrainResponse,
 snapshot: AIBrainContextSnapshot,
): string[] => {
 const known = JSON.stringify({
  channel: snapshot.channel,
  profile: snapshot.inferredProfile,
  evidence: snapshot.evidencePack,
 }).replace(/,/g, "")
 const matches = responseText(response).match(/\b\d[\d,]*(?:\.\d+)?%?(?![\w])/g) || []
 return Array.from(new Set(matches.filter((value) => {
  const normalized = value.replace(/,/g, "")
  if (["1", "2", "3", "4", "5", "7", "30", "60", "90"].includes(normalized)) return false
  return !known.includes(normalized)
 })))
}

export const validateBrainResponse = (input: {
 response: CreatorBrainResponse
 snapshot: AIBrainContextSnapshot
 recentTurns?: AIBrainConversationTurn[]
 growthContext?: CreatorGrowthContext | null
}): BrainAnswerEvaluation => {
 const text = responseText(input.response).toLowerCase()
 const evidenceTerms = [
  input.snapshot.inferredProfile.niche || "",
  ...input.snapshot.inferredProfile.contentPillars,
  ...input.snapshot.inferredProfile.topicClusters,
  ...input.snapshot.inferredProfile.topEvidenceVideos.slice(0, 4).map((video) => video.title),
 ].flatMap((value) => Array.from(words(value)))
 const specificityHits = evidenceTerms.filter((term) => text.includes(term)).length
 const creatorSpecificity = input.snapshot.inferredProfile.status === "missing"
  ? 60
  : Math.min(100, 35 + specificityHits * 15)
 const evidenceCoverage = input.snapshot.evidencePack.evidenceIds.length === 0
  ? 65
  : Math.min(100, 40 + specificityHits * 12)
 const goal = input.growthContext?.currentGoal || input.snapshot.brain.futureStateMap
 const goalTerms = Array.from(words(goal || ""))
 const goalAlignment = !goalTerms.length ? 65 : goalTerms.some((term) => text.includes(term)) ? 95 : 50
 const actionability = /\b(create|publish|rewrite|test|compare|open|draft|review|choose|make|schedule|measure|use|build)\b/.test(text)
  ? 90
  : 35
 const recent = (input.recentTurns || []).slice(0, 4)
 const similar = recent
  .map((turn) => ({ id: turn.id, score: similarity(text, turn.assistantText || turn.response?.keyInsight || "") }))
  .filter((item) => item.score >= 0.68)
 const novelty = Math.max(0, Math.round(100 - (similar[0]?.score || 0) * 100))
 const invented = unsupportedNumbers(input.response, input.snapshot)
 const average = (creatorSpecificity + evidenceCoverage + goalAlignment + actionability + novelty) / 5
 const repairReasons = [
  creatorSpecificity < 55 ? "Answer does not use available channel-specific evidence." : "",
  actionability < 55 ? "Answer lacks a concrete creator action." : "",
  novelty < 35 ? "Answer is too similar to a recent response." : "",
  invented.length ? "Answer contains numbers that are not present in the evidence pack." : "",
 ].filter(Boolean)
 return {
  id: makeId("brain_answer_evaluation"),
  createdAt: new Date().toISOString(),
  scores: { creatorSpecificity, evidenceCoverage, goalAlignment, actionability, novelty },
  passed: average >= 58 && repairReasons.length === 0,
  repairReasons,
  unsupportedNumbers: invented,
  similarTurnIds: similar.map((item) => item.id),
 }
}

const validTone = (value: string): AIBrainAnswerModule["tone"] =>
 (["green", "yellow", "pink", "blue", "orange", "white"] as const).includes(value as any)
  ? value as AIBrainAnswerModule["tone"]
  : "white"

const fromStructuredOutput = (
 output: StructuredBrainModelOutput,
 snapshot: AIBrainContextSnapshot,
): CreatorBrainResponse => {
 const allowedModes: CreatorBrainResponse["mode"][] = [
  "strategy_brief", "analytics_diagnosis", "seo_keyword_plan", "video_idea_sprint",
  "journal_reflection", "goal_coach", "publishing_checklist", "revenue_levers",
 ]
 const mode = allowedModes.includes(output.mode) ? output.mode : "strategy_brief"
 const question: CreatorBrainLearningQuestion[] = output.question?.trim() ? [{
  id: makeId("brain_question"),
  question: sanitizeCreatorFacingBrainCopy(output.question),
  reason: "Your answer will help the Brain rank the next recommendation.",
  category: "creator_goal",
  confidence: "medium",
 }] : []
 const modules: AIBrainAnswerModule[] = (output.modules || []).slice(0, 4).map((module, index) => ({
  id: `brain_module_${index}_${makeId("item")}`,
  title: sanitizeCreatorFacingBrainCopy(module.title),
  body: sanitizeCreatorFacingBrainCopy(module.body).slice(0, 360),
  tone: validTone(module.tone),
  kind: module.kind as AIBrainAnswerModule["kind"],
  source: inferBrainIntent(output.body) === "analytics" ? "analytics" : "growth",
 }))
 return {
  id: makeId("creator_brain_response"),
  mode,
  body: sanitizeCreatorFacingBrainCopy(output.body).slice(0, 1200),
  evidenceIds: snapshot.evidencePack.evidenceIds.slice(0, 10),
  headline: sanitizeCreatorFacingBrainCopy(output.headline),
  keyInsight: sanitizeCreatorFacingBrainCopy(output.keyInsight),
  evidenceChips: [],
  modules,
  actions: (output.actions || []).map(sanitizeCreatorFacingBrainCopy).slice(0, 4),
  learningSummary: "",
  questions: question.slice(0, 1),
  confidence: snapshot.inferredProfile.status === "ready" ? "high" : "medium",
 }
}

const buildFallback = (
 userText: string,
 snapshot: AIBrainContextSnapshot,
 growthContext: CreatorGrowthContext,
): CreatorBrainResponse => {
 const text = buildCreatorBrainLocalFallback(userText, snapshot)
 const response = formatCreatorBrainResponse(text, snapshot, { requestText: userText })
 return { ...response, modules: formatCreatorGrowthModules(response, growthContext) }
}

const withTimeout = async <T>(promise: Promise<T>, milliseconds: number): Promise<T> =>
 Promise.race([
  promise,
  new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Brain response timed out")), milliseconds)),
 ])

export interface RunBrainTurnInput {
 channelId?: string | null
 userText: string
 snapshot: AIBrainContextSnapshot
 systemPrompt: string
 growthContext: CreatorGrowthContext
 recentTurns?: AIBrainConversationTurn[]
 history?: any[]
 allowModel?: boolean
 modelGenerator?: typeof generateStructuredBrainResponse
 nicheResolver?: typeof resolveNicheKnowledge
 currentResearcher?: typeof groundCurrentNicheResearch
}

export const runBrainTurn = async (input: RunBrainTurnInput): Promise<BrainOrchestratorResult> => {
 const pending = await beginAIBrainTurn({
  channelId: input.channelId,
  userText: input.userText,
  metadata: { source: "brain_orchestrator", promptVersion: "brain-orchestrator-v1" },
 })
 const capabilities = selectBrainCapabilities({ userText: input.userText, snapshot: input.snapshot })
 let nicheKnowledge: NicheKnowledgeProfile | null = null
 let currentResearch = ""
 let citations: BrainResponseCitation[] = []
 try {
  if (capabilities.some((capability) => capability.id === "niche-knowledge")) {
   nicheKnowledge = await (input.nicheResolver || resolveNicheKnowledge)({
    channelId: input.channelId,
    niche: input.snapshot.inferredProfile.niche,
    topicClusters: input.snapshot.inferredProfile.topicClusters,
    contentPillars: input.snapshot.inferredProfile.contentPillars,
    evidenceFingerprint: input.snapshot.inferredProfile.evidenceFingerprint || `videos:${input.snapshot.inferredProfile.videoCount}`,
   })
   citations.push(...nicheKnowledge.sources.filter((source) => source.source === "wikipedia").slice(0, 3).map((source) => ({
    id: source.id,
    title: source.title,
    url: source.url,
    source: "wikipedia" as const,
    accessedAt: source.accessedAt,
   })))
  }
  if (input.allowModel && nicheKnowledge?.canonicalNiche && shouldUseCurrentGrounding(input.userText)) {
   const grounded = readCachedCurrentNicheResearch(nicheKnowledge) || await (input.currentResearcher || groundCurrentNicheResearch)({
     canonicalNiche: nicheKnowledge.canonicalNiche,
     publicQuestion: input.userText,
    })
   currentResearch = grounded.text
   citations.push(...grounded.citations)
   if (!readCachedCurrentNicheResearch(nicheKnowledge) && grounded.citations.length) {
    nicheKnowledge = await cacheCurrentNicheResearch({ profile: nicheKnowledge, text: grounded.text, citations: grounded.citations })
   }
  }
  const context = buildBrainContextPack({
   systemPrompt: input.systemPrompt,
   snapshot: input.snapshot,
   recentTurns: input.recentTurns || [],
   nicheKnowledge,
   currentResearch,
   userText: input.userText,
  })

  let response = buildFallback(input.userText, input.snapshot, input.growthContext)
  let repaired = false
  let status: "complete" | "fallback" = "fallback"
  if (input.allowModel) {
   const output = await withTimeout((input.modelGenerator || generateStructuredBrainResponse)({
    history: (input.history || []).slice(-8),
    userText: input.userText,
    systemInstruction: context.systemInstruction,
   }), 30_000)
   response = fromStructuredOutput(output, input.snapshot)
   response = { ...response, modules: formatCreatorGrowthModules(response, input.growthContext) }
   status = "complete"
  }

  let evaluation = validateBrainResponse({
   response,
   snapshot: input.snapshot,
   recentTurns: input.recentTurns,
   growthContext: input.growthContext,
  })
  if (!evaluation.passed && status === "complete") {
   response = buildFallback(input.userText, input.snapshot, input.growthContext)
   evaluation = validateBrainResponse({ response, snapshot: input.snapshot, recentTurns: input.recentTurns, growthContext: input.growthContext })
   repaired = true
   status = "fallback"
  }
  const learning = await captureAIBrainLearningEvent({
   channelId: input.channelId || null,
   source: "copilot",
   summary: `Copilot conversation: ${input.userText}`,
   detail: response.keyInsight,
   category: "answer_quality",
   confidence: evaluation.passed ? "high" : "medium",
   evidence: response.modules?.map((module) => module.title) || [],
   metadata: { evaluationId: evaluation.id, capabilities: capabilities.map((capability) => capability.id) },
  })
  const turn = await completeAIBrainTurn({
   turnId: pending.id,
   status,
   assistantText: response.body || response.keyInsight,
   response,
   answerModules: response.modules,
   citations,
   evaluation,
   learningEntryIds: [learning.id],
   metadata: { capabilities: capabilities.map((capability) => capability.id), repaired },
  })
  return {
   turn,
   response,
   modules: response.modules || [],
   capabilities: capabilities.map((capability) => capability.id),
   contextBudget: context.budget,
   repaired,
  }
 } catch (error) {
  const response = buildFallback(input.userText, input.snapshot, input.growthContext)
  const evaluation = validateBrainResponse({ response, snapshot: input.snapshot, recentTurns: input.recentTurns, growthContext: input.growthContext })
  const turn = await completeAIBrainTurn({
   turnId: pending.id,
   status: "fallback",
   assistantText: response.body || response.keyInsight,
   response,
   answerModules: response.modules,
   evaluation,
   metadata: { orchestrationError: error instanceof Error ? error.message : String(error) },
  })
  const context = buildBrainContextPack({
   systemPrompt: input.systemPrompt,
   snapshot: input.snapshot,
   recentTurns: input.recentTurns || [],
   userText: input.userText,
  })
  return {
   turn,
   response,
   modules: response.modules || [],
   capabilities: capabilities.map((capability) => capability.id),
   contextBudget: context.budget,
   repaired: true,
  }
 }
}
