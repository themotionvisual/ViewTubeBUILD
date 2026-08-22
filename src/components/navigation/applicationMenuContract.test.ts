import { describe, expect, it } from "vitest"
import {
  APPLICATION_MENU_DESTINATIONS,
  APPLICATION_MENU_GROUPS,
  searchApplicationMenuDestinations,
} from "./applicationMenuContract"

describe("application menu contract", () => {
  it("keeps product destinations grouped without internal routes", () => {
    expect(APPLICATION_MENU_GROUPS.map((group) => group.id)).toEqual([
      "create",
      "insights",
      "account",
      "support",
    ])
    expect(APPLICATION_MENU_DESTINATIONS.map((destination) => destination.path)).not.toContain("/reference-studio")
    expect(APPLICATION_MENU_DESTINATIONS.map((destination) => destination.path)).not.toContain("/audit")
    expect(APPLICATION_MENU_DESTINATIONS.map((destination) => destination.path)).not.toContain("/bench")
  })

  it("finds destinations from labels, descriptions and creator-facing aliases", () => {
    expect(searchApplicationMenuDestinations("thumbnail").map(({ id }) => id)).toEqual(["studio"])
    expect(searchApplicationMenuDestinations("retention").map(({ id }) => id)).toEqual(["analytics", "graphs"])
    expect(searchApplicationMenuDestinations("gemini key").map(({ id }) => id)).toEqual(["ai-integrations"])
  })

  it("returns the grouped inventory for an empty query and no rows for an unknown query", () => {
    expect(searchApplicationMenuDestinations(" ")).toHaveLength(APPLICATION_MENU_DESTINATIONS.length)
    expect(searchApplicationMenuDestinations("destination-that-does-not-exist")).toEqual([])
  })
})
