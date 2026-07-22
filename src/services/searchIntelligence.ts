import type { SearchConsoleQueryRow } from "./googleSearchConsoleService"
import type { NormalizedTrafficRow } from "./youtube/trafficAnalyticsSync"

export type SearchIntelligenceSourceLane =
 | "google_search_console"
 | "youtube_search_keyword"
 | "google_to_youtube_referral"

export type SearchIntelligenceReferralClass =
 | "google_search_referral"
 | "external_referral"
 | "direct_or_unknown"

export type SearchIntelligenceRow = {
 sourceLane: SearchIntelligenceSourceLane
 sourceLabel: string
 siteUrl?: string
 query?: string
 keywordOrReferrer: string
 targetPage?: string
 targetVideoId?: string
 targetVideoTitle?: string
 searchAppearance?: string
 device?: string
 country?: string
 date?: string
 clicks?: number
 impressions?: number
 ctr?: number
 position?: number
 views?: number
 estimatedMinutesWatched?: number
 watchHours?: number
 averageViewDuration?: number
 referralClass?: SearchIntelligenceReferralClass
 raw?: Record<string, unknown>
}

const text = (value: unknown): string => String(value ?? "").trim()

const numberFromUnknown = (value: unknown): number | undefined => {
 if (value === null || value === undefined || value === "") return undefined
 const parsed = Number(value)
 return Number.isFinite(parsed) ? parsed : undefined
}

export const classifyExternalReferral = (
 referrer: unknown,
): SearchIntelligenceReferralClass => {
 const normalized = text(referrer).toLowerCase()
 if (!normalized) return "direct_or_unknown"
 if (
  normalized.includes("google") ||
  normalized.includes("google search") ||
  normalized.includes("googleusercontent") ||
  normalized.includes("android.gm") ||
  normalized.includes("google go")
 ) {
  return "google_search_referral"
 }
 return "external_referral"
}

export const buildSearchConsoleSearchRows = (
 rows: SearchConsoleQueryRow[],
): SearchIntelligenceRow[] =>
 rows.map((row) => ({
  sourceLane: "google_search_console",
  sourceLabel: "Google Search",
  siteUrl: row.siteUrl,
  query: row.query,
  keywordOrReferrer: row.query,
  targetPage: row.page,
  searchAppearance: row.searchAppearance,
  device: row.device,
  country: row.country,
  date: row.date,
  clicks: row.clicks,
  impressions: row.impressions,
  ctr: row.ctr,
  position: row.position,
  raw: row as unknown as Record<string, unknown>,
 }))

export const buildTrafficSearchRows = (
 rows: NormalizedTrafficRow[],
 videoTitleById: Record<string, string> = {},
): SearchIntelligenceRow[] =>
 rows
  .filter(
   (row) =>
    row.trafficSourceType === "YT_SEARCH" || row.trafficSourceType === "EXT_URL",
  )
  .map((row) => {
   const detail = text(row.trafficSourceDetail || row.sourceTitle || row.sourceLabel)
   const sourceLane: SearchIntelligenceSourceLane =
    row.trafficSourceType === "YT_SEARCH"
     ? "youtube_search_keyword"
     : "google_to_youtube_referral"
   const referralClass =
    sourceLane === "google_to_youtube_referral"
     ? classifyExternalReferral(detail)
     : undefined
   return {
    sourceLane,
    sourceLabel:
     sourceLane === "youtube_search_keyword"
      ? "YouTube Search"
      : referralClass === "google_search_referral"
        ? "Google -> YouTube"
        : "External -> YouTube",
    keywordOrReferrer: detail,
    query: sourceLane === "youtube_search_keyword" ? detail : undefined,
    targetVideoId: text(row.videoId) || undefined,
    targetVideoTitle: text(videoTitleById[text(row.videoId)]) || undefined,
    date: row.date,
    views: numberFromUnknown(row.views),
    estimatedMinutesWatched: numberFromUnknown(row.watchMinutes),
    watchHours: numberFromUnknown(row.watchHours),
    averageViewDuration: numberFromUnknown(row.averageViewDuration),
    referralClass,
    raw: row.raw,
   }
  })
