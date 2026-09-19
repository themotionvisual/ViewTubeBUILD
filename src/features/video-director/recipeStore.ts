import { z } from "zod"
import {
  VIDEO_DIRECTOR_CATEGORY_SCHEMAS,
  VideoDirectorCategoryIdSchema,
  type VideoDirectorCategoryId,
} from "./categorySchemas"
import {
  VideoDirectorProjectSchema,
  type VideoDirectorParameterSource,
  type VideoDirectorProject,
} from "./projectSchema"

export const VIDEO_DIRECTOR_RECIPE_SCHEMA_VERSION = 1 as const
export const VIDEO_DIRECTOR_RECIPE_LIBRARY_KEY = "viewtube_video_director_recipes_v1"

const RecipeCategoryEntrySchema = z.object({
  categoryId: VideoDirectorCategoryIdSchema,
  fields: z.array(z.string().trim().min(1)).max(512),
  payload: z.record(z.string(), z.unknown()),
}).strict()

export const VideoDirectorRecipeSchema = z.object({
  schemaVersion: z.literal(VIDEO_DIRECTOR_RECIPE_SCHEMA_VERSION),
  id: z.string().trim().min(1),
  version: z.number().int().min(1).default(1),
  name: z.string().trim().min(1).max(500),
  description: z.string().max(2_000).default(""),
  scope: z.enum(["category", "project"]),
  parentRecipeId: z.string().trim().min(1).nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  categories: z.array(RecipeCategoryEntrySchema).min(1).max(28),
  visibility: z.enum(["private", "shared", "marketplace"]).default("private"),
  priceCents: z.number().int().min(0).nullable().default(null),
  creatorLabel: z.string().max(300).default(""),
}).strict()

export type VideoDirectorRecipe = z.infer<typeof VideoDirectorRecipeSchema>

const makeId = () =>
  `vtd-recipe-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`}`

const canUseStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined"

const explicitFields = (
  sources: Record<string, VideoDirectorParameterSource>,
  payload: Record<string, unknown>,
) => {
  const fields = Object.keys(sources).filter((field) => {
    const source = sources[field]
    return source !== "auto" && source !== "provider_default"
  })
  return fields.length ? fields : Object.keys(payload)
}

const validateRecipeCategory = (entry: z.infer<typeof RecipeCategoryEntrySchema>) => {
  const parsed = VIDEO_DIRECTOR_CATEGORY_SCHEMAS[entry.categoryId].parse(entry.payload)
  const fields = entry.fields.filter((field) => Object.prototype.hasOwnProperty.call(parsed, field))
  return { ...entry, fields, payload: parsed as Record<string, unknown> }
}

export const createVideoDirectorCategoryRecipe = ({
  project,
  categoryId,
  name,
  description = "",
  parentRecipeId = null,
}: {
  project: VideoDirectorProject
  categoryId: VideoDirectorCategoryId
  name: string
  description?: string
  parentRecipeId?: string | null
}): VideoDirectorRecipe => {
  const validated = VideoDirectorProjectSchema.parse(project)
  const state = validated.categories[categoryId] as {
    payload: Record<string, unknown>
    fieldSources: Record<string, VideoDirectorParameterSource>
  }
  const timestamp = new Date().toISOString()

  return VideoDirectorRecipeSchema.parse({
    schemaVersion: VIDEO_DIRECTOR_RECIPE_SCHEMA_VERSION,
    id: makeId(),
    version: 1,
    name,
    description,
    scope: "category",
    parentRecipeId,
    createdAt: timestamp,
    updatedAt: timestamp,
    categories: [{
      categoryId,
      fields: explicitFields(state.fieldSources, state.payload),
      payload: state.payload,
    }],
    visibility: "private",
    priceCents: null,
  })
}

export const createVideoDirectorProjectRecipe = ({
  project,
  name,
  description = "",
  parentRecipeId = null,
}: {
  project: VideoDirectorProject
  name: string
  description?: string
  parentRecipeId?: string | null
}): VideoDirectorRecipe => {
  const validated = VideoDirectorProjectSchema.parse(project)
  const timestamp = new Date().toISOString()
  const categories = Object.entries(validated.categories).flatMap(([categoryId, rawState]) => {
    const state = rawState as {
      payload: Record<string, unknown>
      fieldSources: Record<string, VideoDirectorParameterSource>
    }
    const fields = explicitFields(state.fieldSources, state.payload)
    const hasExplicit = Object.values(state.fieldSources).some(
      (source) => source !== "auto" && source !== "provider_default",
    )
    if (!hasExplicit) return []
    return [{
      categoryId: categoryId as VideoDirectorCategoryId,
      fields,
      payload: state.payload,
    }]
  })

  if (!categories.length) {
    categories.push({
      categoryId: "concept-direction",
      fields: ["brief"],
      payload: validated.categories["concept-direction"].payload,
    })
  }

  return VideoDirectorRecipeSchema.parse({
    schemaVersion: VIDEO_DIRECTOR_RECIPE_SCHEMA_VERSION,
    id: makeId(),
    version: 1,
    name,
    description,
    scope: "project",
    parentRecipeId,
    createdAt: timestamp,
    updatedAt: timestamp,
    categories,
    visibility: "private",
    priceCents: null,
  })
}

export const applyVideoDirectorRecipe = (
  project: VideoDirectorProject,
  recipeInput: VideoDirectorRecipe,
  options: { forceUserOverrides?: boolean } = {},
): VideoDirectorProject => {
  const recipe = VideoDirectorRecipeSchema.parse(recipeInput)
  const next = structuredClone(VideoDirectorProjectSchema.parse(project))

  for (const rawEntry of recipe.categories) {
    const entry = validateRecipeCategory(rawEntry)
    const state = next.categories[entry.categoryId] as {
      payload: Record<string, unknown>
      fieldSources: Record<string, VideoDirectorParameterSource>
      recipeId?: string
    }

    for (const field of entry.fields) {
      const currentSource = state.fieldSources[field]
      const userOwned =
        currentSource === "user" ||
        currentSource === "shot_override" ||
        currentSource === "variant_override"

      if (userOwned && !options.forceUserOverrides) continue
      state.payload[field] = entry.payload[field]
      state.fieldSources[field] = "recipe"
    }

    state.recipeId = recipe.id
    state.payload = VIDEO_DIRECTOR_CATEGORY_SCHEMAS[entry.categoryId].parse(
      state.payload,
    ) as Record<string, unknown>
  }

  const recipeRef = {
    id: recipe.id,
    version: String(recipe.version),
    label: recipe.name,
    scope: recipe.scope === "project" ? "project" as const : "category" as const,
    categoryIds: recipe.categories.map((entry) => entry.categoryId),
  }

  next.recipes = [
    ...next.recipes.filter((item) => item.id !== recipe.id),
    recipeRef,
  ]
  next.updatedAt = new Date().toISOString()

  return VideoDirectorProjectSchema.parse(next)
}

export const readVideoDirectorRecipeLibrary = (): VideoDirectorRecipe[] => {
  if (!canUseStorage()) return []
  try {
    const raw = JSON.parse(localStorage.getItem(VIDEO_DIRECTOR_RECIPE_LIBRARY_KEY) || "[]")
    if (!Array.isArray(raw)) return []
    return raw.flatMap((entry) => {
      const parsed = VideoDirectorRecipeSchema.safeParse(entry)
      return parsed.success ? [parsed.data] : []
    })
  } catch {
    return []
  }
}

const writeVideoDirectorRecipeLibrary = (recipes: VideoDirectorRecipe[]) => {
  if (!canUseStorage()) return false
  try {
    localStorage.setItem(
      VIDEO_DIRECTOR_RECIPE_LIBRARY_KEY,
      JSON.stringify(recipes),
    )
    return true
  } catch (error) {
    console.warn("[VideoDirector] could not persist recipe library", error)
    return false
  }
}

export const saveVideoDirectorRecipe = (
  recipeInput: VideoDirectorRecipe,
): VideoDirectorRecipe[] => {
  const recipe = VideoDirectorRecipeSchema.parse(recipeInput)
  const existing = readVideoDirectorRecipeLibrary()
  const previous = existing.find((item) => item.id === recipe.id)
  const nextRecipe = previous
    ? VideoDirectorRecipeSchema.parse({
        ...recipe,
        version: Math.max(previous.version + 1, recipe.version),
        createdAt: previous.createdAt,
        updatedAt: new Date().toISOString(),
      })
    : recipe

  const next = previous
    ? existing.map((item) => item.id === recipe.id ? nextRecipe : item)
    : [nextRecipe, ...existing]

  writeVideoDirectorRecipeLibrary(next)
  return next
}

export const removeVideoDirectorRecipe = (recipeId: string): VideoDirectorRecipe[] => {
  const next = readVideoDirectorRecipeLibrary().filter((recipe) => recipe.id !== recipeId)
  writeVideoDirectorRecipeLibrary(next)
  return next
}

export const exportVideoDirectorRecipeJson = (recipe: VideoDirectorRecipe) =>
  JSON.stringify(VideoDirectorRecipeSchema.parse(recipe), null, 2)

export const importVideoDirectorRecipeJson = (json: string) =>
  VideoDirectorRecipeSchema.parse(JSON.parse(json))
