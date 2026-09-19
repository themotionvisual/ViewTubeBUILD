import { z } from "zod"
import type {
  VideoDirectorCostEstimate,
  VideoDirectorGenerationRequest,
  VideoProviderCapabilities,
} from "./generationContracts"
import {
  VideoDirectorGenerationRequestSchema,
  VideoProviderCapabilitiesSchema,
} from "./generationContracts"

export const VideoProviderHealthSchema = z.object({
  providerId: z.string().trim().min(1),
  modelId: z.string().trim().min(1),
  availability: z.enum(["healthy", "degraded", "unavailable"]).default("healthy"),
  latencyP95Ms: z.number().min(0).default(0),
  recentSuccessRate: z.number().min(0).max(1).default(1),
  queueDepth: z.number().int().min(0).default(0),
  rateLimited: z.boolean().default(false),
  updatedAt: z.string().datetime(),
}).strict()

export type VideoProviderHealth = z.infer<typeof VideoProviderHealthSchema>

export interface VideoProviderRouteCandidate {
  capabilities: VideoProviderCapabilities
  health: VideoProviderHealth
  estimate: VideoDirectorCostEstimate
}

export interface VideoProviderRouteScore {
  providerId: string
  modelId: string
  compatible: boolean
  blockingReasons: string[]
  score: number
  reliabilityScore: number
  latencyScore: number
  costScore: number
  queueScore: number
  candidate: VideoProviderRouteCandidate
}

export interface VideoProviderRoutePlan {
  primary: VideoProviderRouteScore | null
  fallbacks: VideoProviderRouteScore[]
  rejected: VideoProviderRouteScore[]
}

const supportsRequest = (
  capabilities: VideoProviderCapabilities,
  request: VideoDirectorGenerationRequest,
): string[] => {
  const reasons: string[] = []

  if (
    request.durationSeconds < capabilities.minDurationSeconds ||
    request.durationSeconds > capabilities.maxDurationSeconds
  ) {
    reasons.push("duration")
  }

  if (!capabilities.aspectRatios.includes(request.aspectRatio)) {
    reasons.push("aspect-ratio")
  }

  if (!capabilities.resolutions.includes(request.resolution)) {
    reasons.push("resolution")
  }

  if (request.nativeAudio && !capabilities.nativeAudio) {
    reasons.push("native-audio")
  }

  if (request.seed !== null && !capabilities.seed) {
    reasons.push("seed")
  }

  if (request.startFrameAssetId && !capabilities.startFrame) {
    reasons.push("start-frame")
  }

  if (request.endFrameAssetId && !capabilities.endFrame) {
    reasons.push("end-frame")
  }

  if (request.referenceAssetIds.length > capabilities.maxReferenceCount) {
    reasons.push("reference-count")
  }

  if (request.referenceAssetIds.length > 0 && !capabilities.imageReferences && !capabilities.videoReferences) {
    reasons.push("references")
  }

  if (request.negativeConstraints.length > 0 && !capabilities.negativePrompt) {
    reasons.push("negative-constraints")
  }

  return reasons
}

const normalizedInverse = (value: number, ceiling: number) =>
  Math.max(0, Math.min(1, 1 - value / Math.max(1, ceiling)))

const normalizedCost = (credits: number, maxCredits: number) =>
  normalizedInverse(credits, Math.max(1, maxCredits))

export const scoreVideoProviderCandidate = (
  requestInput: VideoDirectorGenerationRequest,
  candidateInput: VideoProviderRouteCandidate,
  options: {
    maxLatencyMs?: number
    maxCredits?: number
    weights?: {
      reliability?: number
      latency?: number
      cost?: number
      queue?: number
    }
  } = {},
): VideoProviderRouteScore => {
  const request = VideoDirectorGenerationRequestSchema.parse(requestInput)
  const candidate = {
    capabilities: VideoProviderCapabilitiesSchema.parse(candidateInput.capabilities),
    health: VideoProviderHealthSchema.parse(candidateInput.health),
    estimate: candidateInput.estimate,
  }

  const blockingReasons = supportsRequest(candidate.capabilities, request)
  if (candidate.health.availability === "unavailable") blockingReasons.push("unavailable")
  if (candidate.health.rateLimited) blockingReasons.push("rate-limited")

  const compatible = blockingReasons.length === 0
  const maxLatencyMs = options.maxLatencyMs ?? 120_000
  const maxCredits = options.maxCredits ?? Math.max(1, candidate.estimate.credits * 2)

  const reliabilityScore =
    candidate.health.availability === "degraded"
      ? candidate.health.recentSuccessRate * 0.65
      : candidate.health.recentSuccessRate
  const latencyScore = normalizedInverse(candidate.health.latencyP95Ms, maxLatencyMs)
  const costScore = normalizedCost(candidate.estimate.credits, maxCredits)
  const queueScore = normalizedInverse(candidate.health.queueDepth, 100)

  const weights = {
    reliability: options.weights?.reliability ?? 0.45,
    latency: options.weights?.latency ?? 0.2,
    cost: options.weights?.cost ?? 0.25,
    queue: options.weights?.queue ?? 0.1,
  }
  const totalWeight =
    weights.reliability + weights.latency + weights.cost + weights.queue || 1

  const score = compatible
    ? (
        reliabilityScore * weights.reliability +
        latencyScore * weights.latency +
        costScore * weights.cost +
        queueScore * weights.queue
      ) / totalWeight
    : -1

  return {
    providerId: candidate.capabilities.providerId,
    modelId: candidate.capabilities.modelId,
    compatible,
    blockingReasons,
    score,
    reliabilityScore,
    latencyScore,
    costScore,
    queueScore,
    candidate,
  }
}

export const buildVideoProviderRoutePlan = (
  requestInput: VideoDirectorGenerationRequest,
  candidates: VideoProviderRouteCandidate[],
  options: Parameters<typeof scoreVideoProviderCandidate>[2] = {},
): VideoProviderRoutePlan => {
  const request = VideoDirectorGenerationRequestSchema.parse(requestInput)
  const scored = candidates
    .map((candidate) => scoreVideoProviderCandidate(request, candidate, options))
    .sort((a, b) => b.score - a.score)

  const compatible = scored.filter((item) => item.compatible)
  const rejected = scored.filter((item) => !item.compatible)

  return {
    primary: compatible[0] ?? null,
    fallbacks: compatible.slice(1),
    rejected,
  }
}

export const buildManualVideoProviderRoutePlan = (
  requestInput: VideoDirectorGenerationRequest,
  candidates: VideoProviderRouteCandidate[],
): VideoProviderRoutePlan => {
  const request = VideoDirectorGenerationRequestSchema.parse(requestInput)
  const exact = candidates.filter(
    (candidate) =>
      candidate.capabilities.providerId === request.providerId &&
      candidate.capabilities.modelId === request.modelId,
  )

  if (!exact.length) {
    return { primary: null, fallbacks: [], rejected: [] }
  }

  const exactScore = scoreVideoProviderCandidate(request, exact[0])
  return exactScore.compatible
    ? { primary: exactScore, fallbacks: [], rejected: [] }
    : { primary: null, fallbacks: [], rejected: [exactScore] }
}

export class VideoProviderRegistry {
  #candidates = new Map<string, VideoProviderRouteCandidate>()

  #key(providerId: string, modelId: string) {
    return `${providerId}::${modelId}`
  }

  register(candidateInput: VideoProviderRouteCandidate) {
    const candidate = {
      capabilities: VideoProviderCapabilitiesSchema.parse(candidateInput.capabilities),
      health: VideoProviderHealthSchema.parse(candidateInput.health),
      estimate: { ...candidateInput.estimate },
    }
    this.#candidates.set(
      this.#key(candidate.capabilities.providerId, candidate.capabilities.modelId),
      candidate,
    )
  }

  unregister(providerId: string, modelId: string) {
    this.#candidates.delete(this.#key(providerId, modelId))
  }

  list(): VideoProviderRouteCandidate[] {
    return [...this.#candidates.values()].map((candidate) => ({
      capabilities: structuredClone(candidate.capabilities),
      health: structuredClone(candidate.health),
      estimate: structuredClone(candidate.estimate),
    }))
  }

  updateHealth(healthInput: VideoProviderHealth) {
    const health = VideoProviderHealthSchema.parse(healthInput)
    const key = this.#key(health.providerId, health.modelId)
    const existing = this.#candidates.get(key)
    if (!existing) return false
    this.#candidates.set(key, { ...existing, health })
    return true
  }

  route(request: VideoDirectorGenerationRequest, mode: "auto" | "manual" = "auto") {
    const candidates = this.list()
    return mode === "manual"
      ? buildManualVideoProviderRoutePlan(request, candidates)
      : buildVideoProviderRoutePlan(request, candidates)
  }
}
