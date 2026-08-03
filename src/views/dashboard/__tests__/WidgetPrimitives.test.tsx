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
  WidgetSelect,
  WidgetStepTabs,
  WidgetStatePanel,
} from "../WidgetPrimitives"

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
})
