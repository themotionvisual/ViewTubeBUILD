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
})
