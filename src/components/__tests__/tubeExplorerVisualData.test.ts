import { describe, expect, it } from "vitest"
import type { CanonicalVideoRow, MetricCell } from "../../services/analytics/DataStore"
import { buildTubeExplorerVisualData } from "../tubeExplorerVisualData"
import { TUBE_EXPLORER_VISUAL_MODULES } from "../TubeExplorerVisualModules"
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
  Object.entries(metrics).map(([key, value]) => [key, cell(value)]),
 ) as CanonicalVideoRow["metrics"],
})

describe("buildTubeExplorerVisualData", () => {
 it("builds real video splits, totals, monthly rows, and title keyword points", () => {
  const dataset = buildTubeExplorerVisualData([
   row("s1", "Napoleon Cavalry Charge", "shorts", {
    views: 1000,
    watchHours: 12,
    likes: 80,
    comments: 6,
    shares: 4,
    revenue: 2,
    engagedViews: 700,
    avp: 75,
   }),
   row("l1", "Napoleon Longform Cavalry History", "long", {
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
  expect(dataset.keywords.some((keyword) => keyword.keyword === "napoleon")).toBe(true)
  expect(dataset.videos[0].retentionScore).toBe(75)
 })

 it("uses classified CSV traffic and geography rows without synthetic fallback rows", () => {
  const csvFiles: CsvFileWithTag[] = [
   {
    id: "traffic",
    name: "traffic.csv",
    tag: "traffic",
    detectedCategory: "traffic_youtube_search",
    data: [
     { "Search term": "napoleon cavalry", Views: "1,200", "Watch time (hours)": "45", Impressions: "9,000", "CTR %": "5.5" },
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
  expect(dataset.traffic[0]).toMatchObject({ sourceDetail: "napoleon cavalry", views: 1200, watchHours: 45 })
  expect(dataset.geography[0]).toMatchObject({ label: "United States", views: 800, watchHours: 30 })
 })
})

describe("TUBE_EXPLORER_VISUAL_MODULES", () => {
 it("registers every duplicate Tube Explorer visualization with stable prefixed ids", () => {
  expect(TUBE_EXPLORER_VISUAL_MODULES).toHaveLength(34)
  expect(TUBE_EXPLORER_VISUAL_MODULES.every((entry) => entry.id.startsWith("tube-explorer-"))).toBe(true)
  expect(new Set(TUBE_EXPLORER_VISUAL_MODULES.map((entry) => entry.id)).size).toBe(34)
  expect(TUBE_EXPLORER_VISUAL_MODULES.map((entry) => entry.title)).toContain("Title Word Network")
 })
})
