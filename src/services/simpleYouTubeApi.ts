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


export interface SimpleVideoSnippet {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

export interface SimpleVideoDetails extends SimpleVideoSnippet {
  description: string;
  tags: string[];
  categoryId: string;
  privacyStatus: string;
}

export interface SimpleVideoStats {
  videoId: string;
  views: string;
  likes: string;
  comments: string;
  duration: string;
  durationRaw: string;
  privacyStatus: string;
  title: string;
  description: string;
  tags: string[];
}

const bestThumbnail = (snippet: any) =>
  String(
    snippet?.thumbnails?.maxres?.url ||
    snippet?.thumbnails?.standard?.url ||
    snippet?.thumbnails?.high?.url ||
    snippet?.thumbnails?.medium?.url ||
    snippet?.thumbnails?.default?.url ||
    "",
  );

export const toSimpleVideoSnippet = (item: any): SimpleVideoSnippet => ({
  videoId: String(item?.id || ""),
  title: String(item?.snippet?.title || ""),
  publishedAt: String(item?.snippet?.publishedAt || ""),
  thumbnail: bestThumbnail(item?.snippet),
});

export const toSimpleVideoDetails = (item: any): SimpleVideoDetails => ({
  ...toSimpleVideoSnippet(item),
  description: String(item?.snippet?.description || ""),
  tags: Array.isArray(item?.snippet?.tags) ? item.snippet.tags.map(String) : [],
  categoryId: String(item?.snippet?.categoryId || "22"),
  privacyStatus: String(item?.status?.privacyStatus || "private"),
});

export const toSimpleVideoStats = (item: any): SimpleVideoStats => ({
  videoId: String(item?.id || ""),
  views: String(item?.statistics?.viewCount || "0"),
  likes: String(item?.statistics?.likeCount || "0"),
  comments: String(item?.statistics?.commentCount || "0"),
  duration: String(item?.contentDetails?.duration || "PT0S"),
  durationRaw: String(item?.contentDetails?.duration || "PT0S"),
  privacyStatus: String(item?.status?.privacyStatus || ""),
  title: String(item?.snippet?.title || ""),
  description: String(item?.snippet?.description || ""),
  tags: Array.isArray(item?.snippet?.tags) ? item.snippet.tags.map(String) : [],
});

export const fetchSimpleVideoInventory = async (): Promise<{
  videos: SimpleVideoSnippet[];
  rawItems: any[];
}> => {
  const payload = await fetchSimpleOwnedVideos();
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];
  return {
    videos: rawItems.map(toSimpleVideoSnippet).filter((video) => video.videoId),
    rawItems,
  };
};

export const fetchSimpleVideoBundle = async (videoId: string): Promise<{
  details: SimpleVideoDetails;
  stats: SimpleVideoStats;
  raw: any;
}> => {
  const raw = await fetchSimpleOwnedVideo(videoId);
  return {
    details: toSimpleVideoDetails(raw),
    stats: toSimpleVideoStats(raw),
    raw,
  };
};


export interface SimpleAnalyticsQuery {
  ids?: string;
  startDate: string;
  endDate: string;
  metrics: string[];
  dimensions?: string[];
  filters?: string;
  sort?: string;
  currency?: string;
  maxResults?: number;
  startIndex?: number;
  includeHistoricalChannelData?: boolean;
}

export const querySimpleAnalytics = async (query: SimpleAnalyticsQuery) => {
  const response = await fetch("/api/youtube/analytics/query", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(query),
  });
  return readApiJson(response);
};

export const fetchSimpleReportingTypes = async () => {
  const response = await fetch("/api/youtube/reporting/types", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return readApiJson(response);
};

export const fetchSimpleReportingJobs = async () => {
  const response = await fetch("/api/youtube/reporting/jobs", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return readApiJson(response);
};

export const createSimpleReportingJob = async (reportTypeId: string, name?: string) => {
  const response = await fetch("/api/youtube/reporting/jobs", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ reportTypeId, name }),
  });
  return readApiJson(response);
};

export const fetchSimpleReportingReports = async (
  jobId: string,
  options: { createdAfter?: string; startTimeAtOrAfter?: string; startTimeBefore?: string } = {},
) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options)) if (value) params.set(key, value);
  const response = await fetch(
    `/api/youtube/reporting/jobs/${encodeURIComponent(jobId)}/reports?${params.toString()}`,
    { credentials: "include", headers: { Accept: "application/json" } },
  );
  return readApiJson(response);
};

export const simpleReportingDownloadUrl = (jobId: string, reportId: string) =>
  `/api/youtube/reporting/jobs/${encodeURIComponent(jobId)}/reports/${encodeURIComponent(reportId)}/download`;


export interface SimpleSingleVideoAnalytics {
  shares: string;
  averageViewPercentage: string;
  clickThroughRate: string;
  estimatedRevenue: string;
}

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const fetchSimpleSingleVideoAnalytics = async (
  videoId: string,
): Promise<SimpleSingleVideoAnalytics> => {
  const base = {
    ids: "channel==MINE",
    startDate: "2000-01-01",
    endDate: todayIsoDate(),
    filters: `video==${videoId}`,
  };

  const [core, interaction, monetary] = await Promise.all([
    querySimpleAnalytics({
      ...base,
      metrics: ["shares", "averageViewPercentage"],
    }).catch(() => null),
    querySimpleAnalytics({
      ...base,
      metrics: ["cardClickRate"],
    }).catch(() => null),
    querySimpleAnalytics({
      ...base,
      metrics: ["estimatedRevenue"],
    }).catch(() => null),
  ]);

  const coreRow = Array.isArray(core?.rows) ? core.rows[0] : null;
  const interactionRow = Array.isArray(interaction?.rows) ? interaction.rows[0] : null;
  const monetaryRow = Array.isArray(monetary?.rows) ? monetary.rows[0] : null;

  const shares = Number(coreRow?.[0] || 0);
  const avp = Number(coreRow?.[1] || 0);
  const cardClickRate = Number(interactionRow?.[0] || 0);
  const revenue = Number(monetaryRow?.[0] || 0);

  return {
    shares: String(Number.isFinite(shares) ? shares : 0),
    averageViewPercentage: Number.isFinite(avp) ? avp.toFixed(1) : "0.0",
    clickThroughRate: Number.isFinite(cardClickRate) ? `${cardClickRate.toFixed(1)}%` : "N/A",
    estimatedRevenue: Number.isFinite(revenue) ? revenue.toFixed(2) : "0.00",
  };
};
