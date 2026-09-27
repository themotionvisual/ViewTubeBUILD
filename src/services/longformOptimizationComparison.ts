import { latestCompleteAnalyticsDate } from "./analytics/windows"
import {
  fetchCanonicalAnalyticsReport,
  rowsToObjects,
  toMetricNumber,
} from "./canonicalSync/query"
import {
  appendContentBuildEvent,
  listContentBuildEvents,
} from "./asset-engine/ContentBuildRepository"

export type LongformDailyComparisonPhase = "before" | "change" | "after"

export interface LongformOptimizationDailyDay {
  date: string
  relativeDay: number
  phase: LongformDailyComparisonPhase
  pending: boolean
  views: number | null
  watchTimeMinutes: number | null
  avp: number | null
  likes: number | null
  comments: number | null
  revenue: number | null
}

export interface LongformOptimizationDailySummary {
  daysObserved: number
  viewsAverage: number | null
  watchTimeMinutesAverage: number | null
  avpAverage: number | null
  likesAverage: number | null
  commentsAverage: number | null
  revenueAverage: number | null
}

export interface LongformOptimizationDailyComparison {
  version: "longform-daily-comparison-v1"
  videoId: string
  changeAt: number
  startDate: string
  changeDate: string
  targetEndDate: string
  queryEndDate: string
  completeThrough: string
  capturedAt: string
  status: "ready" | "partial" | "unavailable"
  days: LongformOptimizationDailyDay[]
  before: LongformOptimizationDailySummary
  after: LongformOptimizationDailySummary
  contentBuildEventId?: string | null
}

export interface LongformDailyComparisonWindow {
  startDate: string
  changeDate: string
  targetEndDate: string
  queryEndDate: string
  completeThrough: string
}


const dateOnly = (value: Date) => value.toISOString().slice(0, 10)

const dateFromIsoDay = (value: string) => {
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const addDays = (value: Date, days: number) => {
  const next = new Date(value)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

const minDate = (left: Date, right: Date) =>
  left.getTime() <= right.getTime() ? left : right

const average = (values: Array<number | null>) => {
  const present = values.filter((value): value is number => value != null && Number.isFinite(value))
  if (!present.length) return null
  return present.reduce((total, value) => total + value, 0) / present.length
}

export const buildLongformDailyComparisonWindow = (
  changeAt: number,
  now = new Date(),
): LongformDailyComparisonWindow => {
  const change = new Date(changeAt)
  const changeDay = new Date(Date.UTC(change.getUTCFullYear(), change.getUTCMonth(), change.getUTCDate()))
  const start = addDays(changeDay, -7)
  const targetEnd = addDays(changeDay, 7)
  const latestComplete = latestCompleteAnalyticsDate(now)
  const queryEnd = minDate(targetEnd, latestComplete)
  return {
    startDate: dateOnly(start),
    changeDate: dateOnly(changeDay),
    targetEndDate: dateOnly(targetEnd),
    queryEndDate: dateOnly(queryEnd),
    completeThrough: dateOnly(latestComplete),
  }
}

const metric = (row: Record<string, unknown> | undefined, ...keys: string[]) => {
  if (!row) return null
  for (const key of keys) {
    const value = toMetricNumber(row[key])
    if (value != null) return value
  }
  return null
}

const summaryFor = (
  days: LongformOptimizationDailyDay[],
): LongformOptimizationDailySummary => {
  const observed = days.filter((day) => !day.pending)
  return {
    daysObserved: observed.length,
    viewsAverage: average(observed.map((day) => day.views)),
    watchTimeMinutesAverage: average(observed.map((day) => day.watchTimeMinutes)),
    avpAverage: average(observed.map((day) => day.avp)),
    likesAverage: average(observed.map((day) => day.likes)),
    commentsAverage: average(observed.map((day) => day.comments)),
    revenueAverage: average(observed.map((day) => day.revenue)),
  }
}

export const buildLongformOptimizationDailyComparison = (input: {
  videoId: string
  changeAt: number
  rows: Record<string, unknown>[]
  now?: Date
}): LongformOptimizationDailyComparison => {
  const now = input.now || new Date()
  const window = buildLongformDailyComparisonWindow(input.changeAt, now)
  const changeDate = dateFromIsoDay(window.changeDate)!
  const completeThrough = dateFromIsoDay(window.completeThrough)!
  const byDay = new Map(
    input.rows
      .map((row) => [String(row.day || row.date || ""), row] as const)
      .filter(([day]) => Boolean(dateFromIsoDay(day))),
  )

  const days: LongformOptimizationDailyDay[] = Array.from({ length: 15 }, (_, index) => {
    const relativeDay = index - 7
    const date = dateOnly(addDays(changeDate, relativeDay))
    const row = byDay.get(date)
    const phase: LongformDailyComparisonPhase = relativeDay < 0
      ? "before"
      : relativeDay > 0
        ? "after"
        : "change"
    const pending = addDays(changeDate, relativeDay).getTime() > completeThrough.getTime()
    return {
      date,
      relativeDay,
      phase,
      pending,
      views: pending ? null : metric(row, "views"),
      watchTimeMinutes: pending ? null : metric(row, "estimatedMinutesWatched", "watchTimeMinutes"),
      avp: pending ? null : metric(row, "averageViewPercentage", "avp"),
      likes: pending ? null : metric(row, "likes"),
      comments: pending ? null : metric(row, "comments"),
      revenue: pending ? null : metric(row, "estimatedRevenue", "revenue"),
    }
  })

  const beforeDays = days.filter((day) => day.phase === "before")
  const afterDays = days.filter((day) => day.phase === "after")
  const afterComplete = afterDays.every((day) => !day.pending)

  return {
    version: "longform-daily-comparison-v1",
    videoId: input.videoId,
    changeAt: input.changeAt,
    ...window,
    capturedAt: now.toISOString(),
    status: window.queryEndDate < window.startDate
      ? "unavailable"
      : afterComplete
        ? "ready"
        : "partial",
    days,
    before: summaryFor(beforeDays),
    after: summaryFor(afterDays),
    contentBuildEventId: null,
  }
}

export const fetchAndRecordLongformOptimizationDailyComparison = async (input: {
  videoId: string
  contentBuildId: string
  channelId?: string | null
  changeAt: number
  now?: Date
  fetchReport?: typeof fetchCanonicalAnalyticsReport
}): Promise<LongformOptimizationDailyComparison> => {
  const now = input.now || new Date()
  const window = buildLongformDailyComparisonWindow(input.changeAt, now)
  const queryStart = dateFromIsoDay(window.startDate)!
  const queryEnd = dateFromIsoDay(window.queryEndDate)!
  const canQuery = queryEnd.getTime() >= queryStart.getTime()

  const payload = canQuery
    ? await (input.fetchReport || fetchCanonicalAnalyticsReport)({
        startDate: window.startDate,
        endDate: window.queryEndDate,
        metrics: [
          "views",
          "estimatedMinutesWatched",
          "averageViewPercentage",
          "likes",
          "comments",
          "estimatedRevenue",
        ],
        dimensions: ["day"],
        filters: [`video==${input.videoId}`],
        sort: "day",
      }, "Longform Optimizer 7+7 daily comparison")
    : { columnHeaders: [], rows: [] }

  const comparison = buildLongformOptimizationDailyComparison({
    videoId: input.videoId,
    changeAt: input.changeAt,
    rows: rowsToObjects(payload),
    now,
  })

  const event = appendContentBuildEvent({
    contentBuildId: input.contentBuildId,
    eventType: "analytics.checkpoint",
    entityType: "longform-optimization-daily-comparison",
    entityId: `longform-daily:${input.videoId}:${comparison.changeDate}`,
    actorType: "analytics",
    toolId: "longform-optimizer",
    resultingState: comparison,
    evidenceIds: [
      `youtube-analytics:video:${input.videoId}:${comparison.startDate}:${comparison.queryEndDate}`,
    ],
    metadata: {
      channelId: input.channelId || null,
      videoId: input.videoId,
      changeAt: input.changeAt,
      changeDate: comparison.changeDate,
      startDate: comparison.startDate,
      targetEndDate: comparison.targetEndDate,
      queryEndDate: comparison.queryEndDate,
      status: comparison.status,
      beforeDaysObserved: comparison.before.daysObserved,
      afterDaysObserved: comparison.after.daysObserved,
      source: "youtube-analytics-v2",
      comparisonVersion: comparison.version,
    },
  })

  return {
    ...comparison,
    contentBuildEventId: event.id,
  }
}

const isComparison = (value: unknown): value is LongformOptimizationDailyComparison => {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<LongformOptimizationDailyComparison>
  return candidate.version === "longform-daily-comparison-v1"
    && typeof candidate.videoId === "string"
    && Array.isArray(candidate.days)
}

export const readLatestLongformOptimizationDailyComparison = (input: {
  contentBuildId: string
  videoId: string
}): LongformOptimizationDailyComparison | null => {
  const event = listContentBuildEvents(input.contentBuildId)
    .filter((candidate) => candidate.eventType === "analytics.checkpoint")
    .filter((candidate) => candidate.entityType === "longform-optimization-daily-comparison")
    .filter((candidate) => candidate.metadata && (candidate.metadata as Record<string, unknown>).videoId === input.videoId)
    .at(-1)
  if (!event || !isComparison(event.resultingState)) return null
  return {
    ...event.resultingState,
    contentBuildEventId: event.id,
  }
}
