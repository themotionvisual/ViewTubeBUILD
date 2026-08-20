import { fetchVideoList } from "./youtubeDataFetcher";

/**
 * Simple local storage cache for video ID → title & thumbnail.
 * Stored under key `vt_video_meta_cache` as JSON string.
 */
const VIDEO_META_CACHE_KEY = "vt_video_meta_cache";

/**
 * Load cached video meta from localStorage.
 * Returns empty object if not present or malformed.
 */
export const loadVideoMetaCache = (): Record<string, { title: string; thumbnail: string }> => {
  try {
    const raw = localStorage.getItem(VIDEO_META_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, { title: string; thumbnail: string }>;
    return parsed ?? {};
  } catch {
    return {};
  }
};

/**
 * Save video meta cache to localStorage.
 */
export const saveVideoMetaCache = (cache: Record<string, { title: string; thumbnail: string }>) => {
  try {
    localStorage.setItem(VIDEO_META_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("[videoMetaCache] Failed to persist cache", e);
  }
};

/**
 * Ensure the cache contains entries for all videos owned by the channel.
 * If `forceRefresh` is true, re-fetch all video metadata regardless of cache state.
 */
export const ensureVideoMetaCache = async (forceRefresh = false): Promise<Record<string, { title: string; thumbnail: string }>> => {
  const existing = loadVideoMetaCache();
  if (!forceRefresh && Object.keys(existing).length > 0) {
    // Assume cache is valid; callers may still refresh later.
    return existing;
  }

  // Fetch all video snippets (IDs, titles, thumbnails) via Data API.
  // Pagination handled internally by fetchVideoList (maxResults=50, loops through uploads playlist).
  const videos = await fetchVideoList(50);
  const newCache: Record<string, { title: string; thumbnail: string }> = {};
  videos.forEach((v) => {
    if (v.videoId) {
      newCache[v.videoId] = {
        title: v.title ?? "",
        thumbnail: v.thumbnail ?? "",
      };
    }
  });
  saveVideoMetaCache(newCache);
  return newCache;
};
