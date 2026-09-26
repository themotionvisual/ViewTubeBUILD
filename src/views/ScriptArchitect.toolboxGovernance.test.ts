import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./ScriptArchitect.tsx", import.meta.url), "utf8")

describe("Script Architect canonical field migration", () => {
  it("uses canonical field primitives and palette-owned shell identity", () => {
    expect(source).not.toContain("StandardInput")
    expect(source).not.toContain("StandardTextArea")
    expect(source).toContain("SubToolboxInput")
    expect(source).toContain("SubToolboxTextArea")
    expect(source).not.toContain('headerColor="bg-[#00F0FF]"')
    expect(source).not.toContain('iconBoxColor="bg-[#CCFF00]"')
  })

  it("preserves Script Architect domain wiring", () => {
    expect(source).toContain("useScriptArchitect()")
    expect(source).toContain('architect.setField("topic"')
    expect(source).toContain("architect.updateReference")
    expect(source).toContain("architect.updateFragment")
    expect(source).toContain("architect.assemble")
  })
})
