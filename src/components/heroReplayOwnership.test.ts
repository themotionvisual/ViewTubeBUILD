import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const readComponentSource = (name: string) =>
 readFileSync(new URL(name, import.meta.url), "utf8")

const componentSlice = (source: string, start: string, end: string) => {
 const startIndex = source.indexOf(start)
 const endIndex = source.indexOf(end, startIndex + start.length)
 expect(startIndex).toBeGreaterThanOrEqual(0)
 expect(endIndex).toBeGreaterThan(startIndex)
 return source.slice(startIndex, endIndex)
}

describe("hero replay ownership", () => {
 it("keeps Format Dominance on one standard boundary plus one header replay owner", () => {
  const source = readComponentSource("./GraphsPageCharts.tsx")
  const formatDominance = componentSlice(
   source,
   "export const FormatComparisonDonuts",
   "export const RevenueEfficiency",
  )

  expect(formatDominance).not.toContain('addEventListener("vt:replay-hero-intro"')
  expect(formatDominance.match(/heroVisualId=["']format-dominance["']/g)).toHaveLength(1)
  expect(formatDominance.match(/<HeroIntroBoundary visualId=["']format-dominance["']/g)).toHaveLength(1)
  expect(formatDominance).not.toContain("ReplayTick")
 })

 it("routes Heat Matrix replay ownership through ModuleFrame exactly once", () => {
  const source = readComponentSource("./TubeExplorerVisualModules.tsx")
  const heatMatrix = componentSlice(
   source,
   "export const TubeExplorerThermalImaging",
   "export const TubeExplorerChannelVitalSigns",
  )

  expect(heatMatrix.match(/heroVisualId=["']heat-matrix["']/g)).toHaveLength(1)
  expect(heatMatrix).not.toContain('addEventListener("vt:replay-hero-intro"')
  expect(heatMatrix).not.toContain("ReplayTick")
 })
})
