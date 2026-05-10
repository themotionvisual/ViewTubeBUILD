export const toNumber = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return 0
 const cleaned = value.replace(/[^0-9.-]/g, "")
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : 0
}

export const toText = (value: unknown): string => {
 if (typeof value === "string") return value
 if (typeof value === "number") return String(value)
 if (value == null) return ""
 return String(value)
}

export const hasValue = (value: unknown): boolean => {
 if (value == null) return false
 if (typeof value === "string") return value.trim() !== ""
 if (typeof value === "number") return Number.isFinite(value)
 return true
}

export const parseDurationSeconds = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 const raw = toText(value).trim()
 if (!raw) return 0

 if (/^PT/.test(raw)) {
  const match = raw.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
 }

 if (raw.includes(":")) {
  const parts = raw.split(":").map((p) => Number(p) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
 }

 return toNumber(raw)
}

export const formatTrafficSourceNickname = (canonical: string): string => {
 const map: Record<string, string> = {
  SHORTS: "Shorts feed",
  SUBSCRIBER: "Browse features",
  YT_SEARCH: "YouTube search",
  EXT_URL: "External",
  YT_CHANNEL: "Channel pages",
  RELATED_VIDEO: "Suggested videos",
  YT_OTHER_PAGE: "Other YouTube features",
  PLAYLIST: "Playlists",
  NO_LINK_OTHER: "Direct or unknown",
  NOTIFICATION: "Notifications",
  SOUND_PAGE: "Sound pages",
  SHORTS_CONTENT_LINKS: "Related Shorts",
  END_SCREEN: "End screens",
  HASHTAGS: "Hashtag pages",
  ANNOTATION: "Video cards and annotations",
  IMMERSIVE_LIVE: "Vertical live feed",
  ADVERTISING: "YouTube advertising",
 }
 const upper = (canonical || "").trim().toUpperCase()
 return map[upper] || canonical
}
