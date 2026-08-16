import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
 VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS,
 buildVtSyncAnalyticsDateWindows,
 buildVtSyncAnalyticsMonthRange,
 buildVtSyncAnalyticsMonthWindows,
 mergeVtSyncDefinedFields,
 mergeVtSyncRowsPreservingDefined,
 preserveVtSyncRowsForFailedDateWindows,
} from "./localSyncEngine"
import { VT_SYNC_TABLE_DEFINITIONS } from "../upstream/tableRegistry"

const engineSource = readFileSync(new URL("./localSyncEngine.ts", import.meta.url), "utf8")
const utcDay = (value: string) => Date.parse(`${value}T00:00:00Z`)
const inclusiveDays = (start: string, end: string) =>
 Math.floor((utcDay(end) - utcDay(start)) / 86_400_000) + 1

describe("VT-SYNC lifetime analytics windows", () => {
 it("covers a multi-year channel lifetime with contiguous windows of at most 500 days", () => {
  const windows = buildVtSyncAnalyticsDateWindows("2023-01-01", "2026-07-28")

  expect(windows.length).toBeGreaterThan(1)
  expect(windows[0].startDate).toBe("2023-01-01")
  expect(windows.at(-1)?.endDate).toBe("2026-07-28")
  windows.forEach((window, index) => {
   expect(inclusiveDays(window.startDate, window.endDate)).toBeLessThanOrEqual(VT_SYNC_ANALYTICS_DATE_WINDOW_DAYS)
   if (index > 0) {
    expect(utcDay(window.startDate) - utcDay(windows[index - 1].endDate)).toBe(86_400_000)
   }
  })
 })

 it("keeps a short channel lifetime in one exact window", () => {
  expect(buildVtSyncAnalyticsDateWindows("2026-07-01", "2026-07-28")).toEqual([
   { startDate: "2026-07-01", endDate: "2026-07-28" },
  ])
 })

 it("aligns API month reports to Google's required first-of-month boundaries", () => {
 expect(buildVtSyncAnalyticsMonthRange("2023-07-19", "2026-08-02")).toEqual({
   startDate: "2023-07-01",
   endDate: "2026-08-01",
  })
 })
 expect(buildVtSyncAnalyticsMonthWindows("2005-04-23", "2026-08-02")).toEqual([
  { startDate: "2005-04-01", endDate: "2015-03-31" },
  { startDate: "2015-04-01", endDate: "2025-03-31" },
  { startDate: "2025-04-01", endDate: "2026-08-01" },
 ])

 it("retains stored rows only for failed windows and prefers newly fetched rows", () => {
  const merged = preserveVtSyncRowsForFailedDateWindows(
   [
    { date: "2025-05-01", views: 50 },
    { date: "2026-05-01", views: 60 },
   ],
   [
    { date: "2024-05-01", views: 40 },
    { date: "2025-05-01", views: 5 },
    { date: "2026-05-01", views: 6 },
   ],
   [
    {
     page: 1,
     startIndex: 1,
     maxResults: 500,
     rows: 0,
     status: "failed",
     startDate: "2024-01-01",
     endDate: "2024-12-31",
    },
    {
     page: 2,
     startIndex: 1,
     maxResults: 500,
     rows: 2,
     status: "short",
     startDate: "2025-01-01",
     endDate: "2026-07-28",
    },
   ],
   "date",
   "date",
  )

  expect(merged).toEqual([
   { date: "2026-05-01", views: 60 },
   { date: "2025-05-01", views: 50 },
   { date: "2024-05-01", views: 40 },
  ])
 })

 it("retains prior rows for successful windows when they are not present in newly fetched rows", () => {
  const merged = preserveVtSyncRowsForFailedDateWindows(
   [
    { date: "2026-05-01", views: 60 },
   ],
   [
    { date: "2025-05-01", views: 5 },
    { date: "2026-05-01", views: 6 },
   ],
   [
    {
     page: 1,
     startIndex: 1,
     maxResults: 500,
     rows: 1,
     status: "short",
     startDate: "2025-01-01",
     endDate: "2026-07-28",
    },
   ],
   "date",
   "date",
  )

  expect(merged).toEqual([
   { date: "2026-05-01", views: 60 },
   { date: "2025-05-01", views: 5 },
  ])
 })

 it("preserves prior dates when a window returns partial metric rows with an error", () => {
  const merged = preserveVtSyncRowsForFailedDateWindows(
   [{ day: "2026-05-01", revenue: 6 }],
   [
    { day: "2026-04-01", revenue: 5, premiumRevenue: 1 },
    { day: "2026-05-01", revenue: 4, premiumRevenue: 2 },
   ],
   [{
    page: 1,
    startIndex: 1,
    maxResults: 500,
    rows: 1,
    status: "short",
    error: "premium metric unavailable",
    startDate: "2026-01-01",
    endDate: "2026-07-28",
   }],
   "day",
   "day",
  )

  expect(merged).toEqual([
   { day: "2026-05-01", revenue: 6, premiumRevenue: 2 },
   { day: "2026-04-01", revenue: 5, premiumRevenue: 1 },
  ])

  const previousByDay = new Map([
   ["2026-04-01", { day: "2026-04-01", revenue: 5, premiumRevenue: 1 }],
   ["2026-05-01", { day: "2026-05-01", revenue: 4, premiumRevenue: 2 }],
  ])
  expect(merged.map((row) =>
   mergeVtSyncDefinedFields(previousByDay.get(String(row.day)), row),
  )).toEqual([
   { day: "2026-05-01", revenue: 6, premiumRevenue: 2 },
   { day: "2026-04-01", revenue: 5, premiumRevenue: 1 },
  ])
 })

 it("preserves prior metrics when a supplemental bundle omits or cannot return them", () => {
  expect(mergeVtSyncDefinedFields(
   { views: 100, estimatedRevenue: 4.25, cardClicks: 8 },
   { views: 125, estimatedRevenue: undefined, cardClicks: null },
  )).toEqual({ views: 125, estimatedRevenue: 4.25, cardClicks: 8 })

  expect(mergeVtSyncRowsPreservingDefined(
   [{ day: "2026-07-27", views: 100, estimatedRevenue: 4.25 }],
   [{ day: "2026-07-27", views: 125, estimatedRevenue: undefined }],
   (row) => String(row.day),
  )).toEqual([{ day: "2026-07-27", views: 125, estimatedRevenue: 4.25 }])
 })
})

describe("requested lifetime metric table contracts", () => {
 const table = (id: string) => VT_SYNC_TABLE_DEFINITIONS.find((definition) => definition.id === id)!
 const keys = (id: string) => table(id).columns.map((column) => column.key)

 it("retains Device x OS duration metrics and adds engaged views", () => {
  expect(keys("device_os")).toEqual(expect.arrayContaining([
   "views",
   "engagedViews",
   "watchTime",
   "avgDuration",
   "avgPercentageViewed",
  ]))
 })

 it("uses the API month table as the sole canonical Monthly Stats table", () => {
  const dailyMetricKeys = keys("daily").filter((key) => key !== "date")
  const monthlyMetricKeys = keys("monthly").filter((key) => key !== "date")

  expect(monthlyMetricKeys).toEqual(dailyMetricKeys)
  expect(table("monthly").performanceHubDatasetId).toBe("monthly_api")
  expect(table("monthly").categoryIds).toEqual(["monthly_metrics"])
  expect(VT_SYNC_TABLE_DEFINITIONS.map((definition) => definition.id)).not.toContain("monthly_api")
 })

 it("adds country advertising metrics and Traffic x Day engagement metrics", () => {
  expect(keys("geography")).toEqual(expect.arrayContaining([
   "cpm",
   "grossRevenue",
   "monetizedPlaybacks",
   "playbackBasedCpm",
   "adImpressions",
  ]))
  expect(keys("traffic_day")).toEqual(expect.arrayContaining([
   "subscribersGained",
   "shares",
   "likes",
  ]))
 })

 it("keeps Daily Stats and Traffic x Day query dimensions separate", () => {
  const dailyStart = engineSource.indexOf('if (shouldSync(selected, "daily_metrics"))')
  const monthlyStart = engineSource.indexOf('if (shouldSync(selected, "monthly_metrics"))', dailyStart)
  const trafficDayStart = engineSource.indexOf('if (shouldSync(selected, "traffic_day"))')
  const playlistsStart = engineSource.indexOf('if (shouldSync(selected, "playlists_analytics"))', trafficDayStart)
  const dailyBlock = engineSource.slice(dailyStart, monthlyStart)
  const trafficDayBlock = engineSource.slice(trafficDayStart, playlistsStart)

  expect(dailyBlock).toContain('dimensions: "day"')
  expect(dailyBlock).not.toContain("insightTrafficSourceType")
  expect(trafficDayBlock).toContain('dimensions: "insightTrafficSourceType,day"')
  expect(trafficDayBlock).toContain('datasetId: "traffic_day"')
  expect(trafficDayBlock).not.toContain('datasetId: "daily"')
 })

 it("uses the lifetime Channel Totals row for summaries", () => {
 expect(table("channel_totals")).toMatchObject({
   summaryMode: "primary-row",
   summaryPrimaryRow: { key: "window", value: "Lifetime (All Time)" },
  })
 })

 it("publishes lifetime channel totals before the next selected query begins", () => {
  const totalsStart = engineSource.indexOf('if (shouldSync(selected, "channel_totals"))')
  const dailyStart = engineSource.indexOf('if (shouldSync(selected, "daily_metrics"))', totalsStart)
  const totalsBlock = engineSource.slice(totalsStart, dailyStart)

  expect(totalsStart).toBeGreaterThan(-1)
  expect(dailyStart).toBeGreaterThan(totalsStart)
  expect(totalsBlock).toContain("snapshot = { ...snapshot, channelTotals: mergedChannelTotals }")
  expect(totalsBlock).toContain("commitSnapshot()")
  expect(totalsBlock).toContain("await sleep(0)")
 })

 it("adds the aggregate creator content type x subscriber status sync query", () => {
  expect(engineSource).toContain('"formats_subscriber_status", "formatSubscriberStatuses", "creatorContentType,subscribedStatus"')
  expect(engineSource).toContain('"redViews", "estimatedMinutesWatched", "estimatedRedMinutesWatched"')
  expect(engineSource).toContain('"averageViewDuration", "averageViewPercentage", "engagedViews"')
 })

 it("keeps all requested Channel Totals fields registry-driven", () => {
  expect(keys("channel_totals")).toEqual(expect.arrayContaining([
   "views",
   "engagedViews",
   "watchTime",
   "avgViewDuration",
   "averagePercentageViewed",
   "likes",
   "dislikes",
   "comments",
   "shares",
   "subscribersGained",
   "subscribersLost",
   "netSubscribers",
   "revenue",
   "estimatedAdRevenue",
   "grossRevenue",
   "cpm",
   "playbackBasedCpm",
   "adImpressions",
   "monetizedPlaybacks",
   "youtubePremiumViews",
   "youtubePremiumWatchTime",
   "youtubePremiumRevenue",
  ]))
 })
})
