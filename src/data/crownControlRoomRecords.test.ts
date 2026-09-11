import { describe, expect, it } from "vitest"
import { CROWN_ARTIFACTS, CROWN_DECISIONS, CROWN_EXECUTION, CROWN_TASK_AUTHORITY, CROWN_VERIFICATION } from "./crownControlRoomRecords"
import { CROWN_MISSIONS } from "./crownControlRoomSnapshot"

describe("Crown Control Room readers", () => {
  it("keeps the canonical Task Index external and read only", () => {
    expect(CROWN_TASK_AUTHORITY.embedded).toBe(false)
    expect(CROWN_TASK_AUTHORITY.status).toBe("external-authority")
  })

  it("has one work order and one receipt record per Crown mission", () => {
    const missionIds = new Set(CROWN_MISSIONS.map((mission) => mission.id))
    expect(new Set(CROWN_EXECUTION.map((item) => item.missionId))).toEqual(missionIds)
    expect(new Set(CROWN_VERIFICATION.map((item) => item.missionId))).toEqual(missionIds)
  })

  it("does not duplicate artifact or decision ids", () => {
    expect(new Set(CROWN_ARTIFACTS.map((item) => item.id)).size).toBe(CROWN_ARTIFACTS.length)
    expect(new Set(CROWN_DECISIONS.map((item) => item.id)).size).toBe(CROWN_DECISIONS.length)
  })
})
