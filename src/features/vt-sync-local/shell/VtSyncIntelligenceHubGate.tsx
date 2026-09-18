import React, { lazy, Suspense, useCallback, useEffect, useState } from "react"
import { BrainCircuit } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import { useAnalyticsWindow } from "../../../services/analytics-canon/AnalyticsViewContext"
import { buildCanonicalIntelligenceEvidence } from "../../../services/analytics-canon"
import type { VtSyncSnapshot } from "../adapters/contracts"

const IntelligenceHub = lazy(() => import("../../../components/IntelligenceHub/IntelligenceHub"))

const IntelligenceLoadingState = () => (
 <div
  className="flex min-h-[180px] items-center justify-center border-[3px] border-dashed border-black bg-white text-[11px] font-black uppercase tracking-[0.14em] text-black/35"
  role="status">
  Loading Intelligence Hub…
 </div>
)

export const VtSyncIntelligenceHubGate: React.FC<{ snapshot: VtSyncSnapshot }> = ({ snapshot }) => {
 const [isOpen, setIsOpen] = useState(() => typeof window !== "undefined" && window.location.hash === "#intelligence")

 useEffect(() => {
  const openFromHash = () => {
   if (window.location.hash === "#intelligence") setIsOpen(true)
  }
  window.addEventListener("hashchange", openFromHash)
  return () => window.removeEventListener("hashchange", openFromHash)
 }, [])

 // Brain evidence follows the same selection as the table and visuals. It used
 // to read snapshot.selectedTimeWindow, which is written once at snapshot
 // creation and never changed — so the Brain's "selected window" was a constant
 // no user could influence.
 const [viewWindow] = useAnalyticsWindow("28d")
 const buildEvidence = useCallback(() => buildCanonicalIntelligenceEvidence(snapshot, {
  window: viewWindow,
  maximumRowsPerDataset: 8,
  maximumCharacters: 24_000,
 }), [snapshot, viewWindow])

 return (
  <div id="intelligence" className="scroll-mt-24">
   <ToolboxScaffold
    title="INTELLIGENCE HUB"
    subtitle="Executive channel reporting across all 34 VT-SYNC datasets with channel-scoped AI Brain learning."
    icon={<BrainCircuit />}
    paletteIndex={0}
    headerColor="bg-[#F3F25B]"
    iconBoxColor="bg-[#BD2EFF]"
    collapsible
    isOpen={isOpen}
    onToggle={() => setIsOpen((open) => !open)}
    unmountWhenClosed
    contentClassName="bg-[#f4f1eb] p-4 md:p-6 lg:p-8">
    {isOpen ? (
     <Suspense fallback={<IntelligenceLoadingState />}>
      <IntelligenceHub
       mode="ultimate"
       embedded
       buildEvidence={buildEvidence}
       analyticsContext={{
        channelId: snapshot.channelId || null,
        channelName: snapshot.channelName || null,
        snapshotId: snapshot.snapshotId,
        selectedWindow: viewWindow,
        capturedAt: snapshot.capturedAt,
       }}
       dataSources={["vt-sync", "analytics-canon", "ai-brain"]}
      />
     </Suspense>
    ) : null}
   </ToolboxScaffold>
  </div>
 )
}
