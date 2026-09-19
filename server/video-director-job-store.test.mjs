import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import test from "node:test";

const tempRoot = await mkdtemp(path.join(os.tmpdir(), "viewtube-video-director-jobs-"));
process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;
process.env.VIDEO_DIRECTOR_JOB_STORE_FILE = path.join(tempRoot, "jobs.json");

const store = await import(`./video-director-job-store.mjs?test=${Date.now()}`);

const enqueue = (overrides = {}) =>
  store.enqueueVideoDirectorJob({
    viewtubeUserId: "user-1",
    projectId: "project-1",
    idempotencyKey: overrides.idempotencyKey || "idem-1",
    request: { prompt: "test" },
    maxAttempts: overrides.maxAttempts || 2,
    priority: overrides.priority || 0,
    ...overrides,
  });

test.after(async () => {
  await store.closeVideoDirectorJobStore();
  await rm(tempRoot, { recursive: true, force: true });
});

test.beforeEach(async () => {
  await store.resetVideoDirectorJobStoreForTests();
});

test("idempotent enqueue returns the existing durable job", async () => {
  const first = await enqueue();
  const second = await enqueue({ request: { prompt: "duplicate" } });

  assert.equal(first.id, second.id);
  assert.equal((await store.listVideoDirectorJobs({ viewtubeUserId: "user-1" })).length, 1);
});

test("workers claim by priority and only one worker owns a job", async () => {
  await enqueue({ idempotencyKey: "low", priority: 1 });
  await enqueue({ idempotencyKey: "high", priority: 20 });

  const claimed = await store.claimNextVideoDirectorJob("worker-a");
  assert.equal(claimed.idempotencyKey, "high");
  assert.equal(claimed.status, "running");
  assert.equal(claimed.attemptCount, 1);

  const second = await store.claimNextVideoDirectorJob("worker-b");
  assert.equal(second.idempotencyKey, "low");
});

test("failed jobs retry then move to dead-letter after max attempts", async () => {
  const queued = await enqueue({ maxAttempts: 2 });
  const first = await store.claimNextVideoDirectorJob("worker-a");
  assert.equal(first.id, queued.id);

  const retried = await store.failVideoDirectorJob(first.id, "worker-a", {
    error: new Error("vendor timeout"),
    retryDelayMs: 0,
  });
  assert.equal(retried.status, "queued");

  const second = await store.claimNextVideoDirectorJob("worker-a");
  assert.equal(second.attemptCount, 2);

  const dead = await store.failVideoDirectorJob(second.id, "worker-a", {
    error: "vendor failed again",
    retryDelayMs: 0,
  });
  assert.equal(dead.status, "dead-letter");
  assert.equal(dead.lastError, "vendor failed again");
});

test("queued cancellation prevents worker claim", async () => {
  const job = await enqueue();
  const cancelled = await store.requestCancelVideoDirectorJob(job.id);
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.cancelRequested, true);
  assert.equal(await store.claimNextVideoDirectorJob("worker-a"), null);
});

test("completion clears the worker lease and persists output metadata", async () => {
  const job = await enqueue();
  const claimed = await store.claimNextVideoDirectorJob("worker-a");
  const completed = await store.completeVideoDirectorJob(claimed.id, "worker-a", {
    outputAssetIds: ["asset-1"],
    actualCredits: 12,
    providerJobId: "provider-job-1",
  });

  assert.equal(completed.status, "completed");
  assert.deepEqual(completed.outputAssetIds, ["asset-1"]);
  assert.equal(completed.providerJobId, "provider-job-1");
  assert.equal(completed.lockedBy, null);
});
