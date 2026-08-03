import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, "VtSyncDataVisualsToolbox.tsx"), "utf8")
const graphSource = fs.readFileSync(path.join(here, "../../../components/GraphsPageCharts.tsx"), "utf8")
const explorerSource = fs.readFileSync(path.join(here, "../../../components/TubeExplorerVisualModules.tsx"), "utf8")
const frameSource = fs.readFileSync(path.join(here, "VtSyncVisualFrame.tsx"), "utf8")

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
   "revenue-distribution",
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

 it("feeds the custom traffic evolution visual from VT-SYNC rows without video fallback", () => {
 expect(source).toContain("<TrafficSourceEvolutionModule")
 expect(source).toContain("trafficRows={trafficRows}")
  expect(source).toContain("trafficByDay={trafficByDay}")
  expect(source).toContain("useVideoTrafficFallback={false}")
  expect(graphSource).toContain('row.datasetKind === "traffic_summary"')
  expect(graphSource).toContain('row.datasetKind === "traffic_detail"')
 })

 it("mounts offscreen visuals only as they approach the viewport", () => {
  expect(source).toContain('rootMargin: "160px 0px"')
  expect(source).toContain("minHeight: visible ? undefined : estimatedHeight")
  expect(source).toContain('estimatedHeight={block.module.group === "core" ? 360 : 80}')
  expect(source).toContain("visible ? children")
  expect(source).not.toContain("setInterval")
  expect(source).not.toContain("mountedCharts")
 })

 it("registers source tables, controls, footer contracts, and one shared visual frame", () => {
  expect(source).toContain("export const VT_SYNC_VISUAL_MODULE_REGISTRY")
  expect(source).toContain("sourceTableIds: sourceTablesForVisual(module.id)")
  expect(source).toContain("controls: controlsForVisual(module.id)")
  expect(source).toContain('insight: "Calculated from the active VT-SYNC table registry."')
  expect(frameSource).toContain("export type VtSyncVisualModuleSpec")
  expect(frameSource).toContain("export const VtSyncVisualFrame")
  expect(frameSource).toContain("React.createElement(spec.renderer, visualProps)")
  expect(source).toContain("<VtSyncVisualFrame")
 })

 it("keeps the requested subject-specific visual interactions in their custom renderers", () => {
  expect(graphSource).toContain("TrafficPercentAxisTick")
  expect(graphSource).toContain('if (normalized === "YT_OTHER_PAGE") return "YouTube Features"')
  expect(graphSource).toContain("EngagementHoverDot")
  expect(graphSource).toContain("leaderSignature")
  expect(graphSource).toContain("getKeywordRankValue(item, metricMode, rankedByMode)")
  expect(graphSource).toContain("trafficSourceLegendLines(entry.legendLabel)")
  expect(graphSource).toContain('width="100%"')
  expect(graphSource).toContain("disabled={!supportsTotal}")
  expect(graphSource).not.toContain('["impressions", "IMPR"]')
  expect(explorerSource).toContain("TITLE_NETWORK_MAX_WORDS = 50")
  expect(explorerSource).toContain("return [...current, id].slice(-5)")
  expect(explorerSource).toContain('transform: isHovered ? "scale(1.15)"')
 })
})
