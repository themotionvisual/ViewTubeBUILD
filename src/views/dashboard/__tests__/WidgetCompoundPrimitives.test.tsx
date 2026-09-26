import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  WidgetBadge,
  WidgetCalendarGrid,
  WidgetChecklistProgress,
  WidgetDataGrid,
  WidgetSectionBand,
  WidgetVideoMiniCard,
  WidgetSplitCounterBadge,
  WidgetSpeechBubble,
} from "../WidgetPrimitives"

const css = readFileSync(new URL("../widgetCompoundPrimitives.css", import.meta.url), "utf8")
const reference = readFileSync(new URL("../widgets/UIReferenceLibraryWidget.tsx", import.meta.url), "utf8")

describe("compound widget primitives from Creator Operations donor", () => {
  it("renders full-bleed monochromatic section bands in all three canonical tones", () => {
    const markup = renderToStaticMarkup(
      <>
        <WidgetSectionBand tone="default">Lead</WidgetSectionBand>
        <WidgetSectionBand tone="primary">Proposal</WidgetSectionBand>
        <WidgetSectionBand tone="secondary">Paid</WidgetSectionBand>
      </>,
    )
    expect(markup.match(/widget-section-band/g)).toHaveLength(3)
    expect(markup).toContain("is-tone-default")
    expect(markup).toContain("is-tone-primary")
    expect(markup).toContain("is-tone-secondary")
    expect(markup).toContain("is-edge-full")
    expect(css).toContain("var(--widget-ink")
    expect(css).toContain("margin-inline:calc(-1 * var(--vt-widget-body-inset")
    expect(css).toContain("font-size:18px")
    expect(css).toContain("background:color-mix(in srgb,var(--widget-color) 18%,white)")
    expect(css).toContain("background:color-mix(in srgb,var(--widget-color) 55%,white)")
  })

  it("renders a semantic text/badge data grid", () => {
    const markup = renderToStaticMarkup(
      <WidgetDataGrid
        ariaLabel="Audience segments"
        columns={[
          { key: "segment", label: "Segment" },
          { key: "signal", label: "Signal" },
          { key: "status", label: "Status" },
        ]}
        rows={[
          {
            id: "superfans",
            cells: {
              segment: "History superfans",
              signal: "3+ longform comments",
              status: <WidgetBadge status="positive">Active</WidgetBadge>,
            },
          },
        ]}
      />,
    )
    expect(markup).toContain('role="table"')
    expect(markup).toContain('role="columnheader"')
    expect(markup).toContain('role="cell"')
    expect(markup).toContain("History superfans")
    expect(markup).toContain("Active")
  })

  it("computes checklist progress from checked ids while keeping canonical checkboxes", () => {
    const markup = renderToStaticMarkup(
      <WidgetChecklistProgress
        label="Completion"
        items={[
          { id: "a", label: "Revise thumbnail" },
          { id: "b", label: "Reply to questions" },
          { id: "c", label: "Finish script" },
          { id: "d", label: "Approve deliverables" },
        ]}
        checkedIds={["b", "c"]}
        onChange={() => {}}
      />,
    )
    expect(markup).toContain("widget-checklist-progress")
    expect(markup.match(/role="checkbox"/g)).toHaveLength(4)
    expect(markup).toContain('aria-valuenow="2"')
    expect(markup).toContain("50%")
  })

  it("renders the weekly grid calendar with event controls", () => {
    const markup = renderToStaticMarkup(
      <WidgetCalendarGrid
        ariaLabel="Production week"
        days={[
          { id: "mon", label: "Mon 20", events: [{ id: "research", label: "Research", tone: "primary" }] },
          { id: "tue", label: "Tue 21", events: [{ id: "script", label: "Script draft", tone: "secondary" }] },
        ]}
      />,
    )
    expect(markup).toContain('role="grid"')
    expect(markup).toContain("widget-calendar-day")
    expect(markup).toContain("widget-calendar-event")
    expect(markup).toContain("Research")
  })

  it("promotes Comment Responder donor pieces into shared compound primitives", () => {
    const markup = renderToStaticMarkup(
      <>
        <WidgetVideoMiniCard title="Austerlitz" thumbnail="thumb.jpg" meta="30:04 · 73,910 views" />
        <WidgetSplitCounterBadge icon={<span>Like</span>} value={184} label="184 likes" height={24} tone="primary" />
        <WidgetSpeechBubble>Big supporter</WidgetSpeechBubble>
      </>,
    )
    expect(markup).toContain("widget-video-mini-card")
    expect(markup).toContain("widget-split-counter-badge")
    expect(markup).toContain('aria-label="184 likes"')
    expect(markup).toContain("widget-speech-bubble")
    expect(css).toContain(".widget-video-mini-card")
    expect(css).toContain(".widget-split-counter-badge")
    expect(css).toContain(".widget-speech-bubble-tail")
  })

  it("registers the compound primitive family in the UI Reference Library", () => {
    expect(reference).toContain('"compound"')
    expect(reference).toContain("WidgetSectionBand")
    expect(reference).toContain("WidgetDataGrid")
    expect(reference).toContain("WidgetChecklistProgress")
    expect(reference).toContain("WidgetCalendarGrid")
    expect(reference).toContain("Compound Workflow Primitives")
    expect(reference).toContain(">Lead</WidgetSectionBand>")
    expect(reference).toContain(">Proposal</WidgetSectionBand>")
    expect(reference).toContain(">Active</WidgetSectionBand>")
    expect(reference).toContain(">Paid</WidgetSectionBand>")
  })
})
