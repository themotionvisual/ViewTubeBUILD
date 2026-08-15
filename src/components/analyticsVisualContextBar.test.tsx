import { describe, expect, it } from "vitest"
import {
  ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS,
  resolveAnalyticsMetricTone,
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
})
