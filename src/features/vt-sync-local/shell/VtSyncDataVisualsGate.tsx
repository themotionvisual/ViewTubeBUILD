import React, { lazy, Suspense, useState } from "react"
import { ChartNoAxesCombined } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import type { VtSyncSnapshot } from "../adapters/contracts"

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

export const VtSyncDataVisualsGate: React.FC<{ snapshot: VtSyncSnapshot }> = ({ snapshot }) => {
 const [isPrimaryOpen, setIsPrimaryOpen] = useState(false)
 const [isSecondaryOpen, setIsSecondaryOpen] = useState(false)

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
    isOpen={isPrimaryOpen}
    onToggle={() => setIsPrimaryOpen((open) => !open)}
    unmountWhenClosed
    contentClassName="bg-[#f4f1eb] p-6">
    {isPrimaryOpen ? (
     <Suspense fallback={<VisualLoadingState />}>
      <PrimaryVisuals snapshot={snapshot} />
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
    isOpen={isSecondaryOpen}
    onToggle={() => setIsSecondaryOpen((open) => !open)}
    unmountWhenClosed
    contentClassName="bg-[#f4f1eb] p-6">
    {isSecondaryOpen ? (
     <Suspense fallback={<VisualLoadingState />}>
      <SecondaryVisuals snapshot={snapshot} />
     </Suspense>
    ) : null}
   </ToolboxScaffold>
  </div>
 )
}
