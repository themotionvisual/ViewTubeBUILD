import { describe, expect, it } from "vitest"
import {
  buildAdaptiveZeroScale,
  buildLogBubbleRadii,
  buildTieAwarePercentiles,
  interpolateThreeStopColor,
} from "../chartScaleModel"

describe("adaptive chart scale model", () => {
  it("uses a compact nice ceiling for a 46-second dataset", () => {
    expect(buildAdaptiveZeroScale([4, 18, 31, 46], { fallbackMax: 180 })).toEqual({
      domain: [0, 50],
      ticks: [0, 10, 20, 30, 40, 50],
      step: 10,
    })
  })

  it("expands a high-AVP dataset to a readable 600-percent ceiling", () => {
    expect(buildAdaptiveZeroScale([151, 291, 412, 550], { fallbackMax: 300 })).toEqual({
      domain: [0, 600],
      ticks: [0, 150, 300, 450, 600],
      step: 150,
    })
  })

  it("uses documented fallbacks for empty or invalid datasets", () => {
    expect(buildAdaptiveZeroScale([0, Number.NaN, Number.POSITIVE_INFINITY], { fallbackMax: 180 })).toEqual({
      domain: [0, 180],
      ticks: [0, 50, 100, 150, 180],
      step: 50,
    })
  })

  it("caps the Shorts duration presentation at its semantic 180-second maximum", () => {
    expect(buildAdaptiveZeroScale([46, 121, 179], { fallbackMax: 180, hardMax: 180 })).toEqual({
      domain: [0, 180],
      ticks: [0, 50, 100, 150, 180],
      step: 50,
    })
  })

  it("assigns equal percentile positions to tied values, retains zero, and excludes missing values", () => {
    expect(buildTieAwarePercentiles([1, 5, 5, 1000, null, 0])).toEqual([
      0.25,
      0.625,
      0.625,
      1,
      null,
      0,
    ])
  })

  it("distributes ordinary revenue values across the palette even with one extreme outlier", () => {
    const positions = buildTieAwarePercentiles([1, 2, 3, 4, 1_000])
    expect(positions).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(positions.filter((position) => position !== null && position >= 0.5)).toHaveLength(3)
  })

  it("interpolates the requested three-stop palettes", () => {
    const palette = ["#FF7497", "#B14AED", "#26C7EC"] as const
    expect(interpolateThreeStopColor(0, palette)).toBe("#FF7497")
    expect(interpolateThreeStopColor(0.5, palette)).toBe("#B14AED")
    expect(interpolateThreeStopColor(1, palette)).toBe("#26C7EC")
  })

  it("keeps view-based bubble radii monotonic while compressing extreme values", () => {
    const radii = buildLogBubbleRadii([10, 100, 1_000_000], { minRadius: 4, maxRadius: 30 })
    expect(radii[0]).toBe(4)
    expect(radii[1]).toBeGreaterThan(radii[0])
    expect(radii[2]).toBe(30)
  })
})
