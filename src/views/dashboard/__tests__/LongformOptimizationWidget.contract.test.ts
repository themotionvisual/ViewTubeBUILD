import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")

describe("Longform Optimizer widget contract", () => {
  it("registers one independently editable dashboard widget", () => {
    const registry = read("src/views/dashboard/widgets/newWidgetSet.ts")
    expect(registry).toContain('id: "longform-optimizer"')
    expect(registry).toContain('"longform-optimizer": LongformOptimizationWidget')
  })

  it("uses canonical ViewTube primitives instead of private lookalikes", () => {
    const source = read("src/views/dashboard/widgets/LongformOptimizationWidget.tsx")
    for (const primitive of [
      "WidgetShell",
      "WidgetVideoSelect",
      "WidgetToggleSwitch",
      "WidgetStepTabs",
      "WidgetModuleFrame",
      "WidgetDataGrid",
      "WidgetScrollArea",
    ]) {
      expect(source).toContain(primitive)
    }
    expect(source).toContain("runLongformOptimizationAnalysis")
    expect(source).toContain("createLongformOptimizationHandoff")
  })

  it("keeps widget-specific CSS namespaced and does not redefine shared shell/primitives", () => {
    const css = read("src/views/dashboard/widgets/LongformOptimizationWidget.css")
    expect(css).toContain(".longform-optimizer-widget")
    expect(css).not.toMatch(/(^|\n)\.vt-widget\s*\{/)
    expect(css).not.toMatch(/(^|\n)\.widget-module-frame\s*\{/)
    expect(css).not.toMatch(/(^|\n)\.widget-toggle-switch\s*\{/)
    expect(css).not.toMatch(/(^|\n)(button|input|select|textarea)\s*\{/)
  })
})
