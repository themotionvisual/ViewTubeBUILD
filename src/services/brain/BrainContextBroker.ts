import type {
 AIBrainConversationTurn,
 BrainContextBudget,
 NicheKnowledgeProfile,
} from "../../types"
import type { AIBrainContextSnapshot } from "../aiBrainCommandInterface"
import { buildBrainTaskInstruction, resolveBrainTaskProfile } from "./BrainTaskProfileRegistry"
import { buildRelevantNicheKnowledgeContext } from "./NicheKnowledge"
import {
 getActiveBrainControlChannel,
 readBrainUserControls,
} from "./BrainUserControls"
import { buildBrainAlgorithmEvaluationContext } from "./BrainAlgorithmIntelligenceContext"

const clip = (value: string, maximum: number): string => value.slice(0, Math.max(0, maximum))

export const buildBrainContextPack = (input: {
 systemPrompt: string
 snapshot: AIBrainContextSnapshot
 recentTurns: AIBrainConversationTurn[]
 nicheKnowledge?: NicheKnowledgeProfile | null
 userText: string
 currentResearch?: string
 algorithmIntelligence?: string
 maximumCharacters?: number
}): { systemInstruction: string; budget: BrainContextBudget } => {
 const controls = readBrainUserControls()
 const taskProfile = resolveBrainTaskProfile(input.userText)
 const maximumCharacters = input.maximumCharacters || 24_000
 const omittedSections: string[] = []
 const system = clip(input.systemPrompt, 11_000)
 if (system.length < input.systemPrompt.length) omittedSections.push("system_overflow")

 const conversation = controls.personalization
  ? input.recentTurns
    .filter((turn) => turn.status !== "pending")
    .slice(0, 4)
    .reverse()
    .map((turn) => `Creator: ${turn.userText}\nCopilot: ${turn.response?.keyInsight || turn.assistantText}`)
    .join("\n")
  : ""
 const clippedConversation = clip(conversation, 3200)
 if (clippedConversation.length < conversation.length) omittedSections.push("older_conversation_detail")
 if (!controls.personalization) omittedSections.push("creator_personalization_disabled")

 const memory = controls.personalization
  ? clip([
    input.snapshot.brain.identityAndAspirations,
    input.snapshot.brain.contentDNA,
    input.snapshot.brain.futureStateMap,
    ...input.snapshot.conversations.recentFacts,
   ].filter(Boolean).join("\n"), 3200)
  : ""

 const evidence = controls.allowAnalytics
  ? clip([
    `Channel: ${input.snapshot.channel.label}`,
    `Inferred niche: ${input.snapshot.inferredProfile.niche || "unknown"}`,
    `Content pillars: ${input.snapshot.inferredProfile.contentPillars.join(", ") || "unknown"}`,
    `Known videos: ${input.snapshot.inferredProfile.videoCount}`,
    ...input.snapshot.inferredProfile.topEvidenceVideos.slice(0, 5).map((video) =>
     `${video.title}${typeof video.views === "number" ? ` | ${video.views.toLocaleString()} views` : " | views unknown"}`),
    ...input.snapshot.evidencePack.missingInputs.map((value) => `Missing: ${value}`),
   ].join("\n"), 3800)
  : "Analytics evidence access is disabled by the creator in Brain User Controls. Do not infer private channel metrics or quote stored analytics values."
 if (!controls.allowAnalytics) omittedSections.push("analytics_access_disabled")

 let resolvedAlgorithmIntelligence = input.algorithmIntelligence || ""
 if (!resolvedAlgorithmIntelligence && controls.allowAnalytics && taskProfile.id === "evaluation") {
  const channelId = getActiveBrainControlChannel()
  if (channelId) {
   try {
    resolvedAlgorithmIntelligence = buildBrainAlgorithmEvaluationContext(channelId).context
   } catch {
    omittedSections.push("algorithm_evaluation_context_unavailable")
   }
  } else {
   omittedSections.push("algorithm_evaluation_channel_unresolved")
  }
 }

 const algorithmIntelligence = controls.allowAnalytics
  ? clip(resolvedAlgorithmIntelligence, 6000)
  : ""
 if (resolvedAlgorithmIntelligence && !controls.allowAnalytics) omittedSections.push("algorithm_intelligence_analytics_disabled")
 if (resolvedAlgorithmIntelligence && algorithmIntelligence.length < resolvedAlgorithmIntelligence.length) omittedSections.push("algorithm_intelligence_clipped")

 const knowledge = clip(buildRelevantNicheKnowledgeContext(input.nicheKnowledge || null, input.userText, 2200), 2200)
 const research = clip(input.currentResearch || "", 1800)
 const taskInstruction = buildBrainTaskInstruction(taskProfile)
 const controlInstruction = [
  "\nCREATOR CONTROL POLICY",
  `Brain enabled: ${controls.enabled ? "yes" : "no"}`,
  `Personalization: ${controls.personalization ? "allowed" : "disabled"}`,
  `Analytics evidence: ${controls.allowAnalytics ? "allowed" : "disabled"}`,
  `Learning from interactions: ${controls.learnFromInteractions ? "allowed" : "disabled"}`,
  "Never work around a disabled creator permission by reconstructing private data from memory.",
  "Treat anomaly observations, opportunity signals, priming plans, algorithm recommendations, executions, and measured outcomes as distinct evidence classes.",
  "Never describe a recommendation or priming step as already executed unless the workflow outcome says it was completed.",
  "Never describe an execution as successful unless a measured outcome supports that conclusion.",
 ].join("\n")

 const sections = [
  system,
  controlInstruction,
  "\nCHANNEL EVIDENCE\n" + evidence,
  algorithmIntelligence ? "\nALGORITHM INTELLIGENCE & MOMENTUM\n" + algorithmIntelligence : "",
  memory ? "\nCONFIRMED CREATOR CONTEXT\n" + memory : "",
  clippedConversation ? "\nRECENT CONVERSATION\n" + clippedConversation : "",
  knowledge ? "\nPUBLIC NICHE KNOWLEDGE\n" + knowledge : "",
  research ? "\nCURRENT PUBLIC RESEARCH\n" + research : "",
  taskInstruction ? `\n${taskInstruction}` : "",
 ].filter(Boolean)
 let systemInstruction = sections.join("\n")
 if (systemInstruction.length > maximumCharacters) {
  omittedSections.push("context_over_budget")
  systemInstruction = systemInstruction.slice(0, maximumCharacters)
 }

 return {
  systemInstruction,
  budget: {
   maximumCharacters,
   systemCharacters: system.length,
   evidenceCharacters: evidence.length + algorithmIntelligence.length,
   memoryCharacters: memory.length,
   knowledgeCharacters: knowledge.length + research.length,
   conversationCharacters: clippedConversation.length,
   omittedSections,
  },
 }
}
