import { describe, expect, it } from "vitest"
import { QUICK_SWITCHER_COMMANDS } from "./quickSwitcherCommandCatalog"

describe("Quick Switcher command catalog", () => {
  it("keeps stable unique command ids", () => {
    const ids = QUICK_SWITCHER_COMMANDS.map((command) => command.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual([
      "open-experience-settings",
      "layout-top",
      "layout-wide",
      "layout-thin",
      "layout-rail",
      "clear-recent-destinations",
      "clear-pinned-destinations",
    ])
  })

  it("limits commands to navigation, layout, and local convenience data", () => {
    expect(new Set(QUICK_SWITCHER_COMMANDS.map((command) => command.kind))).toEqual(
      new Set(["navigate", "layout", "clear-local"]),
    )
    const navigationCommand = QUICK_SWITCHER_COMMANDS.find((command) => command.kind === "navigate")
    expect(navigationCommand && "path" in navigationCommand ? navigationCommand.path : "").toBe(
      "/settings?panel=experience",
    )
  })

  it("covers every desktop navigation layout exactly once", () => {
    const layouts = QUICK_SWITCHER_COMMANDS
      .filter((command) => command.kind === "layout")
      .map((command) => command.kind === "layout" ? command.layout : null)

    expect(layouts).toEqual(["top", "wide", "thin", "rail"])
    expect(new Set(layouts).size).toBe(4)
  })

  it("gives every command searchable metadata", () => {
    for (const command of QUICK_SWITCHER_COMMANDS) {
      expect(command.label.length).toBeGreaterThan(4)
      expect(command.description.length).toBeGreaterThan(12)
      expect(command.keywords.length).toBeGreaterThan(2)
    }
  })
})
