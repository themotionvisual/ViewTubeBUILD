import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const readLocal = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8")

describe("Settings all-panel primitive governance", () => {
  it("removes the legacy Settings card/button/input mini design system", () => {
    const source = readLocal("./UnifiedAccountSettingsSection.tsx")
    expect(source).not.toContain("const Card")
    expect(source).not.toContain("buttonClass")
    expect(source).not.toContain("inputClass")
    expect(source).not.toContain("labelClass")
  })

  it("routes every remaining settings domain through dedicated primitive panels", () => {
    const source = readLocal("./UnifiedAccountSettingsSection.tsx")
    for (const name of [
      "SettingsAccountPanel",
      "SettingsAiRuntimePanel",
      "SettingsBillingPanel",
      "SettingsDataPrivacyPanel",
    ]) {
      expect(source).toContain(name)
    }
  })

  it("rebuilds dashboard widget settings with canonical primitive controls", () => {
    const source = readLocal("./DashboardWidgetsSettingsSection.tsx")
    expect(source).toContain("SubToolboxSettingsSwitch")
    expect(source).toContain("SubToolboxInput")
    expect(source).toContain("SubToolboxSelect")
    expect(source).not.toContain("buttonClass")
    expect(source).not.toContain("rounded-[20px]")
  })

  it("rebuilds Help and Legal as compact primitive rows", () => {
    const source = readLocal("./SettingsHelpSection.tsx")
    expect(source).toContain("SubToolboxSelectableListRow")
    expect(source).toContain("SubToolboxLinkButton")
    expect(source).not.toContain("HelpCard")
    expect(source).not.toContain("canonicalButtonClass")
  })
})
