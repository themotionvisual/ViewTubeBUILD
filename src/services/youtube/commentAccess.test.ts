import { describe, expect, it } from "vitest"
import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  type UnifiedAccountSnapshot,
} from "../account/accountContracts"
import { resolveCommentAccessState } from "./commentAccess"

const snapshotWith = (
  overrides: Omit<Partial<UnifiedAccountSnapshot>, "authentication" | "google"> & {
    authentication?: Partial<UnifiedAccountSnapshot["authentication"]>
    google?: Partial<UnifiedAccountSnapshot["google"]>
  },
): UnifiedAccountSnapshot => ({
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

describe("resolveCommentAccessState", () => {
  it("requires a connection for an anonymous account", () => {
    expect(resolveCommentAccessState(ANONYMOUS_ACCOUNT_SNAPSHOT)).toBe("requires_connection")
  })

  it("waits while account connection is pending", () => {
    expect(resolveCommentAccessState(snapshotWith({
      authentication: { status: "pending" },
    }))).toBe("pending")
  })

  it("requires reconnecting an expired or revoked Google connection", () => {
    expect(resolveCommentAccessState(snapshotWith({
      authentication: { status: "authenticated" },
      google: { status: "revoked" },
    }))).toBe("requires_reconnect")
  })

  it("allows comments only when authentication and YouTube scopes are ready", () => {
    expect(resolveCommentAccessState(snapshotWith({
      authentication: { status: "authenticated" },
      google: { status: "connected", youtubeScopesGranted: true },
    }))).toBe("ready")
  })
})
