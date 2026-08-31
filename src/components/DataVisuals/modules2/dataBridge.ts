/**
 * Shared data helpers for DataVisuals-2 modules.
 *
 * Modules ported from the source viz app expect flat weekly / video rows
 * (e.g. `CHANNEL_WEEKLY[i].views`). viewtubeX serves canonical `MetricCell`
 * shapes via `TubeExplorerVisualProps`. The helpers here bridge the two:
 *
 *   • `readMetric(row, key)` — safe metric-value read that respects unavailable cells.
 *   • `rollupWeeklyFromVideos(rows, weeks)` — buckets canonical video rows into
 *     N most-recent ISO weeks (by upload date) and returns per-week aggregates
 *     shaped like the source `CHANNEL_WEEKLY` rows.
 *   • `rollupWeeklyFromDaily(daily, weeks)` — same shape, built only from the
 *     channel-wide Daily Stats dataset.
 *
 * These helpers never substitute Traffic × Day for channel-wide statistics.
 */

import type { CanonicalVideoRow } from "../../../services/analytics/DataStore"
import { resolveMetricNumber } from "../../../services/analytics/MetricRegistry"

/**
 * Shape produced by `flattenVideosForVt2` — a plain-number video row that the
 * ported source modules can consume directly (they were originally written
 * against `REAL_VIDEOS` / `VIDEOS` arrays with flat numeric fields).
 */
export type Vt2VideoRow = {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  /** Seconds. Source modules use `< 60` as the Shorts test. */
  duration: number
  views: number
  watchMins: number
  watchHrs: number
  likes: number
  comments: number
  shares: number
  subsGained: number
  subsLost: number
  revenue: number
  cpm: number
  rpm: number
  ctr: number
  avp: number
  impressions: number
}

/**
 * Shape produced by `flattenSearchTermsForVt2` — one row per search term
 * with the numbers the SearchTermGravity module needs.
 */
export type Vt2SearchTermRow = {
  term: string
  views: number
  minutes: number
  impressions: number
}

export type Vt2WeeklyRow = {
  /** 1-based week index — 1 == oldest bucket, N == most recent */
  week: number
  /** ISO date of the Monday that starts the bucket (YYYY-MM-DD) */
  date: string
  views: number
  subs: number
  revenue: number
  likes: number
  /** Watch hours (already converted from seconds/minutes) */
  watchMins_hrs: number
  impressions: number
}

const numOr = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[$,%]/g, "").replace(/,/g, "").trim())
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export const readMetric = (
  row: CanonicalVideoRow,
  key: Parameters<typeof resolveMetricNumber>[1],
): number => {
  const resolved = resolveMetricNumber(row, key)
  return resolved.status === "received" && resolved.value !== null ? resolved.value : 0
}

/** Monday-anchored ISO week key for a date-ish input; `null` if unparseable. */
const isoWeekStart = (input: unknown): { key: string; date: Date } | null => {
  if (input === null || input === undefined || input === "") return null
  const raw = typeof input === "string" ? input : String(input)
  const parsed = new Date(raw)
  if (!Number.isFinite(parsed.getTime())) return null
  // Snap to Monday: getUTCDay() is 0=Sun..6=Sat; shift so Monday is start.
  const day = parsed.getUTCDay()
  const monShift = (day + 6) % 7
  const monday = new Date(Date.UTC(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate() - monShift,
  ))
  const key = monday.toISOString().slice(0, 10)
  return { key, date: monday }
}

const zeroWeek = (index: number, date: string): Vt2WeeklyRow => ({
  week: index,
  date,
  views: 0,
  subs: 0,
  revenue: 0,
  likes: 0,
  watchMins_hrs: 0,
  impressions: 0,
})

/** ISO-week key for a given `Date`, snapped to the Monday that starts the week. */
const isoWeekKeyForDate = (date: Date): string => {
  const day = date.getUTCDay()
  const monShift = (day + 6) % 7
  const monday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - monShift,
  ))
  return monday.toISOString().slice(0, 10)
}

/**
 * Anchor the window to *today's* ISO week and walk backwards N weeks,
 * filling any gaps with zero rows so the sparklines are always contiguous.
 * Without this, weeks with no uploads silently disappear and the "12-week
 * window" can span 16+ calendar weeks — making "most recent" look historical.
 */
const takeMostRecent = (
  buckets: Map<string, Vt2WeeklyRow>,
  weeks: number,
): Vt2WeeklyRow[] => {
  if (weeks <= 0) return []
  const bucketKeys = Array.from(buckets.keys()).sort()
  if (bucketKeys.length === 0) return []
  const latestBucketKey = bucketKeys[bucketKeys.length - 1]
  const endDate = new Date(`${latestBucketKey}T00:00:00Z`)

  const out: Vt2WeeklyRow[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const bucketDate = new Date(endDate.getTime() - i * 7 * 86400 * 1000)
    const key = bucketDate.toISOString().slice(0, 10)
    const bucket = buckets.get(key) ?? zeroWeek(0, key)
    out.push({ ...bucket, date: key, week: weeks - i })
  }
  return out
}

/**
 * Anchor monthly window to the latest synced snapshot month and walk backwards N months,
 * ensuring the timeline ends cleanly on the latest synced data date.
 */
const takeMostRecentMonthly = (
  buckets: Map<string, { year: number; month: number; views: number; revenue: number; watchHrs: number; subs: number }>,
  monthsCount: number = 12,
): Vt2MonthlyRow[] => {
  if (monthsCount <= 0) return []
  const bucketKeys = Array.from(buckets.keys()).sort()
  if (bucketKeys.length === 0) return []
  const latestBucketKey = bucketKeys[bucketKeys.length - 1]
  const [endYear, endMonth1Based] = latestBucketKey.split("-").map(Number)
  const endMonth = endMonth1Based - 1

  const out: Vt2MonthlyRow[] = []
  for (let i = monthsCount - 1; i >= 0; i--) {
    let y = endYear
    let m = endMonth - i
    while (m < 0) {
      m += 12
      y -= 1
    }
    const key = `${y}-${String(m + 1).padStart(2, "0")}`
    const b = buckets.get(key) ?? { year: y, month: m, views: 0, revenue: 0, watchHrs: 0, subs: 0 }
    out.push({
      label: `${MONTH_LABELS[m]} ${String(y).slice(-2)}`,
      monthKey: key,
      views: b.views,
      revenue: b.revenue,
      watchHrs: b.watchHrs,
      subs: b.subs,
    })
  }
  return out
}

/**
 * Bucket canonical video rows into weekly channel rollups by upload date.
 * Every metric collapses to a sum of the videos published in that week — a
 * defensible proxy for weekly channel activity when per-day channel totals are
 * unavailable.
 */
export const rollupWeeklyFromVideos = (
  rows: readonly CanonicalVideoRow[],
  weeks: number,
): Vt2WeeklyRow[] => {
  if (weeks <= 0 || rows.length === 0) return []
  const buckets = new Map<string, Vt2WeeklyRow>()

  for (const row of rows) {
    const iso = isoWeekStart(row.uploadDate)
    if (!iso) continue
    const bucket = buckets.get(iso.key) ?? zeroWeek(0, iso.key)
    bucket.views += readMetric(row, "views")
    bucket.subs += readMetric(row, "subscribersGained")
    bucket.revenue += readMetric(row, "revenue")
    bucket.likes += readMetric(row, "likes")
    bucket.watchMins_hrs += readMetric(row, "watchHours")
    bucket.impressions += readMetric(row, "impressions")
    buckets.set(iso.key, bucket)
  }

  return takeMostRecent(buckets, weeks)
}

/**
 * Roll channel-wide `snapshot.dailyMetrics` into weekly buckets. Traffic × Day
 * rows are deliberately incompatible with this helper.
 */
export const rollupWeeklyFromDaily = (
  daily: ReadonlyArray<Record<string, unknown>>,
  weeks: number,
): Vt2WeeklyRow[] => {
  if (weeks <= 0 || daily.length === 0) return []
  const buckets = new Map<string, Vt2WeeklyRow>()

  for (const row of daily) {
    const dateInput = row.date ?? row.day ?? row.publishedDate
    const iso = isoWeekStart(dateInput)
    if (!iso) continue
    const bucket = buckets.get(iso.key) ?? zeroWeek(0, iso.key)
    bucket.views += numOr(row.views)
    bucket.subs += numOr(row.subscribersGained) - numOr(row.subscribersLost)
    bucket.revenue += numOr(row.revenue ?? row.estimatedRevenue)
    bucket.likes += numOr(row.likes)
    bucket.watchMins_hrs += numOr(row.watchTime) // already hours per adapter
    bucket.impressions += numOr(row.impressions ?? row.adImpressions)
    buckets.set(iso.key, bucket)
  }

  return takeMostRecent(buckets, weeks)
}

/** Which source powered the current weekly rollup. Modules surface this
 *  string so a chart's totals are traceable to the underlying analytics
 *  table (or fallback) they came from. */
export type Vt2WeeklySource = "daily_metrics" | "monthly_metrics" | "none"

export type Vt2WeeklyRollup = {
  weeks: Vt2WeeklyRow[]
  source: Vt2WeeklySource
}

/**
 * Build a channel-wide weekly series exclusively from Daily Stats. Returning
 * no rows is intentional when Daily Stats is unavailable; Traffic × Day and
 * upload cohorts describe different facts and are never substitutes.
 */
export const rollupWeeklyChannelWithSource = (
  dailyMetrics: ReadonlyArray<Record<string, unknown>>,
  weeks: number,
): Vt2WeeklyRollup => {
  const dmWeeks = rollupWeeklyFromDaily(dailyMetrics, weeks)
  if (dmWeeks.length > 0) {
    return { source: "daily_metrics", weeks: dmWeeks }
  }
  return { source: "none", weeks: [] }
}

/**
 * Back-compat shim — earlier modules called `rollupWeeklyChannel(rows, daily, weeks)`
 * where `daily` was whatever daily-ish table happened to be around. Newer
 * callers should use `rollupWeeklyChannelWithSource` for a traceable rollup.
 */
export const rollupWeeklyChannel = (
  _rows: readonly CanonicalVideoRow[],
  daily: ReadonlyArray<Record<string, unknown>>,
  weeks: number,
): Vt2WeeklyRow[] => rollupWeeklyChannelWithSource(daily, weeks).weeks

/** Human-readable label for a rollup source, used in module subtitles. */
export const describeWeeklySource = (source: Vt2WeeklySource): string => {
  switch (source) {
    case "daily_metrics": return "DAILY STATS TABLE"
    case "monthly_metrics": return "MONTHLY STATS TABLE"
    case "none": return "DAILY STATS UNAVAILABLE"
  }
}

/** Weekly rollup shape used by ChannelBigBangTimeline — same 6-metric core
 *  but with `week` = source-style human-friendly week index (1..N) and the
 *  extended timeline metrics (comments, shares, saves, avp, avd). */
export type Vt2BigBangWeek = Vt2WeeklyRow & {
  comments: number
  shares: number
  saves: number
  avp: number
  avd: number
  watchMins: number
}

/** Bucket canonical rows into weeks with the extended metric set the
 *  BigBangTimeline needs. Falls back to zeros when a metric is unavailable. */
/** Bucket canonical rows into weeks with the extended metric set the
 *  BigBangTimeline needs. Sourced primarily from channel daily metrics table when available. */
export const rollupWeeklyBigBangWithSource = (
  dailyMetrics: ReadonlyArray<Record<string, unknown>> = [],
  weeks: number = 24,
): Vt2BigBangWeek[] => {
  const rollup = rollupWeeklyChannelWithSource(dailyMetrics, weeks)
  const base = rollup.weeks
  if (base.length === 0) return []

  type Ext = { comments: number; shares: number; saves: number; avpSum: number; avpN: number; avdSum: number; avdN: number }
  const extras = new Map<string, Ext>()
  for (const row of dailyMetrics) {
    const iso = isoWeekStart(row.date ?? row.day)
    if (!iso) continue
    const bucket = extras.get(iso.key) ?? { comments: 0, shares: 0, saves: 0, avpSum: 0, avpN: 0, avdSum: 0, avdN: 0 }
    bucket.comments += numOr(row.comments)
    bucket.shares += numOr(row.shares)
    bucket.saves += numOr(row.playlistSaves ?? row.videosAddedToPlaylists)
    const avp = numOr(row.averagePercentageViewed ?? row.avgPercentageViewed)
    if (avp > 0) { bucket.avpSum += avp; bucket.avpN += 1 }
    const avd = numOr(row.averageViewDuration ?? row.avgDuration)
    if (avd > 0) { bucket.avdSum += avd; bucket.avdN += 1 }
    extras.set(iso.key, bucket)
  }

  return base.map((w) => {
    const ext = extras.get(w.date) ?? { comments: 0, shares: 0, saves: 0, avpSum: 0, avpN: 0, avdSum: 0, avdN: 0 }
    return {
      ...w,
      watchMins: w.watchMins_hrs * 60,
      comments: ext.comments,
      shares: ext.shares,
      saves: ext.saves,
      avp: ext.avpN > 0 ? ext.avpSum / ext.avpN : 0,
      avd: ext.avdN > 0 ? ext.avdSum / ext.avdN : 0,
    }
  })
}

export const rollupWeeklyBigBang = (
  _rows: readonly CanonicalVideoRow[],
  weeks: number,
): Vt2BigBangWeek[] => rollupWeeklyBigBangWithSource([], weeks)

/** Per-day rollup row shape used by TrajectoryForecaster's DAILY granularity.
 *  `label` is a compact human-readable day key (e.g. "Aug 3"). */
export type Vt2DailyRow = {
  label: string
  date: string
  views: number
  revenue: number
  watchHrs: number
  subs: number
}

/** Take the N most recent daily rows from `snapshot.dailyMetrics`, converting
 *  watch-time to hours and net subscribers on the fly. Rows are sorted
 *  ascending by date so the forecast timeline reads left-to-right. Returns
 *  `[]` when the source has no rows — the module surfaces its empty state. */
export const rollupDailyFromDaily = (
  daily: ReadonlyArray<Record<string, unknown>>,
  days: number,
): Vt2DailyRow[] => {
  if (days <= 0 || daily.length === 0) return []

  type Bucket = {
    key: string
    ts: number
    views: number
    revenue: number
    watchHrs: number
    subs: number
  }
  const buckets = new Map<string, Bucket>()
  for (const row of daily) {
    const dateInput = row.date ?? row.day ?? row.publishedDate
    if (dateInput === null || dateInput === undefined || dateInput === "") continue
    const raw = typeof dateInput === "string" ? dateInput : String(dateInput)
    const d = new Date(raw)
    if (!Number.isFinite(d.getTime())) continue
    const key = d.toISOString().slice(0, 10)
    const bucket = buckets.get(key) ?? {
      key,
      ts: Date.parse(`${key}T00:00:00Z`),
      views: 0,
      revenue: 0,
      watchHrs: 0,
      subs: 0,
    }
    bucket.views += numOr(row.views)
    bucket.revenue += numOr(row.revenue ?? row.estimatedRevenue)
    // visualData passes the canonical Daily Stats value through unchanged;
    // VT-SYNC's daily contract stores watchTime in hours.
    bucket.watchHrs += numOr(row.watchTime ?? row.watchHours)
    bucket.subs += numOr(row.subscribersGained) - numOr(row.subscribersLost)
    buckets.set(key, bucket)
  }
  const sorted = Array.from(buckets.values()).sort((a, b) => a.ts - b.ts)
  if (sorted.length === 0) return []

  // Keep an actual recent calendar window. Missing dates remain missing instead
  // of being silently converted to zero-valued observations.
  const endTs = sorted[sorted.length - 1].ts
  const startTs = endTs - (days - 1) * 86_400_000
  return sorted
    .filter((entry) => entry.ts >= startTs && entry.ts <= endTs)
    .map((entry) => ({
      label: fmtDayLabel(entry.key),
      date: entry.key,
      views: entry.views,
      revenue: entry.revenue,
      watchHrs: entry.watchHrs,
      subs: entry.subs,
    }))
}

/** Compact day label like "Aug 3". `Intl.DateTimeFormat` handles i18n. */
const fmtDayLabel = (iso: string): string => {
  const parsed = new Date(`${iso}T00:00:00Z`)
  if (!Number.isFinite(parsed.getTime())) return iso
  const month = parsed.toLocaleString(undefined, { month: "short", timeZone: "UTC" })
  return `${month} ${parsed.getUTCDate()}`
}

/** Monthly row shape used by TrajectoryForecaster. `label` is a compact
 *  human-readable month key (e.g. "Aug 26"), matching the source's
 *  `CSV_MONTHLY_EXTENDED` layout. */
export type Vt2MonthlyRow = {
  label: string
  monthKey: string
  views: number
  revenue: number
  watchHrs: number
  subs: number
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * Anchor monthly window to *today's* calendar month and walk backwards N months,
 * filling gaps with zero rows so historical timeline always ends on PRESENT (NOW).
 */
/** Roll daily analytics rows into monthly totals ending on present month. */
export const rollupMonthlyFromDaily = (
  daily: ReadonlyArray<Record<string, unknown>>,
  monthsCount: number = 12,
): Vt2MonthlyRow[] => {
  if (daily.length === 0) return []
  type Bucket = { key: string; year: number; month: number; views: number; revenue: number; watchHrs: number; subs: number }
  const map = new Map<string, Bucket>()
  for (const row of daily) {
    const dateInput = row.date ?? row.day ?? row.publishedDate
    if (!dateInput) continue
    const raw = typeof dateInput === "string" ? dateInput : String(dateInput)
    const parsed = new Date(raw)
    if (!Number.isFinite(parsed.getTime())) continue
    const key = `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`
    const bucket = map.get(key) ?? {
      key, year: parsed.getUTCFullYear(), month: parsed.getUTCMonth(),
      views: 0, revenue: 0, watchHrs: 0, subs: 0,
    }
    bucket.views += numOr(row.views)
    bucket.revenue += numOr(row.revenue ?? row.estimatedRevenue)
    bucket.watchHrs += numOr(row.watchTime ?? row.watchHours)
    bucket.subs += numOr(row.subscribersGained) - numOr(row.subscribersLost)
    map.set(key, bucket)
  }
  return takeMostRecentMonthly(map, monthsCount)
}

/** Group canonical rows into calendar-month buckets sorted oldest-first ending on present month. */
export const rollupMonthlyFromVideos = (
  rows: readonly CanonicalVideoRow[],
  monthsCount: number = 12,
): Vt2MonthlyRow[] => {
  if (rows.length === 0) return []
  type Bucket = { key: string; year: number; month: number; views: number; revenue: number; watchHrs: number; subs: number }
  const map = new Map<string, Bucket>()
  for (const row of rows) {
    const raw = typeof row.uploadDate === "string" ? row.uploadDate : ""
    if (!raw) continue
    const parsed = new Date(raw)
    if (!Number.isFinite(parsed.getTime())) continue
    const key = `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`
    const bucket = map.get(key) ?? {
      key, year: parsed.getUTCFullYear(), month: parsed.getUTCMonth(),
      views: 0, revenue: 0, watchHrs: 0, subs: 0,
    }
    bucket.views += readMetric(row, "views")
    bucket.revenue += readMetric(row, "revenue")
    bucket.watchHrs += readMetric(row, "watchHours")
    bucket.subs += readMetric(row, "subscribersGained")
    map.set(key, bucket)
  }
  return takeMostRecentMonthly(map, monthsCount)
}

/** Channel-wide monthly rollup sourced exclusively from Daily Stats. */
export const rollupMonthlyChannelWithSource = (
  dailyMetrics?: ReadonlyArray<Record<string, unknown>>,
  monthlyMetricsOrCount?: ReadonlyArray<Record<string, unknown>> | number,
  requestedMonths: number = 12,
): { source: Vt2WeeklySource; months: Vt2MonthlyRow[] } => {
  const monthlyMetrics = Array.isArray(monthlyMetricsOrCount) ? monthlyMetricsOrCount : undefined
  const monthsCount = typeof monthlyMetricsOrCount === "number" ? monthlyMetricsOrCount : requestedMonths
  if (monthlyMetrics && monthlyMetrics.length > 0) {
    const months = rollupMonthlyFromDaily(monthlyMetrics, monthsCount)
    if (months.length > 0) return { source: "monthly_metrics", months }
  }
  if (dailyMetrics && dailyMetrics.length > 0) {
    const months = rollupMonthlyFromDaily(dailyMetrics, monthsCount)
    if (months.length > 0) return { source: "daily_metrics", months }
  }
  return { source: "none", months: [] }
}

/** Small helper: turn a Vt2WeeklyRow into a Trajectory-friendly label ("W12"). */
export const labelWeek = (row: Vt2WeeklyRow): string => `W${row.week}`

/** Flatten canonical rows into plain-number rows shaped like the source
 *  `REAL_VIDEOS` / `VIDEOS` arrays. Modules ported from the source consume
 *  this directly so their existing logic (top-N sorting, ratio math, filters)
 *  works without change. */
export const flattenVideosForVt2 = (rows: readonly CanonicalVideoRow[]): Vt2VideoRow[] =>
  rows.map((row) => {
    const watchHrs = readMetric(row, "watchHours")
    return {
      id: String(row.id ?? row.videoId ?? ""),
      title: row.title ?? "Untitled",
      thumbnail: row.thumbnailUrl ?? "",
      publishedAt: row.uploadDate ?? "",
      duration: numOr(row.durationSeconds),
      views: readMetric(row, "views"),
      watchHrs,
      watchMins: watchHrs * 60,
      likes: readMetric(row, "likes"),
      comments: readMetric(row, "comments"),
      shares: readMetric(row, "shares"),
      subsGained: readMetric(row, "subscribersGained"),
      subsLost: readMetric(row, "subscribersLost"),
      revenue: readMetric(row, "revenue"),
      cpm: readMetric(row, "cpm"),
      rpm: readMetric(row, "rpm"),
      ctr: readMetric(row, "ctr"),
      avp: readMetric(row, "avp"),
      impressions: readMetric(row, "impressions"),
    }
  })

/** Flatten `snapshot.searchTerms` (or any traffic-source rows) into the row
 *  shape SearchTermGravity expects. Skips rows without a term string. */
export const flattenSearchTermsForVt2 = (
  trafficRows: ReadonlyArray<Record<string, unknown>>,
  videos?: readonly CanonicalVideoRow[],
): Vt2SearchTermRow[] => {
  const isSearchRow = (row: Record<string, unknown>): boolean => {
    const kind = String(row.trafficSourceType ?? "").toUpperCase()
    const src = String(row.source ?? "").toUpperCase()
    return kind.includes("SEARCH") || src.includes("SEARCH") || Boolean(row.term)
  }

  // Support both raw `VtSyncTrafficRow` (with `term`, `views`, `watchTime`)
  // and canonicalized traffic rows (with `metrics.views.value`).
  const readNumberish = (row: Record<string, unknown>, ...keys: string[]): number => {
    for (const key of keys) {
      const value = row[key]
      if (typeof value === "number" && Number.isFinite(value)) return value
      if (value && typeof value === "object") {
        const nested = (value as Record<string, unknown>).value
        if (typeof nested === "number" && Number.isFinite(nested)) return nested
      }
    }
    const metrics = row.metrics as Record<string, unknown> | undefined
    if (metrics) {
      for (const key of keys) {
        const cell = metrics[key] as Record<string, unknown> | undefined
        const value = cell?.value
        if (typeof value === "number" && Number.isFinite(value)) return value
      }
    }
    return 0
  }

  const out: Vt2SearchTermRow[] = []
  for (const row of trafficRows) {
    if (!isSearchRow(row)) continue
    const term = String(row.term ?? row.trafficSourceDetail ?? row.sourceTitle ?? "").trim()
    if (!term) continue
    const views = readNumberish(row, "views")
    const watchHours = readNumberish(row, "watchHours", "watchTime")
    out.push({
      term,
      views,
      minutes: watchHours * 60,
      impressions: readNumberish(row, "impressions", "adImpressions"),
    })
  }
  if (out.length === 0 && videos && videos.length > 0) {
    const wordViews = new Map<string, { views: number; minutes: number }>()
    const stopWords = new Set(["the", "a", "an", "and", "or", "in", "on", "of", "to", "for", "with", "is", "at", "by", "from", "vs", "how", "what", "why", "it", "this", "that", "my", "your"])
    for (const v of videos) {
      const words = (v.title ?? "").replace(/[^\w\s]/g, "").split(/\s+/)
      const views = readMetric(v, "views")
      const duration = Number(v.durationSeconds || 0)
      const minutes = (views * duration) / 60
      for (const w of words) {
        const clean = w.toLowerCase().trim()
        if (clean.length < 3 || stopWords.has(clean)) continue
        const formatted = clean.toUpperCase()
        const prev = wordViews.get(formatted) ?? { views: 0, minutes: 0 }
        wordViews.set(formatted, { views: prev.views + views, minutes: prev.minutes + minutes })
      }
    }
    const derived = Array.from(wordViews.entries())
      .map(([term, d]) => ({ term, views: d.views, minutes: Math.round(d.minutes), impressions: 0 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 18)
    return derived
  }
  out.sort((a, b) => b.views - a.views)
  return out
}
