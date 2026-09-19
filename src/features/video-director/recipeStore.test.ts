import { describe, expect, it } from "vitest"
import {
  applyVideoDirectorRecipe,
  createVideoDirectorCategoryRecipe,
  createVideoDirectorProjectRecipe,
} from "./recipeStore"
import { createEmptyVideoDirectorProject } from "./projectSchema"

describe("Video Director recipes", () => {
  it("creates a category recipe from explicit directing state", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["camera-lens"].payload.focalLengthMm = 85
    project.categories["camera-lens"].fieldSources.focalLengthMm = "user"

    const recipe = createVideoDirectorCategoryRecipe({
      project,
      categoryId: "camera-lens",
      name: "Portrait 85",
    })

    expect(recipe.scope).toBe("category")
    expect(recipe.categories[0].categoryId).toBe("camera-lens")
    expect(recipe.categories[0].fields).toContain("focalLengthMm")
  })

  it("applies recipes without destroying later user overrides", () => {
    const source = createEmptyVideoDirectorProject()
    source.categories["camera-lens"].payload.focalLengthMm = 35
    source.categories["camera-lens"].fieldSources.focalLengthMm = "user"
    const recipe = createVideoDirectorCategoryRecipe({
      project: source,
      categoryId: "camera-lens",
      name: "35mm",
    })

    const target = createEmptyVideoDirectorProject()
    target.categories["camera-lens"].payload.focalLengthMm = 85
    target.categories["camera-lens"].fieldSources.focalLengthMm = "user"

    const applied = applyVideoDirectorRecipe(target, recipe)
    expect(applied.categories["camera-lens"].payload.focalLengthMm).toBe(85)
    expect(applied.categories["camera-lens"].recipeId).toBe(recipe.id)

    const forced = applyVideoDirectorRecipe(target, recipe, { forceUserOverrides: true })
    expect(forced.categories["camera-lens"].payload.focalLengthMm).toBe(35)
    expect(forced.categories["camera-lens"].fieldSources.focalLengthMm).toBe("recipe")
  })

  it("creates project recipes only from configured categories", () => {
    const project = createEmptyVideoDirectorProject()
    project.categories["color-palette"].payload.exactLock = true
    project.categories["color-palette"].fieldSources.exactLock = "user"
    project.categories.music.payload.enabled = true
    project.categories.music.fieldSources.enabled = "user"

    const recipe = createVideoDirectorProjectRecipe({ project, name: "Campaign look" })
    expect(recipe.categories.map((entry) => entry.categoryId).sort()).toEqual(
      ["color-palette", "music"],
    )
  })
})
