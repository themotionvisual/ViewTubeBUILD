import { describe, expect, it } from "vitest"
import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  type UnifiedAccountSnapshot,
} from "../account/accountContracts"
import {
  resolveCommentAccessIntent,
  resolveCommentAccessState,
} from "./commentAccess"

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

  it("starts with ViewTube account authentication before requesting channel access", () => {
    expect(resolveCommentAccessIntent(ANONYMOUS_ACCOUNT_SNAPSHOT)).toBe("sign_up")
    expect(resolveCommentAccessIntent(snapshotWith({
      viewtubeUserId: "viewtube-user",
      authentication: { status: "anonymous", accountExists: true },
    }))).toBe("log_in")
    expect(resolveCommentAccessIntent(snapshotWith({
      viewtubeUserId: "viewtube-user",
      authentication: { status: "expired", accountExists: true },
    }))).toBe("log_in")
  })

  it("requests channel connection only after the ViewTube account is authenticated", () => {
    expect(resolveCommentAccessIntent(snapshotWith({
      viewtubeUserId: "viewtube-user",
      authentication: { status: "authenticated", accountExists: true },
      google: { status: "disconnected", youtubeScopesGranted: false },
    }))).toBe("connect_channel")
    expect(resolveCommentAccessIntent(snapshotWith({
      viewtubeUserId: "viewtube-user",
      authentication: { status: "authenticated", accountExists: true },
      google: { status: "revoked", youtubeScopesGranted: false },
    }))).toBe("reconnect_channel")
  })
})
