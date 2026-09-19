import { describe, expect, it } from "vitest"
import {
  applyVideoDirectorSuggestion,
  evaluateVideoDirectorSuggestions,
} from "./dependencyEngine"
import { createEmptyVideoDirectorProject } from "./projectSchema"

describe("Video Director dependency suggestions", () => {
  it("suggests vertical-safe composition for 9:16 output", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["generation-output"].payload.aspectRatio = "9:16"

    const suggestions = evaluateVideoDirectorSuggestions(project)
    expect(suggestions.some((item) => item.title === "Center portrait framing")).toBe(true)
  })

  it("never overwrites user-owned fields by default", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["generation-output"].payload.aspectRatio = "9:16"
    project.categories.composition.payload.framing = "symmetrical"
    project.categories.composition.fieldSources.framing = "user"

    const item = evaluateVideoDirectorSuggestions(project).find(
      (candidate) => candidate.title === "Center portrait framing",
    )

    expect(item).toBeUndefined()
  })

  it("applies suggestion patches as AI-directed provenance", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["perspective-capture"].payload.rig = "drone"

    const item = evaluateVideoDirectorSuggestions(project).find(
      (candidate) => candidate.title === "Match drone movement",
    )
    expect(item).toBeTruthy()

    const applied = applyVideoDirectorSuggestion(project, item!)
    expect(applied.categories["camera-movement"].payload.type).toBe("drone")
    expect(applied.categories["camera-movement"].fieldSources.type).toBe("ai_directed")
  })

  it("preserves a conflicting user override unless force is explicit", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["perspective-capture"].payload.rig = "drone"
    project.categories["camera-movement"].payload.type = "handheld"
    project.categories["camera-movement"].fieldSources.type = "user"

    const item = {
      id: "test",
      title: "Force drone",
      reason: "test",
      sourceCategoryId: "perspective-capture" as const,
      targetCategoryIds: ["camera-movement" as const],
      priority: "medium" as const,
      patches: [{ categoryId: "camera-movement" as const, field: "type", value: "drone" }],
    }

    const applied = applyVideoDirectorSuggestion(project, item)
    expect(applied.categories["camera-movement"].payload.type).toBe("handheld")

    const forced = applyVideoDirectorSuggestion(project, item, { forceUserOverrides: true })
    expect(forced.categories["camera-movement"].payload.type).toBe("drone")
  })
})
