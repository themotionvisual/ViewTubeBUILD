const readApiJson = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || `ViewTube API request failed (${response.status})`;
    const error = new Error(message) as Error & { code?: string; status?: number };
    error.code = payload?.error?.code;
    error.status = response.status;
    throw error;
  }
  return payload;
};

export const fetchSimpleCommentThreads = async (maxResults = 100, pageToken?: string) => {
  const params = new URLSearchParams({ maxResults: String(maxResults) });
  if (pageToken) params.set("pageToken", pageToken);
  const response = await fetch(`/api/youtube/comments/threads?${params.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return readApiJson(response);
};

export const postSimpleCommentReply = async (parentId: string, text: string) => {
  const response = await fetch("/api/youtube/comments/reply", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ parentId, text }),
  });
  return readApiJson(response);
};


export const fetchAllSimpleCommentThreads = async (maxResults = 100) => {
  const items: any[] = [];
  let pageToken = "";
  do {
    const page = await fetchSimpleCommentThreads(maxResults, pageToken || undefined);
    items.push(...(Array.isArray(page?.items) ? page.items : []));
    pageToken = String(page?.nextPageToken || "");
  } while (pageToken);
  return items;
};

export const postSimpleTopLevelComment = async (videoId: string, text: string) => {
  const response = await fetch("/api/youtube/comments/top-level", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ videoId, text }),
  });
  return readApiJson(response);
};

export const moderateSimpleComment = async (
  id: string,
  moderationStatus: "published" | "heldForReview" | "rejected",
  banAuthor = false,
) => {
  const response = await fetch("/api/youtube/comments/moderate", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id, moderationStatus, banAuthor }),
  });
  return readApiJson(response);
};

export const markSimpleCommentAsSpam = async (id: string) => {
  const response = await fetch("/api/youtube/comments/mark-spam", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id }),
  });
  return readApiJson(response);
};
