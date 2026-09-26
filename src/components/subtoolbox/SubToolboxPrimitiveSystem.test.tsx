import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "./SubToolboxLayouts"
import { SubToolboxAlphabeticalSpectrumTags, SubToolboxAspectRatioFrame, SubToolboxAvatar, SubToolboxBreadcrumb, SubToolboxButton, SubToolboxCalendar, SubToolboxCarousel, SubToolboxCommandPalette, SubToolboxControllerSwitch, SubToolboxDataStats, SubToolboxDataTable, SubToolboxDisclosure, SubToolboxFileTarget, SubToolboxHoverCard, SubToolboxInput, SubToolboxKnob, SubToolboxLed, SubToolboxLedDot, SubToolboxLegendTooltip, SubToolboxLoader, SubToolboxMeter, SubToolboxMetric, SubToolboxMetricStrip, SubToolboxNameValueList, SubToolboxOutputCard, SubToolboxPagination, SubToolboxPopover, SubToolboxScrollbar, SubToolboxSplitField, SubToolboxSkeleton, SubToolboxStatePanel, SubToolboxTag, SubToolboxTagEditor, SubToolboxTextArea, SubToolboxTopTitleDropdown, SubToolboxToolbar, SubToolboxTooltip, SubToolboxProgressValue, SubToolboxTree, SubToolboxVaultAsset } from "./SubToolboxPrimitives"
import { CONTROL_SHELL, SUBTOOLBOX_CONTROL_SIZES, SUBTOOLBOX_STATES, SUBTOOLBOX_TOKENS, TOOLBOX_LEVEL_DNA, VAULT_ASSET_MODULE_DNA, resolveSubtoolboxMinHeight } from "./tokens"

describe("Subtoolbox Primitive System", () => {
  it("derives compatibility geometry from the single token source", () => {
    // Compatibility geometry mirrors the L0 shell, not the interior.
    expect(CONTROL_SHELL.height).toBe(SUBTOOLBOX_TOKENS.controlHeight.l0)
    expect(CONTROL_SHELL.radius).toBe(SUBTOOLBOX_TOKENS.shell.radius)
    // Interior stays strictly below the shell on every axis it shares.
    expect(SUBTOOLBOX_TOKENS.interior.radius).toBeLessThan(SUBTOOLBOX_TOKENS.shell.radius)
    expect(SUBTOOLBOX_TOKENS.interior.shadowOffset).toBeLessThan(SUBTOOLBOX_TOKENS.shell.shadowOffset)
    // Control heights descend with the level.
    expect(SUBTOOLBOX_TOKENS.controlHeight.l2).toBeLessThan(SUBTOOLBOX_TOKENS.controlHeight.l1)
    expect(SUBTOOLBOX_TOKENS.controlHeight.l1).toBeLessThan(SUBTOOLBOX_TOKENS.controlHeight.l0)
    // openUnits * L0 + gaps - one header's overhead. Derived from the tokens so
    // it tracks TOOLBOX_LEVEL_DNA instead of going stale on every retune.
    const l0 = SUBTOOLBOX_TOKENS.controlHeight.l0
    const gap = SUBTOOLBOX_TOKENS.spacing.large
    expect(resolveSubtoolboxMinHeight(3)).toBe(3 * l0 + 2 * gap - l0)
    // There is one shell style: heightMode no longer changes the result.
    expect(resolveSubtoolboxMinHeight(3, "compact")).toBe(resolveSubtoolboxMinHeight(3, "standard"))
  })

  // 32db8dc lowered two levels of the ladder and left a third behind, which put
  // a level-1 control above the level-0 shell for weeks without failing a gate.
  // Assert the whole ladder, not one pair, so the next retune cannot repeat it.
  it("locks the donor Vault asset-module geometry independently from the level ladder", () => {
    expect(VAULT_ASSET_MODULE_DNA.width).toBe(276)
    expect(VAULT_ASSET_MODULE_DNA.height).toBe(189)
    expect(VAULT_ASSET_MODULE_DNA.stroke).toBe(2)
    expect(VAULT_ASSET_MODULE_DNA.headerHeight).toBe(30)
    expect(VAULT_ASSET_MODULE_DNA.doubleHeaderHeight).toBe(60)
    expect(VAULT_ASSET_MODULE_DNA.landscapeWidth).toBe(184)
    expect(VAULT_ASSET_MODULE_DNA.landscapeHeight).toBe(103.5)
    expect(VAULT_ASSET_MODULE_DNA.portraitWidth).toBe(104.0625)
    expect(VAULT_ASSET_MODULE_DNA.portraitLeftWidth).toBe(167.9375)
    expect(VAULT_ASSET_MODULE_DNA.halfHeight).toBe(94.5)
  })

  it("locks the reconciled structural height ladder", () => {
    expect(TOOLBOX_LEVEL_DNA.toolbox.height).toBe(80)
    expect(TOOLBOX_LEVEL_DNA.l0.height).toBe(56)
    expect(TOOLBOX_LEVEL_DNA.l1.height).toBe(48)
    expect(TOOLBOX_LEVEL_DNA.l2.height).toBe(32)
    expect(SUBTOOLBOX_TOKENS.shell.headerHeight).toBe(56)
  })

  it("keeps every level-owned axis strictly descending", () => {
    const ladder = ["toolbox", "l0", "l1", "l2"] as const
    const axes = ["height", "stroke", "radius", "shadowOffset", "titleSize"] as const
    for (const axis of axes) {
      for (let i = 1; i < ladder.length; i += 1) {
        const outer = TOOLBOX_LEVEL_DNA[ladder[i - 1]][axis]
        const inner = TOOLBOX_LEVEL_DNA[ladder[i]][axis]
        expect(
          inner,
          `${ladder[i]}.${axis} (${inner}) must sit below ${ladder[i - 1]}.${axis} (${outer})`,
        ).toBeLessThan(outer)
      }
    }
  })

  // The components emit `is-${size}` as a class name, so a size the stylesheet
  // does not define renders an unstyled control and a size the type does not
  // allow is a permanent call-site error that still looks right on screen.
  // Both happened. Assert the two agree in both directions.
  it("keeps control sizes and their stylesheet rules in step", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles/subtoolbox-system.css"), "utf8")
    const styled = new Set(
      [...css.matchAll(/\.vt-subtoolbox-button\.is-([a-z0-9-]+)/g)].map((match) => match[1]),
    )
    for (const size of SUBTOOLBOX_CONTROL_SIZES) {
      expect(styled.has(size), `size "${size}" has no .vt-subtoolbox-button.is-${size} rule`).toBe(true)
    }
    // Tones share the is-* namespace, so only assert the sizes are covered by
    // the type — a stray size class with no type member is the other half.
    const tones = new Set(["neutral", "ink", "danger", "warning", "success", "selected"])
    const sizes = new Set<string>(SUBTOOLBOX_CONTROL_SIZES)
    for (const cls of styled) {
      if (tones.has(cls)) continue
      expect(sizes.has(cls), `.is-${cls} is styled but is not a declared control size`).toBe(true)
    }
  })

  it("keeps the corrected split/tag/field/knob visual contracts in canonical CSS", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles/subtoolbox-system.css"), "utf8")
    const splitCss = readFileSync(resolve(process.cwd(), "src/styles/subtoolbox-split-primitives.css"), "utf8")

    expect(splitCss).toContain("split-left square parity")
    expect(splitCss).toContain("aspect-ratio:1/1")
    expect(splitCss).toContain("Split Menu hybrid authority")
    expect(splitCss).toContain("vt-subtoolbox-split-dropdown-option-rail")
    expect(css).toContain("field parity, borderless action tags")
    expect(css).toContain("--field-accent:var(--pair-b")
    expect(css).toContain(".vt-subtoolbox-removable-tag,")
    expect(css).toContain(".vt-subtoolbox-selectable-tag{")
    expect(css).toContain("border:0!important")
    expect(css).toContain("--vt-knob-size:calc(var(--vt-component-height)*2.15)")
    expect(css).toContain(".vt-subtoolbox-knob-arc{display:none}")
    expect(css).toContain("COMPONENT LIBRARY CORRECTION V4 — groups 18 / 19 / 21 / 22 / 23.")
    expect(css).toContain("border:var(--vt-component-stroke) solid #000!important")
    expect(css).toContain("--switch-inset:calc(var(--vt-component-height)*.10)")
    expect(css).toContain("var(--switch-handle-w)")
    expect(css).toContain("width:var(--vt-component-height)!important")
    expect(css).toContain("border-radius:var(--vt-component-radius)!important")
    expect(css).toContain("COMPONENT LIBRARY CORRECTION V5 — tag editor parity")
    expect(css).toContain("--field-body:var(--pair-b")
    expect(css).toContain("TOP TITLE DROPDOWN PRIMITIVE")
    expect(css).toContain(".vt-subtoolbox-top-title-dropdown-trigger")
    expect(css).toContain("height:calc(var(--vt-component-height)*1.62)")
  })

  it("locks the corrected overlay, LED, controller, loader, calendar, scrollbar and tree contracts", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles/subtoolbox-system.css"), "utf8")
    const source = readFileSync(resolve(process.cwd(), "src/components/subtoolbox/SubToolboxPrimitives.tsx"), "utf8")

    expect(source).toContain("useSubToolboxOverlayPosition")
    expect(source).toContain('data-vt-overlay="tooltip"')
    expect(source).toContain('data-vt-overlay="hover-card"')
    expect(source).toContain('placement: "above" | "below"')
    expect(source).toContain('data-placement={position.placement}')
    expect(css).toContain("--vt-floating-overlay-z:2147483000")
    expect(css).toContain('.vt-subtoolbox-tooltip-bubble[data-placement="below"]')
    expect(css).toContain('.vt-subtoolbox-hover-card-panel[data-placement="below"]')
    expect(css).toContain(".vt-subtoolbox-tooltip-bubble::after")
    expect(css).toContain("border-right:var(--vt-component-stroke) solid #000")
    expect(css).toContain("vt-subtoolbox-led-ripple")
    expect(css).toContain("37.5%{opacity:0;transform:scale(5)}")
    expect(css).toContain(".vt-subtoolbox-led-dot")
    expect(css).toContain(".vt-subtoolbox-controller-thumb")
    expect(css).toContain("color-mix(in srgb,var(--pair-b,#ff7f6b) 34%,transparent)")
    expect(css).toContain(".vt-subtoolbox-loader-progress")
    expect(css).toContain(".vt-subtoolbox-loader-split-title")
    expect(css).toContain(".vt-subtoolbox-loader-orbit")
    expect(css).toContain(".vt-subtoolbox-loader-bars")
    expect(css).toContain(".vt-subtoolbox-calendar-weekdays")
    expect(css).toContain("font-size:calc(var(--vt-component-font-size)*.945)")
    expect(css).toContain(".vt-subtoolbox-scrollbar-track{position:relative")
    expect(css).toContain("background:#000;overflow:visible")
    expect(css).toContain(".vt-subtoolbox-tree-row[data-depth=\"1\"]")
    expect(css).toContain("--vt-tree-row-opacity")
  })

  it("gives every declared subtoolbox state default copy", () => {
    // The Record is typed, but a missing key renders an empty panel rather than
    // failing the build, so assert the rendered output instead of the type.
    for (const state of SUBTOOLBOX_STATES) {
      const html = renderToStaticMarkup(<SubToolboxStatePanel state={state} />)
      expect(html, `${state} has no default copy`).toMatch(/<p>\s*\S/)
    }
  })

  it("renders typed fields, actions, layouts and states", () => {
    const html = renderToStaticMarkup(
      <SubToolboxStack density="dense">
        <SubToolboxGrid minItemWidth="compact">
          <SubToolboxInput aria-label="Title" />
          <SubToolboxTextArea aria-label="Description" height="compact" />
        </SubToolboxGrid>
        <SubToolboxActions columns={2}>
          <SubToolboxButton size="compact" selected>Text</SubToolboxButton>
          <SubToolboxButton size="action" tone="success">Create</SubToolboxButton>
        </SubToolboxActions>
        <SubToolboxStatePanel state="error" message="Try again." />
        <SubToolboxMetric label="Views" value="1,000" />
        <SubToolboxOutputCard title="Description">Output</SubToolboxOutputCard>
        <SubToolboxFileTarget label="Upload video" />
        <SubToolboxTooltip level="l1" forceOpen content="Tooltip" />
        <SubToolboxKnob level="l1" value={72} onValueChange={() => undefined} />
        <SubToolboxSplitField level="l1" variant="search" icon="S" actionIcon="X" inputProps={{ "aria-label": "Search", defaultValue: "Napoleon" }} />
        <SubToolboxSplitField level="l1" variant="action" actionIcon="+" inputProps={{ "aria-label": "Add item", defaultValue: "Item" }} />
        <SubToolboxTagEditor level="l1" tags={["HISTORY"]} onTagsChange={() => undefined} />
        <SubToolboxTopTitleDropdown
          level="l1"
          label="PRIVACY"
          value="PUBLIC"
          options={[{ value: "PUBLIC", label: "PUBLIC" }, { value: "PRIVATE", label: "PRIVATE" }]}
          onValueChange={() => undefined}
        />
        <SubToolboxProgressValue level="l1" value={68} label="Sync" />
        <SubToolboxAlphabeticalSpectrumTags level="l2" />
        <SubToolboxDataTable
          level="l2"
          columns={[{ key: "metric", label: "Metric" }, { key: "value", label: "Value" }]}
          rows={[{ metric: "Views", value: "100" }]}
        />
        <SubToolboxPopover level="l2" trigger="Options">Popover body</SubToolboxPopover>
        <SubToolboxDisclosure level="l2" title="Advanced">Disclosure body</SubToolboxDisclosure>
        <SubToolboxPagination level="l2" page={2} pages={3} />
        <SubToolboxControllerSwitch level="l2" pressed />
        <SubToolboxLed level="l2" active label="Active" />
        <SubToolboxLedDot level="l2" active />
        <SubToolboxLoader level="l2" variant="spinner" label="Loading" />
        <SubToolboxLoader level="l2" variant="progress" label="Loading" />
        <SubToolboxLoader level="l2" variant="split" label="Loading" />
        <SubToolboxLoader level="l2" variant="orbit" label="Loading" />
        <SubToolboxLoader level="l2" variant="bars" label="Loading" />
        <SubToolboxCalendar level="l2" selectedDay={19} />
        <SubToolboxHoverCard level="l2" trigger="Hover" content="Details" />
        <SubToolboxMeter level="l2" value={73} label="Quality" />
        <SubToolboxAvatar level="l2" name="View Tube" meta="Creator" />
        <SubToolboxNameValueList level="l2" items={[{ name: "Views", value: "100" }]} />
        <SubToolboxBreadcrumb level="l2" items={[{ label: "Studio" }, { label: "Tool" }]} />
        <SubToolboxCarousel level="l2" items={["One", "Two"]} />
        <SubToolboxCommandPalette level="l2" items={[{ id: "one", label: "One" }]} />
        <SubToolboxMetricStrip level="l2" items={[{ label: "Views", value: "100" }]} />
        <SubToolboxScrollbar level="l2" value={30} />
        <SubToolboxScrollbar level="l2" orientation="vertical" value={30} />
        <SubToolboxDataStats level="l2" label="Views" value="100" delta="+2%" />
        <SubToolboxVaultAsset level="l2" kind="landscape" title="Landscape" />
        <SubToolboxTree level="l2" defaultOpenIds={["root"]} nodes={[{ id: "root", label: "Root", children: [{ id: "child", label: "Child" }] }]} />
        <SubToolboxTooltip level="l2" variant="dark" content="Dark" />
        <SubToolboxTooltip level="l2" variant="color" content="Color" />
        <SubToolboxLegendTooltip
          level="l2"
          forceOpen
          items={[{ label: "Ready", detail: "Complete", color: "#3FEE56" }]}
          note="Legend note"
        />
        <SubToolboxSkeleton level="l2" variant="compact" />
        <SubToolboxSkeleton level="l2" variant="media" ratio="16:9" />
        <SubToolboxTag level="l2" variant="dashboard-pill">Pill</SubToolboxTag>
        <SubToolboxAspectRatioFrame level="l2" ratio="16:9" label="16:9">Frame</SubToolboxAspectRatioFrame>
        <SubToolboxToolbar level="l2"><SubToolboxButton level="l2">Save</SubToolboxButton></SubToolboxToolbar>
      </SubToolboxStack>,
    )

    expect(html).toContain("vt-subtoolbox-input")
    expect(html).toContain("vt-subtoolbox-textarea is-compact")
    expect(html).toContain("vt-subtoolbox-actions has-2-columns")
    expect(html).toContain("vt-subtoolbox-button is-compact is-accent is-selected")
    expect(html).toContain('data-subtoolbox-state="error"')
    expect(html).toContain('role="alert"')
    expect(html).toContain("vt-subtoolbox-metric")
    expect(html).toContain("vt-subtoolbox-output")
    expect(html).toContain("vt-subtoolbox-file-target")
    expect(html).toContain("vt-subtoolbox-tooltip is-l1 is-default is-open")
    expect(html).toContain('role="tooltip"')
    expect(html).toContain("vt-subtoolbox-knob")
    expect(html).toContain('role="slider"')
    expect(html).toContain("vt-subtoolbox-knob-readout")
    expect(html).toContain("A · TAG")
    expect(html).toContain("Z · TAG")
    expect(html).toContain("vt-subtoolbox-split-field is-search has-action")
    expect(html).toContain("vt-subtoolbox-split-field is-action has-action")
    expect(html).toContain("vt-subtoolbox-tag-editor-tags")
    expect(html).toContain("vt-subtoolbox-top-title-dropdown")
    expect(html).toContain("vt-subtoolbox-top-title-dropdown-title")
    expect(html).toContain(">PRIVACY<")
    expect(html).toContain(">PUBLIC<")
    expect(html).not.toContain("vt-subtoolbox-tag-editor-label")
    expect(html).toContain('role="progressbar"')
    expect(html).toContain(">Sync<")
    expect(html).toContain("vt-subtoolbox-data-table")
    expect(html).toContain("vt-subtoolbox-popover")
    expect(html).toContain("vt-subtoolbox-disclosure")
    expect(html).toContain("vt-subtoolbox-pagination")
    expect(html).toContain("vt-subtoolbox-controller-switch")
    expect(html).toContain("vt-subtoolbox-led")
    expect(html).toContain("vt-subtoolbox-led-dot")
    expect(html).toContain("vt-subtoolbox-loader is-spinner")
    expect(html).toContain("vt-subtoolbox-loader is-progress")
    expect(html).toContain("vt-subtoolbox-loader is-split")
    expect(html).toContain("vt-subtoolbox-loader is-orbit")
    expect(html).toContain("vt-subtoolbox-loader is-bars")
    expect(html).toContain("vt-subtoolbox-calendar")
    expect(html).toContain('data-vt-control-level="l0"')
    expect(html).toContain("vt-subtoolbox-hover-card")
    expect(html).toContain("vt-subtoolbox-meter")
    expect(html).toContain("vt-subtoolbox-avatar")
    expect(html).toContain("vt-subtoolbox-name-value")
    expect(html).toContain("vt-subtoolbox-breadcrumb")
    expect(html).toContain("vt-subtoolbox-carousel")
    expect(html).toContain("vt-subtoolbox-command")
    expect(html).toContain("vt-subtoolbox-metric-strip")
    expect(html).toContain("vt-subtoolbox-scrollbar")
    expect(html).toContain("vt-subtoolbox-data-stats")
    expect(html).toContain("vt-subtoolbox-vault-asset")
    expect(html).toContain("vt-subtoolbox-tree")
    expect(html).toContain("is-dark")
    expect(html).toContain("is-color")
    expect(html).toContain("is-legend")
    expect(html).toContain("vt-subtoolbox-tooltip-legend")
    expect(html).toContain("vt-subtoolbox-skeleton is-compact")
    expect(html).toContain("vt-subtoolbox-skeleton is-media")
    expect(html).toContain('data-ratio="16:9"')
    expect(html).toContain("is-dashboard-pill")
    expect(html).toContain("vt-subtoolbox-aspect-frame")
    expect(html).toContain("vt-subtoolbox-toolbar")
  })
})
