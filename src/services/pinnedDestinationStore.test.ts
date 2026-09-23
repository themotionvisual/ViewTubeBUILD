// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
  clearPinnedDestinations,
  isDestinationPinned,
  pinDestination,
  readPinnedDestinations,
  togglePinnedDestination,
  unpinDestination,
} from "./pinnedDestinationStore"

describe("pinned destination store", () => {
  beforeEach(() => {
    localStorage.clear()
    clearPinnedDestinations()
  })

  it("pins only production destinations from the quick-switcher registry", () => {
    pinDestination("/studio")
    pinDestination("/component-grid")
    pinDestination("/unknown")

    expect(readPinnedDestinations()).toEqual(["/studio"])
    expect(isDestinationPinned("/studio")).toBe(true)
  })

  it("canonicalizes aliases and keeps each pin unique", () => {
    pinDestination("/analytics")
    pinDestination("/local-analytics")
    pinDestination("/project-calendar")

    expect(readPinnedDestinations()).toEqual(["/projects", "/local-analytics"])
  })

  it("moves a re-pinned destination to the front and supports unpin", () => {
    pinDestination("/studio")
    pinDestination("/projects")
    pinDestination("/studio")

    expect(readPinnedDestinations().slice(0, 2)).toEqual(["/studio", "/projects"])

    unpinDestination("/studio")
    expect(readPinnedDestinations()).toEqual(["/projects"])
  })

  it("toggles a destination without affecting other pins", () => {
    pinDestination("/studio")
    pinDestination("/projects")
    togglePinnedDestination("/studio")
    expect(readPinnedDestinations()).toEqual(["/projects"])

    togglePinnedDestination("/studio")
    expect(readPinnedDestinations()).toEqual(["/studio", "/projects"])
  })
})
