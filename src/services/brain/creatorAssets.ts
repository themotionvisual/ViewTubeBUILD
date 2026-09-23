/**
 * Governed entry points for creator assets.
 *
 * This is what feature code calls. It hides the strategy/runner/evidence wiring so a widget
 * or controller does not have to know the generation architecture, and — more importantly —
 * so it cannot accidentally bypass it.
 *
 * Evidence assembly here is deliberately thin: it uses the channel context a caller already
 * holds. It is a placeholder for the Evidence Planner, which will resolve typed dataset
 * requests through `analytics-canon`. Passing through this seam now means that upgrade
 * changes one function rather than every call site.
 */

import {
 EMPTY_ASSET_EVIDENCE,
 generateAsset,
 type AssetEvidence,
 type AssetRecord,
} from "./AssetGenerator"
import { geminiAssetModelRunner } from "./assetModelRunner"
import {
 communityPostStrategy,
 communitySinglePostStrategy,
 type CommunityPostPlan,
 type CommunitySinglePost,
} from "./assetStrategies/communityPost"

export interface CreatorChannelContext {
 channelId: string
 channelName?: string
 recentVideoTitles?: string[]
 subscriberCount?: number
}

/**
 * Build evidence from the caller's channel context.
 *
 * `payload` is what numeric claims are checked against, so only facts that genuinely came
 * from the channel belong in it. Anything the caller could not supply is listed in
 * `missing`, which reaches the prompt so the model can name the gap instead of inventing
 * around it.
 */
export const buildChannelAssetEvidence = (
 context: CreatorChannelContext,
 requested: string[],
): AssetEvidence => {
 const titles = (context.recentVideoTitles || []).filter(Boolean).slice(0, 8)
 const payload: Record<string, unknown> = {
  channel: {
   ...(context.channelName ? { label: context.channelName } : {}),
   ...(typeof context.subscriberCount === "number" ? { subscribers: context.subscriberCount } : {}),
  },
  recentVideoTitles: titles,
 }

 const summary = [
  context.channelName ? `Channel: ${context.channelName}` : "",
  typeof context.subscriberCount === "number"
   ? `Subscribers: ${context.subscriberCount.toLocaleString()}`
   : "",
  titles.length ? `Recent videos:\n${titles.map((title) => `- ${title}`).join("\n")}` : "",
 ].filter(Boolean).join("\n")

 const provided = new Set<string>()
 if (context.channelName || typeof context.subscriberCount === "number") provided.add("channel_profile")
 if (titles.length) provided.add("top_videos")

 return {
  requested,
  refs: titles.length ? [`context:recent_videos:${titles.length}`] : [],
  missing: requested.filter((entry) => !provided.has(entry)),
  payload,
  summary,
 }
}

export interface CommunityPostDraftResult {
 /** The post copy, ready for the creator to review and edit. */
 body: string
 pollOptions?: string[]
 record: AssetRecord<CommunitySinglePost>
}

/**
 * Draft one community post under the full contract set.
 *
 * Replaces a bare `refineCommunityPost` call that returned an unchecked string. The creator
 * still receives the draft even when a gate fails — they are the review step for a post they
 * have not published — but the failure is now recorded on the asset and its trace instead of
 * being invisible.
 */
export const generateCommunityPostDraft = async (input: {
 context: CreatorChannelContext
 /** What the creator typed, or the existing draft when refining. */
 instruction: string
 postType?: string
 /** Format, linked video and poll context the caller already renders. */
 mediaContext?: string
 mediaAttachments?: string[]
 projectId?: string
}): Promise<CommunityPostDraftResult> => {
 const evidence = buildChannelAssetEvidence(
  input.context,
  communitySinglePostStrategy.evidenceClasses,
 )

 const result = await generateAsset<CommunitySinglePost>({
  request: {
   channelId: input.context.channelId,
   assetType: "community_post",
   instruction: input.instruction,
   ...(input.projectId ? { projectId: input.projectId } : {}),
   inputs: {
    postType: input.postType || "text",
    ...(input.mediaContext ? { mediaContext: input.mediaContext } : {}),
   },
  },
  strategy: communitySinglePostStrategy,
  evidence,
  runner: geminiAssetModelRunner,
  ...(input.mediaAttachments?.length
   ? { mediaAttachments: input.mediaAttachments }
   : {}),
 })

 if (result.record.status === "failed") {
  throw new Error("ViewTube could not generate this post. Try again.")
 }

 return {
  body: result.record.output?.body || "",
  ...(result.record.output?.pollOptions ? { pollOptions: result.record.output.pollOptions } : {}),
  record: result.record,
 }
}

/** Draft a multi-day community plan. */
export const generateCommunityPostPlan = async (input: {
 context: CreatorChannelContext
 instruction: string
 days?: number
 schedule?: string
 projectId?: string
}): Promise<AssetRecord<CommunityPostPlan>> => {
 const evidence = buildChannelAssetEvidence(
  input.context,
  communityPostStrategy.evidenceClasses,
 ) || EMPTY_ASSET_EVIDENCE

 const result = await generateAsset<CommunityPostPlan>({
  request: {
   channelId: input.context.channelId,
   assetType: "community_post",
   instruction: input.instruction,
   ...(input.projectId ? { projectId: input.projectId } : {}),
   inputs: {
    ...(input.days ? { days: input.days } : {}),
    ...(input.schedule ? { schedule: input.schedule } : {}),
   },
  },
  strategy: communityPostStrategy,
  evidence,
  runner: geminiAssetModelRunner,
 })

 return result.record
}
