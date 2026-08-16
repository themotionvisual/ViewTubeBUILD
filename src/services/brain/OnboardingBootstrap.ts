import type {
  BrainConfidenceLevel,
  BrainEvidenceItem,
  BrainGenerationRecord,
  BrainOnboardingBootstrapRun,
  BrainQuestion,
  BrainQuestionSet,
  ChannelEvidencePacket,
  ChannelKnowledgeHypothesis,
  ChannelKnowledgeModel,
  ToolContextPack,
} from "../../types"
import { readYouTubeAnalyticsCache } from "../analytics/DataStore"
import { scoreVideoPerformance } from "./videoPerformanceScore"
import {
 applyVtSyncPrivacyFilters,
 filterVtSyncVideos,
 getVtSyncSnapshot,
 type VtSyncSnapshot,
 type VtSyncVideoItem,
} from "../../features/vt-sync-local"
import { getBrainMemory, saveBrainMemory } from "./Core"
import { buildBrainAudienceEvidencePacket } from "./AudienceEvidenceCollector"
import * as db from "./Persistence"

const PROMPT_VERSION = "brain-onboarding-bootstrap-v2"
const GUARD_PREFIX = "vt_brain_onboarding_bootstrap"
const SNAPSHOT_EVENT = "vt_brain_onboarding_bootstrap_completed"

type OnboardingVideo = Record<string, any> & {
  videoId: string
  title: string
  description?: string
  tags?: string[]
  categoryName?: string
  format?: string
  publishedAt?: string
  thumbnailUrl?: string
  metrics?: Record<string, unknown>
}

type OnboardingSourceBundle = {
  cache: Record<string, any>
  vtSyncSnapshot: VtSyncSnapshot
  channelId: string | null
  sourceSnapshotId: string | null
  videos: OnboardingVideo[]
  evidenceFingerprint: string
}

export interface BrainOnboardingSnapshot {
  run: BrainOnboardingBootstrapRun | null
  evidencePacket: ChannelEvidencePacket | null
  knowledgeModel: ChannelKnowledgeModel | null
  questionSet: BrainQuestionSet | null
  toolContextPack: ToolContextPack | null
}

const activeRuns = new Map<string, Promise<BrainOnboardingSnapshot>>()

const nowIso = () => new Date().toISOString()

const makeId = (prefix: string): string => {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}_${random}`
}

const cleanText = (value: unknown): string => String(value || "").replace(/\s+/g, " ").trim()

const toNumber = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const firstThreeSentences = (value: unknown): string => {
  const text = cleanText(value)
  if (!text) return ""
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]
  return sentences.slice(0, 3).join(" ").trim()
}

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return []
  return tags.map(cleanText).filter(Boolean).slice(0, 24)
}

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "all",
  "and",
  "are",
  "best",
  "but",
  "can",
  "day",
  "does",
  "for",
  "from",
  "get",
  "how",
  "into",
  "its",
  "just",
  "make",
  "more",
  "new",
  "not",
  "now",
  "our",
  "out",
  "part",
  "that",
  "the",
  "this",
  "to",
  "top",
  "use",
  "using",
  "video",
  "videos",
  "what",
  "when",
  "why",
  "with",
  "you",
  "your",
])

const tokenize = (value: unknown): string[] =>
  cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9# ]+/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^#+/, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token))

const toOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(String(value).replace(/[$,% ,]/g, ""))
  return Number.isFinite(parsed) ? parsed : null
}

const unwrapMetricValue = (value: unknown): number | null => {
  if (value && typeof value === "object" && "value" in value) {
    return toOptionalNumber((value as { value?: unknown }).value)
  }
  return toOptionalNumber(value)
}

const metricAliases: Record<string, string[]> = {
  views: ["views", "viewCount", "estimatedViews"],
  watchTime: ["watchTime", "watchTimeHours", "watch_time", "estimatedMinutesWatched"],
  revenue: ["revenue", "estimatedRevenue", "estimated_revenue"],
  subscribers: ["subscribers", "subscribersGained", "netSubscribers"],
  ctr: ["ctr", "impressionClickThroughRate", "impressionsClickThroughRate"],
  retention: ["averagePercentageViewed", "avgPercentageViewed", "retention"],
}

const readMetric = (video: Record<string, any>, metric: keyof typeof metricAliases): number | null => {
  const aliases = metricAliases[metric]
  const containers = [
    video,
    video.metrics,
    video.dataApiStats,
    video.metricsByWindow?.lifetime,
    video.metricsByWindow?.["365d"],
    video.metricsByWindow?.["90d"],
    video.metricsByWindow?.["28d"],
  ].filter(Boolean)

  for (const container of containers) {
    for (const alias of aliases) {
      const value = unwrapMetricValue((container as Record<string, unknown>)[alias])
      if (value !== null) return value
    }
  }
  return null
}

const performanceScore = (video: Record<string, any>): number => {
  return scoreVideoPerformance({
    views: readMetric(video, "views") || 0,
    watchTime: readMetric(video, "watchTime") || 0,
    subscribers: readMetric(video, "subscribers") || 0,
    revenue: readMetric(video, "revenue") || 0,
    ctr: readMetric(video, "ctr") || 0,
    retention: readMetric(video, "retention") || 0,
    publishedAt: video.publishedAt,
  })
}

const vtSyncVideoToOnboardingVideo = (video: VtSyncVideoItem): OnboardingVideo => ({
  ...video,
  videoId: cleanText(video.id),
  title: cleanText(video.title),
  description: cleanText(video.descriptionSnippet),
  tags: normalizeTags(video.tags),
  categoryName: cleanText(video.category),
  format: cleanText(video.format),
  publishedAt: cleanText(video.publishedAt),
  thumbnailUrl: cleanText(video.thumbnail),
  viewCount: video.metrics?.views,
  metrics: video.metrics || {},
})

const cacheVideoToOnboardingVideo = (video: Record<string, any>, index: number): OnboardingVideo => ({
  ...video,
  videoId: cleanText(video.videoId || video.id) || `video-${index}`,
  title: cleanText(video.title),
  description: cleanText(video.description || video.descriptionSnippet),
  tags: normalizeTags(video.tags),
  categoryName: cleanText(video.categoryName || video.category || video.categoryId),
  format: cleanText(video.format || video.creatorContentType || video.contentType || (video.isShort ? "short" : "")),
  publishedAt: cleanText(video.publishedAt || video.uploadDate),
  thumbnailUrl: cleanText(video.thumbnailUrl || video.thumbnail),
})

const mergeVideos = (
  cacheVideos: Record<string, any>[],
  vtSyncVideos: VtSyncVideoItem[],
): OnboardingVideo[] => {
  const byId = new Map<string, OnboardingVideo>()
  cacheVideos.forEach((video, index) => {
    const normalized = cacheVideoToOnboardingVideo(video, index)
    byId.set(normalized.videoId, normalized)
  })
  vtSyncVideos.forEach((video, index) => {
    const normalized = vtSyncVideoToOnboardingVideo(video)
    const existing = byId.get(normalized.videoId)
    byId.set(normalized.videoId, {
      ...(existing || {}),
      ...normalized,
      description: normalized.description || existing?.description,
      tags: normalized.tags?.length ? normalized.tags : existing?.tags,
      metrics: {
        ...(existing?.metrics || {}),
        ...(normalized.metrics || {}),
      },
      videoId: normalized.videoId || existing?.videoId || `vt-video-${index}`,
      title: normalized.title || existing?.title || "",
    })
  })
  return Array.from(byId.values()).filter((video) => video.videoId || video.title)
}

const confidenceFromCount = (
  count: number,
  highAt: number,
  mediumAt = 1,
): BrainConfidenceLevel => {
  if (count >= highAt) return "high"
  if (count >= mediumAt) return "medium"
  return "low"
}

const pickChannelId = (cache: Record<string, any>, vtSyncSnapshot?: VtSyncSnapshot): string | null => {
  const profile = cache.profile || cache.channelBaseline || {}
  return (
    cleanText(profile.id) ||
    cleanText(profile.channelId) ||
    cleanText(cache.channelId) ||
    cleanText(vtSyncSnapshot?.channelCustomUrl) ||
    null
  )
}

const latestPublishedAt = (videos: OnboardingVideo[]): string =>
  videos
    .map((video) => cleanText(video.publishedAt || video.uploadDate))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0] || ""

const metadataCoverage = (videos: OnboardingVideo[]) => ({
  titles: videos.filter((video) => cleanText(video.title)).length,
  descriptions: videos.filter((video) => firstThreeSentences(video.description)).length,
  tags: videos.reduce((total, video) => total + normalizeTags(video.tags).length, 0),
  metrics: videos.filter((video) =>
    readMetric(video, "views") !== null ||
    readMetric(video, "watchTime") !== null ||
    readMetric(video, "subscribers") !== null ||
    readMetric(video, "revenue") !== null
  ).length,
  thumbnails: videos.filter((video) => cleanText(video.thumbnailUrl || video.thumbnail)).length,
})

const buildSourceBundle = (
  cache: Record<string, any>,
  vtSyncSnapshot: VtSyncSnapshot = getVtSyncSnapshot(),
): OnboardingSourceBundle => {
  const filteredSnapshot = applyVtSyncPrivacyFilters(vtSyncSnapshot)
  const videos = filterVtSyncVideos(mergeVideos(
    Array.isArray(cache.videos) ? cache.videos : [],
    Array.isArray(filteredSnapshot.videos) ? filteredSnapshot.videos : [],
  )) as OnboardingVideo[]
  const channelId = pickChannelId(cache, filteredSnapshot)
  const sourceSnapshotId =
    cleanText(filteredSnapshot.syncManifest?.run_id) ||
    cleanText(filteredSnapshot.snapshotId) ||
    cleanText(cache.canonicalLastSyncedAt) ||
    null
  const coverage = metadataCoverage(videos)
  const evidenceFingerprint = [
    channelId || "unknown",
    sourceSnapshotId || "no-snapshot",
    videos.length,
    coverage.titles,
    coverage.descriptions,
    coverage.tags,
    coverage.metrics,
    coverage.thumbnails,
    latestPublishedAt(videos),
  ].join("|")

  return {
    cache,
    vtSyncSnapshot: filteredSnapshot,
    channelId,
    sourceSnapshotId,
    videos,
    evidenceFingerprint,
  }
}

export const buildBrainEvidenceFingerprint = (
  cache: Record<string, any> = readYouTubeAnalyticsCache(),
  vtSyncSnapshot: VtSyncSnapshot = getVtSyncSnapshot(),
): string => buildSourceBundle(cache, vtSyncSnapshot).evidenceFingerprint

export const shouldRunBrainBootstrap = async (options: {
  channelId: string | null
  cache?: Record<string, any>
  vtSyncSnapshot?: VtSyncSnapshot
  force?: boolean
}): Promise<boolean> => {
  if (options.force) return true
  if (!options.channelId) return true
  const source = buildSourceBundle(options.cache || readYouTubeAnalyticsCache(), options.vtSyncSnapshot || getVtSyncSnapshot())
  const latestRun = await db.getLatestBootstrapRunDB(options.channelId)
  if (!latestRun || latestRun.status !== "complete") return true
  if (latestRun.evidenceFingerprint !== source.evidenceFingerprint) return true
  if ((latestRun.sourceCounts?.videos || 0) < source.videos.length) return true
  return !hasCompletedBrainOnboardingBootstrap(options.channelId)
}

export const rankChannelEvidenceVideos = (
  videos: OnboardingVideo[],
  limit = 40,
): OnboardingVideo[] => {
  const topPerformers = [...videos]
    .sort((left, right) => performanceScore(right) - performanceScore(left))
    .slice(0, Math.ceil(limit / 2))
  const recent = [...videos]
    .sort((left, right) => cleanText(right.publishedAt).localeCompare(cleanText(left.publishedAt)))
    .slice(0, Math.ceil(limit / 3))
  const richMetadata = [...videos]
    .sort((left, right) => {
      const rightScore = tokenize(right.title).length + tokenize(right.description).length + normalizeTags(right.tags).length
      const leftScore = tokenize(left.title).length + tokenize(left.description).length + normalizeTags(left.tags).length
      return rightScore - leftScore
    })
    .slice(0, Math.ceil(limit / 3))
  const byId = new Map<string, OnboardingVideo>()
  ;[...topPerformers, ...recent, ...richMetadata].forEach((video) => {
    byId.set(cleanText(video.videoId || video.id || video.title), video)
  })
  return Array.from(byId.values()).slice(0, limit)
}

export const getBrainOnboardingGuardKey = (channelId: string | null): string =>
  `${GUARD_PREFIX}::${channelId || "unknown"}`

export const hasCompletedBrainOnboardingBootstrap = (
  channelId: string | null,
): boolean => {
  if (typeof localStorage === "undefined") return false
  return localStorage.getItem(getBrainOnboardingGuardKey(channelId)) === "complete"
}

const markCompleted = (channelId: string | null): void => {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(getBrainOnboardingGuardKey(channelId), "complete")
}

const buildEvidencePacket = (
  runId: string,
  source: OnboardingSourceBundle,
): ChannelEvidencePacket => {
  const createdAt = nowIso()
  const { cache, channelId, videos, vtSyncSnapshot } = source
  const profile = cache.profile || cache.channelBaseline || {}
  const summary = cache.channelLifetimeSummary || {}
  const evidence: BrainEvidenceItem[] = []

  const channelTitle = cleanText(profile.title || profile.name || vtSyncSnapshot.channelName)
  const channelDescription = firstThreeSentences(
    profile.description || profile.snippet?.description || profile.brandingSettings?.channel?.description || vtSyncSnapshot.channelDescription,
  )
  const channelKeywords = cleanText(
    profile.keywords || profile.brandingSettings?.channel?.keywords,
  )

  if (channelTitle || channelDescription || channelKeywords) {
    evidence.push({
      id: "channel_profile_identity",
      source: "channel_profile",
      label: "Channel identity",
      summary: [channelTitle, channelDescription, channelKeywords ? `Keywords: ${channelKeywords}` : ""]
        .filter(Boolean)
        .join(" | "),
      confidence: "high",
      observedAt: createdAt,
    })
  }

  const views = toNumber(summary.lifetimeViews || summary.views || profile.statistics?.viewCount || vtSyncSnapshot.channelViewCount)
  const subscribers = toNumber(
    summary.currentSubscribers || summary.subscribers || profile.statistics?.subscriberCount || vtSyncSnapshot.subscriberCount,
  )
  const totalVideos = toNumber(
    summary.videoCount || profile.statistics?.videoCount || vtSyncSnapshot.channelVideoCount || videos.length,
  )
  const comments = toNumber(summary.lifetimeComments || summary.comments)
  if (views || subscribers || totalVideos || comments) {
    evidence.push({
      id: "channel_lifetime_metrics",
      source: "channel_lifetime_metrics",
      label: "Lifetime performance baseline",
      summary: `${views.toLocaleString()} views, ${subscribers.toLocaleString()} subscribers, ${totalVideos.toLocaleString()} videos, ${comments.toLocaleString()} comments.`,
      confidence: "high",
      observedAt: createdAt,
    })
  }

  const representativeVideos = rankChannelEvidenceVideos(videos, 120)
  representativeVideos.forEach((video: OnboardingVideo, index: number) => {
    const videoId = cleanText(video.videoId || video.id) || `video-${index}`
    const title = cleanText(video.title)
    const description = firstThreeSentences(video.description)
    const tags = normalizeTags(video.tags)
    const category = cleanText(video.categoryName || video.categoryId)
    const format = cleanText(video.format || (video.isShort ? "shorts" : "long"))
    const viewCount = readMetric(video, "views")
    const watchTime = readMetric(video, "watchTime")
    const subscribersGained = readMetric(video, "subscribers")
    const revenue = readMetric(video, "revenue")
    const thumbnail = cleanText(video.thumbnailUrl || video.thumbnail)
    const summaryParts = [
      title,
      format ? `Format: ${format}` : "",
      category ? `Category: ${category}` : "",
      description ? `Description: ${description}` : "",
      tags.length ? `Tags: ${tags.slice(0, 8).join(", ")}` : "",
      viewCount !== null ? `${viewCount.toLocaleString()} views` : "",
      watchTime !== null ? `${Math.round(watchTime).toLocaleString()} watch time` : "",
      subscribersGained !== null ? `${subscribersGained.toLocaleString()} subscribers` : "",
      revenue !== null ? `$${revenue.toLocaleString()} revenue` : "",
      thumbnail ? "Thumbnail URL available" : "",
    ].filter(Boolean)

    if (summaryParts.length === 0) return

    evidence.push({
      id: `video_metadata_${videoId}`,
      source: "video_metadata",
      label: title || `Video ${index + 1}`,
      summary: summaryParts.join(" | "),
      confidence: "high",
      videoId,
      observedAt: createdAt,
    })
  })

  const shorts = videos.filter((video: any) => video.isShort || video.format === "shorts").length
  const thumbnails = videos.filter((video: any) => video.thumbnailUrl || video.thumbnail).length
  const tagCount = videos.reduce((total: number, video: any) => total + normalizeTags(video.tags).length, 0)
  const descriptionCount = videos.filter((video: any) => firstThreeSentences(video.description)).length
  const audienceEvidence = buildBrainAudienceEvidencePacket({
    channelId,
    videos: videos.map((video: OnboardingVideo) => ({
      id: cleanText(video.id || video.videoId),
      videoId: cleanText(video.videoId || video.id),
      title: cleanText(video.title),
      publishedAt: cleanText(video.publishedAt),
      durationSeconds: typeof video.durationSeconds === "number" ? video.durationSeconds : undefined,
      isShort: typeof video.isShort === "boolean" ? video.isShort : null,
      format: cleanText(video.format || video.type),
      views: readMetric(video, "views"),
      statistics: video.statistics,
    })),
  })

  return {
    id: makeId("evidence"),
    runId,
    channelId,
    createdAt,
    sourceSnapshotId: source.sourceSnapshotId,
    evidenceFingerprint: source.evidenceFingerprint,
    sourceCounts: {
      videos: videos.length,
      shorts,
      longForm: Math.max(0, videos.length - shorts),
      tags: tagCount,
      descriptions: descriptionCount,
      thumbnails,
      comments: 0,
      transcripts: 0,
      mediaAnalyses: 0,
    },
    skippedInputs: [
      {
        source: "comments_and_replies",
        reason: "Deferred unless the comments sync has already been explicitly scoped for this account.",
        consentRequired: true,
      },
      {
        source: "transcripts",
        reason: "Deferred to the deep scan path because transcript acquisition is heavier and may be unavailable.",
        consentRequired: true,
      },
      {
        source: "thumbnail_banner_vision",
        reason: "Deferred to the deep scan path because image analysis uses model/vision processing.",
        consentRequired: true,
      },
    ],
    evidence,
    audienceEvidence,
  }
}

const mostFrequent = (values: string[], limit: number): Array<{ value: string; count: number }> => {
  const counts = new Map<string, number>()
  values.forEach((value) => {
    const key = cleanText(value).toLowerCase()
    if (!key) return
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }))
}

const addWeightedTerms = (
  scores: Map<string, number>,
  value: unknown,
  weight: number,
): void => {
  tokenize(value).forEach((term) => {
    scores.set(term, (scores.get(term) || 0) + weight)
  })
}

const topWeightedTerms = (
  source: OnboardingSourceBundle,
  limit: number,
): Array<{ value: string; score: number }> => {
  const scores = new Map<string, number>()
  const profile = source.cache.profile || source.cache.channelBaseline || {}
  addWeightedTerms(scores, profile.keywords || profile.brandingSettings?.channel?.keywords, 8)
  addWeightedTerms(scores, profile.description || profile.snippet?.description || source.vtSyncSnapshot.channelDescription, 4)

  source.videos.forEach((video) => {
    const performanceWeight = 1 + Math.min(8, performanceScore(video) / 10)
    normalizeTags(video.tags).forEach((tag) => {
      const key = cleanText(tag).toLowerCase()
      if (key && !STOP_WORDS.has(key)) scores.set(key, (scores.get(key) || 0) + 7 * performanceWeight)
    })
    addWeightedTerms(scores, video.categoryName || video.categoryId || video.category, 4 * performanceWeight)
    addWeightedTerms(scores, video.title, 2 * performanceWeight)
    addWeightedTerms(scores, firstThreeSentences(video.description), 0.85 * performanceWeight)
  })

  source.vtSyncSnapshot.searchTerms.slice(0, 40).forEach((row) => {
    const views = toOptionalNumber(row.views) || 0
    addWeightedTerms(scores, row.term || row.source || row.title, 2 + Math.log10(views + 1))
  })

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, score]) => ({ value, score }))
}

const formatList = (values: string[], fallback = "available channel evidence"): string => {
  const clean = values.map(cleanText).filter(Boolean)
  if (!clean.length) return fallback
  if (clean.length === 1) return clean[0]
  return `${clean.slice(0, -1).join(", ")} and ${clean.at(-1)}`
}

const hypothesis = (
  id: string,
  label: string,
  summary: string,
  confidence: BrainConfidenceLevel,
  evidenceIds: string[],
): ChannelKnowledgeHypothesis => ({
  id,
  label,
  summary,
  confidence,
  evidenceIds,
})

const buildKnowledgeModel = (
  runId: string,
  packet: ChannelEvidencePacket,
  source: OnboardingSourceBundle,
): ChannelKnowledgeModel => {
  const createdAt = nowIso()
  const { channelId, videos } = source
  const tags = videos.flatMap((video: any) => normalizeTags(video.tags))
  const categories = videos.map((video: any) => cleanText(video.categoryName || video.categoryId)).filter(Boolean)
  const formats = videos.map((video: any) => cleanText(video.format || (video.isShort ? "shorts" : "long"))).filter(Boolean)
  const topTags = mostFrequent(tags, 8)
  const topCategories = mostFrequent(categories, 5)
  const topFormats = mostFrequent(formats, 3)
  const weightedTerms = topWeightedTerms(source, 14)
  const topVideos = rankChannelEvidenceVideos(videos, 8)
  const evidenceIds = packet.evidence.slice(0, 12).map((item) => item.id)
  const profileEvidence = packet.evidence.find((item) => item.source === "channel_profile")?.id
  const metricsEvidence = packet.evidence.find((item) => item.source === "channel_lifetime_metrics")?.id
  const videoEvidenceIds = packet.evidence.filter((item) => item.source === "video_metadata").slice(0, 8).map((item) => item.id)
  const topTermNames = weightedTerms.slice(0, 6).map((term) => term.value)

  const nicheSummary = weightedTerms.length
    ? `Your synced channel evidence currently points toward ${formatList(topTermNames.slice(0, 5))}. This is inferred from channel metadata, titles, descriptions, tags, search language, and top-performing videos across ${videos.length.toLocaleString()} videos.`
    : topTags.length
      ? `Repeated channel tags point toward ${topTags.map((tag) => `${tag.value} (${tag.count})`).join(", ")}.`
      : topCategories.length
        ? `Repeated YouTube categories point toward ${topCategories.map((cat) => `${cat.value} (${cat.count})`).join(", ")}.`
        : "The channel niche needs more metadata before the Brain can classify it sharply."

  const secondarySummary = weightedTerms.length > 5
    ? `Secondary lanes worth separating are ${formatList(topTermNames.slice(3, 8))}.`
    : "Secondary content lanes need more distinct metadata before they should be named."

  const pillarTerms = [
    weightedTerms.slice(0, 2).map((term) => term.value),
    weightedTerms.slice(2, 4).map((term) => term.value),
    weightedTerms.slice(4, 6).map((term) => term.value),
  ].filter((group) => group.length > 0)

  const formatSummary = topFormats.length
    ? `The library currently leans ${topFormats.map((fmt) => `${fmt.value} (${fmt.count})`).join(", ")}.`
    : "Format mix is not yet clear from the available cache."

  const visualSummary =
    packet.sourceCounts.thumbnails > 0
      ? `${packet.sourceCounts.thumbnails} thumbnail URLs are available for later vision analysis; v1 uses presence and metadata only.`
      : "No thumbnail URLs were available in the first-run cache."

  const audienceSummary =
    packet.sourceCounts.comments > 0
      ? "Comment evidence is available and should be used for audience language refinement."
      : "Audience language is inferred from titles, tags, descriptions, and performance only until comments are synced."

  const growthSummary =
    packet.sourceCounts.videos > 0
      ? `The Brain compared your ${packet.sourceCounts.videos.toLocaleString()} synced videos by format, topic language, metadata richness, and available performance to identify repeatable series and packaging patterns.`
      : "The Brain needs a synced video inventory before growth opportunities can be ranked."

  const confidence = confidenceFromCount(packet.sourceCounts.videos, 20, 5)
  const nicheConfidence = confidenceFromCount(weightedTerms.length + topTags.length + topCategories.length, 5, 1)
  const topVideoSummaries = topVideos
    .map((video) => {
      const views = readMetric(video, "views")
      return `${cleanText(video.title) || video.videoId}${views !== null ? ` (${views.toLocaleString()} views)` : ""}`
    })
    .filter(Boolean)

  return {
    id: makeId("knowledge"),
    runId,
    channelId,
    createdAt,
    updatedAt: createdAt,
    sourceSnapshotId: source.sourceSnapshotId,
    evidenceFingerprint: source.evidenceFingerprint,
    niche: [
      hypothesis(
        "niche_from_weighted_channel_evidence",
        "Inferred channel niche",
        nicheSummary,
        nicheConfidence,
        [profileEvidence, ...videoEvidenceIds].filter(Boolean) as string[],
      ),
    ],
    secondaryNiches: [
      hypothesis(
        "secondary_lanes_from_weighted_terms",
        "Secondary content lanes",
        secondarySummary,
        weightedTerms.length > 5 ? "medium" : "low",
        videoEvidenceIds,
      ),
    ],
    contentPillars: pillarTerms.map((terms, index) =>
      hypothesis(
        `content_pillar_${index + 1}`,
        `Content pillar ${index + 1}`,
        `A visible content pillar combines ${formatList(terms)} signals across your synced videos.`,
        terms.length >= 2 ? "medium" : "low",
        videoEvidenceIds.slice(index, index + 4),
      ),
    ),
    topicClusters: weightedTerms.slice(0, 8).map((term, index) =>
      hypothesis(
        `topic_cluster_${index + 1}`,
        term.value,
        `${term.value} is a recurring topic/language signal in your current channel evidence.`,
        term.score > 25 ? "high" : term.score > 8 ? "medium" : "low",
        videoEvidenceIds.slice(0, 4),
      ),
    ),
    searchLanguage: source.vtSyncSnapshot.searchTerms.length
      ? [
          hypothesis(
            "search_language_from_vt_sync",
            "Search language",
            `Search traffic language includes ${formatList(source.vtSyncSnapshot.searchTerms.slice(0, 6).map((row) => cleanText(row.term || row.source || row.title)))}.`,
            "medium",
            [],
          ),
        ]
      : [],
    contentFormats: [
      hypothesis(
        "format_mix",
        "Format mix",
        formatSummary,
        confidenceFromCount(topFormats.length, 2, 1),
        videoEvidenceIds,
      ),
    ],
    audience: [
      hypothesis(
        "audience_language_pending_comments",
        "Audience language",
        audienceSummary,
        packet.sourceCounts.comments > 0 ? "medium" : "low",
        evidenceIds,
      ),
    ],
    visualIdentity: [
      hypothesis(
        "visual_identity_thumbnail_inventory",
        "Visual identity",
        visualSummary,
        packet.sourceCounts.thumbnails > 10 ? "medium" : "low",
        videoEvidenceIds,
      ),
    ],
    creatorCommunication: [
      hypothesis(
        "communication_preference_hypothesis",
        "Creator communication style",
        "The first-run Brain should communicate as a practical coach and partner while treating owner personality as a low-confidence hypothesis until the creator answers onboarding questions.",
        "low",
        evidenceIds,
      ),
    ],
    growthOpportunities: [
      hypothesis(
        "library_pattern_mining",
        "Library pattern mining",
        growthSummary,
        confidence,
        [metricsEvidence, ...videoEvidenceIds].filter(Boolean) as string[],
      ),
    ],
    successDrivers: [
      hypothesis(
        "top_performer_pattern_mining",
        "Top performer patterns",
        topVideoSummaries.length
          ? `The strongest available performance evidence comes from ${formatList(topVideoSummaries.slice(0, 5))}. Use these as pattern evidence before asking the creator to label the channel from scratch.`
          : "Top performer ranking needs video-level metrics before success drivers can be named.",
        topVideoSummaries.length ? "medium" : "low",
        videoEvidenceIds,
      ),
    ],
    topEvidenceVideos: topVideos.map((video) => ({
      videoId: cleanText(video.videoId || video.id),
      title: cleanText(video.title) || cleanText(video.videoId || video.id),
      views: readMetric(video, "views"),
      watchTime: readMetric(video, "watchTime"),
      revenue: readMetric(video, "revenue"),
      subscribers: readMetric(video, "subscribers"),
      publishedAt: cleanText(video.publishedAt || video.uploadDate) || null,
      evidenceId: `video_metadata_${cleanText(video.videoId || video.id)}`,
    })),
    contradictions: packet.skippedInputs.map((input, index) =>
      hypothesis(
        `missing_input_${index + 1}`,
        input.source,
        input.reason,
        "high",
        [],
      ),
    ),
    summary: [
      nicheSummary,
      secondarySummary,
      formatSummary,
      `Evidence inspected: ${packet.sourceCounts.videos.toLocaleString()} videos, ${packet.sourceCounts.tags.toLocaleString()} tags, ${packet.sourceCounts.descriptions.toLocaleString()} descriptions, ${packet.sourceCounts.thumbnails.toLocaleString()} thumbnails.`,
    ].join(" "),
    confidence,
  }
}

const question = (
  id: string,
  category: BrainQuestion["category"],
  questionText: string,
  reason: string,
  confidence: BrainConfidenceLevel,
  evidenceIds: string[],
): BrainQuestion => ({
  id,
  category,
  question: questionText,
  reason,
  confidence,
  evidenceIds,
})

const buildQuestionSet = (
  runId: string,
  channelId: string | null,
  knowledge: ChannelKnowledgeModel,
): BrainQuestionSet => {
  const primaryEvidence = [
    ...knowledge.niche,
    ...knowledge.contentFormats,
    ...knowledge.growthOpportunities,
  ].flatMap((item) => item.evidenceIds)

  return {
    id: makeId("questions"),
    runId,
    channelId,
    createdAt: nowIso(),
    universalQuestions: [
      question(
        "universal_goal",
        "universal",
        "What would make ViewTube feel like it helped you win this month: more views, better ideas, better packaging, more revenue, or a calmer workflow?",
        "Every channel needs a primary operating goal before the Brain should rank advice.",
        "high",
        [],
      ),
      question(
        "universal_constraints",
        "universal",
        "What should the Brain never push you toward, even if the data says it might perform?",
        "Creator boundaries prevent generic growth advice from damaging trust or taste.",
        "high",
        [],
      ),
      question(
        "universal_voice",
        "universal",
        "Do you want this Brain to talk to you like a strategist, coach, producer, editor, or direct operator?",
        "The system can infer content patterns, but the communication contract should be confirmed by the owner.",
        "high",
        [],
      ),
    ],
    personalizedQuestions: [
      question(
        "personalized_niche_confirm",
        "personalized",
        `I’m seeing your strongest lanes as ${formatList((knowledge.topicClusters || []).slice(0, 3).map((item) => item.label), "your inferred channel niche")}. Which lane should the Brain prioritize first?`,
        knowledge.niche[0]?.summary || "Niche inference needs owner confirmation.",
        knowledge.niche[0]?.confidence || "low",
        knowledge.niche[0]?.evidenceIds || [],
      ),
      question(
        "personalized_format_goal",
        "personalized",
        `Your library suggests this format mix: ${knowledge.contentFormats[0]?.summary || "format mix still pending"}. Which format should the Brain protect and improve first?`,
        "Format prioritization changes recommendations across thumbnails, scripts, retention, and scheduling.",
        knowledge.contentFormats[0]?.confidence || "low",
        knowledge.contentFormats[0]?.evidenceIds || [],
      ),
      question(
        "personalized_pattern_to_repeat",
        "personalized",
        "Which recent video felt most like the future of the channel, even if it was not the top performer?",
        "Performance data alone can miss the creator's intended direction.",
        "medium",
        primaryEvidence.slice(0, 6),
      ),
      question(
        "personalized_audience_language",
        "personalized",
        "I can infer audience language better after comments and transcripts are synced. Until then, what words would your best viewer use to describe why they watch you?",
        "Comment and transcript stages are deferred, so this question fills the highest-value missing context.",
        "low",
        [],
      ),
    ],
  }
}

const buildToolContextPack = (
  runId: string,
  channelId: string | null,
  packet: ChannelEvidencePacket,
  knowledge: ChannelKnowledgeModel,
): ToolContextPack => {
  const unavailableInputs = packet.skippedInputs.map((input) => input.source)
  const evidenceIds = packet.evidence.slice(0, 25).map((item) => item.id)
  const contextBlock = [
    `Sitewide Brain bootstrap confidence: ${knowledge.confidence}.`,
    `Channel understanding: ${knowledge.summary}`,
    `Niche: ${knowledge.niche.map((item) => `${item.summary} [${item.confidence}]`).join(" ")}`,
    knowledge.secondaryNiches?.length ? `Secondary lanes: ${knowledge.secondaryNiches.map((item) => `${item.summary} [${item.confidence}]`).join(" ")}` : "",
    knowledge.contentPillars?.length ? `Content pillars: ${knowledge.contentPillars.map((item) => `${item.summary} [${item.confidence}]`).join(" ")}` : "",
    knowledge.topicClusters?.length ? `Topic clusters: ${knowledge.topicClusters.slice(0, 8).map((item) => item.label).join(", ")}.` : "",
    knowledge.successDrivers?.length ? `Success drivers: ${knowledge.successDrivers.map((item) => `${item.summary} [${item.confidence}]`).join(" ")}` : "",
    `Formats: ${knowledge.contentFormats.map((item) => `${item.summary} [${item.confidence}]`).join(" ")}`,
    `Audience: ${knowledge.audience.map((item) => `${item.summary} [${item.confidence}]`).join(" ")}`,
    `Visual identity: ${knowledge.visualIdentity.map((item) => `${item.summary} [${item.confidence}]`).join(" ")}`,
    `Boundaries: Treat owner personality as a low-confidence communication preference hypothesis until confirmed. Cite evidence for channel claims. Do not overstate unavailable comments, transcripts, or media analysis.`,
    unavailableInputs.length ? `Unavailable/deferred inputs: ${unavailableInputs.join(", ")}.` : "",
  ].filter(Boolean).join("\n")

  return {
    id: makeId("context"),
    runId,
    channelId,
    createdAt: nowIso(),
    sourceSnapshotId: knowledge.sourceSnapshotId,
    evidenceFingerprint: knowledge.evidenceFingerprint,
    promptVersion: PROMPT_VERSION,
    summary: knowledge.summary,
    contextBlock,
    evidenceIds,
    confidence: knowledge.confidence,
    unavailableInputs,
  }
}

const buildGenerationRecord = (
  runId: string,
  channelId: string | null,
  pack: ToolContextPack,
): BrainGenerationRecord => ({
  id: makeId("generation"),
  runId,
  channelId,
  toolId: "BRAIN_ONBOARDING_BOOTSTRAP",
  promptVersion: PROMPT_VERSION,
  model: "deterministic-local-v1",
  inputSummary: "Built from synced YouTube channel cache, video metadata, lifetime metrics, and deferred-input diagnostics.",
  outputSummary: pack.summary,
  sourceEvidenceIds: pack.evidenceIds,
  createdAt: nowIso(),
})

export const getLatestBrainOnboardingSnapshot = async (
  channelId?: string | null,
): Promise<BrainOnboardingSnapshot> => {
  const run = await db.getLatestBootstrapRunDB(channelId)
  return {
    run,
    evidencePacket: await db.getLatestChannelEvidencePacketDB(channelId),
    knowledgeModel: await db.getLatestChannelKnowledgeModelDB(channelId),
    questionSet: await db.getLatestBrainQuestionSetDB(channelId),
    toolContextPack: await db.getLatestToolContextPackDB(channelId),
  }
}

export const refreshToolContextPack = async (
  channelId?: string | null,
): Promise<ToolContextPack | null> => {
  const snapshot = await getLatestBrainOnboardingSnapshot(channelId)
  return snapshot.toolContextPack
}

export const buildBrainOnboardingArtifactsForTest = (
  cache: Record<string, any>,
  vtSyncSnapshot?: VtSyncSnapshot,
) => {
  const runId = "brain_bootstrap_test"
  const source = buildSourceBundle(cache, vtSyncSnapshot || getVtSyncSnapshot())
  const channelId = source.channelId
  const evidencePacket = buildEvidencePacket(runId, source)
  const knowledgeModel = buildKnowledgeModel(runId, evidencePacket, source)
  const questionSet = buildQuestionSet(runId, channelId, knowledgeModel)
  const toolContextPack = buildToolContextPack(runId, channelId, evidencePacket, knowledgeModel)
  const generationRecord = buildGenerationRecord(runId, channelId, toolContextPack)
  return {
    evidencePacket,
    knowledgeModel,
    questionSet,
    toolContextPack,
    generationRecord,
  }
}

export const runFirstRunBrainOnboardingBootstrap = async (
  options: {
    cache?: Record<string, any>
    vtSyncSnapshot?: VtSyncSnapshot
    force?: boolean
    source?: "auth_boot" | "manual_sync" | "event"
  } = {},
): Promise<BrainOnboardingSnapshot> => {
  const cache = options.cache || readYouTubeAnalyticsCache()
  const sourceBundle = buildSourceBundle(cache, options.vtSyncSnapshot || getVtSyncSnapshot())
  const channelId = sourceBundle.channelId
  const guardKey = getBrainOnboardingGuardKey(channelId)

  if (!(await shouldRunBrainBootstrap({
    channelId,
    cache,
    vtSyncSnapshot: sourceBundle.vtSyncSnapshot,
    force: options.force,
  }))) {
    return getLatestBrainOnboardingSnapshot(channelId)
  }

  const activeKey = channelId || "unknown"
  const existing = activeRuns.get(activeKey)
  if (existing) return existing

  const runPromise = (async () => {
    const runId = makeId("brain_bootstrap")
    const startedAt = nowIso()
    let run: BrainOnboardingBootstrapRun = {
      id: runId,
      channelId,
      status: channelId ? "running" : "skipped",
      stage: channelId ? "evidence_pack" : "failed",
      startedAt,
      completedAt: null,
      firstRun: !hasCompletedBrainOnboardingBootstrap(channelId),
      guardKey,
      sourceSnapshotId: sourceBundle.sourceSnapshotId,
      evidenceFingerprint: sourceBundle.evidenceFingerprint,
      diagnostics: [
        `source:${options.source || "manual_sync"}`,
        "Literal logout is intentionally not used because logout clears auth/cache state.",
      ],
      sourceCounts: {
        videos: 0,
        shorts: 0,
        longForm: 0,
        tags: 0,
        descriptions: 0,
        thumbnails: 0,
        comments: 0,
        transcripts: 0,
        mediaAnalyses: 0,
      },
      generationRecordIds: [],
    }

    if (!channelId) {
      run = {
        ...run,
        status: "skipped",
        stage: "failed",
        completedAt: nowIso(),
        diagnostics: [...run.diagnostics, "Skipped because no channelId was present in the analytics cache."],
      }
      await db.saveBootstrapRunDB(run)
      return getLatestBrainOnboardingSnapshot(channelId)
    }

    try {
      await db.saveBootstrapRunDB(run)
      const evidencePacket = buildEvidencePacket(runId, sourceBundle)
      await db.saveChannelEvidencePacketDB(evidencePacket)

      run = {
        ...run,
        stage: "knowledge_model",
        sourceCounts: evidencePacket.sourceCounts,
        evidencePacketId: evidencePacket.id,
      }
      await db.saveBootstrapRunDB(run)

      const knowledgeModel = buildKnowledgeModel(runId, evidencePacket, sourceBundle)
      await db.saveChannelKnowledgeModelDB(knowledgeModel)

      run = { ...run, stage: "question_set", knowledgeModelId: knowledgeModel.id }
      await db.saveBootstrapRunDB(run)

      const questionSet = buildQuestionSet(runId, channelId, knowledgeModel)
      await db.saveBrainQuestionSetDB(questionSet)

      run = { ...run, stage: "context_pack", questionSetId: questionSet.id }
      await db.saveBootstrapRunDB(run)

      const toolContextPack = buildToolContextPack(runId, channelId, evidencePacket, knowledgeModel)
      await db.saveToolContextPackDB(toolContextPack)
      const generationRecord = buildGenerationRecord(runId, channelId, toolContextPack)
      await db.saveGenerationRecordDB(generationRecord)

      const previousMemory = getBrainMemory()
      await saveBrainMemory({
        ...previousMemory,
        contentDNA: knowledgeModel.niche[0]?.summary || previousMemory.contentDNA,
        performanceLedger: knowledgeModel.growthOpportunities[0]?.summary || previousMemory.performanceLedger,
        futureStateMap:
          "Use first-run channel evidence to personalize sitewide tools, then ask owner-confirmed questions before making strong claims.",
        sitewideBrainContext: toolContextPack.contextBlock,
        onboarding: {
          lastRunId: runId,
          channelId,
          status: "complete",
          completedAt: nowIso(),
        },
      })

      run = {
        ...run,
        status: "complete",
        stage: "complete",
        completedAt: nowIso(),
        toolContextPackId: toolContextPack.id,
        generationRecordIds: [generationRecord.id],
        diagnostics: [
          ...run.diagnostics,
          "Stage 1 complete from existing synced channel cache.",
          "Comments, transcripts, and media vision remain deferred until scoped.",
        ],
      }
      await db.saveBootstrapRunDB(run)
      markCompleted(channelId)

      const snapshot: BrainOnboardingSnapshot = {
        run,
        evidencePacket,
        knowledgeModel,
        questionSet,
        toolContextPack,
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(SNAPSHOT_EVENT, { detail: snapshot }))
      }
      return snapshot
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      run = {
        ...run,
        status: "failed",
        stage: "failed",
        completedAt: nowIso(),
        error: message,
        diagnostics: [...run.diagnostics, message],
      }
      await db.saveBootstrapRunDB(run)
      throw error
    }
  })()

  activeRuns.set(activeKey, runPromise)
  try {
    return await runPromise
  } finally {
    activeRuns.delete(activeKey)
  }
}
