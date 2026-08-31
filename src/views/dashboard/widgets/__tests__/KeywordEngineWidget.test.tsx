import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, it, expect, vi } from "vitest"
import { KeywordEngineWidget } from "../KeywordEngineWidget"

const mockWidget: any = {
  id: "keyword-engine",
  title: "Keyword Engine",
  subtitle: "Top keywords extracted from video metadata and performance",
  category: "analytics",
  defaultSize: "third",
  minSize: "quarter",
  maxSize: "full",
  defaultHeight: "tall",
  minHeight: "short",
  maxHeight: "xtall",
  headerColor: "#40C6E9",
  iconRailColor: "#FFFFFF",
  dependency: ["none"],
  status: "ready",
}

const mockInstance: any = {
  id: "keyword-engine",
  widgetId: "keyword-engine",
  size: "third",
  height: "tall",
  collapsed: false,
}

const mockData: any = {
  canonicalRows: [
    {
      title: "French Hussar Cavalry Battle Tactics",
      views: 2272,
      tags: ["hussar", "cavalry", "french empire", "austerlitz"],
    },
    {
      title: "Inside The Saddle: French Cavalry Gear",
      views: 2272,
      tags: ["french", "saddle", "cavalry"],
    },
    {
      title: "Emperors and Generals at Austerlitz",
      views: 1572,
      tags: ["emperors", "napoleon", "austerlitz"],
    },
    {
      title: "Marshal Soult and His Men in Action",
      views: 1072,
      tags: ["soult", "generals", "men"],
    },
  ],
}

describe("KeywordEngineWidget", () => {
  it("extracts and calculates keywords dynamically from canonical video titles and metadata", () => {
    const html = renderToStaticMarkup(
      <KeywordEngineWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
        data={mockData}
      />
    )

    expect(html).toContain("Keyword Engine")
    expect(html).toContain("Top Keywords")
    expect(html).toContain("Avg Views")
    // Extracted keywords from real titles/tags
    expect(html).toContain("FRENCH")
    expect(html).toContain("CAVALRY")
    expect(html).toContain("AUSTERLITZ")
    expect(html).toContain("2,272")
  })
})
