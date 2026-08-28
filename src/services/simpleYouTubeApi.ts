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


export const fetchSimpleOwnedVideos = async () => {
  const response = await fetch("/api/youtube/videos", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return readApiJson(response);
};

export const fetchSimpleOwnedVideo = async (videoId: string) => {
  const response = await fetch(`/api/youtube/videos/${encodeURIComponent(videoId)}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return readApiJson(response);
};

export const patchSimpleOwnedVideo = async (
  videoId: string,
  patch: { snippet?: Record<string, unknown>; status?: Record<string, unknown> },
) => {
  const response = await fetch(`/api/youtube/videos/${encodeURIComponent(videoId)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(patch),
  });
  return readApiJson(response);
};


export interface SimplePlaylist {
  id: string;
  title: string;
  description?: string;
  itemCount?: number;
}

export interface SimplePlaylistMembership {
  playlistId: string;
  playlistItemId: string;
}

export const fetchSimplePlaylists = async (): Promise<SimplePlaylist[]> => {
  const response = await fetch("/api/youtube/playlists", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await readApiJson(response);
  return Array.isArray(payload?.items) ? payload.items : [];
};

export const fetchSimpleVideoPlaylistMemberships = async (
  videoId: string,
  playlistIds: string[],
): Promise<SimplePlaylistMembership[]> => {
  const response = await fetch(`/api/youtube/playlists/memberships?videoId=${encodeURIComponent(videoId)}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ playlistIds }),
  });
  const payload = await readApiJson(response);
  return Array.isArray(payload?.items) ? payload.items : [];
};

export const addSimpleVideoToPlaylist = async (playlistId: string, videoId: string) => {
  const response = await fetch("/api/youtube/playlists/items", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ playlistId, videoId }),
  });
  return readApiJson(response);
};

export const removeSimpleVideoFromPlaylist = async (playlistItemId: string) => {
  const response = await fetch(`/api/youtube/playlists/items/${encodeURIComponent(playlistItemId)}`, {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return readApiJson(response);
};

export const setSimpleVideoThumbnail = async (videoId: string, file: File) => {
  const response = await fetch(`/api/youtube/videos/${encodeURIComponent(videoId)}/thumbnail`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": file.type || "image/jpeg", Accept: "application/json" },
    body: file,
  });
  return readApiJson(response);
};
