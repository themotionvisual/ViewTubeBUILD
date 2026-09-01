import { describe, expect, it } from "vitest"

import {
 decodeVtSyncDataset,
 encodeVtSyncDataset,
 VT_SYNC_PACKED_DATASET_CHUNK_SIZE,
} from "./packedDataset"

describe("VT-SYNC packed datasets", () => {
 it("round-trips normalized rows without losing value states", async () => {
  const rows: Array<Record<string, unknown>> = [
   {
    id: "vidéo-一",
    title: "First 🎬",
    views: 0,
    revenue: null,
    missingButDeclared: undefined,
    metrics: { watchTime: 12.3456789012345, likes: 0 },
    tags: ["history", "cavalry"],
    published: true,
   },
   {
    id: "video-2",
    title: "Second",
    views: 9_007_199_254_740_991,
    metrics: { watchTime: 0, likes: 42 },
    tags: [],
    published: false,
   },
  ]

  const packed = await encodeVtSyncDataset({
   channelId: "channel-a",
   datasetId: "videos",
   rows,
   capturedAt: "2026-08-29T12:00:00.000Z",
   chunkSize: 1,
  })
  const decoded = await decodeVtSyncDataset(packed)

  expect(decoded).toEqual(rows)
  expect(Object.prototype.hasOwnProperty.call(decoded[0], "missingButDeclared")).toBe(true)
  expect(Object.prototype.hasOwnProperty.call(decoded[1], "missingButDeclared")).toBe(false)
 })

 it("uses less space than repeated-key JSON for analytics rows", async () => {
  const rows = Array.from({ length: 600 }, (_, index) => ({
   date: `2025-${String(Math.floor(index / 28) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
   views: 100_000 + index,
   engagedViews: 70_000 + index,
   watchTime: 12_345.67 + index,
   averageViewDuration: 74.25,
   averageViewPercentage: 63.5,
   subscribersGained: index % 14,
   estimatedRevenue: 42.5 + index / 100,
   metricProvenance: {
    views: "youtube_analytics_v2",
    watchTime: "youtube_analytics_v2",
    estimatedRevenue: "youtube_analytics_v2",
   },
  }))

  const packed = await encodeVtSyncDataset({
   channelId: "channel-a",
   datasetId: "daily",
   rows,
   capturedAt: "2026-08-29T12:00:00.000Z",
  })
  const packedBytes = packed.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const jsonBytes = new TextEncoder().encode(JSON.stringify(rows)).byteLength

  expect(await decodeVtSyncDataset(packed)).toEqual(rows)
 expect(packedBytes).toBeLessThan(jsonBytes * 0.4)
 })

 it("uses chunks as partitions rather than row limits", async () => {
  const rows = Array.from({ length: 10_001 }, (_, index) => ({
   term: `SOURCE_${index % 16}`,
   day: `DAY_${Math.floor(index / 16)}`,
   views: index,
  }))
  const packed = await encodeVtSyncDataset({
   channelId: "large-channel",
   datasetId: "traffic_day",
   rows,
   capturedAt: "2026-08-31T23:50:00.000Z",
  })

  expect(packed.manifest.rowCount).toBe(10_001)
  expect(packed.manifest.primaryKey).toEqual(["term", "day"])
  expect(packed.chunks).toHaveLength(Math.ceil(rows.length / VT_SYNC_PACKED_DATASET_CHUNK_SIZE))
  expect(await decodeVtSyncDataset(packed)).toEqual(rows)
 })
})
