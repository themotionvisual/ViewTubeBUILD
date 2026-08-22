import { describe, expect, it } from "vitest"

import { resolveVtSyncCanonicalTableId, VT_SYNC_ACTIVE_TABLE_IDS, VT_SYNC_TABLE_DEFINITIONS, VT_SYNC_VISIBLE_TABLE_CATEGORIES, VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
import { VT_SYNC_SYNC_UNITS } from "../upstream/syncUnitRegistry"
import { tableRows } from "./tableData"
import { getVtSyncTableExportHeaders, getVtSyncTableExportRows } from "./tableExport"
import {
 formatVtSyncLocalDateValue,
 formatVtSyncLocalTimeValue,
 formatVtSyncLocalWeekdayValue,
 formatVtSyncTableCellValue,
 parseVtSyncDateValue,
 parseVtSyncDurationSeconds,
} from "./tableFormatting"
import { normalizeVtSyncSnapshot } from "./snapshot"
import { getVisibleVtSyncColumns, VT_SYNC_TOOLBOX_CATEGORIES, VT_SYNC_WORKSPACE_DEFINITIONS } from "../shell/toolbox-table/vtSyncToolboxTableModel"

describe("VT Sync table contracts", () => {
 it("uses registry column labels as export headers", () => {
  VT_SYNC_VISIBLE_TABLE_DEFINITIONS.forEach((table) => {
   expect(getVtSyncTableExportHeaders(table)).toEqual(table.columns.map((column) => column.label))
  })
 })

 it("uses source-specific detail contracts without generic identity columns or metric bands", () => {
  const table = (id: string) => VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((entry) => entry.id === id)!
  const keys = (id: string) => table(id).columns.map((column) => column.key)
  expect(table("traffic_detail_search_terms")).toMatchObject({ layoutMode: "sparse-full", horizontalScrollMode: "none", verticalScrollMode: "none" })
  expect(table("traffic_detail_search_terms").columns.map((column) => column.label)).toContain("YouTube Search Terms")
  expect(table("traffic_detail_search_terms").columns.map((column) => column.label)).toContain("% of Search Views")
  expect(keys("traffic_detail_search_terms")).not.toEqual(expect.arrayContaining(["title", "handle", "videoUrl", "channelUrl"]))
  expect(keys("traffic_detail_suggested_videos").slice(0, 4)).toEqual(["cover", "title", "sourceChannel", "videoUrl"])
  expect(keys("traffic_detail_channel_pages").slice(0, 3)).toEqual(["cover", "title", "channelUrl"])
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((entry) => entry.id)).not.toEqual(expect.arrayContaining([
   "traffic_detail_traffic_notification",
   "traffic_detail_end_screens",
   "traffic_detail_video_remixes",
   "traffic_detail_watch_with",
  ]))
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((entry) => entry.id)).not.toContain("traffic_detail_traffic_playlist")
 })

 it("only exposes the successful July 13 table set", () => {
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id).sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("traffic_shorts")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("audience")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("sub_source")
 expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).toContain("provinces")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).toContain("traffic_detail_search_terms")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("search")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("channel_overview")
  expect(VT_SYNC_VISIBLE_TABLE_CATEGORIES.flatMap((category) => category.tabs.map((tab) => tab.id)).sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
 expect(resolveVtSyncCanonicalTableId("channel_overview")).toBe("videos")
})

 it("places Subscriber Status with channel tables and exposes premium columns", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((definition) => definition.id === "subs")!
  const channelCategory = VT_SYNC_TOOLBOX_CATEGORIES.find((category) => category.id === "channel")!
  const audienceCategory = VT_SYNC_TOOLBOX_CATEGORIES.find((category) => category.id === "audience")!
  const channelWorkspace = VT_SYNC_WORKSPACE_DEFINITIONS.find((workspace) => workspace.id === "channel")!
  const audienceWorkspace = VT_SYNC_WORKSPACE_DEFINITIONS.find((workspace) => workspace.id === "audience")!

  expect(table).toMatchObject({ label: "Subscriber Status", mainCategoryId: "channel_totals" })
  expect(table.columns.map((column) => column.key)).toEqual(expect.arrayContaining(["youtubePremiumViews", "youtubePremiumWatchTime"]))
  expect(channelCategory.tableIds).toContain("subs")
  expect(audienceCategory.tableIds).not.toContain("subs")
  expect(channelWorkspace.views.some((view) => view.tableIds.includes("subs"))).toBe(true)
  expect(audienceWorkspace.views.some((view) => view.tableIds.includes("subs"))).toBe(false)
 expect(tableRows(normalizeVtSyncSnapshot({
  subscriptionStatuses: [{ subscribedStatus: "SUBSCRIBED", redViews: 12, estimatedRedMinutesWatched: 90 }],
 }), table)[0]).toMatchObject({
   status: "SUBSCRIBED",
   youtubePremiumViews: 12,
   youtubePremiumWatchTime: 1.5,
  })
 })

 it("places Formats x Subscriber Status with content tables and exposes channel share columns", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((definition) => definition.id === "formats_subscribers")!
  const contentCategory = VT_SYNC_VISIBLE_TABLE_CATEGORIES.find((category) => category.id === "content")!
  const channelCategory = VT_SYNC_TOOLBOX_CATEGORIES.find((category) => category.id === "channel")!
  const channelWorkspace = VT_SYNC_WORKSPACE_DEFINITIONS.find((workspace) => workspace.id === "channel")!

  expect(table).toMatchObject({ label: "Formats x Subscriber Status", mainCategoryId: "content", presentationMode: "format-subscriber-status" })
  expect(contentCategory.tabs.map((tab) => tab.id)).toContain("formats_subscribers")
  expect(channelCategory.tableIds).toContain("formats_subscribers")
  expect(channelWorkspace.views.some((view) => view.tableIds.includes("formats_subscribers"))).toBe(true)
  expect(table.columns.map((column) => column.key)).toEqual(expect.arrayContaining([
   "youtubePremiumViews",
   "youtubePremiumWatchTime",
   "channelViewShare",
   "channelWatchTimeShare",
   "channelPremiumViewShare",
   "channelPremiumWatchTimeShare",
  ]))
  expect(tableRows(normalizeVtSyncSnapshot({
   formatSubscriberStatuses: [
    { creatorContentType: "shorts", subscribedStatus: "SUBSCRIBED", views: 80, estimatedMinutesWatched: 20, redViews: 8, estimatedRedMinutesWatched: 6 },
    { creatorContentType: "videoOnDemand", subscribedStatus: "UNSUBSCRIBED", views: 20, estimatedMinutesWatched: 10, redViews: 2, estimatedRedMinutesWatched: 4 },
   ],
  }), table)[0]).toMatchObject({
   term: "Shorts",
   status: "SUBSCRIBED",
   youtubePremiumViews: 8,
   youtubePremiumWatchTime: 0.1,
   channelViewShare: 80,
   channelWatchTimeShare: 20 / 30 * 100,
   channelPremiumViewShare: 80,
   channelPremiumWatchTimeShare: 60,
  })
 })

 it("keeps legacy subscription-source snapshot data readable without exposing its retired table", () => {
  const snapshot = normalizeVtSyncSnapshot({
   subscriptionSource: [{ term: "what-to-watch", subscribersGained: 12, subscribersLost: 1 }],
  })

  expect(snapshot.subscriptionSource).toEqual([{ term: "what-to-watch", subscribersGained: 12, subscribersLost: 1 }])
  expect(VT_SYNC_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("sub_source")
 })

 it("reads API-backed Month rows from the generic persisted table dataset", () => {
  const snapshot = normalizeVtSyncSnapshot({
   tableExports: {
    monthly_api: [{ date: "2026-07", views: 1200, engagedViews: 800 }],
   },
  })
  const table = VT_SYNC_TABLE_DEFINITIONS.find((definition) => definition.id === "monthly")!

  expect(snapshot.monthlyMetrics).toEqual([expect.objectContaining({ date: "2026-07", views: 1200 })])
  expect(tableRows(snapshot, table)).toEqual([
   expect.objectContaining({ date: "2026-07", views: 1200, engagedViews: 800 }),
  ])
 })

 it("formats structured cells without object coercion", () => {
  expect(formatVtSyncTableCellValue([{ label: "one" }, "two"], "json")).toBe('{"label":"one"}, two')
  expect(formatVtSyncTableCellValue({ nested: true }, "json")).toBe('{"nested":true}')
 })

 it("formats percent values consistently at render/export time", () => {
  expect(formatVtSyncTableCellValue(12.3456, "percent")).toBe("12.35%")
  expect(formatVtSyncTableCellValue(0.01, "ratioPercent")).toBe("1%")
  expect(formatVtSyncTableCellValue(1.21, "ratioPercent")).toBe("121%")
 })

 it("formats every time unit as a clock value", () => {
  expect(formatVtSyncTableCellValue(7, "duration")).toBe("0:07")
  expect(formatVtSyncTableCellValue(144, "duration")).toBe("2:24")
  expect(formatVtSyncTableCellValue(925.15, "durationHours")).toBe("925:09:00")
  expect(formatVtSyncTableCellValue(90.5, "durationMinutes")).toBe("1:30:30")
  expect(parseVtSyncDurationSeconds("1:02:03", "durationHours")).toBe(3723)
 })

 it("compacts only large watch-hour totals while preserving their unit", () => {
  expect(formatVtSyncTableCellValue(12_345, "durationHours")).toBe("12.35K h")
  expect(formatVtSyncTableCellValue(123_456, "durationHours")).toBe("123.5K h")
  expect(formatVtSyncTableCellValue(1_234_567, "durationHours")).toBe("1.235M h")
  expect(formatVtSyncTableCellValue(12_345_678, "durationHours")).toBe("12.35M h")
  expect(formatVtSyncTableCellValue(123_456_789, "durationHours")).toBe("123.5M h")
 })

 it("formats dates in US table order and parses rollup dates chronologically", () => {
  expect(formatVtSyncTableCellValue("2026-07-09T15:30:00Z", "date")).toBe("7/9/26")
  expect(formatVtSyncTableCellValue("2026-07-01 - 2026-07-07", "dateRange")).toBe("7/1/26 – 7/7/26")
  expect(parseVtSyncDateValue("2026-W02")).toBeLessThan(parseVtSyncDateValue("2026-W12")!)
  expect(parseVtSyncDateValue("6/30/26")).toBeLessThan(parseVtSyncDateValue("7/1/26")!)
 })

 it("derives local date, weekday, and time labels from one published timestamp", () => {
  const publishedAt = "2026-07-09T15:30:00Z"
  expect(formatVtSyncLocalDateValue(publishedAt)).toMatch(/^\d{1,2}\/\d{1,2}\/26$/)
  expect(formatVtSyncLocalWeekdayValue(publishedAt)).toMatch(/^[A-Za-z]+$/)
  expect(formatVtSyncLocalTimeValue(publishedAt)).toMatch(/^\d{1,2}:\d{2}(?:\s[AP]M)?$/i)
 })

 it("exports rows through the same cell formatter", () => {
  const table = {
   ...VT_SYNC_TABLE_DEFINITIONS[0],
   columns: [
    { key: "tags", label: "Tags", group: "Metadata", format: "json" as const },
    { key: "ctr", label: "CTR", group: "Reach", format: "percent" as const },
   ],
  }

  expect(getVtSyncTableExportRows(table, [{ tags: [{ topic: "sync" }], ctr: 8.912 }])).toEqual([
   ['{"topic":"sync"}', "8.91%"],
  ])
 })

 it("expands meaningful video revenue, advertising, premium, and card metric groups by default", () => {
  const videosTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "videos")!
  expect(videosTable.collapsedGroups).toEqual(["Details", "Format"])
  expect(videosTable.collapsedGroups).not.toEqual(expect.arrayContaining(["Revenue", "Advertising", "Premium", "Card Links"]))
  expect(videosTable.columns.filter((column) => ["Revenue", "Advertising", "Premium"].includes(column.group)).every((column) => column.visibility === "whenMeaningful")).toBe(true)
  expect(videosTable.columns.filter((column) => column.group === "Card Links").every((column) => column.visibility === "always")).toBe(true)
 })

 it("adds traffic share columns to overview and detail table rows", () => {
  const trafficTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "traffic")!
  const searchTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "search")!
  const snapshot = normalizeVtSyncSnapshot({
   trafficSources: [
    { source: "YT_SEARCH", views: 75, watchTime: 30 },
    { source: "EXT_URL", views: 25, watchTime: 10 },
   ],
   searchTerms: [
    { term: "kentucky derby", views: 60, watchTime: 24 },
    { term: "alderian cavalry", views: 40, watchTime: 6 },
   ],
  })

  expect(trafficTable.columns.map((column) => column.key)).toEqual(expect.arrayContaining(["trafficViewShare", "trafficWatchTimeShare"]))
  expect(searchTable.columns.map((column) => column.key)).toEqual(expect.arrayContaining(["trafficViewShare", "trafficWatchTimeShare"]))

  const overviewRows = tableRows(snapshot, trafficTable)
  const searchRows = tableRows(snapshot, searchTable)

  expect(overviewRows[0]).toMatchObject({ trafficViewShare: 75, trafficWatchTimeShare: 75 })
  expect(overviewRows[1]).toMatchObject({ trafficViewShare: 25, trafficWatchTimeShare: 25 })
  expect(searchRows[0]).toMatchObject({ trafficViewShare: 60, trafficWatchTimeShare: 80 })
  expect(searchRows[1]).toMatchObject({ trafficViewShare: 40, trafficWatchTimeShare: 20 })

  const visibleSearchColumns = getVisibleVtSyncColumns(searchTable, searchRows, false, true)
  expect(visibleSearchColumns.map((column) => column.key)).toEqual(expect.arrayContaining(["trafficViewShare", "trafficWatchTimeShare"]))
 })

 it("keeps legacy traffic-overview datasets visible in the traffic overview table", () => {
  const trafficTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "traffic")!
  const legacySnapshot = normalizeVtSyncSnapshot({
   trafficOverview: [{ insightTrafficSourceType: "YT_SEARCH", views: 80, estimatedMinutesWatched: 120 }],
  })
  const exportedSnapshot = normalizeVtSyncSnapshot({
   tableExports: {
    traffic_overview: [{ insightTrafficSourceType: "EXT_URL", views: 20, estimatedMinutesWatched: 30 }],
   },
  })

  expect(tableRows(legacySnapshot, trafficTable)).toEqual([
   expect.objectContaining({ source: "YT_SEARCH", views: 80, trafficViewShare: 100 }),
  ])
  expect(tableRows(exportedSnapshot, trafficTable)).toEqual([
   expect.objectContaining({ source: "EXT_URL", views: 20, trafficViewShare: 100 }),
  ])

  const currentSnapshot = normalizeVtSyncSnapshot({
   trafficSources: [{ source: "YT_BROWSE", views: 90 }],
   tableExports: {
    traffic_overview: [{ insightTrafficSourceType: "EXT_URL", views: 10 }],
   },
  })
  expect(tableRows(currentSnapshot, trafficTable)).toEqual([
   expect.objectContaining({ source: "YT_BROWSE", views: 90 }),
  ])
 })

 it("adds shared-link percentage to sharing service rows", () => {
  const sharesTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "shares")!
  const snapshot = normalizeVtSyncSnapshot({
   sharingService: [
    { term: "Messages", sharingService: "Messages", shares: 30 },
    { term: "Discord", sharingService: "Discord", shares: 20 },
   ],
  })

  expect(sharesTable.columns.map((column) => column.key)).toEqual(expect.arrayContaining(["shareLinkShare"]))
  expect(sharesTable.columns.find((column) => column.key === "shareLinkShare")).toMatchObject({
   label: "% of Shared Links",
   format: "percent",
   totalMode: "sum",
  })

  const shareRows = tableRows(snapshot, sharesTable)
  expect(shareRows[0]).toMatchObject({ shareLinkShare: 60 })
  expect(shareRows[1]).toMatchObject({ shareLinkShare: 40 })
 })

 it("keeps Formats shares while adding video-table totals grouped by normalized format", () => {
  const formatsTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "creator")!
  const snapshot = normalizeVtSyncSnapshot({
   creatorContentTypes: [
    { creatorContentType: "shorts", views: 400, engagedViews: 300, watchTime: 100 },
    { creatorContentType: "videoOnDemand", views: 600, engagedViews: 500, watchTime: 300 },
   ],
   videos: [
    {
     id: "short-a",
     title: "Short A",
     format: "short",
     duration: "PT30S",
     metrics: {
      views: 100,
      engagedViews: 80,
      watchTime: 1,
      averagePercentageViewed: 50,
      revenue: 2,
      likes: 10,
      subscribersGained: 4,
      subscribersLost: 1,
      comments: 3,
      videosAddedToPlaylists: 2,
      shares: 5,
       grossRevenue: 4,
       adImpressions: 1000,
       cpm: 4,
     },
    },
    {
     id: "short-b",
     title: "Short B",
     format: "shorts",
     duration: "0:45",
     metrics: {
      views: 200,
      engagedViews: 120,
      watchTime: 2,
      averagePercentageViewed: 25,
      revenue: 3,
      likes: 20,
      subscribersGained: 2,
      subscribersLost: 1,
      comments: 4,
      videosAddedToPlaylists: 3,
      shares: 6,
       grossRevenue: 8,
       adImpressions: 1000,
       cpm: 8,
     },
    },
    {
     id: "long-a",
     title: "Long A",
     format: "long",
     metrics: {
      views: 500,
      engagedViews: 350,
      watchTime: 10,
      averagePercentageViewed: 40,
      revenue: 20,
      likes: 40,
      subscribersGained: 8,
      subscribersLost: 2,
      comments: 9,
      videosAddedToPlaylists: 7,
      shares: 12,
     },
    },
    {
     id: "live-a",
     title: "Live A",
     format: "live",
     metrics: {
      views: 100,
      engagedViews: 75,
      watchTime: 5,
      averagePercentageViewed: 30,
      revenue: 4,
      likes: 8,
      subscribersGained: 3,
      subscribersLost: 1,
      comments: 5,
      videosAddedToPlaylists: 4,
      shares: 2,
     },
    },
   ],
  })

  expect(formatsTable.columns.filter((column) => column.group === "Format Share").map((column) => column.key))
   .toEqual(expect.arrayContaining(["formatViewShare", "formatWatchTimeShare"]))
  expect(formatsTable.columns.filter((column) => column.group === "Video Table Totals").map((column) => column.key))
    .toEqual([
     "videoFormatViews",
     "videoFormatWatchTime",
     "videoFormatAvgViewDuration",
     "videoFormatAvgPercentageViewed",
     "videoFormatRevenue",
     "videoFormatLikes",
     "videoFormatSubscribers",
     "videoFormatComments",
     "videoFormatShares",
    ])
  expect(formatsTable.columns.filter((column) => column.group === "Format Averages").map((column) => column.key))
   .toEqual([
    "videoFormatVideoCount",
    "videoFormatAverageDuration",
    "videoFormatAverageViews",
    "videoFormatAverageWatchTime",
    "videoFormatAverageLikes",
    "videoFormatAverageSubscribers",
    "videoFormatAverageComments",
    "videoFormatAverageShares",
    "videoFormatAverageCpm",
    "videoFormatAverageEstimatedRevenue",
    "videoFormatAverageGrossRevenue",
   ])
  expect(formatsTable.columns.filter((column) => column.group === "Format Averages"))
   .toSatisfy((columns: Array<{ isFormula?: boolean }>) => columns.every((column) => column.isFormula))
  expect(getVtSyncTableExportHeaders(formatsTable)).toEqual(expect.arrayContaining([
   "Video Count",
   "Average Duration",
   "Average Views",
   "Average Watch Time",
   "Average Likes",
   "Average Subscribers",
   "Average Comments",
   "Average Shares",
   "Average CPM",
   "Average Est. Revenue",
   "Average Gross Revenue",
  ]))

  const rows = tableRows(snapshot, formatsTable)
  const shorts = rows.find((row) => row.term === "Shorts")!
  const longFormat = rows.find((row) => row.term === "Long-Format")!
  const live = rows.find((row) => row.term === "Live Stream")!

  expect(shorts).toMatchObject({
   views: 400,
   watchTime: 100,
   formatViewShare: 40,
   formatWatchTimeShare: 25,
   videoFormatViews: 300,
   videoFormatWatchTime: 3,
   videoFormatRevenue: 5,
   videoFormatLikes: 30,
   videoFormatSubscribers: 4,
   videoFormatComments: 7,
   videoFormatSaves: 5,
   videoFormatShares: 11,
   videoFormatVideoCount: 2,
   videoFormatAverageViews: 150,
   videoFormatAverageWatchTime: 1.5,
   videoFormatAverageLikes: 15,
   videoFormatAverageSubscribers: 2,
   videoFormatAverageComments: 3.5,
   videoFormatAverageShares: 5.5,
   videoFormatAverageCpm: 6,
   videoFormatAverageEstimatedRevenue: 2.5,
   videoFormatAverageGrossRevenue: 6,
  })
  expect(shorts.videoFormatAverageDuration).toBeCloseTo(37.5)
  expect(shorts.videoFormatAvgViewDuration).toBeCloseTo(36)
  expect(shorts.videoFormatAvgPercentageViewed).toBeCloseTo(100 / 3)
  expect(longFormat).toMatchObject({
   views: 600,
   watchTime: 300,
   formatViewShare: 60,
   formatWatchTimeShare: 75,
   videoFormatViews: 500,
   videoFormatWatchTime: 10,
   videoFormatAvgViewDuration: 72,
   videoFormatAvgPercentageViewed: 40,
   videoFormatRevenue: 20,
   videoFormatLikes: 40,
   videoFormatSubscribers: 6,
   videoFormatComments: 9,
   videoFormatSaves: 7,
   videoFormatShares: 12,
  })
  expect(live).toMatchObject({
   videoFormatViews: 100,
   videoFormatWatchTime: 5,
   videoFormatRevenue: 4,
   videoFormatLikes: 8,
   videoFormatSubscribers: 2,
   videoFormatComments: 5,
   videoFormatSaves: 4,
   videoFormatShares: 2,
  })
  expect(live.views).toBeUndefined()
  expect(live.watchTime).toBeUndefined()
  expect(live.formatViewShare).toBeUndefined()
  expect(live.formatWatchTimeShare).toBeUndefined()
 })

 it("backfills Formats base metrics and shares from videos only when the API report is absent", () => {
  const formatsTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "creator")!
  const snapshot = normalizeVtSyncSnapshot({
   videos: [
    { id: "short-a", format: "short", metrics: { views: 300, watchTime: 3 } },
    { id: "long-a", format: "long", metrics: { views: 700, watchTime: 7 } },
   ],
  })

  const rows = tableRows(snapshot, formatsTable)
  expect(rows.find((row) => row.term === "Shorts")).toMatchObject({
   views: 300,
   watchTime: 3,
   formatViewShare: 30,
   formatWatchTimeShare: 30,
  })
  expect(rows.find((row) => row.term === "Long-Format")).toMatchObject({
   views: 700,
   watchTime: 7,
   formatViewShare: 70,
   formatWatchTimeShare: 70,
  })
 })
})

 it("keeps every stable sync unit selectable through its canonical table and redirects legacy traffic URLs", () => {
  const visibleTableIds = new Set(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id))
  expect(VT_SYNC_SYNC_UNITS.every((unit) => visibleTableIds.has(unit.tableId))).toBe(true)
  expect(resolveVtSyncCanonicalTableId("search")).toBe("traffic_detail_search_terms")
  expect(resolveVtSyncCanonicalTableId("ext_web")).toBe("traffic_detail_ext_websites")
 expect(resolveVtSyncCanonicalTableId("traffic")).toBe("traffic")
 })

 it("places every visible canonical table in both a toolbox category and workspace view", () => {
  const categoryTableIds = new Set(VT_SYNC_TOOLBOX_CATEGORIES.flatMap((category) => category.tableIds))
  const workspaceTableIds = new Set(VT_SYNC_WORKSPACE_DEFINITIONS.flatMap((workspace) => workspace.views.flatMap((view) => view.tableIds)))
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id).filter((id) => !categoryTableIds.has(id))).toEqual([])
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id).filter((id) => !workspaceTableIds.has(id))).toEqual([])
  expect([...categoryTableIds].some((id) => id === "search" || id === "ext_web")).toBe(false)
 })

 it("uses Stats labels for channel time series and reserves Traffic x Day for source-by-day rows", () => {
  const byId = (id: string) => VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === id)!
  expect(byId("daily").label).toBe("Daily Stats")
  expect(byId("weekly").label).toBe("Weekly Stats")
 expect(byId("monthly")).toMatchObject({ label: "Monthly Stats", snapshotKeys: ["monthlyMetrics"], performanceHubDatasetId: "monthly_api" })
 expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("monthly_api")
 expect(resolveVtSyncCanonicalTableId("monthly_api")).toBe("monthly")
 expect(byId("traffic_day").label).toBe("Traffic × Day")
 expect(byId("daily")).toMatchObject({ mainCategoryId: "daily", snapshotKeys: ["dailyMetrics"], performanceHubDatasetId: "daily" })
 expect(byId("traffic_day")).toMatchObject({ mainCategoryId: "daily", snapshotKeys: ["trafficByDay"], performanceHubDatasetId: "traffic_day" })
 expect(VT_SYNC_TOOLBOX_CATEGORIES.find((category) => category.id === "time")?.tableIds).toEqual(
  expect.arrayContaining(["daily", "traffic_day"]),
 )
 })

 it("rejects cross-wired Daily Stats and Traffic x Day rows during normalization", () => {
  const snapshot = normalizeVtSyncSnapshot({
   dailyMetrics: [
    { date: "2026-08-01", views: 10 },
    { day: "2026-08-02", term: "YT_SEARCH", views: 999 },
   ],
   trafficByDay: [
    { day: "2026-08-01", term: "YT_SEARCH", views: 4 },
    { date: "2026-08-02", views: 888 },
   ],
  })

  expect(snapshot.dailyMetrics).toEqual([expect.objectContaining({ date: "2026-08-01", views: 10 })])
  expect(snapshot.trafficByDay).toEqual([expect.objectContaining({ day: "2026-08-01", term: "YT_SEARCH", views: 4 })])
 })
