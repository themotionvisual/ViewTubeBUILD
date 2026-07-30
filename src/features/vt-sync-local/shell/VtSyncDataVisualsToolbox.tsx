import React, { useEffect, useMemo, useState } from "react"
import { ChartNoAxesCombined } from "lucide-react"
import { ToolboxScaffold } from "../../../components/Toolbox"
import type { TubeExplorerVisualProps } from "../../../components/TubeExplorerVisualModules"
import { TUBE_EXPLORER_VISUAL_MODULES } from "../../../components/TubeExplorerVisualModules"
import {
 AlgorithmTriggerModule,
 ComboChannelProgress,
 ConversionFunnelModule,
 EngagementLinesModule,
 FormatComparisonDonuts,
 GrowthPulse,
 HookEffectiveness,
 KeywordTreemapModule,
 KeywordVennModule,
 LissajousWebModule,
 OrbitalModule,
 PerformanceGaugesModule,
 RevenueDistribution,
 RevenueEfficiency,
 ShortsRetentionWidgetModule,
 SubscribersGained,
 TopPerformersTrio,
 TrafficSourceEvolutionModule,
 UploadTimeHeatmapModule,
 VideoValueMatrix,
 WatchTimeDistribution,
} from "../../../components/GraphsPageCharts"
import type { VtSyncSnapshot } from "../adapters/contracts"
import { buildVtSyncVisualPropsData } from "../adapters/visualData"

type VtSyncVisualModuleDefinition = {
 id: string
 group: "core" | "tube-explorer"
 delayMs: number
 render: (props: TubeExplorerVisualProps) => React.ReactNode
}

const CORE_VISUAL_MODULES: VtSyncVisualModuleDefinition[] = [
 { id: "combo-channel-progress", group: "core", delayMs: 0, render: ({ data }) => <ComboChannelProgress data={data} /> },
 { id: "engagement-lines", group: "core", delayMs: 25, render: ({ data }) => <EngagementLinesModule data={data} /> },
 { id: "top-performers-trio", group: "core", delayMs: 30, render: ({ data }) => <TopPerformersTrio data={data} /> },
 { id: "format-comparison-donuts", group: "core", delayMs: 35, render: ({ data }) => <FormatComparisonDonuts data={data} /> },
 { id: "shorts-retention-widget", group: "core", delayMs: 50, render: ({ data }) => <ShortsRetentionWidgetModule data={data} /> },
 { id: "algorithm-trigger", group: "core", delayMs: 100, render: ({ data }) => <AlgorithmTriggerModule data={data} /> },
 { id: "revenue-efficiency", group: "core", delayMs: 175, render: ({ data }) => <RevenueEfficiency data={data} /> },
 { id: "hook-effectiveness", group: "core", delayMs: 200, render: ({ data }) => <HookEffectiveness data={data} /> },
 { id: "revenue-distribution", group: "core", delayMs: 250, render: ({ data }) => <RevenueDistribution data={data} /> },
 { id: "subscribers-gained", group: "core", delayMs: 300, render: ({ data }) => <SubscribersGained data={data} /> },
 { id: "watch-time-distribution", group: "core", delayMs: 350, render: ({ data }) => <WatchTimeDistribution data={data} /> },
 { id: "video-value-matrix", group: "core", delayMs: 400, render: ({ data }) => <VideoValueMatrix data={data} /> },
 { id: "growth-pulse", group: "core", delayMs: 450, render: ({ data }) => <GrowthPulse data={data} /> },
 {
  id: "traffic-source-evolution",
  group: "core",
  delayMs: 500,
  render: ({ data, trafficRows, trafficByDay }) => (
   <TrafficSourceEvolutionModule
    data={data}
    trafficRows={trafficRows}
    trafficByDay={trafficByDay}
    useVideoTrafficFallback={false}
   />
  ),
 },
 { id: "keyword-treemap", group: "core", delayMs: 560, render: ({ data }) => <KeywordTreemapModule data={data} /> },
 { id: "keyword-venn", group: "core", delayMs: 610, render: ({ data }) => <KeywordVennModule data={data} /> },
 { id: "upload-time-heatmap", group: "core", delayMs: 670, render: ({ data }) => <UploadTimeHeatmapModule data={data} /> },
 { id: "conversion-funnel", group: "core", delayMs: 720, render: ({ data }) => <ConversionFunnelModule data={data} /> },
 { id: "performance-gauges", group: "core", delayMs: 760, render: ({ data }) => <PerformanceGaugesModule data={data} /> },
 { id: "lissajous-web", group: "core", delayMs: 800, render: ({ data }) => <LissajousWebModule data={data} /> },
 { id: "orbital", group: "core", delayMs: 840, render: ({ data }) => <OrbitalModule data={data} /> },
]

const TUBE_EXPLORER_MODULES: VtSyncVisualModuleDefinition[] =
 TUBE_EXPLORER_VISUAL_MODULES.map((entry, index) => ({
  id: entry.id,
  group: "tube-explorer",
  delayMs: 80 + (index % 6) * 35,
  render: entry.render,
 }))

const VISUAL_MODULES: VtSyncVisualModuleDefinition[] = [
 ...CORE_VISUAL_MODULES,
 ...TUBE_EXPLORER_MODULES,
]

const PRIMARY_MODULE_IDS = new Set([
 "combo-channel-progress",
 "engagement-lines",
 "shorts-retention-widget",
 "format-comparison-donuts",
 "revenue-efficiency",
 "revenue-distribution",
 "subscribers-gained",
 "watch-time-distribution",
 "traffic-source-evolution",
 "keyword-venn",
 "tube-explorer-clock-radial-burst",
 "tube-explorer-barcode-fingerprint",
 "tube-explorer-subscriber-waterfall",
 "tube-explorer-shorts-vs-longs",
 "tube-explorer-content-treemap",
 "tube-explorer-traffic-day-river-delta",
 "tube-explorer-publish-optimal-clock",
 "tube-explorer-title-word-network",
 "tube-explorer-channel-vital-signs",
 "tube-explorer-thermal-imaging",
])

const PRIMARY_VISUAL_MODULES: VtSyncVisualModuleDefinition[] = VISUAL_MODULES.filter((module) => PRIMARY_MODULE_IDS.has(module.id))
const SECONDARY_VISUAL_MODULES: VtSyncVisualModuleDefinition[] = VISUAL_MODULES.filter((module) => !PRIMARY_MODULE_IDS.has(module.id))

const THREE_UP_VISUAL_ROW_IDS = new Set([
 "revenue-distribution",
 "subscribers-gained",
 "watch-time-distribution",
])

const RevealOnView: React.FC<{
 delayMs?: number
 estimatedHeight?: number
 children: React.ReactNode
}> = ({ delayMs = 0, estimatedHeight = 360, children }) => {
 const [visible, setVisible] = useState(false)
 const [node, setNode] = useState<HTMLDivElement | null>(null)

 useEffect(() => {
  if (!node) return
  const observer = new IntersectionObserver(
   (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
     setVisible(true)
     observer.disconnect()
    }
   },
   { threshold: 0.01, rootMargin: "160px 0px" },
  )
  observer.observe(node)
  return () => observer.disconnect()
 }, [node])

 return (
  <div
   ref={setNode}
   style={{
    minHeight: visible ? undefined : estimatedHeight,
    opacity: 1,
    transform: visible ? "translateY(0px)" : "translateY(14px)",
    transition: "opacity 420ms ease, transform 420ms ease",
    transitionDelay: `${delayMs}ms`,
   }}>
   {visible ? children : (
    <div
     className="flex items-center justify-center border-[3px] border-dashed border-black bg-white text-[11px] font-black uppercase tracking-[0.14em] text-black/35"
     style={{ minHeight: estimatedHeight }}>
     Visual loads as it approaches the viewport
    </div>
   )}
  </div>
 )
}

const VtSyncDataVisualsContent: React.FC<{
 snapshot: VtSyncSnapshot
 modules: VtSyncVisualModuleDefinition[]
}> = ({ snapshot, modules }) => {
 const visualData = useMemo(() => buildVtSyncVisualPropsData(snapshot), [snapshot])

 const hasRenderableData =
  visualData.rows.length > 0 ||
  visualData.canonicalContext.trafficRows.length > 0 ||
  visualData.canonicalContext.geographyRows.length > 0

 const firstTubeExplorerIndex = modules.findIndex((module) => module.group === "tube-explorer")

 const renderedVisualBlocks = useMemo(() => {
  const blocks: Array<
   | { type: "module"; module: VtSyncVisualModuleDefinition; index: number }
   | { type: "row"; modules: Array<{ module: VtSyncVisualModuleDefinition; index: number }> }
  > = []

  for (let index = 0; index < modules.length; index += 1) {
   const module = modules[index]
   if (!THREE_UP_VISUAL_ROW_IDS.has(module.id)) {
    blocks.push({ type: "module", module, index })
    continue
   }

   const rowModules = modules
    .map((entry, entryIndex) => ({ module: entry, index: entryIndex }))
    .filter((entry) => THREE_UP_VISUAL_ROW_IDS.has(entry.module.id))

   if (rowModules[0]?.module.id === module.id) {
    blocks.push({ type: "row", modules: rowModules })
   }
  }

  return blocks
 }, [modules])

 const moduleProps: TubeExplorerVisualProps = {
  data: visualData.rows,
  csvFiles: visualData.csvFiles,
  trafficRows: visualData.canonicalContext.trafficRows,
  trafficByDay: visualData.trafficByDay,
  geographyRows: visualData.canonicalContext.geographyRows,
 }

 return (
  <>
   <div className="mb-6 grid gap-2 border-b-[4px] border-black pb-5 text-[10px] font-black uppercase tracking-[0.12em] sm:grid-cols-4">
    <span className="rounded-full border-[3px] border-black bg-[#59BFFF] px-3 py-2">
     Videos: {visualData.diagnostics.videos.toLocaleString()}
    </span>
    <span className="rounded-full border-[3px] border-black bg-[#FFDA47] px-3 py-2">
     Traffic: {visualData.diagnostics.trafficRows.toLocaleString()}
    </span>
    <span className="rounded-full border-[3px] border-black bg-[#F55EFC] px-3 py-2">
     Geo: {visualData.diagnostics.geographyRows.toLocaleString()}
    </span>
    <span className="rounded-full border-[3px] border-black bg-white px-3 py-2">
     Source: {visualData.diagnostics.source}
    </span>
   </div>

   {!hasRenderableData ? (
    <div className="flex items-center justify-center rounded-[20px] border-[4px] border-dashed border-black bg-white p-16 text-center text-xl font-black uppercase tracking-[0.14em] text-black/35">
     Sync or import Annalytics tables to populate data visuals.
    </div>
   ) : (
    <div className="flex flex-col gap-8">
     {renderedVisualBlocks.map((block) => (
      <React.Fragment
       key={block.type === "module" ? block.module.id : block.modules.map(({ module }) => module.id).join("-")}>
       {block.type === "module" && block.index === firstTubeExplorerIndex ? (
        <div className="border-[4px] border-black bg-[#0B0B0B] px-5 py-4 text-white shadow-[8px_8px_0px_0px_#FF7497]">
         <div className="text-[34px] font-[1000] uppercase leading-none tracking-tight text-[#CCFF00]">
          Annalytics Tube Explorer Visual Lab
         </div>
         <div className="mt-1 text-[12px] font-black uppercase tracking-[0.14em] text-white/70">
          Explorer modules use Annalytics video, traffic, search, and geography table data. No canonical cache or Performance Hub data reads.
         </div>
        </div>
       ) : null}
       {block.type === "module" ? (
        <RevealOnView
         delayMs={block.module.delayMs}
         estimatedHeight={block.module.group === "core" ? 360 : 80}>
         {block.module.render({ ...moduleProps, collapsible: true, isOpenInitial: block.index < 3 })}
        </RevealOnView>
       ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
         {block.modules.map(({ module, index }) => (
          <RevealOnView
           key={module.id}
           delayMs={module.delayMs}
           estimatedHeight={module.group === "core" ? 360 : 80}>
           {module.render({ ...moduleProps, collapsible: true, isOpenInitial: index < 3 })}
          </RevealOnView>
         ))}
        </div>
       )}
      </React.Fragment>
     ))}
    </div>
   )}
  </>
 )
}

export const VtSyncDataVisualsToolbox: React.FC<{ snapshot: VtSyncSnapshot }> = ({ snapshot }) => {
 const [isOpen1, setIsOpen1] = useState(false)
 const [isOpen2, setIsOpen2] = useState(false)

 return (
  <div className="flex flex-col gap-6">
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
    <VtSyncDataVisualsContent key={`t1:${snapshot.snapshotId}:${snapshot.capturedAt}`} snapshot={snapshot} modules={PRIMARY_VISUAL_MODULES} />
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
    <VtSyncDataVisualsContent key={`t2:${snapshot.snapshotId}:${snapshot.capturedAt}`} snapshot={snapshot} modules={SECONDARY_VISUAL_MODULES} />
   </ToolboxScaffold>
  </div>
 )
}
