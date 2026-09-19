import { describe, expect, it } from "vitest"
import {
  applyVideoDirectorConflicts,
  evaluateVideoDirectorConflicts,
} from "./conflictEngine"
import {
  createEmptyVideoDirectorProject,
  deriveVideoDirectorCategoryStatus,
} from "./projectSchema"

describe("Video Director conflict engine", () => {
  it("flags incompatible single-take shot counts", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["shot-structure"].payload.mode = "single-take"
    project.categories["shot-structure"].payload.shotCount = 4

    const conflicts = evaluateVideoDirectorConflicts(project)
    expect(conflicts.some((item) => item.code === "single_take_multiple_shots")).toBe(true)
  })

  it("flags static camera settings that still contain motion", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["camera-movement"].payload.type = "static"
    project.categories["camera-movement"].payload.panDegrees = 35

    const conflicts = evaluateVideoDirectorConflicts(project)
    expect(conflicts.some((item) => item.code === "static_camera_has_motion")).toBe(true)
  })

  it("writes conflicts back to category state so catalog markers remain derived", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["focus-depth"].payload.mode = "rack-focus"

    const next = applyVideoDirectorConflicts(project)
    expect(next.categories["focus-depth"].conflicts).toHaveLength(1)
    expect(deriveVideoDirectorCategoryStatus(next.categories["focus-depth"])).toBe("conflict")
  })

  it("removes resolved conflicts on the next evaluation", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["focus-depth"].payload.mode = "rack-focus"

    const conflicted = applyVideoDirectorConflicts(project)
    conflicted.categories["focus-depth"].payload.rackFocusEndMeters = 8

    const resolved = applyVideoDirectorConflicts(conflicted)
    expect(resolved.categories["focus-depth"].conflicts).toEqual([])
  })
})
