import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID, WIDGET_DESCRIPTIONS } from "../WidgetRegistry"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../WidgetRenderer"
import { WIDGET_INSTRUMENT_BY_ID } from "../instruments/instrumentCatalog"

describe("Opportunity Radar dashboard registration", () => {
  it("owns one registered responsive dashboard identity", () => {
    const widget = DASHBOARD_WIDGET_BY_ID["opportunity-radar"]

    expect(widget).toBeDefined()
    expect(widget.rendererKey).toBe("opportunity-radar")
    expect(widget.category).toBe("analytics")
    expect(widget.defaultSize).toBe("half")
    expect(widget.minSize).toBe("third")
    expect(widget.maxSize).toBe("full")
    expect(widget.defaultHeight).toBe("tall")
    expect(widget.minHeight).toBe("medium")
    expect(widget.maxHeight).toBe("xtall")
    expect(widget.responsiveMode).toBe("container")
    expect(widget.releaseTier).toBe("supported")
  })

  it("has renderer, instrument, and help ownership", () => {
    expect(DASHBOARD_WIDGET_RENDERER_KEYS.has("opportunity-radar")).toBe(true)
    expect(WIDGET_INSTRUMENT_BY_ID["opportunity-radar"]).toMatchObject({
      archetype: "radar",
      metaphor: "Opportunity field",
      primaryObject: "Evidence-backed opportunity",
      primaryAction: "Investigate opportunity",
    })
    expect(WIDGET_DESCRIPTIONS["opportunity-radar"]?.short).toContain("OPPORTUNIT")
  })
})
