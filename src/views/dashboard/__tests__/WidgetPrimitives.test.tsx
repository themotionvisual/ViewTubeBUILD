import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  WidgetChoice,
  WidgetDisclosure,
  WidgetDropzone,
  WidgetField,
  WidgetHeaderToggle,
  WidgetHeaderStepper,
  WidgetDivider,
  WidgetFooter,
  WidgetScrollArea,
  WidgetSection,
  WidgetSelect,
  WidgetSplitButton,
  WidgetStepTabs,
  WidgetStatePanel,
  WidgetSwitch,
  WidgetTag,
  WidgetTooltip,
  WidgetWorkflowMain,
} from "../WidgetPrimitives"
import { resolveWidgetViewportSegment } from "../widgetScrollGeometry"

describe("widget viewport indicator geometry", () => {
  it.each([
    ["top", 0, 0],
    ["middle", 12.5, 12.5],
    ["bottom", 25, 25],
  ])("maps a 75%% visible viewport at the %s", (_position, scrollTop, expectedTop) => {
    const metrics = resolveWidgetViewportSegment({
      clientHeight: 75,
      scrollHeight: 100,
      scrollTop,
      controllerHeight: 100,
    })

    expect(metrics).toMatchObject({ height: 75, top: expectedTop, visibleRatio: 0.75, hasOverflow: true })
  })

  it("maps smaller viewports and hides the controller when all content is visible", () => {
    expect(resolveWidgetViewportSegment({
      clientHeight: 25,
      scrollHeight: 100,
      scrollTop: 75,
      controllerHeight: 100,
    })).toMatchObject({ height: 25, top: 75, visibleRatio: 0.25, scrollRatio: 1, hasOverflow: true })

    expect(resolveWidgetViewportSegment({
      clientHeight: 100,
      scrollHeight: 100,
      scrollTop: 0,
      controllerHeight: 100,
    })).toMatchObject({ height: 100, top: 0, visibleRatio: 1, hasOverflow: false })
  })
})

describe("shared widget layout primitives", () => {
  it("renders inset and full-bleed structure through one contract", () => {
    const markup = renderToStaticMarkup(
      <WidgetScrollArea ariaLabel="Recommendations" edge="full">
        <WidgetSection edge="inset">Controls</WidgetSection>
        <WidgetDivider edge="full" />
        <WidgetFooter surface="subtle">Actions</WidgetFooter>
      </WidgetScrollArea>,
    )

    expect(markup).toContain("widget-scroll-area is-vertical is-full")
    expect(markup).toContain('role="region"')
    expect(markup).toContain('aria-label="Recommendations"')
    expect(markup).toContain("widget-section is-inset is-transparent")
    expect(markup).toContain("widget-divider is-full")
    expect(markup).toContain("widget-footer is-subtle")
  })

  it("renders a non-scrolling layout without scrollbar chrome when scrolling is disabled", () => {
    const markup = renderToStaticMarkup(
      <WidgetScrollArea ariaLabel="New comments" enabled={false}>New comment</WidgetScrollArea>,
    )

    expect(markup).toContain('class="widget-scroll-static"')
    expect(markup).not.toContain("widget-scroll-controller")
    expect(markup).not.toContain('role="region"')
  })

  it("reserves a flexible workflow main region without widget-local sizing", () => {
    const markup = renderToStaticMarkup(
      <WidgetWorkflowMain className="publishing-main">Metadata</WidgetWorkflowMain>,
    )

    expect(markup).toContain('class="widget-workflow-main publishing-main"')
  })
})

describe("WidgetStatePanel", () => {
  it("exposes standardized status and recoverable action semantics", () => {
    const markup = renderToStaticMarkup(
      <WidgetStatePanel
        state={{
          status: "error",
          data: null,
          message: "Analytics could not be loaded.",
          recoveryAction: "Try again",
        }}
        onRecover={() => {}}
      />,
    )

    expect(markup).toContain('data-widget-state="error"')
    expect(markup).toContain('role="alert"')
    expect(markup).toContain("Analytics could not be loaded.")
    expect(markup).toContain("Try again")
  })
})

describe("shared widget form primitives", () => {
  it("provides canonical field, disclosure, choice, and select surfaces", () => {
    const markup = renderToStaticMarkup(
      <div>
        <WidgetField label="Title"><input /></WidgetField>
        <WidgetDisclosure title="Additional options"><p>Contents</p></WidgetDisclosure>
        <WidgetChoice label="Allow embedding" checked onChange={() => {}} />
        <WidgetSelect
          label="Category"
          value="education"
          onChange={() => {}}
          options={[{ value: "education", label: "Education" }]}
        />
      </div>,
    )

    expect(markup).toContain('class="widget-control-field"')
    expect(markup).toContain('class="widget-control-disclosure"')
    expect(markup).not.toContain("is-green")
    expect(markup).not.toContain("is-blue")
    expect(markup).not.toContain("is-pink")
    expect(markup).not.toContain("<details open")
    expect(markup).toContain('class="widget-control-choice"')
    expect(markup).toContain('class="widget-select-trigger"')
  })

  it("renders one canonical step-tab treatment for multi-step widget workflows", () => {
    const markup = renderToStaticMarkup(
      <WidgetStepTabs
        label="Publishing sections"
        value="details"
        onChange={() => {}}
        items={[
          { id: "details", label: "Details" },
          { id: "options", label: "Options" },
          { id: "ads", label: "Ad suitability" },
        ]}
      />,
    )

    expect(markup).toContain('class="widget-step-tabs"')
    expect(markup).toContain('aria-current="step"')
    expect(markup).toContain("Ad suitability")
  })

  it("renders one canonical header-toggle treatment for compact widget modes", () => {
    const markup = renderToStaticMarkup(
      <WidgetHeaderToggle
        label="Realtime view range"
        value="48h"
        onChange={() => {}}
        items={[
          { id: "48h", label: "48 hr" },
          { id: "60m", label: "60 mn" },
        ]}
      />,
    )

    expect(markup).toContain('class="widget-header-toggle"')
    expect(markup).toContain('class="widget-header-toggle-indicator"')
    expect(markup).toContain('--widget-header-toggle-index:0')
    expect(markup).toContain('--widget-header-toggle-count:2')
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain("48 hr")
    expect(markup).toContain("60 mn")
  })

  it("uses the canonical header treatment for stepped time windows", () => {
    const markup = renderToStaticMarkup(
      <WidgetHeaderStepper
        label="Channel overview time window"
        value="28 days"
        onPrevious={() => {}}
        onNext={() => {}}
      />,
    )

    expect(markup).toContain("widget-header-toggle widget-header-stepper")
    expect(markup).toContain("28 days")
    expect(markup).toContain('aria-label="Previous Channel overview time window"')
    expect(markup).toContain('aria-label="Next Channel overview time window"')
  })

  it("renders file selection through the shared widget dropzone", () => {
    const markup = renderToStaticMarkup(
      <WidgetDropzone
        icon={<span>Icon</span>}
        endIcon={<span>Upload</span>}
        title="Choose source video"
        detail="Drop a video here or browse files"
        hasValue={false}
      />,
    )

    expect(markup).toContain('class="widget-dropzone"')
    expect(markup).toContain("Choose source video")
    expect(markup).toContain("Drop a video here or browse files")
  })

  it("exposes the shared split action, switch, removable tag, and tooltip contracts", () => {
    const markup = renderToStaticMarkup(
      <div>
        <WidgetSplitButton icon={<span>Icon</span>} tone="primary" size="large" width="wide">Export MP4</WidgetSplitButton>
        <WidgetSwitch label="Monetization" checked onChange={() => {}} />
        <WidgetTag onRemove={() => {}}>Analytics</WidgetTag>
        <WidgetTooltip content="CTR equals clicks divided by impressions"><button type="button">Hover me</button></WidgetTooltip>
      </div>,
    )

    expect(markup).toContain("widget-split-button is-primary is-large is-wide")
    expect(markup).toContain('role="switch"')
    expect(markup).toContain('aria-label="Remove Analytics tag"')
    expect(markup).toContain('role="tooltip"')
    expect(markup).toContain("aria-describedby=")
  })

  it("keeps the split-button icon and label as distinct reusable regions", () => {
    const markup = renderToStaticMarkup(
      <WidgetSplitButton icon={<span>Icon</span>}>Open Comment on YouTube</WidgetSplitButton>,
    )

    expect(markup).toContain("widget-split-button-icon")
    expect(markup).toContain("widget-split-button-label")
  })
})
