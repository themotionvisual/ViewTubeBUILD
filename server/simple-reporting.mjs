import { getSessionUserId } from "./account-store.mjs";
import { getServerGoogleAccessToken, googleJson, ReconnectRequiredError } from "./simple-google-client.mjs";

const SESSION_COOKIE = "vt_session";
const BASE = "https://youtubereporting.googleapis.com/v1";

const parseCookies = (req) => Object.fromEntries(
  String(req.headers.cookie || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
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
const readJsonBody = async (req, maxBytes = 64 * 1024) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      reject(error);
      return;
    }
    chunks.push(chunk);
  });
  req.on("error", reject);
  req.on("end", () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
    catch {
      const error = new Error("Invalid JSON body.");
      error.statusCode = 400;
      reject(error);
    }
  });
});

export const listReportTypes = async ({ req, parsedUrl }) => {
  const userId = await requireUser(req);
  const params = new URLSearchParams();
  if (parsedUrl.searchParams.get("includeSystemManaged")) params.set("includeSystemManaged", parsedUrl.searchParams.get("includeSystemManaged"));
  if (parsedUrl.searchParams.get("pageSize")) params.set("pageSize", parsedUrl.searchParams.get("pageSize"));
  if (parsedUrl.searchParams.get("pageToken")) params.set("pageToken", parsedUrl.searchParams.get("pageToken"));
  return googleJson(userId, `${BASE}/reportTypes?${params.toString()}`);
};

export const listReportingJobs = async ({ req, parsedUrl }) => {
  const userId = await requireUser(req);
  const params = new URLSearchParams();
  if (parsedUrl.searchParams.get("includeSystemManaged")) params.set("includeSystemManaged", parsedUrl.searchParams.get("includeSystemManaged"));
  if (parsedUrl.searchParams.get("pageSize")) params.set("pageSize", parsedUrl.searchParams.get("pageSize"));
  if (parsedUrl.searchParams.get("pageToken")) params.set("pageToken", parsedUrl.searchParams.get("pageToken"));
  return googleJson(userId, `${BASE}/jobs?${params.toString()}`);
};

export const createReportingJob = async ({ req }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const reportTypeId = String(body.reportTypeId || "").trim();
  if (!reportTypeId) {
    const error = new Error("reportTypeId is required.");
    error.statusCode = 400;
    throw error;
  }
  return googleJson(userId, `${BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportTypeId, name: String(body.name || reportTypeId) }),
  });
};

export const listReportingReports = async ({ req, parsedUrl, jobId }) => {
  const userId = await requireUser(req);
  const params = new URLSearchParams();
  for (const key of ["createdAfter","startTimeAtOrAfter","startTimeBefore","pageSize","pageToken"]) {
    const value = parsedUrl.searchParams.get(key);
    if (value) params.set(key, value);
  }
  return googleJson(userId, `${BASE}/jobs/${encodeURIComponent(jobId)}/reports?${params.toString()}`);
};

export const getReportingReport = async ({ req, jobId, reportId }) => {
  const userId = await requireUser(req);
  return googleJson(userId, `${BASE}/jobs/${encodeURIComponent(jobId)}/reports/${encodeURIComponent(reportId)}`);
};

export const streamReportingReport = async ({ req, res, jobId, reportId }) => {
  const userId = await requireUser(req);
  const report = await googleJson(userId, `${BASE}/jobs/${encodeURIComponent(jobId)}/reports/${encodeURIComponent(reportId)}`);
  const downloadUrl = String(report?.downloadUrl || "");
  if (!downloadUrl) {
    const error = new Error("Reporting download URL is unavailable.");
    error.statusCode = 404;
    throw error;
  }
  const parsed = new URL(downloadUrl);
  if (!["youtubereporting.googleapis.com","storage.googleapis.com"].includes(parsed.hostname)) {
    const error = new Error("Unexpected Reporting download host.");
    error.statusCode = 502;
    throw error;
  }

  const token = await getServerGoogleAccessToken(userId);
  const upstream = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(60_000),
  });
  if (upstream.status === 401) throw new ReconnectRequiredError();
  if (!upstream.ok) {
    const error = new Error(`Reporting download failed (${upstream.status}).`);
    error.statusCode = upstream.status;
    throw error;
  }
  const body = Buffer.from(await upstream.arrayBuffer());
  const headers = {
    "Content-Type": upstream.headers.get("content-type") || "text/csv",
    "Cache-Control": "no-store",
    "Content-Length": String(body.length),
  };
  const contentEncoding = upstream.headers.get("content-encoding");
  if (contentEncoding) headers["Content-Encoding"] = contentEncoding;
  res.writeHead(200, headers);
  res.end(body);
};
