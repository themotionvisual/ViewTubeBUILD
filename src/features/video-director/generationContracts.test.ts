import { describe, expect, it } from "vitest"
import {
  VideoProviderCapabilitiesSchema,
  buildVideoDirectorGenerationRequest,
  createVideoDirectorIdempotencyKey,
} from "./generationContracts"
import { createEmptyVideoDirectorProject } from "./projectSchema"

const capabilities = VideoProviderCapabilitiesSchema.parse({
  providerId: "test-provider",
  modelId: "test-model",
  label: "Test Model",
  textToVideo: true,
  imageReferences: true,
  startFrame: true,
  endFrame: true,
  nativeAudio: false,
  seed: true,
  negativePrompt: true,
  minDurationSeconds: 2,
  maxDurationSeconds: 12,
  aspectRatios: ["16:9", "9:16"],
  resolutions: ["720p", "1080p"],
  maxReferenceCount: 2,
})

describe("Video Director generation contracts", () => {
  it("blocks provider-incompatible duration and output settings before submission", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["timing-pacing"].payload.durationSeconds = 30
    project.categories["generation-output"].payload.resolution = "4k"

    const result = buildVideoDirectorGenerationRequest({ project, capabilities })

    expect(result.ready).toBe(false)
    expect(result.normalizedRequest).toBeNull()
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["duration_unsupported", "resolution_unsupported"]),
    )
  })

  it("downgrades unsupported native audio to a warning instead of blocking deterministic assembly", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["generation-output"].payload.generateAudio = true

    const result = buildVideoDirectorGenerationRequest({ project, capabilities })

    expect(result.ready).toBe(true)
    expect(result.normalizedRequest?.nativeAudio).toBe(false)
    expect(result.issues.some((issue) => issue.code === "native_audio_unsupported")).toBe(true)
  })

  it("creates deterministic SHA-256 keys for the same normalized request", async () => {
    const project = createEmptyVideoDirectorProject()
    const result = buildVideoDirectorGenerationRequest({ project, capabilities })
    expect(result.normalizedRequest).not.toBeNull()

    const request = result.normalizedRequest!
    const a = await createVideoDirectorIdempotencyKey({ request, assetHashes: ["bbb", "aaa"] })
    const b = await createVideoDirectorIdempotencyKey({ request, assetHashes: ["aaa", "bbb"] })

    expect(a).toBe(b)
    expect(a).toMatch(/^vtd-[0-9a-f]{64}$/)
  })

  it("changes the idempotency identity when an intentional nonce is supplied", async () => {
    const project = createEmptyVideoDirectorProject()
    const request = buildVideoDirectorGenerationRequest({ project, capabilities }).normalizedRequest!

    const first = await createVideoDirectorIdempotencyKey({ request })
    const reroll = await createVideoDirectorIdempotencyKey({ request, nonce: "new-seed-request" })

    expect(reroll).not.toBe(first)
  })
})
