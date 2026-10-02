import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")

describe("Search Intent Mapper widget contract", () => {
 it("registers the planned widget with the declared size range", () => {
  const set = read("src/views/dashboard/widgets/newWidgetSet.ts")
  expect(set).toContain('id: "search-intent-mapper"')
  expect(set).toContain('defaultSize: "half"')
  expect(set).toContain('minSize: "third"')
  expect(set).toContain('maxSize: "full"')
  expect(set).toContain('"search-intent-mapper": SearchIntentMapperWidget')
 })

 it("keeps the prototype hidden/default-off until certification", () => {
  const registry = read("src/views/dashboard/WidgetRegistry.ts")
  expect(registry).toContain("HIDDEN_NEW_WIDGET_IDS")
  expect(registry).toContain('"search-intent-mapper"')
  expect(registry).toContain('"hidden"')
 })

 it("uses canonical primitives and real VT-SYNC search evidence", () => {
  const source = read("src/views/dashboard/widgets/SearchIntentMapperWidget.tsx")
  for (const token of [
   "WidgetShell",
   "WidgetSizedSelect",
   "WidgetModuleFrame",
   "WidgetModuleHeader",
   "WidgetScrollArea",
   "WidgetBadge",
   "WidgetSizedButton",
  ]) expect(source).toContain(token)

  expect(source).toContain("overviewChartData")
  expect(source).toContain("searchTerms")
  expect(source).toContain("buildSearchIntentClusters")
  expect(source).toContain("resolveSearchIntentDatasetState")
  expect(source).toContain("createSearchIntentProjectHandoff")
  expect(source).not.toContain("SAMPLE SEARCH TERMS")
 })

 it("keeps custom visualization CSS namespaced instead of recreating shared primitives", () => {
  const css = read("src/views/dashboard/widgets/SearchIntentMapperWidget.css")
  expect(css).toContain(".search-intent-mapper-widget")
  expect(css).not.toMatch(/(^|\n)\.vt-widget\s*\{/)
  expect(css).not.toMatch(/(^|\n)\.widget-module-frame\s*\{/)
  expect(css).not.toMatch(/(^|\n)(button|input|select|textarea)\s*\{/)
 })

 it("stages the selected observed gap into Projects rather than creating a second project store", () => {
  const service = read("src/services/searchIntentMapper.ts")
  expect(service).toContain("createViewTubeActionPacket")
  expect(service).toContain('suggestedTargets: ["project-calendar"]')
  expect(service).not.toContain("localStorage.setItem")
 })
})
