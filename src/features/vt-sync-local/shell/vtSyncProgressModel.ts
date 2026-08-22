import type {
 VtSyncCategoryDefinition,
 VtSyncDatasetFreshness,
 VtSyncLocalSyncProgress,
} from ".."
import {
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_SYNC_UNITS,
} from ".."

const freshnessStatusRank: Record<string, number> = {
 failed: 4,
 partial: 3,
 placeholder: 2,
 stale: 1,
 synced: 0,
}

const sourceApiLabel = (value: string) => ({
 youtube_data_v3: "YouTube Data API v3",
 youtube_analytics_v2: "YouTube Analytics API",
 google_workspace: "Google Workspace API",
 derived: "Derived locally",
 local_import: "Local import",
}[value] || value.replace(/_/g, " "))

type DatasetStatusRow = {
 category: VtSyncCategoryDefinition
 status: string
 rows: number
 updatedAt?: string
 missingMetrics: string[]
 source: string
}

const summarizeDatasetFreshness = (
 freshness: VtSyncDatasetFreshness | undefined,
 category: VtSyncCategoryDefinition,
): DatasetStatusRow => {
 const entries = Object.values(freshness || {}).filter((entry) => entry.phase === category.id)
 if (entries.length === 0) {
  return {
   category,
   status: "never",
   rows: 0,
   updatedAt: undefined,
   missingMetrics: [],
   source: sourceApiLabel(category.sourceApi),
  }
 }
 const status = entries.reduce((worst, entry) => {
  const candidate = entry.status || "synced"
  return (freshnessStatusRank[candidate] ?? -1) > (freshnessStatusRank[worst] ?? -1) ? candidate : worst
 }, entries[0].status || "synced")
 const updatedAt = entries.reduce<string | undefined>(
  (latest, entry) => (entry.updatedAt && (!latest || entry.updatedAt > latest) ? entry.updatedAt : latest),
  undefined,
 )
 return {
  category,
  status,
  rows: Math.max(...entries.map((entry) => entry.rows || 0)),
  updatedAt,
  missingMetrics: entries.flatMap((entry) => entry.missingMetrics || []),
  source: sourceApiLabel(category.sourceApi),
 }
}

export type VtSyncUnifiedProgressRow = ReturnType<typeof summarizeDatasetFreshness> & {
 syncUnitId: string
 syncUnitLabel: string
 phaseLabel: string
 displayStatus: string
 displayRows: number
 message: string
}

export const buildVtSyncUnifiedProgressRows = (
 progress: VtSyncLocalSyncProgress | null,
 datasetFreshness?: VtSyncDatasetFreshness,
): VtSyncUnifiedProgressRow[] => {
 const liveByPhase = new Map((progress?.phases || []).map((phase) => [phase.id, phase]))
 const requested = new Set(progress?.requestedCategoryIds || [])
 const requestedPhaseCounts = new Map<string, number>()
 VT_SYNC_CATEGORY_OPTIONS.forEach((category) => {
  if (!requested.has(category.id)) return
  requestedPhaseCounts.set(category.runtimePhaseId, (requestedPhaseCounts.get(category.runtimePhaseId) || 0) + 1)
 })
 return VT_SYNC_CATEGORY_OPTIONS.map((category) => {
  const syncUnit = VT_SYNC_SYNC_UNITS.find((unit) => unit.categoryIds.includes(category.id))
  const stored = summarizeDatasetFreshness(datasetFreshness, category)
  const live = liveByPhase.get(category.runtimePhaseId)
  const isRunPhase = Boolean(progress && requested.has(category.id) && live)
  const hasDedicatedLiveRowCount = requestedPhaseCounts.get(category.runtimePhaseId) === 1
  const terminalFailedPhase = Boolean(progress?.status === "failed" && live?.status === "running")
  const displayStatus = isRunPhase ? (terminalFailedPhase ? "failed" : live!.status) : stored.status
  return {
   ...stored,
   syncUnitId: syncUnit?.id || category.id,
   syncUnitLabel: syncUnit?.label || category.label,
   phaseLabel: live?.label || category.phase.replace(/_/g, " "),
   displayStatus,
   displayRows: isRunPhase && hasDedicatedLiveRowCount ? live!.rows : stored.rows,
   message: isRunPhase
    ? live!.error || live!.message || (terminalFailedPhase ? "Sync ended before this query completed." : live!.status === "pending" ? "Waiting for prerequisite phases." : "Sync is active.")
    : stored.missingMetrics.length
     ? `Missing: ${stored.missingMetrics.join(", ")}`
     : stored.updatedAt ? "Stored dataset is available." : "This dataset has not been synced yet.",
  }
 })
}

export const claimVtSyncSyncRequest = (lock: { current: boolean }): boolean => {
 if (lock.current) return false
 lock.current = true
 return true
}

export const getVtSyncProgressQueueSummary = (
 progress: VtSyncLocalSyncProgress | null,
 queuedCategoryIds: string[] = [],
) => {
 const requestedRuntimePhaseIds = new Set(
  (progress?.requestedCategoryIds || [])
   .map((categoryId) => VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === categoryId)?.runtimePhaseId)
   .filter(Boolean),
 )
 const requestedPhases = (progress?.phases || []).filter((phase) => requestedRuntimePhaseIds.has(phase.id))
 const currentPhase = progress?.status === "running"
  ? requestedPhases.find((phase) => phase.status === "running")
  : undefined
 const nextPhase = progress?.status === "running"
  ? requestedPhases.find((phase) => phase.status === "pending")
  : undefined
 const queuedCategory = queuedCategoryIds
  .map((categoryId) => VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === categoryId))
  .find(Boolean)

 return {
  currentLabel: currentPhase?.currentQueryLabel || currentPhase?.label || (progress?.status === "running" ? "Preparing sync" : "Idle"),
  currentMessage: currentPhase?.message || (currentPhase ? `${currentPhase.rows.toLocaleString()} rows received` : progress?.status === "running" ? "Resolving the first requested query." : "No query is currently running."),
  nextLabel: currentPhase?.nextQueryLabel || nextPhase?.label || queuedCategory?.label || "No queued query",
  nextMessage: currentPhase?.nextQueryLabel
   ? "Waiting in the current query group."
   : nextPhase
   ? "Waiting in the current sync run."
   : queuedCategory
    ? "Waiting behind the current sync request."
    : "The queue is clear.",
 }
}
