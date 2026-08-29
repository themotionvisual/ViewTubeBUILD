import type {
 VtSyncCategoryDefinition,
 VtSyncDatasetFreshness,
 VtSyncLocalSyncProgress,
 VtSyncVideoCatalogCoverage,
} from ".."
import {
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_GROUP_LABELS,
 VT_SYNC_GROUP_ORDER,
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

export type VtSyncConsoleUnitModel = (typeof VT_SYNC_SYNC_UNITS)[number] & {
 rows: VtSyncUnifiedProgressRow[]
 status: string
 issues: VtSyncUnifiedProgressRow[]
 startedAt?: string
 completedAt?: string
 storedUpdatedAt?: string
 displayRows: number
}

export type VtSyncConsoleGroupModel = {
 group: (typeof VT_SYNC_GROUP_ORDER)[number]
 label: string
 units: VtSyncConsoleUnitModel[]
 status: string
 issueCount: number
 rowCount: number
}

export type VtSyncConsoleModel = {
 rows: VtSyncUnifiedProgressRow[]
 units: VtSyncConsoleUnitModel[]
 groups: VtSyncConsoleGroupModel[]
 tally: Record<string, number>
 totalRows: number
 latestDatasetAt?: string
 queue: ReturnType<typeof getVtSyncProgressQueueSummary>
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

const resolveAggregateStatus = (statuses: string[]) => {
 if (statuses.includes("failed")) return "failed"
 if (statuses.includes("partial")) return "partial"
 if (statuses.includes("running")) return "running"
 if (statuses.includes("pending")) return "pending"
 if (statuses.includes("synced") || statuses.includes("complete")) return "synced"
 if (statuses.includes("stale")) return "stale"
 if (statuses.includes("skipped")) return "skipped"
 return "never"
}

export const buildVtSyncConsoleModel = ({
 progress,
 datasetFreshness,
 queuedCategoryIds = [],
 syncError,
 videoCatalogCoverage,
}: {
 progress: VtSyncLocalSyncProgress | null
 datasetFreshness?: VtSyncDatasetFreshness
 queuedCategoryIds?: string[]
 syncError?: string
 videoCatalogCoverage?: VtSyncVideoCatalogCoverage
}): VtSyncConsoleModel => {
 const rows = buildVtSyncUnifiedProgressRows(progress, datasetFreshness)
 const latestDatasetAt = [...rows]
  .sort((left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime())
  .find((row) => row.updatedAt)?.updatedAt
 const tally = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.displayStatus] = (acc[row.displayStatus] || 0) + 1
  return acc
 }, {})
 const activeOrLatestPhaseId = (progress?.phases || [])
  .filter((phase) => phase.startedAt)
  .sort((left, right) => String(right.startedAt).localeCompare(String(left.startedAt)))[0]?.id
 const terminalIssueUnitId = VT_SYNC_SYNC_UNITS.find((unit) => unit.categoryIds.some((categoryId) => {
  const category = VT_SYNC_CATEGORY_OPTIONS.find((entry) => entry.id === categoryId)
  return category?.runtimePhaseId === activeOrLatestPhaseId
 }))?.id

 const units = VT_SYNC_SYNC_UNITS.map<VtSyncConsoleUnitModel>((unit) => {
  const unitRows = rows.filter((row) => row.syncUnitId === unit.id)
  const livePhases = (progress?.phases || []).filter((phase) => unit.categoryIds.some((categoryId) => {
   const category = VT_SYNC_CATEGORY_OPTIONS.find((entry) => entry.id === categoryId)
   return category?.runtimePhaseId === phase.id
  }))
  const issues = unitRows.filter((row) => row.displayStatus === "failed" || row.displayStatus === "partial" || /reconnect|required|missing/i.test(row.message))
  if (syncError && unit.id === terminalIssueUnitId) {
   issues.push({
    category: VT_SYNC_CATEGORY_OPTIONS.find((category) => unit.categoryIds.includes(category.id)) || VT_SYNC_CATEGORY_OPTIONS[0],
    status: "failed",
    rows: 0,
    missingMetrics: [],
    source: "Sync connection",
    syncUnitId: unit.id,
    syncUnitLabel: unit.label,
    phaseLabel: "Sync connection",
    displayStatus: "failed",
    displayRows: 0,
    message: syncError,
   })
  }
  const completedTimes = livePhases.map((phase) => phase.completedAt).filter(Boolean).sort()
  const storedTimes = unitRows.map((row) => row.updatedAt).filter(Boolean).sort()
  return {
   ...unit,
   rows: unitRows,
   status: resolveAggregateStatus(unitRows.map((row) => row.displayStatus)),
   issues,
   startedAt: livePhases.map((phase) => phase.startedAt).filter(Boolean).sort()[0] || undefined,
   completedAt: completedTimes[completedTimes.length - 1] || undefined,
   storedUpdatedAt: storedTimes[storedTimes.length - 1] || undefined,
   displayRows: unit.id === "video_catalog" && videoCatalogCoverage
    ? videoCatalogCoverage.catalogTotal
    : unitRows.reduce((sum, row) => sum + row.displayRows, 0),
  }
 })

 const groups = VT_SYNC_GROUP_ORDER.map<VtSyncConsoleGroupModel>((group) => {
  const groupUnits = units.filter((unit) => unit.group === group)
  return {
   group,
   label: VT_SYNC_GROUP_LABELS[group],
   units: groupUnits,
   status: resolveAggregateStatus(groupUnits.map((unit) => unit.status)),
   issueCount: groupUnits.reduce((sum, unit) => sum + unit.issues.length, 0),
   rowCount: groupUnits.reduce((sum, unit) => sum + unit.displayRows, 0),
  }
 }).filter((group) => group.units.length > 0)

 return {
  rows,
  units,
  groups,
  tally,
  totalRows: rows.reduce((sum, row) => sum + row.displayRows, 0),
  latestDatasetAt,
  queue: getVtSyncProgressQueueSummary(progress, queuedCategoryIds),
 }
}
