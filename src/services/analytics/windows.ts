/**
 * The single source of truth for ViewTube analytics time windows.
 *
 * Three sync engines (canonicalSync, vt-sync-local and SyncCoordinator) each
 * grew their own window vocabulary, day-lookup table and range resolver. They
 * disagreed on the one thing that matters most for short windows: where the
 * range ends. YouTube Analytics has no complete row for "today", so a range
 * ending at `new Date()` understates every window by up to one day — 0.3% on
 * 365d, but up to 14% on 7d.
 *
 * Every window range in the app resolves through `resolveWindowRange` here.
 * See docs/migration/TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md §2.
 */

export type AnalyticsWindow = "7d" | "28d" | "90d" | "365d" | "lifetime"

/** Every window except lifetime — the ones that support previous-period comparison. */
export type ComparableAnalyticsWindow = Exclude<AnalyticsWindow, "lifetime">

/** Which half of a comparison a range represents. */
export type AnalyticsPeriod = "current" | "previous"

/**
 * Canonical ordering: widest first. Fallback selection walks this order, so
 * a missing 7d row degrades to 28d rather than to nothing.
 */
export const ANALYTICS_WINDOWS: AnalyticsWindow[] = [
 "lifetime",
 "365d",
 "90d",
 "28d",
 "7d",
]

export const COMPARABLE_WINDOWS: ComparableAnalyticsWindow[] = [
 "365d",
 "90d",
 "28d",
 "7d",
]

export const WINDOW_DAYS: Record<ComparableAnalyticsWindow, number> = {
 "7d": 7,
 "28d": 28,
 "90d": 90,
 "365d": 365,
}

/** Long form, for headings and provenance lines. */
export const WINDOW_LABELS: Record<AnalyticsWindow, string> = {
 "7d": "Last 7 days",
 "28d": "Last 28 days",
 "90d": "Last 90 days",
 "365d": "Last 365 days",
 lifetime: "Lifetime",
}

/** Short form, for controller chips and table cells. */
export const WINDOW_SHORT_LABELS: Record<AnalyticsWindow, string> = {
 "7d": "7D",
 "28d": "28D",
 "90d": "90D",
 "365d": "365D",
 lifetime: "LIFETIME",
}

/**
 * Fallback start for a channel with no usable publishedAt. YouTube itself
 * launched 2005-04-23, so nothing can predate it.
 */
export const ANALYTICS_EPOCH = "2005-04-23"

export const isAnalyticsWindow = (value: unknown): value is AnalyticsWindow =>
 typeof value === "string" && (ANALYTICS_WINDOWS as string[]).includes(value)

export const isoDate = (date: Date): string => date.toISOString().split("T")[0]

const toValidDate = (value?: string | null): Date | null => {
 if (!value) return null
 const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`)
 return Number.isNaN(parsed.getTime()) ? null : parsed
}

const addUtcDays = (value: Date, days: number): Date => {
 const next = new Date(value)
 next.setUTCDate(next.getUTCDate() + days)
 return next
}

/**
 * The most recent date YouTube Analytics has a complete row for: yesterday,
 * UTC. Today's row is always partial, so no window may end on it.
 */
export const latestCompleteAnalyticsDate = (now = new Date()): Date => {
 const value = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
 )
 return addUtcDays(value, -1)
}

export type ResolvedWindowRange = {
 startDate: string
 endDate: string
 /**
  * "partial" when the channel did not exist for the whole requested range, so
  * the returned totals cover less time than the window name implies. Callers
  * must surface this rather than presenting a clamped range as a full window.
  */
 coverage: "complete" | "partial"
}

/**
 * Resolve one window (optionally its previous-period comparison) to an
 * inclusive date range.
 *
 * - Ranges are inclusive on both ends and end at the last complete analytics
 *   day, never today.
 * - "previous" is the equally sized range immediately before "current", with
 *   no overlap: 7d current [D-6..D], 7d previous [D-13..D-7].
 * - lifetime starts at the channel's publishedAt, falling back to the YouTube
 *   epoch.
 * - A start clamped forward by publishedAt yields coverage "partial".
 */
export const resolveWindowRange = (input: {
 window: AnalyticsWindow
 period?: AnalyticsPeriod
 channelPublishedAt?: string | null
 endDate?: Date
}): ResolvedWindowRange => {
 const end = input.endDate || latestCompleteAnalyticsDate()
 const published = toValidDate(input.channelPublishedAt)
 let requestedStart: Date
 let requestedEnd = end

 if (input.window === "lifetime") {
  requestedStart = published || new Date(`${ANALYTICS_EPOCH}T00:00:00Z`)
 } else {
  const days = WINDOW_DAYS[input.window]
  if (input.period === "previous") {
   requestedEnd = addUtcDays(end, -days)
   requestedStart = addUtcDays(requestedEnd, -(days - 1))
  } else {
   requestedStart = addUtcDays(end, -(days - 1))
  }
 }

 const clampedStart =
  published && requestedStart < published ? published : requestedStart
 return {
  startDate: isoDate(clampedStart),
  endDate: isoDate(requestedEnd),
  coverage:
   clampedStart.getTime() === requestedStart.getTime() ? "complete" : "partial",
 }
}

/**
 * Number of days a window covers, for pacing and budget estimates. Lifetime
 * has no fixed length, so callers that need one must resolve a range first.
 */
export const windowDayCount = (window: AnalyticsWindow): number | null =>
 window === "lifetime" ? null : WINDOW_DAYS[window]
