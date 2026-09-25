import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../WidgetRenderer"

const source = readFileSync(new URL("../widgets/ShortsMultiplierWidget.tsx", import.meta.url), "utf8")

describe("Shorts Multiplier dashboard widget", () => {
  it("is a supported registered dashboard widget", () => {
    const widget = DASHBOARD_WIDGET_BY_ID["shorts-multiplier"]
    expect(widget).toBeDefined()
    expect(widget?.status).toBe("ready")
    expect(widget?.releaseTier).toBe("supported")
    expect(widget?.defaultVisible).toBe(true)
    expect(DASHBOARD_WIDGET_RENDERER_KEYS.has("shorts-multiplier")).toBe(true)
  })

  it("uses prepared packages and published Shorts as sources", () => {
    expect(source).toContain("listVideoPackages")
    expect(source).toContain("data.canonicalRows")
    expect(source).toContain('format === "short"')
  })

  it("provides render planning, publishing schedule and packaging review", () => {
    expect(source).toContain("buildShortsMultiplierPlan")
    expect(source).toContain("MULTIPLIER OUTPUTS")
    expect(source).toContain("DESCRIPTION")
    expect(source).toContain("TAGS")
    expect(source).toContain("PUBLISH")
    expect(source).toContain("OPEN IN EDITOR")
    expect(source).toContain("OPEN PUBLISHER")
  })
})
