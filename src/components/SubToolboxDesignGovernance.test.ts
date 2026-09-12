import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const productionSubtoolboxConsumers = [
 "src/components/PreLaunchPriming.tsx",
 "src/components/ProjectStudio.tsx",
 "src/views/ActionableTactics.tsx",
 "src/views/MediaAnalyzer.tsx",
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
  expect(systemCss).toContain('--vt-subtoolbox-shadow-offset: 4px')
  expect(systemCss).toContain('[data-vt-toolbox-level="sub"]')
 })

 it("keeps the compact inner-control hierarchy below the subtoolbox shell", () => {
  const tokenSource = source("src/components/subtoolbox/tokens.ts")
  const systemCss = source("src/styles/subtoolbox-system.css")

  expect(tokenSource).toContain('radius: 8')
  expect(tokenSource).toContain('radius: 12')
  expect(systemCss).toContain('--vt-subtoolbox-inner-radius: 8px')
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
})
