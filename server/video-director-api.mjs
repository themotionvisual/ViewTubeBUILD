import { z } from "zod";
import { getSessionUserId } from "./account-store.mjs";
import {
  enqueueVideoDirectorJob,
  getVideoDirectorJob,
  listVideoDirectorJobs,
  requestCancelVideoDirectorJob,
} from "./video-director-job-store.mjs";
import {
  formatZodIssues,
  parseVideoDirectorJobSubmit,
} from "./video-director-api-schemas.mjs";

const SESSION_COOKIE = "vt_session";

const parseCookies = (req) => Object.fromEntries(
  String(req.headers.cookie || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index < 0
      ? [part, ""]
      : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }),
);

const requireUser = async (req) => {
  const userId = await getSessionUserId(parseCookies(req)[SESSION_COOKIE] || "");
  if (!userId) {
    const error = new Error("ViewTube sign-in required.");
    error.statusCode = 401;
    error.code = "SIGNED_OUT";
    throw error;
  }
  return userId;
};

const readJsonBody = async (req, maxBytes = 512 * 1024) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  let settled = false;

  req.on("data", (chunk) => {
    if (settled) return;
    size += chunk.length;
    if (size > maxBytes) {
      settled = true;
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      error.code = "BODY_TOO_LARGE";
      reject(error);
      return;
    }
    chunks.push(chunk);
  });
  req.on("error", (error) => {
    if (settled) return;
    settled = true;
    reject(error);
  });
  req.on("end", () => {
    if (settled) return;
    settled = true;
    try {
      resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
    } catch {
      const error = new Error("Invalid JSON body.");
      error.statusCode = 400;
      error.code = "INVALID_JSON";
      reject(error);
    }
  });
});

const requireOwnedJob = async (userId, jobId) => {
  const job = await getVideoDirectorJob(jobId);
  if (!job || job.viewtubeUserId !== userId) {
    const error = new Error("Video Director job not found.");
    error.statusCode = 404;
    error.code = "JOB_NOT_FOUND";
    throw error;
  }
  return job;
};

export const submitVideoDirectorJob = async ({ req }) => {
  const userId = await requireUser(req);
  const body = parseVideoDirectorJobSubmit(await readJsonBody(req));

  const job = await enqueueVideoDirectorJob({
    viewtubeUserId: userId,
    projectId: body.projectId,
    shotId: body.shotId,
    variantId: body.variantId,
    idempotencyKey: body.idempotencyKey,
    priority: body.priority,
    maxAttempts: body.maxAttempts,
    estimatedCredits: body.estimatedCredits,
    providerId: body.providerId,
    modelId: body.modelId,
    providerPlan: body.providerPlan,
    request: body.request,
  });

  return { job };
};

export const listOwnedVideoDirectorJobs = async ({ req, parsedUrl }) => {
  const userId = await requireUser(req);
  const projectId = String(parsedUrl.searchParams.get("projectId") || "").trim() || undefined;
  const limit = Math.max(1, Math.min(500, Number(parsedUrl.searchParams.get("limit") || 100)));
  const jobs = await listVideoDirectorJobs({
    viewtubeUserId: userId,
    projectId,
    limit,
  });
  return { jobs };
};

export const getOwnedVideoDirectorJob = async ({ req, jobId }) => {
  const userId = await requireUser(req);
  return { job: await requireOwnedJob(userId, jobId) };
};

export const cancelOwnedVideoDirectorJob = async ({ req, jobId }) => {
  const userId = await requireUser(req);
  await requireOwnedJob(userId, jobId);
  return { job: await requestCancelVideoDirectorJob(jobId) };
};

export const toVideoDirectorApiError = (error) => {
  if (error instanceof z.ZodError) {
    return {
      status: 400,
      body: {
        error: {
          code: "INVALID_VIDEO_DIRECTOR_PAYLOAD",
          message: "Video Director request validation failed.",
          issues: formatZodIssues(error),
        },
      },
    };
  }

  const status = Number(error?.statusCode || 500);
  return {
    status: Number.isFinite(status) ? status : 500,
    body: {
      error: {
        code: String(error?.code || "VIDEO_DIRECTOR_ERROR"),
        message: status >= 500
          ? "Video Director could not process this request."
          : String(error?.message || "Video Director request failed."),
      },
    },
  };
};
