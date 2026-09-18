import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

/**
 * Comments explain the overrides that were removed and quote them verbatim, so
 * assert against code only — otherwise the explanation trips its own gate.
 */
const codeOnly = (source: string) =>
  source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")

const moduleCode = codeOnly(read("src/components/projects/ProjectsToolboxModule.tsx"))
const pageSource = read("src/views/ProjectCalendarPage.tsx")
const projectStudioSource = read("src/components/ProjectStudio.tsx")
const storyboardSource = read("src/views/StoryboardStudio.tsx")
const embeddedStudioSource = read("src/components/projects/EmbeddedProjectStudio.tsx")

describe("Projects level-0 shell ownership", () => {
  // ProjectsToolboxModule owns the frame. A tool mounted inside it that renders
  // its own level-0 ToolboxScaffold puts a second frame and a second title on
  // the page — Storyboard Studio showed its name twice this way.
  it("strips no inner shell from the outside", () => {
    // The wrapper used to carry eight `!important` arbitrary-variant overrides.
    // Two matched nothing on the page; the rest could only reach a direct
    // child, so a nested frame kept its header regardless.
    expect(moduleCode).not.toMatch(/\[&>div\]:!/)
    expect(moduleCode).not.toMatch(/header:first-child\]:!hidden/)
    expect(moduleCode).not.toContain("data-vt-legacy-tool-header")
  })

  it("gives tools that render their own scaffold a way to drop it", () => {
    // The contract is chrome="none", not a caller-side override. `embedded`
    // only removes content padding and never suppressed the shell.
    for (const [name, source] of [
      ["ProjectStudio", projectStudioSource],
      ["StoryboardStudio", storyboardSource],
    ] as const) {
      expect(source, `${name} should resolve chrome from embedded`).toMatch(
        /chrome=\{embedded \? "none" : "full"\}/,
      )
    }
    // ...and the Projects mounts must actually pass embedded.
    expect(embeddedStudioSource).toContain("<ProjectStudio embedded />")
    expect(pageSource).toMatch(/<StoryboardStudio embedded/)
  })

  it("keeps one level-0 module per Projects section", () => {
    const mounts = pageSource.match(/<ProjectsToolboxModule\b/g) ?? []
    const sections = pageSource.match(/<section id="/g) ?? []
    expect(mounts.length).toBe(sections.length)
    expect(mounts.length).toBeGreaterThan(0)
  })
})
