import { describe, expect, it } from "vitest"
import {
  RESOURCE_LIBRARY_ENTRIES,
  parseResourceDocument,
} from "./resourceLibraryRegistry"

const SAMPLE_DOCUMENT = `---
title: Sample Resource
category: Strategy
---

# Sample Resource

Intro paragraph.

## First Section

A useful section.

## Second Section

\`\`\`mermaid
flowchart LR
  A --> B
\`\`\`
`

describe("resource library registry", () => {
  it("registers the YouTube recommendations guide as the first creator-facing resource", () => {
    const entry = RESOURCE_LIBRARY_ENTRIES.find(
      (resource) => resource.id === "youtube-recommendations-discovery",
    )

    expect(entry).toMatchObject({
      title: "How YouTube Recommendations and Discovery Work",
      category: "YouTube Strategy",
      format: "markdown",
      status: "published",
    })
    expect(entry?.tags).toContain("recommendations")
    expect(entry?.tags).toContain("discovery")
  })


  it("registers the metrics and dimensions glossary as the second creator-facing resource", () => {
    const entry = RESOURCE_LIBRARY_ENTRIES.find(
      (resource) => resource.id === "youtube-metrics-dimensions-glossary",
    )

    expect(entry).toMatchObject({
      title: "YouTube Metrics and Dimensions Master Glossary",
      category: "Analytics",
      format: "markdown",
      status: "published",
    })
    expect(entry?.tags).toContain("metrics")
    expect(entry?.tags).toContain("dimensions")
    expect(entry?.tags).toContain("youtube-analytics-api")
  })

  it("parses canonical Markdown into metadata and SubToolbox-sized sections", () => {
    const parsed = parseResourceDocument(SAMPLE_DOCUMENT)

    expect(parsed.frontmatter.title).toBe("Sample Resource")
    expect(parsed.title).toBe("Sample Resource")
    expect(parsed.intro).toContain("Intro paragraph.")
    expect(parsed.sections.map((section) => section.title)).toEqual([
      "First Section",
      "Second Section",
    ])
    expect(parsed.sections[1]?.body).toContain("flowchart LR")
  })
})
