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
