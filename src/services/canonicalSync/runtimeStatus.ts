import type { ChannelAnalysisSyncPhase, ChannelAnalysisSyncStatus } from "../../types"

type CanonicalSyncLifecycleDetail = {
 batchMode?: "initial" | "next"
 syncAction?: string | null
 syncButtonId?: string | null
 enrichmentMode?: string | null
 operatorPhase?: string | null
 stages?: string[]
 startedAt?: string | null
 completedAt?: string | null
 lastError?: string | null
}

const nowIso = (): string => new Date().toISOString()

const buildStatus = (
 phase: ChannelAnalysisSyncPhase,
 detail: CanonicalSyncLifecycleDetail = {},
): ChannelAnalysisSyncStatus => ({
 phase,
 startedAt:
  detail.startedAt === undefined
   ? phase === "idle"
    ? null
    : nowIso()
   : detail.startedAt,
 completedAt:
  detail.completedAt === undefined
   ? phase === "complete" || phase === "error"
    ? nowIso()
    : null
   : detail.completedAt,
 lastError: detail.lastError || null,
 stages: detail.stages || (detail.operatorPhase ? [detail.operatorPhase] : []),
})

export const emitChannelSyncStatus = (
 phase: ChannelAnalysisSyncPhase,
 detail: CanonicalSyncLifecycleDetail = {},
): ChannelAnalysisSyncStatus => {
 const status = buildStatus(phase, detail)
 window.dispatchEvent(
  new CustomEvent<ChannelAnalysisSyncStatus>("vt_channel_sync_status", {
   detail: status,
  }),
 )
 return status
}

export const emitCanonicalSyncStarted = (
 detail: CanonicalSyncLifecycleDetail = {},
): ChannelAnalysisSyncStatus => {
 const startedAt = detail.startedAt || nowIso()
 const status = emitChannelSyncStatus("syncing", {
  ...detail,
  startedAt,
  completedAt: null,
  lastError: null,
 })
 window.dispatchEvent(
  new CustomEvent("vt_manual_sync_started", {
   detail: {
    batchMode: detail.batchMode || "initial",
    syncAction: detail.syncAction || null,
    syncButtonId: detail.syncButtonId || null,
    enrichmentMode: detail.enrichmentMode || null,
    operatorPhase: detail.operatorPhase || null,
    stages: detail.stages || [],
    startedAt,
   },
  }),
 )
 return status
}

export const emitCanonicalSyncCompleted = (
 detail: CanonicalSyncLifecycleDetail = {},
): ChannelAnalysisSyncStatus => {
 const completedAt = detail.completedAt || nowIso()
 const status = emitChannelSyncStatus("complete", {
  ...detail,
  completedAt,
  lastError: null,
 })
 window.dispatchEvent(
  new CustomEvent("vt_manual_sync_completed", {
   detail: {
    batchMode: detail.batchMode || "initial",
    syncAction: detail.syncAction || null,
    syncButtonId: detail.syncButtonId || null,
    enrichmentMode: detail.enrichmentMode || null,
    operatorPhase: detail.operatorPhase || null,
    stages: detail.stages || [],
    startedAt: detail.startedAt || status.startedAt,
    completedAt,
   },
  }),
 )
 return status
}

export const emitCanonicalSyncFailed = (
 error: unknown,
 detail: CanonicalSyncLifecycleDetail = {},
): ChannelAnalysisSyncStatus => {
 const completedAt = detail.completedAt || nowIso()
 const lastError = error instanceof Error ? error.message : String(error)
 const status = emitChannelSyncStatus("error", {
  ...detail,
  completedAt,
  lastError,
 })
 window.dispatchEvent(
  new CustomEvent("vt_manual_sync_failed", {
   detail: {
    batchMode: detail.batchMode || "initial",
    syncAction: detail.syncAction || null,
    syncButtonId: detail.syncButtonId || null,
    enrichmentMode: detail.enrichmentMode || null,
    operatorPhase: detail.operatorPhase || null,
    stages: detail.stages || [],
    startedAt: detail.startedAt || status.startedAt,
    completedAt,
    lastError,
   },
  }),
 )
 return status
}
