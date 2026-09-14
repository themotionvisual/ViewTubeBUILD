import type { CommunityCampaign, CommunityCampaignAudit, CommunityCampaignPost } from "./communityCampaign"
import {
 COMMUNITY_CAMPAIGN_CRITIC_PROMPT,
 COMMUNITY_CAMPAIGN_STRATEGIST_PROMPT,
 COMMUNITY_POST_WRITER_PROMPT,
 COMMUNITY_VISUAL_DIRECTOR_PROMPT,
} from "./communityCampaign"

export interface CommunityCampaignAiTransport {
 generate<T>(input: {
  role: "strategist" | "writer" | "visual-director" | "critic"
  systemPrompt: string
  payload: unknown
  brainContext?: unknown
 }): Promise<T>
}

export interface CommunityCampaignOrchestrationOptions {
 brainContext?: unknown
 onProgress?: (event: CommunityCampaignProgress) => void
}

export interface CommunityCampaignProgress {
 phase: "strategy" | "writing" | "visuals" | "critique" | "revision" | "complete"
 completed: number
 total: number
 postId?: string
}

type StrategyResult = {
 title?: string
 posts: Array<Partial<CommunityCampaignPost> & { id: string }>
}

type WriterResult = Pick<CommunityCampaignPost, "content" | "cta" | "pollOptions"> & {
 correctAnswer?: string
 explanation?: string
}

type VisualResult = {
 imageBrief?: string
 imagePrompts?: string[]
}

type CriticResult = {
 audit: CommunityCampaignAudit
 revisions?: Array<{
  postId: string
  strategicPurpose?: string
  topic?: string
  content?: string
  cta?: string
  pollOptions?: string[]
  correctAnswer?: string
  explanation?: string
  imageBrief?: string
  imagePrompts?: string[]
 }>
}

const mergePost = (base: CommunityCampaignPost, patch?: Partial<CommunityCampaignPost>): CommunityCampaignPost => ({
 ...base,
 ...(patch || {}),
 id: base.id,
 day: base.day,
 date: base.date,
 suggestedTime: base.suggestedTime,
 type: base.type,
 goal: base.goal,
 targetVideoId: base.targetVideoId,
 targetVideoUrl: base.targetVideoUrl,
})

const emit = (
 options: CommunityCampaignOrchestrationOptions,
 phase: CommunityCampaignProgress["phase"],
 completed: number,
 total: number,
 postId?: string,
) => options.onProgress?.({ phase, completed, total, postId })

/**
 * Runs the deterministic campaign plan through ViewTube's existing AI transport.
 * The caller supplies an adapter backed by the canonical Gemini/Brain service; this
 * module deliberately does not create another model client, billing path or key store.
 */
export const orchestrateCommunityCampaign = async (
 planned: CommunityCampaign,
 ai: CommunityCampaignAiTransport,
 options: CommunityCampaignOrchestrationOptions = {},
): Promise<CommunityCampaign> => {
 const total = planned.posts.length
 emit(options, "strategy", 0, total)

 const strategy = await ai.generate<StrategyResult>({
  role: "strategist",
  systemPrompt: COMMUNITY_CAMPAIGN_STRATEGIST_PROMPT,
  brainContext: options.brainContext,
  payload: {
   campaign: planned,
   instruction: "Fill strategicPurpose and topic for every planned post. Preserve IDs, dates, types, video IDs and exact youtu.be URLs.",
  },
 })

 const strategyById = new Map(strategy.posts?.map((post) => [post.id, post]) || [])
 let posts = planned.posts.map((post) => mergePost(post, strategyById.get(post.id)))

 for (let index = 0; index < posts.length; index += 1) {
  const post = posts[index]
  emit(options, "writing", index, total, post.id)
  const written = await ai.generate<WriterResult>({
   role: "writer",
   systemPrompt: COMMUNITY_POST_WRITER_PROMPT,
   brainContext: options.brainContext,
   payload: {
    campaignTitle: strategy.title || planned.title,
    campaignGoal: planned.request.goal,
    style: planned.request.style,
    instructions: planned.request.instructions,
    post,
    adjacentPosts: posts.filter((_, candidateIndex) => Math.abs(candidateIndex - index) === 1),
   },
  })
  posts[index] = mergePost(post, { ...written, status: "generated" })
 }

 if (planned.request.generateVisuals) {
  for (let index = 0; index < posts.length; index += 1) {
   const post = posts[index]
   if (post.type !== "image" && post.type !== "image-poll") continue
   emit(options, "visuals", index, total, post.id)
   const visual = await ai.generate<VisualResult>({
    role: "visual-director",
    systemPrompt: COMMUNITY_VISUAL_DIRECTOR_PROMPT,
    brainContext: options.brainContext,
    payload: { campaignGoal: planned.request.goal, style: planned.request.style, post },
   })
   posts[index] = mergePost(post, visual)
  }
 }

 emit(options, "critique", total, total)
 const critique = await ai.generate<CriticResult>({
  role: "critic",
  systemPrompt: COMMUNITY_CAMPAIGN_CRITIC_PROMPT,
  brainContext: options.brainContext,
  payload: { campaign: { ...planned, title: strategy.title || planned.title, posts } },
 })

 if (critique.revisions?.length) {
  emit(options, "revision", 0, critique.revisions.length)
  const revisionsById = new Map(critique.revisions.map((revision) => [revision.postId, revision]))
  posts = posts.map((post) => {
   const revision = revisionsById.get(post.id)
   if (!revision) return post
   return mergePost(post, { ...revision, status: "generated" })
  })
 }

 const result: CommunityCampaign = {
  ...planned,
  title: strategy.title || planned.title,
  posts,
  audit: critique.audit,
 }
 emit(options, "complete", total, total)
 return result
}
