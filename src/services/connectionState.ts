import type {
 AuthState,
 ChannelAnalysisSyncStatus,
 ChannelIdentitySnapshot,
} from "../types"

export type ChannelConnectionState =
 | "disconnected"
 | "cached_disconnected"
 | "authorizing"
 | "connected_unverified"
 | "connected_verified"
 | "syncing"
 | "error"

export interface ChannelConnectionSnapshot {
 state: ChannelConnectionState
 hasSession: boolean
 isVerified: boolean
 isConnected: boolean
 isSyncing: boolean
 hasLocalData: boolean
 title: string
 subtitle: string
 helper: string
 topBarLabel: "Connect Channel" | "Reconnect Channel" | "Connected" | "Syncing..."
 sidebarLabel: "Connect YouTube" | "Reconnect Channel" | "Sync Data" | "Syncing..."
 settingsLabel: "Connect Channel" | "Reconnect Channel" | "Connected" | "Syncing..."
 statusLabel: string
 channelName: string
 handleText: string
}

export type CanonicalRunUiSnapshot = {
 status: "running" | "complete" | "failed" | "idle"
 startedAt?: string | null
 completedAt?: string | null
 runId?: string | null
}

export type ConnectionUiState =
 | "disconnected"
 | "connected"
 | "syncing"

const clean = (value: string | null | undefined) => String(value || "").trim()

const toTimestamp = (value?: string | null): number => {
 const parsed = value ? new Date(value).getTime() : Number.NaN
 return Number.isFinite(parsed) ? parsed : Number.NaN
}

export const isChannelConnectionVerified = (
 authState: AuthState,
 channelIdentity?: ChannelIdentitySnapshot | null,
): boolean => {
 const hasSession = Boolean(authState.isAuthenticated)
 const hasName =
  clean(channelIdentity?.name).length > 0 || clean(authState.channelName).length > 0
 const hasStableMarker = Boolean(
  clean(channelIdentity?.handle) ||
   clean(channelIdentity?.avatarUrl) ||
   channelIdentity?.subscriberCount !== null ||
   channelIdentity?.totalViews !== null ||
   channelIdentity?.videoCount !== null ||
   clean(authState.channelHandle) ||
   clean(authState.channelThumbnail) ||
   authState.subscriberCount !== null ||
   authState.totalViews !== null ||
   authState.videoCount !== null,
 )
 return hasSession && hasName && hasStableMarker
}

export const resolveChannelConnectionSnapshot = (input: {
 authState: AuthState
 channelIdentity?: ChannelIdentitySnapshot | null
 hasLocalAnalyticsCache?: boolean
 isAuthorizing?: boolean
 isSyncing?: boolean
 syncStatus?: ChannelAnalysisSyncStatus | null
 canonicalRun?: CanonicalRunUiSnapshot | null
}): ChannelConnectionSnapshot => {
 const {
  authState,
  channelIdentity = null,
  hasLocalAnalyticsCache = false,
  isAuthorizing = false,
  isSyncing = false,
  syncStatus = null,
  canonicalRun = null,
 } = input

 const hasSession = Boolean(authState.isAuthenticated)
 const isVerified = isChannelConnectionVerified(authState, channelIdentity)
 const syncPhase = syncStatus?.phase || "idle"
 const legacyRuntimeSyncing = syncPhase === "syncing" || syncPhase === "partial"
 const canonicalRunStatus = canonicalRun?.status || "idle"
 const canonicalSyncing = canonicalRunStatus === "running"
 const canonicalTerminal =
  canonicalRunStatus === "complete" || canonicalRunStatus === "failed"
 const canonicalCompletedAt = toTimestamp(canonicalRun?.completedAt)
 const legacyStartedAt = toTimestamp(syncStatus?.startedAt)
 const legacySyncCanOverrideCanonicalTerminal =
  legacyRuntimeSyncing &&
  (!Number.isFinite(canonicalCompletedAt) ||
   (Number.isFinite(legacyStartedAt) && legacyStartedAt > canonicalCompletedAt))
 const hasNewerLegacyRuntime =
  legacyRuntimeSyncing &&
  (!canonicalTerminal ||
   legacySyncCanOverrideCanonicalTerminal)
 const syncing = canonicalTerminal
  ? isAuthorizing || canonicalSyncing || (isSyncing && hasNewerLegacyRuntime) || hasNewerLegacyRuntime
  : isAuthorizing || canonicalSyncing || isSyncing || legacyRuntimeSyncing
 const hasSyncError =
  canonicalRunStatus === "failed" ||
  syncPhase === "error" ||
  Boolean(syncStatus?.lastError)

 let state: ChannelConnectionState = "disconnected"
 if (!hasSession) state = hasLocalAnalyticsCache ? "cached_disconnected" : "disconnected"
 else if (hasSyncError && !syncing && !isVerified) state = "error"
 else if (syncing) state = "syncing"
 else if (isVerified) state = "connected_verified"
 else state = "connected_unverified"

 const channelName =
  clean(channelIdentity?.name) ||
  clean(authState.channelName) ||
  (state === "syncing" || state === "connected_unverified"
  ? "Syncing channel"
  : state === "connected_verified"
    ? "Connected channel"
    : state === "cached_disconnected"
     ? "Previously synced channel"
    : "Not connected")

 const handleSource = clean(channelIdentity?.handle) || clean(authState.channelHandle)
const handleText = handleSource
  ? `@${handleSource.replace(/^@/, "")}`
  : ""

 if (state === "disconnected") {
  return {
   state,
   hasSession,
   isVerified,
   isConnected: false,
   isSyncing: false,
   hasLocalData: false,
   title: "Not connected",
   subtitle: "Channel not connected",
   helper: "Open popup login once, then every verified surface shares the same session.",
   topBarLabel: "Connect Channel",
   sidebarLabel: "Connect YouTube",
   settingsLabel: "Connect Channel",
   statusLabel: "Not connected",
   channelName,
   handleText,
  }
 }

 if (state === "cached_disconnected") {
  return {
   state,
   hasSession,
   isVerified,
   isConnected: false,
   isSyncing: false,
   hasLocalData: true,
   title: "Local data ready",
   subtitle: "Reconnect to sync fresh data",
   helper:
    "Your synced analytics are still available locally. Reconnect the channel only when you need a fresh sync.",
   topBarLabel: "Reconnect Channel",
   sidebarLabel: "Reconnect Channel",
   settingsLabel: "Reconnect Channel",
   statusLabel: "Local data ready",
   channelName,
   handleText,
  }
 }

 if (state === "syncing") {
  return {
   state,
   hasSession,
   isVerified,
   isConnected: hasSession,
   isSyncing: true,
   hasLocalData: hasLocalAnalyticsCache,
   title: "Syncing channel",
   subtitle: "Channel data is loading",
   helper: "Connected channel data is loading now.",
   topBarLabel: "Syncing...",
   sidebarLabel: "Syncing...",
   settingsLabel: "Syncing...",
   statusLabel: "Syncing",
   channelName,
   handleText,
  }
 }

 if (state === "connected_verified") {
  return {
   state,
   hasSession,
   isVerified,
   isConnected: true,
   isSyncing: false,
   hasLocalData: hasLocalAnalyticsCache,
   title: "Connected",
   subtitle: "Channel verified",
   helper: "Verified connection is active across the full app.",
   topBarLabel: "Connected",
   sidebarLabel: "Sync Data",
   settingsLabel: "Connected",
   statusLabel: "Connected",
   channelName,
   handleText,
  }
 }

 if (state === "error") {
  return {
   state,
   hasSession,
   isVerified,
   isConnected: false,
   isSyncing: false,
   hasLocalData: hasLocalAnalyticsCache,
   title: "Connect channel",
   subtitle: "Connection incomplete",
   helper: "A channel session exists, but the app could not verify the linked channel profile.",
   topBarLabel: "Connect Channel",
   sidebarLabel: "Connect YouTube",
   settingsLabel: "Connect Channel",
   statusLabel: "Needs verification",
   channelName,
   handleText,
  }
 }

 return {
  state: "connected_unverified",
  hasSession,
   isVerified,
  isConnected: hasSession,
  isSyncing: false,
  hasLocalData: hasLocalAnalyticsCache,
  title: "Connected channel",
  subtitle: "Verification pending",
  helper: "A channel session exists, but ViewTube has not verified the canonical channel profile yet.",
  topBarLabel: "Connect Channel",
  sidebarLabel: "Connect YouTube",
  settingsLabel: "Connect Channel",
  statusLabel: "Needs verification",
  channelName,
  handleText,
 }
}

export const resolveConnectionUiState = (input: {
 authState: AuthState
 isAuthorizing?: boolean
 isSyncing?: boolean
 syncStatus?: ChannelAnalysisSyncStatus | null
 canonicalRun?: CanonicalRunUiSnapshot | null
}): ConnectionUiState => {
 const snapshot = resolveChannelConnectionSnapshot(input)
 if (snapshot.state === "syncing") return "syncing"
 if (snapshot.state === "connected_verified") return "connected"
 return "disconnected"
}

export const getConnectionUiCopy = (
 state: ConnectionUiState,
): {
 title: string
 subtitle: string
 cta: "Connect Channel" | "Sync Now" | "Syncing..."
} => {
 if (state === "disconnected") {
  return {
   title: "Not connected",
   subtitle: "Not connected",
   cta: "Connect Channel",
  }
 }
 if (state === "syncing") {
  return {
   title: "Syncing channel",
   subtitle: "Sync in progress",
   cta: "Syncing...",
  }
 }
 return {
  title: "Connected",
  subtitle: "Channel connected",
  cta: "Sync Now",
 }
}
