import type {
 BrainAudienceEvidenceActivity,
 BrainAudienceEvidenceComment,
 BrainAudienceEvidencePacket,
 BrainAudienceEvidenceVideoFormat,
 BrainAudienceEvidenceVideoTarget,
} from "../../types"

export type BrainAudienceEvidenceVideoInput = {
 id?: string | null
 videoId?: string | null
 title?: string | null
 publishedAt?: string | null
 durationSeconds?: number | null
 isShort?: boolean | null
 type?: string | null
 format?: string | null
 views?: number | null
 viewCount?: number | null
 statistics?: {
  viewCount?: string | number | null
 }
}

export type BrainAudienceEvidenceRequest = {
 channelId?: string | null
 videos: BrainAudienceEvidenceVideoInput[]
 now?: Date
 commentThreadsPerVideoCap?: number
 activityCap?: number
}

export type BrainAudienceEvidenceYouTubeClient = {
 requestYouTube: (path: string, params: Record<string, string | number | boolean>) => Promise<unknown>
}

const COMMENT_THREAD_CAP = 20
const ACTIVITY_CAP = 20

const clean = (value: unknown): string => String(value || "").replace(/\s+/g, " ").trim()

const toNumber = (value: unknown): number | null => {
 if (value === null || value === undefined || value === "") return null
 const parsed = Number(value)
 return Number.isFinite(parsed) ? parsed : null
}

const videoIdFor = (video: BrainAudienceEvidenceVideoInput): string =>
 clean(video.videoId || video.id || video.title)

const viewCountFor = (video: BrainAudienceEvidenceVideoInput): number | null =>
 toNumber(video.views ?? video.viewCount ?? video.statistics?.viewCount)

export const detectBrainAudienceVideoFormat = (
 video: BrainAudienceEvidenceVideoInput,
): BrainAudienceEvidenceVideoFormat => {
 if (video.isShort === true) return "short"
 if (video.isShort === false) return "long"
 const format = clean(video.format || video.type).toLowerCase()
 if (format.includes("short")) return "short"
 const duration = toNumber(video.durationSeconds)
 if (duration !== null && duration > 0) return duration <= 60 ? "short" : "long"
 if (format.includes("long")) return "long"
 return "unknown"
}

const isWithinDays = (publishedAt: string | null | undefined, days: number, now: Date): boolean => {
 const raw = clean(publishedAt)
 if (!raw) return false
 const timestamp = Date.parse(raw)
 if (!Number.isFinite(timestamp)) return false
 return now.getTime() - timestamp <= days * 24 * 60 * 60 * 1000
}

const mapTarget = (
 video: BrainAudienceEvidenceVideoInput,
 reason: BrainAudienceEvidenceVideoTarget["reason"],
): BrainAudienceEvidenceVideoTarget => ({
 videoId: videoIdFor(video),
 title: clean(video.title) || "Untitled video",
 format: detectBrainAudienceVideoFormat(video),
 reason,
 views: viewCountFor(video),
 publishedAt: clean(video.publishedAt) || null,
})

const topByViews = (
 videos: BrainAudienceEvidenceVideoInput[],
 format: BrainAudienceEvidenceVideoFormat,
 limit: number,
): BrainAudienceEvidenceVideoInput[] =>
 videos
  .filter((video) => detectBrainAudienceVideoFormat(video) === format)
  .sort((left, right) => (viewCountFor(right) || 0) - (viewCountFor(left) || 0))
  .slice(0, limit)

export const selectBrainAudienceEvidenceTargets = (
 videos: BrainAudienceEvidenceVideoInput[],
 now: Date = new Date(),
): BrainAudienceEvidenceVideoTarget[] => {
 const usable = videos.filter((video) => videoIdFor(video))
 const topLong = topByViews(usable, "long", 3).map((video) => mapTarget(video, "top_long"))
 const topShort = topByViews(usable, "short", 3).map((video) => mapTarget(video, "top_short"))
 const recentVideos = usable.filter((video) => isWithinDays(video.publishedAt, 90, now))
 const recentLong = topByViews(recentVideos, "long", 2).map((video) => mapTarget(video, "recent_top_long"))
 const recentShort = topByViews(recentVideos, "short", 2).map((video) => mapTarget(video, "recent_top_short"))
 const byId = new Map<string, BrainAudienceEvidenceVideoTarget>()
 ;[...topLong, ...topShort, ...recentLong, ...recentShort].forEach((target) => {
  if (!byId.has(target.videoId)) byId.set(target.videoId, target)
 })
 return Array.from(byId.values())
}

export const buildBrainAudienceEvidencePacket = (
 input: BrainAudienceEvidenceRequest & {
  comments?: BrainAudienceEvidenceComment[]
  activities?: BrainAudienceEvidenceActivity[]
 } = { videos: [] },
): BrainAudienceEvidencePacket => {
 const commentCap = input.commentThreadsPerVideoCap || COMMENT_THREAD_CAP
 const activityCap = input.activityCap || ACTIVITY_CAP
 const comments = (input.comments || []).slice(0, Math.max(commentCap * Math.max(1, input.videos.length), commentCap))
 const activities = (input.activities || []).slice(0, activityCap)
 const targets = selectBrainAudienceEvidenceTargets(input.videos, input.now)
 const repliesCollected = comments.reduce((sum, comment) => sum + comment.replies.length, 0)
 const missing: string[] = []
 if (!targets.length) missing.push("video_targets")
 if (!comments.length) missing.push("comments")
 if (!activities.length) missing.push("activities")
 return {
  id: `brain_audience_evidence_${Date.now()}`,
  channelId: input.channelId || null,
  createdAt: new Date().toISOString(),
  targets,
  comments,
  activities,
  coverage: {
   selectedVideos: targets.length,
   commentThreadsPerVideoCap: commentCap,
   activityCap,
   commentsCollected: comments.length,
   repliesCollected,
   activitiesCollected: activities.length,
   missing,
  },
 }
}

const normalizeCommentThread = (videoId: string, item: any): BrainAudienceEvidenceComment => {
 const snippet = item?.snippet?.topLevelComment?.snippet || item?.snippet || {}
 const replies = Array.isArray(item?.replies?.comments) ? item.replies.comments : []
 return {
  id: clean(item?.id) || `comment_${videoId}_${Math.random().toString(36).slice(2)}`,
  videoId,
  author: clean(snippet.authorDisplayName) || null,
  text: clean(snippet.textOriginal || snippet.textDisplay),
  likeCount: toNumber(snippet.likeCount),
  publishedAt: clean(snippet.publishedAt) || null,
  replyCount: toNumber(item?.snippet?.totalReplyCount),
  replies: replies.map((reply: any) => {
   const replySnippet = reply?.snippet || {}
   return {
    id: clean(reply?.id),
    author: clean(replySnippet.authorDisplayName) || null,
    text: clean(replySnippet.textOriginal || replySnippet.textDisplay),
    likeCount: toNumber(replySnippet.likeCount),
    publishedAt: clean(replySnippet.publishedAt) || null,
   }
  }),
 }
}

const normalizeActivity = (item: any): BrainAudienceEvidenceActivity => {
 const snippet = item?.snippet || {}
 return {
  id: clean(item?.id) || `activity_${Math.random().toString(36).slice(2)}`,
  type: clean(snippet.type || item?.kind) || "activity",
  title: clean(snippet.title),
  text: clean(snippet.description) || null,
  publishedAt: clean(snippet.publishedAt) || null,
 }
}

export const collectBrainAudienceEvidenceWithYouTube = async (
 input: BrainAudienceEvidenceRequest & BrainAudienceEvidenceYouTubeClient,
): Promise<BrainAudienceEvidencePacket> => {
 const targets = selectBrainAudienceEvidenceTargets(input.videos, input.now)
 const commentCap = input.commentThreadsPerVideoCap || COMMENT_THREAD_CAP
 const activityCap = input.activityCap || ACTIVITY_CAP
 const comments: BrainAudienceEvidenceComment[] = []
 for (const target of targets) {
  try {
   const response = await input.requestYouTube("commentThreads", {
    part: "snippet,replies",
    videoId: target.videoId,
    maxResults: commentCap,
    order: "relevance",
    textFormat: "plainText",
   })
   const items = Array.isArray((response as any)?.items) ? (response as any).items : []
   comments.push(...items.slice(0, commentCap).map((item: any) => normalizeCommentThread(target.videoId, item)))
  } catch {
   continue
  }
 }
 const activities: BrainAudienceEvidenceActivity[] = []
 if (input.channelId) {
  try {
   const response = await input.requestYouTube("activities", {
    part: "snippet,contentDetails",
    channelId: input.channelId,
    maxResults: activityCap,
   })
   const items = Array.isArray((response as any)?.items) ? (response as any).items : []
   activities.push(...items.slice(0, activityCap).map(normalizeActivity))
  } catch {
   // Best-effort read path only. Coverage is recorded internally.
  }
 }
 return buildBrainAudienceEvidencePacket({
  ...input,
  comments,
  activities,
  commentThreadsPerVideoCap: commentCap,
  activityCap,
 })
}
