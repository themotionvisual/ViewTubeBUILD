// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  NAVIGATION_STORAGE_KEY,
  PRIMARY_NAV_ITEMS,
  getNavigationLayout,
  setNavigationLayoutPreference,
  subscribeNavigationLayout,
  parseNavigationLayout,
} from "./navigationContract"

describe("adaptive navigation contract", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("defaults invalid or missing persisted layouts to the top bar", () => {
    expect(parseNavigationLayout(null)).toBe("top")
    expect(parseNavigationLayout("sidebar")).toBe("top")
    expect(parseNavigationLayout("")).toBe("top")
  })

  it("accepts every supported desktop layout", () => {
    expect(parseNavigationLayout("top")).toBe("top")
    expect(parseNavigationLayout("wide")).toBe("wide")
    expect(parseNavigationLayout("thin")).toBe("thin")
    expect(parseNavigationLayout("rail")).toBe("rail")
    expect(NAVIGATION_STORAGE_KEY).toBe("vt_navigation_layout")
  })

  it("stores layout changes and notifies live subscribers", () => {
    const listener = vi.fn()
    const unsubscribe = subscribeNavigationLayout(listener)

    expect(getNavigationLayout()).toBe("top")
    setNavigationLayoutPreference("wide")
    expect(localStorage.getItem(NAVIGATION_STORAGE_KEY)).toBe("wide")
    expect(getNavigationLayout()).toBe("wide")
    expect(listener).toHaveBeenCalledTimes(1)

    setNavigationLayoutPreference("rail")
    expect(getNavigationLayout()).toBe("rail")
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    setNavigationLayoutPreference("thin")
    expect(listener).toHaveBeenCalledTimes(2)
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
