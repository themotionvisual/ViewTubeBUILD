import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Studio primitive rollout wave 2", () => {
  it("keeps Media Analyzer visible controls primitive-owned", () => {
    const source = read("src/views/MediaAnalyzer.tsx")

    expect(source).toContain("SubToolboxFileTarget")
    expect(source).toContain("SubToolboxInput")
    expect(source).toContain("SubToolboxTextArea")
    expect(source).toContain("SubToolboxButton")
    expect(source).not.toContain("StandardInput")
    expect(source).not.toContain("StandardTextArea")
    expect(source).not.toContain("StandardUploadBox")
    expect(source).not.toMatch(/<button\b/)

    const nativeInputs = source.match(/<input\b/g) ?? []
    expect(nativeInputs).toHaveLength(3)
    expect(source.match(/className="hidden"/g)?.length ?? 0).toBeGreaterThanOrEqual(3)

    expect(source).not.toContain('bg-[#FFDD00] border-[3px] border-black')
    expect(source).not.toContain('bg-[#00CCFF] border-[3px] border-black')
    expect(source).not.toContain('bg-[#CCFF00] border-[4px] border-black')
  })

  it("keeps Pre-Launch Priming actions and fields primitive-owned", () => {
    const source = read("src/components/PreLaunchPriming.tsx")

    expect(source).toContain("SubToolboxSelectableListRow")
    expect(source).toContain("SubToolboxFieldLabel")
    expect(source).toContain("SubToolboxInput")
    expect(source).toContain("SubToolboxButton")
    expect(source).not.toMatch(/<button\b/)
    expect(source).not.toMatch(/<input\b/)
    expect(source).not.toContain("vt-input-standard")
    expect(source).not.toContain('bg-[#CCFF00] border-[4px] border-black')
  })

  it("records wave 3 as an active migration across the newly converted surfaces", () => {
    const registry = read("src/components/subtoolbox/registry.ts")
    expect(registry).toContain('{ id: 3, status: "migrating"')
    expect(registry).toContain('"MediaAnalyzer", "PreLaunchPriming"')
  })
})
