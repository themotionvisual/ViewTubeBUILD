import type { CreatorBrainResponse } from "../types"
import { runBrainTask } from "./brain/runtime/BrainRuntime"
import type { BrainRuntimeRequest } from "./brain/runtime/BrainRuntimeContracts"
import {
  appendContentBuildEvent,
  ensureContentBuild,
  listContentBuildEvents,
} from "./asset-engine/ContentBuildRepository"
import {
  listAlgorithmIntelligenceEvents,
  recordAlgorithmIntelligenceEvent,
  type AlgorithmEvaluationTarget,
  type AlgorithmIntelligenceEvent,
} from "./brain/AlgorithmIntelligenceEventLedger"
import { attachAlgorithmMonitoringSchedule } from "./brain/AlgorithmMonitoringSchedule"
import {
  createViewTubeActionPacket,
  getViewTubeToolCapability,
  persistViewTubeActionPacket,
} from "./viewTubeToolChains"

export interface LongformThumbnailAnalysis {
  status: "ready" | "missing" | "stale"
  concept?: string
  style?: string
  composition?: string
  text?: string
  notes?: string
  evidenceId?: string
}

export interface LongformOptimizationVideoInput {
  videoId: string
  title: string
  format?: string | null
  durationSec?: number | null
  thumbnailUrl?: string | null
  description?: string | null
  tags?: string[]
  transcript?: string | null
  thumbnailAnalysis?: LongformThumbnailAnalysis | null
  categoryId?: string | null
  playlistIds?: string[]
  publishedAt?: string | null
  views?: number | null
  revenue?: number | null
  likes?: number | null
  comments?: number | null
  watchTimeHours?: number | null
  impressions?: number | null
  ctr?: number | null
  avp?: number | null
}

export interface LongformExperimentChoice {
  titleAbc: boolean
  thumbnailAbc: boolean
}

export type LongformRankedCandidate = LongformOptimizationVideoInput & {
  priorityScore: number
  rankSignals: {
    views: number
    revenue: number
    likes: number
    comments: number
    watchTimeHours: number
  }
}

export interface LongformOptimizationContext {
  videoId: string
  currentMetadata: {
    title: string
    description: string
    tags: string[]
    categoryId: string | null
    playlistIds: string[]
  }
  transcript: string | null
  thumbnail: {
    url: string | null
    analysis: LongformThumbnailAnalysis | null
  }
  analytics: {
    views: number | null
    revenue: number | null
    likes: number | null
    comments: number | null
    watchTimeHours: number | null
    impressions: number | null
    ctr: number | null
    avp: number | null
  }
  experiment: LongformExperimentChoice
  missingEvidence: string[]
  integrationTargets: string[]
}

export interface LongformOptimizationAnalysis {
  contentBuildId: string | null
  context: LongformOptimizationContext
  response: CreatorBrainResponse
  recommendationEvent: AlgorithmIntelligenceEvent | null
}

export interface LongformOptimizationHandoffPayload {
  videoId: string
  currentMetadata: LongformOptimizationContext["currentMetadata"]
  transcript: string | null
  thumbnail: LongformOptimizationContext["thumbnail"]
  analytics: LongformOptimizationContext["analytics"]
  experiment: LongformExperimentChoice
  missingEvidence: string[]
  recommendation: CreatorBrainResponse
}

const finite = (value: number | null | undefined) => Number.isFinite(Number(value)) ? Number(value) : 0
const nullableFinite = (value: number | null | undefined) => Number.isFinite(Number(value)) ? Number(value) : null

const isLongform = (video: LongformOptimizationVideoInput) => {
  const format = String(video.format || "").toLowerCase()
  if (format.includes("short")) return false
  if (video.durationSec != null && video.durationSec > 0 && video.durationSec <= 65) return false
  return true
}

export const rankLongformOptimizationCandidates = (
  videos: LongformOptimizationVideoInput[],
): LongformRankedCandidate[] => {
  const eligible = videos.filter(isLongform)
  if (!eligible.length) return []

  const maxima = {
    views: Math.max(1, ...eligible.map((video) => finite(video.views))),
    revenue: Math.max(1, ...eligible.map((video) => finite(video.revenue))),
    likes: Math.max(1, ...eligible.map((video) => finite(video.likes))),
    comments: Math.max(1, ...eligible.map((video) => finite(video.comments))),
    watchTimeHours: Math.max(1, ...eligible.map((video) => finite(video.watchTimeHours))),
  }

  return eligible
    .map((video) => {
      const rankSignals = {
        views: finite(video.views) / maxima.views,
        revenue: finite(video.revenue) / maxima.revenue,
        likes: finite(video.likes) / maxima.likes,
        comments: finite(video.comments) / maxima.comments,
        watchTimeHours: finite(video.watchTimeHours) / maxima.watchTimeHours,
      }
      const score =
        rankSignals.views * 0.30 +
        rankSignals.revenue * 0.25 +
        rankSignals.likes * 0.20 +
        rankSignals.comments * 0.15 +
        rankSignals.watchTimeHours * 0.10
      return {
        ...video,
        priorityScore: Math.round(score * 1000) / 10,
        rankSignals,
      }
    })
    .sort((left, right) =>
      right.priorityScore - left.priorityScore ||
      finite(right.views) - finite(left.views) ||
      left.title.localeCompare(right.title),
    )
}

export const buildLongformOptimizationContext = (
  video: LongformOptimizationVideoInput,
  experiment: LongformExperimentChoice,
): LongformOptimizationContext => {
  const missingEvidence: string[] = []
  if (!video.description?.trim()) missingEvidence.push("description")
  if (!video.tags?.length) missingEvidence.push("tags")
  if (!video.transcript?.trim()) missingEvidence.push("transcript")
  if (!video.thumbnailUrl) missingEvidence.push("thumbnail")
  if (!video.thumbnailAnalysis || video.thumbnailAnalysis.status !== "ready") missingEvidence.push("thumbnail_visual_analysis")

  return {
    videoId: video.videoId,
    currentMetadata: {
      title: video.title,
      description: video.description || "",
      tags: [...(video.tags || [])],
      categoryId: video.categoryId || null,
      playlistIds: [...(video.playlistIds || [])],
    },
    transcript: video.transcript || null,
    thumbnail: {
      url: video.thumbnailUrl || null,
      analysis: video.thumbnailAnalysis || null,
    },
    analytics: {
      views: nullableFinite(video.views),
      revenue: nullableFinite(video.revenue),
      likes: nullableFinite(video.likes),
      comments: nullableFinite(video.comments),
      watchTimeHours: nullableFinite(video.watchTimeHours),
      impressions: nullableFinite(video.impressions),
      ctr: nullableFinite(video.ctr),
      avp: nullableFinite(video.avp),
    },
    experiment: { ...experiment },
    missingEvidence,
    integrationTargets: ["thumbnail-studio", "video-manager", "content-analysis", "ai-brain"],
  }
}

const evaluationTargetsFor = (context: LongformOptimizationContext): AlgorithmEvaluationTarget[] => {
  const candidates: Array<[string, number | null]> = [
    ["views", context.analytics.views],
    ["revenue", context.analytics.revenue],
    ["likes", context.analytics.likes],
    ["comments", context.analytics.comments],
    ["watchTimeHours", context.analytics.watchTimeHours],
    ["ctr", context.analytics.ctr],
    ["avp", context.analytics.avp],
  ]
  return candidates
    .filter((entry): entry is [string, number] => entry[1] != null)
    .map(([metric, baselineValue]) => ({
      metric,
      direction: "increase" as const,
      baselineValue,
      minimumRelativeChange: 0,
      windowHours: 168,
    }))
}

const analysisPrompt = (context: LongformOptimizationContext) => [
  "Analyze this already-published longform YouTube video for evidence-backed optimization opportunities.",
  "Prioritize preserving a successful video. Explicitly recommend LEAVE UNCHANGED when the evidence does not justify an edit.",
  "Use the current title, full description, tags, transcript when available, thumbnail analysis when available, analytics, channel context, ContentBuild/asset evidence, and historical outcomes supplied by BrainRuntime.",
  "Consider title, thumbnail, description, tags, chapters, category, playlist placement and viewer-routing changes, but recommend only changes supported by evidence.",
  "Treat title and thumbnail A/B/C testing as creator-controlled. Do not recommend a native title test when titleAbc is false and do not recommend a native thumbnail test when thumbnailAbc is false.",
  "Distinguish observed association from causal proof. Never imply that a post-edit performance change proves causation.",
  "Return a concise creator report with: diagnosis, recommended intervention or LEAVE UNCHANGED, evidence, confidence, missing evidence, and handoff-ready prompt additions for Thumbnail Studio and Video Manager.",
  "Do not perform an external YouTube mutation.",
  `VIDEO CONTEXT\n${JSON.stringify(context, null, 2)}`,
].join("\n\n")

export const runLongformOptimizationAnalysis = async (input: {
  channelId?: string | null
  projectId?: string | null
  video: LongformOptimizationVideoInput
  experiment: LongformExperimentChoice
  brainRuntime: Pick<BrainRuntimeRequest, "snapshot" | "systemPrompt" | "growthContext" | "allowModel">
}): Promise<LongformOptimizationAnalysis> => {
  const context = buildLongformOptimizationContext(input.video, input.experiment)
  const build = ensureContentBuild({
    videoId: input.video.videoId,
    channelId: input.channelId || null,
    legacyProjectId: null,
    toolId: "longform-optimizer",
  })

  const result = await runBrainTask({
    snapshot: input.brainRuntime.snapshot,
    systemPrompt: input.brainRuntime.systemPrompt,
    growthContext: input.brainRuntime.growthContext,
    allowModel: input.brainRuntime.allowModel,
    surface: "longform-optimizer-widget",
    channelId: input.channelId || null,
    projectId: input.projectId || null,
    userText: analysisPrompt(context),
    visibleContext: {
      contentBuildId: build?.id || null,
      videoId: input.video.videoId,
      longformOptimization: context,
    },
    artifactRefs: context.thumbnail.analysis?.evidenceId ? [context.thumbnail.analysis.evidenceId] : [],
    requestedOutput: "longform-optimization-report",
  })

  const recommendationEvent = input.channelId
    ? recordAlgorithmIntelligenceEvent({
        channelId: input.channelId,
        projectId: input.projectId || null,
        videoId: input.video.videoId,
        kind: "RECOMMENDATION_CREATED",
        sourceSystem: "decision",
        sourceId: result.response.id,
        recommendationId: result.response.id,
        evidenceIds: result.response.evidenceIds || [],
        confidence: result.response.confidence,
        title: result.response.headline || `Longform optimization: ${input.video.title}`,
        summary: result.response.keyInsight || result.response.body,
        evaluationTargets: evaluationTargetsFor(context),
        metadata: {
          surface: "longform-optimizer-widget",
          contentBuildId: build?.id || null,
          experiment: context.experiment,
          missingEvidence: context.missingEvidence,
          recommendation: result.response,
        },
      })
    : null

  if (build) {
    appendContentBuildEvent({
      contentBuildId: build.id,
      eventType: "tool.output.recorded",
      entityType: "longform-optimization-report",
      entityId: result.response.id,
      actorType: "brain",
      toolId: "longform-optimizer",
      evidenceIds: result.response.evidenceIds || [],
      resultingState: {
        headline: result.response.headline,
        keyInsight: result.response.keyInsight,
        confidence: result.response.confidence,
      },
      metadata: {
        recommendationEventId: recommendationEvent?.id || null,
        experiment: context.experiment,
        missingEvidence: context.missingEvidence,
      },
    })
  }

  return {
    contentBuildId: build?.id || null,
    context,
    response: result.response,
    recommendationEvent,
  }
}

const handoffRoute = (targetToolId: string, packetId: string) => {
  const capability = getViewTubeToolCapability(targetToolId)
  const base = capability?.route || "/studio"
  const encoded = encodeURIComponent(packetId)
  if (base === "/studio") return `/studio?handoff=${encoded}#${targetToolId}`
  return `${base}${base.includes("?") ? "&" : "?"}handoff=${encoded}`
}

export const createLongformOptimizationHandoff = (input: {
  targetToolId: "thumbnail-studio" | "video-manager" | "content-analysis" | "ai-brain"
  channelId?: string | null
  projectId?: string | null
  analysis: LongformOptimizationAnalysis
}) => {
  const payloadKind = input.targetToolId === "video-manager" ? "metadata" as const : "analysis" as const
  const payload: LongformOptimizationHandoffPayload = {
    videoId: input.analysis.context.videoId,
    currentMetadata: input.analysis.context.currentMetadata,
    transcript: input.analysis.context.transcript,
    thumbnail: input.analysis.context.thumbnail,
    analytics: input.analysis.context.analytics,
    experiment: input.analysis.context.experiment,
    missingEvidence: input.analysis.context.missingEvidence,
    recommendation: input.analysis.response,
  }
  const packet = createViewTubeActionPacket({
    sourceToolId: "longform-optimizer",
    sourceKind: "widget",
    payloadKind,
    title: `${input.analysis.context.currentMetadata.title} optimization handoff`,
    summary: input.analysis.response.keyInsight || input.analysis.response.body,
    payload,
    contentBuildId: input.analysis.contentBuildId,
    projectId: input.projectId || null,
    channelId: input.channelId || null,
    videoId: input.analysis.context.videoId,
    evidence: input.analysis.response.evidenceIds || [],
    provenance: ["BrainRuntime", "analytics-canon/VT-SYNC", "ContentBuild", "Longform Optimizer"],
    suggestedTargets: [input.targetToolId],
  })
  persistViewTubeActionPacket(packet)
  return { packet, route: handoffRoute(input.targetToolId, packet.id) }
}

export const recordLongformOptimizationExecution = (input: {
  channelId?: string | null
  projectId?: string | null
  analysis: LongformOptimizationAnalysis
  note?: string
}) => {
  const source = input.analysis.recommendationEvent
  const event = input.channelId
    ? attachAlgorithmMonitoringSchedule(recordAlgorithmIntelligenceEvent({
        channelId: input.channelId,
        projectId: input.projectId || null,
        videoId: input.analysis.context.videoId,
        kind: "RECOMMENDATION_EXECUTED",
        sourceSystem: "workflow",
        sourceId: source?.id || input.analysis.response.id,
        parentEventIds: source ? [source.id] : [],
        recommendationId: source?.recommendationId || input.analysis.response.id,
        evidenceIds: input.analysis.response.evidenceIds || [],
        confidence: input.analysis.response.confidence,
        title: `Optimization change started: ${input.analysis.context.currentMetadata.title}`,
        summary: input.note || input.analysis.response.keyInsight || "Creator marked the recommended change as applied.",
        evaluationTargets: source?.evaluationTargets || evaluationTargetsFor(input.analysis.context),
        metadata: {
          contentBuildId: input.analysis.contentBuildId,
          experiment: input.analysis.context.experiment,
          creatorMarkedApplied: true,
        },
      }))
    : null

  if (input.analysis.contentBuildId) {
    appendContentBuildEvent({
      contentBuildId: input.analysis.contentBuildId,
      eventType: "experiment.started",
      entityType: "longform-optimization",
      entityId: event?.id || input.analysis.response.id,
      actorType: "creator",
      toolId: "longform-optimizer",
      evidenceIds: input.analysis.response.evidenceIds || [],
      metadata: {
        recommendationEventId: source?.id || null,
        executionEventId: event?.id || null,
        experiment: input.analysis.context.experiment,
        note: input.note || null,
      },
    })
  }
  return event
}

export const recordLongformOptimizationCreatorReview = (input: {
  contentBuildId: string
  review: "improved" | "same" | "worse" | "inconclusive"
  decision: "keep" | "iterate" | "rollback"
  note?: string
}) => appendContentBuildEvent({
  contentBuildId: input.contentBuildId,
  eventType: "learning.candidate.created",
  entityType: "longform-optimization-review",
  actorType: "creator",
  toolId: "longform-optimizer",
  metadata: {
    creatorReview: input.review,
    creatorDecision: input.decision,
    creatorNote: input.note || null,
    measuredOutcomeRemainsIndependent: true,
  },
})

export const listLongformOptimizationHistory = (input: {
  channelId?: string | null
  videoId: string
  contentBuildId?: string | null
}) => {
  const algorithm = input.channelId
    ? listAlgorithmIntelligenceEvents({ channelId: input.channelId, videoId: input.videoId })
    : []
  const buildEvents = input.contentBuildId ? listContentBuildEvents(input.contentBuildId) : []
  return [
    ...algorithm.map((event) => ({
      id: event.id,
      at: event.createdAt,
      kind: event.kind,
      summary: event.summary,
      source: "algorithm" as const,
      metadata: event.metadata,
    })),
    ...buildEvents.map((event) => ({
      id: event.id,
      at: new Date(event.timestamp).getTime(),
      kind: event.eventType,
      summary: String((event.metadata as Record<string, unknown> | undefined)?.note || event.eventType),
      source: "content-build" as const,
      metadata: event.metadata || {},
    })),
  ].sort((left, right) => right.at - left.at)
}
