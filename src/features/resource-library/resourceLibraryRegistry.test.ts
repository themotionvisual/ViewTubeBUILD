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
  it("registers a creator-first YouTube recommendation guide", () => {
    const entry = RESOURCE_LIBRARY_ENTRIES.find(
      (resource) => resource.id === "youtube-recommendations-discovery",
    )

    expect(entry).toMatchObject({
      title: "How YouTube Finds Viewers for Your Videos",
      shortTitle: "Algorithm & Recommendations",
      category: "YouTube Strategy",
      difficulty: "Beginner–Intermediate",
      format: "markdown",
      status: "published",
    })
    expect(entry?.tags).toContain("recommendations")
    expect(entry?.tags).toContain("audience")
    expect(entry?.tags).toContain("packaging")
  })

  it("registers a creator-first analytics guide", () => {
    const entry = RESOURCE_LIBRARY_ENTRIES.find(
      (resource) => resource.id === "youtube-metrics-dimensions-glossary",
    )

    expect(entry).toMatchObject({
      title: "How to Read YouTube Analytics",
      shortTitle: "Analytics Guide",
      category: "Analytics",
      difficulty: "Beginner–Intermediate",
      format: "markdown",
      status: "published",
    })
    expect(entry?.tags).toContain("metrics")
    expect(entry?.tags).toContain("dimensions")
    expect(entry?.tags).toContain("filters")
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
