import { describe, expect, it } from "vitest"
import {
 compareMetricContexts,
 type MetricComparisonContext,
} from "./MetricComparabilityPolicy"

const metric = (
 overrides: Partial<MetricComparisonContext> = {},
): MetricComparisonContext => ({
 metricKey: "views",
 unit: "count",
 entityScope: "video",
 formatScope: "long",
 window: "28d",
 aggregation: "sum",
 coverage: 1,
 availability: "available",
 ...overrides,
})

describe("compareMetricContexts", () => {
 it("accepts semantically equivalent metric contexts", () => {
  expect(compareMetricContexts(metric(), metric())).toEqual({
   comparable: true,
   reasons: [],
  })
 })

 it("rejects different units", () => {
  const result = compareMetricContexts(metric(), metric({ unit: "percent" }))
  expect(result.comparable).toBe(false)
  expect(result.reasons).toContainEqual(expect.objectContaining({ code: "unit_mismatch" }))
 })

 it("rejects different entity scopes and format scopes", () => {
  const result = compareMetricContexts(metric(), metric({ entityScope: "channel", formatScope: "shorts" }))
  expect(result.reasons.map((reason) => reason.code)).toEqual(expect.arrayContaining(["entity_scope_mismatch", "format_scope_mismatch"]))
 })

 it("rejects different windows unless explicitly allowed", () => {
  expect(compareMetricContexts(metric(), metric({ window: "90d" })).reasons).toContainEqual(expect.objectContaining({ code: "window_mismatch" }))
  expect(compareMetricContexts(metric(), metric({ window: "90d" }), { allowDifferentWindows: true }).comparable).toBe(true)
 })

 it("rejects unavailable or insufficient-coverage evidence", () => {
  const result = compareMetricContexts(metric({ coverage: 0.9 }), metric({ availability: "unavailable", coverage: 0.2 }), { minimumCoverage: 0.8 })
  expect(result.reasons.map((reason) => reason.code)).toEqual(expect.arrayContaining(["unavailable", "insufficient_coverage"]))
 })

 it("rejects aggregation mismatches for otherwise matching metrics", () => {
  const result = compareMetricContexts(metric({ aggregation: "sum" }), metric({ aggregation: "average" }))
  expect(result.reasons).toContainEqual(expect.objectContaining({ code: "aggregation_mismatch" }))
 })
})
