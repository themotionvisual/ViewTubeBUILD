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
      "Progress Value", "Knob Dial",
    ]) expect(capture).toContain(`["${family}"`)
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
