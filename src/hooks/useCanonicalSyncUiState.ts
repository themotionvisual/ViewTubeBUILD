import React from "react"
import {
 getCanonicalActiveSinkPhaseSnapshot,
 getCanonicalSyncOverview,
} from "../services/canonicalSync"
import {
 getCanonicalActiveOperatorPhaseSnapshot,
 getCanonicalOperatorPhaseSnapshots,
} from "../services/canonicalSync/operatorPhases"

export const useCanonicalSyncUiState = () => {
 const [overview, setOverview] = React.useState<Awaited<
  ReturnType<typeof getCanonicalSyncOverview>
 > | null>(null)

 React.useEffect(() => {
  let cancelled = false
  const refresh = async () => {
   try {
    const nextOverview = await getCanonicalSyncOverview()
    if (!cancelled) setOverview(nextOverview)
   } catch (error) {
    if (!cancelled) {
     console.warn(
      "[CanonicalSyncUI] Failed to read overview:",
      error instanceof Error ? error.message : String(error),
     )
    }
   }
  }

  void refresh()
  const handleRefresh = () => {
   void refresh()
  }

  window.addEventListener("vt_manual_sync_started", handleRefresh)
  window.addEventListener("vt_manual_sync_completed", handleRefresh)
  window.addEventListener("vt_manual_sync_failed", handleRefresh)
  window.addEventListener("vt_local_data_changed", handleRefresh)
  window.addEventListener("vt_channel_sync_status", handleRefresh)

  return () => {
   cancelled = true
   window.removeEventListener("vt_manual_sync_started", handleRefresh)
   window.removeEventListener("vt_manual_sync_completed", handleRefresh)
   window.removeEventListener("vt_manual_sync_failed", handleRefresh)
   window.removeEventListener("vt_local_data_changed", handleRefresh)
   window.removeEventListener("vt_channel_sync_status", handleRefresh)
  }
 }, [])

 const stageStatus = overview?.lastRun?.stageStatus || {}
 const runStatus = overview?.lastRun?.status || "idle"

 return React.useMemo(
  () => ({
   overview,
   stageStatus,
   runStatus,
   activeSinkPhase: getCanonicalActiveSinkPhaseSnapshot(stageStatus),
   operatorPhases: getCanonicalOperatorPhaseSnapshots(stageStatus, runStatus),
   activeOperatorPhase: getCanonicalActiveOperatorPhaseSnapshot(
    stageStatus,
    runStatus,
   ),
  }),
  [overview, runStatus, stageStatus],
 )
}
