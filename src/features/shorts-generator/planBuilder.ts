// Shorts Generator — shot-list planner.
//
// P1: build the Gemini shot-list prompt and expose a stub `planShorts`
// that returns a plausible 3-shot plan derived from the concept string.
// P2: wire the real Gemini call + a `generateClip(veo_prompt)` bridge.

export type ShortShot = {
  shot: number
  purpose: "hook" | "reveal" | "proof" | "payoff" | "cta"
  duration_sec: number
  veo_prompt: string
  motion: "static" | "slow-push" | "whip-pan" | "orbit" | "reveal-cut"
  aspect: "9:16"
  on_screen_text?: string
}

export type PlanContext = {
  channelName: string
  niche?: string
  styleTokens?: string
  voice?: string
  conceptText: string
  topReferences?: string[]   // titles of top-performing recent videos
}

export const buildShortsPlanPrompt = (ctx: PlanContext): string => `SYSTEM
You are a Shorts director for ${ctx.channelName || "the creator"}.
Channel niche: ${ctx.niche || "(unspecified)"}.
Visual style: ${ctx.styleTokens || "high-contrast, cinematic, 9:16"}.
Voice: ${ctx.voice || "warm, direct, curious"}.
Source concept: ${ctx.conceptText}.
Reference top performers: ${ctx.topReferences?.slice(0, 3).join(" · ") || "(none)"}.

Return a 3–5 shot plan as JSON:
[{ "shot": 1, "purpose": "hook|reveal|proof|payoff|cta",
   "duration_sec": 1-8, "veo_prompt": "…",
   "motion": "static|slow-push|whip-pan|orbit|reveal-cut",
   "aspect": "9:16", "on_screen_text": "…" }]

CONSTRAINTS:
- Total ≤ 60s.
- Shot 1 ≤ 2s and must contain a pattern interrupt.
- Every veo_prompt is self-contained (Veo has no cross-shot memory).
- One on_screen_text suggestion per shot, ≤ 6 words.`

export const planShortsStub = (ctx: PlanContext): ShortShot[] => {
  const c = ctx.conceptText.trim() || "a compelling moment"
  return [
    { shot: 1, purpose: "hook",   duration_sec: 2, motion: "whip-pan",    aspect: "9:16",
      veo_prompt: `Fast pattern-interrupt: extreme close-up establishing "${c}", high-contrast lighting, film grain, 9:16.`,
      on_screen_text: "Wait — watch this" },
    { shot: 2, purpose: "reveal", duration_sec: 3, motion: "slow-push",   aspect: "9:16",
      veo_prompt: `Slow push into the subject of "${c}", cinematic depth of field, soft rim light, 9:16.`,
      on_screen_text: "Here's the thing" },
    { shot: 3, purpose: "proof",  duration_sec: 3, motion: "orbit",       aspect: "9:16",
      veo_prompt: `Orbiting POV showing supporting detail of "${c}" from multiple angles, subtle motion blur, 9:16.`,
      on_screen_text: "Proof" },
    { shot: 4, purpose: "payoff", duration_sec: 3, motion: "reveal-cut",  aspect: "9:16",
      veo_prompt: `Hard-cut reveal that resolves "${c}" with a satisfying beat, 9:16.`,
      on_screen_text: "That's why it matters" },
    { shot: 5, purpose: "cta",    duration_sec: 2, motion: "static",      aspect: "9:16",
      veo_prompt: `Static hero frame with room for on-screen text overlay, minimalist background, 9:16.`,
      on_screen_text: "Follow for more" },
  ]
}
