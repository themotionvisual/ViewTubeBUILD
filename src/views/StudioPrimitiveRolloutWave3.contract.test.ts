import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Studio primitive rollout wave 3", () => {
  it("keeps End-Screen Architect generic controls primitive-owned", () => {
    const source = read("src/components/EndScreenTool.tsx")

    for (const primitive of [
      "SubToolboxButton",
      "SubToolboxColorPicker",
      "SubToolboxFieldLabel",
      "SubToolboxFileTarget",
      "SubToolboxIconButton",
      "SubToolboxInput",
      "SubToolboxLinkButton",
      "SubToolboxSelect",
      "SubToolboxSelectableTag",
      "SubToolboxTextArea",
    ]) expect(source).toContain(primitive)

    expect(source).not.toMatch(/<button\b/)
    expect(source).not.toMatch(/<input\b/)
    expect(source).not.toMatch(/<select\b/)
    expect(source).not.toContain("StandardButton")
    expect(source).not.toContain("StandardTextArea")
    expect(source).not.toContain("vt-input-standard")
  })

  it("keeps Video Director selector rows primitive-owned", () => {
    const source = read("src/views/VideoDirector.tsx")
    expect(source).toContain("SubToolboxSelectableListRow")
    expect(source).not.toMatch(/<button\b/)
  })

  it("keeps Actionable Tactics generic actions primitive-owned", () => {
    const source = read("src/views/ActionableTactics.tsx")
    expect(source).toContain("SubToolboxButton")
    expect(source).not.toMatch(/<button\b/)
  })

  it("keeps Hook Generator input actions primitive-owned", () => {
    const source = read("src/views/HookGenerator.tsx")
    expect(source).toContain("SubToolboxFieldLabel")
    expect(source).toContain("SubToolboxTextArea")
    expect(source).toContain("SubToolboxButton")
    expect(source).not.toContain("StandardTextArea")
    expect(source).not.toMatch(/<button\b/)
  })

  it("records all wave-3 production surfaces in the migration ledger", () => {
    const registry = read("src/components/subtoolbox/registry.ts")
    for (const surface of [
      "ScriptArchitect",
      "ActionableTactics",
      "MediaAnalyzer",
      "PreLaunchPriming",
      "EndScreenTool",
      "VideoDirector",
      "HookGenerator",
    ]) expect(registry).toContain(`"${surface}"`)
  })
})
