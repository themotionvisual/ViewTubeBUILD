import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("../widgets/FlightCheckWidget.tsx", import.meta.url), "utf8")
const css = readFileSync(new URL("../widgets/FlightCheckWidget.css", import.meta.url), "utf8")

describe("Publishing Command compact package-focused controls", () => {
  it("lets the user select a specific package/video context", () => {
    expect(source).toContain("WidgetSizedSelect")
    expect(source).toContain("selectedPackageId")
    expect(source).toContain("projectId")
  })

  it("uses canonical checkboxes and supports adding manual tasks", () => {
    expect(source).toContain("WidgetCheckbox")
    expect(source).toContain("WidgetTextInput")
    expect(source).toContain("ADD TASK")
    expect(source).not.toContain('{item.done ? "✓" : "×"}')
  })

  it("uses compact checklist rows rather than tall touch-only list items", () => {
    expect(css).toContain(".vt-publishing-command__task-row")
    expect(css).toContain("min-height:28px")
    expect(css).not.toContain(".vt-publishing-command__manual-item{min-height:44px}")
  })
})
