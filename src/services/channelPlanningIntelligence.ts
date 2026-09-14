import { getComplexAdvice } from "./gemini"
import { annotateSystemPrompt, consultBrainSync } from "./brain/Utils"

export type ChannelPlanningKind = "todo" | "goal"

export interface ChannelPlanningSuggestion {
  text: string
  category: "Growth" | "Content" | "Audience" | "Publishing" | "Revenue" | "Operations"
  rationale: string
  evidence: string
}

const clean = (value: unknown, fallback = "Unknown") => {
  const text = String(value ?? "").trim()
  return text || fallback
}

const channelProfileContext = (brain: any) => ({
  channelName: clean(brain?.channelTitle ?? brain?.channelName, "Connected channel"),
  niche: clean(brain?.targetNiche ?? brain?.niche, "Not yet defined"),
  audience: clean(brain?.targetAudience ?? brain?.audience, "Not yet defined"),
  goals: Array.isArray(brain?.channelHub?.goals) ? brain.channelHub.goals.map((goal: any) => goal?.text).filter(Boolean) : [],
  todos: Array.isArray(brain?.channelHub?.toDos) ? brain.channelHub.toDos.map((todo: any) => todo?.text).filter(Boolean) : [],
  projects: Array.isArray(brain?.projects) ? brain.projects.slice(0, 12).map((project: any) => ({
    title: project?.videoTitle || project?.name,
    status: project?.status,
    publishDate: project?.publishDate,
  })) : [],
})

const parseSuggestions = (raw: string): ChannelPlanningSuggestion[] => {
  const jsonMatch = raw.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) return parsed.slice(0, 6).map((item: any) => ({
        text: clean(item.text ?? item.title, "Channel action"),
        category: (["Growth", "Content", "Audience", "Publishing", "Revenue", "Operations"].includes(item.category) ? item.category : "Growth") as ChannelPlanningSuggestion["category"],
        rationale: clean(item.rationale ?? item.why, "Recommended from current channel context."),
        evidence: clean(item.evidence, "AI Brain + channel profile"),
      }))
    } catch {
      // Fall through to line parsing for providers that wrap otherwise useful output.
    }
  }

  return raw.split("\n")
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((line) => line.length > 8)
    .slice(0, 6)
    .map((text) => ({ text, category: "Growth" as const, rationale: "Recommended from current channel context.", evidence: "AI Brain + channel profile" }))
}

export const buildChannelPlanningPrompt = (kind: ChannelPlanningKind, brain: any) => {
  const profile = channelProfileContext(brain)
  const packet = consultBrainSync(`channel-${kind}-planner`)
  const noun = kind === "todo" ? "channel to-do actions" : "channel goals"
  const horizon = kind === "todo" ? "the next 7-14 days" : "the next 30-90 days"

  const base = `You are ViewTube's channel planning strategist. Generate exactly 6 ${noun} for ${horizon}.

CHANNEL PROFILE:
${JSON.stringify(profile, null, 2)}

RULES:
1. Use the channel profile AND injected AI Brain knowledge as primary evidence.
2. Do not give generic creator advice when channel-specific evidence exists.
3. Do not duplicate existing to-dos or goals.
4. Connect recommendations to current projects, audience, content DNA, performance patterns, creator aspirations, and strategic advice when those signals exist.
5. If evidence is weak or missing, say that in the evidence field rather than inventing a fact.
6. Each item must be concrete enough to act on or measure.
7. Return ONLY a JSON array. Each object must contain: text, category, rationale, evidence.
8. category must be one of Growth, Content, Audience, Publishing, Revenue, Operations.`

  return annotateSystemPrompt(base, packet)
}

export const generateChannelPlanningSuggestions = async (kind: ChannelPlanningKind, brain: any): Promise<ChannelPlanningSuggestion[]> => {
  const prompt = buildChannelPlanningPrompt(kind, brain)
  const raw = await getComplexAdvice(
    prompt,
    "Treat the supplied AI Brain packet and channel profile as the authoritative creator context. Return only the requested JSON array.",
  )
  return parseSuggestions(raw)
}
