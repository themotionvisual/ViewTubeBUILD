import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const readLocal = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("Settings Account + AI primitive governance", () => {
  it("routes Account and AI through dedicated primitive panels", () => {
    const source = readLocal("./UnifiedAccountSettingsSection.tsx")
    expect(source).toContain("SettingsAccountPanel")
    expect(source).toContain("SettingsAiPanel")
    expect(source).not.toContain('title="Creator passport"')
    expect(source).not.toContain('title="Model orchestration"')
  })

  it("keeps Account and AI leaf panels on canonical primitives and Studio controls", () => {
    const account = readLocal("./SettingsAccountPanel.tsx")
    const ai = readLocal("./SettingsAiPanel.tsx")

    expect(account).toContain("SubToolboxSettingsSwitch")
    expect(account).toContain("SubToolboxNameValueList")
    expect(account).toContain("StudioInput")
    expect(ai).toContain("SubToolbox")
    expect(ai).toContain("StudioInput")
    expect(ai).not.toContain("rounded-[20px]")
  })
})
