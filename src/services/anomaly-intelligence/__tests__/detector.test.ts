import { describe, expect, it } from "vitest"
import { detectRobustMagnitudeAnomaly, groupRowsIntoDailySeries } from "../detector"

describe("anomaly intelligence detector", () => {
 it("groups traffic-day rows by the canonical term field", () => {
  const series = groupRowsIntoDailySeries({
   dataset: {
    datasetId: "traffic_day",
    label: "Traffic × Day",
    status: "available",
    snapshotId: "snapshot-traffic",
    channelId: "channel-1",
    sources: ["youtube_analytics_v2"],
    rows: [
     { term: "EXTERNAL", day: "2026-09-01", views: 12 },
     { term: "SEARCH", day: "2026-09-01", views: 24 },
    ],
   },
   dateKey: "day",
   metricKey: "views",
   entityKey: "term",
  })

  expect(series.map((entry) => entry.entity)).toEqual(["EXTERNAL", "SEARCH"])
 })

 it("detects a material spike against a robust baseline", () => {
  const anomaly = detectRobustMagnitudeAnomaly({
   channelId: "channel-1",
   datasetId: "traffic_day",
   family: "traffic",
   metric: "views",
   entity: "EXT_URL",
   observations: [
    { date: "2026-08-28", value: 100 },
    { date: "2026-08-29", value: 105 },
    { date: "2026-08-30", value: 98 },
    { date: "2026-08-31", value: 102 },
    { date: "2026-09-01", value: 101 },
    { date: "2026-09-02", value: 980 },
   ],
   evidence: {
    datasetId: "traffic_day",
    label: "Traffic by Day",
    status: "available",
    snapshotId: "snapshot-1",
    channelId: "channel-1",
    updatedAt: "2026-09-03T00:00:00Z",
    sources: ["youtube_analytics_v2"],
    rows: [],
   },
  })

  expect(anomaly).not.toBeNull()
  expect(anomaly?.kind).toBe("spike")
  expect(anomaly?.impactScore).toBeGreaterThan(70)
  expect(anomaly?.evidence[0].snapshotId).toBe("snapshot-1")
 })

 it("ignores ordinary movement", () => {
  const anomaly = detectRobustMagnitudeAnomaly({
   channelId: "channel-1",
   datasetId: "daily",
   family: "video",
   metric: "views",
   observations: [
    { date: "2026-08-28", value: 100 },
    { date: "2026-08-29", value: 105 },
    { date: "2026-08-30", value: 98 },
    { date: "2026-08-31", value: 102 },
    { date: "2026-09-01", value: 101 },
    { date: "2026-09-02", value: 106 },
   ],
   evidence: {
    datasetId: "daily",
    label: "Daily",
    status: "available",
    snapshotId: "snapshot-1",
    channelId: "channel-1",
    sources: ["youtube_analytics_v2"],
    rows: [],
   },
  })

  expect(anomaly).toBeNull()
 })
})
