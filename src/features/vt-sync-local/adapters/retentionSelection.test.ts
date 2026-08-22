import { describe, expect, it } from "vitest"
import type { VtSyncVideoItem } from "./contracts"
import {
 selectVtSyncBaseRetentionVideos,
 selectVtSyncRetentionTargets,
 VT_SYNC_BASE_RETENTION_PROFILE,
 VT_SYNC_RETENTION_METRICS,
} from "./retentionSelection"

const video = (
 id: string,
 format: string,
 views: number,
 publishedAt = "2026-01-01T00:00:00Z",
 extra: Partial<VtSyncVideoItem> = {},
): VtSyncVideoItem => ({ id, title: id, format, publishedAt, privacyStatus: "public", metrics: { views }, ...extra })

describe("selectVtSyncBaseRetentionVideos", () => {
 it("selects the top five long videos and top five Shorts independently", () => {
  const videos = [
   ...Array.from({ length: 8 }, (_, index) => video(`long-${index}`, "long", index)),
   ...Array.from({ length: 9 }, (_, index) => video(`short-${index}`, "short", index)),
  ]
  const result = selectVtSyncBaseRetentionVideos(videos)

  expect(result.selectedVideoIds).toEqual([
   "long-7", "long-6", "long-5", "long-4", "long-3",
   "short-8", "short-7", "short-6", "short-5", "short-4",
  ])
  expect(result.selectedCounts).toEqual({ long: 5, short: 5 })
  expect(result.estimatedRequests).toBe(10)
 })

 it("uses publication date and then video id as deterministic view-count tie breakers", () => {
  const result = selectVtSyncBaseRetentionVideos([
   video("long-b", "long", 100, "2026-02-01T00:00:00Z"),
   video("long-c", "long", 100, "2026-03-01T00:00:00Z"),
   video("long-a", "long", 100, "2026-03-01T00:00:00Z"),
  ])
  expect(result.selectedVideoIds).toEqual(["long-a", "long-c", "long-b"])
 })

 it("reports format shortages without cross-format backfilling", () => {
  const result = selectVtSyncBaseRetentionVideos([
   ...Array.from({ length: 9 }, (_, index) => video(`long-${index}`, "long", index)),
   ...Array.from({ length: 3 }, (_, index) => video(`short-${index}`, "shorts", index)),
  ])
  expect(result.selectedCounts).toEqual({ long: 5, short: 3 })
  expect(result.shortages).toEqual({ long: 0, short: 2 })
  expect(result.selectedVideoIds).toHaveLength(8)
  expect(result.estimatedRequests).toBe(8)
 })

 it("excludes live, unknown, unavailable, metadata-pending, and duplicate videos", () => {
  const result = selectVtSyncBaseRetentionVideos([
   video("long", "videoOnDemand", 10),
   video("long", "long", 999),
   video("live", "live", 999),
   video("unknown", "unknown", 999),
   video("unavailable", "short", 999, undefined, { privacyStatus: "unavailable" }),
   video("pending", "short", 999, undefined, { title: "Metadata pending" }),
  ])
  expect(result.selectedVideoIds).toEqual(["long"])
  expect(result.eligibleCounts).toEqual({ long: 1, short: 0 })
 })

 it("defines the balanced baseline and all five retention metrics", () => {
  expect(VT_SYNC_BASE_RETENTION_PROFILE).toEqual({
   selectionMode: "top_by_views_by_format",
   longFormLimit: 5,
   shortsLimit: 5,
   maximumVideos: 10,
  })
  expect(VT_SYNC_RETENTION_METRICS).toEqual([
   "audienceWatchRatio",
   "relativeRetentionPerformance",
   "startedWatching",
   "stoppedWatching",
   "totalSegmentImpressions",
  ])
 })

 it("preserves a deduplicated explicit manual selection instead of applying the baseline", () => {
  const videos = [video("long", "long", 10), video("short", "short", 20)]
  const result = selectVtSyncRetentionTargets(videos, ["short", "missing", "short", "long"])
  expect(result.selectionMode).toBe("explicit_manual")
  expect(result.targetVideoIds).toEqual(["short", "long"])
 })
})
