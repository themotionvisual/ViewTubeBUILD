import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../WidgetRenderer"
import { WIDGET_INSTRUMENT_BY_ID } from "../instruments/instrumentCatalog"

describe("Video Asset Engine dashboard registration", () => {
  it("owns one registered responsive dashboard identity", () => {
    const widget = DASHBOARD_WIDGET_BY_ID["video-asset-engine"]

    expect(widget).toBeDefined()
    expect(widget.rendererKey).toBe("video-asset-engine")
    expect(widget.category).toBe("creation")
    expect(widget.defaultSize).toBe("half")
    expect(widget.minSize).toBe("third")
    expect(widget.maxSize).toBe("full")
    expect(widget.defaultHeight).toBe("tall")
    expect(widget.minHeight).toBe("tall")
    expect(widget.maxHeight).toBe("xtall")
    expect(widget.responsiveMode).toBe("container")
  })

  it("has renderer and instrument ownership", () => {
    expect(DASHBOARD_WIDGET_RENDERER_KEYS.has("video-asset-engine")).toBe(true)
    expect(WIDGET_INSTRUMENT_BY_ID["video-asset-engine"]).toMatchObject({
      metaphor: "Package composer",
      primaryObject: "Durable creator asset",
      primaryAction: "Inspect or hand off",
    })
  })
})
