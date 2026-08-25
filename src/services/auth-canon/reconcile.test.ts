// Shape + behavior tests for the reconciler. The whole point of
// auth-canon is that these rules can't drift — pin them down.

import { describe, expect, it } from "vitest"
import type { UnifiedAccountSnapshot } from "./contracts"
import { reconcileAccountStatus } from "./reconcile"

const snap = (
 authStatus: UnifiedAccountSnapshot["authentication"]["status"],
 googleStatus: UnifiedAccountSnapshot["google"]["status"],
 scopes = false,
): UnifiedAccountSnapshot => ({
 viewtubeUserId: authStatus === "authenticated" ? "vt-user-1" : null,
 profile: { email: "u@x", displayName: "User", avatarUrl: null },
 authentication: { status: authStatus, accountExists: authStatus === "authenticated" },
 google: {
  status: googleStatus,
  youtubeScopesGranted: scopes,
  channelId: googleStatus === "connected" ? "UC-1" : null,
  channelTitle: null,
  channelHandle: null,
  channelThumbnail: null,
  contentOwners: [],
  activeContentOwnerId: null,
  contentOwnerSelectionRequired: false,
 },
 onboarding: { status: "complete", nextStep: null },
 billing: { status: "inactive", planId: null },
 ai: { planId: null, availableCredits: 0 },
 grantedCapabilities: [],
 nextIntent: null,
})

describe("reconcileAccountStatus", () => {
 it("no snapshot + no token → anonymous", () => {
  const result = reconcileAccountStatus({ snapshot: null, tokenPresent: false })
  expect(result.status).toBe("anonymous")
  expect(result.canUseYouTubeApis).toBe(false)
  expect(result.accountAuthenticated).toBe(false)
  expect(result.googleConnected).toBe(false)
  expect(result.tokenPresent).toBe(false)
 })

 it("authenticated + google connected + token present → ready", () => {
  const result = reconcileAccountStatus({
   snapshot: snap("authenticated", "connected"),
   tokenPresent: true,
  })
  expect(result.status).toBe("ready")
  expect(result.canUseYouTubeApis).toBe(true)
 })

 it("authenticated + google connected + NO token → needs_reconnect (the bug we hunted down)", () => {
  const result = reconcileAccountStatus({
   snapshot: snap("authenticated", "connected"),
   tokenPresent: false,
  })
  expect(result.status).toBe("needs_reconnect")
  expect(result.canUseYouTubeApis).toBe(false)
  // The cached snapshot lied; the reconciler catches it.
  expect(result.accountAuthenticated).toBe(true)
  expect(result.googleConnected).toBe(true)
  expect(result.tokenPresent).toBe(false)
 })

 it("server session is ready without exposing a browser OAuth token", () => {
  const s = snap("authenticated", "connected")
  s.grantedCapabilities = ["youtube_read", "youtube_comments", "youtube_video_manage", "youtube_upload"]
  const result = reconcileAccountStatus({ snapshot: s, tokenPresent: false, serverEnabled: true })
  expect(result.status).toBe("ready")
  expect(result.transportMode).toBe("server")
  expect(result.canReadYouTube).toBe(true)
  expect(result.canManageVideos).toBe(true)
  expect(result.canUploadVideos).toBe(true)
  expect(result.canPostComments).toBe(true)
 })

 it("authenticated + google disconnected + token present → needs_reconnect", () => {
  const result = reconcileAccountStatus({
   snapshot: snap("authenticated", "disconnected"),
   tokenPresent: true,
  })
  expect(result.status).toBe("needs_reconnect")
 })

 it("authenticated + scopes granted (but google.status not 'connected') + token → ready", () => {
  const result = reconcileAccountStatus({
   snapshot: snap("authenticated", "disconnected", true),
   tokenPresent: true,
  })
  // scopes-granted is treated as connected for viability.
  expect(result.googleConnected).toBe(true)
  expect(result.status).toBe("ready")
 })

 it("authentication pending → connecting", () => {
  const result = reconcileAccountStatus({
   snapshot: snap("pending", "disconnected"),
   tokenPresent: false,
  })
  expect(result.status).toBe("connecting")
 })

 it("authentication expired + no token → needs_reconnect", () => {
  const result = reconcileAccountStatus({
   snapshot: snap("expired", "expired"),
   tokenPresent: false,
  })
  expect(result.status).toBe("needs_reconnect")
 })

 it("anonymous snapshot + no token → anonymous", () => {
  const result = reconcileAccountStatus({
   snapshot: snap("anonymous", "disconnected"),
   tokenPresent: false,
  })
  expect(result.status).toBe("anonymous")
 })

 it("propagates display fields when signed in", () => {
  const s = snap("authenticated", "connected")
  s.profile.displayName = "Conor"
  s.profile.avatarUrl = "https://x/a.png"
  s.google.channelHandle = "@conor"
  s.google.channelId = "UC-42"
  const result = reconcileAccountStatus({ snapshot: s, tokenPresent: true })
  expect(result.displayName).toBe("Conor")
  expect(result.avatarUrl).toBe("https://x/a.png")
  expect(result.channelHandle).toBe("@conor")
  expect(result.channelId).toBe("UC-42")
 })

 it("falls back to channel thumbnail when profile avatar is missing", () => {
  const s = snap("authenticated", "connected")
  s.profile.avatarUrl = null
  s.google.channelThumbnail = "https://x/channel.png"
  const result = reconcileAccountStatus({ snapshot: s, tokenPresent: true })
  expect(result.avatarUrl).toBe("https://x/channel.png")
 })
})
