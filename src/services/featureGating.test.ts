import { describe, expect, it } from "vitest"
import { ANONYMOUS_ACCOUNT_SNAPSHOT, type UnifiedAccountSnapshot } from "./account/accountContracts"
import { FEATURE_GATES, featureGateForRoute, resolveFeatureGate } from "./featureGating"

const snapshot = (overrides: Partial<UnifiedAccountSnapshot> = {}): UnifiedAccountSnapshot => ({
  ...ANONYMOUS_ACCOUNT_SNAPSHOT,
  authentication: { status: "authenticated", accountExists: true },
  billing: { status: "active", planId: "creator_plus" },
  ai: { planId: "creator_plus", availableCredits: 100, usage: null },
  google: { ...ANONYMOUS_ACCOUNT_SNAPSHOT.google, status: "connected", youtubeScopesGranted: true },
  grantedCapabilities: ["youtube_read", "youtube_analytics_read"],
  ...overrides,
})

describe("feature gating foundation", () => {
  it("keeps registry IDs unique and exposes route wiring", () => {
    expect(new Set(FEATURE_GATES.map(({ id }) => id)).size).toBe(FEATURE_GATES.length)
    expect(featureGateForRoute("/ai-brain")).toBe("brain.core")
    expect(featureGateForRoute("/user-guide")).toBe("help.guide")
  })

  it("distinguishes plan locks, missing connections, and exhausted credits", () => {
    expect(resolveFeatureGate("analytics.retention", { snapshot: snapshot({ billing: { status: "active", planId: "creator" } }), serverVerified: true }).disposition).toBe("upgrade")
    expect(resolveFeatureGate("analytics.connected_sync", { snapshot: snapshot({ google: ANONYMOUS_ACCOUNT_SNAPSHOT.google, grantedCapabilities: [] }), serverVerified: true }).disposition).toBe("connect")
    expect(resolveFeatureGate("brain.core", { snapshot: snapshot({ ai: { planId: "creator_plus", availableCredits: 0, usage: null } }), serverVerified: true }).disposition).toBe("insufficient_credits")
  })

  it("fails closed on unverified snapshots and does not trust Beta plan strings", () => {
    expect(resolveFeatureGate("brain.core", { snapshot: snapshot(), serverVerified: false }).disposition).toBe("disabled")
    const beta = snapshot({ billing: { status: "active", planId: "beta" }, ai: { planId: "beta", availableCredits: 100, usage: null } })
    expect(resolveFeatureGate("connectors.custom", { snapshot: beta, serverVerified: true }).disposition).toBe("upgrade")
    expect(resolveFeatureGate("connectors.custom", { snapshot: beta, serverVerified: true, policy: { betaAllowlisted: true } }).disposition).toBe("enabled")
  })

  it("keeps external writes in preview until explicit approval", () => {
    const writer = snapshot({ grantedCapabilities: ["youtube_comments"] })
    expect(resolveFeatureGate("community.write", { snapshot: writer, serverVerified: true }).disposition).toBe("preview")
    expect(resolveFeatureGate("community.write", { snapshot: writer, serverVerified: true, approvedExternalAction: true }).disposition).toBe("enabled")
  })
})
