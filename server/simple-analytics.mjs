import { getSessionUserId, getAccountSnapshotData } from "./account-store.mjs";
import { googleJson } from "./simple-google-client.mjs";
import { validateAnalyticsShape, MONETARY_METRICS } from "./youtube-analytics-matrix.mjs";

const SESSION_COOKIE = "vt_session";
const ANALYTICS_BASE = "https://youtubeanalytics.googleapis.com/v2/reports";
const MONETARY_SCOPE = "https://www.googleapis.com/auth/yt-analytics-monetary.readonly";

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

const readJsonBody = async (req, maxBytes = 128 * 1024) => new Promise((resolve, reject) => {
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

const asList = (value) => Array.isArray(value)
  ? value.map((item) => String(item || "").trim()).filter(Boolean)
  : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);

const asDate = (value, name) => {
  const text = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const error = new Error(`${name} must be YYYY-MM-DD.`);
    error.statusCode = 400;
    error.code = "INVALID_DATE";
    throw error;
  }
  return text;
};

export const queryAnalytics = async ({ req }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const metrics = asList(body.metrics);
  const dimensions = asList(body.dimensions);
  if (!metrics.length) {
    const error = new Error("At least one Analytics metric is required.");
    error.statusCode = 400;
    error.code = "INVALID_QUERY";
    throw error;
  }

  const validation = validateAnalyticsShape(dimensions, metrics);
  if (!validation.ok) {
    const error = new Error(validation.message);
    error.statusCode = 400;
    error.code = validation.code;
    throw error;
  }

  if (metrics.some((metric) => MONETARY_METRICS.has(metric))) {
    const account = await getAccountSnapshotData(userId);
    const scopes = new Set(account?.scopes || []);
    if (!scopes.has(MONETARY_SCOPE)) {
      const error = new Error("Revenue analytics requires the monetary Analytics permission.");
      error.statusCode = 403;
      error.code = "MISSING_MONETARY_SCOPE";
      throw error;
    }
  }

  const params = new URLSearchParams({
    ids: String(body.ids || "channel==MINE"),
    startDate: asDate(body.startDate, "startDate"),
    endDate: asDate(body.endDate, "endDate"),
    metrics: metrics.join(","),
  });
  if (dimensions.length) params.set("dimensions", dimensions.join(","));
  if (body.filters) params.set("filters", String(body.filters));
  if (body.sort) params.set("sort", String(body.sort));
  if (body.currency) params.set("currency", String(body.currency));
  if (body.maxResults != null) params.set("maxResults", String(Math.max(1, Math.min(200, Number(body.maxResults) || 1))));
  if (body.startIndex != null) params.set("startIndex", String(Math.max(1, Number(body.startIndex) || 1)));
  if (body.includeHistoricalChannelData != null) {
    params.set("includeHistoricalChannelData", body.includeHistoricalChannelData ? "true" : "false");
  }

  const payload = await googleJson(userId, `${ANALYTICS_BASE}?${params.toString()}`);
  return {
    ...payload,
    viewtube: {
      family: validation.family,
      monetary: validation.monetary,
      dimensions,
      metrics,
    },
  };
};
