import { describe, expect, it } from "vitest"
import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  buildAccountRoute,
  parseAccountIntent,
  resolveAccountActionLabel,
  resolveAccountChipLabel,
  resolveAccountSurfaceLabel,
  resolveAccountIntent,
  sanitizeInternalReturnTo,
  type UnifiedAccountSnapshot,
} from "./accountContracts"

const snapshot = (overrides: Partial<UnifiedAccountSnapshot>): UnifiedAccountSnapshot => ({
  ...ANONYMOUS_ACCOUNT_SNAPSHOT,
  ...overrides,
  authentication: {
    ...ANONYMOUS_ACCOUNT_SNAPSHOT.authentication,
    ...overrides.authentication,
  },
  google: {
    ...ANONYMOUS_ACCOUNT_SNAPSHOT.google,
    ...overrides.google,
  },
})

describe("unified account copy", () => {
  it("uses Sign up for a new or unknown user", () => {
    expect(resolveAccountActionLabel(ANONYMOUS_ACCOUNT_SNAPSHOT)).toBe("Sign up")
    expect(resolveAccountChipLabel(ANONYMOUS_ACCOUNT_SNAPSHOT)).toBe("Sign up")
  })

  it("uses Sign in for a recognized signed-out account", () => {
    const state = snapshot({ authentication: { status: "anonymous", accountExists: true } })
    expect(resolveAccountIntent(state)).toBe("log_in")
    expect(resolveAccountActionLabel(state)).toBe("Sign in")
    expect(resolveAccountChipLabel(state)).toBe("Sign in")
    expect(resolveAccountSurfaceLabel(state, "settings")).toBe("Sign in to ViewTube")
  })

  it("uses channel-specific actions after authentication", () => {
    const disconnected = snapshot({ authentication: { status: "authenticated", accountExists: true } })
    expect(resolveAccountActionLabel(disconnected)).toBe("Connect Channel")

    const revoked = snapshot({
      authentication: { status: "authenticated", accountExists: true },
      google: { status: "revoked", youtubeScopesGranted: false, channelId: null },
    })
    expect(resolveAccountActionLabel(revoked)).toBe("Reconnect Channel")

    const connected = snapshot({
      authentication: { status: "authenticated", accountExists: true },
      google: { status: "connected", youtubeScopesGranted: true, channelId: "UC123" },
    })
    expect(resolveAccountActionLabel(connected)).toBe("Account")
    expect(resolveAccountChipLabel(connected)).toBe("Connected")
    expect(resolveAccountSurfaceLabel(connected, "topbar")).toBe("Connected")
    expect(resolveAccountSurfaceLabel(connected, "sidebar")).toBe("Sync Data")
    expect(resolveAccountSurfaceLabel(connected, "settings")).toBe("Connected")
  })

  it("shows connecting copy while auth is pending", () => {
    const connecting = snapshot({
      authentication: { status: "pending", accountExists: true },
      nextIntent: "connect_channel",
    })
    expect(resolveAccountActionLabel(connecting)).toBe("Connecting…")
    expect(resolveAccountChipLabel(connecting)).toBe("Connecting…")
    expect(resolveAccountSurfaceLabel(connecting, "settings")).toBe("Connecting…")
  })

  it("rejects external return destinations", () => {
    expect(sanitizeInternalReturnTo("/local-analytics?tab=sync#run")).toBe("/local-analytics?tab=sync#run")
    expect(sanitizeInternalReturnTo("https://evil.example/account")).toBe("/account")
    expect(sanitizeInternalReturnTo("//evil.example/account")).toBe("/account")
    expect(sanitizeInternalReturnTo("/not-a-real-app-route")).toBe("/account")
  })

  it("builds one validated account-gate route for secondary prompts", () => {
    expect(buildAccountRoute("connect_channel", "/local-analytics?tab=sync"))
      .toBe("/account/connect?intent=connect_channel&returnTo=%2Flocal-analytics%3Ftab%3Dsync")
    expect(buildAccountRoute("sign_up", "https://evil.example"))
      .toBe("/account/connect?intent=sign_up&returnTo=%2Faccount")
    expect(parseAccountIntent("reconnect_channel")).toBe("reconnect_channel")
    expect(parseAccountIntent("invalid")).toBeNull()
  })
})
