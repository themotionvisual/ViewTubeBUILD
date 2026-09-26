import React from "react"
import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { WidgetPreviewState } from "../WidgetPrimitives"
import {
  COMMENT_RESPONDER_PREVIEW,
  OPPORTUNITY_RADAR_PREVIEW_CANDIDATES,
  REVENUE_CHART_PREVIEW_WEEKS,
  SETTINGS_AI_PREVIEW_ITEMS,
  SETTINGS_DATA_PREVIEW_ITEMS,
} from "../widgetPreviewFixtures"

const css = readFileSync(new URL("../widgetCompoundPrimitives.css", import.meta.url), "utf8")
const settings = readFileSync(new URL("../widgets/SettingsWidget.tsx", import.meta.url), "utf8")
const opportunity = readFileSync(new URL("../widgets/OpportunityRadarWidget.tsx", import.meta.url), "utf8")
const opportunityCss = readFileSync(new URL("../widgets/OpportunityRadarWidget.css", import.meta.url), "utf8")
const comments = readFileSync(new URL("../widgets/CommentReplyWidget.tsx", import.meta.url), "utf8")
const revenue = readFileSync(new URL("../widgets/RevenueChartWidget.tsx", import.meta.url), "utf8")
const reference = readFileSync(new URL("../widgets/UIReferenceLibraryWidget.tsx", import.meta.url), "utf8")

describe("canonical WidgetPreviewState", () => {
  it("marks sample content as preview and keeps recovery explicit", () => {
    const markup = renderToStaticMarkup(
      <WidgetPreviewState
        previewReason="Sample content only."
        recoveryAction="Connect data"
        onRecover={() => {}}
      >
        <span>Example metric</span>
      </WidgetPreviewState>,
    )

    expect(markup).toContain('data-widget-state="preview"')
    expect(markup).toContain("PREVIEW")
    expect(markup).toContain("Sample content only.")
    expect(markup).toContain("Connect data")
    expect(markup).toContain("Example metric")
    expect(css).toContain(".widget-preview-state")
    expect(css).toContain("var(--vt-ink")
    expect(css).not.toContain("border:3px solid #000")
  })

  it("keeps governed fixtures generic and non-personal", () => {
    expect(SETTINGS_DATA_PREVIEW_ITEMS).toHaveLength(3)
    expect(SETTINGS_AI_PREVIEW_ITEMS).toHaveLength(3)
    expect(OPPORTUNITY_RADAR_PREVIEW_CANDIDATES.length).toBeGreaterThanOrEqual(3)
    expect(COMMENT_RESPONDER_PREVIEW.videoTitle).toContain("Example")
    expect(REVENUE_CHART_PREVIEW_WEEKS.length).toBeGreaterThanOrEqual(4)
  })

  it("migrates a representative pre-consolidation cohort", () => {
    expect(settings).toContain("WidgetPreviewState")
    expect(settings).toContain("SETTINGS_DATA_PREVIEW_ITEMS")
    expect(settings).toContain("SETTINGS_AI_PREVIEW_ITEMS")
    expect(opportunity).toContain("WidgetPreviewState")
    expect(opportunity).toContain("OPPORTUNITY_RADAR_PREVIEW_CANDIDATES")
    expect(opportunityCss).toContain(".vt-opportunity-radar > .widget-preview-state")
    expect(opportunityCss).toContain("min-height:185px")
    expect(comments).toContain("WidgetPreviewState")
    expect(comments).toContain("COMMENT_RESPONDER_PREVIEW")
    expect(revenue).toContain("WidgetPreviewState")
    expect(revenue).toContain("REVENUE_CHART_PREVIEW_WEEKS")
  })

  it("catalogues the preview primitive in the UI Reference Library", () => {
    expect(reference).toContain('familyHeading("Preview State"')
    expect(reference).toContain("CONNECT TO PERSONALIZE")
    expect(reference).toContain("key={activeCategory}")
  })
})
