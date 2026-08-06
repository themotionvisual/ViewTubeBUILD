import { describe, expect, it } from "vitest"

import { VT_SYNC_ACTIVE_TABLE_IDS, VT_SYNC_TABLE_DEFINITIONS, VT_SYNC_VISIBLE_TABLE_CATEGORIES, VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
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
import { getVisibleVtSyncColumns } from "../shell/toolbox-table/vtSyncToolboxTableModel"

describe("VT Sync table contracts", () => {
 it("uses registry column labels as export headers", () => {
  VT_SYNC_VISIBLE_TABLE_DEFINITIONS.forEach((table) => {
   expect(getVtSyncTableExportHeaders(table)).toEqual(table.columns.map((column) => column.label))
  })
 })

 it("only exposes the successful July 13 table set", () => {
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id).sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("traffic_shorts")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("audience")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("sub_source")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).toContain("provinces")
  expect(VT_SYNC_VISIBLE_TABLE_CATEGORIES.flatMap((category) => category.tabs.map((tab) => tab.id)).sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
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
  const table = VT_SYNC_TABLE_DEFINITIONS.find((definition) => definition.id === "monthly_api")!

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
    { term: "napoleonic cavalry", views: 40, watchTime: 6 },
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
     },
    },
    {
     id: "short-b",
     title: "Short B",
     format: "shorts",
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
  })
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
