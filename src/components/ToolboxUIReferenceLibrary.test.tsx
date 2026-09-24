import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ToolboxUIReferenceLibrary } from "./ToolboxUIReferenceLibrary"

describe("Toolbox UI Reference Library", () => {
  it("mounts frozen and primitive-migration catalogs in matching production toolbox shells", () => {
    const html = renderToStaticMarkup(
      <ToolboxUIReferenceLibrary collapsible={false} isOpenInitial paletteIndex={7} />,
    )

    expect(html).toContain("Studio Hub Component Library — Hardcoded")
    expect(html).toContain("Studio Hub Component Library — Primitive")
    expect(html.match(/Complete Component \+ Primitive Catalog/g)).toHaveLength(2)
    expect(html).toContain('data-vt-library-track="hardcoded"')
    expect(html).toContain('data-vt-library-track="primitive"')
    expect(html).toContain("Split Search")
    expect(html).toContain("Toggle")
    expect(html).toContain("Settings Switch")
    expect(html).toContain("Checkbox")
    expect(html).toContain("Radio")
    expect(html).toContain("Slider")
    expect(html).toContain("Range Slider")
    expect(html).toContain("Popover")
    expect(html).toContain("Pagination")
    expect(html).toContain("Vault Landscape Asset")
    expect(html).toContain("Vault Portrait Asset")
    expect(html).toContain("Vault Audio Asset")
    expect(html).toContain("Vault Document Asset")
    expect(html).toContain("Knob Dial")
    expect(html).toContain("Controller Switch")
    expect(html).toContain("LED Light")
    expect(html).toContain('data-vt-toolbox-level="main"')
  })

  it("renders only real primitive families and includes the correction + discovery wave", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx"), "utf8")
    for (const family of [
      "Primary Button", "Secondary Button", "Neutral Button", "Destructive Button",
      "Square Icon Button", "Split Left Button", "Head Tail Action", "Split Menu",
      "Dropdown", "Top Title Dropdown", "Select Menu", "Context Menu", "Text Input", "Textarea",
      "Split Search", "Number Field", "Input Action", "Stepper", "Slider",
      "Range Slider", "Toggle", "Settings Switch", "Checkbox", "Radio",
      "Segmented Choice", "Button Group", "Tag", "Removable Tag", "Selectable Tag",
      "Tag Editor", "Badge", "Status Badge", "Progress Bar", "Progress Value",
      "KPI", "Stat Card", "Tooltip", "Knob Dial", "Alphabetical Spectrum Tags",
      "Field Label", "Surface", "State Panel", "Output Card", "Metric", "Link Button",
      "Data Table", "Color Picker", "Media Card", "Selectable List Row", "Reorderable Row",
      "Tabs", "Alert", "Step Indicator", "Dialog", "Drawer", "Calendar",
      "Loader", "Skeleton", "Toast", "Popover", "Disclosure", "Divider",
      "Pagination", "Controller Switch", "LED Light", "Icon Rail Control", "Hover Card",
      "Meter", "Avatar", "Name Value List", "Breadcrumb", "Carousel", "Command Palette",
      "Metric Strip", "Horizontal Scrollbar", "Vertical Scrollbar", "Data Stats Module",
      "Upload Frame", "Vault Landscape Asset", "Vault Portrait Asset", "Vault Audio Asset",
      "Vault Document Asset", "Tree View", "Disabled Button", "Disabled Split Button",
      "Two Color Data Stats", "Monochrome Data Stats", "Tiny Data Stats", "Tooltip Dark",
      "Tooltip Color", "Dashboard Pill Tags", "Aspect Ratio Frame", "Toolbar",
      "LED Dot", "Loader Progress", "Loader Split", "Loader Orbit", "Loader Bars",
    ]) expect(source).toContain(`"${family}"`)
    expect(source).not.toContain("HardcodedGenericControl")
    expect(source).not.toContain("hardcoded-fallback")
    expect(source).toContain("STUDIO_HUB_MIGRATED_FAMILIES.map")
    expect(source).toContain("<SubToolboxSplitButton")
    expect(source).toContain("<SubToolboxSplitDropdown")
    expect(source).toContain("<SubToolboxMenu")
    expect(source).toContain("<SubToolboxTopTitleDropdown")
    expect(source).toContain("<SubToolboxSplitField")
    expect(source).toContain("<SubToolboxSlider")
    expect(source).toContain("<SubToolboxRangeSlider")
    expect(source).toContain("<SubToolboxTagEditor")
    expect(source).toContain("<SubToolboxProgressBar")
    expect(source).toContain("<SubToolboxKpiCard")
    expect(source).toContain("<SubToolboxKnob")
    expect(source).toContain("<SubToolboxAlphabeticalSpectrumTags")
    expect(source).toContain("<SubToolboxDataTable")
    expect(source).toContain("<SubToolboxColorPicker")
    expect(source).toContain("<SubToolboxMediaCard")
    expect(source).toContain("<SubToolboxStepIndicator")
    expect(source).toContain("<SubToolboxDialog")
    expect(source).toContain("<SubToolboxDrawer")
    expect(source).toContain("<SubToolboxCalendar")
    expect(source).toContain("<SubToolboxLoader")
    expect(source).toContain("<SubToolboxSkeleton")
    expect(source).toContain("<SubToolboxToast")
    expect(source).toContain("<SubToolboxPopover")
    expect(source).toContain("<SubToolboxDisclosure")
    expect(source).toContain("<SubToolboxPagination")
    expect(source).toContain("<SubToolboxControllerSwitch")
    expect(source).toContain("<SubToolboxLed")
    expect(source).toContain("<SubToolboxLedDot")
    expect(source).toContain('variant="progress"')
    expect(source).toContain('variant="split"')
    expect(source).toContain('variant="orbit"')
    expect(source).toContain('variant="bars"')
    expect(source).toContain("<SubToolboxHoverCard")
    expect(source).toContain("<SubToolboxMeter")
    expect(source).toContain("<SubToolboxAvatar")
    expect(source).toContain("<SubToolboxNameValueList")
    expect(source).toContain("<SubToolboxBreadcrumb")
    expect(source).toContain("<SubToolboxCarousel")
    expect(source).toContain("<SubToolboxCommandPalette")
    expect(source).toContain("<SubToolboxMetricStrip")
    expect(source).toContain("<SubToolboxScrollbar")
    expect(source).toContain("<SubToolboxDataStats")
    expect(source).toContain("<SubToolboxFileTarget")
    expect(source).toContain("<SubToolboxVaultAsset")
    expect(source).toContain("<SubToolboxTree")
    expect(source).toContain("variant=\"dark\"")
    expect(source).toContain("variant=\"color\"")
    expect(source).toContain("variant=\"dashboard-pill\"")
    expect(source).toContain("variant=\"two-color\"")
    expect(source).toContain("variant=\"monochrome\"")
    expect(source).toContain("variant=\"tiny\"")
    expect(source).toContain("<SubToolboxAspectRatioFrame")
    expect(source).toContain("<SubToolboxToolbar")
    expect(source).not.toContain("forceOpen content=\"TOOLTIP\"")
  })

  it("consumes the production-owned 80px / 56px shell authority without a local override", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/ToolboxUIReferenceLibrary.tsx"), "utf8")
    const tokens = readFileSync(resolve(process.cwd(), "src/components/subtoolbox/tokens.ts"), "utf8")
    const css = readFileSync(resolve(process.cwd(), "src/styles/toolbox-system.css"), "utf8")

    expect(source).not.toContain("--vt-toolbox-header-height:")
    expect(tokens).toContain("height: 80")
    expect(tokens).toContain("height: TOOLBOX_LEVEL_DNA.l0.height")
    expect(css).toContain("--vt-toolbox-header-height: 80px")
    expect(css).toContain("--vt-subtoolbox-header-height: 56px")
  })

  it("is lazy-mounted once while the library component renders both comparison tracks", () => {
    const studioHub = readFileSync(resolve(process.cwd(), "src/views/StudioHub.tsx"), "utf8")

    expect(studioHub).toContain('React.lazy(() => import("../components/ToolboxUIReferenceLibrary"))')
    expect(studioHub).toContain("<ToolboxUIReferenceLibrary collapsible isOpenInitial={false} paletteIndex={7} />")
    expect(studioHub.match(/<ToolboxUIReferenceLibrary/g)).toHaveLength(1)
  })
})
