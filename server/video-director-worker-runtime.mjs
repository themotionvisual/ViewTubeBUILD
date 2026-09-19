import {
  bindVideoDirectorJobProvider,
  claimNextVideoDirectorJob,
  completeVideoDirectorJob,
  failVideoDirectorJob,
  finalizeCancelledVideoDirectorJob,
  getVideoDirectorJob,
  heartbeatVideoDirectorJob,
  markVideoDirectorJobPostProcessing,
  updateVideoDirectorJobProgress,
} from "./video-director-job-store.mjs";

const TERMINAL_PROVIDER_STATES = new Set(["completed", "failed", "cancelled"]);

export class VideoProviderSubmissionError extends Error {
  constructor(message, {
    code = "PROVIDER_SUBMISSION_FAILED",
    safeToFallback = false,
    metadata = {},
  } = {}) {
    super(message);
    this.name = "VideoProviderSubmissionError";
    this.code = code;
    this.safeToFallback = Boolean(safeToFallback);
    this.metadata = metadata && typeof metadata === "object" ? metadata : {};
  }
}

const assertAdapter = (adapter) => {
  if (!adapter || typeof adapter !== "object") throw new Error("Provider adapter must be an object.");
  if (!String(adapter.id || "").trim()) throw new Error("Provider adapter id is required.");
  for (const method of ["supportsModel", "submit", "getJob"]) {
    if (typeof adapter[method] !== "function") {
      throw new Error(`Provider adapter ${adapter.id} must implement ${method}().`);
    }
  }
  return adapter;
};

export class VideoDirectorServerProviderRegistry {
  #adapters = new Map();

  register(adapterInput) {
    const adapter = assertAdapter(adapterInput);
    this.#adapters.set(adapter.id, adapter);
    return this;
  }

  unregister(providerId) {
    this.#adapters.delete(String(providerId));
  }

  get(providerId) {
    return this.#adapters.get(String(providerId)) || null;
  }

  listIds() {
    return [...this.#adapters.keys()];
  }
}

const normalizedRoute = (value) => {
  if (!value || typeof value !== "object") return null;
  const providerId = String(value.providerId || "").trim();
  const modelId = String(value.modelId || "").trim();
  if (!providerId || !modelId) return null;
  return { providerId, modelId };
};

export const resolveVideoDirectorProviderRoutes = (job) => {
  const plan = job?.providerPlan && typeof job.providerPlan === "object"
    ? job.providerPlan
    : {};
  const routes = [];

  const primary = normalizedRoute(plan.primary);
  if (primary) routes.push(primary);

  if (Array.isArray(plan.fallbacks)) {
    for (const fallback of plan.fallbacks) {
      const route = normalizedRoute(fallback);
      if (route) routes.push(route);
    }
  }

  const explicit = normalizedRoute({
    providerId: job?.providerId || job?.request?.providerId,
    modelId: job?.modelId || job?.request?.modelId,
  });
  if (explicit) routes.push(explicit);

  const seen = new Set();
  return routes.filter((route) => {
    const key = `${route.providerId}::${route.modelId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const providerJobStatus = (value) => String(value?.status || "").toLowerCase();

const validateProviderJob = (value, context) => {
  if (!value || typeof value !== "object") {
    throw new Error(`${context} returned no provider job payload.`);
  }
  const status = providerJobStatus(value);
  if (!["queued", "running", "post-processing", "completed", "failed", "cancelled"].includes(status)) {
    throw new Error(`${context} returned unsupported status "${status || "empty"}".`);
  }
  return {
    providerJobId: String(value.providerJobId || "").trim(),
    status,
    outputAssetIds: Array.isArray(value.outputAssetIds) ? value.outputAssetIds.map(String) : [],
    actualCredits: value.actualCredits ?? null,
    progress: Number.isFinite(Number(value.progress))
      ? Math.max(0, Math.min(1, Number(value.progress)))
      : undefined,
    previewAssetUri: value.previewAssetUri ? String(value.previewAssetUri) : null,
    message: value.message ? String(value.message) : null,
    errorCode: value.errorCode ? String(value.errorCode) : null,
    errorMessage: value.errorMessage ? String(value.errorMessage) : null,
    metadata: value.metadata && typeof value.metadata === "object" ? value.metadata : {},
  };
};

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cancellationSnapshot = async (jobId) => {
  const current = await getVideoDirectorJob(jobId);
  return current?.cancelRequested ? current : null;
};

const attemptProvider = async ({
  job,
  workerId,
  route,
  adapter,
  pollIntervalMs,
  pollTimeoutMs,
  sleep,
}) => {
  if (!adapter.supportsModel(route.modelId)) {
    throw new VideoProviderSubmissionError(
      `${route.providerId} does not support model ${route.modelId}.`,
      { code: "MODEL_UNSUPPORTED", safeToFallback: true },
    );
  }

  const controller = new AbortController();
  let accepted = false;
  let providerJobId = null;

  try {
    await updateVideoDirectorJobProgress(job.id, workerId, {
      stage: "submitting",
      progress: 0.05,
      message: `Submitting to ${route.providerId} / ${route.modelId}…`,
      metadata: { providerId: route.providerId, modelId: route.modelId },
    });

    const submissionRaw = await adapter.submit({
      request: job.request,
      modelId: route.modelId,
      idempotencyKey: job.idempotencyKey,
      signal: controller.signal,
    });
    const submission = validateProviderJob(submissionRaw, `${route.providerId}.submit()`);
    accepted = true;
    providerJobId = submission.providerJobId || null;

    await bindVideoDirectorJobProvider(job.id, workerId, {
      providerId: route.providerId,
      modelId: route.modelId,
      providerJobId,
    });
    await updateVideoDirectorJobProgress(job.id, workerId, {
      stage: submission.status === "completed" ? "provider-complete" : "rendering",
      progress: submission.progress ?? (submission.status === "completed" ? 0.9 : 0.1),
      message: submission.message || (
        submission.status === "completed"
          ? "Provider render completed."
          : "Provider accepted the generation job."
      ),
      previewAssetUri: submission.previewAssetUri,
      metadata: { providerId: route.providerId, modelId: route.modelId, providerJobId },
    });

    if (submission.status === "completed") {
      return submission;
    }
    if (submission.status === "failed") {
      throw new Error(
        submission.errorMessage ||
        `${route.providerId} accepted the job but reported generation failure.`,
      );
    }
    if (submission.status === "cancelled") {
      return submission;
    }
    if (!providerJobId) {
      throw new Error(`${route.providerId} accepted a non-terminal job without providerJobId.`);
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt <= pollTimeoutMs) {
      const cancelled = await cancellationSnapshot(job.id);
      if (cancelled) {
        controller.abort();
        let mayStillBill = accepted;
        if (typeof adapter.cancel === "function" && providerJobId) {
          try {
            const cancellation = await adapter.cancel({
              providerJobId,
              modelId: route.modelId,
            });
            mayStillBill = Boolean(cancellation?.mayStillBill);
          } catch {
            mayStillBill = true;
          }
        }
        await finalizeCancelledVideoDirectorJob(job.id, workerId, {
          providerMayStillBill: mayStillBill,
          providerJobId,
        });
        return { status: "cancelled", providerJobId, outputAssetIds: [], actualCredits: null };
      }

      await heartbeatVideoDirectorJob(job.id, workerId);
      await sleep(pollIntervalMs);

      const snapshotRaw = await adapter.getJob({
        providerJobId,
        modelId: route.modelId,
        signal: controller.signal,
      });
      const snapshot = validateProviderJob(snapshotRaw, `${route.providerId}.getJob()`);
      await updateVideoDirectorJobProgress(job.id, workerId, {
        stage: snapshot.status === "post-processing" ? "provider-post-processing" : "rendering",
        progress: snapshot.progress ?? 0.5,
        message: snapshot.message || `${route.providerId}: ${snapshot.status}`,
        previewAssetUri: snapshot.previewAssetUri,
        metadata: { providerId: route.providerId, modelId: route.modelId, providerJobId },
      });
      if (!TERMINAL_PROVIDER_STATES.has(snapshot.status)) continue;
      return snapshot;
    }

    const timeoutError = new Error(
      `${route.providerId} provider job ${providerJobId} exceeded the worker polling timeout.`,
    );
    timeoutError.code = "PROVIDER_POLL_TIMEOUT";
    throw timeoutError;
  } catch (error) {
    controller.abort();
    if (error instanceof VideoProviderSubmissionError) throw error;

    if (!accepted) {
      throw new VideoProviderSubmissionError(
        error instanceof Error ? error.message : String(error),
        {
          code: error?.code || "PROVIDER_SUBMISSION_FAILED",
          safeToFallback: Boolean(error?.safeToFallback),
          metadata: error?.metadata || {},
        },
      );
    }
    throw error;
  }
};

export const runNextVideoDirectorJob = async ({
  workerId,
  registry,
  pollIntervalMs = 2_000,
  pollTimeoutMs = 30 * 60 * 1_000,
  retryDelayMs = 5_000,
  sleep = defaultSleep,
} = {}) => {
  const resolvedWorkerId = String(workerId || "").trim();
  if (!resolvedWorkerId) throw new Error("workerId is required.");
  if (!(registry instanceof VideoDirectorServerProviderRegistry)) {
    throw new Error("A VideoDirectorServerProviderRegistry is required.");
  }

  const job = await claimNextVideoDirectorJob(resolvedWorkerId);
  if (!job) return { status: "idle", job: null };

  const routes = resolveVideoDirectorProviderRoutes(job);
  if (!routes.length) {
    const failed = await failVideoDirectorJob(job.id, resolvedWorkerId, {
      error: "No provider route is configured for this generation job.",
      failureMetadata: { code: "NO_PROVIDER_ROUTE" },
      retryDelayMs,
    });
    return { status: "failed", job: failed, error: "NO_PROVIDER_ROUTE" };
  }

  const submissionErrors = [];

  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    const adapter = registry.get(route.providerId);

    if (!adapter) {
      submissionErrors.push({
        providerId: route.providerId,
        modelId: route.modelId,
        code: "PROVIDER_NOT_REGISTERED",
        message: "Provider adapter is not registered on this worker.",
      });
      continue;
    }

    try {
      const providerJob = await attemptProvider({
        job,
        workerId: resolvedWorkerId,
        route,
        adapter,
        pollIntervalMs,
        pollTimeoutMs,
        sleep,
      });

      if (providerJob.status === "cancelled") {
        const current = await getVideoDirectorJob(job.id);
        return { status: "cancelled", job: current, providerJob };
      }

      if (providerJob.status === "failed") {
        throw new Error(
          providerJob.errorMessage ||
          `${route.providerId} reported provider job failure.`,
        );
      }

      await markVideoDirectorJobPostProcessing(job.id, resolvedWorkerId, {
        providerJobId: providerJob.providerJobId || null,
      });
      await updateVideoDirectorJobProgress(job.id, resolvedWorkerId, {
        stage: "post-processing",
        progress: 0.94,
        message: "Provider render accepted; preparing ViewTube output assets.",
        previewAssetUri: providerJob.previewAssetUri,
        metadata: { providerId: route.providerId, modelId: route.modelId },
      });

      const completed = await completeVideoDirectorJob(job.id, resolvedWorkerId, {
        outputAssetIds: providerJob.outputAssetIds,
        actualCredits: providerJob.actualCredits,
        providerJobId: providerJob.providerJobId || null,
      });

      return {
        status: "completed",
        job: completed,
        provider: route,
        providerJob,
      };
    } catch (error) {
      const safeFallback =
        error instanceof VideoProviderSubmissionError &&
        error.safeToFallback &&
        index < routes.length - 1;

      submissionErrors.push({
        providerId: route.providerId,
        modelId: route.modelId,
        code: error?.code || "PROVIDER_EXECUTION_FAILED",
        message: error instanceof Error ? error.message : String(error),
        safeToFallback: Boolean(error?.safeToFallback),
      });

      if (safeFallback) continue;

      const failed = await failVideoDirectorJob(job.id, resolvedWorkerId, {
        error,
        failureMetadata: {
          providerId: route.providerId,
          modelId: route.modelId,
          submissionErrors,
        },
        retryDelayMs,
      });
      return {
        status: failed?.status === "dead-letter" ? "dead-letter" : "failed",
        job: failed,
        error: submissionErrors.at(-1),
      };
    }
  }

  const failed = await failVideoDirectorJob(job.id, resolvedWorkerId, {
    error: "No registered compatible provider could accept the job.",
    failureMetadata: { submissionErrors },
    retryDelayMs,
  });

  return {
    status: failed?.status === "dead-letter" ? "dead-letter" : "failed",
    job: failed,
    error: submissionErrors.at(-1) || { code: "NO_PROVIDER_ACCEPTED" },
  };
};
