import type { AIBrainEvidenceIntent, CreatorBrainResponse } from "../../types"

export type BrainTaskProfileId =
 | "creator_asset_draft"
 | "daily_oracle"
 | "first_week_plan"
 | "best_video_autopsy"
 | "channel_revival"
 | "strategy"
 | "analytics"
 | "seo"
 | "audience"
 | "revenue"
 | "publishing"
 | "content_analysis"
 | "journal"
 | "goal_coach"

export type BrainCreatorAssetKind =
 | "pinned_comment"
 | "community_post"
 | "reply"
 | "hook"
 | "script_direction"
 | "title"
 | "description"
 | "tag"
 | "caption"
 | "outline"
 | "cta"
 | "video_package"

export interface BrainTaskProfile {
 id: BrainTaskProfileId
 intent: AIBrainEvidenceIntent
 answerMode: CreatorBrainResponse["mode"]
 assetKind?: BrainCreatorAssetKind
 requestedCount: number
 explicitSubject: string | null
}

const creationVerb = /\b(write|draft|create|generate|rewrite|make me|give me|compose|produce)\b/i
const creatorAsset = /\b(scripts?|hooks?|pinned comments?|comments?|community posts?|posts?|replies?|titles?|descriptions?|tags?|captions?|outlines?|intros?|outros?|calls? to action|ctas?)\b/i
const videoCreation = /\b(want to make|make a new video|new video about|video about|video on|create a video|plan a video|plan.*video)\b/i

const resolveAssetKind = (text: string): BrainCreatorAssetKind => {
 if (/\bpinned comments?\b/i.test(text)) return "pinned_comment"
 if (/\bcommunity posts?\b/i.test(text)) return "community_post"
 if (/\brepl(?:y|ies)\b/i.test(text)) return "reply"
 if (/\bhooks?\b/i.test(text)) return "hook"
 if (/\bscripts?|intros?|outros?\b/i.test(text)) return "script_direction"
 if (/\btitles?\b/i.test(text)) return "title"
 if (/\bdescriptions?\b/i.test(text)) return "description"
 if (/\btags?\b/i.test(text)) return "tag"
 if (/\bcaptions?\b/i.test(text)) return "caption"
 if (/\bcalls? to action|\bctas?\b/i.test(text)) return "cta"
 if (videoCreation.test(text)) return "video_package"
 return "outline"
}

const requestedCount = (text: string): number => {
 const parsed = Number(
  text.match(/\b(?:write|draft|create|generate|give me|make me)\s+(\d{1,3})\b/i)?.[1]
  || text.match(/\b(?:top|for)\s+(\d{1,3})\s+(?:videos?|scripts?|hooks?|comments?|posts?|replies?|titles?|descriptions?|captions?|outlines?|ctas?)\b/i)?.[1]
  || 3,
 )
 return Math.max(1, Math.min(10, parsed))
}

const explicitSubject = (text: string): string | null => {
 const quoted = text.match(/[“"]([^”"]{2,120})[”"]/i)?.[1]?.trim()
 if (quoted) return quoted
 const match = text.match(/\b(?:about|on)\s+(.{2,120})$/i)?.[1]?.trim()
  || text.match(/\bfor\s+(.{2,120})$/i)?.[1]?.trim()
 if (!match || /^(?:my\s+)?top\s+\d+\s+videos?\b/i.test(match)) return null
 return match.replace(/[.?!]+$/, "").trim() || null
}

const profile = (
 id: BrainTaskProfileId,
 intent: AIBrainEvidenceIntent,
 answerMode: CreatorBrainResponse["mode"],
): BrainTaskProfile => ({ id, intent, answerMode, requestedCount: 3, explicitSubject: null })

export const resolveBrainTaskProfile = (userText: string): BrainTaskProfile => {
 const value = userText.trim()
 if ((creationVerb.test(value) && creatorAsset.test(value)) || videoCreation.test(value) || /\bpinned comments?\b/i.test(value)) {
  return {
   id: "creator_asset_draft",
   intent: "content_generation",
   answerMode: "creator_asset_draft",
   assetKind: resolveAssetKind(value),
   requestedCount: requestedCount(value),
   explicitSubject: explicitSubject(value),
  }
 }
 if (/\b(daily oracle|oracle)\b/i.test(value)) return profile("daily_oracle", "strategy", "goal_coach")
 if (/\b(quick win|today'?s priority|today)\b/i.test(value)) return profile("goal_coach", "strategy", "goal_coach")
 if (/\b(first week plan|week plan|7.day plan|seven.day plan)\b/i.test(value)) return profile("first_week_plan", "strategy", "publishing_checklist")
 if (/\b(best video autopsy|video autopsy|autopsy)\b/i.test(value)) return profile("best_video_autopsy", "analytics", "analytics_diagnosis")
 if (/\b(revive|revival|comeback|return|not posted|haven't posted|after.*break|greet.*audience|greet.*subscriber|welcome back)\b/i.test(value)) {
  return profile("channel_revival", "strategy", "strategy_brief")
 }
 if (/\b(best|most successful|top)\b.*\b(video|upload)\b/i.test(value)) return profile("analytics", "analytics", "analytics_diagnosis")
 if (/\b(thumbnail|packaging|hook|click-?through)\b/i.test(value)) return profile("seo", "seo", "seo_keyword_plan")
 if (/\b(ideas?|topics?|angles?|formats?|series|episodes?|double down)\b/i.test(value)) return profile("content_analysis", "content_analysis", "video_idea_sprint")
 if (/\b(niche|positioning|channel identity)\b/i.test(value)) return profile("strategy", "strategy", "strategy_brief")
 if (/\b(revenue|rpm|cpm|moneti[sz]\w*|income|sponsor|money)\b/i.test(value)) return profile("revenue", "revenue", "revenue_levers")
 if (/\b(seo|keywords?|search|titles?|descriptions?|tags?)\b/i.test(value)) return profile("seo", "seo", "seo_keyword_plan")
 if (/\b(audience|viewer|subscriber|comment|community)\b/i.test(value)) return profile("audience", "audience", "strategy_brief")
 if (/\b(publish|upload|schedule|checklist|launch|calendar|consistency)\b/i.test(value)) return profile("publishing", "publishing", "publishing_checklist")
 if (/\b(metric|analytics|views|watch time|retention|ctr|best video|perform|traffic|impressions?)\b/i.test(value)) return profile("analytics", "analytics", "analytics_diagnosis")
 if (/\b(journal|reflect|voice|style)\b/i.test(value)) return profile("journal", "strategy", "journal_reflection")
 if (/\b(goals?|target|milestone|on pace|pace)\b/i.test(value)) return profile("goal_coach", "strategy", "goal_coach")
 if (/\b(video|format|series|script|hook|thumbnail|ideas?|topics?|angles?)\b/i.test(value)) return profile("content_analysis", "content_analysis", "video_idea_sprint")
 return profile("strategy", "strategy", "strategy_brief")
}

export const buildBrainTaskInstruction = (task: BrainTaskProfile): string => {
 if (task.id === "creator_asset_draft") return [
  "CONTENT GENERATION TASK",
  "Draft the requested creator asset directly; do not substitute advice about drafting it.",
  "Prefer the creator's explicit topic or title, then the supplied top-video evidence.",
  "If neither is available, ask exactly one focused topic-or-title question instead of producing a generic draft.",
  "For a new video about a topic, include three title angles, an opening hook, a paste-ready description, and ten tags.",
  `Return 1-10 paste-ready drafts as requested (resolved count: ${task.requestedCount}) and set mode to creator_asset_draft.`,
 ].join("\n")
 if (task.id === "daily_oracle") return "DAILY ORACLE TASK\nReturn one evidence-grounded priority, one quick win under two hours, and one measurable action for tomorrow."
 if (task.id === "first_week_plan") return "FIRST WEEK PLAN TASK\nReturn seven distinct daily actions grounded in this channel's niche, top videos, and gaps."
 if (task.id === "best_video_autopsy") return "BEST VIDEO AUTOPSY TASK\nName the strongest video, explain its title, hook, retention, and shareability signals, then give a same-payoff/different-angle replication plan."
 if (task.id === "channel_revival") return "CHANNEL REVIVAL TASK\nGive a channel-specific comeback plan, first publish choice, subscriber re-engagement, and a paste-ready two-to-three sentence opening hook."
 return ""
}
