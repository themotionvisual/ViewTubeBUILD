import type { AlgorithmProjectContext } from "../../../services/brain/AlgorithmIntelligenceOrchestrator"
import type { AlgorithmRecommendation } from "../../../services/brain/AlgorithmStrategyEngine"
import { resolveBrainCommandRoute } from "../../../services/superToolActionPackets"

type DashboardProjectLike = {
  id?: string
  name?: string
  videoTitle?: string
  title?: string
  topic?: string
  subject?: string
  format?: string
  publishDate?: string
  plannedPublishAt?: string
  videoId?: string
  targetAudience?: string | string[]
  supportingVideoIds?: string[]
  evidenceIds?: string[]
  plan?: Record<string, unknown>
}

const toAudience = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 8)
  if (typeof value !== "string") return []
  return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 8)
}

const firstString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return null
}

export const buildDashboardAlgorithmProjectContext = (input: {
  channelId: string | null | undefined
  activeProjectId?: string | null
  projects?: readonly DashboardProjectLike[] | null
}): AlgorithmProjectContext | null => {
  if (!input.channelId) return null
  const projects = Array.isArray(input.projects) ? input.projects : []
  const project = projects.find((candidate) => candidate.id === input.activeProjectId) || projects[0]
  if (!project?.id) return null

  const plan = project.plan || {}
  const targetAudience = toAudience(
    project.targetAudience
      ?? plan.targetAudience
      ?? plan.audience
      ?? plan.audiencePromise,
  )

  return {
    channelId: input.channelId,
    projectId: project.id,
    videoId: firstString(project.videoId, plan.videoId),
    title: firstString(project.videoTitle, project.title, project.name, plan.title),
    topic: firstString(project.topic, project.subject, plan.topic, plan.subject),
    format: firstString(project.format, plan.format),
    plannedPublishAt: firstString(project.plannedPublishAt, project.publishDate, plan.publishDate, plan.plannedPublishAt),
    targetAudience,
    supportingVideoIds: Array.isArray(project.supportingVideoIds)
      ? project.supportingVideoIds.filter(Boolean).slice(0, 12)
      : [],
    evidenceIds: Array.isArray(project.evidenceIds)
      ? project.evidenceIds.filter(Boolean).slice(0, 20)
      : [],
  }
}

export const describeDashboardRecommendation = (recommendation: AlgorithmRecommendation) => ({
  id: recommendation.id,
  title: recommendation.title,
  rationale: recommendation.rationale,
  command: recommendation.command,
  score: Math.max(0, Math.min(100, Math.round(recommendation.score))),
  confidence: recommendation.confidence,
  evidenceCount: recommendation.evidenceIds.length,
  origin: recommendation.signalOrigin || "creator",
  route: recommendation.targetToolId
    ? resolveBrainCommandRoute(recommendation.targetToolId)
    : "/ai-brain",
  targetToolId: recommendation.targetToolId,
  checkpoint: recommendation.checkpoint,
})
