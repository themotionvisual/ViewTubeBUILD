import { describe, expect, it } from "vitest"
import {
  getToolboxPaletteColors,
  getVtVisualControllerColors,
  getVtVisualHeaderColorPair,
  getVtVisualMetricColor,
  resolveVtVisualMetricKey,
  VT_SPECTRUM_PALETTE_06,
  VT_VISUAL_METRIC_COLORS,
  VT_VISUAL_METRIC_ORDER,
} from "./toolboxPalette"

describe("VT-SYNC visual metric palette", () => {
  it("maps the twelve canonical metrics to the spectrum in the approved order", () => {
    expect(VT_VISUAL_METRIC_ORDER).toEqual([
      "views",
      "engagedViews",
      "watchTime",
      "subscribers",
      "revenue",
      "comments",
      "avp",
      "avd",
      "likes",
      "rpm",
      "shares",
      "playlistSaves",
    ])

    expect(VT_VISUAL_METRIC_ORDER.map((metric) => VT_VISUAL_METRIC_COLORS[metric]))
      .toEqual(VT_SPECTRUM_PALETTE_06)

    expect(VT_VISUAL_METRIC_COLORS.subscribers).toBe("#FFDA47")
    expect(VT_VISUAL_METRIC_COLORS.likes).toBe("#528FFA")
    expect(VT_VISUAL_METRIC_COLORS.shares).toBe("#F55EFC")
    expect(VT_VISUAL_METRIC_COLORS.playlistSaves).toBe("#FF7AC8")
  })

  it("keeps display aliases on the same semantic color", () => {
    expect(resolveVtVisualMetricKey("ENG. VIEWS")).toBe("engagedViews")
    expect(resolveVtVisualMetricKey("$ REV.")).toBe("revenue")
    expect(resolveVtVisualMetricKey("CMNTS")).toBe("comments")
    expect(resolveVtVisualMetricKey("Playlist Saves (Net)")).toBe("playlistSaves")
    expect(resolveVtVisualMetricKey("AVG. % VIEWED")).toBe("avp")
    expect(resolveVtVisualMetricKey("AVG. VIEW DUR.")).toBe("avd")
    expect(resolveVtVisualMetricKey("Revenue per mille (RPM)")).toBe("rpm")
    expect(getVtVisualMetricColor("Revenue per mille (RPM)")).toBe(VT_VISUAL_METRIC_COLORS.rpm)
    expect(getVtVisualMetricColor("Added to Playlists")).toBe(VT_VISUAL_METRIC_COLORS.playlistSaves)
    expect(resolveVtVisualMetricKey("Description Preview")).toBeUndefined()
    expect(resolveVtVisualMetricKey("Share of tracked traffic")).toBeUndefined()
  })

  it("uses the Studio Hub toolbox pairing order for visual headers", () => {
    expect(getVtVisualHeaderColorPair(0)).toEqual({
      icon: getToolboxPaletteColors(0).icon,
      title: getToolboxPaletteColors(0).header,
    })
    expect(getVtVisualHeaderColorPair(7)).toEqual({
      icon: getToolboxPaletteColors(7).icon,
      title: getToolboxPaletteColors(7).header,
    })
  })

  it("derives controller row colors around the icon block color", () => {
    expect(getVtVisualControllerColors(0)).toEqual({
      previous: VT_SPECTRUM_PALETTE_06[3],
      middle: getToolboxPaletteColors(0).icon,
      next: VT_SPECTRUM_PALETTE_06[5],
    })
  })
})
