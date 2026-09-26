import { readFileSync } from "node:fs"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  WidgetLeftSplitBadge,
  WidgetToast,
  WidgetAlphabeticalTag,
  WidgetActionButton,
  WidgetBadge,
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
  WIDGET_BADGE_SPECTRUM,
  resolveAlphabeticalSpectrumSlot,
  resolveAlphabeticalSpectrumHue,
  WidgetIconButton,
  WidgetSizedButton,
  WidgetSizedSelect,
  WidgetVideoSelect,
  WidgetVideoMiniCard,
  WidgetSplitCounterBadge,
  WidgetSpeechBubble,
  WidgetStepper,
  WidgetSplitCounter,
  WidgetTinySpectrumIcon,
  WIDGET_TINY_ICON_SET,
  WIDGET_METRIC_ICON_SET,
  WidgetAccentRailModule,
  WidgetIconTitleModule,
  WidgetRainbowDivider,
  WidgetRainbowPanel,
  WidgetModuleHeader,
  WidgetModuleFrame,
} from "../WidgetPrimitives"
import { VT_SPECTRUM_PALETTE_06 } from "../../../styles/toolboxPalette"
import { resolveWidgetViewportSegment } from "../widgetScrollGeometry"

const variantsCss = readFileSync(new URL("../widgetPrimitiveVariants.css", import.meta.url), "utf8")
const widgetSystemCss = readFileSync(new URL("../toolboxWidgetSystem.css", import.meta.url), "utf8")
const matrixCss = readFileSync(new URL("../widgetMatrixPrimitives.css", import.meta.url), "utf8")
const tonesCss = readFileSync(new URL("../widgetPrimitiveTones.css", import.meta.url), "utf8")
const videoSelectCss = readFileSync(new URL("../widgetVideoSelectButtonScroll.css", import.meta.url), "utf8")
const extensionSource = readFileSync(new URL("../WidgetPrimitiveExtensions.tsx", import.meta.url), "utf8")
const referenceSource = readFileSync(new URL("../widgets/UIReferenceLibraryWidget.tsx", import.meta.url), "utf8")

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

describe("adaptive sized-control typography", () => {
  it("marks 24px controls for opt-in 16-to-10 text fitting", () => {
    const markup = renderToStaticMarkup(
      <WidgetSizedButton height={24} textFit="adaptive">Educational</WidgetSizedButton>,
    )
    expect(markup).toContain("is-height-24")
    expect(markup).toContain("vt-text-fit-adaptive")
  })

  it("keeps fixed typography as the default", () => {
    const markup = renderToStaticMarkup(
      <WidgetSizedButton height={24}>Educational</WidgetSizedButton>,
    )
    expect(markup).not.toContain("vt-text-fit-adaptive")
  })

  it("allows canonical action buttons to opt into the same adaptive 24px text fit", () => {
    const markup = renderToStaticMarkup(
      <WidgetActionButton height={24} textFit="adaptive">Auto-fill Director</WidgetActionButton>,
    )
    expect(markup).toContain("widget-action")
    expect(markup).toContain("is-height-24")
    expect(markup).toContain("vt-text-fit-adaptive")
  })

  it("owns the final 24px adaptive cascade after fixed-size compatibility rules", () => {
    expect(variantsCss).toContain("Final adaptive text-fit ownership")
    expect(variantsCss).toContain("--vt-primitive-font: clamp(10px, 2.8cqi, 16px)")
    expect(variantsCss).toContain("white-space: nowrap !important;")
  })
})

describe("shared widget form primitives", () => {
  it("maps A–Z across all 12 canonical spectrum colors", () => {
    expect(resolveAlphabeticalSpectrumSlot("A")).toBe(0)
    expect(resolveAlphabeticalSpectrumSlot("N analytics")).toBe(6)
    expect(resolveAlphabeticalSpectrumSlot("Zebra")).toBe(11)
    expect(resolveAlphabeticalSpectrumSlot("123")).toBe(0)

    const markup = renderToStaticMarkup(
      <>{WIDGET_BADGE_SPECTRUM.map((tone) => (
        <WidgetAlphabeticalTag key={tone} label={tone} tone={tone} />
      ))}</>,
    )

    expect(markup.match(/class="vt-spectrum-badge/g)).toHaveLength(12)
    VT_SPECTRUM_PALETTE_06.forEach((hue) => {
      expect(markup).toContain(`--vt-spectrum-badge-stroke:${hue}`)
    })
  })

  it("assigns A-Z distinct continuous-spectrum hues", () => {
    const hues = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(resolveAlphabeticalSpectrumHue)
    expect(new Set(hues).size).toBe(26)
  })

  it("applies the shared height contract to badges and square icon buttons", () => {
    const markup = renderToStaticMarkup(
      <div>
        <WidgetBadge tone="cyan" height={38}>Cyan badge</WidgetBadge>
        <WidgetIconButton icon={<span>R</span>} label="Reset" height={24} tone="secondary" />
      </div>,
    )

    expect(markup).toContain("vt-spectrum-badge is-height-38")
    expect(markup).toContain('aria-label="Reset"')
    expect(markup).toMatch(
      /class="[^"]*\bwidget-icon-button\b[^"]*\bvt-sized-control\b[^"]*\bis-height-24\b[^"]*\bis-tone-secondary\b/,
    )
  })

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

    expect(markup).toContain('class="widget-header-toggle is-intrinsic"')
    expect(markup).toContain('class="widget-header-toggle-indicator"')
    expect(markup).toContain('data-active-index="0"')
    expect(markup).toContain('aria-pressed="true"')
    expect(widgetSystemCss).toContain("--widget-header-toggle-active-width")
    expect(widgetSystemCss).toContain("--widget-header-toggle-active-left")
    expect(widgetSystemCss).toContain("transition: transform 180ms")
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
    expect(renderToStaticMarkup(<WidgetSplitButton icon={<span>Icon</span>} multiline>Suggest video</WidgetSplitButton>)).toContain("is-multiline")
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

describe("expanded widget compound primitives", () => {
  it("keeps the default stepper middle cell compact for two digits", () => {
    const markup = renderToStaticMarkup(
      <WidgetStepper label="Quantity" value={99} onChange={() => {}} min={0} max={99} />,
    )
    expect(markup).toContain("widget-stepper-value")
    expect(matrixCss).toContain("width: 2.7ch")
    expect(matrixCss).toContain("max-width: 2.7ch")
  })

  it("renders the split-left counter as two chevron controls plus a compact value cell", () => {
    const markup = renderToStaticMarkup(
      <WidgetSplitCounter label="Outputs" value={12} onChange={() => {}} min={0} max={99} />,
    )
    expect(markup).toContain("widget-split-counter-controls")
    expect(markup).toContain('aria-label="Increase Outputs"')
    expect(markup).toContain('aria-label="Decrease Outputs"')
    expect(markup).toContain("widget-split-counter-value")
    expect(matrixCss).toContain("grid-template-rows: repeat(2, minmax(0, 1fr))")
  })

  it("publishes 50 general icons plus 12 canonical metric icons", () => {
    expect(Object.keys(WIDGET_TINY_ICON_SET)).toHaveLength(62)
    expect(WIDGET_METRIC_ICON_SET).toHaveLength(12)
    expect(WIDGET_METRIC_ICON_SET.map((item) => item.spectrum)).toEqual(WIDGET_BADGE_SPECTRUM)
    expect(WIDGET_METRIC_ICON_SET.map((item) => item.color)).toEqual(VT_SPECTRUM_PALETTE_06)
    const markup = renderToStaticMarkup(
      <WidgetTinySpectrumIcon name="metricViews" spectrum="rose" label="Views" />,
    )
    expect(markup).toContain("widget-tiny-spectrum-icon")
    expect(markup).toContain('aria-label="Views"')
  })

  it("renders edge-to-edge rail, icon-title, rainbow, and generic module compounds", () => {
    const markup = renderToStaticMarkup(
      <div>
        <WidgetAccentRailModule spectrum="rose" title="Priority" detail="Today" />
        <WidgetIconTitleModule spectrum="cyan" icon={<span>Icon</span>} title="Account" subtitle="Connected source" />
        <WidgetRainbowPanel>System map</WidgetRainbowPanel>
        <WidgetRainbowDivider />
        <WidgetModuleFrame
          header={<WidgetModuleHeader title="Module" controls={<WidgetSizedButton height={24}>Apply</WidgetSizedButton>} />}
        >
          Body
        </WidgetModuleFrame>
      </div>,
    )
    expect(markup).toContain("widget-accent-rail-module")
    expect(markup).toContain("widget-icon-title-module")
    expect(markup).toContain("widget-rainbow-panel")
    expect(markup).toContain("widget-rainbow-divider")
    expect(markup).toContain("widget-module-header-controls")
    expect(matrixCss).toContain("inset-inline: 0")
  })

  it("uses one-row split-left video search and scrollbar-based dropdowns", () => {
    expect(extensionSource).toContain('<WidgetSearchInput className="widget-video-select-menu-search-row" height={height}')
    expect(extensionSource).not.toContain("widget-video-select-scroll-button")
    expect(videoSelectCss).toContain("scrollbar-color")
    expect(videoSelectCss).toContain("::-webkit-scrollbar")
    expect(variantsCss).toContain("height: var(--vt-primitive-height, 38px)")
    expect(variantsCss).toContain(".widget-select-content .widget-select-item")
  })

  it("binds each portalled standard dropdown to its own height, type and icon metrics", () => {
    expect(extensionSource).toContain("SELECT_MENU_METRICS")
    expect(extensionSource).toContain("18:{font:8,icon:12")
    expect(extensionSource).toContain("24:{font:16,icon:18")
    expect(extensionSource).toContain("32:{font:21,icon:24")
    expect(extensionSource).toContain("38:{font:26,icon:29")
    expect(extensionSource).toContain("contentStyle={selectMenuStyle(height)}")
    expect(variantsCss).toContain("height: var(--vt-primitive-height, 32px) !important")
    expect(variantsCss).toContain("font-size: var(--vt-primitive-font, 11px) !important")
    expect(variantsCss).toContain("width: var(--vt-primitive-icon, 18px) !important")
    expect(variantsCss).toContain("stroke-width: var(--vt-primitive-icon-stroke, 2.5) !important")
  })

  it("uses alternating full-width video rows with centered media and badge metadata", () => {
    expect(extensionSource).toContain("widget-video-select-option-media")
    expect(extensionSource).toContain("widget-video-select-duration")
    expect(extensionSource).toContain("widget-video-select-views")
    expect(variantsCss).toContain("border: 0")
    expect(variantsCss).toContain("border-radius: 0")
    expect(variantsCss).toContain("justify-self: stretch")
    expect(variantsCss).toContain("-webkit-line-clamp: 3")
    expect(variantsCss).toContain(".widget-video-select-option:nth-child(even)")
    expect(variantsCss).toContain(".widget-video-select-option:nth-child(odd)")
    expect(variantsCss).toContain("72%, #fff")
    expect(variantsCss).toContain("background: transparent")
    expect(variantsCss).toContain("color-mix(in srgb, #fff 86%")
    expect(variantsCss).toContain("height: 14px")
  })

  it("uses a stacked VIDEO + chevron split-left bay and never a right-side video chevron", () => {
    expect(extensionSource).toContain("widget-video-select-trigger-selector")
    expect(extensionSource).toContain("<span>VIDEO</span>")
    expect(extensionSource).not.toContain("widget-video-select-trigger-chevron")
    expect(extensionSource).not.toContain("widget-video-select-trigger-icon")
    expect(variantsCss).toContain("grid-template-rows: 1fr 1fr")
    expect(variantsCss).toContain("white-space: normal")
    expect(variantsCss).toContain("text-overflow: clip")
  })

  it("keeps the VIDEO split bay mathematically square while scaling label and chevron", () => {
    expect(variantsCss).toContain("--widget-video-split-bay: calc(var(--vt-primitive-height")
    expect(variantsCss).not.toContain("--widget-video-split-bay: 40px")
    expect(variantsCss).not.toContain("--widget-video-split-bay: 48px")
    expect(variantsCss).not.toContain("--widget-video-split-bay: 54px")
    expect(variantsCss).toContain("span:first-child { font-size: 8px")
    expect(variantsCss).toContain("span:first-child { font-size: 10px")
    expect(variantsCss).toContain("span:first-child { font-size: 12px")
  })

  it("makes the video menu search and option rows truly edge-to-edge", () => {
    expect(extensionSource).toContain('className="widget-video-select-menu-search-row"')
    expect(extensionSource).toContain('height={height} tone="primary"')
    expect(variantsCss).toContain(".widget-video-select-menu.is-portalled")
    expect(variantsCss).toContain("padding: 0")
    expect(variantsCss).toContain(".widget-video-select-menu.is-portalled .widget-video-select-menu-search-row")
    expect(variantsCss).toContain("border-radius: 0")
    expect(variantsCss).toContain(".widget-video-select-menu.is-portalled .widget-video-select-option")
    expect(variantsCss).toContain("grid-template-columns: calc(var(--vt-primitive-height, 38px) * 1.7778)")
    expect(variantsCss).toContain(".widget-video-select-option-media")
    expect(variantsCss).toContain("align-self: stretch")
    expect(variantsCss).toContain("height: 100%")
    expect(variantsCss).toContain("min-width: 100%")
    expect(videoSelectCss).not.toContain("border-bottom:")
  })

  it("frames video thumbnails in VT ink and moves duration one pixel up and left", () => {
    expect(variantsCss).toContain("border-inline-end: 1.5px solid var(--vt-tone-ink")
    expect(variantsCss).toContain(".widget-video-select-menu.is-portalled .widget-video-select-duration")
    expect(variantsCss).toContain("right: 2px")
    expect(variantsCss).toContain("bottom: 0")
  })

  it("manifests every Navigation primitive inside Widget Module headers", () => {
    expect(referenceSource).toContain('title="Channel Overview"')
    expect(referenceSource).toContain('label="Channel overview time window"')
    expect(referenceSource).toContain('title="Comment Responder"')
    expect(referenceSource).toContain('label="Comment responder view example"')
    expect(referenceSource).toContain('label="Comment pagination example"')
    expect(referenceSource).toContain('title="Publishing Workflow"')
    expect(referenceSource).toContain('label="Header publishing stages"')
    expect(referenceSource).toContain('title="Auto Chapters"')
    expect(referenceSource).toContain('label="Automatic Chapters"')
    expect(referenceSource).toContain('title="Embed Permission"')
    expect(referenceSource).toContain('label="Allow Embedding"')
    expect(referenceSource).toContain('title="Reply Mode"')
    expect(referenceSource).toContain('name="module-reply-mode"')
  })

  it("uses placeholder filler copy so focus starts the caret at the left edge", () => {
    expect(extensionSource).toContain('placeholder="Type…"')
    expect(referenceSource).toContain('placeholder="Sample title input"')
    expect(referenceSource).toContain('const [textValue, setTextValue] = useState("")')
    expect(tonesCss).toContain("::placeholder")
    expect(tonesCss).toContain("opacity: .12")
  })

  it("groups the UI Reference by size then tone with optional equal-width grid mode", () => {
    expect(referenceSource).toContain('"size", label: "SIZE"')
    expect(referenceSource).toContain("sizeGridMode")
    expect(referenceSource).toContain("CONTROL_HEIGHTS.map((height)")
    expect(referenceSource).toContain("CONTROL_TONES.map((tone)")
    expect(variantsCss).toContain(".widget-reference-size-flow.is-grid")
    expect(variantsCss).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))")
    expect(referenceSource).not.toContain('familyHeading("Compact Steppers"')
  })

  it("scales split-counter chevrons with the canonical icon token", () => {
    expect(matrixCss).toContain(".widget-split-counter-controls svg")
    expect(matrixCss).toContain("width: min(var(--vt-primitive-icon), var(--vt-primitive-font)")
    expect(matrixCss).toContain("height: min(var(--vt-primitive-icon), var(--vt-primitive-font)")
  })

  it("gives secondary controls a structurally different inverse color construction", () => {
    expect(matrixCss).toContain(".widget-stepper.is-tone-secondary")
    expect(matrixCss).toContain(".widget-pagination.is-tone-secondary")
    expect(matrixCss).toContain(".widget-search-input.is-tone-secondary")
    expect(matrixCss).toContain(".widget-toggle-switch.is-tone-secondary")
    expect(matrixCss).toContain("background: var(--widget-color, #34cdea)")
    expect(matrixCss).toContain("background: #fff")
    expect(matrixCss).toContain("color: #fff")

    expect(tonesCss).toContain(".widget-text-input.vt-sized-control.is-tone-secondary")
    expect(tonesCss).toContain(".widget-select-trigger.vt-sized-control.is-tone-secondary")
    expect(tonesCss).toContain(".widget-video-select-trigger.vt-sized-control.is-tone-secondary")
    expect(tonesCss).toContain(".widget-select-content.is-tone-secondary")
  })

  it("uses the requested inverse secondary toggle animation", () => {
    expect(matrixCss).toContain(".widget-toggle-switch.is-tone-secondary")
    expect(matrixCss).toContain("border: 0 !important")
    expect(matrixCss).toContain(".widget-toggle-switch.is-tone-secondary.is-checked")
    expect(matrixCss).toContain("background: var(--widget-color, #34cdea)")
    expect(matrixCss).toContain(".widget-toggle-switch.is-tone-secondary.is-checked .widget-toggle-switch-thumb")
    expect(matrixCss).toContain("background: #fff")
    expect(matrixCss).toContain("background 260ms ease")
  })

  it("keeps sized select and video select on the public primitive surface", () => {
    expect(renderToStaticMarkup(
      <WidgetSizedSelect
        height={24}
        tone="primary"
        label="Visibility"
        value="public"
        onChange={() => {}}
        options={[{ value: "public", label: "Public" }]}
      />,
    )).toContain("is-height-24")

    expect(renderToStaticMarkup(
      <WidgetVideoSelect
        height={38}
        label="Video"
        value="v1"
        onChange={() => {}}
        options={[{ value: "v1", label: "Long title", meta: "12:42 · 48,230 views" }]}
      />,
    )).toContain("is-height-38")
    expect(variantsCss).toContain("--widget-video-split-bay: calc(var(--vt-primitive-height")
    expect(extensionSource).toContain("createPortal")
    expect(extensionSource).toContain("widget-video-select-menu is-portalled")
  })

  it("keeps video-selector menus on the overlay layer with square split bays", () => {
    expect(extensionSource).toContain("createPortal")
    expect(extensionSource).toContain("widget-video-select-menu--portal")
    expect(extensionSource).toContain('data-side={menuSide}')
    expect(variantsCss).toContain("--widget-video-split-bay: calc(var(--vt-primitive-height")
    expect(variantsCss).not.toContain(".widget-video-select-trigger.is-height-24 { --widget-video-split-bay: 40px; }")
    expect(variantsCss).toContain("font-size: max(6px")
  })
})

describe("split-left selected tone anatomy", () => {
  it("keeps the icon bay stronger than the selected label bay", () => {
    expect(tonesCss).toContain(".widget-split-button.is-left-split.vt-sized-control.is-tone-primary")
    expect(tonesCss).toContain("28%, white")
    expect(tonesCss).toContain(".widget-split-button.is-left-split.vt-sized-control.is-tone-primary .widget-split-button-icon")
    expect(tonesCss).toContain("background: var(--widget-color")
  })
})

describe("toolbox upload frame contract", () => {
  it("uses solid split-rail upload frames and retires dashed legacy frames", () => {
    expect(widgetSystemCss).toContain(".widget-media-upload-frame")
    expect(widgetSystemCss).toContain("grid-template-columns: 52px minmax(0, 1fr)")
    expect(widgetSystemCss).toContain(".widget-media-upload-icon")
    expect(widgetSystemCss).not.toContain("border: var(--widget-module-stroke) dashed var(--widget-border)")
  })
})

describe("comment responder donor primitives", () => {
  it("exposes the video mini-card, split counter badge and speech bubble through the shared surface", () => {
    const markup = renderToStaticMarkup(
      <div>
        <WidgetVideoMiniCard title="Napoleon's Last Great Victory" thumbnail="/thumb.jpg" meta="12:42" />
        <WidgetSplitCounterBadge icon={<span>Like</span>} value={12} label="12 likes" />
        <WidgetSpeechBubble>Big supporter of the channel.</WidgetSpeechBubble>
      </div>,
    )
    expect(markup).toContain("widget-video-mini-card")
    expect(markup).toContain("widget-split-counter-badge")
    expect(markup).toContain("widget-speech-bubble")
    expect(referenceSource).toContain("WidgetVideoMiniCard")
    expect(referenceSource).toContain("WidgetSplitCounterBadge")
    expect(referenceSource).toContain("WidgetSpeechBubble")
  })
})

describe("video selector overlay geometry", () => {
  it("uses a square selector bay and a portalled fixed-position menu", () => {
    expect(variantsCss).toContain("--widget-video-split-bay: calc(var(--vt-primitive-height")
    expect(variantsCss).not.toContain("--widget-video-split-bay: 40px")
    expect(variantsCss).not.toContain("--widget-video-split-bay: 48px")
    expect(variantsCss).not.toContain("--widget-video-split-bay: 54px")
    expect(extensionSource).toContain("createPortal")
    expect(extensionSource).toContain("widget-video-select-menu is-portalled")
    expect(videoSelectCss).toContain(".widget-video-select-menu.is-portalled")
    expect(videoSelectCss).toContain("position: fixed")
    expect(videoSelectCss).toContain("z-index: 9999")
  })

  it("gives video labels and chevrons enough room at the standard heights", () => {
    expect(variantsCss).toContain("is-height-38 .widget-video-select-trigger-selector > span:first-child { font-size: 12px")
    expect(variantsCss).toContain("is-height-38 .widget-video-select-option-copy strong {")
    expect(variantsCss).toContain("font-size: 14px")
  })
})

// ═══════════════════════════════════════════════════════════════
// A primitive that emits `is-<something>` as a class name renders
// unstyled when the stylesheet has no matching rule, and nothing
// fails: not the build, not the types, not a render assertion.
// WidgetSpectrumFillBadge shipped that way — it emitted
// is-spectrum-rose … is-spectrum-pink while the CSS defined none
// of them, so all twelve painted the same royal fallback.
// ═══════════════════════════════════════════════════════════════
describe("spectrum tone classes", () => {
  it("defines every spectrum slot the primitives can emit", () => {
    for (const name of WIDGET_BADGE_SPECTRUM) {
      expect(
        matrixCss.includes(`.widget-spectrum-fill-badge.is-spectrum-${name}`),
        `no fill-badge rule for is-spectrum-${name}`,
      ).toBe(true)
      expect(
        matrixCss.includes(`.widget-split-badge.is-spectrum-${name}`),
        `no split-badge rule for is-spectrum-${name}`,
      ).toBe(true)
      // The toast takes `spectrum` too. Leaving it out of the selector list
      // is exactly how the fill badge came to render a uniform fallback.
      expect(
        matrixCss.includes(`.widget-toast.is-spectrum-${name}`),
        `no toast rule for is-spectrum-${name}`,
      ).toBe(true)
    }
  })

  it("keeps those rules on the palette", () => {
    // CSS cannot import the TS token, so assert the hexes agree here
    // rather than letting the two drift silently.
    WIDGET_BADGE_SPECTRUM.forEach((name, index) => {
      const rule = new RegExp(
        `\\.widget-split-badge\\.is-spectrum-${name}\\s*\\{[^}]*--vt-tone-fill:\\s*(#[0-9A-Fa-f]{6})`,
      )
      const hex = matrixCss.match(rule)?.[1]
      expect(hex?.toUpperCase(), `is-spectrum-${name} hue`).toBe(
        VT_SPECTRUM_PALETTE_06[index].toUpperCase(),
      )
    })
  })

  it("keeps spectrum split badges on their hue while their copy and glyphs use global VT Ink", () => {
    const badge = renderToStaticMarkup(
      <WidgetLeftSplitBadge spectrum="teal" icon={<span />}>On target</WidgetLeftSplitBadge>,
    )
    expect(badge).toContain("is-spectrum-teal")
    expect(badge).toContain("widget-split-badge-icon")
    expect(matrixCss).toContain("--widget-spectrum-ink: #4EE4BE")
    expect(matrixCss).toContain("border: 2px solid var(--widget-spectrum-ink) !important")
    expect(matrixCss).toContain("color: var(--vt-ink")
    expect(matrixCss).toContain("--widget-toast-ink: var(--widget-spectrum-ink)")

    // Status must not be carried by hue alone: it sets a data attribute
    // and an assertive live region for the two urgent states.
    const danger = renderToStaticMarkup(<WidgetToast status="danger" title="Scope missing" />)
    expect(danger).toContain('data-widget-toast-status="danger"')
    expect(danger).toContain('role="alert"')
    const info = renderToStaticMarkup(<WidgetToast status="neutral" title="Heads up" />)
    expect(info).toContain('role="status"')
  })
})
