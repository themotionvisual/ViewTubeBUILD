import { describe, expect, it } from "vitest"

import { aggregateVtSyncCreatorContentTypeRows, mergeVideoAnalyticsRows } from "../adapters/localSyncEngine"
import { aggregateVtSyncTimeRows } from "../adapters/tableData"
import { VT_SYNC_TABLE_DEFINITIONS } from "./tableRegistry"
import {
 VT_SYNC_ANALYTICS_METRIC_BUNDLES,
 VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS,
 VT_SYNC_REQUIRED_ANALYTICS_METRICS,
 mapVtSyncAnalyticsMetricFields,
} from "./analyticsMetricContract"

const REQUESTED_METRICS = [
 "engagedViews", "views", "redViews", "comments", "likes", "dislikes",
 "videosAddedToPlaylists", "videosRemovedFromPlaylists", "shares",
 "estimatedMinutesWatched", "estimatedRedMinutesWatched", "averageViewDuration",
 "averageViewPercentage", "cardClickRate", "cardTeaserClickRate", "cardImpressions",
 "cardTeaserImpressions", "cardClicks", "cardTeaserClicks", "subscribersGained",
 "subscribersLost", "estimatedRevenue", "estimatedAdRevenue", "grossRevenue",
 "estimatedRedPartnerRevenue", "monetizedPlaybacks", "playbackBasedCpm",
 "adImpressions", "cpm",
] as const

const videoColumnAliases: Record<string, string> = {
 cardClickRate: "clicksPerCardShown",
 cardImpressions: "cardsShown",
 cardTeaserClickRate: "teaserClicksPerCardTeaserShown",
 cardTeaserImpressions: "cardTeasersShown",
}

describe("VT-SYNC complete Analytics metric contract", () => {
 it("defines the requested 29 metrics exactly once across safe bundles", () => {
  expect(VT_SYNC_REQUIRED_ANALYTICS_METRICS).toHaveLength(29)
  expect([...VT_SYNC_REQUIRED_ANALYTICS_METRICS].sort()).toEqual([...REQUESTED_METRICS].sort())
  expect(VT_SYNC_ANALYTICS_METRIC_BUNDLES.flatMap((bundle) => bundle.metrics).sort()).toEqual([...REQUESTED_METRICS].sort())
 })

 it("maps shuffled headers while preserving legitimate zero and missing values", () => {
  const mapped = mapVtSyncAnalyticsMetricFields({
   cardClicks: 0,
   estimatedMinutesWatched: 120,
   redViews: 4,
   views: 0,
  })

  expect(mapped).toEqual({
   cardClicks: 0,
   watchTime: 2,
   youtubePremiumViews: 4,
   views: 0,
  })
  expect(mapped).not.toHaveProperty("revenue")
 })

 it("maps the complete raw contract into video analytics without erasing extras", () => {
  const rawRow = Object.fromEntries(REQUESTED_METRICS.map((metric, index) => [metric, index]))
  const [video] = mergeVideoAnalyticsRows([{
   id: "video-1",
   title: "Metric contract fixture",
   format: "long",
   metrics: { annotationClicks: 7 },
  } as any], [{ video: "video-1", ...rawRow }])

  expect(video.metrics?.annotationClicks).toBe(7)
  expect(video.metrics?.views).toBe(1)
  expect(video.metrics?.engagedViews).toBe(0)
  expect(video.metrics?.youtubePremiumViews).toBe(2)
  expect(video.metrics?.videosAddedToPlaylists).toBe(6)
  expect(video.metrics?.videosRemovedFromPlaylists).toBe(7)
  expect(video.metrics?.cardTeaserClicks).toBe(18)
  expect(video.metrics?.youtubePremiumRevenue).toBe(24)
  expect(video.metrics?.playbackBasedCpm).toBe(26)
  expect(video.metrics?.cpm).toBe(28)
 })

 it("keeps all 29 metrics registry-driven in every complete-contract table", () => {
  const tableIds = ["videos", "channel_totals", "daily", "monthly", "creator", "geography"]
  tableIds.forEach((tableId) => {
   const table = VT_SYNC_TABLE_DEFINITIONS.find((definition) => definition.id === tableId)!
   const keys = new Set(table.columns.map((column) => column.key))
   VT_SYNC_ANALYTICS_METRIC_DESCRIPTORS.forEach((descriptor) => {
    if (tableId === "creator" && ["videosAddedToPlaylists", "videosRemovedFromPlaylists"].includes(descriptor.normalizedField)) return
    const tableKey = tableId === "videos"
     ? videoColumnAliases[descriptor.normalizedField] || descriptor.normalizedField
     : descriptor.normalizedField
    expect(keys.has(tableKey), `${tableId} is missing ${descriptor.apiName} (${tableKey})`).toBe(true)
   })
  })
  const country = VT_SYNC_TABLE_DEFINITIONS.find((definition) => definition.id === "geography")!
  expect(country.columns.some((column) => column.key === "averagePercentageViewed")).toBe(true)
  expect(country.columns.some((column) => column.key === "avgPercentageViewed")).toBe(false)
 })

 it("aggregates monthly format rows without summing rates", () => {
  const [row] = aggregateVtSyncCreatorContentTypeRows([
   {
    month: "2026-01",
    creatorContentType: "SHORTS",
    views: 100,
    estimatedMinutesWatched: 50,
    averageViewPercentage: 80,
    cardClicks: 2,
    cardImpressions: 10,
    grossRevenue: 4,
    adImpressions: 1_000,
   },
   {
    month: "2026-02",
    creatorContentType: "SHORTS",
    views: 300,
    estimatedMinutesWatched: 150,
    averageViewPercentage: 40,
    cardClicks: 3,
    cardImpressions: 30,
    grossRevenue: 8,
    adImpressions: 3_000,
   },
  ])

  expect(row).toMatchObject({
   views: 400,
   watchTime: 200 / 60,
   avgViewDuration: 30,
   averagePercentageViewed: 50,
   cardClicks: 5,
   cardImpressions: 40,
   cardClickRate: 12.5,
   grossRevenue: 12,
   adImpressions: 4_000,
   cpm: 3,
  })
 })

 it("derives weekly and monthly rates from their complete additive totals", () => {
  const [row] = aggregateVtSyncTimeRows([
   {
    date: "2026-01-01",
    views: 100,
    watchTime: 2,
    averagePercentageViewed: 80,
    cardClicks: 2,
    cardImpressions: 10,
    cardTeaserClicks: 1,
    cardTeaserImpressions: 5,
    grossRevenue: 4,
    adImpressions: 1_000,
    monetizedPlaybacks: 500,
   },
   {
    date: "2026-01-02",
    views: 300,
    watchTime: 6,
    averagePercentageViewed: 40,
    cardClicks: 3,
    cardImpressions: 30,
    cardTeaserClicks: 2,
    cardTeaserImpressions: 15,
    grossRevenue: 8,
    adImpressions: 3_000,
    monetizedPlaybacks: 1_500,
   },
  ], "monthly")

  expect(row).toMatchObject({
   views: 400,
   watchTime: 8,
   avgViewDuration: 72,
   averagePercentageViewed: 50,
   cardClickRate: 12.5,
   cardTeaserClickRate: 15,
   cpm: 3,
   playbackBasedCpm: 6,
  })
 })
})
