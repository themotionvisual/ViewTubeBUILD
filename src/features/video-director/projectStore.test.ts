import { describe, expect, it } from "vitest"
import {
  createEmptyVideoDirectorProject,
} from "./projectSchema"
import { normalizeVideoDirectorProject } from "./projectStore"

describe("Video Director project repair", () => {
  it("preserves valid category state while independently repairing invalid categories", () => {
    const project = createEmptyVideoDirectorProject("Repair test")
    project.categories["camera-lens"].payload.focalLengthMm = 85
    project.categories["grade-exposure"].payload.exposureEv = 999

    const repaired = normalizeVideoDirectorProject(project)

    expect(repaired.name).toBe("Repair test")
    expect(repaired.categories["camera-lens"].payload.focalLengthMm).toBe(85)
    expect(repaired.categories["grade-exposure"].payload.exposureEv).toBe(0)
  })

  it("drops malformed shots without throwing away the project", () => {
    const project = createEmptyVideoDirectorProject()
    const raw = {
      ...project,
      shots: [
        {
          id: "good",
          label: "Good shot",
          order: 0,
          startSeconds: 0,
          durationSeconds: 2,
        },
        {
          id: "bad",
          label: "",
          order: -1,
          durationSeconds: -4,
        },
      ],
    }

    const repaired = normalizeVideoDirectorProject(raw)
    expect(repaired.shots).toHaveLength(1)
    expect(repaired.shots[0].id).toBe("good")
  })
})
