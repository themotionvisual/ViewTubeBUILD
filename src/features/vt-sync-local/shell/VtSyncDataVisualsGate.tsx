import React, { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { ChartNoAxesCombined } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import {
 loadVtSyncManualImports,
 loadVtSyncPersistedApiRows,
 mergeVtSyncManualImportsIntoSnapshot,
 mergeVtSyncPersistedApiRowsIntoSnapshot,
 type VtSyncSnapshot,
} from ".."

const PrimaryVisuals = lazy(() => import("./VtSyncDataVisualsToolbox").then((module) => ({
 default: module.VtSyncPrimaryVisualsContent,
})))

const SecondaryVisuals = lazy(() => import("./VtSyncDataVisualsToolbox").then((module) => ({
 default: module.VtSyncSecondaryVisualsContent,
})))

const VisualLoadingState = () => (
 <div
  className="flex min-h-[160px] items-center justify-center border-[3px] border-dashed border-black bg-white text-[11px] font-black uppercase tracking-[0.14em] text-black/35"
  role="status">
  Loading visual modules…
 </div>
)

const hasSnapshotData = (value: VtSyncSnapshot) =>
 value.source !== "empty"
 || (value.videos?.length || 0) > 0
 || (value.trafficSources?.length || 0) > 0
 || (value.trafficByDay?.length || 0) > 0
 || (value.dailyMetrics?.length || 0) > 0
 || (value.monthlyMetrics?.length || 0) > 0
 || (value.geography?.length || 0) > 0

export const VtSyncDataVisualsGate: React.FC<{ snapshot: VtSyncSnapshot }> = ({ snapshot }) => {
 const [isOpen1, setIsOpen1] = useState(false)
 const [isOpen2, setIsOpen2] = useState(false)
 const [tableSnapshot, setTableSnapshot] = useState<VtSyncSnapshot>(snapshot)

 useEffect(() => {
  let cancelled = false
  setTableSnapshot(snapshot)

  const hydrateFromTables = async () => {
   try {
    const [manualImports, persistedApiRows] = await Promise.all([
     loadVtSyncManualImports(snapshot.channelId),
     loadVtSyncPersistedApiRows(snapshot.channelId),
    ])
    if (cancelled) return
    const withApiRows = mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, persistedApiRows)
    const withAllRows = mergeVtSyncManualImportsIntoSnapshot(withApiRows, manualImports)
    if (hasSnapshotData(withAllRows) || !hasSnapshotData(snapshot)) setTableSnapshot(withAllRows)
   } catch {
    if (!cancelled) setTableSnapshot(snapshot)
   }
  }

  void hydrateFromTables()
  return () => { cancelled = true }
 }, [snapshot])

 const visualSnapshot = useMemo(
  () => hasSnapshotData(tableSnapshot) ? tableSnapshot : snapshot,
  [snapshot, tableSnapshot],
 )

 return (
  <div className="vt-sync-data-visuals flex flex-col gap-6">
   <ToolboxScaffold
    title="DATA VISUALS"
    subtitle="Primary intelligence visual modules powered by the local Annalytics snapshot."
    icon={<ChartNoAxesCombined />}
    paletteIndex={0}
    headerColor="bg-[#36E0F6]"
    iconBoxColor="bg-[#F55EFC]"
    collapsible
    isOpen={isOpen1}
    onToggle={() => setIsOpen1((open) => !open)}
    unmountWhenClosed
    contentClassName="bg-[#f4f1eb] p-6">
    {isOpen1 ? (
     <Suspense fallback={<VisualLoadingState />}>
      <PrimaryVisuals snapshot={visualSnapshot} />
     </Suspense>
    ) : null}
   </ToolboxScaffold>

   <ToolboxScaffold
    title="DATA VISUALS 2"
    subtitle="Extended Tube Explorer & Visual Lab modules powered by the local Annalytics snapshot."
    icon={<ChartNoAxesCombined />}
    paletteIndex={3}
    headerColor="bg-[#FFDA47]"
    iconBoxColor="bg-[#3FEE56]"
    collapsible
    isOpen={isOpen2}
    onToggle={() => setIsOpen2((open) => !open)}
    unmountWhenClosed
    contentClassName="bg-[#f4f1eb] p-6">
    {isOpen2 ? (
     <Suspense fallback={<VisualLoadingState />}>
      <SecondaryVisuals snapshot={visualSnapshot} />
     </Suspense>
    ) : null}
   </ToolboxScaffold>
  </div>
 )
}
