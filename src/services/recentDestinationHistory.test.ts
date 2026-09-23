// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
  clearRecentDestinations,
  quickSwitcherPages,
  readRecentDestinations,
  recordRecentDestination,
  resolveQuickSwitcherPage,
} from "./recentDestinationHistory"

describe("recent destination history", () => {
  beforeEach(() => {
    localStorage.clear()
    clearRecentDestinations()
    window.history.replaceState({}, "", "/")
  })

  it("only exposes production pages already classified for navigation", () => {
    const pages = quickSwitcherPages()
    expect(pages.some((page) => page.path === "/studio")).toBe(true)
    expect(pages.some((page) => page.path === "/video-manager")).toBe(true)
    expect(pages.some((page) => page.path === "/component-grid")).toBe(false)
    expect(pages.some((page) => page.path.includes(":"))).toBe(false)
    expect(pages.every((page) => page.lifecycle === "production")).toBe(true)
    expect(pages.every((page) => page.navigationVisibility !== "hidden")).toBe(true)
  })

  it("canonicalizes aliases to the registered destination", () => {
    expect(resolveQuickSwitcherPage("/analytics")?.path).toBe("/local-analytics")
    expect(resolveQuickSwitcherPage("/project-calendar?view=month")?.path).toBe("/projects")
    expect(resolveQuickSwitcherPage("/reference-studio")).toBeNull()
  })

  it("deduplicates recent destinations and moves revisits to the front", () => {
    recordRecentDestination("/studio")
    recordRecentDestination("/projects")
    recordRecentDestination("/studio?tool=video-manager")

    const recent = readRecentDestinations()
    expect(recent.map((item) => item.path).slice(0, 2)).toEqual(["/studio", "/projects"])
    expect(recent.filter((item) => item.path === "/studio")).toHaveLength(1)
  })

  it("ignores hidden and unknown routes and keeps a stable snapshot", () => {
    recordRecentDestination("/component-grid")
    recordRecentDestination("/not-a-route")
    expect(readRecentDestinations()).toHaveLength(0)
    expect(readRecentDestinations()).toBe(readRecentDestinations())
  })
})
