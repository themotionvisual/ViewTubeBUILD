import type {
 AIBrainAnswerModule,
 AIBrainConversationTurn,
 BrainAnswerEvaluation,
 BrainFallbackReason,
 BrainGenerationPath,
 BrainOrchestratorResult,
 BrainRepairOutcome,
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
import { resolveBrainTaskProfile } from "./BrainTaskProfileRegistry"
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
 ...(response.modules || []).flatMap((module) => [
  module.title,
  module.body,
  // Scan the model's claimed figures (metrics/trend points) so invented numbers are
  // caught. Ranked-item details are derived from the evidence pack and already
  // reformatted (e.g. "480K"), so scanning them would false-positive on grounded data.
  ...(module.data?.metrics || []).flatMap((metric) => [metric.displayValue || "", metric.value != null ? String(metric.value) : ""]),
  ...(module.data?.points || []).map((point) => (point.value != null ? String(point.value) : "")),
 ]),
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
 expectedMode?: CreatorBrainResponse["mode"]
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
 const modeMatches = !input.expectedMode || input.response.mode === input.expectedMode
 const answerContent = [
  input.response.keyInsight,
  input.response.body,
  ...(input.response.modules || []).flatMap((module) => [module.title, module.body]),
  ...input.response.actions,
 ].join(" ").toLowerCase()
 const audienceTaskAnswered = input.expectedMode !== "audience_insight" || (
  /\b(audience|viewers?|subscribers?)\b/.test(answerContent)
  && /\b(care|value|interest|want|choose|watch|return|request|payoff)\w*\b/.test(answerContent)
  && /\b(language|words?|phrases?|wording|search terms?|titles?|hooks?)\b/.test(answerContent)
  && /\b(direct|infer\w*|evidence|comments?|transcripts?|search behavior|missing|available)\b/.test(answerContent)
 )
 const average = (creatorSpecificity + evidenceCoverage + goalAlignment + actionability + novelty) / 5
 const repairReasons = [
  creatorSpecificity < 55 ? "Answer does not use available channel-specific evidence." : "",
  actionability < 55 ? "Answer lacks a concrete creator action." : "",
  novelty < 35 ? "Answer is too similar to a recent response." : "",
  invented.length ? "Answer contains numbers that are not present in the evidence pack." : "",
  !modeMatches ? `Answer mode ${input.response.mode} does not match the requested ${input.expectedMode} task.` : "",
  !audienceTaskAnswered ? "Answer the audience-language task with an audience finding, concrete language guidance, and an evidence boundary." : "",
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

const numOrNull = (value: unknown): number | null =>
 typeof value === "number" && Number.isFinite(value) ? value : null

/**
 * Keep only well-formed, string-sanitized structured data from the model. Numbers
 * pass through as numbers; the unsupported-number guard (see responseText) then
 * rejects any figure not present in the evidence pack, so invented metrics fail
 * validation and trigger repair rather than reaching the creator.
 */
const sanitizeModuleData = (
 data: StructuredBrainModelOutput["modules"][number]["data"],
): AIBrainAnswerModule["data"] | undefined => {
 if (!data || typeof data !== "object") return undefined
 const metrics = (data.metrics || [])
  .slice(0, 3)
  .map((metric) => ({
   label: sanitizeCreatorFacingBrainCopy(metric.label || ""),
   value: numOrNull(metric.value),
   displayValue: metric.displayValue ? sanitizeCreatorFacingBrainCopy(metric.displayValue) : undefined,
   change: numOrNull(metric.change),
  }))
  .filter((metric) => metric.label)
 const points = (data.points || [])
  .slice(0, 24)
  .map((point) => ({ label: sanitizeCreatorFacingBrainCopy(point.label || ""), value: numOrNull(point.value) }))
  .filter((point) => point.label)
 const items = (data.items || [])
  .slice(0, 5)
  .map((item) => ({
   title: sanitizeCreatorFacingBrainCopy(item.title || ""),
   detail: item.detail ? sanitizeCreatorFacingBrainCopy(item.detail) : undefined,
   score: numOrNull(item.score),
   status: item.status ? sanitizeCreatorFacingBrainCopy(item.status) : undefined,
  }))
  .filter((item) => item.title)
 if (!metrics.length && !points.length && !items.length) return undefined
 return {
  ...(metrics.length ? { metrics } : {}),
  ...(points.length ? { points } : {}),
  ...(items.length ? { items } : {}),
 }
}

export const fromStructuredOutput = (
 output: StructuredBrainModelOutput,
 snapshot: AIBrainContextSnapshot,
): CreatorBrainResponse => {
 const allowedModes: CreatorBrainResponse["mode"][] = [
  "strategy_brief", "analytics_diagnosis", "seo_keyword_plan", "video_idea_sprint",
  "journal_reflection", "goal_coach", "publishing_checklist", "revenue_levers", "creator_asset_draft", "audience_insight",
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
  data: sanitizeModuleData(module.data),
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

export const BRAIN_MODEL_TIMEOUT_MS = 30_000
export const BRAIN_REPAIR_TIMEOUT_MS = 20_000
export const BRAIN_PROMPT_VERSION = "brain-orchestrator-v2"

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
 const taskProfile = resolveBrainTaskProfile(input.userText)
 const pending = await beginAIBrainTurn({
  channelId: input.channelId,
  userText: input.userText,
  metadata: { source: "brain_orchestrator", promptVersion: BRAIN_PROMPT_VERSION, taskProfileId: taskProfile.id },
 })
 const capabilities = selectBrainCapabilities({ userText: input.userText, snapshot: input.snapshot })
 const capabilityIds = capabilities.map((capability) => capability.id)
 let nicheKnowledge: NicheKnowledgeProfile | null = null
 let currentResearch = ""
 let citations: BrainResponseCitation[] = []
 let context = buildBrainContextPack({
  systemPrompt: input.systemPrompt,
  snapshot: input.snapshot,
  recentTurns: input.recentTurns || [],
  userText: input.userText,
 })
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
  context = buildBrainContextPack({
   systemPrompt: input.systemPrompt,
   snapshot: input.snapshot,
   recentTurns: input.recentTurns || [],
   nicheKnowledge,
   currentResearch,
   userText: input.userText,
  })

  let response = buildFallback(input.userText, input.snapshot, input.growthContext)
  let status: "complete" | "fallback" = "fallback"
  let generationPath: BrainGenerationPath = "basic_guidance"
  let fallbackReason: BrainFallbackReason | undefined = input.allowModel ? undefined : "model_disabled"
  let repairOutcome: BrainRepairOutcome = { attempted: false, succeeded: false, reasons: [] }
  if (input.allowModel) {
   const output = await withTimeout((input.modelGenerator || generateStructuredBrainResponse)({
    history: (input.history || []).slice(-8),
    userText: input.userText,
    systemInstruction: context.systemInstruction,
   }), BRAIN_MODEL_TIMEOUT_MS)
   response = fromStructuredOutput(output, input.snapshot)
   response = { ...response, modules: formatCreatorGrowthModules(response, input.growthContext) }
   status = "complete"
   generationPath = "model"
  }

  let evaluation = validateBrainResponse({
   response,
   snapshot: input.snapshot,
   recentTurns: input.recentTurns,
   growthContext: input.growthContext,
   expectedMode: taskProfile.answerMode,
  })
  if (!evaluation.passed && status === "complete") {
   const initialRepairReasons = [...evaluation.repairReasons]
   repairOutcome = { attempted: true, succeeded: false, reasons: initialRepairReasons, evaluationId: evaluation.id }
   try {
    const repairedOutput = await withTimeout((input.modelGenerator || generateStructuredBrainResponse)({
     history: (input.history || []).slice(-8),
     userText: input.userText,
     systemInstruction: [
      context.systemInstruction,
      "",
      "REPAIR THE PREVIOUS DRAFT:",
      ...initialRepairReasons.map((reason) => `- ${reason}`),
      "- Answer the creator's actual task directly.",
      "- Use only supplied evidence for every numeric or channel-specific claim.",
      "- Differ materially from recent responses in both wording and recommended action.",
     ].join("\n"),
    }), BRAIN_REPAIR_TIMEOUT_MS)
    const repairedResponse = fromStructuredOutput(repairedOutput, input.snapshot)
    const repairedCandidate = {
     ...repairedResponse,
     modules: formatCreatorGrowthModules(repairedResponse, input.growthContext),
    }
    const repairedEvaluation = validateBrainResponse({
     response: repairedCandidate,
     snapshot: input.snapshot,
     recentTurns: input.recentTurns,
     growthContext: input.growthContext,
     expectedMode: taskProfile.answerMode,
    })
    if (repairedEvaluation.passed) {
     response = repairedCandidate
     evaluation = repairedEvaluation
     generationPath = "repaired_model"
     repairOutcome = { attempted: true, succeeded: true, reasons: initialRepairReasons, evaluationId: repairedEvaluation.id }
    } else {
     response = buildFallback(input.userText, input.snapshot, input.growthContext)
     evaluation = validateBrainResponse({ response, snapshot: input.snapshot, recentTurns: input.recentTurns, growthContext: input.growthContext, expectedMode: taskProfile.answerMode })
     status = "fallback"
     generationPath = "basic_guidance"
     fallbackReason = "validation_failed"
     repairOutcome = {
      attempted: true,
      succeeded: false,
      reasons: [...initialRepairReasons, ...repairedEvaluation.repairReasons],
      evaluationId: repairedEvaluation.id,
     }
    }
   } catch {
    response = buildFallback(input.userText, input.snapshot, input.growthContext)
    evaluation = validateBrainResponse({ response, snapshot: input.snapshot, recentTurns: input.recentTurns, growthContext: input.growthContext, expectedMode: taskProfile.answerMode })
    status = "fallback"
    generationPath = "basic_guidance"
    fallbackReason = "repair_failed"
   }
  }
  response = { ...response, generationPath, ...(fallbackReason ? { fallbackReason } : {}) }
  const learning = await captureAIBrainLearningEvent({
   channelId: input.channelId || null,
   source: "copilot",
   summary: `Copilot conversation: ${input.userText}`,
   detail: response.keyInsight,
   category: "answer_quality",
   confidence: evaluation.passed ? "high" : "medium",
   evidence: response.modules?.map((module) => module.title) || [],
   metadata: {
    evaluationId: evaluation.id,
    capabilities: capabilityIds,
    taskProfileId: taskProfile.id,
    generationPath,
    fallbackReason,
    promptVersion: BRAIN_PROMPT_VERSION,
    repairReasons: repairOutcome.reasons,
   },
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
   metadata: {
    capabilities: capabilityIds,
    taskProfileId: taskProfile.id,
    generationPath,
    fallbackReason,
    promptVersion: BRAIN_PROMPT_VERSION,
    evaluationId: evaluation.id,
    repairReasons: repairOutcome.reasons,
    repaired: repairOutcome.attempted,
   },
  })
  return {
   turn,
   response,
   modules: response.modules || [],
   capabilities: capabilityIds,
   contextBudget: context.budget,
   repaired: repairOutcome.attempted,
   generationPath,
   fallbackReason,
   repairOutcome,
  }
 } catch (error) {
  const generationPath: BrainGenerationPath = "basic_guidance"
  const fallbackReason: BrainFallbackReason = input.allowModel ? "provider_error" : "model_disabled"
  const repairOutcome: BrainRepairOutcome = { attempted: false, succeeded: false, reasons: [] }
  const response = { ...buildFallback(input.userText, input.snapshot, input.growthContext), generationPath, fallbackReason }
  const evaluation = validateBrainResponse({ response, snapshot: input.snapshot, recentTurns: input.recentTurns, growthContext: input.growthContext, expectedMode: taskProfile.answerMode })
  const learning = await captureAIBrainLearningEvent({
   channelId: input.channelId || null,
   source: "copilot",
   summary: `Copilot conversation: ${input.userText}`,
   detail: response.keyInsight,
   category: "answer_quality",
   confidence: evaluation.passed ? "high" : "medium",
   evidence: response.modules?.map((module) => module.title) || [],
   metadata: {
    evaluationId: evaluation.id,
    capabilities: capabilityIds,
    taskProfileId: taskProfile.id,
    generationPath,
    fallbackReason,
    promptVersion: BRAIN_PROMPT_VERSION,
   },
  })
  const turn = await completeAIBrainTurn({
   turnId: pending.id,
   status: "fallback",
   assistantText: response.body || response.keyInsight,
   response,
   answerModules: response.modules,
   evaluation,
   learningEntryIds: [learning.id],
   metadata: {
    orchestrationError: error instanceof Error ? error.message : String(error),
    capabilities: capabilityIds,
    taskProfileId: taskProfile.id,
    generationPath,
    fallbackReason,
    promptVersion: BRAIN_PROMPT_VERSION,
    evaluationId: evaluation.id,
    repaired: false,
   },
  })
  return {
   turn,
   response,
   modules: response.modules || [],
   capabilities: capabilityIds,
   contextBudget: context.budget,
   repaired: false,
   generationPath,
   fallbackReason,
   repairOutcome,
  }
 }
}
