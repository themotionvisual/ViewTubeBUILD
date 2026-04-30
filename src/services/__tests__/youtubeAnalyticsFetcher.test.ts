import { describe, expect, it } from "vitest"

import {
 buildChannelScopedVideoIdCandidates,
 buildScopedVideoMetricGroups,
 getAnalyticsRequestClass,
 shouldForceViewsMetric,
} from "../youtube/youtubeAnalyticsFetcher"

describe("youtubeAnalyticsFetcher video metric groups", () => {
 it("keeps thumbnail impressions isolated and expands active video metric groups", () => {
  const groups = buildScopedVideoMetricGroups()

  expect(groups.impressions_ctr).toEqual([
   "videoThumbnailImpressions",
   "videoThumbnailImpressionsClickRate",
  ])
  expect(groups.engagement).toContain("videosAddedToPlaylists")
  expect(groups.engagement).toContain("videosRemovedFromPlaylists")
  expect(groups.monetization).toContain("grossRevenue")
 expect(groups.audience_mix).toContain("annotationClickThroughRate")
 expect(groups.audience_mix).toContain("annotationCloseRate")
 expect(groups.audience_mix).toContain("cardClickRate")
 })

 it("classifies impressions requests as channel-scoped top-videos requests", () => {
 expect(
   getAnalyticsRequestClass("channel==MINE", [
    "videoThumbnailImpressions",
    "videoThumbnailImpressionsClickRate",
   ]),
  ).toBe("video_top_videos_channel_filter")
  expect(getAnalyticsRequestClass("channel==MINE", ["creatorContentType"])).toBe(
   "channel_creator_content_type",
  )
  expect(getAnalyticsRequestClass("video==abc123", ["views"])).toBe(
   "video_filter_chunk",
  )

 expect(buildChannelScopedVideoIdCandidates("channel_123")).toEqual([
   "channel==MINE",
   "channel==channel_123",
  ])
 })

 it("does not force-inject views into thumbnail-only top-videos requests", () => {
 expect(
   shouldForceViewsMetric(
    "channel==MINE",
    ["videoThumbnailImpressions", "videoThumbnailImpressionsClickRate"],
    false,
   ),
  ).toBe(false)
  expect(
   shouldForceViewsMetric("channel==MINE", ["videoThumbnailImpressions"], false),
  ).toBe(false)
  expect(shouldForceViewsMetric("channel==MINE", ["likes", "comments"], false)).toBe(
   true,
  )
 })
})
