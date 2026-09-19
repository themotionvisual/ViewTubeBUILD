import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import pg from "pg";
import { fileURLToPath } from "node:url";
import { withVerifiedPostgresSslMode } from "./account-store.mjs";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const DATABASE_URL = String(process.env.DATABASE_URL || "").trim();
const NODE_ENV = String(process.env.NODE_ENV || "development");
const FILE_PATH = String(
  process.env.VIDEO_DIRECTOR_JOB_STORE_FILE ||
  path.join(ROOT, ".video-director", "job-store.json"),
).trim();

const JOB_STATUSES = new Set([
  "queued",
  "running",
  "post-processing",
  "completed",
  "failed",
  "dead-letter",
  "cancelled",
]);

const schemaSql = `
CREATE TABLE IF NOT EXISTS viewtube_video_director_jobs (
  id TEXT PRIMARY KEY,
  viewtube_user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  shot_id TEXT,
  variant_id TEXT,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  priority INTEGER NOT NULL DEFAULT 0,
  request JSONB NOT NULL,
  provider_plan JSONB NOT NULL DEFAULT '{}',
  provider_id TEXT,
  model_id TEXT,
  provider_job_id TEXT,
  output_asset_ids JSONB NOT NULL DEFAULT '[]',
  estimated_credits NUMERIC,
  actual_credits NUMERIC,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  cancel_requested BOOLEAN NOT NULL DEFAULT FALSE,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  failure_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS viewtube_video_director_jobs_user_idempotency
  ON viewtube_video_director_jobs(viewtube_user_id, idempotency_key);
CREATE INDEX IF NOT EXISTS viewtube_video_director_jobs_queue
  ON viewtube_video_director_jobs(status, available_at, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS viewtube_video_director_jobs_project
  ON viewtube_video_director_jobs(viewtube_user_id, project_id, created_at DESC);
`;

let pool = null;
let initialized = false;
let fileWriteQueue = Promise.resolve();

const nowIso = () => new Date().toISOString();
const newJobId = () => `vtd_job_${crypto.randomUUID().replace(/-/g, "")}`;

const emptyFileDb = () => ({ jobs: {} });

const ensureFileDb = async () => {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, JSON.stringify(emptyFileDb(), null, 2), "utf8");
  }
};

const readFileDb = async () => {
  await ensureFileDb();
  try {
    const parsed = JSON.parse(await fs.readFile(FILE_PATH, "utf8"));
    return { ...emptyFileDb(), ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return emptyFileDb();
  }
};

const updateFileDb = async (mutator) => {
  const operation = fileWriteQueue.then(async () => {
    const db = await readFileDb();
    const result = await mutator(db);
    await fs.writeFile(FILE_PATH, JSON.stringify(db, null, 2), "utf8");
    return result;
  });
  fileWriteQueue = operation.catch(() => undefined);
  return operation;
};

const asString = (value, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

const asFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const asJsonObject = (value, fallback = {}) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : fallback;

const asJsonArray = (value) => Array.isArray(value) ? value : [];

const normalizeJob = (value) => {
  const raw = asJsonObject(value);
  const status = asString(raw.status, "queued");
  const createdAt = asString(raw.createdAt || raw.created_at, nowIso());
  const updatedAt = asString(raw.updatedAt || raw.updated_at, createdAt);

  return {
    id: asString(raw.id) || newJobId(),
    viewtubeUserId: asString(raw.viewtubeUserId || raw.viewtube_user_id),
    projectId: asString(raw.projectId || raw.project_id),
    shotId: asString(raw.shotId || raw.shot_id) || null,
    variantId: asString(raw.variantId || raw.variant_id) || null,
    idempotencyKey: asString(raw.idempotencyKey || raw.idempotency_key),
    status: JOB_STATUSES.has(status) ? status : "queued",
    priority: Math.trunc(asFiniteNumber(raw.priority, 0)),
    request: asJsonObject(raw.request),
    providerPlan: asJsonObject(raw.providerPlan || raw.provider_plan),
    providerId: asString(raw.providerId || raw.provider_id) || null,
    modelId: asString(raw.modelId || raw.model_id) || null,
    providerJobId: asString(raw.providerJobId || raw.provider_job_id) || null,
    outputAssetIds: asJsonArray(raw.outputAssetIds || raw.output_asset_ids).map(String),
    estimatedCredits:
      raw.estimatedCredits ?? raw.estimated_credits ?? null,
    actualCredits: raw.actualCredits ?? raw.actual_credits ?? null,
    attemptCount: Math.max(0, Math.trunc(asFiniteNumber(raw.attemptCount ?? raw.attempt_count, 0))),
    maxAttempts: Math.max(1, Math.trunc(asFiniteNumber(raw.maxAttempts ?? raw.max_attempts, 3))),
    cancelRequested: Boolean(raw.cancelRequested ?? raw.cancel_requested),
    lockedBy: asString(raw.lockedBy || raw.locked_by) || null,
    lockedAt: asString(raw.lockedAt || raw.locked_at) || null,
    heartbeatAt: asString(raw.heartbeatAt || raw.heartbeat_at) || null,
    availableAt: asString(raw.availableAt || raw.available_at, createdAt),
    lastError: asString(raw.lastError || raw.last_error) || null,
    failureMetadata: asJsonObject(raw.failureMetadata || raw.failure_metadata),
    createdAt,
    updatedAt,
  };
};

const assertEnqueueInput = (value) => {
  const job = normalizeJob(value);
  if (!job.viewtubeUserId) throw new Error("viewtubeUserId is required");
  if (!job.projectId) throw new Error("projectId is required");
  if (!job.idempotencyKey) throw new Error("idempotencyKey is required");
  if (!Object.keys(job.request).length) throw new Error("request is required");
  return job;
};

const rowToJob = (row) => normalizeJob(row);

export const initVideoDirectorJobStore = async () => {
  if (initialized) return;

  if (!DATABASE_URL) {
    if (NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required for production Video Director job storage.");
    }
    await ensureFileDb();
    initialized = true;
    return;
  }

  const candidatePool = new Pool({
    connectionString: withVerifiedPostgresSslMode(DATABASE_URL),
    ssl:
      process.env.DATABASE_SSL === "false"
        ? false
        : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" },
    max: Math.max(2, Number(process.env.DATABASE_POOL_SIZE || 8)),
  });

  await candidatePool.query(schemaSql);
  pool = candidatePool;
  initialized = true;
};

const ensureInit = async () => {
  if (!initialized) await initVideoDirectorJobStore();
};

export const enqueueVideoDirectorJob = async (input) => {
  await ensureInit();
  const job = assertEnqueueInput({
    ...input,
    id: input?.id || newJobId(),
    status: "queued",
    createdAt: input?.createdAt || nowIso(),
    updatedAt: nowIso(),
    availableAt: input?.availableAt || nowIso(),
  });

  if (!pool) {
    return updateFileDb(async (db) => {
      const existing = Object.values(db.jobs).find(
        (candidate) =>
          candidate.viewtubeUserId === job.viewtubeUserId &&
          candidate.idempotencyKey === job.idempotencyKey,
      );
      if (existing) return normalizeJob(existing);
      db.jobs[job.id] = job;
      return normalizeJob(job);
    });
  }

  const result = await pool.query(
    `INSERT INTO viewtube_video_director_jobs (
      id, viewtube_user_id, project_id, shot_id, variant_id, idempotency_key,
      status, priority, request, provider_plan, provider_id, model_id,
      estimated_credits, attempt_count, max_attempts, cancel_requested,
      available_at, created_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,'queued',$7,$8::jsonb,$9::jsonb,$10,$11,$12,0,$13,false,$14,$15,$15
    )
    ON CONFLICT (viewtube_user_id, idempotency_key)
    DO UPDATE SET updated_at = viewtube_video_director_jobs.updated_at
    RETURNING *`,
    [
      job.id,
      job.viewtubeUserId,
      job.projectId,
      job.shotId,
      job.variantId,
      job.idempotencyKey,
      job.priority,
      JSON.stringify(job.request),
      JSON.stringify(job.providerPlan),
      job.providerId,
      job.modelId,
      job.estimatedCredits,
      job.maxAttempts,
      job.availableAt,
      job.createdAt,
    ],
  );
  return rowToJob(result.rows[0]);
};

export const getVideoDirectorJob = async (jobId) => {
  await ensureInit();
  if (!pool) {
    const db = await readFileDb();
    return db.jobs[jobId] ? normalizeJob(db.jobs[jobId]) : null;
  }
  const result = await pool.query(
    "SELECT * FROM viewtube_video_director_jobs WHERE id = $1 LIMIT 1",
    [String(jobId)],
  );
  return result.rows[0] ? rowToJob(result.rows[0]) : null;
};

export const listVideoDirectorJobs = async ({
  viewtubeUserId,
  projectId,
  limit = 100,
} = {}) => {
  await ensureInit();
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(Number(limit) || 100)));

  if (!pool) {
    const db = await readFileDb();
    return Object.values(db.jobs)
      .map(normalizeJob)
      .filter((job) => !viewtubeUserId || job.viewtubeUserId === viewtubeUserId)
      .filter((job) => !projectId || job.projectId === projectId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, safeLimit);
  }

  const values = [];
  const clauses = [];
  if (viewtubeUserId) {
    values.push(String(viewtubeUserId));
    clauses.push(`viewtube_user_id = $${values.length}`);
  }
  if (projectId) {
    values.push(String(projectId));
    clauses.push(`project_id = $${values.length}`);
  }
  values.push(safeLimit);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM viewtube_video_director_jobs
     ${where}
     ORDER BY created_at DESC
     LIMIT $${values.length}`,
    values,
  );
  return result.rows.map(rowToJob);
};

export const claimNextVideoDirectorJob = async (workerId) => {
  await ensureInit();
  const worker = String(workerId || "").trim();
  if (!worker) throw new Error("workerId is required");

  if (!pool) {
    return updateFileDb(async (db) => {
      const now = Date.now();
      const jobs = Object.values(db.jobs)
        .map(normalizeJob)
        .filter((job) => job.status === "queued")
        .filter((job) => !job.cancelRequested)
        .filter((job) => Date.parse(job.availableAt) <= now)
        .sort((a, b) => b.priority - a.priority || String(a.createdAt).localeCompare(String(b.createdAt)));
      const job = jobs[0];
      if (!job) return null;
      job.status = "running";
      job.lockedBy = worker;
      job.lockedAt = nowIso();
      job.heartbeatAt = job.lockedAt;
      job.attemptCount += 1;
      job.updatedAt = job.lockedAt;
      db.jobs[job.id] = job;
      return normalizeJob(job);
    });
  }

  const result = await pool.query(
    `WITH next_job AS (
      SELECT id
      FROM viewtube_video_director_jobs
      WHERE status = 'queued'
        AND cancel_requested = FALSE
        AND available_at <= NOW()
      ORDER BY priority DESC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE viewtube_video_director_jobs AS jobs
    SET status = 'running',
        locked_by = $1,
        locked_at = NOW(),
        heartbeat_at = NOW(),
        attempt_count = jobs.attempt_count + 1,
        updated_at = NOW()
    FROM next_job
    WHERE jobs.id = next_job.id
    RETURNING jobs.*`,
    [worker],
  );

  return result.rows[0] ? rowToJob(result.rows[0]) : null;
};

export const heartbeatVideoDirectorJob = async (jobId, workerId) => {
  await ensureInit();
  const timestamp = nowIso();

  if (!pool) {
    return updateFileDb(async (db) => {
      const current = db.jobs[jobId];
      if (!current) return null;
      const job = normalizeJob(current);
      if (job.lockedBy !== workerId || !["running", "post-processing"].includes(job.status)) {
        return null;
      }
      job.heartbeatAt = timestamp;
      job.updatedAt = timestamp;
      db.jobs[job.id] = job;
      return job;
    });
  }

  const result = await pool.query(
    `UPDATE viewtube_video_director_jobs
     SET heartbeat_at = NOW(), updated_at = NOW()
     WHERE id = $1
       AND locked_by = $2
       AND status IN ('running','post-processing')
     RETURNING *`,
    [String(jobId), String(workerId)],
  );
  return result.rows[0] ? rowToJob(result.rows[0]) : null;
};

export const markVideoDirectorJobPostProcessing = async (jobId, workerId, patch = {}) => {
  await ensureInit();
  const providerJobId = asString(patch.providerJobId) || null;

  if (!pool) {
    return updateFileDb(async (db) => {
      const current = db.jobs[jobId];
      if (!current) return null;
      const job = normalizeJob(current);
      if (job.lockedBy !== workerId || job.status !== "running") return null;
      job.status = "post-processing";
      job.providerJobId = providerJobId || job.providerJobId;
      job.updatedAt = nowIso();
      db.jobs[job.id] = job;
      return job;
    });
  }

  const result = await pool.query(
    `UPDATE viewtube_video_director_jobs
     SET status = 'post-processing',
         provider_job_id = COALESCE($3, provider_job_id),
         updated_at = NOW()
     WHERE id = $1 AND locked_by = $2 AND status = 'running'
     RETURNING *`,
    [String(jobId), String(workerId), providerJobId],
  );
  return result.rows[0] ? rowToJob(result.rows[0]) : null;
};

export const completeVideoDirectorJob = async (jobId, workerId, {
  outputAssetIds = [],
  actualCredits = null,
  providerJobId = null,
} = {}) => {
  await ensureInit();

  if (!pool) {
    return updateFileDb(async (db) => {
      const current = db.jobs[jobId];
      if (!current) return null;
      const job = normalizeJob(current);
      if (job.lockedBy !== workerId || !["running", "post-processing"].includes(job.status)) {
        return null;
      }
      job.status = "completed";
      job.outputAssetIds = asJsonArray(outputAssetIds).map(String);
      job.actualCredits = actualCredits;
      job.providerJobId = providerJobId || job.providerJobId;
      job.lockedBy = null;
      job.lockedAt = null;
      job.heartbeatAt = null;
      job.updatedAt = nowIso();
      db.jobs[job.id] = job;
      return job;
    });
  }

  const result = await pool.query(
    `UPDATE viewtube_video_director_jobs
     SET status = 'completed',
         output_asset_ids = $3::jsonb,
         actual_credits = $4,
         provider_job_id = COALESCE($5, provider_job_id),
         locked_by = NULL,
         locked_at = NULL,
         heartbeat_at = NULL,
         updated_at = NOW()
     WHERE id = $1
       AND locked_by = $2
       AND status IN ('running','post-processing')
     RETURNING *`,
    [
      String(jobId),
      String(workerId),
      JSON.stringify(asJsonArray(outputAssetIds).map(String)),
      actualCredits,
      providerJobId,
    ],
  );
  return result.rows[0] ? rowToJob(result.rows[0]) : null;
};

export const failVideoDirectorJob = async (jobId, workerId, {
  error,
  failureMetadata = {},
  retryDelayMs = 5_000,
} = {}) => {
  await ensureInit();
  const errorMessage =
    error instanceof Error ? error.message : asString(error, "Video generation failed");
  const delayMs = Math.max(0, Math.trunc(asFiniteNumber(retryDelayMs, 5_000)));

  if (!pool) {
    return updateFileDb(async (db) => {
      const current = db.jobs[jobId];
      if (!current) return null;
      const job = normalizeJob(current);
      if (job.lockedBy !== workerId || !["running", "post-processing"].includes(job.status)) {
        return null;
      }
      const exhausted = job.attemptCount >= job.maxAttempts;
      job.status = exhausted ? "dead-letter" : "queued";
      job.lastError = errorMessage;
      job.failureMetadata = asJsonObject(failureMetadata);
      job.availableAt = new Date(Date.now() + delayMs).toISOString();
      job.lockedBy = null;
      job.lockedAt = null;
      job.heartbeatAt = null;
      job.updatedAt = nowIso();
      db.jobs[job.id] = job;
      return job;
    });
  }

  const result = await pool.query(
    `UPDATE viewtube_video_director_jobs
     SET status = CASE WHEN attempt_count >= max_attempts THEN 'dead-letter' ELSE 'queued' END,
         last_error = $3,
         failure_metadata = $4::jsonb,
         available_at = NOW() + ($5 * INTERVAL '1 millisecond'),
         locked_by = NULL,
         locked_at = NULL,
         heartbeat_at = NULL,
         updated_at = NOW()
     WHERE id = $1
       AND locked_by = $2
       AND status IN ('running','post-processing')
     RETURNING *`,
    [
      String(jobId),
      String(workerId),
      errorMessage,
      JSON.stringify(asJsonObject(failureMetadata)),
      delayMs,
    ],
  );
  return result.rows[0] ? rowToJob(result.rows[0]) : null;
};

export const requestCancelVideoDirectorJob = async (jobId) => {
  await ensureInit();

  if (!pool) {
    return updateFileDb(async (db) => {
      const current = db.jobs[jobId];
      if (!current) return null;
      const job = normalizeJob(current);
      job.cancelRequested = true;
      if (job.status === "queued") job.status = "cancelled";
      job.updatedAt = nowIso();
      db.jobs[job.id] = job;
      return job;
    });
  }

  const result = await pool.query(
    `UPDATE viewtube_video_director_jobs
     SET cancel_requested = TRUE,
         status = CASE WHEN status = 'queued' THEN 'cancelled' ELSE status END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [String(jobId)],
  );
  return result.rows[0] ? rowToJob(result.rows[0]) : null;
};

export const recoverStaleVideoDirectorJobs = async ({
  staleAfterMs = 120_000,
  limit = 100,
} = {}) => {
  await ensureInit();
  const staleMs = Math.max(1_000, Math.trunc(asFiniteNumber(staleAfterMs, 120_000)));
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(asFiniteNumber(limit, 100))));

  if (!pool) {
    return updateFileDb(async (db) => {
      const cutoff = Date.now() - staleMs;
      const recovered = [];
      for (const current of Object.values(db.jobs)) {
        if (recovered.length >= safeLimit) break;
        const job = normalizeJob(current);
        if (!["running", "post-processing"].includes(job.status)) continue;
        const heartbeat = Date.parse(job.heartbeatAt || job.lockedAt || job.updatedAt);
        if (!Number.isFinite(heartbeat) || heartbeat > cutoff) continue;
        job.status = job.attemptCount >= job.maxAttempts ? "dead-letter" : "queued";
        job.lastError = job.lastError || "Worker heartbeat expired";
        job.lockedBy = null;
        job.lockedAt = null;
        job.heartbeatAt = null;
        job.availableAt = nowIso();
        job.updatedAt = nowIso();
        db.jobs[job.id] = job;
        recovered.push(job);
      }
      return recovered;
    });
  }

  const result = await pool.query(
    `WITH stale AS (
      SELECT id
      FROM viewtube_video_director_jobs
      WHERE status IN ('running','post-processing')
        AND COALESCE(heartbeat_at, locked_at, updated_at)
          < NOW() - ($1 * INTERVAL '1 millisecond')
      ORDER BY COALESCE(heartbeat_at, locked_at, updated_at) ASC
      FOR UPDATE SKIP LOCKED
      LIMIT $2
    )
    UPDATE viewtube_video_director_jobs AS jobs
    SET status = CASE WHEN jobs.attempt_count >= jobs.max_attempts THEN 'dead-letter' ELSE 'queued' END,
        last_error = COALESCE(jobs.last_error, 'Worker heartbeat expired'),
        locked_by = NULL,
        locked_at = NULL,
        heartbeat_at = NULL,
        available_at = NOW(),
        updated_at = NOW()
    FROM stale
    WHERE jobs.id = stale.id
    RETURNING jobs.*`,
    [staleMs, safeLimit],
  );
  return result.rows.map(rowToJob);
};

export const resetVideoDirectorJobStoreForTests = async () => {
  if (pool) {
    await pool.query("DELETE FROM viewtube_video_director_jobs");
    return;
  }
  if (!initialized) await initVideoDirectorJobStore();
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(emptyFileDb(), null, 2), "utf8");
};

export const closeVideoDirectorJobStore = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
  initialized = false;
};
