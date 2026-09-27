import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import ResourceLibrary from "./ResourceLibrary"

describe("Resource Library production reader", () => {
  it("renders the creator-first recommendations guide through Toolbox document modules", () => {
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
    expect(html).toContain("How YouTube Finds Viewers for Your Videos")
    expect(html).toContain("The Creator Mental Model")
    expect(html).toContain("Diagnose a Video in ViewTube")
    expect(html).toContain("vt-resource-table")
    expect(html).toContain("vt-resource-checklist")
    expect(html).toContain("vt-resource-flow")
  })

  it("renders the creator-first analytics guide with practical analytics modules", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter
        initialEntries={[
          "/resources?resource=youtube-metrics-dimensions-glossary",
        ]}
      >
        <ResourceLibrary />
      </MemoryRouter>,
    )

    expect(html).toContain("How to Read YouTube Analytics")
    expect(html).toContain("Metrics, Dimensions, Filters and Time Windows")
    expect(html).toContain("Answer Creator Questions by Combining Data")
    expect(html).toContain("vt-resource-table")
    expect(html).toContain("vt-resource-checklist")
    expect(html).toContain("vt-resource-flow")
  })
})
