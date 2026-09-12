import type { CommunityPostType } from "./types"

export type CommunityCampaignGoal =
 | "community-interaction"
 | "video-traffic"
 | "engagement"
 | "upload-priming"
 | "niche-establishing"
 | "audience-research"
 | "returning-viewers"
 | "subscriber-conversion"
 | "custom"

export type CommunityCampaignPostType = CommunityPostType | "quiz"

export interface CommunityCampaignRequest {
 postCount: number
 startDate: string
 timezone: string
 goal: CommunityCampaignGoal
 customGoal?: string
 allowedTypes: CommunityCampaignPostType[]
 selectedVideoIds: string[]
 style: string
 instructions?: string
 generateVisuals: boolean
}

export interface CommunityCampaignPost {
 id: string
 day: number
 date: string
 suggestedTime: string
 type: CommunityCampaignPostType
 goal: CommunityCampaignGoal
 strategicPurpose: string
 topic: string
 content: string
 cta: string
 pollOptions: string[]
 correctAnswer?: string
 explanation?: string
 targetVideoId?: string
 targetVideoUrl?: string
 imageBrief?: string
 imagePrompts: string[]
 status: "planned" | "generated" | "approved" | "needs-review"
}

export interface CommunityCampaign {
 version: 1
 id: string
 title: string
 createdAt: string
 request: CommunityCampaignRequest
 posts: CommunityCampaignPost[]
 audit?: CommunityCampaignAudit
}

export interface CommunityCampaignAudit {
 goalAlignment: number
 postDiversity: number
 topicCoherence: number
 audienceValue: number
 interactionPotential: number
 videoIntegration: number
 visualVariety: number
 scheduleLogic: number
 voiceConsistency: number
 repetitionRisk: number
 notes: string[]
}

export const COMMUNITY_CAMPAIGN_MIN_POSTS = 3
export const COMMUNITY_CAMPAIGN_MAX_POSTS = 30

export const normalizeCommunityCampaignPostCount = (value: number) =>
 Math.max(COMMUNITY_CAMPAIGN_MIN_POSTS, Math.min(COMMUNITY_CAMPAIGN_MAX_POSTS, Math.round(value || COMMUNITY_CAMPAIGN_MIN_POSTS)))

const DEFAULT_ROTATION: CommunityCampaignPostType[] = ["poll", "image", "video", "text", "image-poll", "quiz"]

export const planCommunityCampaign = (request: CommunityCampaignRequest): CommunityCampaign => {
 const count = normalizeCommunityCampaignPostCount(request.postCount)
 const allowed = request.allowedTypes.length ? request.allowedTypes : DEFAULT_ROTATION
 const start = new Date(`${request.startDate}T12:00:00`)
 const times = ["18:30", "19:00", "17:45", "19:15", "18:00", "20:00"]
 const now = new Date().toISOString()
 const posts: CommunityCampaignPost[] = Array.from({ length: count }, (_, index) => {
  const date = new Date(start)
  date.setDate(start.getDate() + index)
  const type = allowed[index % allowed.length]
  const targetVideoId = request.selectedVideoIds.length ? request.selectedVideoIds[index % request.selectedVideoIds.length] : undefined
  return {
   id: `community-${index + 1}-${date.toISOString().slice(0, 10)}`,
   day: index + 1,
   date: date.toISOString().slice(0, 10),
   suggestedTime: times[index % times.length],
   type,
   goal: request.goal,
   strategicPurpose: "Pending AI campaign strategy",
   topic: "Pending campaign topic",
   content: "",
   cta: "",
   pollOptions: [],
   targetVideoId,
   targetVideoUrl: targetVideoId ? `https://youtu.be/${targetVideoId}` : undefined,
   imagePrompts: [],
   status: "planned",
  }
 })
 return { version: 1, id: `community-campaign-${Date.now()}`, title: `${count}-Post Community Campaign`, createdAt: now, request: { ...request, postCount: count }, posts }
}

export const COMMUNITY_CAMPAIGN_STRATEGIST_PROMPT = `You are ViewTube's YouTube Community Campaign Strategist. Design one cohesive multi-day campaign, not isolated posts. Every post needs a distinct strategic job. Rotate formats when useful; avoid duplicate hooks, questions, CTAs and repeatedly promoting the same video. Use TEXT, IMAGE, POLL, IMAGE_POLL, VIDEO and QUIZ where allowed. For video posts, include the exact https://youtu.be/VIDEO_ID link. Treat timing as suggested unless channel evidence supports it. Never claim Community posts directly manipulate YouTube recommendations. Return structured JSON matching the supplied campaign schema.`

export const COMMUNITY_POST_WRITER_PROMPT = `You are ViewTube's Community Post Writer. Write specifically for the planned post type and campaign goal. Prioritize clarity, specificity, curiosity, natural creator voice, low-friction interaction and topic relevance. Avoid generic engagement bait, repeated CTAs, fake urgency, unsupported claims, algorithm myths, hashtag stuffing and AI-sounding filler. Video posts must give viewers a reason to care and include the supplied youtu.be URL. Polls need 2-4 meaningfully different choices. Quizzes need one correct answer, plausible alternatives and a useful explanation.`

export const COMMUNITY_VISUAL_DIRECTOR_PROMPT = `You are ViewTube's Community Post Visual Director. Create production-ready image briefs optimized for a mobile feed and preferably square 1:1 composition. The visual must support the strategic purpose, remain distinct from adjacent campaign posts and preserve channel identity. Avoid unnecessary rendered typography. Image-poll choices must share one coherent visual system while remaining immediately distinguishable.`

export const COMMUNITY_CAMPAIGN_CRITIC_PROMPT = `You are ViewTube's Community Campaign Critic. Score Goal Alignment, Post Diversity, Topic Coherence, Audience Value, Interaction Potential, Video Integration, Visual Variety, Schedule Logic, Voice Consistency and Repetition Risk from 0-100. Detect duplicate hooks, questions, CTAs, over-promoted videos, weak posts, irrelevant polls, visual repetition, unsupported algorithm claims and timing conflicts. Rewrite only weak strategic briefs; preserve strong work. Any post below 75 requires revision.`
