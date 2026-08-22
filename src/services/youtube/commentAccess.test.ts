import { describe, expect, it } from "vitest"
import { ANONYMOUS_ACCOUNT_SNAPSHOT, type UnifiedAccountSnapshot } from "../account/accountContracts"
import { resolveCommentAccessState } from "./commentAccess"

const snapshot = (overrides: Partial<UnifiedAccountSnapshot>): UnifiedAccountSnapshot => ({
 ...ANONYMOUS_ACCOUNT_SNAPSHOT,
 ...overrides,
 authentication: { ...ANONYMOUS_ACCOUNT_SNAPSHOT.authentication, ...overrides.authentication },
 google: { ...ANONYMOUS_ACCOUNT_SNAPSHOT.google, ...overrides.google },
})

describe("comment access", () => {
 it("blocks requests before the account is connected", () => {
  expect(resolveCommentAccessState(ANONYMOUS_ACCOUNT_SNAPSHOT)).toBe("requires_connection")
 })

 it("requires reconnect for an expired Google credential", () => {
  expect(resolveCommentAccessState(snapshot({
   authentication: { status: "authenticated", accountExists: true },
   google: { ...ANONYMOUS_ACCOUNT_SNAPSHOT.google, status: "expired" },
  }))).toBe("requires_reconnect")
 })

 it("allows reads only for a connected scoped account", () => {
  expect(resolveCommentAccessState(snapshot({
   authentication: { status: "authenticated", accountExists: true },
   google: { ...ANONYMOUS_ACCOUNT_SNAPSHOT.google, status: "connected", youtubeScopesGranted: true },
  }))).toBe("ready")
 })
})
