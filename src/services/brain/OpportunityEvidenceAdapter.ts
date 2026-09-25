import type { AIBrainEvidencePack, AIBrainEvidenceVideo } from "../../types"
import type { OpportunityEvidence } from "./OpportunityIntelligence"

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

const ageDays = (publishedAt: string | null, now: Date): number => {
 const timestamp = publishedAt ? new Date(publishedAt).getTime() : Number.NaN
 if (!Number.isFinite(timestamp)) return 365
 return Math.max(0, (now.getTime() - timestamp) / 86_400_000)
}

const metricCoverage = (video: AIBrainEvidenceVideo): number => {
 const values = [
  video.metrics.views,
  video.metrics.watchTime,
  video.metrics.averagePercentageViewed,
  video.metrics.subscribers,
  video.metrics.ctr,
 ]
 return values.filter((value) => typeof value === "number" && Number.isFinite(value)).length / values.length
}

/**
 * Converts the canonical Brain evidence pack into deterministic Opportunity
 * Intelligence evidence. It does not infer external demand or create another
 * analytics store: every output retains the source evidence ID.
 */
export const buildOpportunityEvidenceFromBrainPack = (input: {
 channelId: string
 evidencePack: AIBrainEvidencePack
 now?: Date
 limit?: number
}): OpportunityEvidence[] => {
 if (
  input.evidencePack.dataStatus === "missing" ||
  (input.evidencePack.channelId && input.evidencePack.channelId !== input.channelId)
 ) return []

 const now = input.now || new Date()
 const unique = new Map<string, AIBrainEvidenceVideo>()
 for (const video of [...input.evidencePack.topVideos, ...input.evidencePack.recentVideos]) {
  if (!unique.has(video.id)) unique.set(video.id, video)
 }
 const videos = [...unique.values()]
 if (!videos.length) return []

 const maxViews = Math.max(1, ...videos.map((video) =>
  typeof video.metrics.views === "number" && Number.isFinite(video.metrics.views) ? video.metrics.views : 0,
 ))

 return videos
  .map((video): OpportunityEvidence & { _score: number } => {
   const views = typeof video.metrics.views === "number" && Number.isFinite(video.metrics.views)
    ? video.metrics.views
    : 0
   const performance = clamp(views / maxViews, 0, 1)
   const recency = clamp(1 - Math.min(ageDays(video.publishedAt, now), 365) / 365, 0, 1)
   const coverage = metricCoverage(video)
   const score = performance * 0.6 + recency * 0.25 + coverage * 0.15

   return {
    id: `brain-catalog:${video.id}`,
    kind: "catalog_gap",
    channelId: input.channelId,
    videoId: video.id,
    entity: video.title,
    metric: "views",
    currentValue: views,
    baselineValue: null,
    relativeDelta: null,
    confidence: Math.round(clamp(50 + coverage * 50)),
    impactScore: Math.round(clamp(score * 100)),
    evidenceIds: [video.evidenceId],
    _score: score,
   }
  })
  .sort((left, right) => right._score - left._score)
  .slice(0, input.limit ?? 8)
  .map(({ _score: _ignored, ...opportunity }) => opportunity)
}
