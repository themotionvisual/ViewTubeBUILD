import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { buildEngagementRadarSeriesPalette } from "../../../components/TubeExplorerVisualModules"
import {
 buildVtSyncVisualGridBlocks,
 shouldVtSyncVisualStartOpen,
 VT_SYNC_HALF_WIDTH_VISUAL_GRID_IDS,
} from "./vtSyncVisualGridModel"

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, "VtSyncDataVisualsToolbox.tsx"), "utf8")
const graphSource = fs.readFileSync(path.join(here, "../../../components/GraphsPageCharts.tsx"), "utf8")
const explorerSource = fs.readFileSync(path.join(here, "../../../components/TubeExplorerVisualModules.tsx"), "utf8")
const frameSource = fs.readFileSync(path.join(here, "VtSyncVisualFrame.tsx"), "utf8")
const sourceContextSource = fs.readFileSync(path.join(here, "VtSyncVisualDataSourceContext.tsx"), "utf8")
const shellSource = fs.readFileSync(path.join(here, "../../../components/AnalyticsVisualShell.tsx"), "utf8")
const unifiedVisualSource = fs.readFileSync(path.join(here, "../../../components/UnifiedAnalyticsVisualModule.tsx"), "utf8")
const contextBarSource = fs.readFileSync(path.join(here, "../../../components/analyticsVisualContextBar.tsx"), "utf8")
const visualStyleSource = fs.readFileSync(path.join(here, "../../../styles/vtSyncVisualStyles.ts"), "utf8")
const subToolboxSource = fs.readFileSync(path.join(here, "../../../components/SubToolboxChartModule.tsx"), "utf8")
const unifiedChartSource = fs.readFileSync(path.join(here, "../../../components/UnifiedChartModule.tsx"), "utf8")
const vt2ChartSource = fs.readFileSync(path.join(here, "../../../components/DataVisuals/ChartModule.tsx"), "utf8")
const controllerSource = fs.readFileSync(path.join(here, "../../../components/VisualModuleController.tsx"), "utf8")
const visualIconSource = fs.readFileSync(path.join(here, "../../../components/AnalyticsVisualIcon.tsx"), "utf8")
const multiMetricTimelineSource = fs.readFileSync(path.join(here, "../../../components/DataVisuals/modules2/MultiMetricTimeline.tsx"), "utf8")

describe("VT-SYNC data visual module registry", () => {
 it("keeps the complete custom core visual set", () => {
  const expectedIds = [
   "combo-channel-progress",
   "engagement-lines",
   "top-performers-trio",
   "format-comparison-donuts",
   "shorts-retention-widget",
   "algorithm-trigger",
   "revenue-efficiency",
   "hook-effectiveness",
   "age-gender-audience",
   "subscribers-gained",
   "watch-time-distribution",
   "video-value-matrix",
   "growth-pulse",
   "traffic-source-evolution",
   "keyword-treemap",
   "keyword-venn",
   "upload-time-heatmap",
   "conversion-funnel",
   "performance-gauges",
   "lissajous-web",
   "orbital",
  ]

  expectedIds.forEach((id) => expect(source).toContain(`id: "${id}"`))
 })

 it("routes Custom Scatter to Data Visuals 2", () => {
  const primaryStart = source.indexOf("const PRIMARY_MODULE_IDS")
  const primaryEnd = source.indexOf("const PRIMARY_VISUAL_MODULES")
  const primaryRegistry = source.slice(primaryStart, primaryEnd)

  expect(source).toContain('id: "custom-scatter"')
  expect(primaryRegistry).not.toContain('"custom-scatter"')
  expect(source).toContain(
   "const SECONDARY_VISUAL_MODULES: VtSyncVisualModuleDefinition[] = VISUAL_MODULES.filter((module) => !PRIMARY_MODULE_IDS.has(module.id))",
  )
  expect(source).toContain("modules={SECONDARY_VISUAL_MODULES}")
 })

 it("keeps Channel Progress and scatter controls aligned with the visual contract", () => {
  expect(graphSource).toContain("buildChannelProgressBuckets(")
  expect(graphSource).toContain("runningCumulative")
  expect(graphSource).toContain("24,")
  expect(graphSource).toContain('type: "metricMultiSelect"')
  expect(graphSource).toContain("minimumSelected: 1")
  expect(graphSource).toContain("maximumSelected: 5")
  expect(graphSource).toContain('dataKey={`period_${option.value}`}')
  expect(graphSource).toContain('dataKey={`total_${option.value}`}')
  expect(graphSource).toContain('domain={[0, 100]}')
  expect(graphSource).toContain('label: "VIDEOS PUBLISHED"')
  expect(graphSource).toContain('label: "VIEWS"')
  expect(graphSource).toContain('label: "WATCH HRS"')
  expect(graphSource).toContain('label: "SUBSCRIBERS"')
  expect(graphSource).toContain('label: "REVENUE"')
  expect(graphSource).toContain("const lightTone = mixChannelProgressTone")
  expect(graphSource).toContain("const darkTone = mixChannelProgressTone")
  expect(graphSource).toContain('label: sortMetric === "avd" ? "BEST BY AVD"')
  expect(graphSource).toContain('formatFilter === "all"')
  expect(graphSource).toContain('"BEST BY WATCH TIME"')
 })

 it("uses the distinct specialized GraphsPageCharts renderers for the restored core slots", () => {
  const restoredRenderers = [
   "UploadTimeHeatmapModule",
   "ConversionFunnelModule",
   "PerformanceGaugesModule",
   "LissajousWebModule",
   "OrbitalModule",
  ]

  restoredRenderers.forEach((name) => {
   expect(graphSource).toContain(`export const ${name}`)
   expect(source).toContain(`<${name}`)
  })

  expect(explorerSource).toContain('const SankeyRiverDeltaRenderer')
  expect(explorerSource).toContain('export const TubeExplorerSankeyRiverDelta: React.FC<TubeExplorerVisualProps>')
  expect(explorerSource).toContain('"RIVER DELTA"')
  expect(explorerSource).toContain('<SankeyRiverDeltaRenderer dataset={dataset} sourceLimit={sourceLimit} geoLimit={geoLimit} minGeoViews={minGeoViews} />')
 })

 it("feeds Traffic Source Evolution from overview families without detail or video fallback", () => {
  expect(source).toContain("<TrafficSourceEvolutionModule")
  expect(source).toContain("trafficRows={trafficRows}")
  expect(source).toContain("trafficByDay={trafficByDay}")
  expect(source).toContain("useVideoTrafficFallback={false}")
  expect(graphSource).toContain("buildTrafficSourceDailyTimeline")
  expect(graphSource).toContain("resolveTrafficOverviewSourceKey")
  expect(graphSource).not.toContain("canonicalTrafficTimeline")
  expect(graphSource).not.toContain('const detailRows = rows.filter((row) => row.datasetKind === "traffic_detail")')
 })

 it("uses Daily and Monthly Stats for Channel Progress and Creator Content Type first for Format Dominance", () => {
  expect(source).toContain('id === "combo-channel-progress") return ["daily", "monthly", "videos"]')
  expect(source).toContain('id === "format-comparison-donuts") return ["creator", "videos"]')
  expect(source).toContain('<ComboChannelProgress data={data} dailyMetrics={dailyMetrics} monthlyMetrics={monthlyMetrics} visualStyle={visualStyle} />')
  expect(source).toContain('<FormatComparisonDonuts data={data} contentTypeRows={contentTypeRows} />')
  expect(graphSource).toContain('buildFormatDominanceContentTypeTotals(contentTypeRows)')
  expect(graphSource).toContain('resolveChannelProgressDailyMetricValue(row, metricKey as ChannelProgressMetricKey)')
  expect(graphSource).toContain('{ value: "lifetime", label: "LIFETIME", months: null, grain: "month" }')
  expect(graphSource).toContain('{ value: "3y", label: "THREE YEARS", months: 36, grain: "month" }')
  expect(graphSource).toContain('subtitle: `DATA: ${usesMonthlyGrain ? "MONTHLY STATS" : "DAILY STATS"}')
  expect(graphSource).toContain('monthlyMetrics ?? []')
  expect(graphSource).toContain('const sourceRows = metricKey === "videoCount"')
  expect(graphSource).not.toContain('dailySourceRows.length > 0\n      ? dailySourceRows\n      : scopedVideoRows')
  expect(source).toContain('id.startsWith("vt2-weekly-sparklines")')
  expect(source).toContain('id.startsWith("vt2-channel-big-bang")')
  expect(source).toContain('id.startsWith("vt2-trajectory-forecaster")')
  expect(source).toContain('id.startsWith("vt2-multi-metric-timeline")')
  expect(source).toContain('id.startsWith("vt2-trajectory-forecaster")) return ["daily", "monthly"]')
  expect(source).toContain('<TrajectoryForecasterModule data={data} dailyMetrics={dailyMetrics} monthlyMetrics={monthlyMetrics} />')
  expect(source.match(/id\.startsWith\("vt2-[^"]+"\)\) return \["daily"\]/g)).toHaveLength(3)
 })

 it("feeds Clock Burst from traffic overview and detail datasets, never Traffic Source x Day", () => {
  expect(source).toContain('id === "tube-explorer-clock-radial-burst") return ["traffic_overview", "traffic_details"]')
  expect(explorerSource).toContain('row.datasetKind === "traffic_summary"')
  expect(explorerSource).toContain('row.datasetKind === "traffic_detail"')
  expect(explorerSource).toContain('row.datasetKind !== "traffic_day"')
 })

 it("routes the audience module through VT-SYNC demographic rows", () => {
  expect(source).toContain('id: "age-gender-audience"')
  expect(source).toContain("<AgeGenderAudienceModule")
  expect(source).toContain("demographicRows={demographicRows}")
  expect(source).toContain('return ["demographics"]')
  expect(source).toContain('"age-gender-audience"')
  expect(graphSource).toContain("export const AgeGenderAudienceModule")
  expect(graphSource).toContain("buildAgeGenderAudienceData")
  expect(graphSource).toContain('title: "AGE × GENDER"')
  expect(graphSource).toContain("INNER=GENDER · OUTER=AGE")
  expect(graphSource).toContain("GENDER_SUNBURST_COLORS")
 })

 it("places the engagement radar beside age and keeps compact insights in the responsive half-width grid", () => {
  expect(VT_SYNC_HALF_WIDTH_VISUAL_GRID_IDS).toEqual([
   "age-gender-audience",
   "tube-explorer-engagement-radar",
   "subscribers-gained",
   "watch-time-distribution",
   "revenue-distribution",
   "tube-explorer-shorts-vs-longs",
  ])
 expect(source).toContain('className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2"')
  expect(shouldVtSyncVisualStartOpen("tube-explorer-engagement-radar", 40)).toBe(true)
  expect(shouldVtSyncVisualStartOpen("age-gender-audience", 1)).toBe(true)
  expect(shouldVtSyncVisualStartOpen("unfeatured-late-module", 40)).toBe(false)
  expect(source).toContain("shouldVtSyncVisualStartOpen(module.id, index)")
  expect(source).not.toContain("THREE_UP_VISUAL_ROW_IDS")
  const primaryStart = source.indexOf("const PRIMARY_MODULE_IDS")
  const primaryEnd = source.indexOf("const PRIMARY_VISUAL_MODULES")
  expect(source.slice(primaryStart, primaryEnd)).toContain('"tube-explorer-engagement-radar"')

  const blocks = buildVtSyncVisualGridBlocks([
    { id: "before" },
    { id: "revenue-distribution" },
    { id: "age-gender-audience" },
    { id: "tube-explorer-engagement-radar" },
    { id: "between" },
    { id: "subscribers-gained" },
    { id: "watch-time-distribution" },
    { id: "after" },
  ])

  expect(blocks.map((block) => block.type)).toEqual(["module", "row", "module", "module"])
  const groupedBlock = blocks.find((block) => block.type === "row")
  expect(groupedBlock?.modules.map(({ module }) => module.id)).toEqual([
   "age-gender-audience",
   "tube-explorer-engagement-radar",
   "subscribers-gained",
   "watch-time-distribution",
   "revenue-distribution",
  ])
 expect(blocks.filter((block) => block.type === "module").map((block) => block.module.id)).toEqual([
   "before",
   "between",
   "after",
  ])
  expect(explorerSource).toContain("const RADAR_COUNTS = [5, 8, 10, 12] as const")
  expect(explorerSource).toContain("const [countIndex, setCountIndex] = useState(0)")
  expect(explorerSource).toContain("const [formatIndex, setFormatIndex] = useState(1)")
  expect(explorerSource).toContain('const [rankMode, setRankMode] = useState<RadarRankMode>("views")')
  expect(explorerSource).toContain("buildEngagementRadarSeriesPalette(videos.length)")
  expect(explorerSource).toContain("ENGAGEMENT_RADAR_PALETTE_ORDER")
  expect(explorerSource).toContain('{ value: "all" as const, label: "ALL VIDEOS" }')
  expect(explorerSource).toContain('{ value: "long" as const, label: "LONGFORM ONLY" }')
  expect(explorerSource).toContain('{ value: "shorts" as const, label: "SHORTS ONLY" }')
  expect(explorerSource).toContain('{ value: "latest", label: "LAST PUBLISHED" }')
  expect(explorerSource).toContain('{ value: "saves", label: "SAVES" }')
  expect(explorerSource).toContain('aria-label="Eight-axis engagement radar comparing selected videos"')
  expect(explorerSource).toContain("aria-pressed={selectedVideoIds.has(video.videoId)}")
  expect(explorerSource).toContain("current.length > 1")
  expect(explorerSource).toContain("current.filter((id) => id !== videoId)")
  expect(explorerSource).toContain("return { rosterKey, videoIds }")
  expect(explorerSource).toContain('labelPrefix: "RANKED BY"')
  expect(explorerSource).toContain('{ value: "revenue", label: "REVENUE" }')
  expect(explorerSource).toContain('stableChartFrame={false}')
  expect(explorerSource).toContain("onFocus={() => onHover?.(video)}")
  expect(explorerSource).toContain('axis.key === "rpm"')
  expect(explorerSource).toContain('axis.key === "avp"')
  const radarContract = explorerSource.slice(
   explorerSource.indexOf("const RADAR_AXES"),
   explorerSource.indexOf("type RadarRankMode"),
  )
  expect(radarContract.match(/key: "(?:views|watch|revenue|subscribers|avp|rpm|saves|comments)"/g)).toHaveLength(8)
 })

 it("spreads a five-video engagement radar across the full spectrum", () => {
  const colors = buildEngagementRadarSeriesPalette(5)

  expect(colors).toHaveLength(5)
  expect(new Set(colors).size).toBe(5)
  expect(colors[0]).toBe("#FA618A")
  expect(colors.at(-1)).toBe("#FF7AC8")
  expect(colors).toContain("#4EE4BE")
  expect(colors).toContain("#528FFA")
 })

 it("keeps engagement radar series colors stable as the roster grows", () => {
  const palettes = [5, 8, 10, 12].map(buildEngagementRadarSeriesPalette)

  palettes.forEach((colors, index) => {
   const expectedCount = [5, 8, 10, 12][index]
   expect(colors).toHaveLength(expectedCount)
   expect(new Set(colors).size).toBe(expectedCount)
   if (index > 0) expect(colors.slice(0, palettes[index - 1].length)).toEqual(palettes[index - 1])
  })
 })

 it("mounts offscreen visuals only as they approach the viewport", () => {
  // The reveal margin narrows on coarse-pointer (touch) devices to keep a
  // burst of Recharts mounts from freezing mobile.
  expect(source).toContain('"160px 0px"')
  expect(source).toContain('"40px 0px"')
  expect(source).toContain("detectCoarsePointer()")
  expect(source).toContain("minHeight: visible ? undefined : estimatedHeight")
  expect(source).toContain('estimatedHeight={block.module.group === "core" ? 360 : 80}')
  expect(source).toContain("visible ? children")
  // Skip painting entire panels below the fold — the mobile freeze mitigation
  // relies on the browser's content-visibility optimization.
  expect(source).toContain('contentVisibility: "auto"')
  expect(source).not.toContain("setInterval")
  expect(source).not.toContain("mountedCharts")
 })

 it("registers source tables, controls, footer contracts, and one shared visual frame", () => {
  expect(source).toContain("export const VT_SYNC_VISUAL_MODULE_REGISTRY")
  expect(source).toContain("sourceTableIds: sourceTablesForVisual(module.id)")
 expect(source).toContain("controls: controlsForVisual(module.id)")
  expect(source).toContain("controllerSpec: controllerSpecForVisual(module.id)")
  expect(source).toContain("shellMode: shellModeForVisual(module.group)")
  expect(visualStyleSource).toContain("export const VT_SYNC_VISUAL_STYLE_REGISTRY")
  expect(source).toContain("export const VT_SYNC_VISUAL_ICON_REGISTRY")
  expect(source).toContain("headerColorPair: getVtVisualHeaderColorPair(index)")
  expect(source).toContain("headerColorPair: getVtVisualHeaderColorPair(block.index)")
  expect(source).toContain("controllerColors: getVtVisualControllerColors(block.index)")
  expect(source).not.toContain("styleForVisual(module.id).paletteIndex")
  expect(visualStyleSource).not.toContain("paletteIndex")
  expect(source).toContain('insight: "Calculated from the active VT-SYNC table registry."')
  expect(frameSource).toContain("export type VtSyncVisualModuleSpec")
  expect(frameSource).toContain("controllerSpec")
  expect(frameSource).toContain("shellMode")
  expect(frameSource).toContain("export const VtSyncVisualFrame")
  expect(frameSource).toContain("React.createElement(spec.renderer, {")
  expect(frameSource).toContain("AnalyticsVisualStyleProvider")
  expect(frameSource).toContain("visualStyle: {")
  expect(frameSource).toContain("iconKey: spec.iconKey")
  expect(frameSource).toContain("headerColorPair: spec.headerColorPair")
  expect(frameSource).toContain("controllerColors: spec.controllerColors")
  expect(frameSource).toContain("VtSyncVisualDataSourceProvider")
  expect(shellSource).toContain("export const AnalyticsVisualShell")
  expect(unifiedVisualSource).toContain("export const UnifiedAnalyticsVisualModule")
  expect(shellSource).toContain("<UnifiedAnalyticsVisualModule")
  expect(shellSource).toContain('shellMode === "vt2-preserved"')
  expect(sourceContextSource).toContain("DATA:")
  expect(source).toContain("<VtSyncVisualFrame")
 })

 it("keeps unified visual controller and icon metadata in the registry", () => {
  expect(source).toContain('type: "metricMultiSelect"')
  expect(source).toContain('type: "statement"')
  expect(source).toContain('type: "toggle"')
  expect(source).toContain('"tube-explorer-barcode-fingerprint"')
  expect(source).toContain('"vt2-multi-metric-timeline"')
  expect(visualStyleSource).toContain('"tube-explorer-barcode-fingerprint": { iconKey: "database" }')
  expect(visualStyleSource).toContain('"vt2-multi-metric-timeline": { iconKey: "AB-TESTING" }')
  expect(visualStyleSource).toContain('"vt2-search-term-gravity": { iconKey: "!!!YOUTUBE" }')
  expect(visualStyleSource).toContain('"traffic-source-evolution": { iconKey: "!!!TRAFIC" }')
  expect(visualStyleSource).toContain('"revenue-distribution": { iconKey: "!!!REVENUE" }')
  expect(visualStyleSource).toContain('"tube-explorer-us-state-dot-map": { iconKey: "!!!GEOGRAPHY" }')
  expect(visualStyleSource).toContain('"combo-channel-progress": { iconKey: "center_focus_weak_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48" }')
  expect(visualStyleSource).toContain('"engagement-lines": { iconKey: "AB-TESTING" }')
  expect(visualStyleSource).toContain('"shorts-retention-widget": { iconKey: "video" }')
  expect(visualStyleSource).not.toContain('iconKey: "checklist"')
  expect(source).toContain('<ComboChannelProgress data={data} dailyMetrics={dailyMetrics} monthlyMetrics={monthlyMetrics} visualStyle={visualStyle} />')
  expect(source).toContain('render: (props) => <EngagementLinesModule {...props} />')
  expect(source).toContain('render: (props) => <ShortsRetentionWidgetModule {...props} />')
  expect(graphSource).toContain('icon: visualShellIcon(visualStyle, "calendar")')
  expect(graphSource).toContain('icon: visualShellIcon(visualStyle, "sparkles")')
  expect(graphSource).toContain('icon: visualShellIcon(visualStyle, "video")')
  expect(graphSource).toContain('theme={visualShellTheme(visualStyle, "#FF82B0", "#26C7EC")}')
  expect(graphSource).toContain('theme={visualShellTheme(visualStyle, "#FFB158", "#FF7497")}')
  expect(graphSource).toContain("AnalyticsVisualIcon")
  expect(subToolboxSource).toContain("useAnalyticsVisualStyle()")
  expect(subToolboxSource).toContain("visualStyle?.headerColorPair?.title")
  expect(subToolboxSource).toContain("visualStyle?.headerColorPair?.icon")
  expect(subToolboxSource).toContain("visualStyle?.iconKey")
  expect(subToolboxSource).toContain("AnalyticsVisualIcon")
  expect(subToolboxSource).toContain("size={60}")
  expect(subToolboxSource).toContain("min-h-[80px]")
  expect(subToolboxSource).toContain("min-w-[80px]")
  expect(unifiedChartSource).toContain("useAnalyticsVisualStyle()")
  expect(unifiedChartSource).toContain("resolvedHeaderColor")
  expect(unifiedChartSource).toContain("resolvedIconColor")
  expect(unifiedChartSource).toContain("resolvedHeaderIcon")
  expect(unifiedChartSource).toContain("AnalyticsVisualIcon")
  expect(unifiedChartSource).toContain("h-[80px] w-[80px]")
  expect(vt2ChartSource).toContain("useAnalyticsVisualStyle()")
  expect(vt2ChartSource).toContain("resolvedIconBg")
  expect(vt2ChartSource).toContain("resolvedTitleBg")
  expect(vt2ChartSource).toContain("resolvedIcon")
  expect(vt2ChartSource).toContain("AnalyticsVisualIcon")
  expect(vt2ChartSource).toContain("size={60}")
  expect(vt2ChartSource).toContain("minHeight: 80")
  expect(vt2ChartSource).toContain("width: 80")
  expect(controllerSource).toContain("applyControllerPalette")
  expect(controllerSource).toContain("colors.middle")
  expect(controllerSource).toContain("colors.previous")
  expect(controllerSource).toContain("colors.next")
  expect(shellSource).toContain('row.type !== "dropdown"')
  expect(shellSource).toContain('row.type === "metricMultiSelect"')
 expect(unifiedVisualSource).toContain('data-visual-height-policy')
  expect(unifiedVisualSource).toContain("resolveAnalyticsVisualContextBarHeight")
  expect(unifiedVisualSource).toContain("AnalyticsActiveStats")
  expect(subToolboxSource).toContain("resolveAnalyticsVisualContextBarHeight")
  expect(subToolboxSource).toContain("AnalyticsActiveStats")
  expect(vt2ChartSource).toContain("ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS.standard")
  expect(vt2ChartSource).toContain("AnalyticsActiveStats")
  expect(unifiedVisualSource).toContain("bodyMinHeight")
  expect(unifiedVisualSource).toContain("bodyPreferredHeight")
  expect(visualIconSource).toContain("lucide-react")
  expect(visualIconSource).toContain("export const AnalyticsVisualIcon")
  expect(source).toContain('return "vt2-preserved"')
  expect(source).not.toMatch(/[📈🎯☀◐🔒]/u)
  expect(explorerSource).not.toMatch(/[📈🎯☀◐🔒]/u)
 })

 it("does not compress visual module bodies from viewport height", () => {
  expect(explorerSource).not.toContain("calc(100vh - 280px)")
  expect(vt2ChartSource).not.toContain("calc(100vh - 238px)")
  expect(vt2ChartSource).not.toContain("maxHeight")
  expect(unifiedVisualSource).not.toContain("calc(100vh")
 expect(shellSource).not.toContain("calc(100vh")
 })

 it("uses the shared visual subtitle context bar contract", () => {
  expect(contextBarSource).toContain("standard: 32")
  expect(contextBarSource).toContain("expanded: 48")
  expect(contextBarSource).toContain("export const resolveAnalyticsMetricTone")
  expect(contextBarSource).toContain("export const AnalyticsActiveStats")
  expect(subToolboxSource).not.toContain("min-h-[36px]")
  expect(unifiedVisualSource).not.toContain("min-h-[36px]")
  expect(vt2ChartSource).not.toContain("height: 40")
  expect(graphSource).toContain('height: "expanded"')
  expect(graphSource).not.toContain("minHeight: 48")
 })

 it("keeps Multi-Metric Timeline controls, metric colours, and full-width chart behavior aligned", () => {
  expect(multiMetricTimelineSource).toContain('type Gran = "DAYS" | "WEEKS" | "MONTHS" | "YEARS"')
  expect(multiMetricTimelineSource).toContain("const TIME_WINDOW_COUNTS = [4, 5, 6, 7, 8, 10, 12, 16, 20, 24, 36] as const")
  expect(multiMetricTimelineSource).toContain("VT_VISUAL_METRIC_COLORS.views")
  expect(multiMetricTimelineSource).toContain("VT_VISUAL_METRIC_COLORS.watchTime")
  expect(multiMetricTimelineSource).toContain("VT_VISUAL_METRIC_COLORS.engagedViews")
  expect(multiMetricTimelineSource).toContain("VT_VISUAL_METRIC_COLORS.avp")
  expect(multiMetricTimelineSource).toContain("VT_VISUAL_METRIC_COLORS.avd")
  expect(multiMetricTimelineSource).toContain('preserveAspectRatio="none"')
  expect(multiMetricTimelineSource).toContain("padL = 0, padR = 0")
  expect(multiMetricTimelineSource).toContain("selArr.map(k => ({")
  expect(multiMetricTimelineSource).toContain("legendRight: (")
  expect(multiMetricTimelineSource).toContain("{dark ? \"Light Mode\" : \"Dark Mode\"}")
  expect(multiMetricTimelineSource).not.toContain("TIME_WINDOWS")
  expect(multiMetricTimelineSource).not.toContain("selArr.slice(0, 4)")
  expect(multiMetricTimelineSource).not.toContain("selArr.slice(0, 3)")
 })

 it("keeps the requested subject-specific visual interactions in their custom renderers", () => {
  expect(graphSource).toContain("TrafficPercentAxisTick")
  expect(graphSource).toContain('if (normalized === "YT_OTHER_PAGE") return "YouTube Features"')
  expect(graphSource).toContain("EngagementHoverDot")
  expect(graphSource).toContain("leaderSignature")
  expect(graphSource).toContain("getKeywordRankValue(item, metricMode, rankedByMode)")
  expect(graphSource).toContain("trafficSourceLegendLines(entry.legendLabel)")
  expect(graphSource).toContain("const hoverAreaOverlayRef")
  expect(graphSource).toContain('sourcePath.closest("[clip-path]")')
  expect(graphSource).toContain('overlay.style.transform = "scaleY(1.05)"')
  expect(graphSource).toContain('overlay.setAttribute("filter", "url(#tse-hover-shadow)")')
  expect(graphSource).toContain('value: "180d", label: "180 DAYS"')
  expect(graphSource).toContain('width="100%"')
  expect(graphSource).toContain('type: "toggle"')
  expect(graphSource).toContain('options: supportsTotal ? ["AVERAGE", "TOTAL"] : ["AVERAGE"]')
  expect(graphSource).toContain('labelPrefix: "PLOT"')
  expect(graphSource).toContain('const viewRadii = buildLinearAreaBubbleRadii')
  expect(graphSource).toContain('labelPrefix: "SIZE"')
  expect(graphSource).toContain('subtitle: `DATA: FORMATS')
  expect(graphSource).toContain('{ label: "VIDEOS", value: formatCounts.long.toLocaleString()')
  expect(graphSource).not.toContain('["impressions", "IMPR"]')
  expect(explorerSource).toContain("TITLE_NETWORK_MAX_WORDS = 50")
  expect(explorerSource).toContain("return [...current, id].slice(-6)")
  expect(explorerSource).toContain('transform: isHovered ? "scale(1.15)"')
 })
})
