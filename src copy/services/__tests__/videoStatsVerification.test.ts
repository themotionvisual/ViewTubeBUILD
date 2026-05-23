import { describe, expect, it } from "vitest"

import { emptyMetricCells } from "../analyticsContract"
import { buildVideoStatsVerificationSummary } from "../analyticsSelectors"
import {
 findDuplicateShortHeaders,
 getCanonicalMasterHeader,
 getShortMasterHeader,
} from "../../views/performanceHubUtils"

describe("master table header cleanup", () => {
 it("collapses thumbnail ctr aliases but keeps engagement rate separate", () => {
  expect(getCanonicalMasterHeader("Click-Through Rate (CTR)")).toBe("CTR")
  expect(getCanonicalMasterHeader("CTR (%)")).toBe("CTR")
  expect(getCanonicalMasterHeader("Impressions click-through rate (%)")).toBe(
   "CTR",
  )
  expect(getCanonicalMasterHeader("Engagement Rate")).toBe("Engagement Rate")
  expect(getShortMasterHeader("Watch Time (Hours)")).toBe("Watch Hrs")
  expect(getShortMasterHeader("CTR")).toBe("CTR %")
  expect(getShortMasterHeader("Data Provenance")).toBe("Data Src")
 })

 it("detects duplicate short headers after compaction", () => {
  expect(
   findDuplicateShortHeaders([
    "Click-Through Rate (CTR)",
    "CTR (%)",
    "Impressions",
   ]),
  ).toEqual(["CTR %"])
 })

 it("does not collapse plus/minus metric pairs into false duplicates", () => {
  expect(findDuplicateShortHeaders(["Subs +", "Subs -", "Likes +", "Likes -"])).toEqual(
   [],
  )
 })
})

describe("video stats verification summary", () => {
 it("classifies request failure when raw thumbnail metrics never arrive", () => {
  const metrics = emptyMetricCells("api")
  const summary = buildVideoStatsVerificationSummary({
   window: "lifetime",
   reportRows: [],
   masterRows: [
    {
     id: "row-1",
     videoId: "abc123",
     title: "Video",
     uploadDate: "2026-04-29",
     format: "long",
     durationSeconds: 120,
     sourceMode: "api",
     metrics,
    },
   ],
   diagnostics: {
    failureReasons: [
     {
      group: "impressions_ctr",
      metrics: ["videoThumbnailImpressions"],
      status: 400,
      reason: "Bad Request",
      requestClass: "video_top_videos_channel_filter",
     },
    ],
   },
  })

  expect(summary.mappingStatus).toBe("request_failure")
  expect(summary.lastFailure?.requestClass).toBe(
   "video_top_videos_channel_filter",
  )
 })

 it("classifies mapping failure when raw rows exist but canonical rows do not", () => {
  const metrics = emptyMetricCells("api")
  const summary = buildVideoStatsVerificationSummary({
   window: "lifetime",
   reportRows: [
    {
     video: "abc123",
     videoThumbnailImpressions: 1000,
     videoThumbnailImpressionsClickRate: 4.2,
    },
   ],
   masterRows: [
    {
     id: "row-1",
     videoId: "abc123",
     title: "Video",
     uploadDate: "2026-04-29",
     format: "long",
     durationSeconds: 120,
     sourceMode: "api",
     metrics,
    },
   ],
  })

  expect(summary.rawMetricRows.impressions).toBe(1)
  expect(summary.rawMetricRows.ctr).toBe(1)
  expect(summary.mappedMetricRows.impressions).toBe(0)
  expect(summary.mappedMetricRows.ctr).toBe(0)
  expect(summary.mappingStatus).toBe("mapping_failure")
 })
})
