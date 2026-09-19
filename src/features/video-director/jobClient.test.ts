import { afterEach, describe, expect, it, vi } from "vitest"
import {
  VideoDirectorApiError,
  cancelVideoDirectorJob,
  getVideoDirectorJob,
  listVideoDirectorJobs,
  submitVideoDirectorJob,
} from "./jobClient"
import { VideoDirectorGenerationRequestSchema } from "./generationContracts"

const remoteJob = {
  id: "job-1",
  viewtubeUserId: "user-1",
  projectId: "project-1",
  shotId: null,
  variantId: null,
  idempotencyKey: "idem-key-123456789",
  status: "queued",
  priority: 0,
  request: {},
  providerPlan: {},
  providerId: null,
  modelId: null,
  providerJobId: null,
  outputAssetIds: [],
  estimatedCredits: null,
  actualCredits: null,
  attemptCount: 0,
  maxAttempts: 3,
  cancelRequested: false,
  lockedBy: null,
  lockedAt: null,
  heartbeatAt: null,
  availableAt: new Date().toISOString(),
  lastError: null,
  failureMetadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const generationRequest = VideoDirectorGenerationRequestSchema.parse({
  schemaVersion: 1,
  projectId: "project-1",
  providerId: "provider",
  modelId: "model",
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

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  })

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Video Director job client", () => {
  it("submits validated jobs with credentials and JSON", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ job: remoteJob }, 202),
    )

    const job = await submitVideoDirectorJob({
      projectId: "project-1",
      idempotencyKey: "idem-key-123456789",
      request: generationRequest,
    })

    expect(job.id).toBe("job-1")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init?.credentials).toBe("include")
    expect(init?.method).toBe("POST")
  })

  it("lists and retrieves signed-in user's jobs", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ jobs: [remoteJob] }))
      .mockResolvedValueOnce(jsonResponse({ job: remoteJob }))

    expect((await listVideoDirectorJobs({ projectId: "project-1" }))).toHaveLength(1)
    expect((await getVideoDirectorJob("job-1")).id).toBe("job-1")
    expect(String(fetchMock.mock.calls[0][0])).toContain("projectId=project-1")
  })

  it("sends cancellation through the server rather than mutating local state", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ job: { ...remoteJob, status: "cancelled", cancelRequested: true } }),
    )

    const job = await cancelVideoDirectorJob("job-1")
    expect(job.status).toBe("cancelled")
    expect(fetchMock.mock.calls[0][0]).toBe("/api/video-director/jobs/job-1/cancel")
  })

  it("surfaces structured API validation errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        error: {
          code: "INVALID_VIDEO_DIRECTOR_PAYLOAD",
          message: "Validation failed.",
          issues: [{ path: "request.durationSeconds", message: "Too big", code: "too_big" }],
        },
      }, 400),
    )

    await expect(listVideoDirectorJobs()).rejects.toMatchObject({
      name: "VideoDirectorApiError",
      status: 400,
      code: "INVALID_VIDEO_DIRECTOR_PAYLOAD",
    } satisfies Partial<VideoDirectorApiError>)
  })
})
