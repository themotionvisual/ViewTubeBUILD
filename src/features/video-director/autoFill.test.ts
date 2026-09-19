import { describe, expect, it } from "vitest"
import {
  applyVideoDirectorAutoFillPlan,
  autoFillVideoDirectorProject,
} from "./autoFill"
import { createEmptyVideoDirectorProject } from "./projectSchema"
import type { BrainModelGateway } from "../../services/brain/runtime/BrainModelGateway"

const context = {
  identityAndAspirations: "History creator",
  contentDNA: "Cinematic historical storytelling",
  performanceLedger: "Analytics unavailable in this test",
  futureStateMap: "Build stronger documentary videos",
  learnedPreferences: "Prefers restrained historical visuals",
  strategicAdvice: "Keep the opening immediately legible",
}

describe("Video Director Auto-Fill", () => {
  it("accepts valid AI fields and preserves explicit creator-owned fields", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["camera-lens"].payload.focalLengthMm = 85
    project.categories["camera-lens"].fieldSources.focalLengthMm = "user"

    const result = applyVideoDirectorAutoFillPlan(project, {
      summary: "Test",
      categories: [{
        categoryId: "camera-lens",
        patch: { focalLengthMm: 35, aperture: 2.8 },
        rationale: "Test camera",
      }],
      shots: [],
    })

    expect(result.project.categories["camera-lens"].payload.focalLengthMm).toBe(85)
    expect(result.project.categories["camera-lens"].payload.aperture).toBe(2.8)
    expect(result.project.categories["camera-lens"].fieldSources.aperture).toBe("ai_directed")
    expect(result.skippedFields).toContainEqual({
      categoryId: "camera-lens",
      field: "focalLengthMm",
      reason: "user-owned",
    })
  })

  it("blocks AI invention of provider and asset identity fields", () => {
    const project = createEmptyVideoDirectorProject()
    const result = applyVideoDirectorAutoFillPlan(project, {
      summary: "Protected fields",
      categories: [
        {
          categoryId: "generation-output",
          patch: { providerId: "invented-provider", resolution: "1080p" },
          rationale: "",
        },
        {
          categoryId: "references-seeds",
          patch: { seed: 123, variationNoise: 0.7 },
          rationale: "",
        },
      ],
      shots: [],
    })

    expect(result.project.categories["generation-output"].payload.providerId).toBeUndefined()
    expect(result.project.categories["generation-output"].payload.resolution).toBe("1080p")
    expect(result.project.categories["references-seeds"].payload.seed).toBeNull()
    expect(result.project.categories["references-seeds"].payload.variationNoise).toBe(0.7)
    expect(result.skippedFields.map((item) => item.reason)).toContain("protected")
  })

  it("builds a weighted storyboard only when one does not already exist", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["timing-pacing"].payload.durationSeconds = 12

    const result = applyVideoDirectorAutoFillPlan(project, {
      summary: "Three beats",
      categories: [],
      shots: [
        { label: "Opening", description: "Fog", durationWeight: 1 },
        { label: "Assault", description: "Advance", durationWeight: 2 },
        { label: "Reveal", description: "Wide finish", durationWeight: 1 },
      ],
    })

    expect(result.storyboardCreated).toBe(true)
    expect(result.project.shots.map((shot) => shot.durationSeconds)).toEqual([3, 6, 3])
    expect(result.project.categories["shot-structure"].payload.shotCount).toBe(3)
    expect(result.project.categories["shot-structure"].fieldSources.shotCount).toBe("ai_directed")
  })

  it("uses the Brain gateway seam and validates its plan", async () => {
    const gateway: BrainModelGateway = {
      generateStructuredResponse: async () => { throw new Error("not used") },
      generateJsonObject: async () => ({
        summary: "Cold documentary treatment",
        categories: [{
          categoryId: "visual-style",
          patch: { medium: "documentary", period: "1805" },
          rationale: "Historical brief",
        }],
        shots: [],
      }),
    }

    const result = await autoFillVideoDirectorProject({
      project: createEmptyVideoDirectorProject(),
      gateway,
      contextProvider: async () => context,
      recordSignal: false,
    })

    expect(result.project.categories["visual-style"].payload.medium).toBe("documentary")
    expect(result.project.categories["visual-style"].payload.period).toBe("1805")
  })
})
