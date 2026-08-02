import type {
 AIBrainConversationTurn,
 BrainContextBudget,
 NicheKnowledgeProfile,
} from "../../types"
import type { AIBrainContextSnapshot } from "../aiBrainCommandInterface"
import { buildBrainTaskInstruction, resolveBrainTaskProfile } from "./BrainTaskProfileRegistry"
import { buildRelevantNicheKnowledgeContext } from "./NicheKnowledge"

const clip = (value: string, maximum: number): string => value.slice(0, Math.max(0, maximum))

export const buildBrainContextPack = (input: {
 systemPrompt: string
 snapshot: AIBrainContextSnapshot
 recentTurns: AIBrainConversationTurn[]
 nicheKnowledge?: NicheKnowledgeProfile | null
 userText: string
 currentResearch?: string
 maximumCharacters?: number
}): { systemInstruction: string; budget: BrainContextBudget } => {
 const maximumCharacters = input.maximumCharacters || 24_000
 const omittedSections: string[] = []
 const system = clip(input.systemPrompt, 11_000)
 if (system.length < input.systemPrompt.length) omittedSections.push("system_overflow")

 const conversation = input.recentTurns
  .filter((turn) => turn.status !== "pending")
  .slice(0, 4)
  .reverse()
  .map((turn) => `Creator: ${turn.userText}\nCopilot: ${turn.response?.keyInsight || turn.assistantText}`)
  .join("\n")
 const clippedConversation = clip(conversation, 3200)
 if (clippedConversation.length < conversation.length) omittedSections.push("older_conversation_detail")

 const memory = clip([
  input.snapshot.brain.identityAndAspirations,
  input.snapshot.brain.contentDNA,
  input.snapshot.brain.futureStateMap,
  ...input.snapshot.conversations.recentFacts,
 ].filter(Boolean).join("\n"), 3200)
 const evidence = clip([
  `Channel: ${input.snapshot.channel.label}`,
  `Inferred niche: ${input.snapshot.inferredProfile.niche || "unknown"}`,
  `Content pillars: ${input.snapshot.inferredProfile.contentPillars.join(", ") || "unknown"}`,
  `Known videos: ${input.snapshot.inferredProfile.videoCount}`,
  ...input.snapshot.inferredProfile.topEvidenceVideos.slice(0, 5).map((video) =>
   `${video.title}${typeof video.views === "number" ? ` | ${video.views.toLocaleString()} views` : " | views unknown"}`),
  ...input.snapshot.evidencePack.missingInputs.map((value) => `Missing: ${value}`),
 ].join("\n"), 3800)
 const knowledge = clip(buildRelevantNicheKnowledgeContext(input.nicheKnowledge || null, input.userText, 2200), 2200)
 const research = clip(input.currentResearch || "", 1800)

 const taskInstruction = buildBrainTaskInstruction(resolveBrainTaskProfile(input.userText))

 const sections = [
  system,
  "\nCHANNEL EVIDENCE\n" + evidence,
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
   evidenceCharacters: evidence.length,
   memoryCharacters: memory.length,
   knowledgeCharacters: knowledge.length + research.length,
   conversationCharacters: clippedConversation.length,
   omittedSections,
  },
 }
}
