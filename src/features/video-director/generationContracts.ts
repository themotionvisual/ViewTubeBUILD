import { z } from "zod"
import type { VideoDirectorProject } from "./projectSchema"
import { VideoDirectorProjectSchema } from "./projectSchema"

export const VideoProviderCapabilitiesSchema = z.object({
  providerId: z.string().trim().min(1),
  modelId: z.string().trim().min(1),
  label: z.string().trim().min(1),
  textToVideo: z.boolean().default(true),
  imageReferences: z.boolean().default(false),
  videoReferences: z.boolean().default(false),
  audioReferences: z.boolean().default(false),
  startFrame: z.boolean().default(false),
  endFrame: z.boolean().default(false),
  nativeAudio: z.boolean().default(false),
  nativeCameraControls: z.boolean().default(false),
  seed: z.boolean().default(false),
  negativePrompt: z.boolean().default(false),
  videoExtension: z.boolean().default(false),
  cancellation: z.boolean().default(false),
  minDurationSeconds: z.number().min(0.1).default(1),
  maxDurationSeconds: z.number().min(0.1).default(30),
  aspectRatios: z.array(z.string().trim().min(1)).min(1),
  resolutions: z.array(z.string().trim().min(1)).min(1),
  maxReferenceCount: z.number().int().min(0).default(0),
}).strict().refine(
  (value) => value.maxDurationSeconds >= value.minDurationSeconds,
  "maxDurationSeconds must be greater than or equal to minDurationSeconds",
)

export type VideoProviderCapabilities = z.infer<typeof VideoProviderCapabilitiesSchema>

export const VideoDirectorProviderJobStatusSchema = z.enum([
  "queued",
  "running",
  "post-processing",
  "completed",
  "failed",
  "cancelled",
])

export const VideoDirectorProviderJobSchema = z.object({
  providerJobId: z.string().trim().min(1),
  status: VideoDirectorProviderJobStatusSchema,
  progress: z.number().min(0).max(1).optional(),
  previewAssetUri: z.string().optional(),
  outputAssetUris: z.array(z.string()).default([]),
  providerMetadata: z.record(z.string(), z.unknown()).default({}),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
}).strict()

export type VideoDirectorProviderJob = z.infer<typeof VideoDirectorProviderJobSchema>

export const VideoDirectorGenerationRequestSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: z.string().trim().min(1),
  shotId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  providerId: z.string().trim().min(1),
  modelId: z.string().trim().min(1),
  durationSeconds: z.number().min(0.1).max(3_600),
  aspectRatio: z.string().trim().min(1),
  resolution: z.string().trim().min(1),
  outputCount: z.number().int().min(1).max(24),
  nativeAudio: z.boolean(),
  seed: z.number().int().min(0).max(2_147_483_647).nullable(),
  startFrameAssetId: z.string().trim().min(1).optional(),
  endFrameAssetId: z.string().trim().min(1).optional(),
  referenceAssetIds: z.array(z.string().trim().min(1)).max(64).default([]),
  negativeConstraints: z.array(z.string().trim().min(1)).max(512).default([]),
  compiledPrompt: z.string().max(100_000).default(""),
  providerParameters: z.record(z.string(), z.unknown()).default({}),
}).strict()

export type VideoDirectorGenerationRequest = z.infer<typeof VideoDirectorGenerationRequestSchema>

export interface VideoDirectorCostEstimate {
  credits: number
  currencyAmount?: number
  currency?: string
  breakdown?: Record<string, number>
}

export interface BaseVideoProvider {
  readonly id: string
  getCapabilities(modelId: string): Promise<VideoProviderCapabilities>
  estimateCost(request: VideoDirectorGenerationRequest): Promise<VideoDirectorCostEstimate>
  submit(request: VideoDirectorGenerationRequest, idempotencyKey: string): Promise<VideoDirectorProviderJob>
  getJob(providerJobId: string): Promise<VideoDirectorProviderJob>
  cancel?(providerJobId: string): Promise<{ cancelled: boolean; mayStillBill: boolean }>
}

export interface VideoDirectorPreflightIssue {
  code: string
  severity: "warning" | "blocking"
  message: string
  categoryId?: string
  field?: string
}

export interface VideoDirectorPreflightResult {
  ready: boolean
  issues: VideoDirectorPreflightIssue[]
  normalizedRequest: VideoDirectorGenerationRequest | null
}

const gatherReferenceIds = (project: VideoDirectorProject) =>
  project.categories["references-seeds"].payload.references.map((reference) => reference.assetId)

const gatherNegativeConstraints = (project: VideoDirectorProject) => {
  const negative = project.categories["negative-constraints"].payload
  return [...negative.tags, ...negative.forbiddenObjects, ...negative.forbiddenTraits, negative.freeText]
    .map((item) => item.trim())
    .filter(Boolean)
}

export const buildVideoDirectorGenerationRequest = ({
  project,
  capabilities,
  shotId,
  variantId,
}: {
  project: VideoDirectorProject
  capabilities: VideoProviderCapabilities
  shotId?: string
  variantId?: string
}): VideoDirectorPreflightResult => {
  const validatedProject = VideoDirectorProjectSchema.parse(project)
  const issues: VideoDirectorPreflightIssue[] = []
  const output = validatedProject.categories["generation-output"].payload
  const timing = validatedProject.categories["timing-pacing"].payload
  const references = validatedProject.categories["references-seeds"].payload

  if (timing.durationSeconds < capabilities.minDurationSeconds || timing.durationSeconds > capabilities.maxDurationSeconds) {
    issues.push({
      code: "duration_unsupported",
      severity: "blocking",
      categoryId: "timing-pacing",
      field: "durationSeconds",
      message: `${capabilities.label} supports ${capabilities.minDurationSeconds}–${capabilities.maxDurationSeconds}s clips.`,
    })
  }

  if (!capabilities.aspectRatios.includes(output.aspectRatio)) {
    issues.push({
      code: "aspect_ratio_unsupported",
      severity: "blocking",
      categoryId: "generation-output",
      field: "aspectRatio",
      message: `${capabilities.label} does not support ${output.aspectRatio} output.`,
    })
  }

  if (!capabilities.resolutions.includes(output.resolution)) {
    issues.push({
      code: "resolution_unsupported",
      severity: "blocking",
      categoryId: "generation-output",
      field: "resolution",
      message: `${capabilities.label} does not support ${output.resolution} output.`,
    })
  }

  if (output.generateAudio && !capabilities.nativeAudio) {
    issues.push({
      code: "native_audio_unsupported",
      severity: "warning",
      categoryId: "generation-output",
      field: "generateAudio",
      message: `${capabilities.label} cannot generate native audio; ViewTube can add audio during assembly instead.`,
    })
  }

  if (references.lockSeed && references.seed !== null && !capabilities.seed) {
    issues.push({
      code: "seed_unsupported",
      severity: "warning",
      categoryId: "references-seeds",
      field: "seed",
      message: `${capabilities.label} does not expose deterministic seed control.`,
    })
  }

  const referenceAssetIds = gatherReferenceIds(validatedProject)
  if (referenceAssetIds.length > capabilities.maxReferenceCount) {
    issues.push({
      code: "reference_limit_exceeded",
      severity: "blocking",
      categoryId: "references-seeds",
      field: "references",
      message: `${capabilities.label} accepts at most ${capabilities.maxReferenceCount} references; ${referenceAssetIds.length} are configured.`,
    })
  }

  const shot = shotId
    ? validatedProject.shots.find((candidate) => candidate.id === shotId)
    : undefined

  if (shot?.startFrameAssetId && !capabilities.startFrame) {
    issues.push({
      code: "start_frame_unsupported",
      severity: "blocking",
      categoryId: "references-seeds",
      message: `${capabilities.label} cannot honor the selected start-frame anchor.`,
    })
  }

  if (shot?.endFrameAssetId && !capabilities.endFrame) {
    issues.push({
      code: "end_frame_unsupported",
      severity: "blocking",
      categoryId: "references-seeds",
      message: `${capabilities.label} cannot honor the selected end-frame anchor.`,
    })
  }

  const blocking = issues.some((issue) => issue.severity === "blocking")
  if (blocking) {
    return { ready: false, issues, normalizedRequest: null }
  }

  const request = VideoDirectorGenerationRequestSchema.parse({
    schemaVersion: 1,
    projectId: validatedProject.id,
    shotId,
    variantId,
    providerId: capabilities.providerId,
    modelId: capabilities.modelId,
    durationSeconds: shot?.durationSeconds ?? timing.durationSeconds,
    aspectRatio: output.aspectRatio,
    resolution: output.resolution,
    outputCount: output.outputs,
    nativeAudio: output.generateAudio && capabilities.nativeAudio,
    seed: capabilities.seed ? references.seed : null,
    startFrameAssetId: shot?.startFrameAssetId,
    endFrameAssetId: shot?.endFrameAssetId,
    referenceAssetIds,
    negativeConstraints: gatherNegativeConstraints(validatedProject),
    compiledPrompt: "",
    providerParameters: {},
  })

  return { ready: true, issues, normalizedRequest: request }
}

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalize(item)]),
    )
  }
  return value
}

const bytesToHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("")

export const createVideoDirectorIdempotencyKey = async ({
  request,
  assetHashes = [],
  schemaVersion = 1,
  nonce,
}: {
  request: VideoDirectorGenerationRequest
  assetHashes?: string[]
  schemaVersion?: number
  nonce?: string
}): Promise<string> => {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto SHA-256 support is required for generation idempotency.")
  }

  const canonical = JSON.stringify(
    canonicalize({
      schemaVersion,
      request: VideoDirectorGenerationRequestSchema.parse(request),
      assetHashes: [...assetHashes].sort(),
      nonce,
    }),
  )
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical),
  )
  return `vtd-${bytesToHex(digest)}`
}
