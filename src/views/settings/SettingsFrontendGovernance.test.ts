import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const readLocal = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8")

describe("Settings frontend primitive governance", () => {
  it("replaces the page hero with the compact SettingsWorkspace shell", () => {
    const source = readLocal("../Settings.tsx")
    expect(source).toContain("SettingsWorkspace")
    expect(source).not.toContain("Creator control deck")
    expect(source).not.toContain("text-7xl")
  })

  it("migrates Experience away from Settings-local card and switch geometry", () => {
    const source = readLocal("./WorkspaceExperienceSettingsSection.tsx")
    expect(source).toContain("SubToolbox")
    expect(source).toContain("SubToolboxSettingsSwitch")
    expect(source).toContain("SubToolboxSegmentedToggle")
    expect(source).not.toContain("min-h-[118px]")
    expect(source).not.toContain("rounded-[20px]")
  })
})
