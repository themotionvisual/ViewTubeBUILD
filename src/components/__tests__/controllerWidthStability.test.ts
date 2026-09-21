import { describe, expect, it } from "vitest"

import { estimateControllerRowWidth } from "../controllerRowWidth"
import type { ControllerRow } from "../VisualModuleController"

/**
 * A controller column must not resize when the reader changes a setting.
 *
 * The column sits beside the evidence canvas, so a row that grows when a
 * longer option is selected drags the canvas sideways with it: pick "LIFETIME"
 * instead of "ONE YEAR" and the plot reflows under the cursor. Every row is
 * therefore measured against the widest value it can ever show and holds that
 * width for every setting.
 */

const widthAcross = (rows: ControllerRow[]) =>
 new Set(rows.map((row) => estimateControllerRowWidth(row)))

describe("controller row width is the same for every setting", () => {
 it("holds for a dropdown whichever option is selected", () => {
  const options = [
   { label: "ONE YEAR", value: "1y" },
   { label: "THREE YEARS", value: "3y" },
   { label: "LIFETIME", value: "lifetime" },
  ]
  const rows = options.map((option): ControllerRow => ({
   type: "dropdown", value: option.value, options, onSelect: () => undefined,
  }))
  expect(widthAcross(rows).size).toBe(1)
 })

 it("holds for a toggle whichever option is selected", () => {
  const options = ["TOTAL", "AVERAGE PER VIDEO"] as const
  const rows = options.map((value): ControllerRow => ({
   type: "toggle", value, options: [...options], onSelect: () => undefined,
  }))
  expect(widthAcross(rows).size).toBe(1)
 })

 it("holds for a cycled text row that declares its candidates", () => {
  const widthValues = ["NEWEST", "TOP PERFORMING", "MOST WATCHED"]
  const rows = widthValues.map((value): ControllerRow => ({
   type: "text", value, widthValues,
  }))
  expect(widthAcross(rows).size).toBe(1)
 })

 it("holds for a split row that declares both sides", () => {
  const leftWidthValues = ["SHORTS", "LONGFORM"]
  const rightWidthValues = ["BY VIEWS", "BY ESTIMATED REVENUE"]
  const rows: ControllerRow[] = []
  for (const leftValue of leftWidthValues) {
   for (const rightValue of rightWidthValues) {
    rows.push({ type: "split", leftValue, rightValue, leftWidthValues, rightWidthValues })
   }
  }
  expect(widthAcross(rows).size).toBe(1)
 })

 it("holds for a metric multi-select however many metrics are on", () => {
  const options = [
   { label: "VIEWS", value: "views", color: "#fff" },
   { label: "WATCH HOURS", value: "watch", color: "#fff" },
   { label: "SUBSCRIBERS GAINED", value: "subs", color: "#fff" },
   { label: "ESTIMATED REVENUE", value: "revenue", color: "#fff" },
  ]
  const rows: ControllerRow[] = options.map((_, index) => ({
   type: "metricMultiSelect",
   options,
   selectedValues: options.slice(0, index + 1).map((option) => option.value),
   onToggleValue: () => undefined,
   maxLabels: 2,
  }))
  expect(widthAcross(rows).size).toBe(1)
 })

 it("holds for a counter stepping through its reserved digits", () => {
  const rows: ControllerRow[] = [1, 9, 25, 100, 999].map((value) => ({
   type: "number", value,
  }))
  expect(widthAcross(rows).size).toBe(1)
 })

 it("sizes to the widest candidate, not the current one", () => {
  const short = estimateControllerRowWidth({
   type: "text", value: "TOP", widthValues: ["TOP"],
  })
  const wide = estimateControllerRowWidth({
   type: "text", value: "TOP", widthValues: ["TOP", "MOST RECENTLY PUBLISHED"],
  })
  expect(wide).toBeGreaterThan(short)
 })
})
