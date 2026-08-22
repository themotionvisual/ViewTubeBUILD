const failedThumbnailUrls = new Set<string>()

export const YOUTUBE_THUMBNAIL_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23111' font-family='Arial' font-size='16'%3EThumbnail unavailable%3C/text%3E%3C/svg%3E"

const uniqueUrls = (urls: Array<string | null | undefined>): string[] =>
  Array.from(new Set(urls.map((url) => url?.trim()).filter((url): url is string => Boolean(url))))

export const getYouTubeThumbnailCandidates = (
  videoId: string,
  preferredUrls: Array<string | null | undefined> = [],
): string[] => uniqueUrls([
  ...preferredUrls,
  videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null,
  videoId ? `https://i.ytimg.com/vi/${videoId}/hq720.jpg` : null,
  videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
  videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : null,
])

export const firstYouTubeThumbnailCandidate = (
  videoId: string,
  preferredUrls: Array<string | null | undefined> = [],
): string => getYouTubeThumbnailCandidates(videoId, preferredUrls)
  .find((url) => !failedThumbnailUrls.has(url)) ?? YOUTUBE_THUMBNAIL_PLACEHOLDER

export const nextYouTubeThumbnailCandidate = (
  videoId: string,
  currentUrl: string,
  preferredUrls: Array<string | null | undefined> = [],
): string => {
  if (currentUrl && currentUrl !== YOUTUBE_THUMBNAIL_PLACEHOLDER) {
    failedThumbnailUrls.add(currentUrl)
  }

  const candidates = getYouTubeThumbnailCandidates(videoId, preferredUrls)
  const currentIndex = candidates.indexOf(currentUrl)
  const remaining = currentIndex >= 0 ? candidates.slice(currentIndex + 1) : candidates
  return remaining.find((url) => !failedThumbnailUrls.has(url)) ?? YOUTUBE_THUMBNAIL_PLACEHOLDER
}

export const resetFailedYouTubeThumbnailsForTests = (): void => {
  failedThumbnailUrls.clear()
}
