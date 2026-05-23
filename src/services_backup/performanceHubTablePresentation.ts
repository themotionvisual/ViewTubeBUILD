const text = (value: unknown): string => {
 if (typeof value === "string") return value.trim()
 if (typeof value === "number" && Number.isFinite(value)) return String(value)
 return ""
}

export const resolvePerformanceHubVideoIdentity = (
 row: Record<string, unknown>,
 fallbackTitle: string,
): string => {
 return text(row["Video ID"] || row.Dimension || row.videoId || fallbackTitle)
}

export const resolvePerformanceHubThumbnailUrl = (
 row: Record<string, unknown>,
): string => {
 const canonical = row.__canonical as
  | { thumbnailUrl?: unknown; thumbnail?: unknown }
  | undefined

 const candidates = [
  row.thumbnailUrl,
  row.thumbnail,
  row["Thumbnail URL"],
  row["Thumbnail"],
  canonical?.thumbnailUrl,
  canonical?.thumbnail,
 ]

 for (const candidate of candidates) {
  const value = text(candidate)
  if (/^https?:\/\//i.test(value)) return value
 }

 return ""
}
