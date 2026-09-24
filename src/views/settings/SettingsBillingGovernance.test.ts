import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const unified = readFileSync(new URL("./UnifiedAccountSettingsSection.tsx", import.meta.url), "utf8")
const billing = readFileSync(new URL("./SettingsBillingPanel.tsx", import.meta.url), "utf8")

describe("Settings Billing primitive governance", () => {
  it("routes billing through a dedicated primitive panel", () => {
    expect(unified).toContain("SettingsBillingPanel")
    expect(unified).not.toContain('title="Billing and credits"')
    expect(unified).not.toContain('title="Plans"')
  })

  it("removes the six-card billing wall and uses canonical controls", () => {
    expect(billing).toContain("SubToolboxMeter")
    expect(billing).toContain("SubToolboxSplitDropdown")
    expect(billing).toContain("SubToolboxMetricStrip")
    expect(billing).toContain("StudioNumberInput")
    expect(billing).not.toContain("xl:grid-cols-3")
    expect(billing).not.toContain("rounded-2xl")
  })
})
