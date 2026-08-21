import { describe, expect, it } from "vitest"
import {
  ANALYTICS_DARK_STATS_BACKGROUND,
  ANALYTICS_DARK_STATS_NEUTRAL_VALUE,
  ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS,
  resolveAnalyticsMetricTone,
  resolveAnalyticsStatValueColor,
  resolveAnalyticsVisualContextBarHeight,
} from "./analyticsVisualContextBar"
import { VT_VISUAL_METRIC_COLORS } from "../styles/toolboxPalette"

describe("analytics visual context bar", () => {
  it("uses the shared standard and expanded heights", () => {
    expect(ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS.standard).toBe(32)
    expect(ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS.expanded).toBe(48)
    expect(resolveAnalyticsVisualContextBarHeight()).toBe(32)
    expect(resolveAnalyticsVisualContextBarHeight({ height: "standard" })).toBe(32)
    expect(resolveAnalyticsVisualContextBarHeight({ height: "expanded" })).toBe(48)
  })

  it("resolves compact labels to the canonical 12-metric colors", () => {
    expect(resolveAnalyticsMetricTone("VIEWS")).toBe(VT_VISUAL_METRIC_COLORS.views)
    expect(resolveAnalyticsMetricTone("WATCH HRS")).toBe(VT_VISUAL_METRIC_COLORS.watchTime)
    expect(resolveAnalyticsMetricTone("SUBS")).toBe(VT_VISUAL_METRIC_COLORS.subscribers)
    expect(resolveAnalyticsMetricTone("ENGAGED")).toBe(VT_VISUAL_METRIC_COLORS.engagedViews)
    expect(resolveAnalyticsMetricTone("REV")).toBe(VT_VISUAL_METRIC_COLORS.revenue)
    expect(resolveAnalyticsMetricTone("CMTS")).toBe(VT_VISUAL_METRIC_COLORS.comments)
    expect(resolveAnalyticsMetricTone("SAVES")).toBe(VT_VISUAL_METRIC_COLORS.playlistSaves)
    expect(resolveAnalyticsMetricTone("AVP")).toBe(VT_VISUAL_METRIC_COLORS.avp)
    expect(resolveAnalyticsMetricTone("AVD")).toBe(VT_VISUAL_METRIC_COLORS.avd)
    expect(resolveAnalyticsMetricTone("RPM")).toBe(VT_VISUAL_METRIC_COLORS.rpm)
  })

  describe("dark-canvas stat convention", () => {
    it("keeps the black-on-light look when darkStats is off", () => {
      const item = { label: "VIEWS", value: "1.2M" }
      // Off → black number, no derived background override.
      expect(resolveAnalyticsStatValueColor(item, false, VT_VISUAL_METRIC_COLORS.views)).toBe("#000000")
    })

    it("colors the number with the metric tone when darkStats is on", () => {
      const item = { label: "VIEWS", value: "1.2M" }
      expect(resolveAnalyticsStatValueColor(item, true, VT_VISUAL_METRIC_COLORS.views))
        .toBe(VT_VISUAL_METRIC_COLORS.views)
    })

    it("falls back to a light neutral when darkStats is on but the label has no known tone", () => {
      const item = { label: "SLOT", value: "TUE 3PM" }
      expect(resolveAnalyticsStatValueColor(item, true, undefined)).toBe(ANALYTICS_DARK_STATS_NEUTRAL_VALUE)
    })

    it("lets an explicit per-item valueTone always win", () => {
      const item = { label: "VIEWS", value: "1.2M", valueTone: "#FF0000" }
      expect(resolveAnalyticsStatValueColor(item, true, VT_VISUAL_METRIC_COLORS.views)).toBe("#FF0000")
      expect(resolveAnalyticsStatValueColor(item, false, VT_VISUAL_METRIC_COLORS.views)).toBe("#FF0000")
    })

    it("exports the canonical dark-canvas background hex", () => {
      // Any drift here would silently change the whole family of visuals'
      // subtitle rows, so the value is asserted rather than inlined.
      expect(ANALYTICS_DARK_STATS_BACKGROUND).toBe("#080816")
    })
  })
})
