import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import ResourceLibrary from "./ResourceLibrary"

describe("Resource Library production reader", () => {
  it("renders the first canonical Markdown resource through Toolbox document modules", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter
        initialEntries={[
          "/resources?resource=youtube-recommendations-discovery",
        ]}
      >
        <ResourceLibrary />
      </MemoryRouter>,
    )

    expect(html).toContain("RESOURCE LIBRARY")
    expect(html).toContain("How YouTube Recommendations and Discovery Work")
    expect(html).toContain("Surface Comparison Matrix")
    expect(html).toContain("vt-resource-table")
    expect(html).toContain("vt-resource-checklist")
    expect(html).toContain("vt-resource-flow")
  })

  it("renders the metrics glossary with tables, checklists and process visuals", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter
        initialEntries={[
          "/resources?resource=youtube-metrics-dimensions-glossary",
        ]}
      >
        <ResourceLibrary />
      </MemoryRouter>,
    )

    expect(html).toContain("YouTube Metrics and Dimensions Master Glossary")
    expect(html).toContain("Analytics Surface Architecture")
    expect(html).toContain("Cross-API Naming Map")
    expect(html).toContain("vt-resource-table")
    expect(html).toContain("vt-resource-checklist")
    expect(html).toContain("vt-resource-flow")
  })
})
