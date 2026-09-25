import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const productionSubtoolboxConsumers = [
 "src/components/PreLaunchPriming.tsx",
 "src/components/ProjectStudio.tsx",
 "src/views/ActionableTactics.tsx",
 "src/views/MediaAnalyzer.tsx",
 "src/views/VideoManager.tsx",
 "src/views/VideoPublisher.tsx",
 "src/views/StoryboardStudio.tsx",
 "src/views/supertools/SuperToolPrototypeWorkspace.tsx",
]

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("subtoolbox design governance", () => {
 it.each(productionSubtoolboxConsumers)("keeps %s on the canonical nested shell", (path) => {
  const contents = source(path)

  expect(contents).not.toMatch(/<Toolbox\s[^>]*variant=["']sub["']/s)
  expect(contents).not.toContain("AccordionContainer")
 })

 it("does not replace palette shadows with inherited black on mobile", () => {
  const responsiveCss = source("src/styles/perf.css")
  const systemCss = source("src/styles/subtoolbox-system.css")

  expect(responsiveCss).not.toMatch(/\.vt-toolbox\[data-vt-toolbox\][^{]*\{[^}]*currentColor/s)
  expect(responsiveCss).not.toContain('--vt-subtoolbox-shadow-offset')
  expect(systemCss).toMatch(/--vt-subtoolbox-shadow-offset:\s*6px/)
  expect(systemCss).not.toContain("--vt-subtoolbox-header-height:44px")
  expect(systemCss).not.toContain("--vt-subtoolbox-shadow-offset:4px")
  expect(systemCss).toContain('[data-vt-toolbox-level="sub"]')
 })

 it("locks the mobile shell density and restored header anatomy", () => {
  const toolboxCss = source("src/styles/toolbox-system.css")
  const systemCss = source("src/styles/subtoolbox-system.css")
  const primitives = source("src/components/subtoolbox/SubToolboxPrimitives.tsx")
  const catalog = source("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")

  expect(toolboxCss).toContain("--vt-toolbox-header-height: 56px")
  expect(toolboxCss).toContain("--vt-subtoolbox-header-height: 44px")
  expect(toolboxCss).toContain("--vt-toolbox-shadow-offset: 6px")
  expect(toolboxCss).toContain("--vt-subtoolbox-shadow-offset: 4px")
  expect(toolboxCss).toContain("--vt-toolbox-radius: 14px")
  expect(toolboxCss).toContain("--vt-subtoolbox-radius: 10px")
  expect(systemCss).toContain(".vt-toolbox-header-toggle")
  expect(systemCss).toContain(".vt-subtoolbox-file-target.vt-upload-tight-reveal")
  expect(systemCss).toContain("box-shadow: none !important")
  expect(primitives).toContain("export const ToolboxHeaderToggle")
  expect(catalog).toContain('"Toolbox Header Toggle"')
  expect(catalog).toContain('"SubToolbox Header Toggle"')
 })

 it("keeps header anatomy and primary actions on canonical primitives", () => {
  const toolbox = source("src/components/Toolbox.tsx")
  const primitives = source("src/components/subtoolbox/SubToolboxPrimitives.tsx")
  const catalog = source("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
  const manager = source("src/views/VideoManager.tsx")
  const commentResponder = source("src/components/CommentResponder.tsx")
  const endScreen = source("src/components/EndScreenTool.tsx")

  for (const primitive of [
    "ToolboxHeaderIconRail",
    "ToolboxHeaderTitle",
    "ToolboxHeaderHelpButton",
    "ToolboxHeaderCollapseButton",
    "ToolboxHeaderToggle",
  ]) {
    expect(primitives).toContain(`export const ${primitive}`)
    expect(toolbox).toContain(primitive)
  }

  for (const family of [
    "Toolbox Header Icon Rail",
    "SubToolbox Header Icon Rail",
    "Toolbox Header Title",
    "SubToolbox Header Title",
    "Toolbox Header Help",
    "SubToolbox Header Help",
    "Toolbox Header Collapse",
    "SubToolbox Header Collapse",
    "Toolbox Header Toggle",
    "SubToolbox Header Toggle",
  ]) expect(catalog).toContain(`"${family}"`)

  expect(toolbox).toContain('data-vt-split-left={isSubtoolboxPeer && showIconSection ? "true" : undefined}')
  expect(toolbox).toContain('showIconSection={props.showIconSection ?? true}')
  expect(manager).toContain('<SubToolboxGridActionButton')
  expect(commentResponder).toContain('label="Connect YouTube Channel"')
  expect(endScreen).toContain('label={genLoading ? "Creating..." : "Generate Template"}')
 })

 it("keeps first-layer interior strokes uniform with the upload-frame exception", () => {
  const css = source("src/styles/subtoolbox-system.css")
  const toolboxCss = source("src/styles/toolbox-system.css")

  expect(css).toContain("First visual layer inside a SubToolbox shares one 3px interior stroke")
  expect(css).toContain(":not(.vt-subtoolbox-file-target)")
  expect(css).toContain("--vt-component-stroke: var(--vt-subtoolbox-inner-stroke,3px)!important")
  expect(css).toContain(".vt-subtoolbox-file-target.vt-upload-tight-reveal")
  expect(css).toContain("box-shadow: none !important")
  expect(toolboxCss).toContain(".vt-subtoolbox-inset")
  expect(toolboxCss).toContain("padding: 4px 4px 0 !important")
 })

 it("keeps Thumbnail Studio primitive-native in the mobile density pass", () => {
  const thumbnail = source("src/views/ThumbnailStudio.tsx")

  expect(thumbnail).not.toContain("<button")
  expect(thumbnail).not.toContain("<select")
  expect(thumbnail).not.toContain("StandardUploadBox")
  expect(thumbnail).toContain("SubToolboxFileTarget")
  expect(thumbnail).toContain("SubToolboxSelectableTag")
  expect(thumbnail).toContain("SubToolboxSelectableListRow")
  expect(thumbnail).toContain('label={analyzeLoading ? "Scanning..." : "Scan Potential"}')
 })

 it("keeps the compact inner-control hierarchy below the subtoolbox shell", () => {
  const tokenSource = source("src/components/subtoolbox/tokens.ts")
  const systemCss = source("src/styles/subtoolbox-system.css")

  expect(tokenSource).toContain('radius: 8')
  expect(tokenSource).toContain('radius: 12')
  expect(systemCss).toMatch(/--vt-subtoolbox-inner-radius:\s*8px/)
  expect(systemCss).toContain('var(--vt-subtoolbox-shadow')
 })

 it("keeps the Mini Toolbox Lab divider and collapse timing contract", () => {
  const toolboxSource = source("src/components/Toolbox.tsx")
  const tokenSource = source("src/components/subtoolbox/tokens.ts")

  expect(tokenSource).toContain('duration-[600ms] ease-out motion-reduce:transition-none')
  expect(toolboxSource).toContain('borderBottom: `var(--vt-toolbox-stroke, ${stroke}px) solid black`')
  expect(toolboxSource).toContain('borderBottom: `var(--vt-subtoolbox-stroke, ${SUB_TOOLBOX_INNER_STROKE}px) solid black`')
  expect(toolboxSource).toContain('SHELL_COLLAPSE_DURATION_MS = SUBTOOLBOX_TOKENS.motion.collapseMs')
  expect(toolboxSource).toContain('shouldRenderContent = !unmountWhenClosed || open || keepClosingContentMounted')
  expect(toolboxSource).toContain('shouldRenderContent = !unmountOnClose || open || keepClosingContentMounted')
 })

 it("keeps one token authority and the analytics recipe on the canonical seam", () => {
  const toolboxSystem = source("src/components/ToolboxUISystem.tsx")
  const chartModule = source("src/components/SubToolboxChartModule.tsx")

  expect(toolboxSystem).not.toMatch(/export const CONTROL_SHELL\s*=\s*\{/)
  expect(toolboxSystem).toContain('export { CONTROL_SHELL } from "./subtoolbox/tokens"')
  expect(chartModule).toContain('data-vt-subtoolbox-module="true"')
  expect(chartModule).toContain('borderBottom: `var(--vt-subtoolbox-stroke')
  expect(chartModule).not.toContain('const headerBorderClass = collapsible && !internalOpen')
 })

 it("certifies the video-tool migration wave on canonical interior primitives", () => {
  const manager = source("src/views/VideoManager.tsx")
  const publisher = source("src/views/VideoPublisher.tsx")
  const registry = source("src/components/subtoolbox/registry.ts")

  for (const contents of [manager, publisher]) {
   expect(contents).not.toContain("StandardInput")
   expect(contents).not.toContain("StandardTextArea")
   expect(contents).not.toContain("SubToolboxInnerActionButton")
   expect(contents).toContain("SubToolboxStack")
  }

  expect(manager).toContain("SubToolboxVideoSelector")
  expect(manager).toContain("SubToolboxLabeledInput")
  expect(manager).toContain("SubToolboxLabeledTextArea")
  expect(manager).toContain("MiniSubToolbox")
  expect(manager).toContain("SubToolboxTagEditor")
  expect(manager).not.toContain("SubToolboxMetric")
  expect(manager).not.toContain('title="Choose Video"')
  expect(manager).not.toContain('title="Save Video Changes"')
  expect(manager).toContain('label={!connected ? connectionLabel')
  expect(manager).not.toContain("chooseVideoPalette")
  expect(manager).not.toContain("accentColor={card.accentColor}")
  expect(publisher).toContain("SubToolboxOutputCard")
  expect(publisher).toContain("SubToolboxFileTarget")
  expect(registry).toContain('{ id: 2, status: "complete", surfaces: ["VideoManager", "VideoPublisher"] }')
 })

 it("locks Video Manager spacing and level hierarchy to the new mobile authority", () => {
  const manager = source("src/views/VideoManager.tsx")
  const toolbox = source("src/components/Toolbox.tsx")
  const toolboxCss = source("src/styles/toolbox-system.css")
  const primitiveCss = source("src/styles/subtoolbox-system.css")
  const service = source("src/services/simpleYouTubeApi.ts")

  expect(toolboxCss).toContain("--vt-toolbox-shell-gutter:6px")
  expect(toolboxCss).toContain("--vt-toolbox-shell-gutter:5px")
  expect(toolboxCss).toContain('[data-vt-toolbox-level="sub"] .vt-subtoolbox-inset')
  expect(toolboxCss).toContain("padding:0!important")
  expect(toolbox).toContain("export const MiniSubToolbox")
  expect(toolbox).toContain('data-vt-toolbox-level="mini"')
  expect(primitiveCss).toContain(".vt-subtoolbox-labeled-field")
  expect(primitiveCss).toContain(".vt-subtoolbox-video-selector")
  expect(primitiveCss).toContain("text-overflow:clip")
  expect(primitiveCss).toContain(".vm-thumbnail-canvas")
  expect(manager).toContain('level="l0"')
  expect(manager).toContain('overlayLabel="TITLE"')
  expect(manager).toContain('overlayLabel="DESCRIPTION"')
  expect(manager).toContain('navigate("/thumbnail-studio"')
  expect(service).toContain("duration?: string")
 })

 it("keeps production fields and the imported component library on one styling authority", () => {
  const toolboxSource = source("src/components/Toolbox.tsx")
  const systemCss = source("src/styles/subtoolbox-system.css")
  const migrationCatalog = source("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
  const migrationCss = source("src/components/studio-hub/studio-hub-primitive-migration-catalog.css")

  expect(toolboxSource).toContain('["--pair-a" as any]: headerHex')
  expect(toolboxSource).toContain('["--pair-b" as any]: iconBg')

  expect(systemCss).toContain("CANONICAL TEXT FIELD STATE CONTRACT")
  expect(systemCss).toContain("color-mix(in srgb,var(--field-accent) 50%,white)")
  expect(systemCss).toContain("caret-color:var(--field-accent)!important")
  expect(systemCss).toContain("inset 0 0 0 var(--field-stroke) var(--field-accent)")
  expect(systemCss).toContain("color-mix(in srgb,var(--field-glow) 78%,transparent)")

  expect(migrationCatalog).toContain('from "../subtoolbox/SubToolboxPrimitives"')
  expect(migrationCatalog).toContain('from "../subtoolbox/SubToolboxSplitPrimitives"')
  expect(migrationCatalog).toContain('import "./studio-hub-primitive-migration-catalog.css"')
  expect(migrationCatalog).not.toContain('import "./studio-hub-complete-primitive-catalog.css"')
  expect(migrationCatalog).toContain('className="vt-primitive-migration-catalog"')
  expect(migrationCatalog).toContain('import { SubToolbox } from "../Toolbox"')
  expect(migrationCatalog).toContain('import type { ToolboxControlLevel } from "../subtoolbox/tokens"')
  expect(migrationCatalog).not.toContain('from "./StudioHubCompletePrimitiveCatalog"')
  expect(migrationCatalog).toContain('paletteIndex={paletteIndex + index}')
  expect(migrationCatalog).not.toContain("VT_SPECTRUM_PALETTE_06")
  expect(migrationCatalog).not.toContain("const pair =")
  expect(migrationCatalog).not.toContain('"--pair-a"')
  expect(migrationCatalog).not.toContain('"--pair-b"')
  expect(migrationCss).not.toContain(".vt-subtoolbox-input")
  expect(migrationCss).not.toContain(".vt-subtoolbox-textarea")
  expect(migrationCss).not.toContain("[data-vt-studio-control]")
 })

 it("keeps component colors owned by the nearest SubToolbox pair", () => {
  const split = source("src/components/subtoolbox/SubToolboxSplitPrimitives.tsx")
  const primitives = source("src/components/subtoolbox/SubToolboxPrimitives.tsx")
  const studioControls = source("src/studio-ui/primitives/StudioControls.tsx")
  const toolbox = source("src/components/Toolbox.tsx")
  const manager = source("src/views/VideoManager.tsx")
  const publisher = source("src/views/VideoPublisher.tsx")
  const community = source("src/components/CommunityPostGenerator.tsx")

  for (const forbidden of ["railColor?:", "labelColor?:", "accentColor?:"]) {
   expect(split).not.toContain(forbidden)
  }
  expect(primitives).not.toContain("toneColor?:")
  expect(primitives).not.toContain("accentColor?:")
  expect(studioControls).not.toContain("railColor?:")
  expect(toolbox).not.toContain("surfaceColor?: string;")
  expect(toolbox).not.toContain("controlColor?: string;")
  expect(manager).not.toContain("surfaceColor=")
  expect(manager).not.toContain("controlColor=")
  expect(publisher).not.toContain("accentColor=")
  expect(publisher).not.toContain("surfaceColor=")
  expect(community).not.toContain("railColor=")
  expect(community).not.toContain("--vt-studio-control-accent")
  expect(manager).toContain('className="vm-update-video-action"')
  expect(publisher).toContain('title="Generate Assets"')
  expect(publisher).toContain('title="Generated Assets"')
 })

 it("keeps legacy production dropdowns on pair A / pair B even through portals", () => {
  const toolbox = source("src/components/Toolbox.tsx")
  const css = source("src/styles/subtoolbox-system.css")

  expect(toolbox).toContain("const resolvedSurface = `var(--pair-a")
  expect(toolbox).toContain("const resolvedSecondary = `var(--pair-b")
  expect(toolbox).toContain("const resolvedTitle = `var(--pair-a")
  expect(toolbox).toContain("const resolvedBody = `var(--pair-b")
  expect(toolbox).toContain('data-vt-subtoolbox-dropdown-portal="true"')
  expect(toolbox).toContain('getPropertyValue("--pair-a")')
  expect(toolbox).toContain('getPropertyValue("--pair-b")')
  expect(css).toContain('[data-vt-subtoolbox-dropdown-portal="true"]')
 })

 it("bridges the owning SubToolbox pair into detached dropdown portals", () => {
  const primitives = source("src/components/subtoolbox/SubToolboxPrimitives.tsx")
  const css = source("src/styles/subtoolbox-system.css")

  expect(primitives).toContain('getPropertyValue("--pair-a")')
  expect(primitives).toContain('getPropertyValue("--pair-b")')
  expect(primitives).toContain('["--pair-a" as string]: inheritedPair.pairA')
  expect(primitives).toContain('["--pair-b" as string]: inheritedPair.pairB')
  expect(css).toContain(".vt-subtoolbox-top-title-dropdown-panel{")
  expect(css).toContain("--vt-top-title-title:var(--pair-a")
  expect(css).toContain("--vt-top-title-body:var(--pair-b")
 })

 it("keeps legacy Studio field wrappers on the same inherited pair and field-state contract", () => {
  const studioCss = source("src/styles/studio-control-system.css")

  expect(studioCss).toContain("--vt-studio-control-accent: var(--pair-a")
  expect(studioCss).toContain("--vt-studio-control-secondary: var(--pair-b")
  expect(studioCss).toContain("color-mix(in srgb, var(--vt-studio-control-accent) 50%, #fff)")
  expect(studioCss).toContain("inset 0 0 0 var(--vt-studio-control-stroke) var(--vt-studio-control-accent)")
  expect(studioCss).toContain("color-mix(in srgb, var(--vt-studio-control-secondary) 78%, transparent)")
 })

 it("derives every SubToolbox component pair from the canonical 12-color title/icon pattern", () => {
  const palette = source("src/styles/toolboxPalette.ts")
  const toolboxSource = source("src/components/Toolbox.tsx")
  const splitCss = source("src/styles/subtoolbox-split-primitives.css")

  expect(palette).toContain("export const VT_SPECTRUM_PALETTE_06 = [")
  expect(palette).toContain("header: getPaletteColor(index)")
  expect(palette).toContain("icon: getPaletteColor(index + 4)")
  expect(toolboxSource).toContain('["--pair-a" as any]: headerHex')
  expect(toolboxSource).toContain('["--pair-b" as any]: iconBg')
  expect(splitCss).toContain("--vt-split-rail: var(--pair-b")
  expect(splitCss).toContain("--vt-split-label: var(--pair-a")
  expect(splitCss).toContain("--vt-kpi-accent: var(--pair-a")
  expect(splitCss).toContain("--vt-kpi-rail: var(--pair-b")
 })
})
