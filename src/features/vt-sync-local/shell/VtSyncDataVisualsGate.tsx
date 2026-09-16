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

/**
 * Does this snapshot carry ANY imported or synced rows?
 *
 * Deliberately generic rather than a hand-written list of seven datasets. The
 * snapshot has dozens of tables, and naming a few of them meant an import of
 * anything else — demographics, search terms, cities, a traffic detail table —
 * looked like "no data", so the hydrated snapshot was thrown away and the
 * creator's own import never reached the visuals. Any populated array, or any
 * populated `tableExports` bucket, counts.
 */
const hasSnapshotData = (value: VtSyncSnapshot): boolean => {
 if (value.source !== "empty") return true
 for (const entry of Object.values(value as unknown as Record<string, unknown>)) {
  if (Array.isArray(entry) && entry.length > 0) return true
 }
 const exports = (value.tableExports || {}) as Record<string, unknown>
 return Object.values(exports).some((rows) => Array.isArray(rows) && rows.length > 0)
}

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
