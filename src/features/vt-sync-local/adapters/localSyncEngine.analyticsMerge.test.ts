import { describe, expect, it } from "vitest"

import type { VtSyncVideoItem } from "./contracts"
import { mergeVideoAnalyticsRows, mergeVtSyncRowsPreservingDefined, vtSyncSegmentRowKey } from "./localSyncEngine"

const longVideo = (metrics: VtSyncVideoItem["metrics"] = {}): VtSyncVideoItem => ({
 id: "long-1",
 title: "Long video",
 format: "long",
 metrics,
})

describe("mergeVideoAnalyticsRows", () => {
 it("keeps every age × gender row when a later sync refreshes one cohort", () => {
  const merged = mergeVtSyncRowsPreservingDefined(
   [
    { ageGroup: "age18-24", gender: "male", viewerPercentage: 10 },
    { ageGroup: "age25-34", gender: "male", viewerPercentage: 12 },
   ],
   [{ ageGroup: "age25-34", gender: "male", viewerPercentage: 14 }],
   vtSyncSegmentRowKey,
  )

  expect(merged).toEqual([
   { ageGroup: "age18-24", gender: "male", viewerPercentage: 10 },
   { ageGroup: "age25-34", gender: "male", viewerPercentage: 14 },
  ])
 })

 it("keeps rows absent from a later partial response while refreshing matching rows", () => {
  const merged = mergeVtSyncRowsPreservingDefined(
   [
    { videoId: "older-video", views: 10, title: "Keep" },
    { videoId: "current-video", views: 20, likes: 2 },
   ],
   [{ videoId: "current-video", views: 25 }],
   (row) => String(row.videoId || ""),
  )

  expect(merged).toEqual([
   { videoId: "older-video", views: 10, title: "Keep" },
   { videoId: "current-video", views: 25, likes: 2 },
  ])
 })

 it("updates long-format card metrics without erasing previously fetched analytics", () => {
  const [merged] = mergeVideoAnalyticsRows(
   [longVideo({
    views: 41_292,
    watchTime: 925.12,
    revenue: 18.45,
    engagedViews: 38_078,
    averagePercentageViewed: 60.29,
    cardImpressions: 90,
   })],
   [{
    video: "long-1",
    cardImpressions: 153,
    cardClicks: 10,
    cardClickRate: 0.07,
    cardTeaserImpressions: 28_510,
    cardTeaserClicks: 64,
   }],
   "long_format_cards",
  )

  expect(merged.metrics).toMatchObject({
   views: 41_292,
   watchTime: 925.12,
   revenue: 18.45,
   engagedViews: 38_078,
   averagePercentageViewed: 60.29,
   cardImpressions: 153,
   cardsShown: 153,
   cardClicks: 10,
   cardClickRate: 0.07,
   clicksPerCardShown: 0.07,
   cardTeaserImpressions: 28_510,
   cardTeasersShown: 28_510,
   cardTeaserClicks: 64,
  })
 })

 it("preserves omitted fields while accepting legitimate zero values", () => {
  const [merged] = mergeVideoAnalyticsRows(
   [longVideo({ views: 10_000, likes: 45, comments: 12, revenue: 8 })],
   [{ video: "long-1", views: 0, likes: 0 }],
  )

  expect(merged.metrics).toMatchObject({
   views: 0,
   likes: 0,
   comments: 12,
   revenue: 8,
  })
 expect(merged.metrics?.rpm).toBeUndefined()
  expect(merged.metricProvenance).toMatchObject({ views: "youtube_analytics_v2", likes: "youtube_analytics_v2" })
  expect(merged.metricProvenance?.comments).toBeUndefined()
 })

 it("does not manufacture zero analytics for a new Cards-only row", () => {
  const [merged] = mergeVideoAnalyticsRows(
   [longVideo()],
   [{ video: "long-1", cardImpressions: 25, cardClicks: 0 }],
   "long_format_cards",
  )

  expect(merged.metrics).toEqual({
   cardClicks: 0,
   cardImpressions: 25,
   cardsShown: 25,
  })
  expect(merged.metrics?.views).toBeUndefined()
  expect(merged.metrics?.watchTime).toBeUndefined()
  expect(merged.metrics?.revenue).toBeUndefined()
 })
})
