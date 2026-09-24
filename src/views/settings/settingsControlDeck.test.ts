import { describe, expect, it } from "vitest"

import { ANONYMOUS_ACCOUNT_SNAPSHOT } from "../../services/account/accountContracts"
import {
  resolveSettingsPanel,
  resolveSettingsReadiness,
} from "./settingsControlDeck"

describe("settings control deck", () => {
  it("preserves billing deep links and normalizes unknown panels", () => {
    expect(resolveSettingsPanel("billing")).toBe("billing")
    expect(resolveSettingsPanel("workspace-data")).toBe("data")
    expect(resolveSettingsPanel("not-a-panel")).toBe("overview")
    expect(resolveSettingsPanel(null)).toBe("overview")
  })

  it("preserves every public settings panel alias used by deep links", () => {
    const aliases = {
      overview: "overview",
      account: "account",
      profile: "account",
      connections: "account",
      ai: "ai",
      "ai-brain-context": "ai",
      "api-keys": "ai",
      widgets: "widgets",
      "dashboard-widgets": "widgets",
      dashboard: "widgets",
      experience: "experience",
      usability: "experience",
      navigation: "experience",
      workspace: "experience",
      billing: "billing",
      "billing-meter": "billing",
      data: "data",
      "workspace-data": "data",
      privacy: "data",
      help: "help",
      "help-policies": "help",
      "guide-protocols": "help",
    } as const

    for (const [alias, panel] of Object.entries(aliases)) {
      expect(resolveSettingsPanel(alias)).toBe(panel)
    }
  })

  it("prioritizes account and channel recovery before optional setup", () => {
    const anonymous = resolveSettingsReadiness(ANONYMOUS_ACCOUNT_SNAPSHOT, false, false)
    expect(anonymous.nextPanel).toBe("account")
    expect(anonymous.nextLabel).toBe("Create or sign in to your ViewTube account")

    const signedIn = resolveSettingsReadiness({
      ...ANONYMOUS_ACCOUNT_SNAPSHOT,
      authentication: { status: "authenticated", accountExists: true },
      nextIntent: "connect_channel",
    }, false, false)
    expect(signedIn.nextPanel).toBe("account")
    expect(signedIn.nextLabel).toBe("Connect your YouTube channel")
  })

  it("reports a ready system only after account, channel, billing, and Brain setup", () => {
    const ready = resolveSettingsReadiness({
      ...ANONYMOUS_ACCOUNT_SNAPSHOT,
      authentication: { status: "authenticated", accountExists: true },
      google: {
        ...ANONYMOUS_ACCOUNT_SNAPSHOT.google,
        status: "connected",
        youtubeScopesGranted: true,
      },
      billing: { status: "active", planId: "creator" },
      onboarding: { status: "complete", nextStep: null },
      nextIntent: "manage_account",
    }, true, true)

    expect(ready.completed).toBe(4)
    expect(ready.nextPanel).toBe("overview")
    expect(ready.nextLabel).toBe("Your creator system is ready")
  })
})
