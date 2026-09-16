import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const repoFile = (relative: string) => readFileSync(join(process.cwd(), relative), "utf8")

const CANVAS_CSS = repoFile("src/styles/data-visual-canvas.css")
const PREVIEW_CSS = repoFile("public/data-visual-preview-16x9.css")
const PREVIEW_JS = repoFile("public/data-visual-preview-16x9.js")
const MOBILE_CSS = repoFile("public/mobile-visual-responsive-system.css")
const OWNED = "[data-vt-data-visual-canvas-owned]"

/**
 * One canvas, one geometry owner. These assertions are the guard against the
 * regression this refactor exists to remove: a second system quietly resizing
 * a Data Visual canvas that `VisualCanvasViewport` already owns.
 */
describe("Data Visual canvas ownership", () => {
 it("keeps canvas geometry in the canonical stylesheet", () => {
  expect(CANVAS_CSS).toContain('[data-vt-visual-canvas][data-vt-visual-aspect="16:9"]')
  expect(CANVAS_CSS).toContain("aspect-ratio: 16 / 9")
  expect(CANVAS_CSS).toContain("100dvh")
 })

 it("is imported into the global stylesheet", () => {
  expect(repoFile("src/index.css")).toContain('@import "./styles/data-visual-canvas.css"')
 })

 describe("legacy compatibility layers stand down for migrated modules", () => {
  const geometryProperties = /(?:^|;|\{)\s*(?:width|height|min-height|max-height|aspect-ratio)\s*:/

  /**
   * Only rules that size the chart body itself (or its direct child, which is
   * the canvas) can fight the viewport. Rules that merely cap descendant marks
   * (`... svg`, `... canvas`) are constraints, not a second owner.
   */
  const sizesTheCanvasBox = (selector: string) =>
   selector
    .split(",")
    .map((part) => part.trim())
    .some((part) => /\[data-vt-chart-body\][^ ]*(?:\s*>\s*\*)?$/.test(part))

  const ruleSelectors = (css: string) =>
   css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("}")
    .map((block) => block.split("{"))
    .filter((parts) => parts.length === 2)
    .map(([selector, body]) => ({ selector: selector.trim(), body }))

  it("excludes owned chart bodies from the title-matched preview sheet", () => {
   for (const { selector, body } of ruleSelectors(PREVIEW_CSS)) {
    if (!sizesTheCanvasBox(selector)) continue
    if (!geometryProperties.test(body)) continue
    expect(selector, `preview rule still sizes owned bodies: ${selector}`).toContain(OWNED)
   }
  })

  it("excludes owned chart bodies from the mobile responsive sheet", () => {
   for (const { selector, body } of ruleSelectors(MOBILE_CSS)) {
    if (!sizesTheCanvasBox(selector)) continue
    if (!geometryProperties.test(body)) continue
    expect(selector, `mobile rule still sizes owned bodies: ${selector}`).toContain(OWNED)
   }
  })

  it("stops the preview script from tagging owned chart bodies", () => {
   expect(PREVIEW_JS).toContain("data-vt-data-visual-canvas-owned")
   expect(PREVIEW_JS).toContain("isCanvasOwned")
  })
 })

 it("marks migrated module bodies so the stand-down can find them", () => {
  const moduleFrame = repoFile("src/components/TubeExplorerVisualModules.tsx")
  expect(moduleFrame).toContain('data-vt-data-visual-canvas-owned={canvasOwned ? "" : undefined}')
  // A canvas-owned frame must not also set a pixel height on the chart body.
  expect(moduleFrame).toContain("style={canvasOwned ? undefined :")
 })
})
