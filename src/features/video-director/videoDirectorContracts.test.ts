import { describe, expect, it } from "vitest"
import {
  VIDEO_DIRECTOR_CATEGORY_SCHEMAS,
  parseVideoDirectorCategoryPayload,
} from "./categorySchemas"
import {
  VIDEO_DIRECTOR_CATEGORY_IDS,
  VIDEO_DIRECTOR_CATEGORY_REGISTRY,
} from "./categoryRegistry"
import {
  VideoDirectorProjectSchema,
  createEmptyVideoDirectorProject,
  deriveVideoDirectorCategoryStatus,
  safeParseVideoDirectorProject,
} from "./projectSchema"

describe("Video Director category contracts", () => {
  it("keeps the registry and schema surface aligned at 28 categories", () => {
    expect(VIDEO_DIRECTOR_CATEGORY_REGISTRY).toHaveLength(28)
    expect(new Set(VIDEO_DIRECTOR_CATEGORY_IDS).size).toBe(28)
    expect(Object.keys(VIDEO_DIRECTOR_CATEGORY_SCHEMAS).sort()).toEqual(
      [...VIDEO_DIRECTOR_CATEGORY_IDS].sort(),
    )
  })

  it("can create a fully valid default payload for every category", () => {
    for (const categoryId of VIDEO_DIRECTOR_CATEGORY_IDS) {
      expect(() => VIDEO_DIRECTOR_CATEGORY_SCHEMAS[categoryId].parse({})).not.toThrow()
    }
  })

  it("fails fast on invalid bounded cinematography inputs", () => {
    expect(() =>
      parseVideoDirectorCategoryPayload("camera-lens", {
        focalLengthMm: 0,
      }),
    ).toThrow()

    expect(() =>
      parseVideoDirectorCategoryPayload("grade-exposure", {
        exposureEv: 99,
      }),
    ).toThrow()
  })

  it("requires explicit dimensions for custom output ratios", () => {
    expect(() =>
      parseVideoDirectorCategoryPayload("generation-output", {
        aspectRatio: "custom",
      }),
    ).toThrow()

    expect(
      parseVideoDirectorCategoryPayload("generation-output", {
        aspectRatio: "custom",
        width: 1080,
        height: 1920,
      }).aspectRatio,
    ).toBe("custom")
  })

  it("requires provider and model when manual routing is selected", () => {
    expect(() =>
      parseVideoDirectorCategoryPayload("generation-output", {
        providerMode: "manual",
      }),
    ).toThrow()

    expect(
      parseVideoDirectorCategoryPayload("generation-output", {
        providerMode: "manual",
        providerId: "higgsfield",
        modelId: "seedance-2",
      }).providerMode,
    ).toBe("manual")
  })
})

describe("Video Director project schema", () => {
  it("creates a strict versioned Video DNA project", () => {
    const project = createEmptyVideoDirectorProject("Austerlitz")
    expect(project.schemaVersion).toBe(1)
    expect(project.name).toBe("Austerlitz")
    expect(Object.keys(project.categories)).toHaveLength(28)
    expect(() => VideoDirectorProjectSchema.parse(project)).not.toThrow()
  })

  it("rejects malformed shot-level overrides instead of passing unknown values to workers", () => {
    const project = createEmptyVideoDirectorProject()
    const malformed = {
      ...project,
      shots: [{
        id: "shot-1",
        label: "Opening",
        order: 0,
        startSeconds: 0,
        durationSeconds: 2,
        categoryOverrides: {
          "camera-lens": {
            locked: false,
            fieldSources: { focalLengthMm: "shot_override" },
            conflicts: [],
            payload: { focalLengthMm: 5_000 },
          },
        },
      }],
    }

    expect(safeParseVideoDirectorProject(malformed).success).toBe(false)
  })

  it("derives catalog markers from provenance rather than storing duplicate UI state", () => {
    expect(deriveVideoDirectorCategoryStatus({
      fieldSources: {},
      conflicts: [],
    })).toBe("empty")

    expect(deriveVideoDirectorCategoryStatus({
      recipeId: "recipe-1",
      fieldSources: { focalLengthMm: "recipe" },
      conflicts: [],
    })).toBe("recipe")

    expect(deriveVideoDirectorCategoryStatus({
      fieldSources: { focalLengthMm: "user", aperture: "auto" },
      conflicts: [],
    })).toBe("mixed")

    expect(deriveVideoDirectorCategoryStatus({
      fieldSources: { focalLengthMm: "user" },
      conflicts: [{ id: "conflict-1" }],
    })).toBe("conflict")
  })
})
