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
  expect(systemCss).toMatch(/--vt-subtoolbox-shadow-offset:\s*4px/)
  expect(systemCss).toContain('[data-vt-toolbox-level="sub"]')
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

  expect(tokenSource).toContain('duration-300 ease-out motion-reduce:transition-none')
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
   expect(contents).toContain("SubToolboxInput")
   expect(contents).toContain("SubToolboxStack")
  }

  expect(manager).toContain("SubToolboxMetric")
  expect(manager).toContain('title="Choose Video"')
  expect(manager).not.toContain("chooseVideoPalette")
  expect(manager).not.toContain("accentColor={card.accentColor}")
  expect(publisher).toContain("SubToolboxOutputCard")
  expect(publisher).toContain("SubToolboxFileTarget")
  expect(registry).toContain('{ id: 2, status: "complete", surfaces: ["VideoManager", "VideoPublisher"] }')
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
  expect(manager).toContain('title="Save Video Changes"')
  expect(publisher).toContain('title="Generate Assets"')
  expect(publisher).toContain('title="Generated Assets"')
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
