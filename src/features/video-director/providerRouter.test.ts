import { describe, expect, it } from "vitest"
import {
  VideoProviderRegistry,
  buildVideoProviderRoutePlan,
} from "./providerRouter"
import {
  VideoDirectorGenerationRequestSchema,
  VideoProviderCapabilitiesSchema,
} from "./generationContracts"
import { VideoProviderHealthSchema } from "./providerRouter"

const request = VideoDirectorGenerationRequestSchema.parse({
  schemaVersion: 1,
  projectId: "p1",
  providerId: "auto",
  modelId: "auto",
  durationSeconds: 8,
  aspectRatio: "16:9",
  resolution: "720p",
  outputCount: 1,
  nativeAudio: false,
  seed: null,
  referenceAssetIds: [],
  negativeConstraints: [],
  compiledPrompt: "test",
  providerParameters: {},
})

const candidate = ({
  providerId,
  modelId,
  success = 1,
  latency = 1000,
  credits = 10,
  nativeAudio = false,
  availability = "healthy" as const,
}) => ({
  capabilities: VideoProviderCapabilitiesSchema.parse({
    providerId,
    modelId,
    label: modelId,
    textToVideo: true,
    nativeAudio,
    minDurationSeconds: 1,
    maxDurationSeconds: 30,
    aspectRatios: ["16:9", "9:16"],
    resolutions: ["720p"],
    maxReferenceCount: 0,
  }),
  health: VideoProviderHealthSchema.parse({
    providerId,
    modelId,
    availability,
    latencyP95Ms: latency,
    recentSuccessRate: success,
    queueDepth: 0,
    rateLimited: false,
    updatedAt: new Date().toISOString(),
  }),
  estimate: { credits },
})

describe("Video Director provider router", () => {
  it("prefers healthy reliable candidates while retaining a fallback chain", () => {
    const plan = buildVideoProviderRoutePlan(request, [
      candidate({ providerId: "slow", modelId: "a", latency: 100000, success: 0.85, credits: 10 }),
      candidate({ providerId: "fast", modelId: "b", latency: 5000, success: 0.99, credits: 12 }),
    ], { maxCredits: 30 })

    expect(plan.primary?.providerId).toBe("fast")
    expect(plan.fallbacks).toHaveLength(1)
  })

  it("rejects unhealthy or capability-incompatible providers", () => {
    const nativeAudioRequest = { ...request, nativeAudio: true }
    const plan = buildVideoProviderRoutePlan(nativeAudioRequest, [
      candidate({ providerId: "noaudio", modelId: "a", nativeAudio: false }),
      candidate({ providerId: "down", modelId: "b", nativeAudio: true, availability: "unavailable" }),
    ])

    expect(plan.primary).toBeNull()
    expect(plan.rejected).toHaveLength(2)
  })

  it("updates provider health without replacing capability metadata", () => {
    const registry = new VideoProviderRegistry()
    registry.register(candidate({ providerId: "p", modelId: "m" }))

    const changed = registry.updateHealth(VideoProviderHealthSchema.parse({
      providerId: "p",
      modelId: "m",
      availability: "degraded",
      latencyP95Ms: 90000,
      recentSuccessRate: 0.6,
      queueDepth: 30,
      rateLimited: false,
      updatedAt: new Date().toISOString(),
    }))

    expect(changed).toBe(true)
    expect(registry.list()[0].health.availability).toBe("degraded")
    expect(registry.list()[0].capabilities.label).toBe("m")
  })
})
