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

  expect(responsiveCss).not.toMatch(/\.vt-toolbox\[data-vt-toolbox\][^{]*\{[^}]*currentColor/s)
  expect(responsiveCss).toContain('--vt-subtoolbox-shadow-offset: 4px')
  expect(responsiveCss).toContain('[data-vt-toolbox-level="sub"]')
 })

 it("keeps the compact inner-control hierarchy below the subtoolbox shell", () => {
  const toolboxSource = source("src/components/Toolbox.tsx")
  const globalCss = source("src/index.css")

  expect(toolboxSource).toContain('radius: 8')
  expect(toolboxSource).toContain('rounded-[8px]')
  expect(globalCss).toContain('border-radius: 8px')
  expect(globalCss).toContain('var(--vt-subtoolbox-shadow')
 })

 it("keeps the Mini Toolbox Lab divider and collapse timing contract", () => {
  const toolboxSource = source("src/components/Toolbox.tsx")

  expect(toolboxSource).toContain('duration-300 ease-out motion-reduce:transition-none')
  expect(toolboxSource).toContain('borderBottom: `var(--vt-toolbox-stroke, ${stroke}px) solid black`')
  expect(toolboxSource).toContain('borderBottom: `var(--vt-subtoolbox-stroke, ${SUB_TOOLBOX_INNER_STROKE}px) solid black`')
  expect(toolboxSource).toContain('SHELL_COLLAPSE_DURATION_MS = 300')
  expect(toolboxSource).toContain('shouldRenderContent = !unmountWhenClosed || open || keepClosingContentMounted')
  expect(toolboxSource).toContain('shouldRenderContent = !unmountOnClose || open || keepClosingContentMounted')
 })
})
