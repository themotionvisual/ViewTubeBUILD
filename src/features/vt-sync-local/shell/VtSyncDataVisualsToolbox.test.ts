import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, "VtSyncDataVisualsToolbox.tsx"), "utf8")
const graphSource = fs.readFileSync(path.join(here, "../../../components/GraphsPageCharts.tsx"), "utf8")
const explorerSource = fs.readFileSync(path.join(here, "../../../components/TubeExplorerVisualModules.tsx"), "utf8")

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

  expect(explorerSource).toContain(
   'createModule("SANKEY RIVER DELTA", "INDEPENDENT TRAFFIC + REGION RANKS", (d) => <SankeyRiverDeltaRenderer dataset={d} />',
  )
 })

 it("feeds the custom traffic evolution visual from VT-SYNC rows without video fallback", () => {
  expect(source).toContain("<TrafficSourceEvolutionModule")
  expect(source).toContain("trafficRows={trafficRows}")
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
})
