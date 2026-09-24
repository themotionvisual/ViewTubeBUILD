import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Studio Hub Component Library mobile regression", () => {
  it("mounts frozen and primitive-migration catalogs from the production library wrapper", () => {
    const library = read("src/components/ToolboxUIReferenceLibrary.tsx")
    expect(library).toContain('import { StudioHubCompletePrimitiveCatalog }')
    expect(library).toContain('import { StudioHubPrimitiveMigrationCatalog }')
    expect(library).toContain("<StudioHubCompletePrimitiveCatalog paletteIndex={paletteIndex} />")
    expect(library).toContain("<StudioHubPrimitiveMigrationCatalog paletteIndex={paletteIndex} />")
    expect(library).toContain('data-vt-library-track={track}')
  })

  it("keeps desktop and compact mobile shell geometry in production authority rather than a library override", () => {
    const library = read("src/components/ToolboxUIReferenceLibrary.tsx")
    const tokens = read("src/components/subtoolbox/tokens.ts")
    const css = read("src/styles/toolbox-system.css")

    expect(library).not.toContain("--vt-toolbox-header-height:")
    expect(tokens).toContain("height: 80")
    expect(tokens).toContain("height: TOOLBOX_LEVEL_DNA.l0.height")
    expect(css).toContain("--vt-toolbox-header-height: 80px")
    expect(css).toContain("--vt-subtoolbox-header-height: 56px")
    expect(tokens).toContain("TOOLBOX_MOBILE_HEADER_DNA")
    expect(css).toContain("--vt-subtoolbox-header-height: 44px")
  })

  it("keeps the primitive comparison track on shared component DNA", () => {
    const tokens = read("src/components/subtoolbox/tokens.ts")
    const primitives = read("src/components/subtoolbox/SubToolboxPrimitives.tsx")
    const migration = read("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
    expect(tokens).toContain("COMPONENT_LEVEL_DNA")
    expect(tokens).toContain("getComponentLevelCssVars")
    expect(primitives).toContain("data-vt-control-level")
    expect(migration).toContain("STUDIO_HUB_MIGRATED_FAMILIES")
    expect(migration).toContain("SubToolboxSegmentedToggle")
    expect(migration).toContain("STUDIO_HUB_MIGRATED_FAMILIES.map")
    expect(migration).not.toContain("HardcodedGenericControl")
    expect(migration).not.toContain("hardcoded-fallback")
    expect(migration).toContain("SubToolboxSplitDropdown")
    expect(migration).toContain("SubToolboxRangeSlider")
    expect(migration).toContain("SubToolboxTagEditor")
    expect(migration).toContain("SubToolboxKnob")
    expect(migration).toContain("SubToolboxAlphabeticalSpectrumTags")
    expect(migration).toContain("SubToolboxDataTable")
    expect(migration).toContain("SubToolboxDialog")
    expect(migration).not.toContain("forceOpen content=\"TOOLTIP\"")
  })


  it("keeps the redesigned floating/status/data primitives in the production track", () => {
    const primitive = read("src/components/subtoolbox/SubToolboxPrimitives.tsx")
    const migration = read("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
    const css = read("src/styles/subtoolbox-system.css")

    expect(primitive).toContain("useSubToolboxOverlayPosition")
    expect(primitive).toContain("SubToolboxLedDot")
    expect(migration).toContain('"LED Dot"')
    expect(migration).toContain('"Loader Progress"')
    expect(migration).toContain('"Loader Split"')
    expect(migration).toContain('"Loader Orbit"')
    expect(migration).toContain('"Loader Bars"')
    expect(migration).toContain('name === "Calendar" ? (["l0"]')
    expect(css).toContain("--vt-floating-overlay-z:2147483000")
    expect(css).toContain("vt-subtoolbox-led-ripple")
    expect(css).toContain("vt-subtoolbox-controller-thumb")
    expect(css).toContain("vt-subtoolbox-loader-progress")
    expect(css).toContain("vt-subtoolbox-tree-row[data-depth=\"1\"]")
  })

  it("keeps catalog placement separate from production primitive geometry", () => {
    const migration = read("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
    const css = read("src/components/studio-hub/studio-hub-primitive-migration-catalog.css")
    const primitiveCss = read("src/styles/subtoolbox-system.css")
    const splitCss = read("src/styles/subtoolbox-split-primitives.css")

    expect(css).toContain('[data-vt-subtoolbox="true"] > div:first-child')
    expect(css).toContain("border:0!important")
    expect(css).toContain(".vt-catalog-demo{")
    expect(css).toContain("--vt-catalog-level-height:56px")
    expect(css).toContain('data-vt-preview-mode="compound"')
    expect(css).not.toContain(".vt-catalog-demo > *{\n  width:fit-content!important")
    expect(css).not.toContain("width:var(--vt-catalog-standard-inline)!important")
    expect(migration).toContain("CATALOG_PREVIEW_GEOMETRY")
    expect(migration).toContain('data-vt-preview-portrait={getCatalogPreviewGeometry(name).portraitStack ? "stack" : "grid"}')
    expect(css).toContain('data-vt-preview-portrait="stack"')
    expect(css).toContain("grid-template-columns:repeat(3,minmax(0,max-content))")
    expect(css).toContain("@media(max-width:520px) and (orientation:portrait)")
    expect(css).toContain("grid-template-columns:minmax(0,1fr)")
    expect(css).toContain("@media(max-height:520px) and (orientation:landscape)")
    expect(primitiveCss).toContain("CANONICAL INTRINSIC GEOMETRY — 2026-09-24")
    expect(primitiveCss).toContain("min-width:calc(var(--vt-component-height)*5.15)")
    expect(splitCss).toContain("min-width:calc(var(--vt-component-height)*4.15)")
    expect(splitCss).toContain("min-width:calc(var(--vt-component-height)*4.8)")
  })

  it("registers the visual-key tooltip and both new skeleton anatomies", () => {
    const primitive = read("src/components/subtoolbox/SubToolboxPrimitives.tsx")
    const migration = read("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
    const css = read("src/styles/subtoolbox-system.css")

    expect(primitive).toContain("SubToolboxLegendTooltip")
    expect(primitive).toContain('variant?: "lines" | "compact" | "media"')
    expect(primitive).toContain('ratio?: "16:9" | "1:1" | "4:5"')
    expect(migration).toContain('"Tooltip Visual Key"')
    expect(migration).toContain('"Skeleton Compact"')
    expect(migration).toContain('"Skeleton Media"')
    expect(css).toContain(".vt-subtoolbox-tooltip-bubble.is-legend")
    expect(css).toContain(".vt-subtoolbox-tooltip-legend-row")
    expect(css).toContain(".vt-subtoolbox-skeleton.is-compact")
    expect(css).toContain(".vt-subtoolbox-skeleton.is-media")
  })

  it("exposes both tracks to the automated A/B certification harness", () => {
    const hardcoded = read("src/components/studio-hub/StudioHubCompletePrimitiveCatalog.tsx")
    const primitive = read("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
    const capture = read("scripts/capture-studio-component-certification.mjs")

    expect(hardcoded).toContain("data-vt-family={name}")
    expect(hardcoded).toContain('data-vt-certification-state="hardcoded-reference"')
    expect(primitive).toContain("data-vt-family={name}")
    expect(capture).toContain('{ label: "desktop", width: 1440, height: 1000 }')
    expect(capture).toContain('{ label: "mobile", width: 390, height: 844 }')
    expect(capture).toContain('{ label: "mobile-landscape", width: 844, height: 390 }')
    for (const family of [
      "Split Menu", "Split Left Button", "Split Search", "Input Action", "Tag Editor",
      "Slider", "Range Slider", "Settings Switch", "Checkbox", "Radio", "Tooltip",
      "Progress Value", "Knob Dial", "Tooltip Color", "Hover Card", "Controller Switch",
      "LED Light", "LED Dot", "Horizontal Scrollbar", "Vertical Scrollbar", "Calendar",
      "Loader", "Loader Progress", "Loader Split", "Loader Orbit", "Loader Bars", "Tree View",
      "Tooltip Visual Key", "Skeleton Compact", "Skeleton Media",
    ]) expect(capture).toContain(`["${family}"`)
    expect(capture).toContain('["Tooltip", "Tooltip Color", "Tooltip Visual Key", "Hover Card"].includes(familyName)')
    expect(capture).toContain('captureMode: floatingOverlayFamily && state !== "default" ? "viewport" : "locator"')
    expect(capture).toContain("geometryMinimumUnits")
    expect(capture).toContain("inspectPrimitiveGeometry")
    expect(capture).toContain("squareRailDelta")
    expect(capture).toContain("canonical label clipped")
  })

  it("keeps the requested missing families in the canonical registry", () => {
    const catalog = read("src/components/studio-hub/StudioHubCompletePrimitiveCatalog.tsx")
    for (const family of [
      "Split Search", "Toggle", "Settings Switch", "Checkbox", "Radio", "Slider",
      "Range Slider", "Popover", "Pagination", "Vault Landscape Asset",
      "Vault Portrait Asset", "Vault Audio Asset", "Vault Document Asset",
    ]) expect(catalog).toContain(`\"${family}\"`)
  })
})
