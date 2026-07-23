import { describe, expect, it } from "vitest"
import { resolveChannelConnectionSnapshot } from "./connectionState"
import type { AuthState, ChannelIdentitySnapshot, ChannelAnalysisSyncStatus } from "../types"

const defaultAuthState: AuthState = {
 isAuthenticated: false,
 channelId: null,
 channelName: null,
 channelHandle: null,
 channelThumbnail: null,
 subscriberCount: null,
 totalViews: null,
 videoCount: null,
 syncedAt: null,
}

const defaultChannelIdentity: ChannelIdentitySnapshot = {
 channelId: null,
 name: null,
 handle: null,
 avatarUrl: null,
 subscriberCount: null,
 totalViews: null,
 videoCount: null,
 isVerified: false,
 isPartial: false,
 lastHydratedAt: null,
}

const defaultSyncStatus: ChannelAnalysisSyncStatus = {
 phase: "idle",
 startedAt: null,
 completedAt: null,
 lastError: null,
 stages: [],
}

describe("resolveChannelConnectionSnapshot", () => {
 it("returns cached_disconnected when local analytics exist without an active session", () => {
  const snapshot = resolveChannelConnectionSnapshot({
   authState: defaultAuthState,
   channelIdentity: {
    ...defaultChannelIdentity,
    name: "Cached Channel",
    handle: "cachedchannel",
    isPartial: true,
   },
   hasLocalAnalyticsCache: true,
   syncStatus: defaultSyncStatus,
  })

  expect(snapshot.state).toBe("cached_disconnected")
  expect(snapshot.hasLocalData).toBe(true)
  expect(snapshot.topBarLabel).toBe("Reconnect Channel")
  expect(snapshot.sidebarLabel).toBe("Reconnect Channel")
  expect(snapshot.statusLabel).toBe("Local data ready")
 })

 it("keeps verified live sessions connected", () => {
  const snapshot = resolveChannelConnectionSnapshot({
   authState: {
    ...defaultAuthState,
    isAuthenticated: true,
    channelName: "Live Channel",
    channelHandle: "livechannel",
    subscriberCount: 100,
   },
   channelIdentity: {
    ...defaultChannelIdentity,
    name: "Live Channel",
    handle: "livechannel",
    subscriberCount: 100,
    isVerified: true,
   },
   hasLocalAnalyticsCache: true,
   syncStatus: defaultSyncStatus,
  })

 expect(snapshot.state).toBe("connected_verified")
  expect(snapshot.isConnected).toBe(true)
  expect(snapshot.topBarLabel).toBe("Connected")
 })

 it("prefers canonical terminal truth over stale syncing events", () => {
  const snapshot = resolveChannelConnectionSnapshot({
   authState: {
    ...defaultAuthState,
    isAuthenticated: true,
    channelName: "Live Channel",
    channelHandle: "livechannel",
    subscriberCount: 100,
   },
   channelIdentity: {
    ...defaultChannelIdentity,
    name: "Live Channel",
    handle: "livechannel",
    subscriberCount: 100,
    isVerified: true,
   },
   hasLocalAnalyticsCache: true,
   isSyncing: true,
   syncStatus: {
    ...defaultSyncStatus,
    phase: "syncing",
    startedAt: "2026-06-20T16:00:00.000Z",
   },
   canonicalRun: {
    status: "complete",
    startedAt: "2026-06-20T16:00:00.000Z",
    completedAt: "2026-06-20T16:01:00.000Z",
    runId: "run-1",
   },
  })

  expect(snapshot.state).toBe("connected_verified")
  expect(snapshot.isSyncing).toBe(false)
  expect(snapshot.topBarLabel).toBe("Connected")
 })

 it("does not stay syncing when the legacy event is stale and missing startedAt", () => {
  const snapshot = resolveChannelConnectionSnapshot({
   authState: {
    ...defaultAuthState,
    isAuthenticated: true,
    channelName: "Live Channel",
    channelHandle: "livechannel",
    subscriberCount: 100,
   },
   channelIdentity: {
    ...defaultChannelIdentity,
    name: "Live Channel",
    handle: "livechannel",
    subscriberCount: 100,
    isVerified: true,
   },
   hasLocalAnalyticsCache: true,
   isSyncing: true,
   syncStatus: {
    ...defaultSyncStatus,
    phase: "syncing",
    startedAt: null,
   },
   canonicalRun: {
    status: "complete",
    startedAt: "2026-06-20T16:00:00.000Z",
    completedAt: "2026-06-20T16:01:00.000Z",
    runId: "run-legacy-stale",
   },
  })

  expect(snapshot.state).toBe("connected_verified")
  expect(snapshot.isSyncing).toBe(false)
  expect(snapshot.statusLabel).toBe("Connected")
 })

 it("stays syncing while the canonical run is still running", () => {
  const snapshot = resolveChannelConnectionSnapshot({
   authState: {
    ...defaultAuthState,
    isAuthenticated: true,
    channelName: "Live Channel",
    channelHandle: "livechannel",
    subscriberCount: 100,
   },
   channelIdentity: {
    ...defaultChannelIdentity,
    name: "Live Channel",
    handle: "livechannel",
    subscriberCount: 100,
    isVerified: true,
   },
   hasLocalAnalyticsCache: true,
   syncStatus: defaultSyncStatus,
   canonicalRun: {
    status: "running",
    startedAt: "2026-06-20T16:00:00.000Z",
    completedAt: null,
    runId: "run-2",
   },
  })

  expect(snapshot.state).toBe("syncing")
  expect(snapshot.isSyncing).toBe(true)
 })
})
