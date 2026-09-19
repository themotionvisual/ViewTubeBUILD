import { z } from "zod"
import {
  VideoDirectorGenerationRequestSchema,
  type VideoDirectorGenerationRequest,
} from "./generationContracts"

export const VideoDirectorRemoteJobSchema = z.object({
  id: z.string().min(1),
  viewtubeUserId: z.string().min(1),
  projectId: z.string().min(1),
  shotId: z.string().nullable(),
  variantId: z.string().nullable(),
  idempotencyKey: z.string().min(1),
  status: z.enum([
    "queued",
    "running",
    "post-processing",
    "completed",
    "failed",
    "dead-letter",
    "cancelled",
  ]),
  priority: z.number(),
  request: z.record(z.string(), z.unknown()),
  providerPlan: z.record(z.string(), z.unknown()),
  providerId: z.string().nullable(),
  modelId: z.string().nullable(),
  providerJobId: z.string().nullable(),
  outputAssetIds: z.array(z.string()),
  estimatedCredits: z.union([z.number(), z.string()]).nullable(),
  actualCredits: z.union([z.number(), z.string()]).nullable(),
  attemptCount: z.number(),
  maxAttempts: z.number(),
  cancelRequested: z.boolean(),
  lockedBy: z.string().nullable(),
  lockedAt: z.string().nullable(),
  heartbeatAt: z.string().nullable(),
  availableAt: z.string(),
  lastError: z.string().nullable(),
  failureMetadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
}).strict()

export type VideoDirectorRemoteJob = z.infer<typeof VideoDirectorRemoteJobSchema>

const VideoDirectorApiErrorSchema = z.object({
  error: z.object({
    code: z.string().optional(),
    message: z.string().optional(),
    issues: z.array(z.object({
      path: z.string(),
      message: z.string(),
      code: z.string(),
    })).optional(),
  }),
}).passthrough()

export class VideoDirectorApiError extends Error {
  status: number
  code: string
  issues?: Array<{ path: string; message: string; code: string }>

  constructor({
    status,
    code,
    message,
    issues,
  }: {
    status: number
    code: string
    message: string
    issues?: Array<{ path: string; message: string; code: string }>
  }) {
    super(message)
    this.name = "VideoDirectorApiError"
    this.status = status
    this.code = code
    this.issues = issues
  }
}

const readJson = async (response: Response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const requestJson = async <T>(
  path: string,
  init: RequestInit,
  parse: (value: unknown) => T,
): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  })
  const payload = await readJson(response)

  if (!response.ok) {
    const parsed = VideoDirectorApiErrorSchema.safeParse(payload)
    throw new VideoDirectorApiError({
      status: response.status,
      code: parsed.success ? parsed.data.error.code || "VIDEO_DIRECTOR_API_ERROR" : "VIDEO_DIRECTOR_API_ERROR",
      message: parsed.success ? parsed.data.error.message || "Video Director request failed." : "Video Director request failed.",
      issues: parsed.success ? parsed.data.error.issues : undefined,
    })
  }

  return parse(payload)
}

const RemoteJobEnvelopeSchema = z.object({
  job: VideoDirectorRemoteJobSchema,
}).strict()

const RemoteJobsEnvelopeSchema = z.object({
  jobs: z.array(VideoDirectorRemoteJobSchema),
}).strict()

export interface SubmitVideoDirectorJobInput {
  projectId: string
  shotId?: string
  variantId?: string
  idempotencyKey: string
  priority?: number
  maxAttempts?: number
  estimatedCredits?: number | null
  providerId?: string
  modelId?: string
  providerPlan?: Record<string, unknown>
  request: VideoDirectorGenerationRequest
}

export const submitVideoDirectorJob = async (
  input: SubmitVideoDirectorJobInput,
  signal?: AbortSignal,
): Promise<VideoDirectorRemoteJob> => {
  const request = VideoDirectorGenerationRequestSchema.parse(input.request)
  const payload = {
    projectId: input.projectId,
    shotId: input.shotId,
    variantId: input.variantId,
    idempotencyKey: input.idempotencyKey,
    priority: input.priority ?? 0,
    maxAttempts: input.maxAttempts ?? 3,
    estimatedCredits: input.estimatedCredits ?? null,
    providerId: input.providerId,
    modelId: input.modelId,
    providerPlan: input.providerPlan ?? {},
    request,
  }

  return requestJson(
    "/api/video-director/jobs",
    {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    },
    (value) => RemoteJobEnvelopeSchema.parse(value).job,
  )
}

export const listVideoDirectorJobs = async ({
  projectId,
  limit = 100,
  signal,
}: {
  projectId?: string
  limit?: number
  signal?: AbortSignal
} = {}): Promise<VideoDirectorRemoteJob[]> => {
  const params = new URLSearchParams()
  if (projectId) params.set("projectId", projectId)
  params.set("limit", String(Math.max(1, Math.min(500, Math.trunc(limit)))))
  const suffix = params.toString() ? `?${params.toString()}` : ""

  return requestJson(
    `/api/video-director/jobs${suffix}`,
    { method: "GET", signal },
    (value) => RemoteJobsEnvelopeSchema.parse(value).jobs,
  )
}

export const getVideoDirectorJob = async (
  jobId: string,
  signal?: AbortSignal,
): Promise<VideoDirectorRemoteJob> =>
  requestJson(
    `/api/video-director/jobs/${encodeURIComponent(jobId)}`,
    { method: "GET", signal },
    (value) => RemoteJobEnvelopeSchema.parse(value).job,
  )

export const cancelVideoDirectorJob = async (
  jobId: string,
  signal?: AbortSignal,
): Promise<VideoDirectorRemoteJob> =>
  requestJson(
    `/api/video-director/jobs/${encodeURIComponent(jobId)}/cancel`,
    { method: "POST", signal },
    (value) => RemoteJobEnvelopeSchema.parse(value).job,
  )

export const isTerminalVideoDirectorJobStatus = (
  status: VideoDirectorRemoteJob["status"],
) => status === "completed" || status === "failed" || status === "dead-letter" || status === "cancelled"
