import fs from "node:fs"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(new URL("./TrajectoryForecaster.tsx", import.meta.url), "utf8")

describe("TrajectoryForecaster module contract", () => {
 it("uses the shared SubToolbox shell and canonical visual palette", () => {
  expect(source).toContain("<SubToolboxChartModule")
  expect(source).toContain("VT_VISUAL_METRIC_COLORS.views")
  expect(source).not.toContain("<ChartModule")
  expect(source).not.toContain("<SlabControl")
 })

 it("supports Daily, Weekly, and Monthly canonical history", () => {
  expect(source).toContain('type Gran = "DAILY" | "WEEKLY" | "MONTHLY"')
  expect(source).toContain("rollupDailyFromDaily(dailyMetrics, forecastPeriods)")
  expect(source).toContain("rollupWeeklyChannelWithSource(dailyMetrics, 16)")
  expect(source).toContain("rollupMonthlyChannelWithSource(dailyMetrics, monthlyMetrics, 12)")
 })

 it("offers every daily horizon from 7 through 28 days", () => {
  expect(source).toContain("Array.from({ length: 22 }, (_, index) => index + 7)")
 })

 it("keeps the chart within a stable wide aspect range", () => {
  expect(source).toContain("Math.max(240, Math.min(320, canvasWidth / 3))")
 })
})
