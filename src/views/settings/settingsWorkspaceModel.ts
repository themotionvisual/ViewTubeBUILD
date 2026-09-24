import type { SettingsPanel, SettingsReadiness } from "./settingsControlDeck"

export interface SettingsPanelDefinition {
  id: SettingsPanel
  label: string
  shortLabel: string
  description: string
  paletteIndex: number
}

export const SETTINGS_PANEL_DEFINITIONS: readonly SettingsPanelDefinition[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", description: "System readiness", paletteIndex: 0 },
  { id: "account", label: "Account", shortLabel: "Account", description: "Identity and channel", paletteIndex: 1 },
  { id: "ai", label: "AI Runtime", shortLabel: "AI", description: "Brain, models, API key", paletteIndex: 2 },
  { id: "widgets", label: "Dashboard Widgets", shortLabel: "Widgets", description: "Show or hide widgets", paletteIndex: 3 },
  { id: "experience", label: "Experience", shortLabel: "Experience", description: "Navigation and workspace behavior", paletteIndex: 4 },
  { id: "billing", label: "Plan + Credits", shortLabel: "Plan", description: "Billing and referrals", paletteIndex: 5 },
  { id: "data", label: "Data + Privacy", shortLabel: "Data", description: "Sources and recovery", paletteIndex: 6 },
  { id: "help", label: "Help + Legal", shortLabel: "Help", description: "Guides and policies", paletteIndex: 7 },
] as const

export const getSettingsPanelDefinition = (panel: SettingsPanel): SettingsPanelDefinition =>
  SETTINGS_PANEL_DEFINITIONS.find((entry) => entry.id === panel) ?? SETTINGS_PANEL_DEFINITIONS[0]

export interface SettingsOverviewModel {
  readiness: SettingsReadiness
  identity: {
    title: string
    detail: string
  }
  plan: {
    title: string
    detail: string
  }
  data: {
    title: string
    detail: string
  }
}

export const buildSettingsOverviewModel = (input: {
  readiness: SettingsReadiness
  profileName: string
  currentHandleValue: string
  currentEmail: string
  planId: string
  creditsLabel: string
  ingestMode: string
}): SettingsOverviewModel => ({
  readiness: input.readiness,
  identity: {
    title: input.profileName || "No creator loaded",
    detail: input.currentHandleValue || input.currentEmail || "Connect to load identity",
  },
  plan: {
    title: input.planId,
    detail: input.creditsLabel,
  },
  data: {
    title: input.ingestMode.replaceAll("_", " "),
    detail: "Analytics source",
  },
})
