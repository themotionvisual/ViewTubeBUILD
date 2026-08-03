import { describe, expect, it } from "vitest"
import {
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
      "watchTime",
      "subscribers",
      "engagedViews",
      "revenue",
      "comments",
      "shares",
      "likes",
      "saves",
      "avp",
      "avd",
      "rpm",
    ])

    expect(VT_VISUAL_METRIC_ORDER.map((metric) => VT_VISUAL_METRIC_COLORS[metric]))
      .toEqual(VT_SPECTRUM_PALETTE_06)
  })

  it("keeps display aliases on the same semantic color", () => {
    expect(resolveVtVisualMetricKey("ENG. VIEWS")).toBe("engagedViews")
    expect(resolveVtVisualMetricKey("$ REV.")).toBe("revenue")
    expect(resolveVtVisualMetricKey("CMNTS")).toBe("comments")
    expect(resolveVtVisualMetricKey("Playlist Saves (Net)")).toBe("saves")
    expect(resolveVtVisualMetricKey("AVG. % VIEWED")).toBe("avp")
    expect(resolveVtVisualMetricKey("AVG. VIEW DUR.")).toBe("avd")
    expect(getVtVisualMetricColor("Added to Playlists")).toBe(VT_VISUAL_METRIC_COLORS.saves)
    expect(resolveVtVisualMetricKey("Description Preview")).toBeUndefined()
    expect(resolveVtVisualMetricKey("Share of tracked traffic")).toBeUndefined()
  })
})
