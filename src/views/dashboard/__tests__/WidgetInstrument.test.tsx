// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it } from "vitest"
import { InstrumentExplanation, InstrumentSignals, InstrumentStages, WidgetInstrument } from "../instruments/WidgetInstrument"
import { WIDGET_INSTRUMENT_CATALOG } from "../instruments/instrumentCatalog"
import { DASHBOARD_WIDGET_REGISTRY } from "../WidgetRegistry"

describe("WidgetInstrument", () => {
  it("defines one unique instrument for every registered widget", () => {
    const registeredIds = DASHBOARD_WIDGET_REGISTRY.map((widget) => widget.id).sort()
    const instrumentIds = WIDGET_INSTRUMENT_CATALOG.map((instrument) => instrument.widgetId).sort()
    expect(instrumentIds).toEqual(registeredIds)
    expect(new Set(instrumentIds).size).toBe(instrumentIds.length)
  })

  it("presents the system model as a non-interactive guide", () => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => root.render(
      <WidgetInstrument archetype="launch" label="Upload launch gantry" summary="Prepare and publish">
        <InstrumentStages stages={[
          { id: "package", label: "Package", state: "complete" },
          { id: "publish", label: "Publish", state: "active" },
        ]} activeId="publish" />
        <InstrumentSignals signals={[{ id: "readiness", label: "Readiness", value: "75%", intensity: .75 }]} />
        <InstrumentExplanation purpose="Prepare an upload." process="Complete each stage." result="Publish safely." />
      </WidgetInstrument>,
    ))

    expect(container.querySelector('[aria-label="Upload launch gantry"]')).not.toBeNull()
    const publish = container.querySelector<HTMLElement>('[aria-current="step"]')
    expect(publish?.textContent).toContain("Publish")
    expect(container.querySelector("button")).toBeNull()
    expect(container.textContent).toContain("HOW THIS SYSTEM WORKS")
    act(() => root.unmount())
    container.remove()
  })
})
