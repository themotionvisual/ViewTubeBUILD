import React from "react"
import {
 getCanonicalSyncOverview,
 type CanonicalSyncOverview,
} from "../services/canonicalSync"
import { CANONICAL_OPERATOR_ACTION_META } from "../services/canonicalSync/actions"
import type {
 CanonicalSyncRun,
 CanonicalSyncStage,
} from "../services/canonicalSync/contracts"
import {
 getCanonicalActiveOperatorPhaseSnapshot,
 type CanonicalOperatorPhaseSnapshot,
} from "../services/canonicalSync/operatorPhases"

export type CanonicalSyncActivityEntryKind =
 | "run_started"
 | "run_completed"
 | "run_failed"
 | "stage_completed"
 | "stage_failed"

export type CanonicalSyncActivityEntry = {
 id: string
 at: string
 kind: CanonicalSyncActivityEntryKind
 title: string
 detail: string
 runId: string
 stage?: CanonicalSyncStage
}

type ManualLifecycleDetail = {
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

const FEED_STORAGE_KEY = "vt_canonical_sync_activity_feed_v1"
const MAX_FEED_ENTRIES = 80
const POLL_INTERVAL_MS = 1500

const STAGE_LABELS: Record<CanonicalSyncStage, string> = {
 channel_bootstrap: "Channel Bootstrap",
 channel_window: "Channel Window",
 channel_daily: "Channel Daily History",
 video_inventory: "Video Inventory",
 video_metrics: "Video Base Metrics",
 viewer_cohorts: "Viewer Cohorts",
 traffic_sync: "Traffic",
 audience_segments: "Audience Segments",
 demographics_sync: "Demographics",
 geography_sync: "Geography",
 playlist_sync: "Playlists",
 owner_mode: "Owner Mode",
 retention_sync: "Retention",
 shadow_diff: "Shadow Diff",
}

const OPERATOR_PHASE_LABELS = Object.fromEntries(
 Object.entries(CANONICAL_OPERATOR_ACTION_META).map(([actionId, meta]) => [
  actionId,
  meta.label,
 ]),
) as Record<string, string>

const isStage = (value: string): value is CanonicalSyncStage =>
 Object.prototype.hasOwnProperty.call(STAGE_LABELS, value)

const nowIso = (): string => new Date().toISOString()

const readStoredFeed = (): CanonicalSyncActivityEntry[] => {
 try {
  const raw = localStorage.getItem(FEED_STORAGE_KEY)
  if (!raw) return []
  const parsed = JSON.parse(raw) as CanonicalSyncActivityEntry[]
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const writeStoredFeed = (entries: CanonicalSyncActivityEntry[]) => {
 try {
  localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(entries))
 } catch {
  // no-op
 }
}

const stageLabel = (stage: CanonicalSyncStage): string => STAGE_LABELS[stage]

const formatManualStartDetail = (detail: ManualLifecycleDetail): string => {
 const phaseLabel =
  (detail.syncButtonId && OPERATOR_PHASE_LABELS[detail.syncButtonId]) ||
  (detail.operatorPhase && OPERATOR_PHASE_LABELS[detail.operatorPhase]) ||
  detail.syncAction ||
  "manual sync"
 const stageList = (detail.stages || [])
  .filter(isStage)
  .map(stageLabel)
  .join(", ")
 return stageList ? `${phaseLabel} started: ${stageList}` : `${phaseLabel} started`
}

const mergeEntries = (
 current: CanonicalSyncActivityEntry[],
 nextEntries: CanonicalSyncActivityEntry[],
): CanonicalSyncActivityEntry[] => {
 const merged = [...nextEntries, ...current]
  .filter((entry, index, array) => array.findIndex((candidate) => candidate.id === entry.id) === index)
  .sort((left, right) => right.at.localeCompare(left.at))
  .slice(0, MAX_FEED_ENTRIES)
 writeStoredFeed(merged)
 return merged
}

const completedStages = (run: CanonicalSyncRun | null): CanonicalSyncStage[] =>
 Object.entries(run?.stageStatus || {})
  .filter(([, status]) => status === "complete")
  .map(([stage]) => stage)
  .filter(isStage)

const deriveRunFeedEntries = (
 previousRun: CanonicalSyncRun | null,
 nextRun: CanonicalSyncRun | null,
): CanonicalSyncActivityEntry[] => {
 if (!nextRun) return []
 const entries: CanonicalSyncActivityEntry[] = []
 const previousStageStatus =
  previousRun?.id === nextRun.id ? previousRun.stageStatus : {}

 if ((!previousRun || previousRun.id !== nextRun.id) && nextRun.status === "running") {
  const completeCount = completedStages(nextRun).length
  entries.push({
   id: `run_started:${nextRun.id}:${nextRun.startedAt}`,
   at: nextRun.startedAt,
   kind: "run_started",
   title: "Canonical sync started",
   detail:
    completeCount > 0
     ? `${completeCount} stage${completeCount === 1 ? "" : "s"} already recorded in this run.`
     : "Canonical run ledger created and awaiting stage completion.",
   runId: nextRun.id,
  })
 }

 for (const [stageKey, nextStatus] of Object.entries(nextRun.stageStatus || {})) {
  if (!isStage(stageKey)) continue
  const prevStatus = previousStageStatus?.[stageKey] || "pending"
  if (prevStatus === nextStatus) continue
  if (nextStatus === "complete") {
   entries.push({
    id: `stage_completed:${nextRun.id}:${stageKey}`,
    at: nowIso(),
    kind: "stage_completed",
    title: `${stageLabel(stageKey)} complete`,
    detail: `${stageLabel(stageKey)} finished and is now available to downstream tables or visuals.`,
    runId: nextRun.id,
    stage: stageKey,
   })
  } else if (nextStatus === "failed") {
   entries.push({
    id: `stage_failed:${nextRun.id}:${stageKey}`,
    at: nowIso(),
    kind: "stage_failed",
    title: `${stageLabel(stageKey)} failed`,
    detail: nextRun.error || `${stageLabel(stageKey)} failed before the canonical run completed.`,
    runId: nextRun.id,
    stage: stageKey,
   })
  }
 }

 if (previousRun?.id !== nextRun.id || previousRun.status !== nextRun.status) {
  if (nextRun.status === "complete") {
   entries.push({
    id: `run_completed:${nextRun.id}:${nextRun.completedAt || nextRun.startedAt}`,
    at: nextRun.completedAt || nextRun.startedAt,
    kind: "run_completed",
    title: "Canonical sync complete",
    detail: `${completedStages(nextRun).length} stages completed in this run.`,
    runId: nextRun.id,
   })
  } else if (nextRun.status === "failed") {
   entries.push({
    id: `run_failed:${nextRun.id}:${nextRun.completedAt || nextRun.startedAt}`,
    at: nextRun.completedAt || nextRun.startedAt,
    kind: "run_failed",
    title: "Canonical sync failed",
    detail:
     nextRun.error ||
     "Canonical sync terminated before all queued stages completed.",
    runId: nextRun.id,
   })
  }
 }

 return entries
}

export const useCanonicalSyncActivityFeed = (): {
 overview: CanonicalSyncOverview | null
 entries: CanonicalSyncActivityEntry[]
 activeOperatorPhase: CanonicalOperatorPhaseSnapshot | null
 pendingStages: CanonicalSyncStage[]
 currentRun: CanonicalSyncRun | null
} => {
 const [overview, setOverview] = React.useState<CanonicalSyncOverview | null>(null)
 const [entries, setEntries] = React.useState<CanonicalSyncActivityEntry[]>(() =>
  readStoredFeed(),
 )
 const previousRunRef = React.useRef<CanonicalSyncRun | null>(null)

 const appendEntries = React.useCallback((nextEntries: CanonicalSyncActivityEntry[]) => {
  if (!nextEntries.length) return
  setEntries((current) => mergeEntries(current, nextEntries))
 }, [])

 const refreshOverview = React.useCallback(async () => {
  try {
   const nextOverview = await getCanonicalSyncOverview()
   const nextRun = nextOverview.lastRun || null
   const derivedEntries = deriveRunFeedEntries(previousRunRef.current, nextRun)
   previousRunRef.current = nextRun
   setOverview(nextOverview)
   appendEntries(derivedEntries)
  } catch (error) {
   console.warn(
    "[CanonicalSyncFeed] Failed to refresh overview:",
    error instanceof Error ? error.message : String(error),
   )
  }
 }, [appendEntries])

 React.useEffect(() => {
  void refreshOverview()
 }, [refreshOverview])

 React.useEffect(() => {
  const onManualSyncStarted = (event: Event) => {
   const detail = (event as CustomEvent<ManualLifecycleDetail>).detail || {}
   appendEntries([
    {
     id: `manual_started:${detail.startedAt || nowIso()}:${detail.syncButtonId || detail.syncAction || "manual"}`,
     at: detail.startedAt || nowIso(),
     kind: "run_started",
     title: "Sync button pressed",
     detail: formatManualStartDetail(detail),
     runId: detail.startedAt || "manual",
    },
   ])
   void refreshOverview()
  }

  const handleRefresh = () => {
   void refreshOverview()
  }

  window.addEventListener("vt_manual_sync_started", onManualSyncStarted as EventListener)
  window.addEventListener("vt_manual_sync_completed", handleRefresh)
  window.addEventListener("vt_manual_sync_failed", handleRefresh)
  window.addEventListener("vt_local_data_changed", handleRefresh)
  window.addEventListener("vt_channel_sync_status", handleRefresh)

  return () => {
   window.removeEventListener("vt_manual_sync_started", onManualSyncStarted as EventListener)
   window.removeEventListener("vt_manual_sync_completed", handleRefresh)
   window.removeEventListener("vt_manual_sync_failed", handleRefresh)
   window.removeEventListener("vt_local_data_changed", handleRefresh)
   window.removeEventListener("vt_channel_sync_status", handleRefresh)
  }
 }, [appendEntries, refreshOverview])

 React.useEffect(() => {
  if (overview?.lastRun?.status !== "running") return
  const intervalId = window.setInterval(() => {
   void refreshOverview()
  }, POLL_INTERVAL_MS)
  return () => {
   window.clearInterval(intervalId)
  }
 }, [overview?.lastRun?.status, refreshOverview])

 const currentRun = overview?.lastRun || null
 const activeOperatorPhase = getCanonicalActiveOperatorPhaseSnapshot(
  currentRun?.stageStatus || {},
  currentRun?.status || "idle",
 )
 const pendingStages = Object.entries(currentRun?.stageStatus || {})
  .filter(([, status]) => status === "pending")
  .map(([stage]) => stage)
  .filter(isStage)

 return {
  overview,
  entries,
  activeOperatorPhase,
  pendingStages,
  currentRun,
 }
}

export default useCanonicalSyncActivityFeed
