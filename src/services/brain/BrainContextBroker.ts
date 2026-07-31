import type {
 AIBrainConversationTurn,
 BrainContextBudget,
 NicheKnowledgeProfile,
} from "../../types"
import type { AIBrainContextSnapshot } from "../aiBrainCommandInterface"
import { inferBrainIntent } from "./BrainCapabilityRegistry"
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

 const intent = inferBrainIntent(input.userText)
 const userTextLower = input.userText.toLowerCase()

 const generationInstruction = intent === "content_generation" ? [
  "\nCONTENT GENERATION TASK",
  "The creator asked you to draft a real creator asset (script, hook, title angles, pinned comment, description, tags, etc.).",
  "Your response MUST contain the actual drafted asset — not strategy advice about the asset.",
  "Use the channel evidence above to match the creator's established style, niche, and top-performing video patterns.",
  "For 'new video about X': draft 3 title angle options, an opening hook (first 30 seconds), a description, and 10 tags.",
  "For pinned comments: select the specific top videos by title and write one distinct comment per video.",
  "For title angles: provide 3 concrete title options with different emotional hooks.",
  "For descriptions/tags: write the full text ready to paste — no placeholders.",
  "Set mode to creator_asset_draft. Keep body to the draft itself, not explanation.",
 ].join("\n") : ""

 const namedReadInstruction = !generationInstruction && /\b(daily oracle|oracle)\b/i.test(input.userText) ? [
  "\nDAILY ORACLE TASK",
  "Return exactly: one priority (the single most important thing to do today), one quick win (achievable in under 2 hours), and one measurable action (a specific outcome to judge by tomorrow).",
  "Ground each item in the creator's actual channel data and top videos. No generic advice.",
 ].join("\n") : !generationInstruction && /\b(first week plan|week plan|7.day plan)\b/i.test(userTextLower) ? [
  "\nFIRST WEEK PLAN TASK",
  "Return a concrete 7-day action board for this specific channel. Each day: one specific task grounded in the channel's niche, top videos, and gaps.",
  "Day 1-7 must be distinct actions. Reference actual video titles and niche topics. No generic creator advice.",
 ].join("\n") : !generationInstruction && /\b(best video autopsy|autopsy)\b/i.test(userTextLower) ? [
  "\nBEST VIDEO AUTOPSY TASK",
  "Break down the top-performing video by name: why the title worked, what the hook likely promised, why viewers stayed, and what made it shareable.",
  "Then give a step-by-step replication plan for the next upload — same payoff, different angle.",
 ].join("\n") : !generationInstruction && /\b(revive|comeback|return|not posted|haven't posted|after.*break|greet.*audience|greet.*subscriber|welcome back)\b/i.test(userTextLower) ? [
  "\nCHANNEL REVIVAL TASK",
  "The creator is returning after a gap. Give them a specific comeback plan: what to say in the first video back, how to re-engage existing subscribers, and what to publish first based on their top-performing content.",
  "Reference their actual top videos and niche. Draft the opening 2-3 sentences of a comeback hook they can use.",
 ].join("\n") : ""

 const sections = [
  system,
  "\nCHANNEL EVIDENCE\n" + evidence,
  memory ? "\nCONFIRMED CREATOR CONTEXT\n" + memory : "",
  clippedConversation ? "\nRECENT CONVERSATION\n" + clippedConversation : "",
  knowledge ? "\nPUBLIC NICHE KNOWLEDGE\n" + knowledge : "",
  research ? "\nCURRENT PUBLIC RESEARCH\n" + research : "",
  generationInstruction,
  namedReadInstruction,
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
