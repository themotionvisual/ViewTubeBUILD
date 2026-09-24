import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const readLocal = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8")

describe("Settings remaining-panel primitive governance", () => {
  it("removes the last legacy Settings card/input/button authority from the orchestrator", () => {
    const source = readLocal("./UnifiedAccountSettingsSection.tsx")
    expect(source).toContain("SettingsBillingPanel")
    expect(source).toContain("SettingsDataPrivacyPanel")
    expect(source).not.toContain("const Card")
    expect(source).not.toContain("buttonClass")
    expect(source).not.toContain("inputClass")
    expect(source).not.toContain("labelClass")
  })

  it("keeps the upstream Account, AI and Dashboard primitive migrations intact", () => {
    const source = readLocal("./UnifiedAccountSettingsSection.tsx")
    const widgets = readLocal("./DashboardWidgetsSettingsSection.tsx")
    expect(source).toContain("SettingsAccountPanel")
    expect(source).toContain("SettingsAiPanel")
    expect(widgets).toContain("dashboardWidgetSettingsModel")
    expect(widgets).toContain("SubToolboxSettingsSwitch")
  })

  it("rebuilds Help and Legal as compact primitive rows", () => {
    const source = readLocal("./SettingsHelpSection.tsx")
    expect(source).toContain("SubToolboxSelectableListRow")
    expect(source).toContain("SubToolboxLinkButton")
    expect(source).not.toContain("HelpCard")
    expect(source).not.toContain("canonicalButtonClass")
  })

  it("moves destructive confirmation into a dedicated primitive composition", () => {
    const settings = readLocal("../Settings.tsx")
    const dialog = readLocal("./SettingsConfirmationDialog.tsx")
    expect(settings).toContain("SettingsConfirmationDialog")
    expect(settings).not.toContain('role="dialog" className=')
    expect(dialog).toContain("SubToolboxSurface")
    expect(dialog).toContain("SubToolboxInput")
    expect(dialog).toContain("SubToolboxButton")
  })
})
