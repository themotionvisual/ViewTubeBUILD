import { describe, expect, it } from "vitest"

import {
 ACTIVE_VIDEO_SYNC_METRICS,
 buildMetricCapabilityMatrix,
 buildMissingVideoMetricBacklog,
 getVideoMetricRuntimeStatus,
 getMasterColumnVisibilityRule,
} from "../analyticsCapabilityMatrix"

describe("analytics capability matrix", () => {
 it("flags audience segmentation metrics as import-only", () => {
  expect(getMasterColumnVisibilityRule("Casual viewers")).toBe("import_only")
  expect(getMasterColumnVisibilityRule("Regular viewers")).toBe("import_only")
  expect(getMasterColumnVisibilityRule("Views")).toBe("api_synced")
 })

 it("produces a non-empty matrix with unsupported and api entries", () => {
  const matrix = buildMetricCapabilityMatrix()
  expect(matrix.length).toBeGreaterThan(0)
  expect(matrix.some((row) => row.sourceCapability === "api")).toBe(true)
  expect(matrix.some((row) => row.sourceCapability === "unsupported" || row.sourceCapability === "csv_only")).toBe(true)
 })

 it("builds missing metric backlog with required actions", () => {
  const backlog = buildMissingVideoMetricBacklog()
  expect(backlog.length).toBeGreaterThan(0)
  expect(backlog.some((item) => item.status === "missing_from_active_sync")).toBe(true)

 const endScreenClickRate = backlog.find((item) => item.metric === "endScreenClickRate")
  expect(endScreenClickRate).toBeDefined()
  expect(endScreenClickRate?.status).toBe("missing_from_active_sync")
 })

 it("treats video thumbnail impressions + ctr as required active sync metrics", () => {
  expect(ACTIVE_VIDEO_SYNC_METRICS).toContain("videoThumbnailImpressions")
  expect(ACTIVE_VIDEO_SYNC_METRICS).toContain("videoThumbnailImpressionsClickRate")

  const backlog = buildMissingVideoMetricBacklog()
  const impressions = backlog.find((item) => item.metric === "videoThumbnailImpressions")
  const ctr = backlog.find(
   (item) => item.metric === "videoThumbnailImpressionsClickRate",
  )

  expect(impressions?.status).toBe("active_sync")
  expect(ctr?.status).toBe("active_sync")
 })

 it("marks newly activated video metrics as active sync and keeps viewerPercentage out of video backlog", () => {
  expect(ACTIVE_VIDEO_SYNC_METRICS).toContain("cardClickRate")
  expect(ACTIVE_VIDEO_SYNC_METRICS).toContain("videosAddedToPlaylists")
  expect(ACTIVE_VIDEO_SYNC_METRICS).toContain("videosRemovedFromPlaylists")
  expect(ACTIVE_VIDEO_SYNC_METRICS).toContain("grossRevenue")

  const backlog = buildMissingVideoMetricBacklog()
  const cardClickRate = backlog.find((item) => item.metric === "cardClickRate")
  const playlistAdds = backlog.find((item) => item.metric === "videosAddedToPlaylists")
  const playlistRemoves = backlog.find(
   (item) => item.metric === "videosRemovedFromPlaylists",
  )

  expect(cardClickRate?.status).toBe("active_sync")
  expect(playlistAdds?.status).toBe("active_sync")
 expect(playlistRemoves?.status).toBe("active_sync")
  expect(backlog.some((item) => item.metric === "viewerPercentage")).toBe(false)
 })

 it("classifies impressions/ctr request-shape failures explicitly", () => {
  const diagnostics = {
   attemptedGroups: {},
   disabledMetrics: [],
   failureReasons: [
    {
     group: "impressions_ctr",
     ids: "channel==MINE",
     metrics: ["videoThumbnailImpressions"],
     status: 400,
     reason: "Bad Request",
     requestClass: "video_top_videos_channel_filter",
     outcome: "quarantined",
    },
   ],
   knownInvalidCombos: [],
   splitRetries: 0,
   maxRequestChars: 1900,
   requestCharCounts: [],
  }

  expect(
   getVideoMetricRuntimeStatus("videoThumbnailImpressions", diagnostics, {
    hasTargetVideoIds: true,
   }),
  ).toBe("temporarily_unavailable_due_to_request_shape")
  expect(
   getVideoMetricRuntimeStatus("videoThumbnailImpressionsClickRate", diagnostics, {
    hasTargetVideoIds: false,
   }),
  ).toBe("blocked_by_missing_video_ids")
 })
})
