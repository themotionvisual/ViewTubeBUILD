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

  it("uses canonical primitive owners inside every dedicated panel", () => {
    for (const file of [
      "./SettingsAccountPanel.tsx",
      "./SettingsAiRuntimePanel.tsx",
      "./SettingsBillingPanel.tsx",
      "./SettingsDataPrivacyPanel.tsx",
    ]) {
      const source = readLocal(file)
      expect(source).toContain("SubToolbox")
      expect(source).toContain("level=\"l1\"")
      expect(source).not.toContain("shadow-[")
      expect(source).not.toContain("rounded-[20px]")
    }
  })

  it("moves destructive confirmation onto a dedicated primitive composition", () => {
    const settings = readLocal("../Settings.tsx")
    const dialog = readLocal("./SettingsConfirmationDialog.tsx")
    expect(settings).toContain("SettingsConfirmationDialog")
    expect(settings).not.toContain('role="dialog" className=')
    expect(dialog).toContain("SubToolboxSurface")
    expect(dialog).toContain("SubToolboxInput")
    expect(dialog).toContain("SubToolboxButton")
  })

  it("rebuilds Help and Legal as compact primitive rows", () => {
    const source = readLocal("./SettingsHelpSection.tsx")
    expect(source).toContain("SubToolboxSelectableListRow")
    expect(source).toContain("SubToolboxLinkButton")
    expect(source).not.toContain("HelpCard")
    expect(source).not.toContain("canonicalButtonClass")
  })
})
