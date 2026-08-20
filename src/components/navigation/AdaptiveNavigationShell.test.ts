import { describe, expect, it } from "vitest"
import {
  NAVIGATION_STORAGE_KEY,
  PRIMARY_NAV_ITEMS,
  parseNavigationLayout,
} from "./navigationContract"

describe("adaptive navigation contract", () => {
  it("defaults invalid or missing persisted layouts to the top bar", () => {
    expect(parseNavigationLayout(null)).toBe("top")
    expect(parseNavigationLayout("sidebar")).toBe("top")
    expect(parseNavigationLayout("")).toBe("top")
  })

  it("accepts every supported desktop layout", () => {
    expect(parseNavigationLayout("top")).toBe("top")
    expect(parseNavigationLayout("wide")).toBe("wide")
    expect(parseNavigationLayout("thin")).toBe("thin")
    expect(NAVIGATION_STORAGE_KEY).toBe("vt_navigation_layout")
  })

  it("keeps the canonical route and Palette 06 order", () => {
    expect(PRIMARY_NAV_ITEMS.map(({ path }) => path)).toEqual([
      "/",
      "/studio",
      "/projects",
      "/ai-brain",
      "/local-analytics",
      "/editor",
      "/settings",
      "/user-guide",
    ])
    expect(PRIMARY_NAV_ITEMS.map(({ paletteIndex }) => paletteIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })
})
