import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")

describe("Longform Optimizer daily outcome UI contract", () => {
  it("uses the canonical daily-comparison service and exposes a compact 7+7 refresh path", () => {
    const source = read("src/views/dashboard/widgets/LongformOptimizationWidget.tsx")
    expect(source).toContain("fetchAndRecordLongformOptimizationDailyComparison")
    expect(source).toContain("readLatestLongformOptimizationDailyComparison")
    expect(source).toContain("REFRESH 7+7")
    expect(source).toContain("DAILY 7 BEFORE / 7 AFTER")
  })

  it("keeps the daily comparison inside canonical grid/scroll primitives", () => {
    const source = read("src/views/dashboard/widgets/LongformOptimizationWidget.tsx")
    expect(source).toContain("WidgetDataGrid")
    expect(source).toContain("longform-optimizer-daily")
  })
})
