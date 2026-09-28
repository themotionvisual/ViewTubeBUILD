import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")

describe("Packaging Intelligence widget contract", () => {
  it("registers one independent compact dashboard companion to Packaging Lab Pro", () => {
    const registry = read("src/views/dashboard/widgets/newWidgetSet.ts")
    expect(registry).toContain('id: "packaging-intelligence"')
    expect(registry).toContain('"packaging-intelligence": PackagingIntelligenceWidget')
  })

  it("uses canonical widget primitives and the packaging intelligence backend", () => {
    const source = read("src/views/dashboard/widgets/PackagingIntelligenceWidget.tsx")
    for (const primitive of [
      "WidgetShell",
      "WidgetVideoSelect",
      "WidgetStepTabs",
      "WidgetModuleFrame",
      "WidgetModuleHeader",
      "WidgetDataGrid",
      "WidgetScrollArea",
      "WidgetBadge",
    ]) {
      expect(source).toContain(primitive)
    }
    expect(source).toContain("derivePackagingIntelligence")
    expect(source).toContain("rankPackagingIntelligenceCandidates")
    expect(source).toContain("createPackagingIntelligenceHandoff")
    expect(source).toContain("listVideoPackages")
  })

  it("keeps visual ownership namespaced instead of recreating the shared shell or primitives", () => {
    const css = read("src/views/dashboard/widgets/PackagingIntelligenceWidget.css")
    expect(css).toContain(".packaging-intelligence-widget")
    expect(css).not.toMatch(/(^|\n)\.vt-widget\s*\{/)
    expect(css).not.toMatch(/(^|\n)\.widget-module-frame\s*\{/)
    expect(css).not.toMatch(/(^|\n)(button|input|select|textarea)\s*\{/)
  })

  it("keeps the deep editor in Packaging Lab Pro rather than duplicating generation controls", () => {
    const source = read("src/views/dashboard/widgets/PackagingIntelligenceWidget.tsx")
    expect(source).toContain('"/packaging-lab-pro"')
    expect(source).not.toContain("generateThumbnail")
    expect(source).not.toContain("generateSeoData")
  })
})
