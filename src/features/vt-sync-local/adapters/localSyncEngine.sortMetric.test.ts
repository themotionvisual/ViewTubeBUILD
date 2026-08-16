import { describe, expect, it } from "vitest"
import { ensureSortMetricSelected } from "./localSyncEngine"
import { VT_SYNC_ANALYTICS_METRIC_BUNDLES } from "../upstream/analyticsMetricContract"

describe("ensureSortMetricSelected", () => {
 it("adds the sort metric to bundles that omit it so -views reports are accepted", () => {
  // engagement / cards / revenue bundles do not contain `views` but are sorted
  // by -views — the exact combination the API rejected with a 400.
  for (const bundle of VT_SYNC_ANALYTICS_METRIC_BUNDLES) {
   const selected = ensureSortMetricSelected([...bundle.metrics], "-views", "country")
   expect(selected).toContain("views")
  }
 })

 it("leaves a bundle untouched when it already selects the sort metric", () => {
  const watch = VT_SYNC_ANALYTICS_METRIC_BUNDLES.find((bundle) => bundle.id === "watch")!
  const selected = ensureSortMetricSelected([...watch.metrics], "-views", "country")
  expect(selected).toEqual([...watch.metrics])
  // No duplicate views column.
  expect(selected.filter((metric) => metric === "views")).toHaveLength(1)
 })

 it("does not add a dimension sort key to the metrics list", () => {
  // sort=-day against a day dimension is valid as-is; day is a dimension, not a metric.
  const selected = ensureSortMetricSelected(["views", "estimatedMinutesWatched"], "-day", "insightTrafficSourceType,day")
  expect(selected).toEqual(["views", "estimatedMinutesWatched"])
 })

 it("ignores an empty or missing sort", () => {
  expect(ensureSortMetricSelected(["comments"], "", "country")).toEqual(["comments"])
  expect(ensureSortMetricSelected(["comments"], undefined, "country")).toEqual(["comments"])
 })
})
