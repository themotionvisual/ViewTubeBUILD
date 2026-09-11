import { describe, expect, it } from "vitest"
import { CROWN_LIFECYCLE, CROWN_MISSIONS, CROWN_SNAPSHOT_META } from "./crownControlRoomSnapshot"

describe("Crown runtime snapshot", () => {
  it("stays explicitly read-only", () => {
    expect(CROWN_SNAPSHOT_META.readOnly).toBe(true)
    expect(CROWN_SNAPSHOT_META.source).toBe(".viewtube/exchange/**")
  })

  it("represents every core Crown domain", () => {
    const domains = new Set(CROWN_MISSIONS.map((mission) => mission.domain))
    for (const domain of ["Observatory", "Citadel", "Brain", "Forge", "Compass"]) {
      expect(domains.has(domain as never)).toBe(true)
    }
  })

  it("never marks a mission complete without evidence", () => {
    for (const mission of CROWN_MISSIONS) {
      if (mission.status === "complete") expect(mission.evidence.length).toBeGreaterThan(0)
    }
  })

  it("keeps the seven-stage Crown lifecycle", () => {
    expect(CROWN_LIFECYCLE).toHaveLength(7)
    expect(CROWN_LIFECYCLE[0]).toBe("DISCOVER")
    expect(CROWN_LIFECYCLE[6]).toBe("LEARN / ARCHIVE")
  })
})
