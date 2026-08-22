import { describe, expect, it } from "vitest"
import type { CanonicalVideoRow, MetricCell } from "../../services/analytics/DataStore"
import { buildTubeExplorerVisualData } from "../tubeExplorerVisualData"
import { buildTrafficDetailRows, classifyTrafficFocus, CLOCK_BURST_MAX_DETAILS, TUBE_EXPLORER_VISUAL_MODULES } from "../TubeExplorerVisualModules"
import type { CsvFileWithTag } from "../../types"

const cell = (value: number): MetricCell => ({
 value,
 status: "actual",
 source: "api",
 availability: "available",
 confidence: "raw_direct",
})

const row = (
 id: string,
 title: string,
 format: CanonicalVideoRow["format"],
 metrics: Partial<Record<string, number>>,
): CanonicalVideoRow => ({
 id,
 videoId: id,
 title,
 uploadDate: "2026-01-15",
 format,
 durationSeconds: format === "shorts" ? 45 : 420,
 sourceMode: "api",
 metrics: Object.fromEntries(
  Object.entries(metrics).map(([key, value]) => [key, cell(value ?? 0)]),
 ) as CanonicalVideoRow["metrics"],
})

describe("buildTubeExplorerVisualData", () => {
 it("classifies normalized API traffic source ids for the Clock Burst drilldown", () => {
 expect(classifyTrafficFocus({ sourceType: "EXT_URL", sourceTitle: "EXT_URL", sourceDetail: "", views: 1 } as any)).toBe("external")
 expect(classifyTrafficFocus({ sourceType: "SHORTS_FEED", sourceTitle: "SHORTS_FEED", sourceDetail: "", views: 1 } as any)).toBe("shorts_feed")
  expect(classifyTrafficFocus({ sourceType: "YT_CHANNEL", sourceTitle: "YT_CHANNEL", sourceDetail: "", views: 1 } as any)).toBe("channel")
  expect(classifyTrafficFocus({ sourceType: "RELATED_VIDEO", sourceTitle: "RELATED_VIDEO", sourceDetail: "", views: 1 } as any)).toBe("related")
 expect(classifyTrafficFocus({ sourceType: "PLAYLIST", sourceTitle: "PLAYLIST", sourceDetail: "", views: 1 } as any)).toBe("playlist")
 })

 it("shows enriched channel titles and handles instead of raw traffic ids", () => {
  const detail = buildTrafficDetailRows([{
   sourceType: "YT_CHANNEL",
   sourceTitle: "The Motion Visual History",
   sourceHandle: "@themotionvisualhistory",
   sourceDetail: "UC123raw-id",
   views: 1200,
   watchHours: 10,
   engagedViews: 800,
   avp: 0,
   impressions: 0,
   ctr: 0,
   rowCount: 1,
   sourceOrigin: "cache",
  }], "channel")
 expect(detail[0]?.label).toBe("The Motion Visual History · @themotionvisualhistory")
 })

 it("keeps up to fifteen Clock Burst detail rows available for lists and pies", () => {
  const rows = Array.from({ length: 18 }, (_, index) => ({
   sourceType: "YT_SEARCH",
   sourceTitle: `Query ${String(index + 1).padStart(2, "0")}`,
   sourceDetail: `query-${index + 1}`,
   views: 1800 - index,
   watchHours: 10,
   engagedViews: 800,
   avp: 0,
   impressions: 0,
   ctr: 0,
   rowCount: 1,
   sourceOrigin: "api",
  }))

  const detail = buildTrafficDetailRows(rows as any, "search")

  expect(CLOCK_BURST_MAX_DETAILS).toBe(15)
  expect(detail).toHaveLength(15)
  expect(detail.at(-1)?.label).toBe("Query 15")
 })

 it("builds real video splits, totals, monthly rows, and title keyword points", () => {
  const dataset = buildTubeExplorerVisualData([
   row("s1", "Alder Cavalry Charge", "shorts", {
    views: 1000,
    watchHours: 12,
    likes: 80,
    comments: 6,
    shares: 4,
    revenue: 2,
    engagedViews: 700,
    avp: 75,
   }),
   row("l1", "Alder Longform Cavalry History", "long", {
    views: 500,
    watchHours: 30,
    likes: 40,
    comments: 10,
    shares: 2,
    revenue: 5,
    subscribersGained: 3,
   }),
  ])

  expect(dataset.coverage.hasVideos).toBe(true)
  expect(dataset.shorts).toHaveLength(1)
  expect(dataset.longform).toHaveLength(1)
  expect(dataset.totals.views).toBe(1500)
  expect(dataset.totals.revenue).toBe(7)
  expect(dataset.monthly[0]).toMatchObject({ month: "2026-01", videos: 2 })
  expect(dataset.keywords.some((keyword) => keyword.keyword === "alder")).toBe(true)
 expect(dataset.videos[0].retentionScore).toBe(75)
 })

 it("maps canonical and legacy Playlist Saves values into the shared saves metric", () => {
  const canonical = row("save-1", "Canonical saves", "long", {
   views: 10,
   videosAddedToPlaylists: 7,
  })
  const legacy = {
   ...row("save-2", "Legacy saves", "long", { views: 8 }),
   originalData: { playlistSaves: 3 },
  }

  const dataset = buildTubeExplorerVisualData([canonical, legacy])

  expect(dataset.videos.map((video) => video.saves)).toEqual([7, 3])
 })

 it("uses classified CSV traffic and geography rows without synthetic fallback rows", () => {
  const csvFiles: CsvFileWithTag[] = [
   {
    id: "traffic",
    name: "traffic.csv",
    tag: "traffic",
    detectedCategory: "traffic_youtube_search",
    data: [
     { "Search term": "alder cavalry", Views: "1,200", "Watch time (hours)": "45", Impressions: "9,000", "CTR %": "5.5" },
    ],
   },
   {
    id: "geo",
    name: "geo.csv",
    tag: "geo",
    detectedCategory: "geography_country",
    data: [
     { Country: "United States", Views: "800", "Watch time (hours)": "30", Revenue: "$3.50" },
    ],
   },
  ]

  const dataset = buildTubeExplorerVisualData([], csvFiles)

  expect(dataset.coverage.hasVideos).toBe(false)
  expect(dataset.coverage.hasTraffic).toBe(true)
  expect(dataset.coverage.hasGeography).toBe(true)
  expect(dataset.traffic[0]).toMatchObject({ sourceDetail: "alder cavalry", views: 1200, watchHours: 45 })
 expect(dataset.geography[0]).toMatchObject({ label: "United States", views: 800, watchHours: 30 })
 })

 it("keeps traffic overview and traffic details distinct for source/detail visuals", () => {
  const dataset = buildTubeExplorerVisualData([], [], [
   { datasetKind: "traffic_summary", trafficSourceType: "SUMMARY", trafficSourceDetail: "YT_SEARCH", sourceTitle: "YT_SEARCH", metrics: { views: cell(100) } },
   { datasetKind: "traffic_detail", trafficSourceType: "YT_SEARCH", trafficSourceDetail: "alderian cavalry", sourceTitle: "alderian cavalry", metrics: { views: cell(80) } },
  ])

  expect(dataset.traffic).toEqual(expect.arrayContaining([
   expect.objectContaining({ datasetKind: "traffic_summary", sourceTitle: "YT_SEARCH" }),
   expect.objectContaining({ datasetKind: "traffic_detail", sourceDetail: "alderian cavalry" }),
  ]))
 })

 it("does not double-count canonical traffic beneath a matching manual CSV dataset", () => {
  const dataset = buildTubeExplorerVisualData([], [{
   id: "overview-csv",
   name: "traffic-overview.csv",
   tag: "traffic",
   detectedCategory: "traffic_overview",
   data: [{ Source: "YT_SEARCH", Views: "100" }],
  }], [
   { datasetKind: "traffic_summary", trafficSourceType: "SUMMARY", trafficSourceDetail: "YT_SEARCH", sourceTitle: "YT_SEARCH", metrics: { views: cell(75) } },
  ])

  expect(dataset.traffic).toEqual([
   expect.objectContaining({ datasetKind: "traffic_summary", sourceTitle: "YT_SEARCH", views: 100, sourceOrigin: "csv" }),
  ])
 })
})

describe("TUBE_EXPLORER_VISUAL_MODULES", () => {
 it("registers the VT-SYNC visualizations with stable prefixed ids", () => {
  expect(TUBE_EXPLORER_VISUAL_MODULES).toHaveLength(46)
  expect(TUBE_EXPLORER_VISUAL_MODULES.every((entry) => entry.id.startsWith("tube-explorer-"))).toBe(true)
  expect(new Set(TUBE_EXPLORER_VISUAL_MODULES.map((entry) => entry.id)).size).toBe(TUBE_EXPLORER_VISUAL_MODULES.length)
  const titles = TUBE_EXPLORER_VISUAL_MODULES.map((entry) => entry.title)
  expect(titles).toContain("Title Word Network")
  expect(titles).toContain("Channel Vital Signs")
  expect(titles).toContain("Traffic x Day River Delta")
  expect(titles).toContain("Publish Optimal Clock")
  expect(titles).toContain("Content Treemap")
 })
})
