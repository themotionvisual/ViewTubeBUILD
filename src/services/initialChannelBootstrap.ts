import type {
 AnalyticsWindow,
 CanonicalChannelRecord,
 CanonicalSyncRun,
 ComparableAnalyticsWindow,
 InitialChannelBootstrapSnapshot,
} from "./canonicalSync/contracts"
import { syncChannelBootstrap } from "./canonicalSync/channelBootstrapSync"
import {
 sumLastTwoCompleteDaysViews,
 syncRecentCompleteDailyViews,
} from "./canonicalSync/channelDailySync"
import { syncChannelPeriodSummaries } from "./canonicalSync/channelWindowSync"
import { syncVideoInventory } from "./canonicalSync/videoInventorySync"
import {
 listCanonicalChannelDailyRows,
 listCanonicalChannelRecords,
 listCanonicalSyncRuns,
 listCanonicalVideoRecords,
 listChannelWindowSummaries,
 putCanonicalChannelDailyRows,
 putCanonicalChannelRecord,
 putCanonicalRawAuditEntries,
 putCanonicalSyncRun,
 putCanonicalVideoRecords,
 putChannelWindowSummaries,
} from "./canonicalSync/storage"
import { syncLegacyAnalyticsCacheFromCanonical } from "./canonicalSync/legacyCacheBridge"
import {
 publishInitialBootstrapToVtSync,
 publishInitialChannelOverviewToVtSync,
 publishInitialChannelTotalsToVtSync,
} from "../features/vt-sync-local/adapters/initialBootstrapBridge"

export const INITIAL_CHANNEL_BOOTSTRAP_FLAG = "VITE_UNIFIED_INITIAL_CHANNEL_BOOTSTRAP"
const IDENTITY_INVENTORY_FRESH_MS = 6 * 60 * 60 * 1000
const SHORT_ANALYTICS_FRESH_MS = 4 * 60 * 60 * 1000
const LONG_ANALYTICS_FRESH_MS = 24 * 60 * 60 * 1000
const inFlight = new Map<string, Promise<InitialChannelBootstrapSnapshot>>()
let memorySnapshot: InitialChannelBootstrapSnapshot | null = null
const listeners = new Set<(snapshot: InitialChannelBootstrapSnapshot) => void>()

const publish = (snapshot: InitialChannelBootstrapSnapshot) => {
 memorySnapshot = snapshot
 listeners.forEach((listener) => listener(snapshot))
}

export const isInitialChannelBootstrapEnabled = (): boolean =>
 String(import.meta.env[INITIAL_CHANNEL_BOOTSTRAP_FLAG] ?? "true").toLowerCase() !== "false"

export const getInitialChannelBootstrapSnapshot = (): InitialChannelBootstrapSnapshot | null =>
 memorySnapshot

export const subscribeInitialChannelBootstrap = (
 listener: (snapshot: InitialChannelBootstrapSnapshot) => void,
): (() => void) => {
 listeners.add(listener)
 return () => listeners.delete(listener)
}

const latestRunForChannel = (runs: CanonicalSyncRun[], channelId: string) =>
 runs
  .filter((run) => run.channelId === channelId && run.id.startsWith("initial-channel-bootstrap::"))
  .sort((left, right) => String(right.completedAt || right.startedAt).localeCompare(String(left.completedAt || left.startedAt)))[0]

export const restoreInitialChannelBootstrap = async (
 channelId?: string | null,
): Promise<InitialChannelBootstrapSnapshot | null> => {
 const channels = await listCanonicalChannelRecords()
 const channel = (channelId ? channels.find((entry) => entry.channelId === channelId) : channels[0]) || null
 if (!channel) return null
 const [videos, periods, dailyRows, runs] = await Promise.all([
  listCanonicalVideoRecords(channel.channelId),
  listChannelWindowSummaries(channel.channelId),
  listCanonicalChannelDailyRows(channel.channelId),
  listCanonicalSyncRuns(),
 ])
 const run = latestRunForChannel(runs, channel.channelId)
 const restored: InitialChannelBootstrapSnapshot = {
  channelId: channel.channelId,
  status: "restoring",
  channel,
  videos,
  periods,
  lastTwoCompleteDaysViews: sumLastTwoCompleteDaysViews(dailyRows),
  revision: Date.now(),
  manifestId: run?.id || null,
  restoredAt: new Date().toISOString(),
  error: null,
 }
 publish(restored)
 return restored
}

const isFreshAt = (value: string | null | undefined, ttl: number): boolean => {
 const age = Date.now() - Date.parse(String(value || ""))
 return Number.isFinite(age) && age >= 0 && age < ttl
}

export const isInitialInventoryFresh = (
 restored: InitialChannelBootstrapSnapshot | null,
 force = false,
): boolean => {
 if (force || !restored) return false
 if (restored.channel?.publicVideoCount === 0) return true
 return Array.isArray(restored.videos) && restored.videos.length > 0 && restored.videos.every((video) =>
  isFreshAt(video.syncedAt, IDENTITY_INVENTORY_FRESH_MS))
}

const periodKey = (period: { window: AnalyticsWindow; period?: "current" | "previous" }) =>
 `${period.period || "current"}::${period.window}`

const buildRun = (channelId: string): CanonicalSyncRun => ({
 id: `initial-channel-bootstrap::${channelId}::${new Date().toISOString()}`,
 channelId,
 startedAt: new Date().toISOString(),
 status: "running",
 videoCount: 0,
 windows: ["lifetime", "365d", "90d", "28d", "7d"],
 stageStatus: {
  channel_bootstrap: "pending",
  video_inventory: "pending",
  channel_window: "pending",
  channel_daily: "pending",
 },
})

const runBootstrap = async (input: {
 channelId?: string | null
 force?: boolean
 reason?: string
}): Promise<InitialChannelBootstrapSnapshot> => {
 const restored = await restoreInitialChannelBootstrap(input.channelId)
 const restoredDailyRows = restored
  ? await listCanonicalChannelDailyRows(restored.channelId)
  : []
 const identityFresh = !input.force && isFreshAt(restored?.channel?.syncedAt, IDENTITY_INVENTORY_FRESH_MS)
 const inventoryFresh = isInitialInventoryFresh(restored, input.force)
 const desiredCurrent: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d", "7d"]
 const desiredPrevious: ComparableAnalyticsWindow[] = ["365d", "90d", "28d", "7d"]
 const existingPeriods = new Map((restored?.periods || []).map((period) => [periodKey(period), period]))
 const currentWindows = desiredCurrent.filter((window) => {
  if (input.force) return true
  const ttl = window === "7d" || window === "28d" ? SHORT_ANALYTICS_FRESH_MS : LONG_ANALYTICS_FRESH_MS
  return !isFreshAt(existingPeriods.get(`current::${window}`)?.syncedAt, ttl)
 })
 const previousWindows = desiredPrevious.filter((window) => {
  if (input.force) return true
  const ttl = window === "7d" || window === "28d" ? SHORT_ANALYTICS_FRESH_MS : LONG_ANALYTICS_FRESH_MS
  return !isFreshAt(existingPeriods.get(`previous::${window}`)?.syncedAt, ttl)
 })
 const newestDailyRows = restoredDailyRows
  .slice()
  .sort((left, right) => right.date.localeCompare(left.date))
  .slice(0, 2)
 const dailyFresh = !input.force && newestDailyRows.length >= 2 && newestDailyRows.every((row) =>
  isFreshAt(row.syncedAt, SHORT_ANALYTICS_FRESH_MS))
 if (identityFresh && inventoryFresh && currentWindows.length === 0 && previousWindows.length === 0 && dailyFresh) {
  const ready = { ...restored!, status: "ready" as const }
  publish(ready)
  return ready
 }
 const refreshing: InitialChannelBootstrapSnapshot = restored
  ? { ...restored, status: "refreshing", revision: Date.now() }
  : {
    channelId: input.channelId || "pending",
    status: "refreshing",
    channel: null,
    videos: [],
    periods: [],
    lastTwoCompleteDaysViews: null,
    revision: Date.now(),
    manifestId: null,
    restoredAt: null,
    error: null,
   }
 publish(refreshing)

 let run = buildRun(input.channelId || "mine")
 await putCanonicalSyncRun(run)
 try {
  const bootstrap = identityFresh && restored?.channel
   ? { channel: restored.channel, audit: null }
   : await syncChannelBootstrap(run.id)
  if (!bootstrap.channel.channelId) throw new Error("YouTube returned no authoritative channel ID.")
  if (input.channelId && bootstrap.channel.channelId !== input.channelId) {
   throw new Error("Authenticated channel does not match the requested bootstrap channel.")
  }
  run = {
   ...run,
   channelId: bootstrap.channel.channelId,
   stageStatus: { ...run.stageStatus, channel_bootstrap: "complete" },
  }
  if (bootstrap.audit) {
   await putCanonicalChannelRecord(bootstrap.channel)
   await putCanonicalRawAuditEntries([bootstrap.audit])
  }
  await putCanonicalSyncRun(run)
  // Overview widgets get identity/counts now; no wait for video inventory.
  await publishInitialChannelOverviewToVtSync({ channel: bootstrap.channel, runId: run.id })

  // Channel totals are independent of inventory. Run and commit them next so
  // dashboard KPIs become current while longer video work continues.
  const refreshedPeriods = currentWindows.length || previousWindows.length
   ? await syncChannelPeriodSummaries(
      bootstrap.channel.channelId,
      run.id,
      bootstrap.channel.publishedAt,
      { currentWindows, previousWindows },
     )
   : { summaries: [], audit: [], partial: false }
  if (refreshedPeriods.summaries.length > 0) {
   await putChannelWindowSummaries(refreshedPeriods.summaries)
   await putCanonicalRawAuditEntries(refreshedPeriods.audit)
  }
  const refreshedKeys = new Set(refreshedPeriods.summaries.map(periodKey))
  const summaries = [
   ...(restored?.periods || []).filter((period) => !refreshedKeys.has(periodKey(period))),
   ...refreshedPeriods.summaries,
  ]
  run = { ...run, stageStatus: { ...run.stageStatus, channel_window: "complete" } }
  await putCanonicalSyncRun(run)
  if (refreshedPeriods.summaries.length > 0) {
   publishInitialChannelTotalsToVtSync({ periods: refreshedPeriods.summaries, runId: run.id })
  }

  const inventory = inventoryFresh && restored
   ? { records: restored.videos, audit: [] }
   : await syncVideoInventory(
      bootstrap.channel.channelId,
      run.id,
      bootstrap.channel.uploadsPlaylistId,
     )
  if (inventory.audit.length > 0) {
   await putCanonicalVideoRecords(inventory.records, "video_inventory", "data_api")
   await putCanonicalRawAuditEntries(inventory.audit)
  }
  run = {
   ...run,
   videoCount: inventory.records.length,
   stageStatus: { ...run.stageStatus, video_inventory: "complete" },
  }
  await putCanonicalSyncRun(run)

  const daily = dailyFresh
   ? { rows: restoredDailyRows, audit: null }
   : await syncRecentCompleteDailyViews(bootstrap.channel.channelId, run.id)
  if (daily.audit) {
   await putCanonicalChannelDailyRows(daily.rows)
   await putCanonicalRawAuditEntries([daily.audit])
  }
  run = {
   ...run,
   completedAt: new Date().toISOString(),
   status: "complete",
   stageStatus: { ...run.stageStatus, channel_daily: "complete" },
  }
  await putCanonicalSyncRun(run)

  await publishInitialBootstrapToVtSync({
   channel: bootstrap.channel,
   videos: inventory.records,
   periods: summaries,
   dailyRows: daily.rows,
   runId: run.id,
  })
  const compatibilityCache = await syncLegacyAnalyticsCacheFromCanonical(bootstrap.channel.channelId)
  const snapshot: InitialChannelBootstrapSnapshot = {
   channelId: bootstrap.channel.channelId,
   status: refreshedPeriods.partial || summaries.some((summary) => summary.coverage === "partial") ? "partial" : "ready",
   channel: bootstrap.channel,
   videos: inventory.records,
   periods: summaries,
   lastTwoCompleteDaysViews: sumLastTwoCompleteDaysViews(daily.rows),
   revision: Date.now(),
   manifestId: run.id,
   restoredAt: restored?.restoredAt || null,
   error: null,
  }
  publish(snapshot)
  window.dispatchEvent(new CustomEvent("vt_initial_channel_bootstrap_committed", { detail: snapshot }))
  window.dispatchEvent(new CustomEvent("canonical_store_updated", { detail: snapshot }))
  window.dispatchEvent(new CustomEvent("yt_analytics_synced", { detail: compatibilityCache || {} }))
  return snapshot
 } catch (error) {
  run = {
   ...run,
   completedAt: new Date().toISOString(),
   status: "failed",
   error: error instanceof Error ? error.message : String(error),
  }
  await putCanonicalSyncRun(run)
  const failed: InitialChannelBootstrapSnapshot = {
   ...refreshing,
   status: restored ? "partial" : "error",
   manifestId: run.id,
   error: {
    code: "INITIAL_CHANNEL_BOOTSTRAP_FAILED",
    recoverable: true,
    message: run.error || "Initial channel bootstrap failed.",
   },
   revision: Date.now(),
  }
  publish(failed)
  return failed
 }
}

export const ensureInitialChannelBootstrap = (input: {
 channelId?: string | null
 force?: boolean
 reason?: string
} = {}): Promise<InitialChannelBootstrapSnapshot> => {
 const key = input.channelId || "mine"
 const existing = inFlight.get(key)
 if (existing) {
  // A first action may request today's forced refresh while the immediate
  // login bootstrap is still running. Finish current work, then honor force.
  return input.force
   ? existing.then(() => ensureInitialChannelBootstrap(input))
   : existing
 }
 const promise = runBootstrap(input).finally(() => inFlight.delete(key))
 inFlight.set(key, promise)
 return promise
}
