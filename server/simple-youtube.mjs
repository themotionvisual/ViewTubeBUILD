import { getSessionUserId, getAccountSnapshotData } from "./account-store.mjs";
import { googleJson, ReconnectRequiredError } from "./simple-google-client.mjs";

const SESSION_COOKIE = "vt_session";
const BASE = "https://www.googleapis.com/youtube/v3";

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

const fetchCompleteReplies = async (userId, parentId) => {
  const replies = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      part: "snippet",
      parentId,
      maxResults: "100",
      textFormat: "plainText",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await googleJson(userId, `${BASE}/comments?${params.toString()}`);
    replies.push(...(page.items || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return replies;
};

const hydrateThreadReplies = async (userId, thread) => {
  const included = thread?.replies?.comments || [];
  const total = Number(thread?.snippet?.totalReplyCount || 0);
  const parentId = String(thread?.snippet?.topLevelComment?.id || "");
  if (!parentId || included.length >= total) return { ...thread, repliesComplete: true };
  try {
    const comments = await fetchCompleteReplies(userId, parentId);
    return { ...thread, replies: { ...(thread.replies || {}), comments }, repliesComplete: true };
  } catch {
    return { ...thread, repliesComplete: false };
  }
};

export const listCommentThreads = async ({ req, parsedUrl }) => {
  const userId = await requireUser(req);
  const account = await getAccountSnapshotData(userId);
  const channelId = account?.channelId;
  if (!channelId) {
    const error = new Error("No connected YouTube channel.");
    error.statusCode = 409;
    error.code = "RECONNECT_REQUIRED";
    throw error;
  }

  const maxResults = Math.max(1, Math.min(100, Number(parsedUrl.searchParams.get("maxResults") || 100)));
  const params = new URLSearchParams({
    part: "snippet,replies",
    allThreadsRelatedToChannelId: channelId,
    maxResults: String(maxResults),
    order: "time",
  });
  const pageToken = parsedUrl.searchParams.get("pageToken");
  if (pageToken) params.set("pageToken", pageToken);

  const page = await googleJson(userId, `${BASE}/commentThreads?${params.toString()}`);
  const items = await Promise.all((page.items || []).map((thread) => hydrateThreadReplies(userId, thread)));
  return { ...page, items };
};

export const postTopLevelComment = async ({ req }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const videoId = String(body.videoId || "").trim();
  const text = String(body.text || "").trim();
  if (!videoId || !text) {
    const error = new Error("videoId and text are required.");
    error.statusCode = 400;
    throw error;
  }
  return googleJson(userId, `${BASE}/commentThreads?part=snippet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      snippet: {
        videoId,
        topLevelComment: { snippet: { textOriginal: text } },
      },
    }),
  });
};

export const moderateComment = async ({ req }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const id = String(body.id || "").trim();
  const moderationStatus = String(body.moderationStatus || "").trim();
  if (!id || !["published", "heldForReview", "rejected"].includes(moderationStatus)) {
    const error = new Error("id and a valid moderationStatus are required.");
    error.statusCode = 400;
    throw error;
  }
  const params = new URLSearchParams({ id, moderationStatus });
  if (body.banAuthor === true && moderationStatus === "rejected") params.set("banAuthor", "true");
  return googleJson(userId, `${BASE}/comments/setModerationStatus?${params.toString()}`, {
    method: "POST",
  });
};

export const markCommentAsSpam = async ({ req }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const id = String(body.id || "").trim();
  if (!id) {
    const error = new Error("id is required.");
    error.statusCode = 400;
    throw error;
  }
  return googleJson(userId, `${BASE}/comments/markAsSpam?id=${encodeURIComponent(id)}`, {
    method: "POST",
  });
};

export const postCommentReply = async ({ req }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const parentId = String(body.parentId || "").trim();
  const text = String(body.text || "").trim();
  if (!parentId || !text) {
    const error = new Error("parentId and text are required.");
    error.statusCode = 400;
    throw error;
  }
  return googleJson(userId, `${BASE}/comments?part=snippet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snippet: { parentId, textOriginal: text } }),
  });
};

export const toApiError = (error) => {
  if (error instanceof ReconnectRequiredError) {
    return { status: 401, body: { error: { code: "RECONNECT_REQUIRED", message: error.message } } };
  }
  const status = Number(error?.statusCode || 500);
  return {
    status,
    body: {
      error: {
        code: String(error?.code || (status === 401 ? "SIGNED_OUT" : "YOUTUBE_REQUEST_FAILED")),
        message: error instanceof Error ? error.message : "YouTube request failed.",
      },
    },
  };
};
