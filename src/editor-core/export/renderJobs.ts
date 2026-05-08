import type { RenderJobRequest, RenderJobStatus } from "../contracts";

type LocalRenderJob = {
  request: RenderJobRequest;
  createdAtMs: number;
  status: RenderJobStatus["status"];
  outputUrl?: string;
  error?: string;
};

const LOCAL_RENDER_JOBS = new Map<string, LocalRenderJob>();

const validateJobRequest = (request: RenderJobRequest): string[] => {
  const issues: string[] = [];
  if (!request.projectId) issues.push("projectId is required");
  if (!request.compositionSpec) issues.push("compositionSpec is required");
  if ((request.compositionSpec?.fps ?? 0) <= 0) issues.push("compositionSpec.fps must be > 0");
  if ((request.compositionSpec?.width ?? 0) <= 0) issues.push("compositionSpec.width must be > 0");
  if ((request.compositionSpec?.height ?? 0) <= 0) issues.push("compositionSpec.height must be > 0");
  if ((request.compositionSpec?.durationInFrames ?? 0) <= 0) issues.push("compositionSpec.durationInFrames must be > 0");
  return issues;
};

const asLocalProgress = (elapsedMs: number): number => {
  if (elapsedMs < 1000) return 0.05;
  if (elapsedMs < 2500) return 0.35;
  if (elapsedMs < 4500) return 0.72;
  if (elapsedMs < 6500) return 0.92;
  return 1;
};

const buildLocalRenderArtifactUrl = (
  request: RenderJobRequest,
  jobId: string,
): string => {
  const payload = {
    message:
      "Local dev fallback render artifact. Start backend Remotion API for real render output.",
    jobId,
    format: request.format,
    resolutionProfile: request.resolutionProfile,
    aspect: request.aspect,
    compositionSpec: request.compositionSpec,
    generatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  return URL.createObjectURL(blob);
};

const enqueueLocalRenderJob = (
  request: RenderJobRequest,
): RenderJobStatus => {
  const issues = validateJobRequest(request);
  if (issues.length) {
    return {
      jobId: `local-render-${Date.now()}`,
      status: "failed",
      progress: 1,
      errorCode: "contract_invalid",
      error: `Invalid render request: ${issues.join("; ")}`,
      diagnostics: {
        renderMode: request.renderMode,
        qualityProfile: request.qualityProfile,
        issues,
      },
    };
  }
  const jobId = `local-render-${Date.now()}`;
  LOCAL_RENDER_JOBS.set(jobId, {
    request,
    createdAtMs: Date.now(),
    status: "queued",
  });
  return { jobId, status: "queued", progress: 0.05 };
};

const pollLocalRenderJob = (jobId: string): RenderJobStatus => {
  const entry = LOCAL_RENDER_JOBS.get(jobId);
  if (!entry) {
    return {
      jobId,
      status: "failed",
      error: "Local render job not found.",
      errorCode: "job_not_found",
      progress: 1,
    };
  }

  const elapsedMs = Date.now() - entry.createdAtMs;
  if (elapsedMs >= 6500) {
    if (!entry.outputUrl) {
      entry.outputUrl = buildLocalRenderArtifactUrl(entry.request, jobId);
    }
    entry.status = "done";
    LOCAL_RENDER_JOBS.set(jobId, entry);
    return {
      jobId,
      status: "done",
      progress: 1,
      outputUrl: entry.outputUrl,
    };
  }

  entry.status = elapsedMs < 1000 ? "queued" : "rendering";
  LOCAL_RENDER_JOBS.set(jobId, entry);
  return {
    jobId,
    status: entry.status,
    progress: asLocalProgress(elapsedMs),
  };
};

export const createRenderJobRequest = (
  input: RenderJobRequest,
): RenderJobRequest => {
  return input;
};

export const enqueueRemotionRenderJob = async (
  apiBase: string,
  request: RenderJobRequest,
): Promise<RenderJobStatus> => {
  try {
    const response = await fetch(`${apiBase}/api/remotion/render-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return enqueueLocalRenderJob(request);
      }
      return {
        jobId: `remote-failed-${Date.now()}`,
        status: "failed",
        progress: 1,
        errorCode: "ffmpeg_failed",
        error: `Render queue failed (${response.status})`,
        diagnostics: {
          renderMode: request.renderMode,
          qualityProfile: request.qualityProfile,
        },
      };
    }

    const data = (await response.json()) as RenderJobStatus;
    if (!data.jobId || !data.status) {
      throw new Error("Render queue returned invalid response.");
    }
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : "";
    const isNetworkFailure =
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("load failed");
    if (isNetworkFailure) {
      return enqueueLocalRenderJob(request);
    }
    throw error;
  }
};

export const pollRemotionRenderJob = async (
  apiBase: string,
  jobId: string,
): Promise<RenderJobStatus> => {
  if (jobId.startsWith("local-render-")) {
    return pollLocalRenderJob(jobId);
  }

  try {
    const response = await fetch(
      `${apiBase}/api/remotion/render-jobs/${encodeURIComponent(jobId)}`,
      { method: "GET" },
    );
    if (!response.ok) {
      if (response.status === 404) {
        return {
          jobId,
          status: "failed",
          progress: 1,
          errorCode: "api_unavailable",
          error:
            "Render API route not found. Start backend API server or use local fallback by re-queueing.",
        };
      }
      throw new Error(`Render status failed (${response.status})`);
    }
    const data = (await response.json()) as RenderJobStatus;
    if (!data.jobId || !data.status) {
      throw new Error("Render status returned invalid response.");
    }
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : "";
    const isNetworkFailure =
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("load failed");
    if (isNetworkFailure) {
      return {
        jobId,
        status: "failed",
        progress: 1,
        error: "Render API unavailable while polling job status.",
      };
    }
    throw error;
  }
};
