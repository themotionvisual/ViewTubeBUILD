import { describe, expect, it } from "vitest"
import { CROWN_TODAY_SIGNALS, CROWN_TODAY_SUMMARY, CROWN_TODAY_TOP_ACTIONS } from "./crownTodayIntelligence"

describe("Crown Today intelligence", () => {
  it("prioritizes evidence-bearing blockers without inventing completion", () => {
    expect(CROWN_TODAY_SIGNALS.length).toBeGreaterThan(0)
    expect(CROWN_TODAY_SIGNALS.some((signal) => signal.source === "release" && signal.priority === "blocked")).toBe(true)
    expect(CROWN_TODAY_SUMMARY.needsVerification).toBeGreaterThan(0)
    expect(CROWN_TODAY_SUMMARY.partialReceipts).toBeGreaterThan(0)
  })

  it("limits the executive action queue to the top three ranked signals", () => {
    expect(CROWN_TODAY_TOP_ACTIONS).toHaveLength(3)
    expect(new Set(CROWN_TODAY_TOP_ACTIONS.map((item) => item.id)).size).toBe(3)
  })

  it("never labels a partial mission as ready", () => {
    const partialMissionSignals = CROWN_TODAY_SIGNALS.filter((signal) => signal.source === "mission")
    expect(partialMissionSignals.every((signal) => signal.priority !== "ready")).toBe(true)
  })
})
