// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it, vi } from "vitest"
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

  it("exposes the model, state and direct stage controls accessibly", () => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)
    const onSelect = vi.fn()
    act(() => root.render(
      <WidgetInstrument archetype="launch" label="Upload launch gantry" summary="Prepare and publish">
        <InstrumentStages stages={[
          { id: "package", label: "Package", state: "complete" },
          { id: "publish", label: "Publish", state: "active" },
        ]} activeId="publish" onSelect={onSelect} />
        <InstrumentSignals signals={[{ id: "readiness", label: "Readiness", value: "75%", intensity: .75 }]} />
        <InstrumentExplanation purpose="Prepare an upload." process="Complete each stage." result="Publish safely." />
      </WidgetInstrument>,
    ))

    expect(container.querySelector('[aria-label="Upload launch gantry"]')).not.toBeNull()
    const publish = container.querySelector<HTMLButtonElement>('[aria-current="step"]')
    expect(publish?.textContent).toContain("Publish")
    const packageButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Package"))
    packageButton?.click()
    expect(onSelect).toHaveBeenCalledWith("package")
    expect(container.textContent).toContain("HOW THIS SYSTEM WORKS")
    act(() => root.unmount())
    container.remove()
  })
})
