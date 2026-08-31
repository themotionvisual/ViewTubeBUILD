import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useBrain } from "../../../context/useBrain"
import { legacyAccountBridge } from "../../../services/account/legacyAccountBridge"
import { isGoogleReconnectRequiredError } from "../../../services/youtube/googleProxyErrors"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import {
 getVtSyncSnapshot,
 runVtSyncLocalSync,
 type VtSyncDatasetFreshness,
 type VtSyncLocalSyncProgress,
 type VtSyncSnapshot,
 VT_SYNC_SERVER_ACCOUNT_TOKEN,
 expandVtSyncCategoryDependencies,
 getVtSyncDefaultUnitIds,
 getVtSyncUnitCategoryIds,
 applyVtSyncPrivacyFilters,
 readVtSyncPrivacyFilters,
 type VtSyncPrivacyFilters,
 loadVtSyncManualImports,
 loadVtSyncPersistedApiRows,
 mergeVtSyncManualImportsIntoSnapshot,
 mergeVtSyncPersistedApiRowsIntoSnapshot,
 type VtSyncPersistedApiState,
 type VtSyncManualImportState,
 type VtSyncVideoInventoryRecord,
 type VtSyncVideoCatalogCoverage,
 buildVtSyncVideoCatalogProjection,
 buildResolvedAnalyticsDatasetBundle,
 listVtSyncVideoInventory,
 clearVtSyncLocalDb,
 clearVtSyncSavedTableData,
 clearVtSyncSnapshot,
 clearVtSyncTableDataFromSnapshot,
 removeVtSyncTableFromImportState,
 saveVtSyncSnapshot,
 subscribeToVtSyncSnapshot,
} from ".."
import { VtSyncControllerPanel } from "./VtSyncControllerPanel"
import { buildVtSyncCreatorHeroModel, VtSyncCreatorHero } from "./VtSyncCreatorHero"
import { VtSyncToolboxDataTable } from "./toolbox-table/VtSyncToolboxDataTable"
import { VtSyncDataVisualsGate } from "./VtSyncDataVisualsGate"
import { VtSyncIntelligenceHubGate } from "./VtSyncIntelligenceHubGate"
import "./VtSyncLocalAnalyticsPage.css"
import {
 claimVtSyncSyncRequest,
} from "./vtSyncProgressModel"

const EMPTY_MANUAL_IMPORTS: VtSyncManualImportState = { rowsByTableId: {}, capturedAtByTableId: {} }
const EMPTY_PERSISTED_API_ROWS: VtSyncPersistedApiState = { rowsByTableId: {}, capturedAtByTableId: {} }

const VtSyncLocalAnalyticsPage: React.FC = () => {
 const navigate = useNavigate()
 const { emitSignal } = useBrain()
 const account = useUnifiedAccount()
 const [snapshot, setSnapshot] = useState<VtSyncSnapshot>(() => getVtSyncSnapshot())
 const snapshotRef = useRef(snapshot)
 const [privacyFilters, setPrivacyFilters] = useState<VtSyncPrivacyFilters>(() => readVtSyncPrivacyFilters())
 const [manualImports, setManualImports] = useState<{ channelId: string | null; value: VtSyncManualImportState }>({ channelId: null, value: EMPTY_MANUAL_IMPORTS })
 const [persistedApiRows, setPersistedApiRows] = useState<{ channelId: string | null; value: VtSyncPersistedApiState }>({ channelId: null, value: EMPTY_PERSISTED_API_ROWS })
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
   setPersistedApiRows({ channelId: null, value: EMPTY_PERSISTED_API_ROWS })
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
 const channelId = snapshot.channelId ?? null

 // IMPORTANT:
 // A fresh CSV import should immediately enter React state so DATA VISUALS
 // can use it. It must not depend on authentication, channelId, IndexedDB,
 // or a second async read.
 if (payload) {
  setManualImports((current) => {
   const currentValue =
    current.channelId === channelId
     ? current.value
     : EMPTY_MANUAL_IMPORTS

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

 // Persisted imports are account data. Wait for a resolved channel rather than
 // hydrating or assigning anonymous records to whichever account appears first.
 if (!channelId) return

 try {
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

   const canMergeCurrent = current.channelId === channelId

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

 const clearSavedData = useCallback(async (
  scope: { kind: "table"; tableId: string } | { kind: "all" },
 ) => {
  if (scope.kind === "all") {
   await clearVtSyncLocalDb()
   const next = clearVtSyncSnapshot()
   snapshotRef.current = next
   setSnapshot(next)
   setManualImports({ channelId: null, value: EMPTY_MANUAL_IMPORTS })
   setPersistedApiRows({ channelId: null, value: EMPTY_PERSISTED_API_ROWS })
   setVideoInventory({ channelId: null, status: "ready", rows: [] })
   setSyncProgress(null)
   setSyncError("")
   return
  }

  const channelId = snapshotRef.current.channelId ?? null
  await clearVtSyncSavedTableData(scope.tableId, channelId)
  const next = clearVtSyncTableDataFromSnapshot(snapshotRef.current, scope.tableId)
  saveVtSyncSnapshot(next)
  snapshotRef.current = next
  setSnapshot(next)
  setManualImports((current) => ({
   ...current,
   value: removeVtSyncTableFromImportState(current.value, scope.tableId),
  }))
  setPersistedApiRows((current) => ({
   ...current,
   value: removeVtSyncTableFromImportState(current.value, scope.tableId),
  }))
  if (scope.tableId === "videos") {
   setVideoInventory({ channelId, status: "ready", rows: [] })
  }
 }, [])

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

 useEffect(() => subscribeToVtSyncSnapshot(() => {
  const next = getVtSyncSnapshot()
  snapshotRef.current = next
  setSnapshot(next)
  void refreshPersistedApiRows(next.channelId)
  void refreshVideoInventory(next.channelId)
 }), [refreshPersistedApiRows, refreshVideoInventory])

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

 // Anonymous imports are session-only. Once account hydration resolves a
 // channel, only that channel's persisted or freshly imported rows are active.
 const activeManualImports =
  manualImports.channelId === snapshot.channelId
   ? manualImports.value
   : EMPTY_MANUAL_IMPORTS
 const activePersistedApiRows = persistedApiRows.channelId === snapshot.channelId
  ? persistedApiRows.value
  : EMPTY_PERSISTED_API_ROWS

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
 const resolvedAnalyticsBundle = useMemo(
  () => buildResolvedAnalyticsDatasetBundle(catalogSnapshot, privacyFilters),
  [catalogSnapshot, privacyFilters],
 )
 const [syncProgress, setSyncProgress] = useState<VtSyncLocalSyncProgress | null>(null)
 const pendingSyncProgressRef = useRef<VtSyncLocalSyncProgress | null>(null)
 const syncProgressTimerRef = useRef<number | null>(null)
 const [syncError, setSyncError] = useState<string>("")
 const [busy, setBusy] = useState(false)
 const [authTick, setAuthTick] = useState(0)
 const controllerPanelRef = useRef<HTMLDivElement | null>(null)
 const syncRequestActiveRef = useRef(false)
 const syncQueueRef = useRef<Array<{ categoryIds: string[]; displayCategoryIds: string[]; retentionVideoIds?: string[]; forceFullVideoMetadata?: boolean }>>([])
 const [queuedCategoryIds, setQueuedCategoryIds] = useState<string[]>([])
 const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])

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
  setQueuedCategoryIds([...new Set(syncQueueRef.current.flatMap((request) => request.displayCategoryIds))])
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
   setActiveCategoryIds([])
   setBusy(false)
   if (syncQueueRef.current.length > 0) void runQueuedSyncs()
  }
 }

 const startSync = async (categoryIds: string[], retentionVideoIds?: string[], forceFullVideoMetadata = false) => {
  const requestedCategoryIds = expandVtSyncCategoryDependencies(categoryIds)
  syncQueueRef.current.push({ categoryIds: requestedCategoryIds, displayCategoryIds: categoryIds, retentionVideoIds, forceFullVideoMetadata })
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
     onViewProgress={() => scrollToPanel(controllerPanelRef.current)}
    />

    <section className="grid items-start gap-6 lg:grid-cols-2">
     <div ref={controllerPanelRef} className="min-w-0">
      <VtSyncControllerPanel
       isAuthenticated={authReady}
       isSyncing={busy}
       progress={syncProgress}
       queuedCategoryIds={queuedCategoryIds}
       activeCategoryIds={activeCategoryIds}
       datasetFreshness={mergedSnapshot.datasetFreshness}
       syncError={syncError}
       videoCatalogCoverage={videoCatalogProjection.coverage}
       contentOwners={account.snapshot.google.contentOwners}
       activeContentOwnerId={account.snapshot.google.activeContentOwnerId}
       onSelectContentOwner={account.selectContentOwner}
       videos={consumerSnapshot.videos.map((video) => ({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        views: video.metrics?.views || 0,
        format: video.format,
        publishedAt: video.publishedAt,
        privacyStatus: video.privacyStatus,
       }))}
       onLogin={login}
       onStartSync={startSync}
      />
     </div>
    </section>
    {/* Intelligence Hub moved ABOVE the data table so it is actually
      visible without scrolling past 5,000 lines of tabular rows. Users
      reported "I don't see the module on the Analytics page" — the
      gate WAS mounted, just buried. Sync controller → Intelligence
      Hub → data table → visuals is the natural reading order because
      the Hub answers "what does this data mean?" and the table +
      visuals are "here is the raw data." */}
    <VtSyncIntelligenceHubGate snapshot={consumerSnapshot} resolvedBundle={resolvedAnalyticsBundle} />
    <VtSyncToolboxDataTable
     snapshot={catalogSnapshot}
     privacyFilters={privacyFilters}
     onPrivacyFiltersChange={updatePrivacyFilters}
     onManualImportsChange={refreshManualImports}
     onClearSavedData={clearSavedData}
     savedDataClearDisabled={busy}
     videoCatalogCoverage={videoCatalogProjection.coverage}
     storageStatus={videoInventory.channelId === snapshot.channelId ? videoInventory.status : "loading"}
     storageError={videoInventory.channelId === snapshot.channelId ? videoInventory.error : undefined}
     resolvedBundle={resolvedAnalyticsBundle}
    />
    <VtSyncDataVisualsGate snapshot={consumerSnapshot} />
   </div>
  </div>
 )
}

export default VtSyncLocalAnalyticsPage
