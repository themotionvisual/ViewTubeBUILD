import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useBrain } from "../../../context/useBrain"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import { legacyAccountBridge } from "../../../services/account/legacyAccountBridge"
import { isGoogleReconnectRequiredError } from "../../../services/youtube/googleProxyErrors"
import { isLoginAbortError } from "../../../services/auth/loginErrors"
import {
 getVtSyncSnapshot,
 subscribeToVtSyncSnapshot,
 runVtSyncLocalSync,
 expandVtSyncCategoryDependencies,
 getVtSyncDefaultUnitIds,
 getVtSyncUnitCategoryIds,
 saveVtSyncSnapshot,
 VT_SYNC_SERVER_ACCOUNT_TOKEN,
 type VtSyncSnapshot,
 type VtSyncLocalSyncProgress,
} from "../../../features/vt-sync-local"
import {
 filterVtSyncVisibleCategoryIds,
} from "../../../features/vt-sync-local/upstream/syncCategoryRegistry"
import {
 VT_SYNC_GROUP_ORDER,
 VT_SYNC_SYNC_UNITS,
} from "../../../features/vt-sync-local/upstream/syncUnitRegistry"
import {
 buildVtSyncConsoleModel,
 claimVtSyncSyncRequest,
 VT_SYNC_CONSOLE_STATUS_ORDER,
 VT_SYNC_CONSOLE_STATUS_PRESENTATION,
 type VtSyncConsoleStatus,
} from "../../../features/vt-sync-local/shell/vtSyncProgressModel"
import type { VtSyncCategoryGroup } from "../../../features/vt-sync-local/adapters/contracts"
import type { RetroLedSpec } from "../../../features/vt-sync-local/shell/VtSyncRetroChrome"
import { getPaletteColor } from "../../../styles/toolboxPalette"

// ── Helpers ──

const GROUP_COLORS: Record<string, string> = Object.fromEntries(
 VT_SYNC_GROUP_ORDER.map((group, index) => [group, getPaletteColor(index * 2)]),
)

const buildUnitGroups = (hasContentOwner: boolean) =>
 VT_SYNC_GROUP_ORDER
  .map((group) => ({
   group,
   units: VT_SYNC_SYNC_UNITS.filter(
    (unit) => unit.group === group && (unit.id !== "traffic_detail_traffic_campaign_card" || hasContentOwner),
   ),
  }))
  .filter((entry) => entry.units.length > 0)

// ── Hook ──

export const useSyncControllerWidget = () => {
 const { emitSignal } = useBrain()
 const account = useUnifiedAccount()

 // VT-SYNC snapshot subscription
 const [snapshot, setSnapshot] = useState<VtSyncSnapshot>(() => getVtSyncSnapshot())
 const snapshotRef = useRef(snapshot)
 useEffect(() => subscribeToVtSyncSnapshot(() => {
  const next = getVtSyncSnapshot()
  snapshotRef.current = next
  setSnapshot(next)
 }), [])

 // Sync progress & queue state
 const [syncProgress, setSyncProgress] = useState<VtSyncLocalSyncProgress | null>(null)
 const pendingProgressRef = useRef<VtSyncLocalSyncProgress | null>(null)
 const progressTimerRef = useRef<number | null>(null)
 const [syncError, setSyncError] = useState("")
 const [busy, setBusy] = useState(false)
 const [authTick, setAuthTick] = useState(0)
 const syncRequestActiveRef = useRef(false)
 const syncQueueRef = useRef<Array<{
  categoryIds: string[]
  displayCategoryIds: string[]
  retentionVideoIds?: string[]
  forceFullVideoMetadata?: boolean
 }>>([])
 const [queuedCategoryIds, setQueuedCategoryIds] = useState<string[]>([])
 const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])

 // Selection state
 const [selected, setSelected] = useState<string[]>(
  () => getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds),
 )
 const [openGroups, setOpenGroups] = useState<Set<VtSyncCategoryGroup>>(
  () => new Set(["channel"]),
 )

 // Auth readiness — canonical snapshot, not localStorage inference
 const authReady = useMemo(
  () => account.serverEnabled
   ? account.snapshot.authentication.status === "authenticated" && account.snapshot.google.youtubeScopesGranted
   : legacyAccountBridge.isAuthenticated(),
  [account.serverEnabled, account.snapshot.authentication.status, account.snapshot.google.youtubeScopesGranted, authTick],
 )

 // Unit groups & selection
 const activeContentOwnerId = account.snapshot.google.activeContentOwnerId
 const contentOwners = account.snapshot.google.contentOwners
 const unitGroups = useMemo(() => buildUnitGroups(Boolean(activeContentOwnerId)), [activeContentOwnerId])
 const availableUnits = useMemo(() => unitGroups.flatMap((entry) => entry.units), [unitGroups])
 const visibleUnitIds = useMemo(() => availableUnits.map((unit) => unit.id), [availableUnits])
 const allVisibleCategoryIds = useMemo(
  () => [...new Set(availableUnits.flatMap((unit) => unit.categoryIds))],
  [availableUnits],
 )
 const selectedSet = useMemo(() => new Set(selected), [selected])
 const selectedUnitCount = useMemo(
  () => availableUnits.filter((unit) => unit.categoryIds.every((id) => selectedSet.has(id))).length,
  [availableUnits, selectedSet],
 )
 const activeCategorySet = useMemo(() => new Set(activeCategoryIds), [activeCategoryIds])

 // Console model
 const consoleModel = useMemo(
  () => buildVtSyncConsoleModel({
   progress: syncProgress,
   datasetFreshness: snapshot.datasetFreshness,
   queuedCategoryIds,
   syncError,
   visibleUnitIds,
   activeCategoryIds,
  }),
  [activeCategoryIds, snapshot.datasetFreshness, syncProgress, queuedCategoryIds, syncError, visibleUnitIds],
 )

 // LED specs
 const syncLeds: RetroLedSpec[] = VT_SYNC_CONSOLE_STATUS_ORDER.map((status) => ({
  id: status,
  label: `${consoleModel.tally[status]} units ${VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].label.toLowerCase()}`,
  tone: VT_SYNC_CONSOLE_STATUS_PRESENTATION[status].tone,
  lit: consoleModel.tally[status] > 0 && (status === "live" || status === "queued"),
  pulse: status === "live",
 }))

 // Throttled progress publisher (100ms coalesce)
 const publishSyncProgress = useCallback((next: VtSyncLocalSyncProgress) => {
  pendingProgressRef.current = next
  if (next.status !== "running") {
   if (progressTimerRef.current !== null) window.clearTimeout(progressTimerRef.current)
   progressTimerRef.current = null
   pendingProgressRef.current = null
   setSyncProgress(next)
   return
  }
  if (progressTimerRef.current !== null) return
  progressTimerRef.current = window.setTimeout(() => {
   progressTimerRef.current = null
   const pending = pendingProgressRef.current
   pendingProgressRef.current = null
   if (pending) setSyncProgress(pending)
  }, 100)
 }, [])

 useEffect(() => () => {
  if (progressTimerRef.current !== null) window.clearTimeout(progressTimerRef.current)
 }, [])

 // Auto-expand group with active/issue status
 const activeOrIssueGroup = consoleModel.groups.find(
  (group) => group.effectiveStatus === "live" || group.issueCount > 0,
 )?.group
 useEffect(() => {
  if (!activeOrIssueGroup) return
  setOpenGroups((current) =>
   current.has(activeOrIssueGroup) ? current : new Set([...current, activeOrIssueGroup]),
  )
 }, [activeOrIssueGroup])

 // Queue management
 const updateQueuedCategories = () => {
  setQueuedCategoryIds([...new Set(syncQueueRef.current.flatMap((r) => r.displayCategoryIds))])
 }

 const publishSnapshot = (next: VtSyncSnapshot) => {
  snapshotRef.current = next
  setSnapshot(next)
 }

 const runQueuedSyncs = async () => {
  if (!claimVtSyncSyncRequest(syncRequestActiveRef)) return
  const request = syncQueueRef.current.shift()
  updateQueuedCategories()
  if (!request) {
   syncRequestActiveRef.current = false
   setActiveCategoryIds([])
   return
  }
  setActiveCategoryIds(request.displayCategoryIds)
  setBusy(true)
  setSyncError("")
  try {
   let token = account.serverEnabled && account.snapshot.google.youtubeScopesGranted
    ? VT_SYNC_SERVER_ACCOUNT_TOKEN
    : legacyAccountBridge.getAccessToken()
   if (!token) {
    if (account.serverEnabled) {
     await account.start(account.intent, "/dashboard")
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
    contentOwnerId: activeContentOwnerId || undefined,
    previousSnapshot: snapshotRef.current,
    onProgress: publishSyncProgress,
    onSnapshotCommit: publishSnapshot,
   })
   publishSnapshot(next)
   await emitSignal("dashboard-sync-widget", "local_sync_complete", {
    snapshotId: next.snapshotId,
    categories: requestedCategoryIds,
    manifest: next.syncManifest,
    note: "Dashboard mini sync controller. No canonical sink or Performance Hub writes.",
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
   setActiveCategoryIds([])
   setBusy(false)
   if (syncQueueRef.current.length > 0) void runQueuedSyncs()
  }
 }

 // Login
 const login = async () => {
  setBusy(true)
  setSyncError("")
  try {
   if (account.serverEnabled) await account.start(account.intent, "/dashboard")
   else await legacyAccountBridge.login()
   setAuthTick((tick) => tick + 1)
  } catch (error) {
   if (isLoginAbortError(error)) return
   setSyncError(error instanceof Error ? error.message : String(error))
  } finally {
   setBusy(false)
  }
 }

 // Sync triggers
 const startCategories = async (categoryIds: string[]) => {
  if (!authReady) {
   try { await login() } catch (error) {
    if (isLoginAbortError(error)) return
    throw error
   }
   if (!authReady) return
  }
  const expanded = expandVtSyncCategoryDependencies(categoryIds)
  syncQueueRef.current.push({ categoryIds: expanded, displayCategoryIds: categoryIds })
  updateQueuedCategories()
  void runQueuedSyncs()
 }

 const startSelected = async () => {
  const filtered = filterVtSyncVisibleCategoryIds(selected)
  await startCategories(filtered)
 }

 const startAll = async () => {
  await startCategories(allVisibleCategoryIds)
 }

 // Selection toggle
 const toggleMany = (ids: string[]) => {
  setSelected((current) => {
   const allSelected = ids.every((id) => current.includes(id))
   return allSelected
    ? current.filter((entry) => !ids.includes(entry))
    : [...new Set([...current, ...ids])]
  })
 }

 // Group accordion
 const toggleGroup = (group: VtSyncCategoryGroup) => {
  setOpenGroups((current) => {
   const next = new Set(current)
   if (next.has(group)) next.delete(group)
   else {
    while (next.size >= 2) next.delete(next.values().next().value as VtSyncCategoryGroup)
    next.add(group)
   }
   return next
  })
 }

 // Status resolver for category sets
 const statusForCategories = (categoryIds: string[]): VtSyncConsoleStatus => {
  if (categoryIds.some((id) => activeCategorySet.has(id))) return "live"
  if (categoryIds.some((id) => queuedCategoryIds.includes(id))) return "queued"
  return "never"
 }

 return {
  // Auth
  isAuthenticated: authReady,
  isSyncing: busy,
  login,
  // Console model
  consoleModel,
  syncLeds,
  syncError,
  // Queue state
  queuedCategoryIds,
  activeCategoryIds,
  // Content owner
  contentOwners: contentOwners || [],
  activeContentOwnerId,
  onSelectContentOwner: account.selectContentOwner,
  // Sync triggers
  startAll,
  startSelected,
  startCategories,
  // Selection
  selected,
  selectedSet,
  selectedUnitCount,
  toggleMany,
  // Groups
  unitGroups,
  openGroups,
  toggleGroup,
  statusForCategories,
  // Presentation helpers
  GROUP_COLORS,
  VT_SYNC_CONSOLE_STATUS_ORDER,
  VT_SYNC_CONSOLE_STATUS_PRESENTATION,
 }
}

export type SyncControllerWidgetState = ReturnType<typeof useSyncControllerWidget>
