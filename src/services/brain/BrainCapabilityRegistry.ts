import type { BrainCapabilityDefinition } from "../../types"
import type { AIBrainContextSnapshot } from "../aiBrainCommandInterface"
import { resolveBrainTaskProfile } from "./BrainTaskProfileRegistry"
import { readBrainUserControls } from "./BrainUserControls"

export const BRAIN_CAPABILITY_REGISTRY: BrainCapabilityDefinition[] = [
 { id: "channel-profile", label: "Channel profile", description: "Uses inferred niche, pillars, formats, and creator goals.", intents: ["strategy", "audience", "content_analysis"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "channel-intelligence", label: "Channel intelligence", description: "Uses durable profile context, workflow outcomes, creator choices, and validated repeated channel patterns.", intents: ["strategy", "analytics", "audience", "content_analysis"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "signal-anomaly-intelligence", label: "Signal anomaly intelligence", description: "Detects and explains unusual shifts in canonical VT-SYNC analytics while preserving evidence provenance and uncertainty.", intents: ["analytics", "strategy", "revenue", "audience"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "statistics-intelligence", label: "Statistics intelligence", description: "Computes deterministic metric summaries, coverage, freshness, and missingness from analytics-canon evidence before model reasoning.", intents: ["analytics", "strategy", "revenue", "audience"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "opportunity-intelligence", label: "Opportunity intelligence", description: "Identifies channel-relevant openings such as emerging demand, catalog gaps, session adjacency, and reusable audience interest.", intents: ["strategy", "seo", "audience", "content_analysis"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "algorithm-priming", label: "Algorithm priming", description: "Builds proactive pre-launch, launch, post-launch, session, derivative, and learning workflows for a specific video or project.", intents: ["strategy", "publishing", "content_generation"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "analytics-diagnosis", label: "Analytics diagnosis", description: "Reads known channel and video performance without inventing missing values.", intents: ["analytics", "revenue"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "top-performer-mining", label: "Top performer mining", description: "Finds repeatable patterns in proven videos.", intents: ["strategy", "content_analysis", "seo"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "audience-promise", label: "Audience promise", description: "Connects topics and formats to a clear viewer payoff.", intents: ["audience", "strategy", "publishing"], maximumInvocationsPerTurn: 1 },
 { id: "seo-opportunity", label: "SEO opportunity", description: "Builds channel-relevant title, topic, and search opportunities.", intents: ["seo", "publishing"], maximumInvocationsPerTurn: 1 },
 { id: "goal-coach", label: "Goal coach", description: "Ranks recommendations by the creator's stated outcome.", intents: ["strategy", "analytics", "revenue"], maximumInvocationsPerTurn: 1 },
 { id: "daily-oracle", label: "Daily Oracle", description: "Returns one priority, one quick win, and one measurable action.", intents: ["strategy", "publishing"], maximumInvocationsPerTurn: 1 },
 { id: "journal-memory", label: "Journal and memory", description: "Uses confirmed notes, constraints, style, and decisions.", intents: ["strategy", "audience", "content_analysis"], maximumInvocationsPerTurn: 1 },
 { id: "niche-knowledge", label: "Niche knowledge", description: "Adds bounded public subject knowledge after the niche is stable.", intents: ["strategy", "seo", "audience", "content_analysis"], maximumInvocationsPerTurn: 1 },
 { id: "current-grounding", label: "Current grounding", description: "Uses Google grounding only for timely public questions.", intents: ["strategy", "seo", "audience"], maximumInvocationsPerTurn: 1, requiresCurrentResearch: true },
 { id: "content-generation", label: "Content generation", description: "Drafts creator assets: scripts, hooks, pinned comments, descriptions, tags, titles, community posts, and replies.", intents: ["content_generation"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
]

export const inferBrainIntent = (userText: string): BrainCapabilityDefinition["intents"][number] => {
 return resolveBrainTaskProfile(userText).intent
}

const timelyRequest = (userText: string): boolean =>
 /\b(today|current|currently|latest|recent news|trend|trending|competitor|search behavior|this week|this month|202[5-9])\b/i.test(userText)

const capabilityAllowedByCreator = (
 capability: BrainCapabilityDefinition,
 controls: ReturnType<typeof readBrainUserControls>,
): boolean => {
 if (!controls.enabled) return false
 if (!controls.personalization && ["channel-profile", "channel-intelligence", "journal-memory", "goal-coach"].includes(capability.id)) return false
 if (!controls.allowAnalytics && ["statistics-intelligence", "analytics-diagnosis", "top-performer-mining", "signal-anomaly-intelligence", "channel-intelligence", "opportunity-intelligence", "algorithm-priming"].includes(capability.id)) return false
 return true
}

export const selectBrainCapabilities = (input: {
 userText: string
 snapshot: AIBrainContextSnapshot
 channelId?: string | null
 maximum?: number
}): BrainCapabilityDefinition[] => {
 const controls = readBrainUserControls(input.channelId)
 if (!controls.enabled) return []

 const intent = inferBrainIntent(input.userText)
 const maximum = Math.max(1, Math.min(8, input.maximum || 6))
 const selected = BRAIN_CAPABILITY_REGISTRY.filter((capability) => {
  if (!capabilityAllowedByCreator(capability, controls)) return false
  if (capability.requiresCurrentResearch && !timelyRequest(input.userText)) return false
  if (capability.requiresChannelData && input.snapshot.inferredProfile.videoCount === 0) return false
  return capability.intents.includes(intent)
 })
 if (controls.personalization && !selected.some((capability) => capability.id === "goal-coach")) {
  const goalCoach = BRAIN_CAPABILITY_REGISTRY.find((capability) => capability.id === "goal-coach")
  if (goalCoach && capabilityAllowedByCreator(goalCoach, controls)) selected.push(goalCoach)
 }
 if (input.snapshot.inferredProfile.status !== "missing" && !selected.some((capability) => capability.id === "niche-knowledge")) {
  const nicheKnowledge = BRAIN_CAPABILITY_REGISTRY.find((capability) => capability.id === "niche-knowledge")
  if (nicheKnowledge && capabilityAllowedByCreator(nicheKnowledge, controls)) selected.push(nicheKnowledge)
 }
 return selected.filter(Boolean).slice(0, maximum)
}

export const shouldUseCurrentGrounding = timelyRequest
