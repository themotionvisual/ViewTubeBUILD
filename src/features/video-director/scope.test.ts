import { describe, expect, it } from "vitest"
import {
  PROJECT_VIDEO_DIRECTOR_SCOPE,
  listVideoDirectorScopeOptions,
  resetVideoDirectorScopedCategory,
  resolveVideoDirectorScopedCategoryState,
  setVideoDirectorScopedCategoryField,
} from "./scope"
import {
  buildVideoDirectorStoryboard,
  duplicateVideoDirectorShot,
  ensureVideoDirectorVariants,
  reorderVideoDirectorShot,
  setVideoDirectorVariantAllowedCategories,
  setVideoDirectorVariantCategoryAllowed,
  setVideoDirectorVariantStrength,
} from "./storyboard"
import { createEmptyVideoDirectorProject } from "./projectSchema"

describe("Video Director scope inheritance", () => {
  it("inherits project values until a shot field is explicitly overridden", () => {
    let project = createEmptyVideoDirectorProject()
    project.categories["camera-lens"].payload.focalLengthMm = 35
    project.categories["camera-lens"].fieldSources.focalLengthMm = "user"
    project = buildVideoDirectorStoryboard(project)
    const shotScope = { type: "shot" as const, id: project.shots[0].id }

    expect(resolveVideoDirectorScopedCategoryState(project, "camera-lens", shotScope).payload.focalLengthMm).toBe(35)

    project = setVideoDirectorScopedCategoryField({
      project,
      categoryId: "camera-lens",
      field: "focalLengthMm",
      value: 85,
      scope: shotScope,
    })
    expect(resolveVideoDirectorScopedCategoryState(project, "camera-lens", shotScope).payload.focalLengthMm).toBe(85)

    project.categories["camera-lens"].payload.aperture = 8
    expect(resolveVideoDirectorScopedCategoryState(project, "camera-lens", shotScope).payload.aperture).toBe(8)
  })

  it("resetting a shot category returns it to project inheritance", () => {
    let project = buildVideoDirectorStoryboard(createEmptyVideoDirectorProject())
    const scope = { type: "shot" as const, id: project.shots[0].id }
    project = setVideoDirectorScopedCategoryField({
      project,
      categoryId: "grade-exposure",
      field: "exposureEv",
      value: -1,
      scope,
    })
    project = resetVideoDirectorScopedCategory({ project, categoryId: "grade-exposure", scope })

    expect(project.shots[0].categoryOverrides["grade-exposure"]).toBeUndefined()
  })

  it("lists project, shot and variant scopes from one source", () => {
    let project = buildVideoDirectorStoryboard(createEmptyVideoDirectorProject())
    project = ensureVideoDirectorVariants(project, 2)
    const options = listVideoDirectorScopeOptions(project)

    expect(options[0].scope).toEqual(PROJECT_VIDEO_DIRECTOR_SCOPE)
    expect(options.filter((item) => item.scope.type === "shot")).toHaveLength(project.shots.length)
    expect(options.filter((item) => item.scope.type === "variant")).toHaveLength(2)
  })
})

describe("Video Director storyboard", () => {
  it("builds deterministic duration-balanced shot slots", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["timing-pacing"].payload.durationSeconds = 12
    project.categories["shot-structure"].payload.shotCount = 3

    const built = buildVideoDirectorStoryboard(project)
    expect(built.shots).toHaveLength(3)
    expect(built.shots.map((shot) => shot.durationSeconds)).toEqual([4, 4, 4])
    expect(built.shots.map((shot) => shot.startSeconds)).toEqual([0, 4, 8])
  })

  it("duplicates and reorders without losing shot overrides", () => {
    let project = buildVideoDirectorStoryboard(createEmptyVideoDirectorProject())
    const firstId = project.shots[0].id
    project = duplicateVideoDirectorShot(project, firstId)
    expect(project.shots).toHaveLength(5)

    const copiedId = project.shots[1].id
    project = reorderVideoDirectorShot(project, copiedId, 1)
    expect(project.shots.find((shot) => shot.id === copiedId)?.order).toBe(2)
  })
})


describe("Video Director variation matrix", () => {
  it("tracks allowed categories independently for each variant", () => {
    let project = ensureVideoDirectorVariants(createEmptyVideoDirectorProject(), 2)
    const [a, b] = project.variants

    project = setVideoDirectorVariantCategoryAllowed(project, a.id, "camera-lens", true)
    project = setVideoDirectorVariantCategoryAllowed(project, a.id, "color-palette", true)
    project = setVideoDirectorVariantCategoryAllowed(project, b.id, "music", true)

    expect(project.variants[0].allowedCategories.sort()).toEqual(["camera-lens", "color-palette"])
    expect(project.variants[1].allowedCategories).toEqual(["music"])
  })

  it("can replace a variant matrix and change its strength without touching siblings", () => {
    let project = ensureVideoDirectorVariants(createEmptyVideoDirectorProject(), 2)
    const [a, b] = project.variants

    project = setVideoDirectorVariantAllowedCategories(project, a.id, ["composition", "camera-movement"])
    project = setVideoDirectorVariantStrength(project, a.id, "radical")

    expect(project.variants[0].variationStrength).toBe("radical")
    expect(project.variants[0].allowedCategories.sort()).toEqual(["camera-movement", "composition"])
    expect(project.variants[1].variationStrength).toBe("balanced")
    expect(project.variants[1].allowedCategories).toEqual([])
    expect(project.variants[1].id).toBe(b.id)
  })
})
