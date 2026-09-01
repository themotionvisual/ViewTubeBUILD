// Community Post Studio — real Gemini call.
//
// Uses the shared gemini client (services/gemini.ts) so key vaulting,
// quota, retries, and billing entitlement all go through the same pipe
// as every other AI call in the app. Returns validated posts ready for
// the store, or throws with a caveman message on failure.

import { Type } from "@google/genai"
import { getAiClient, executeWithRetry, cleanJsonString, getActiveModel, isGeminiConfigured } from "../../services/gemini"
import { buildCommunityPostPrompt, type PostPromptContext, type PostPromptRequest } from "./aiPromptBuilder"
import { newDraft, type CommunityPostDraft, type CommunityPostType } from "./postStore"

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          text: { type: Type.STRING },
          poll_options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
          image_directive: { type: Type.STRING, nullable: true },
          attached_video_id: { type: Type.STRING, nullable: true },
          suggested_publish_at: { type: Type.STRING, nullable: true },
          priming_context: { type: Type.STRING, nullable: true },
          score: {
            type: Type.OBJECT,
            properties: {
              total:  { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
          },
        },
        required: ["type", "text"],
      },
    },
    batch_notes: { type: Type.STRING, nullable: true },
  },
  required: ["posts"],
}

type RawPost = {
  type: string
  text: string
  poll_options?: string[] | null
  image_directive?: string | null
  attached_video_id?: string | null
  suggested_publish_at?: string | null
  priming_context?: string | null
  score?: { total?: number; reason?: string }
}

const coerceType = (t: string, fallback: CommunityPostType): CommunityPostType => {
  const v = String(t || "").toLowerCase().trim()
  if (v === "text" || v === "image" || v === "image_collection" || v === "poll" || v === "video") return v
  return fallback
}

const parseSuggested = (raw?: string | null): number | undefined => {
  if (!raw) return undefined
  const iso = Date.parse(raw)
  if (Number.isFinite(iso)) return iso
  return undefined
}

export type GenerateResult = {
  posts: CommunityPostDraft[]
  batchNotes?: string
}

export const generateCommunityPostsWithGemini = async (
  ctx: PostPromptContext,
  req: PostPromptRequest,
): Promise<GenerateResult> => {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini key missing. Add one in Settings, then try again.")
  }
  const prompt = buildCommunityPostPrompt(ctx, req)
  const model = getActiveModel("thinking")

  const parsed = await executeWithRetry(async () => {
    const result = await getAiClient({ usageCategory: "assets" }).models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      },
    })
    const text = (result as any).text || ""
    if (!text) throw new Error("Gemini returned an empty response.")
    return JSON.parse(cleanJsonString(text))
  })

  const fallbackType: CommunityPostType = (req.postType === "schedule_week" || req.postType === "schedule_month") ? "text" : req.postType
  const posts = (parsed.posts as RawPost[] | undefined || []).map((raw): CommunityPostDraft => {
    const type = coerceType(raw.type, fallbackType)
    const base = newDraft(type)
    return {
      ...base,
      text: String(raw.text || "").slice(0, 500),
      pollOptions: Array.isArray(raw.poll_options) ? raw.poll_options.filter(Boolean).slice(0, 4) : (type === "poll" ? ["", ""] : undefined),
      attachedVideoId: raw.attached_video_id || undefined,
      scheduledAt: parseSuggested(raw.suggested_publish_at || undefined),
      aiMeta: {
        generation: model,
        scoreForecast: typeof raw.score?.total === "number" ? Math.round(raw.score.total) : undefined,
        reason: raw.score?.reason || undefined,
        primingFor: raw.priming_context || undefined,
      },
    }
  })
  return { posts, batchNotes: parsed.batch_notes }
}
