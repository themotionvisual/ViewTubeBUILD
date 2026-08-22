import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, ChevronRight, Copy } from "lucide-react"
import { useBrain } from "../../../context/useBrain"
import { legacyAccountBridge } from "../../../services/account/legacyAccountBridge"
import { isGoogleReconnectRequiredError } from "../../../services/youtube/googleProxyErrors"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import {
 getVtSyncSnapshot,
 runVtSyncLocalSync,
 type VtSyncCategoryDefinition,
 type VtSyncDatasetFreshness,
 type VtSyncLocalSyncProgress,
 type VtSyncSnapshot,
 VT_SYNC_SERVER_ACCOUNT_TOKEN,
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_GROUP_LABELS,
 VT_SYNC_GROUP_ORDER,
 VT_SYNC_SYNC_UNITS,
 expandVtSyncCategoryDependencies,
 getVtSyncDefaultUnitIds,
 getVtSyncUnitCategoryIds,
 applyVtSyncPrivacyFilters,
 readVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
 loadVtSyncManualImports,
 claimUnscopedVtSyncManualImports,
 loadVtSyncPersistedApiRows,
 mergeVtSyncManualImportsIntoSnapshot,
 mergeVtSyncPersistedApiRowsIntoSnapshot,
 type VtSyncPersistedApiState,
 type VtSyncManualImportState,
 type VtSyncVideoInventoryRecord,
 type VtSyncVideoCatalogCoverage,
 buildVtSyncVideoCatalogProjection,
 listVtSyncVideoInventory,
} from ".."
import { ToolboxScaffold } from "../../../components/Toolbox"
import { getPaletteColor } from "../../../styles/toolboxPalette"
import { VtSyncControllerPanel } from "./VtSyncControllerPanel"
import { buildVtSyncCreatorHeroModel, VtSyncCreatorHero } from "./VtSyncCreatorHero"
import { VtSyncToolboxDataTable } from "./toolbox-table/VtSyncToolboxDataTable"
import { VtSyncDataVisualsGate } from "./VtSyncDataVisualsGate"
import "./VtSyncLocalAnalyticsPage.css"
import { RetroLcd, RetroLedRow, RetroRivets, type RetroLedSpec } from "./VtSyncRetroChrome"

const syncStatusLabel = (status?: string) => {
 switch (status) {
  case "idle": return "Waiting"
  case "pending": return "Waiting"
  case "running": return "Syncing"
  case "complete": return "Complete"
  case "synced": return "Synced"
  case "partial": return "Partial: Saved What YouTube Returned"
  case "failed": return "Failed: Check Message"
  case "skipped": return "Skipped"
  case "stale": return "Previous Snapshot"
  case "placeholder": return "Waiting"
  case "never": return "Never Synced"
  default: return String(status || "Unknown")
 }
}

const syncStatusTone = (status?: string) => {
 if (status === "complete" || status === "synced") return "#3FEE56"
 if (status === "partial") return "#FFDA47"
 if (status === "failed") return "#FA618A"
 if (status === "running") return "#FFDA47"
 if (status === "skipped" || status === "stale" || status === "placeholder") return "#FFA85C"
 if (status === "never") return "#e9eaec"
 return "#ffffff"
}

const freshnessStatusRank: Record<string, number> = { failed: 4, partial: 3, placeholder: 2, stale: 1, synced: 0 }

const sourceApiLabel = (value: string) => ({
 youtube_data_v3: "YouTube Data API v3",
 youtube_analytics_v2: "YouTube Analytics API",
 google_workspace: "Google Workspace API",
 derived: "Derived locally",
 local_import: "Local import",
}[value] || value.replace(/_/g, " "))

const formatRelativeTime = (iso?: string): string => {
 if (!iso) return "Never"
 const ms = Date.now() - new Date(iso).getTime()
 if (!Number.isFinite(ms)) return "Never"
 if (ms < 0 || ms < 60_000) return "Just now"
 const min = Math.floor(ms / 60_000)
 if (min < 60) return `${min}m ago`
 const hr = Math.floor(min / 60)
 if (hr < 24) return `${hr}h ago`
 const day = Math.floor(hr / 24)
 if (day < 30) return `${day}d ago`
 return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

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

const writeClipboardText = async (text: string) => {
 if (navigator.clipboard?.writeText) {
  await navigator.clipboard.writeText(text)
  return
 }
 const textarea = document.createElement("textarea")
 textarea.value = text
 textarea.setAttribute("readonly", "true")
 textarea.style.position = "fixed"
 textarea.style.left = "-9999px"
 document.body.appendChild(textarea)
 textarea.select()
 document.execCommand("copy")
 document.body.removeChild(textarea)
}

export type VtSyncUnifiedProgressRow = ReturnType<typeof summarizeDatasetFreshness> & {
 syncUnitId: string
 syncUnitLabel: string
 phaseLabel: string
 displayStatus: string
 displayRows: number
 message: string
}

export const claimVtSyncSyncRequest = (lock: { current: boolean }): boolean => {
 if (lock.current) return false
 lock.current = true
 return true
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

export const ProgressRail: React.FC<{ progress: VtSyncLocalSyncProgress | null; datasetFreshness?: VtSyncDatasetFreshness; syncError?: string; queuedCategoryIds?: string[]; videoCatalogCoverage?: VtSyncVideoCatalogCoverage }> = ({ progress, datasetFreshness, syncError, queuedCategoryIds = [], videoCatalogCoverage }) => {
 const [copyStatus, setCopyStatus] = useState("")
 const [expandedUnitIds, setExpandedUnitIds] = useState<Set<string>>(() => new Set())
 const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set([VT_SYNC_GROUP_ORDER[0]]))
 const unifiedRows = useMemo(
  () => buildVtSyncUnifiedProgressRows(progress, datasetFreshness),
  [datasetFreshness, progress],
 )
 const datasetRows = useMemo(
  () => unifiedRows.map(({ phaseLabel: _phaseLabel, displayStatus: _displayStatus, displayRows: _displayRows, message: _message, syncUnitLabel: _syncUnitLabel, syncUnitId: _syncUnitId, ...row }) => row),
  [unifiedRows],
 )
 const latestDatasetAt = useMemo(
  () => [...datasetRows]
   .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
   .find((row) => row.updatedAt)?.updatedAt,
  [datasetRows],
 )
 const visibleUnifiedRows = useMemo(
  () => [...unifiedRows].sort((left, right) => {
   const leftRequested = progress?.requestedCategoryIds.includes(left.category.id) ? 1 : 0
   const rightRequested = progress?.requestedCategoryIds.includes(right.category.id) ? 1 : 0
   return rightRequested - leftRequested || new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime()
  }),
  [progress?.requestedCategoryIds, unifiedRows],
 )
 const datasetTally = datasetRows.reduce<Record<string, number>>((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1
  return acc
 }, {})
 const datasetTotalRows = datasetRows.reduce((sum, row) => sum + row.rows, 0)
 const progressUnits = useMemo(() => VT_SYNC_SYNC_UNITS.map((unit) => {
  const rows = visibleUnifiedRows.filter((row) => row.syncUnitId === unit.id)
  const livePhases = (progress?.phases || []).filter((phase) => unit.categoryIds.some((id) => {
   const category = VT_SYNC_CATEGORY_OPTIONS.find((entry) => entry.id === id)
   return category?.runtimePhaseId === phase.id
  }))
  const statuses = rows.map((row) => row.displayStatus)
  const status = statuses.includes("failed") ? "failed"
   : statuses.includes("partial") ? "partial"
   : statuses.includes("running") ? "running"
   : statuses.includes("pending") ? "pending"
   : statuses.includes("synced") || statuses.includes("complete") ? "synced"
   : statuses.includes("stale") ? "stale"
   : "never"
  const issues = rows.filter((row) => row.displayStatus === "failed" || row.displayStatus === "partial" || /reconnect|required|missing/i.test(row.message))
  const activeOrLatestPhaseId = (progress?.phases || [])
   .filter((phase) => phase.startedAt)
   .sort((left, right) => String(right.startedAt).localeCompare(String(left.startedAt)))[0]?.id
  const terminalIssueUnitId = VT_SYNC_SYNC_UNITS.find((candidate) => candidate.categoryIds.some((id) => {
   const category = VT_SYNC_CATEGORY_OPTIONS.find((entry) => entry.id === id)
   return category?.runtimePhaseId === activeOrLatestPhaseId
  }))?.id
  if (syncError && unit.id === terminalIssueUnitId) {
   issues.push({ category: { id: "sync_error", label: "Sync connection" }, message: syncError } as VtSyncUnifiedProgressRow)
  }
  const startedAt = livePhases.map((phase) => phase.startedAt).filter(Boolean).sort()[0] || undefined
  const completedTimes = livePhases.map((phase) => phase.completedAt).filter(Boolean).sort()
  const completedAt = completedTimes[completedTimes.length - 1] || undefined
  const storedTimes = rows.map((row) => row.updatedAt).filter(Boolean).sort()
  const storedUpdatedAt = storedTimes[storedTimes.length - 1] || undefined
  const isOpenByState = status === "running" || issues.length > 0
  return {
   ...unit,
   rows,
   status,
   issues,
   startedAt,
   completedAt,
   storedUpdatedAt,
   displayRows: unit.id === "video_catalog" && videoCatalogCoverage
    ? videoCatalogCoverage.catalogTotal
    : rows.reduce((sum, row) => sum + row.displayRows, 0),
   isOpenByState,
  }
 }), [progress?.phases, syncError, videoCatalogCoverage, visibleUnifiedRows])
 const progressGroups = useMemo(() => VT_SYNC_GROUP_ORDER.map((group, index) => {
  const units = progressUnits.filter((unit) => unit.group === group)
  const statuses = units.map((unit) => unit.status)
  const status = statuses.includes("failed") ? "failed"
   : statuses.includes("partial") ? "partial"
   : statuses.includes("running") ? "running"
   : statuses.includes("pending") ? "pending"
   : statuses.includes("synced") ? "synced"
   : statuses.includes("stale") ? "stale"
   : "never"
  return {
   group,
   label: VT_SYNC_GROUP_LABELS[group],
   color: getPaletteColor(index * 2),
   units,
   status,
   issueCount: units.reduce((sum, unit) => sum + unit.issues.length, 0),
   rowCount: units.reduce((sum, unit) => sum + unit.displayRows, 0),
  }
 }).filter((group) => group.units.length > 0), [progressUnits])
 const queueSummary = useMemo(
  () => getVtSyncProgressQueueSummary(progress, queuedCategoryIds),
  [progress, queuedCategoryIds],
 )
 const activeGroup = progressGroups.find((group) => group.status === "running")?.group
 useEffect(() => {
  if (!activeGroup) return
  setExpandedGroupIds((current) => {
   if (current.has(activeGroup)) return current
   const next = new Set(current)
   while (next.size >= 2) next.delete(next.values().next().value as string)
   next.add(activeGroup)
   return next
  })
 }, [activeGroup])
 const toggleProgressGroup = (group: string) => {
  setExpandedGroupIds((current) => {
   const next = new Set(current)
   if (next.has(group)) next.delete(group)
   else {
    while (next.size >= 2) next.delete(next.values().next().value as string)
    next.add(group)
   }
   return next
  })
 }
 const formatSyncTime = (startedAt?: string, completedAt?: string, storedUpdatedAt?: string) => {
  if (!startedAt) return storedUpdatedAt
   ? `Last completed ${new Date(storedUpdatedAt).toLocaleString()}`
   : "Never run"
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt || Date.now()).getTime()
  const seconds = Math.max(0, Math.round((end - start) / 1000))
  const duration = seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`
  return `${new Date(startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${completedAt ? "completed" : "running"} · ${duration}`
 }
 const syncLeds: RetroLedSpec[] = [
  { id: "live", label: progress?.status === "running" ? "Live sync in progress" : "No active sync", tone: "#36E0F6", lit: progress?.status === "running", pulse: true },
  { id: "synced", label: `${datasetTally.synced || 0} datasets synced`, tone: "#3FEE56", lit: (datasetTally.synced || 0) > 0 },
  { id: "partial", label: `${datasetTally.partial || 0} datasets partial`, tone: "#FFDA47", lit: (datasetTally.partial || 0) > 0 },
  { id: "failed", label: `${datasetTally.failed || 0} datasets failed`, tone: "#FA618A", lit: (datasetTally.failed || 0) > 0 },
 ]
 const copyProgressSummary = async () => {
  const datasetLines = [
   "",
   "Stored dataset status",
   `Latest dataset update: ${formatRelativeTime(latestDatasetAt)}`,
   `Stored rows shown by dataset cards: ${datasetTotalRows.toLocaleString()}`,
   `Successes: ${(datasetTally.synced || 0).toLocaleString()}`,
   `Partials: ${(datasetTally.partial || 0).toLocaleString()}`,
   `Failures: ${(datasetTally.failed || 0).toLocaleString()}`,
   `Never synced: ${(datasetTally.never || 0).toLocaleString()}`,
   "",
   ...visibleUnifiedRows.map((row) => [
    `- ${row.category.label}`,
    `  Phase: ${row.phaseLabel}`,
    `  Status: ${syncStatusLabel(row.displayStatus)}`,
    `  Rows: ${row.displayRows.toLocaleString()}`,
    `  Updated: ${row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "Never"}`,
    `  Message: ${row.message}`,
   ].join("\n")),
  ]
  const lines = progress ? [
   "ViewTube Annalytics Progress Summary",
   `Run ID: ${progress.runId}`,
   `Started: ${new Date(progress.startedAt).toLocaleString()}`,
   `Status: ${syncStatusLabel(progress.status)}`,
   progress.completedAt ? `Completed: ${new Date(progress.completedAt).toLocaleString()}` : "Completed: not yet",
   "",
   ...datasetLines,
  ] : [
   "ViewTube Annalytics Progress Summary",
   "Status: No active sync yet.",
   "Next step: Choose datasets in YouTube Data Sync, then start a sync.",
   ...datasetLines,
  ]
  try {
   await writeClipboardText(lines.join("\n"))
   setCopyStatus("Sync progress summary copied.")
  } catch {
   setCopyStatus("Could not copy sync progress.")
  }
 }
 return (
  <ToolboxScaffold
   title="SYNC PROGRESS"
   subtitle="Dataset history, sync outcomes, rows, and recent updates."
   iconName="analytics"
   headerColor="bg-[#C0F240]"
   iconBoxColor="bg-[#36E0F6]"
   paletteIndex={3}
   embedded
   fillAvailable
   shellClassName="h-full"
   contentClassName="flex min-h-0 flex-1 flex-col vt-retro-dark-content p-4"
   outerClassName="vt-retro-shell"
   hardShadow
   headerActions={<RetroLedRow leds={syncLeds} />}
  >
   <RetroRivets />
   <div className="flex min-h-0 w-full flex-1 flex-col">
    <div className="mb-3 flex flex-wrap items-center gap-2">
     <button type="button" onClick={copyProgressSummary} className="vt-retro-switch" style={{ "--tone": "#F55EFC", "--tone-light": "#ffd6f7" } as React.CSSProperties}>
      <Copy className="h-4 w-4" aria-hidden="true" />
      Copy Sync Summary
     </button>
    </div>
   <div className="sr-only" aria-live="polite">{copyStatus}</div>
   {copyStatus ? <p className="mb-3 rounded-[12px] border-[2px] border-black bg-[#FFDA47] px-3 py-2 text-[10px] font-black uppercase tracking-[0.06em]">{copyStatus}</p> : null}
   <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border-[3px] border-black bg-[#f3f4f6]">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-black bg-[#36E0F6] px-3 py-2">
     <div>
       <h3 className="vt-retro-acc-label text-[14px] font-[1000] tracking-tighter">Sync unit status</h3>
      <p className="text-[8px] font-black uppercase tracking-[0.07em] text-black/55">Live state first · stored freshness stays visible.</p>
     </div>
     <RetroLcd tone="#3FEE56" className="shrink-0">{formatRelativeTime(latestDatasetAt)}</RetroLcd>
    </header>
    <section
     aria-label="Current and queued sync queries"
     aria-live="polite"
     className="grid border-b-[3px] border-black sm:grid-cols-2"
    >
     <div className="min-w-0 bg-[#36E0F6] px-3 py-2 sm:border-r-[3px] sm:border-black">
      <strong className="block text-[8px] font-black uppercase tracking-[0.11em] text-black/55">Now syncing</strong>
      <span className="vt-retro-acc-label block truncate text-[13px]">{queueSummary.currentLabel}</span>
      <span className="block truncate text-[8px] font-bold uppercase tracking-[0.04em] text-black/55">{queueSummary.currentMessage}</span>
     </div>
     <div className="min-w-0 border-t-[3px] border-black bg-[#FFDA47] px-3 py-2 sm:border-t-0">
      <strong className="block text-[8px] font-black uppercase tracking-[0.11em] text-black/55">Next queued query</strong>
      <span className="vt-retro-acc-label block truncate text-[13px]">{queueSummary.nextLabel}</span>
      <span className="block truncate text-[8px] font-bold uppercase tracking-[0.04em] text-black/55">{queueSummary.nextMessage}</span>
     </div>
    </section>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b-[3px] border-black bg-[#161616] px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-white">
     {[
      ["Live", progress?.status === "running" ? 1 : 0, "#36E0F6"],
      ["Synced", datasetTally.synced || 0, "#3FEE56"],
      ["Partial", datasetTally.partial || 0, "#FFDA47"],
      ["Failed", datasetTally.failed || 0, "#FA618A"],
      ["Never", datasetTally.never || 0, "#9aa0ab"],
     ].map(([label, value, tone]) => (
      <span key={String(label)} className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-black" style={{ backgroundColor: String(tone), boxShadow: `0 0 5px ${String(tone)}` }} />{label} <b className="font-mono text-[11px]" style={{ color: String(tone) }}>{Number(value).toLocaleString()}</b></span>
     ))}
    </div>
    <div className="min-h-0 flex-1 overflow-auto bg-[#0d0d0d] custom-scrollbar">
     {progressGroups.map((group) => {
      const groupExpanded = expandedGroupIds.has(group.group)
      const groupContentId = `vt-sync-progress-group-${group.group}`
      return <section key={group.group} className="border-b-[3px] border-black bg-white last:border-b-0">
       <h3 style={{ backgroundColor: group.color }}>
        <button
         type="button"
         aria-expanded={groupExpanded}
         aria-controls={groupContentId}
         onClick={() => toggleProgressGroup(group.group)}
         className="vt-retro-acc-header grid min-h-[38px] w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 py-1.5 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-black"
        >
         <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border-[2px] border-black bg-white" aria-hidden="true">
           {groupExpanded ? <ChevronDown className="h-4 w-4" strokeWidth={3.5} /> : <ChevronRight className="h-4 w-4" strokeWidth={3.5} />}
          </span>
          <span className="vt-retro-acc-label truncate text-[15px]">{group.label}</span>
         </span>
         <span className="hidden text-[8px] font-black uppercase tabular-nums text-black/55 sm:block">{group.units.length} units · {group.rowCount.toLocaleString()} rows</span>
         <span className="rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase leading-none" style={{ backgroundColor: syncStatusTone(group.status) }}>
          {group.issueCount ? `${group.issueCount} issue${group.issueCount === 1 ? "" : "s"}` : syncStatusLabel(group.status)}
         </span>
        </button>
       </h3>
       <div id={groupContentId} hidden={!groupExpanded}>
        {group.units.map((unit) => {
         const expanded = unit.isOpenByState || expandedUnitIds.has(unit.id)
         const unitContentId = `vt-sync-progress-unit-${unit.id}`
         return <article key={unit.id} className="border-t-[2px] border-black first:border-t-0">
          <button
           type="button"
           aria-expanded={expanded}
           aria-controls={unitContentId}
           onClick={() => setExpandedUnitIds((current) => {
            const next = new Set(current)
            if (next.has(unit.id)) next.delete(unit.id)
            else next.add(unit.id)
            return next
           })}
           className="grid min-h-[48px] w-full grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 px-3 py-1.5 text-left hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-black max-sm:grid-cols-[minmax(0,1fr)_auto_auto]"
          >
           <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase leading-none"><span className="grid h-4 w-4 place-items-center rounded border border-black bg-white" aria-hidden="true">{expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</span><span className="truncate">{unit.label}</span></span>
            <span className="ml-[22px] mt-1 block truncate text-[8px] font-bold uppercase leading-none tracking-[0.05em] text-black/50">{unit.id === "video_catalog" && videoCatalogCoverage ? `${videoCatalogCoverage.catalogTotal.toLocaleString()} videos · metadata ${videoCatalogCoverage.metadataAvailable.toLocaleString()} · analytics ${videoCatalogCoverage.analyticsAvailable.toLocaleString()}` : `${unit.rows.length} dataset${unit.rows.length === 1 ? "" : "s"} · ${unit.displayRows.toLocaleString()} rows`} · {unit.completedAt ? formatRelativeTime(unit.completedAt) : unit.startedAt ? "in progress" : "not run"}</span>
           </span>
           <span className="rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase leading-none" style={{ backgroundColor: syncStatusTone(unit.status) }}>{syncStatusLabel(unit.status)}</span>
           <span className="hidden text-right text-[9px] font-black tabular-nums text-black/60 sm:block">{unit.displayRows.toLocaleString()}</span>
           <span className="text-[8px] font-black uppercase text-black/45">{unit.issues.length ? `${unit.issues.length} issue${unit.issues.length === 1 ? "" : "s"}` : "clear"}</span>
          </button>
          <div id={unitContentId} className={`${expanded ? "grid" : "hidden"} gap-2 border-t-[2px] border-black bg-[#f4f4f4] px-3 py-2 text-[9px] font-black uppercase tracking-[0.035em] sm:grid-cols-2`}>
           <section className="rounded border-[2px] border-black bg-white px-2 py-1.5"><strong className="block text-[8px] text-black/50">Sync time</strong><span>{formatSyncTime(unit.startedAt, unit.completedAt, unit.storedUpdatedAt)}</span></section>
           <section className="rounded border-[2px] border-black bg-white px-2 py-1.5"><strong className="block text-[8px] text-black/50">Issues</strong>{unit.issues.length ? <ul className="mt-1 space-y-1 normal-case tracking-normal text-black/75">{unit.issues.map((row) => <li key={row.category.id}><b>{row.category.label}:</b> {row.message}</li>)}</ul> : <span>No issues.</span>}</section>
           <div className="grid gap-1 border-t border-black/25 pt-2 sm:col-span-2">
            {unit.rows.map((row) => <div key={row.category.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2"><span className="truncate">{row.category.label} · {row.phaseLabel}</span><span>{row.displayRows.toLocaleString()} rows</span><span>{syncStatusLabel(row.displayStatus)}</span></div>)}
           </div>
          </div>
         </article>
        })}
       </div>
      </section>
     })}
    </div>
   </section>
   </div>
  </ToolboxScaffold>
 )
}

const VtSyncLocalAnalyticsPage: React.FC = () => {
 const navigate = useNavigate()
 const { emitSignal } = useBrain()
 const account = useUnifiedAccount()
 const [snapshot, setSnapshot] = useState<VtSyncSnapshot>(() => getVtSyncSnapshot())
 const snapshotRef = useRef(snapshot)
 const [privacyFilters, setPrivacyFilters] = useState<VtSyncPrivacyFilters>(() => readVtSyncPrivacyFilters())
 const emptyManualImports: VtSyncManualImportState = { rowsByTableId: {}, capturedAtByTableId: {} }
 const emptyPersistedApiRows: VtSyncPersistedApiState = { rowsByTableId: {}, capturedAtByTableId: {} }
 const [manualImports, setManualImports] = useState<{ channelId: string | null; value: VtSyncManualImportState }>({ channelId: null, value: emptyManualImports })
 const [persistedApiRows, setPersistedApiRows] = useState<{ channelId: string | null; value: VtSyncPersistedApiState }>({ channelId: null, value: emptyPersistedApiRows })
 const [videoInventory, setVideoInventory] = useState<{
  channelId: string | null
  status: "loading" | "ready" | "failed"
  rows: VtSyncVideoInventoryRecord[]
  error?: string
 }>({ channelId: null, status: "loading", rows: [] })
 const videoInventoryGenerationRef = useRef(0)

 const refreshPersistedApiRows = useCallback(async (requestedChannelId?: string | null) => {
  const channelId = requestedChannelId ?? snapshot.channelId
  if (!channelId) {
   setPersistedApiRows({ channelId: null, value: emptyPersistedApiRows })
   return
  }
  try {
   const value = await loadVtSyncPersistedApiRows(channelId)
   setPersistedApiRows({ channelId, value })
  } catch {
   // The compact snapshot remains usable when IndexedDB is unavailable.
  }
 }, [snapshot.channelId])

const refreshManualImports = useCallback(async (payload?: {
 rowsByTableId: Record<string, unknown[]>
 capturedAt: string
}) => {
 const channelId = snapshot.channelId

 // IMPORTANT:
 // A fresh CSV import should immediately enter React state so DATA VISUALS
 // can use it. It must not depend on authentication, channelId, IndexedDB,
 // or a second async read.
 if (payload) {
  setManualImports((current) => {
   const currentValue =
    current.channelId === channelId
     ? current.value
     : emptyManualImports

   const capturedAtByTableId = Object.fromEntries(
    Object.keys(payload.rowsByTableId).map((tableId) => [
     tableId,
     payload.capturedAt,
    ]),
   )

   return {
    channelId,
    value: {
     rowsByTableId: {
      ...currentValue.rowsByTableId,
      ...payload.rowsByTableId,
     },
     capturedAtByTableId: {
      ...currentValue.capturedAtByTableId,
      ...capturedAtByTableId,
     },
    },
   }
  })

  return
 }

 // No payload means we're doing normal persisted-import recovery.
 // We NO LONGER bail out when channelId is null — mobile boot restores
 // IndexedDB before account/channel hydration finishes and a null channelId
 // must not keep already-persisted CSV data invisible.

 try {
  if (channelId) await claimUnscopedVtSyncManualImports(channelId)
  const next = await loadVtSyncManualImports(channelId)

  setManualImports((current) => {
   const nextHasRows = Object.values(next.rowsByTableId)
    .some((rows) => Array.isArray(rows) && rows.length > 0)
   const currentHasRows = Object.values(current.value.rowsByTableId)
    .some((rows) => Array.isArray(rows) && rows.length > 0)

   // Never let an empty async hydration result erase known-good CSV rows.
   // This is the race that makes mobile visuals appear, disappear, then
   // sometimes reappear while account/channel state settles.
   if (!nextHasRows && currentHasRows) return current

   const canMergeCurrent =
    current.channelId === channelId ||
    current.channelId == null ||
    channelId == null

   return {
    channelId,
    value: {
     rowsByTableId: {
      ...(canMergeCurrent ? current.value.rowsByTableId : {}),
      ...next.rowsByTableId,
     },
     capturedAtByTableId: {
      ...(canMergeCurrent ? current.value.capturedAtByTableId : {}),
      ...next.capturedAtByTableId,
     },
    },
   }
  })
 } catch {
  // IndexedDB may be unavailable on mobile/private browsing.
  // Keep the active in-memory CSV instead of clearing it.
 }
}, [snapshot.channelId])

 const refreshVideoInventory = useCallback(async (requestedChannelId?: string | null) => {
  const channelId = requestedChannelId ?? snapshot.channelId
  const generation = videoInventoryGenerationRef.current + 1
  videoInventoryGenerationRef.current = generation
  if (!channelId) {
   setVideoInventory({ channelId: null, status: "ready", rows: [] })
   return
  }
  setVideoInventory((current) => current.channelId === channelId
   ? { ...current, status: "loading", error: undefined }
   : { channelId, status: "loading", rows: [] })
  try {
   const rows = await listVtSyncVideoInventory(channelId)
   if (videoInventoryGenerationRef.current !== generation) return
   setVideoInventory({ channelId, status: "ready", rows })
  } catch (error) {
   if (videoInventoryGenerationRef.current !== generation) return
   setVideoInventory({
    channelId,
    status: "failed",
    rows: [],
    error: error instanceof Error ? error.message : String(error),
   })
  }
 }, [snapshot.channelId])

 useEffect(() => {
  void refreshManualImports()
 }, [refreshManualImports])

 useEffect(() => {
  void refreshPersistedApiRows()
 }, [refreshPersistedApiRows])

 useEffect(() => {
  void refreshVideoInventory()
 }, [refreshVideoInventory])

 useEffect(() => {
  // Reconcile Fast Refresh state with the durable, versioned preference. This
  // resets only legacy implicit hide-by-default values; explicit v2 choices remain.
  setPrivacyFilters(readVtSyncPrivacyFilters())
 }, [])

 // Invariant: account/auth/channel hydration must never remove locally imported
 // CSV data. Once the real channelId arrives, refreshManualImports re-reads the
 // persisted records and upgrades the temporary unscoped state without an
 // empty intermediate render.
 const activeManualImports =
  manualImports.channelId === snapshot.channelId ||
  manualImports.channelId == null ||
  snapshot.channelId == null
   ? manualImports.value
   : emptyManualImports
 const activePersistedApiRows = persistedApiRows.channelId === snapshot.channelId
  ? persistedApiRows.value
  : emptyPersistedApiRows

 const rehydratedSnapshot = useMemo(
  () => mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, activePersistedApiRows),
  [activePersistedApiRows, snapshot],
 )
 const nonVideoManualImports = useMemo<VtSyncManualImportState>(() => ({
  rowsByTableId: Object.fromEntries(
   Object.entries(activeManualImports.rowsByTableId).filter(([tableId]) => tableId !== "videos"),
  ),
  capturedAtByTableId: Object.fromEntries(
   Object.entries(activeManualImports.capturedAtByTableId).filter(([tableId]) => tableId !== "videos"),
  ),
 }), [activeManualImports])
 const mergedSnapshot = useMemo(
  () => mergeVtSyncManualImportsIntoSnapshot(rehydratedSnapshot, nonVideoManualImports),
  [nonVideoManualImports, rehydratedSnapshot],
 )
 const activeVideoInventory = videoInventory.channelId === snapshot.channelId ? videoInventory.rows : []
 const videoCatalogProjection = useMemo(
  () => buildVtSyncVideoCatalogProjection({
   inventoryRows: activeVideoInventory,
   persistedRows: (activePersistedApiRows.rowsByTableId.videos || []) as Array<Record<string, unknown>>,
   liveRows: rehydratedSnapshot.videos,
   importedRows: (activeManualImports.rowsByTableId.videos || []) as Array<Record<string, unknown>>,
  }),
  [activeManualImports.rowsByTableId.videos, activePersistedApiRows.rowsByTableId.videos, activeVideoInventory, rehydratedSnapshot.videos],
 )
 const catalogSnapshot = useMemo(
  () => ({ ...mergedSnapshot, videos: videoCatalogProjection.rows }),
  [mergedSnapshot, videoCatalogProjection.rows],
 )
 const consumerSnapshot = useMemo(
  () => applyVtSyncPrivacyFilters(catalogSnapshot, privacyFilters),
  [catalogSnapshot, privacyFilters],
 )
 const [syncProgress, setSyncProgress] = useState<VtSyncLocalSyncProgress | null>(null)
 const pendingSyncProgressRef = useRef<VtSyncLocalSyncProgress | null>(null)
 const syncProgressTimerRef = useRef<number | null>(null)
 const [syncError, setSyncError] = useState<string>("")
 const [busy, setBusy] = useState(false)
 const [authTick, setAuthTick] = useState(0)
 const [controllerPanelHeight, setControllerPanelHeight] = useState<number>()
 const controllerPanelRef = useRef<HTMLDivElement | null>(null)
 const progressPanelRef = useRef<HTMLDivElement | null>(null)
 const syncRequestActiveRef = useRef(false)
 const syncQueueRef = useRef<Array<{ categoryIds: string[]; retentionVideoIds?: string[]; forceFullVideoMetadata?: boolean }>>([])
 const [queuedCategoryIds, setQueuedCategoryIds] = useState<string[]>([])

 const publishSyncProgress = useCallback((next: VtSyncLocalSyncProgress) => {
  pendingSyncProgressRef.current = next
  if (next.status !== "running") {
   if (syncProgressTimerRef.current !== null) window.clearTimeout(syncProgressTimerRef.current)
   syncProgressTimerRef.current = null
   pendingSyncProgressRef.current = null
   setSyncProgress(next)
   return
  }
  if (syncProgressTimerRef.current !== null) return
  syncProgressTimerRef.current = window.setTimeout(() => {
   syncProgressTimerRef.current = null
   const pending = pendingSyncProgressRef.current
   pendingSyncProgressRef.current = null
   if (pending) setSyncProgress(pending)
  }, 100)
 }, [])

 useEffect(() => () => {
  if (syncProgressTimerRef.current !== null) window.clearTimeout(syncProgressTimerRef.current)
 }, [])

 useLayoutEffect(() => {
  const node = controllerPanelRef.current
  if (!node) return
  const updateHeight = () => {
   const nextHeight = Math.ceil(node.getBoundingClientRect().height)
   setControllerPanelHeight((current) => current === nextHeight ? current : nextHeight)
  }
  updateHeight()
  if (typeof ResizeObserver === "undefined") return
  const observer = new ResizeObserver(updateHeight)
  observer.observe(node)
  return () => observer.disconnect()
 }, [])

 const authReady = useMemo(
  () => account.serverEnabled
   ? account.snapshot.authentication.status === "authenticated" && account.snapshot.google.youtubeScopesGranted
   : legacyAccountBridge.isAuthenticated(),
  [account.serverEnabled, account.snapshot.authentication.status, account.snapshot.google.youtubeScopesGranted, authTick],
 )
 const creatorHeroModel = useMemo(() => buildVtSyncCreatorHeroModel({
  authReady,
  snapshot,
  visibleVideos: consumerSnapshot.videos,
  progress: syncProgress,
  syncError,
 }), [authReady, consumerSnapshot.videos, snapshot, syncError, syncProgress])

 const scrollToPanel = (node: HTMLElement | null) => {
  if (!node) return
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
 }

 const publishSnapshot = (next: VtSyncSnapshot) => {
  snapshotRef.current = next
  setSnapshot(next)
 }

 const updatePrivacyFilters = (next: VtSyncPrivacyFilters) => {
  setPrivacyFilters(next)
 }

 const login = async () => {
  setBusy(true)
  setSyncError("")
  try {
   if (account.serverEnabled) await account.start(account.intent, "/local-analytics")
   else await legacyAccountBridge.login()
   setAuthTick((tick) => tick + 1)
  } catch (error) {
   setSyncError(error instanceof Error ? error.message : String(error))
  } finally {
   setBusy(false)
  }
 }

 const updateQueuedCategories = () => {
  setQueuedCategoryIds([...new Set(syncQueueRef.current.flatMap((request) => request.categoryIds))])
 }

 const runQueuedSyncs = async () => {
  if (!claimVtSyncSyncRequest(syncRequestActiveRef)) return
  const request = syncQueueRef.current.shift()
  updateQueuedCategories()
  if (!request) {
   syncRequestActiveRef.current = false
   return
  }
  setBusy(true)
  setSyncError("")
  try {
   let token = account.serverEnabled && account.snapshot.google.youtubeScopesGranted
    ? VT_SYNC_SERVER_ACCOUNT_TOKEN
    : legacyAccountBridge.getAccessToken()
   if (!token) {
    if (account.serverEnabled) {
      await account.start(account.intent, "/local-analytics")
      return
    }
    await legacyAccountBridge.login()
    token = legacyAccountBridge.getAccessToken()
    setAuthTick((tick) => tick + 1)
   }
   if (!token) throw new Error("No valid Google access token is available after authorization.")
   const requestedCategoryIds = expandVtSyncCategoryDependencies(request.categoryIds)
   const next = await runVtSyncLocalSync({
    token,
    selectedCategories: requestedCategoryIds,
    retentionVideoIds: request.retentionVideoIds,
    forceFullVideoMetadata: request.forceFullVideoMetadata,
    contentOwnerId: account.snapshot.google.activeContentOwnerId || undefined,
    previousSnapshot: snapshotRef.current,
   onProgress: publishSyncProgress,
   onSnapshotCommit: publishSnapshot,
   })
   publishSnapshot(next)
   await refreshPersistedApiRows(next.channelId)
   await refreshVideoInventory(next.channelId)
   await emitSignal("vt-sync-local-analytics", "local_sync_complete", {
    snapshotId: next.snapshotId,
    categories: requestedCategoryIds,
    manifest: next.syncManifest,
    note: "Local Annalytics page sync only. No canonical sink or Performance Hub writes.",
   })
  } catch (error) {
   if (isGoogleReconnectRequiredError(error)) {
    syncQueueRef.current = []
    updateQueuedCategories()
    setSyncError("Reconnect Google to continue syncing.")
    void account.refresh()
   } else {
    setSyncError(error instanceof Error ? error.message : String(error))
   }
  } finally {
   syncRequestActiveRef.current = false
   setBusy(false)
   if (syncQueueRef.current.length > 0) void runQueuedSyncs()
  }
 }

 const startSync = async (categoryIds: string[], retentionVideoIds?: string[], forceFullVideoMetadata = false) => {
  const requestedCategoryIds = expandVtSyncCategoryDependencies(categoryIds)
  syncQueueRef.current.push({ categoryIds: requestedCategoryIds, retentionVideoIds, forceFullVideoMetadata })
  updateQueuedCategories()
  void runQueuedSyncs()
 }

 return (
  <div className="vt-sync-local-page min-h-screen bg-[#f3f4f6] px-4 py-6 text-black sm:px-6 lg:px-8">
   <div className="mx-auto max-w-[1500px] space-y-6">
    <VtSyncCreatorHero
     model={creatorHeroModel}
     onConnect={() => { void login() }}
     onRecommendedSync={() => { void startSync(getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds)) }}
     onChooseDatasets={() => scrollToPanel(controllerPanelRef.current)}
     onViewProgress={() => scrollToPanel(progressPanelRef.current)}
    />

    <section className="grid items-start gap-6 md:grid-cols-2">
     <div ref={controllerPanelRef} className="min-w-0">
      <VtSyncControllerPanel
       isAuthenticated={authReady}
       isSyncing={busy}
       activeCategoryIds={syncProgress?.status === "running" ? syncProgress.requestedCategoryIds : []}
       queuedCategoryIds={queuedCategoryIds}
       datasetFreshness={mergedSnapshot.datasetFreshness}
       contentOwners={account.snapshot.google.contentOwners}
       activeContentOwnerId={account.snapshot.google.activeContentOwnerId}
       onSelectContentOwner={account.selectContentOwner}
       videos={consumerSnapshot.videos.map((video) => ({ id: video.id, title: video.title, thumbnail: video.thumbnail, views: video.metrics?.views || 0 }))}
       onLogin={login}
       onStartSync={startSync}
      />
     </div>
     <div
      ref={progressPanelRef}
      className="vt-sync-progress-height-match min-h-0 min-w-0"
      style={controllerPanelHeight ? ({ "--vt-sync-controller-height": `${controllerPanelHeight}px` } as React.CSSProperties) : undefined}
     >
      <ProgressRail
       progress={syncProgress}
       datasetFreshness={snapshot.datasetFreshness}
       syncError={syncError}
       queuedCategoryIds={queuedCategoryIds}
       videoCatalogCoverage={videoCatalogProjection.coverage}
      />
     </div>
    </section>
    <VtSyncToolboxDataTable
     snapshot={catalogSnapshot}
     privacyFilters={privacyFilters}
     onPrivacyFiltersChange={updatePrivacyFilters}
     onManualImportsChange={refreshManualImports}
     videoCatalogCoverage={videoCatalogProjection.coverage}
     storageStatus={videoInventory.channelId === snapshot.channelId ? videoInventory.status : "loading"}
     storageError={videoInventory.channelId === snapshot.channelId ? videoInventory.error : undefined}
    />
    <VtSyncDataVisualsGate snapshot={consumerSnapshot} />
   </div>
  </div>
 )
}

export default VtSyncLocalAnalyticsPage
