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
 AgeGenderAudienceModule,
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
 CustomScatterModule,
 SignalMatrixModule,
} from "../../../components/GraphsPageCharts"
import type { VtSyncSnapshot } from "../adapters/contracts"
import { buildVtSyncVisualPropsData } from "../adapters/visualData"
import {
 VtSyncVisualFrame,
 type VtSyncVisualModuleSpec,
 type VtSyncVisualProps,
} from "./VtSyncVisualFrame"
import { WeeklySparklinesModule } from "../../../components/DataVisuals/modules2/WeeklySparklines"
import { RevenueMosaicModule } from "../../../components/DataVisuals/modules2/RevenueMosaic"
import { SearchTermGravityModule } from "../../../components/DataVisuals/modules2/SearchTermGravity"
import { VideoPerformanceFingerprintModule } from "../../../components/DataVisuals/modules2/VideoPerformanceFingerprint"
import { ChannelBigBangTimelineModule } from "../../../components/DataVisuals/modules2/ChannelBigBangTimeline"
import { TrajectoryForecasterModule } from "../../../components/DataVisuals/modules2/TrajectoryForecaster"
import { MultiMetricTimelineModule } from "../../../components/DataVisuals/modules2/MultiMetricTimeline"
import { Vt2ThemeContext, type Vt2ThemeMode } from "../../../components/DataVisuals/modules2/theme"

type VtSyncVisualModuleDefinition = VtSyncVisualModuleSpec & {
 group: "core" | "tube-explorer" | "vt2"
 delayMs: number
}

type LegacyVisualModuleDefinition = {
 id: string
 group: "core" | "tube-explorer" | "vt2"
 delayMs: number
 render: (props: TubeExplorerVisualProps) => React.ReactNode
}

const CORE_VISUAL_MODULES: LegacyVisualModuleDefinition[] = [
 { id: "combo-channel-progress", group: "core", delayMs: 0, render: ({ data }) => <ComboChannelProgress data={data} /> },
 { id: "engagement-lines", group: "core", delayMs: 25, render: ({ data }) => <EngagementLinesModule data={data} /> },
 { id: "top-performers-trio", group: "core", delayMs: 30, render: ({ data }) => <TopPerformersTrio data={data} /> },
 { id: "format-comparison-donuts", group: "core", delayMs: 35, render: ({ data, contentTypeRows }) => <FormatComparisonDonuts data={data} contentTypeRows={contentTypeRows} /> },
 { id: "shorts-retention-widget", group: "core", delayMs: 50, render: ({ data }) => <ShortsRetentionWidgetModule data={data} /> },
 { id: "algorithm-trigger", group: "core", delayMs: 100, render: ({ data }) => <AlgorithmTriggerModule data={data} /> },
 { id: "revenue-distribution", group: "core", delayMs: 150, render: ({ data }) => <RevenueDistribution data={data} /> },
 { id: "revenue-efficiency", group: "core", delayMs: 175, render: ({ data }) => <RevenueEfficiency data={data} /> },
 { id: "hook-effectiveness", group: "core", delayMs: 200, render: ({ data }) => <HookEffectiveness data={data} /> },
 { id: "age-gender-audience", group: "core", delayMs: 250, render: ({ data, demographicRows }) => <AgeGenderAudienceModule data={data} demographicRows={demographicRows} /> },
 { id: "subscribers-gained", group: "core", delayMs: 300, render: ({ data }) => <SubscribersGained data={data} /> },
 { id: "watch-time-distribution", group: "core", delayMs: 350, render: ({ data }) => <WatchTimeDistribution data={data} /> },
 { id: "video-value-matrix", group: "core", delayMs: 400, render: ({ data }) => <VideoValueMatrix data={data} /> },
 { id: "growth-pulse", group: "core", delayMs: 450, render: ({ data }) => <GrowthPulse data={data} /> },
 { id: "signal-matrix", group: "core", delayMs: 520, render: ({ data }) => <SignalMatrixModule data={data} /> },
 { id: "custom-scatter", group: "core", delayMs: 545, render: ({ data }) => <CustomScatterModule data={data} /> },
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

const TUBE_EXPLORER_MODULES: LegacyVisualModuleDefinition[] =
 TUBE_EXPLORER_VISUAL_MODULES.map((entry, index) => ({
  id: entry.id,
  group: "tube-explorer",
  delayMs: 80 + (index % 6) * 35,
  render: entry.render,
 }))

// ── Data Visuals 2 modules (ported from source viz app, wired to VT-Sync) ──
// Each entry keeps the source's neo-brutalist ChartModule shell; the palette
// picks up whichever Vt2 theme mode is active (Preserved vs Adapted). New
// modules land in this array and automatically show up in the second toolbox
// (Data Visuals 2) because they aren't in PRIMARY_MODULE_IDS.
const VT2_MODULES: LegacyVisualModuleDefinition[] = [
 { id: "vt2-weekly-sparklines", group: "vt2", delayMs: 40, render: ({ data, trafficByDay, dailyMetrics, channelSummary }) => <WeeklySparklinesModule data={data} trafficByDay={trafficByDay} dailyMetrics={dailyMetrics} channelSummary={channelSummary} /> },
 { id: "vt2-revenue-mosaic", group: "vt2", delayMs: 80, render: ({ data }) => <RevenueMosaicModule data={data} /> },
 { id: "vt2-search-term-gravity", group: "vt2", delayMs: 120, render: ({ data, trafficRows }) => <SearchTermGravityModule data={data} trafficRows={trafficRows} /> },
 { id: "vt2-video-fingerprint", group: "vt2", delayMs: 160, render: ({ data }) => <VideoPerformanceFingerprintModule data={data} /> },
 { id: "vt2-channel-big-bang", group: "vt2", delayMs: 200, render: ({ data }) => <ChannelBigBangTimelineModule data={data} /> },
 { id: "vt2-trajectory-forecaster", group: "vt2", delayMs: 240, render: ({ data }) => <TrajectoryForecasterModule data={data} /> },
 { id: "vt2-multi-metric-timeline", group: "vt2", delayMs: 280, render: ({ data, trafficByDay, dailyMetrics }) => <MultiMetricTimelineModule data={data} trafficByDay={trafficByDay} dailyMetrics={dailyMetrics} /> },
]

const sourceTablesForVisual = (id: string): readonly string[] => {
 if (id.startsWith("vt2-weekly-sparklines")) return ["videos", "traffic_day"]
 if (id.startsWith("vt2-revenue-mosaic")) return ["videos"]
 if (id.startsWith("vt2-search-term-gravity")) return ["traffic", "search"]
 if (id.startsWith("vt2-video-fingerprint")) return ["videos"]
 if (id.startsWith("vt2-channel-big-bang")) return ["videos"]
 if (id.startsWith("vt2-trajectory-forecaster")) return ["videos"]
 if (id.startsWith("vt2-multi-metric-timeline")) return ["videos", "traffic_day"]
 if (id.includes("traffic") || id.includes("clock-radial")) return ["traffic", "traffic_day"]
 if (id.includes("format") || id.includes("shorts-vs-longs")) return ["creator", "videos"]
 if (id.includes("keyword") || id.includes("word-network")) return ["videos", "search"]
 if (id.includes("publish") || id.includes("upload-time")) return ["videos", "daily"]
 if (id.includes("age-gender") || id.includes("audience")) return ["demographics"]
 if (id.includes("revenue")) return ["videos", "ads"]
 if (id.includes("subscriber")) return ["videos", "subs"]
 return ["videos"]
}

const controlsForVisual = (id: string): VtSyncVisualModuleSpec["controls"] => {
 if (id.includes("word-network"))
  return [
   { id: "metric", label: "Metric", kind: "select" },
   { id: "word-limit", label: "Words", kind: "count" },
  ]
 if (id.includes("format"))
  return [
   { id: "window", label: "Window", kind: "select" },
   { id: "aggregation", label: "Average / Total", kind: "toggle" },
  ]
 if (id.includes("engagement"))
  return [
   { id: "count", label: "Videos", kind: "count" },
   { id: "format", label: "Format", kind: "select" },
   { id: "ranking", label: "Ranked By", kind: "select" },
  ]
 return []
}

const visualRenderer = (
 render: LegacyVisualModuleDefinition["render"],
): React.FC<VtSyncVisualProps> => {
 const RegisteredVtSyncVisual: React.FC<VtSyncVisualProps> = (props) => <>{render(props)}</>
 return RegisteredVtSyncVisual
}

const VISUAL_MODULES: VtSyncVisualModuleDefinition[] = [
 ...CORE_VISUAL_MODULES,
 ...TUBE_EXPLORER_MODULES,
 ...VT2_MODULES,
].map((module) => ({
 id: module.id,
 group: module.group,
 delayMs: module.delayMs,
 sourceTableIds: sourceTablesForVisual(module.id),
 controls: controlsForVisual(module.id),
 footer: {
  insight: "Calculated from the active VT-SYNC table registry.",
  legend: [],
  axisLabel: module.id.includes("publish") ? "Local publish time" : undefined,
 },
 renderer: visualRenderer(module.render),
}))

export const VT_SYNC_VISUAL_MODULE_REGISTRY: readonly VtSyncVisualModuleSpec[] =
 VISUAL_MODULES

const PRIMARY_MODULE_IDS = new Set([
 "combo-channel-progress",
 "engagement-lines",
 "shorts-retention-widget",
 "format-comparison-donuts",
 "revenue-distribution",
 "revenue-efficiency",
 "age-gender-audience",
 "subscribers-gained",
 "watch-time-distribution",
 "traffic-source-evolution",
 "keyword-venn",
 "signal-matrix",
 "custom-scatter",
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
 "age-gender-audience",
 "subscribers-gained",
 "watch-time-distribution",
])

// Coarse-pointer devices (touch phones/tablets) tighten the reveal window so
// mounting a chart doesn't cascade through every neighbour off-screen. Desktop
// keeps the generous margin so no scroll flash appears.
const detectCoarsePointer = (): boolean => {
 if (typeof window === "undefined" || !window.matchMedia) return false
 try {
  return window.matchMedia("(pointer: coarse)").matches
 } catch {
  return false
 }
}

const RevealOnView: React.FC<{
 delayMs?: number
 estimatedHeight?: number
 children: React.ReactNode
}> = ({ delayMs = 0, estimatedHeight = 360, children }) => {
 const [visible, setVisible] = useState(false)
 const [node, setNode] = useState<HTMLDivElement | null>(null)

 useEffect(() => {
  if (!node) return
  const isCoarsePointer = detectCoarsePointer()
  const observer = new IntersectionObserver(
   (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
     setVisible(true)
     observer.disconnect()
    }
   },
   { threshold: 0.01, rootMargin: isCoarsePointer ? "40px 0px" : "160px 0px" },
  )
  observer.observe(node)
  return () => observer.disconnect()
 }, [node])

 // `content-visibility: auto` lets the browser skip layout+paint for panels
 // that are still below the fold — the single biggest mobile freeze win for a
 // grid of ~24 Recharts modules. We pair it with `contain-intrinsic-size` so
 // the scrollbar stays honest before a panel has been measured.
 return (
  <div
   ref={setNode}
   style={{
    minHeight: visible ? undefined : estimatedHeight,
    opacity: 1,
    transform: visible ? "translateY(0px)" : "translateY(14px)",
    transition: "opacity 420ms ease, transform 420ms ease",
    transitionDelay: `${delayMs}ms`,
    contentVisibility: "auto",
    containIntrinsicSize: `${estimatedHeight}px`,
   } as React.CSSProperties}>
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
  dailyMetrics: visualData.dailyMetrics,
  channelSummary: visualData.channelSummary,
  geographyRows: visualData.canonicalContext.geographyRows,
  demographicRows: visualData.canonicalContext.demographicRows,
  contentTypeRows: (snapshot.creatorContentTypes as Array<Record<string, unknown>>) || [],
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
       {block.type === "module" ? (
        <RevealOnView
         delayMs={block.module.delayMs}
         estimatedHeight={block.module.group === "core" ? 360 : 80}>
         <VtSyncVisualFrame
          spec={block.module}
          visualProps={{
           ...moduleProps,
           collapsible: true,
           isOpenInitial: block.index < 3,
          }}
         />
        </RevealOnView>
       ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3">
         {block.modules.map(({ module, index }) => (
          <RevealOnView
           key={module.id}
           delayMs={module.delayMs}
           estimatedHeight={module.group === "core" ? 360 : 80}>
           <div className="h-full [&>div]:h-full">
            <VtSyncVisualFrame
             spec={module}
             visualProps={{
              ...moduleProps,
              collapsible: true,
              isOpenInitial: index < 3,
             }}
            />
           </div>
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

// Small pill toggle for the Preserved ↔ Adapted theme applied to VT2 modules.
const Vt2ThemeToggle: React.FC<{
 mode: Vt2ThemeMode
 onChange: (next: Vt2ThemeMode) => void
}> = ({ mode, onChange }) => {
 const pill = (label: string, value: Vt2ThemeMode, bg: string) => (
  <button
   type="button"
   onClick={() => onChange(value)}
   className="rounded-full border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] transition"
   style={{
    background: mode === value ? bg : "transparent",
    color: mode === value ? "#000" : "rgba(0,0,0,0.55)",
   }}>
   {label}
  </button>
 )
 return (
  <div className="mb-4 flex items-center gap-3 rounded-full border-[3px] border-black bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
   <span className="opacity-60">VT2 Theme</span>
   {pill("Preserved", "preserved", "#FFDA47")}
   {pill("Adapted", "adapted", "#36E0F6")}
   <span className="opacity-45">Applies only to Data Visuals 2 modules</span>
  </div>
 )
}

export const VtSyncDataVisualsToolbox: React.FC<{ snapshot: VtSyncSnapshot }> = ({ snapshot }) => {
 const [isOpen1, setIsOpen1] = useState(false)
 const [isOpen2, setIsOpen2] = useState(false)
 const [vt2Theme, setVt2Theme] = useState<Vt2ThemeMode>("preserved")

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
    <Vt2ThemeToggle mode={vt2Theme} onChange={setVt2Theme} />
    <Vt2ThemeContext.Provider value={vt2Theme}>
     <VtSyncDataVisualsContent key={`t2:${snapshot.snapshotId}:${snapshot.capturedAt}:${vt2Theme}`} snapshot={snapshot} modules={SECONDARY_VISUAL_MODULES} />
    </Vt2ThemeContext.Provider>
   </ToolboxScaffold>
  </div>
 )
}
