// Community Post Studio — Gemini prompt builder.
//
// Produces the single system prompt sent to Gemini for generating a batch
// of publish-ready community posts. Compiles Brain context, recent
// engagement data, and best/worst posting windows into the strict JSON
// output schema documented in the widget spec (Appendix A).

import type { CommunityPostType } from "./postStore"
import type { PostWindow } from "./bestTimeEngine"
import { formatWindow } from "./bestTimeEngine"

export type PostPromptContext = {
  channelName: string
  channelHandle: string
  identityCompression?: string
  contentDnaCompression?: string
  voice?: string
  niche?: string
  styleTokens?: string
  topPosts?: Array<{ text: string; likes?: number; replies?: number }>
  topVideos?: Array<{ id: string; title: string; ctr?: number; avd?: number; views?: number }>
  recentVideos?: Array<{ id: string; title: string; publishedAt?: string }>
  bestWindows?: PostWindow[]
  worstWindows?: PostWindow[]
}

export type PostPromptRequest = {
  postType: CommunityPostType | "schedule_week" | "schedule_month"
  count: number
  primingFor?: { videoId?: string; scheduledAt?: number; concept?: string }
}

const listBullets = (items: string[] | undefined, fallback = "(none)") =>
  items && items.length ? items.map((s) => `  - ${s}`).join("\n") : `  ${fallback}`

export const buildCommunityPostPrompt = (
  ctx: PostPromptContext,
  req: PostPromptRequest,
): string => {
  const isSchedule = req.postType === "schedule_week" || req.postType === "schedule_month"
  const window = req.postType === "schedule_week" ? "7 days" : req.postType === "schedule_month" ? "30 days" : ""

  const topPostsMd = ctx.topPosts?.length
    ? ctx.topPosts.map((p, i) => `${i + 1}. "${p.text.slice(0, 140)}" — likes:${p.likes ?? "?"} replies:${p.replies ?? "?"}`).join("\n")
    : "(no post history available)"
  const topVideosMd = ctx.topVideos?.length
    ? ctx.topVideos.map((v, i) => `${i + 1}. "${v.title}" — ctr:${v.ctr ?? "?"} avd:${v.avd ?? "?"} views:${v.views ?? "?"}`).join("\n")
    : "(no video ranking available)"
  const recentVideoList = ctx.recentVideos?.length
    ? ctx.recentVideos.map((v) => `  - ${v.id} · "${v.title}"`).join("\n")
    : "  (none)"
  const bestWinList = ctx.bestWindows?.length
    ? ctx.bestWindows.map(formatWindow).join(", ")
    : "(unknown)"
  const worstWinList = ctx.worstWindows?.length
    ? ctx.worstWindows.map(formatWindow).join(", ")
    : "(unknown)"

  const primingBlock = req.primingFor ? `\n===== ALGO-PRIMING MODE =====\nTarget video id: ${req.primingFor.videoId || "(new concept)"}\nConcept: ${req.primingFor.concept || "n/a"}\nLaunch time: ${req.primingFor.scheduledAt ? new Date(req.primingFor.scheduledAt).toISOString() : "n/a"}\nGenerate a pre-launch funnel: teaser 48h before launch, alignment poll 24h before, recap 2h after.\n` : ""

  const typeHint = isSchedule
    ? `Generate a mixed batch of text, image, poll, and video posts spread across ${window}.`
    : `Generate ${req.count} posts of type "${req.postType}".`

  return `SYSTEM
You are the Community Post Studio for ${ctx.channelName || "the creator"} (@${ctx.channelHandle || "handle"}).
${typeHint}

Every post must be:
- In this creator's exact voice (below).
- Grounded in their channel data (below).
- Optimized for the community-post algorithm: high early-engagement
  potential, clear ask, ≤ 500 chars text (280 preferred), 1 hook, 1 payoff.

===== VOICE & IDENTITY =====
${ctx.identityCompression || "(brain identity compression pending — write in a warm, direct, no-jargon voice)"}

===== CONTENT DNA =====
${ctx.contentDnaCompression || "(brain content-DNA compression pending)"}

===== TOP POSTS (recent 90 days) =====
${topPostsMd}

===== TOP VIDEOS BY CTR × AVD =====
${topVideosMd}

===== BEST DAY/HOUR WINDOWS =====
Best:  ${bestWinList}
Worst: ${worstWinList}

===== RECENT VIDEOS AVAILABLE FOR VIDEO POSTS =====
${recentVideoList}

===== STYLE TOKENS FOR IMAGE PROMPTS =====
${ctx.styleTokens || "high-contrast, neo-brutalist, 9:16, no text overlays"}
${primingBlock}
===== SCORING RUBRIC =====
Score each generated post 0-100 on:
  hook_strength (0-30) · voice_match (0-25) · specificity (0-20)
  · call_to_action (0-15) · brevity (0-10)
Return score + one-line reason.

===== OUTPUT FORMAT (strict JSON, no prose before or after) =====
{
  "posts": [
    {
      "type": "text|image|image_collection|poll|video",
      "text": "string, ≤ 500 chars",
      "poll_options": ["…", "…", "…"] or null,
      "image_directive": "self-contained image-gen prompt or null",
      "attached_video_id": "one of the recent video ids above or null",
      "suggested_publish_at": "ISO 8601 or day+hour string (e.g. Tue 6pm)",
      "priming_context": "standalone | pre_launch | post_launch",
      "score": { "total": 0-100, "reason": "one line" }
    }
  ],
  "batch_notes": "one line on shared strategy across the batch"
}

CONSTRAINTS:
- Poll options: 3–4, each ≤ 25 chars, mutually exclusive.
- Image directive: 9:16 or 1:1 aspect, no text overlays.
- Video pick: only from the recent-videos list above.
- Schedules: ≥ 18h between posts, ≤ 4 posts per calendar day. Never place
  a post in a "worst" window.
- Never invent metrics, tags, or people outside the context above.`
}
