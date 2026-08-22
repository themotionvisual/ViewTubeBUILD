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

const expectSingleBoundaryOwner = (source: string, visualId: string) => {
  expect(source.match(new RegExp(`HeroIntroBoundary visualId=["']${visualId}["']`, "g")))
    .toHaveLength(1)
  expect(source).not.toContain('addEventListener("vt:replay-hero-intro"')
  expect(source).not.toContain("ReplayTick")
}

describe("hero replay ownership", () => {
  it("gives Format Dominance one HeroIntroBoundary replay owner", () => {
    const source = readComponentSource("./GraphsPageCharts.tsx")
    const formatDominance = componentSlice(
      source,
      "export const FormatComparisonDonuts",
      "export const RevenueEfficiency",
    )

    expectSingleBoundaryOwner(formatDominance, "format-dominance")
  })

  it("gives Heat Matrix one HeroIntroBoundary replay owner", () => {
    const source = readComponentSource("./TubeExplorerVisualModules.tsx")
    const heatMatrix = componentSlice(
      source,
      "export const TubeExplorerThermalImaging",
      "export const TubeExplorerChannelVitalSigns",
    )

    expectSingleBoundaryOwner(heatMatrix, "heat-matrix")
  })
})
