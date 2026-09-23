import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Studio primitive rollout wave 1", () => {
  it("routes every Script Architect generic button through the canonical primitive", () => {
    const source = read("src/views/ScriptArchitect.tsx")
    expect(source).toContain('from "../components/subtoolbox/SubToolboxPrimitives"')
    expect(source.match(/<SubToolboxButton\b/g)?.length ?? 0).toBeGreaterThanOrEqual(17)
    expect(source).not.toMatch(/<button\b/)
  })

  it("uses one segmented primitive for Thumbnail Studio mode and preview surface", () => {
    const source = read("src/views/ThumbnailStudio.tsx")
    expect(source.match(/<SubToolboxSegmentedToggle\b/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect(source).toContain('ariaLabel="Thumbnail Studio mode"')
    expect(source).toContain('ariaLabel="Thumbnail preview surface"')
    expect(source).not.toContain("StandardButton")
  })
})
