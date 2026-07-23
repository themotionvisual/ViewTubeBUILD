import type { BrainCapabilityDefinition } from "../../types"
import type { AIBrainContextSnapshot } from "../aiBrainCommandInterface"

export const BRAIN_CAPABILITY_REGISTRY: BrainCapabilityDefinition[] = [
 { id: "channel-profile", label: "Channel profile", description: "Uses inferred niche, pillars, formats, and creator goals.", intents: ["strategy", "audience", "content_analysis"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "analytics-diagnosis", label: "Analytics diagnosis", description: "Reads known channel and video performance without inventing missing values.", intents: ["analytics", "revenue"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "top-performer-mining", label: "Top performer mining", description: "Finds repeatable patterns in proven videos.", intents: ["strategy", "content_analysis", "seo"], maximumInvocationsPerTurn: 1, requiresChannelData: true },
 { id: "audience-promise", label: "Audience promise", description: "Connects topics and formats to a clear viewer payoff.", intents: ["audience", "strategy", "publishing"], maximumInvocationsPerTurn: 1 },
 { id: "seo-opportunity", label: "SEO opportunity", description: "Builds channel-relevant title, topic, and search opportunities.", intents: ["seo", "publishing"], maximumInvocationsPerTurn: 1 },
 { id: "goal-coach", label: "Goal coach", description: "Ranks recommendations by the creator's stated outcome.", intents: ["strategy", "analytics", "revenue"], maximumInvocationsPerTurn: 1 },
 { id: "daily-oracle", label: "Daily Oracle", description: "Returns one priority, one quick win, and one measurable action.", intents: ["strategy", "publishing"], maximumInvocationsPerTurn: 1 },
 { id: "journal-memory", label: "Journal and memory", description: "Uses confirmed notes, constraints, style, and decisions.", intents: ["strategy", "audience", "content_analysis"], maximumInvocationsPerTurn: 1 },
 { id: "niche-knowledge", label: "Niche knowledge", description: "Adds bounded public subject knowledge after the niche is stable.", intents: ["strategy", "seo", "audience", "content_analysis"], maximumInvocationsPerTurn: 1 },
 { id: "current-grounding", label: "Current grounding", description: "Uses Google grounding only for timely public questions.", intents: ["strategy", "seo", "audience"], maximumInvocationsPerTurn: 1, requiresCurrentResearch: true },
]

export const inferBrainIntent = (userText: string): BrainCapabilityDefinition["intents"][number] => {
 const value = userText.toLowerCase()
 if (/revenue|rpm|cpm|moneti[sz]|income|sponsor/.test(value)) return "revenue"
 if (/seo|keyword|search|title|description|tag/.test(value)) return "seo"
 if (/audience|viewer|subscriber|comment|community/.test(value)) return "audience"
 if (/publish|upload|schedule|checklist|launch/.test(value)) return "publishing"
 if (/metric|analytics|views|watch time|retention|ctr|best video|perform/.test(value)) return "analytics"
 if (/video|format|series|script|hook|thumbnail|idea/.test(value)) return "content_analysis"
 return "strategy"
}

const timelyRequest = (userText: string): boolean =>
 /\b(today|current|currently|latest|recent news|trend|trending|competitor|search behavior|this week|this month|202[5-9])\b/i.test(userText)

export const selectBrainCapabilities = (input: {
 userText: string
 snapshot: AIBrainContextSnapshot
 maximum?: number
}): BrainCapabilityDefinition[] => {
 const intent = inferBrainIntent(input.userText)
 const maximum = Math.max(1, Math.min(8, input.maximum || 6))
 const selected = BRAIN_CAPABILITY_REGISTRY.filter((capability) => {
  if (capability.requiresCurrentResearch && !timelyRequest(input.userText)) return false
  if (capability.requiresChannelData && input.snapshot.inferredProfile.videoCount === 0) return false
  return capability.intents.includes(intent)
 })
 if (!selected.some((capability) => capability.id === "goal-coach")) {
  selected.push(BRAIN_CAPABILITY_REGISTRY.find((capability) => capability.id === "goal-coach")!)
 }
 if (input.snapshot.inferredProfile.status !== "missing" && !selected.some((capability) => capability.id === "niche-knowledge")) {
  selected.push(BRAIN_CAPABILITY_REGISTRY.find((capability) => capability.id === "niche-knowledge")!)
 }
 return selected.filter(Boolean).slice(0, maximum)
}

export const shouldUseCurrentGrounding = timelyRequest
