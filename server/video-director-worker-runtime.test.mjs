import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import test from "node:test";

const tempRoot = await mkdtemp(path.join(os.tmpdir(), "viewtube-video-director-worker-"));
process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;
process.env.VIDEO_DIRECTOR_JOB_STORE_FILE = path.join(tempRoot, "jobs.json");

const store = await import(`./video-director-job-store.mjs?worker-store=${Date.now()}`);
const runtime = await import(`./video-director-worker-runtime.mjs?worker-runtime=${Date.now()}`);

const request = {
  schemaVersion: 1,
  projectId: "project-1",
  providerId: "primary",
  modelId: "model-a",
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
};

const enqueue = (overrides = {}) =>
  store.enqueueVideoDirectorJob({
    viewtubeUserId: "user-1",
    projectId: "project-1",
    idempotencyKey: overrides.idempotencyKey || `idem-${Math.random()}`,
    request,
    providerId: "primary",
    modelId: "model-a",
    maxAttempts: 1,
    ...overrides,
  });

test.after(async () => {
  await store.closeVideoDirectorJobStore();
  await rm(tempRoot, { recursive: true, force: true });
});

test.beforeEach(async () => {
  await store.resetVideoDirectorJobStoreForTests();
});

test("worker completes an immediately finished provider job", async () => {
  await enqueue({ idempotencyKey: "complete" });
  const registry = new runtime.VideoDirectorServerProviderRegistry().register({
    id: "primary",
    supportsModel: (modelId) => modelId === "model-a",
    submit: async () => ({
      providerJobId: "provider-1",
      status: "completed",
      outputAssetIds: ["asset-1"],
      actualCredits: 8,
    }),
    getJob: async () => { throw new Error("should not poll"); },
  });

  const result = await runtime.runNextVideoDirectorJob({
    workerId: "worker-1",
    registry,
    sleep: async () => {},
  });

  assert.equal(result.status, "completed");
  assert.deepEqual(result.job.outputAssetIds, ["asset-1"]);
  assert.equal(result.job.actualCredits, 8);
  assert.equal(result.job.providerId, "primary");
});

test("safe pre-acceptance failures can use an explicit fallback", async () => {
  await enqueue({
    idempotencyKey: "fallback",
    providerPlan: {
      primary: { providerId: "primary", modelId: "model-a" },
      fallbacks: [{ providerId: "backup", modelId: "model-b" }],
    },
  });

  const registry = new runtime.VideoDirectorServerProviderRegistry()
    .register({
      id: "primary",
      supportsModel: () => true,
      submit: async () => {
        throw new runtime.VideoProviderSubmissionError("rate limited", {
          code: "RATE_LIMITED",
          safeToFallback: true,
        });
      },
      getJob: async () => { throw new Error("should not poll"); },
    })
    .register({
      id: "backup",
      supportsModel: (modelId) => modelId === "model-b",
      submit: async () => ({
        providerJobId: "backup-job",
        status: "completed",
        outputAssetIds: ["asset-backup"],
      }),
      getJob: async () => { throw new Error("should not poll"); },
    });

  const result = await runtime.runNextVideoDirectorJob({
    workerId: "worker-1",
    registry,
    sleep: async () => {},
  });

  assert.equal(result.status, "completed");
  assert.equal(result.job.providerId, "backup");
  assert.deepEqual(result.job.outputAssetIds, ["asset-backup"]);
});

test("ambiguous failures after provider acceptance never launch a fallback", async () => {
  await enqueue({
    idempotencyKey: "accepted-fail",
    providerPlan: {
      primary: { providerId: "primary", modelId: "model-a" },
      fallbacks: [{ providerId: "backup", modelId: "model-b" }],
    },
  });

  let backupCalls = 0;
  const registry = new runtime.VideoDirectorServerProviderRegistry()
    .register({
      id: "primary",
      supportsModel: () => true,
      submit: async () => ({
        providerJobId: "accepted-1",
        status: "running",
      }),
      getJob: async () => ({
        providerJobId: "accepted-1",
        status: "failed",
        errorMessage: "provider generation failed",
      }),
    })
    .register({
      id: "backup",
      supportsModel: () => true,
      submit: async () => {
        backupCalls += 1;
        return { providerJobId: "backup", status: "completed" };
      },
      getJob: async () => ({ providerJobId: "backup", status: "completed" }),
    });

  const result = await runtime.runNextVideoDirectorJob({
    workerId: "worker-1",
    registry,
    pollIntervalMs: 0,
    sleep: async () => {},
  });

  assert.equal(result.status, "dead-letter");
  assert.equal(backupCalls, 0);
});

test("running cancellation propagates to the provider and finalizes the queue job", async () => {
  const queued = await enqueue({ idempotencyKey: "cancel-running" });
  let cancelledProvider = false;
  let polls = 0;

  const registry = new runtime.VideoDirectorServerProviderRegistry().register({
    id: "primary",
    supportsModel: () => true,
    submit: async () => ({ providerJobId: "provider-cancel", status: "running" }),
    getJob: async () => {
      polls += 1;
      if (polls === 1) await store.requestCancelVideoDirectorJob(queued.id);
      return { providerJobId: "provider-cancel", status: "running" };
    },
    cancel: async () => {
      cancelledProvider = true;
      return { cancelled: true, mayStillBill: false };
    },
  });

  const result = await runtime.runNextVideoDirectorJob({
    workerId: "worker-1",
    registry,
    pollIntervalMs: 0,
    sleep: async () => {},
  });

  assert.equal(result.status, "cancelled");
  assert.equal(cancelledProvider, true);
  assert.equal(result.job.status, "cancelled");
  assert.equal(result.job.failureMetadata.providerMayStillBill, false);
});
