import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, it, expect, vi } from "vitest"
import { ScriptStudioWidget } from "../ScriptStudioWidget"

const mockWidget: any = {
  id: "script-studio",
  title: "Script Studio",
  subtitle: "AI script editor with runtime estimation and voice matching",
  category: "creation",
  defaultSize: "half",
  minSize: "third",
  maxSize: "full",
  defaultHeight: "tall",
  minHeight: "medium",
  maxHeight: "xtall",
  headerColor: "#A467F4",
  iconRailColor: "#FFFFFF",
  dependency: ["none"],
  status: "ready",
}

const mockInstance: any = {
  id: "script-studio",
  widgetId: "script-studio",
  size: "half",
  height: "tall",
  collapsed: false,
}

describe("ScriptStudioWidget", () => {
  it("renders 3-way title section toggle, title input, saved scripts dropdown, New/Save buttons, target meter, and export actions", () => {
    const html = renderToStaticMarkup(
      <ScriptStudioWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(html).toContain("Script Studio")
    expect(html).toContain("Write / Edit")
    expect(html).toContain("AI Refine")
    expect(html).toContain("AI Generate")
    expect(html).toContain("Script Title...")
    expect(html).toContain("New")
    expect(html).toContain("Save")
    expect(html).toContain("Target:")
    expect(html).toContain("Readability")
    expect(html).toContain("Export Text")
    expect(html).toContain("To Description")
    expect(html).toContain("Runtime")
    expect(html).toContain("Voice match")
  })
})
