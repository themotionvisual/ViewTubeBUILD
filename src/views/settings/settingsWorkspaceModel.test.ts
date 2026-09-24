import { describe, expect, it } from "vitest"

import {
  SETTINGS_PANEL_DEFINITIONS,
  getSettingsPanelDefinition,
} from "./settingsWorkspaceModel"

describe("Settings workspace model", () => {
  it("keeps the eight existing settings panels in one canonical order", () => {
    expect(SETTINGS_PANEL_DEFINITIONS.map((panel) => panel.id)).toEqual([
      "overview",
      "account",
      "ai",
      "widgets",
      "experience",
      "billing",
      "data",
      "help",
    ])
  })

  it("keeps panel identities unique and gives each panel compact navigation copy", () => {
    const ids = SETTINGS_PANEL_DEFINITIONS.map((panel) => panel.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const panel of SETTINGS_PANEL_DEFINITIONS) {
      expect(panel.label.length).toBeGreaterThan(1)
      expect(panel.shortLabel.length).toBeGreaterThan(1)
      expect(panel.description.length).toBeGreaterThan(4)
    }
  })

  it("resolves a panel definition without introducing another route-normalization layer", () => {
    expect(getSettingsPanelDefinition("experience").label).toBe("Experience")
    expect(getSettingsPanelDefinition("billing").shortLabel).toBe("Plan")
  })
})
