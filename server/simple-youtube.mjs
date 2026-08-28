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


const chunk = (items, size) => {
  const out = [];
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
  return out;
};

export const listOwnedVideos = async ({ req }) => {
  const userId = await requireUser(req);
  const channel = await googleJson(userId, `${BASE}/channels?part=contentDetails&mine=true`);
  const uploads = channel?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return { items: [], totalResults: 0 };

  const videoIds = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      part: "contentDetails",
      playlistId: uploads,
      maxResults: "50",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await googleJson(userId, `${BASE}/playlistItems?${params.toString()}`);
    for (const item of page.items || []) {
      const id = String(item?.contentDetails?.videoId || "");
      if (id) videoIds.push(id);
    }
    pageToken = page.nextPageToken || "";
  } while (pageToken);

  const items = [];
  for (const ids of chunk(videoIds, 50)) {
    const params = new URLSearchParams({
      part: "snippet,statistics,contentDetails,status",
      id: ids.join(","),
      maxResults: "50",
    });
    const page = await googleJson(userId, `${BASE}/videos?${params.toString()}`);
    items.push(...(page.items || []));
  }

  const rank = new Map(videoIds.map((id, index) => [id, index]));
  items.sort((a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER));
  return { items, totalResults: items.length, uploadsPlaylistId: uploads };
};

export const getOwnedVideo = async ({ req, videoId }) => {
  const userId = await requireUser(req);
  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails,status",
    id: videoId,
  });
  const page = await googleJson(userId, `${BASE}/videos?${params.toString()}`);
  const item = page?.items?.[0];
  if (!item) {
    const error = new Error("Video not found.");
    error.statusCode = 404;
    throw error;
  }
  return item;
};

export const patchOwnedVideo = async ({ req, videoId }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const currentParams = new URLSearchParams({ part: "snippet,status", id: videoId });
  const currentPage = await googleJson(userId, `${BASE}/videos?${currentParams.toString()}`);
  const current = currentPage?.items?.[0];
  if (!current) {
    const error = new Error("Video not found.");
    error.statusCode = 404;
    throw error;
  }

  const allowedSnippet = ["title","description","tags","categoryId","defaultLanguage","defaultAudioLanguage"];
  const allowedStatus = ["privacyStatus","selfDeclaredMadeForKids"];
  const snippetPatch = body?.snippet && typeof body.snippet === "object" ? body.snippet : {};
  const statusPatch = body?.status && typeof body.status === "object" ? body.status : {};
  const nextSnippet = { ...(current.snippet || {}) };
  const nextStatus = { ...(current.status || {}) };

  for (const key of allowedSnippet) {
    if (Object.prototype.hasOwnProperty.call(snippetPatch, key)) nextSnippet[key] = snippetPatch[key];
  }
  for (const key of allowedStatus) {
    if (Object.prototype.hasOwnProperty.call(statusPatch, key)) nextStatus[key] = statusPatch[key];
  }

  const parts = [];
  const updateBody = { id: videoId };
  if (Object.keys(snippetPatch).some((key) => allowedSnippet.includes(key))) {
    parts.push("snippet");
    updateBody.snippet = nextSnippet;
  }
  if (Object.keys(statusPatch).some((key) => allowedStatus.includes(key))) {
    parts.push("status");
    updateBody.status = nextStatus;
  }
  if (!parts.length) {
    const error = new Error("No supported video fields were supplied.");
    error.statusCode = 400;
    throw error;
  }

  return googleJson(userId, `${BASE}/videos?part=${encodeURIComponent(parts.join(","))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateBody),
  });
};


const readRawBody = async (req, maxBytes = 2 * 1024 * 1024) => new Promise((resolve, reject) => {
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
  req.on("end", () => resolve(Buffer.concat(chunks)));
});

export const listPlaylists = async ({ req }) => {
  const userId = await requireUser(req);
  const items = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      mine: "true",
      maxResults: "50",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await googleJson(userId, `${BASE}/playlists?${params.toString()}`);
    items.push(...(page.items || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return {
    items: items.map((item) => ({
      id: String(item?.id || ""),
      title: String(item?.snippet?.title || ""),
      description: String(item?.snippet?.description || ""),
      itemCount: Number(item?.contentDetails?.itemCount || 0),
    })).filter((item) => item.id),
  };
};

export const listVideoPlaylistMemberships = async ({ req, videoId }) => {
  const userId = await requireUser(req);
  const body = req.method === "POST" ? await readJsonBody(req) : {};
  const playlistIds = Array.isArray(body.playlistIds)
    ? body.playlistIds.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const memberships = [];
  for (const playlistId of playlistIds) {
    const params = new URLSearchParams({
      part: "id,snippet",
      playlistId,
      videoId,
      maxResults: "50",
    });
    const page = await googleJson(userId, `${BASE}/playlistItems?${params.toString()}`);
    const item = page?.items?.[0];
    if (item?.id) memberships.push({ playlistId, playlistItemId: String(item.id) });
  }
  return { items: memberships };
};

export const addVideoToPlaylist = async ({ req }) => {
  const userId = await requireUser(req);
  const body = await readJsonBody(req);
  const playlistId = String(body.playlistId || "").trim();
  const videoId = String(body.videoId || "").trim();
  if (!playlistId || !videoId) {
    const error = new Error("playlistId and videoId are required.");
    error.statusCode = 400;
    throw error;
  }
  return googleJson(userId, `${BASE}/playlistItems?part=snippet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      snippet: {
        playlistId,
        resourceId: { kind: "youtube#video", videoId },
      },
    }),
  });
};

export const removeVideoFromPlaylist = async ({ req, playlistItemId }) => {
  const userId = await requireUser(req);
  const token = await (await import("./simple-google-client.mjs")).getServerGoogleAccessToken(userId);
  const response = await fetch(`${BASE}/playlistItems?id=${encodeURIComponent(playlistItemId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status === 401) {
    const error = new ReconnectRequiredError();
    throw error;
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload?.error?.message || `Playlist removal failed (${response.status}).`);
    error.statusCode = response.status;
    throw error;
  }
  return { success: true };
};

export const setVideoThumbnail = async ({ req, videoId }) => {
  const userId = await requireUser(req);
  const contentType = String(req.headers["content-type"] || "");
  if (!/^image\/(jpeg|png|webp)$/i.test(contentType)) {
    const error = new Error("Thumbnail must be a JPEG, PNG, or WebP image.");
    error.statusCode = 415;
    throw error;
  }
  const body = await readRawBody(req);
  if (!body.length) {
    const error = new Error("Thumbnail image is empty.");
    error.statusCode = 400;
    throw error;
  }
  const token = await (await import("./simple-google-client.mjs")).getServerGoogleAccessToken(userId);
  const response = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${encodeURIComponent(videoId)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
      body,
      signal: AbortSignal.timeout(30_000),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) throw new ReconnectRequiredError();
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Thumbnail upload failed (${response.status}).`);
    error.statusCode = response.status;
    throw error;
  }
  return payload;
};
