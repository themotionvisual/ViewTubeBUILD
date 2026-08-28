import { describe, expect, it } from "vitest"
import { validateAnalyticsReportShape } from "./analyticsReportMatrix"

describe("YouTube Analytics report matrix", () => {
 it("accepts core traffic-source reports", () => {
  expect(validateAnalyticsReportShape(
   ["insightTrafficSourceType"],
   ["views","estimatedMinutesWatched","subscribersGained"],
  )).toMatchObject({ ok: true, family: "core" })
 })

 it("accepts retention as its own report family", () => {
  expect(validateAnalyticsReportShape(
   ["elapsedVideoTimeRatio"],
   ["audienceWatchRatio","relativeRetentionPerformance"],
  )).toMatchObject({ ok: true, family: "retention" })
 })

 it("accepts age x gender demographics only with viewerPercentage", () => {
  expect(validateAnalyticsReportShape(
   ["ageGroup","gender"],
   ["viewerPercentage"],
  )).toMatchObject({ ok: true, family: "demographics" })
 })

 it("rejects mixed retention and traffic-source shapes before Google sees them", () => {
  expect(validateAnalyticsReportShape(
   ["elapsedVideoTimeRatio","insightTrafficSourceType"],
   ["audienceWatchRatio"],
  )).toMatchObject({ ok: false, code: "mixed_report_families" })
 })

 it("marks monetary queries explicitly", () => {
  expect(validateAnalyticsReportShape(
   ["month"],
   ["estimatedRevenue","cpm"],
  )).toMatchObject({ ok: true, family: "core", monetary: true })
 })
})
