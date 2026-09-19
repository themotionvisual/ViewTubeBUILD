import {
  VIDEO_DIRECTOR_CATEGORY_SCHEMAS,
  type VideoDirectorCategoryId,
} from "./categorySchemas"
import {
  VideoDirectorCategoryStateSchemas,
  VideoDirectorProjectSchema,
  type VideoDirectorCategories,
  type VideoDirectorParameterSource,
  type VideoDirectorProject,
} from "./projectSchema"

export type VideoDirectorScope =
  | { type: "project" }
  | { type: "shot"; id: string }
  | { type: "variant"; id: string }

export const PROJECT_VIDEO_DIRECTOR_SCOPE: VideoDirectorScope = Object.freeze({ type: "project" })

const sourceForScope = (
  scope: VideoDirectorScope,
): VideoDirectorParameterSource =>
  scope.type === "shot"
    ? "shot_override"
    : scope.type === "variant"
      ? "variant_override"
      : "user"

const scopedNode = (
  project: VideoDirectorProject,
  scope: VideoDirectorScope,
) => {
  if (scope.type === "shot") {
    return project.shots.find((shot) => shot.id === scope.id) ?? null
  }
  if (scope.type === "variant") {
    return project.variants.find((variant) => variant.id === scope.id) ?? null
  }
  return null
}

const hasScopedField = (
  state: { fieldSources: Record<string, VideoDirectorParameterSource> },
  field: string,
  scope: VideoDirectorScope,
) =>
  scope.type === "shot"
    ? state.fieldSources[field] === "shot_override"
    : scope.type === "variant"
      ? state.fieldSources[field] === "variant_override"
      : false

/**
 * Resolve the effective category state at a scope without freezing inherited
 * fields. Override payloads are full schema snapshots for validation, but only
 * fields explicitly marked shot_override / variant_override replace project
 * values at read time.
 */
export const resolveVideoDirectorScopedCategoryState = <K extends VideoDirectorCategoryId>(
  projectInput: VideoDirectorProject,
  categoryId: K,
  scope: VideoDirectorScope,
): VideoDirectorCategories[K] => {
  const project = VideoDirectorProjectSchema.parse(projectInput)
  const base = structuredClone(project.categories[categoryId])

  if (scope.type === "project") return base

  const node = scopedNode(project, scope)
  const override = node?.categoryOverrides?.[categoryId] as VideoDirectorCategories[K] | undefined
  if (!override) return base

  const basePayload = base.payload as Record<string, unknown>
  const overridePayload = override.payload as Record<string, unknown>
  const mergedPayload = { ...basePayload }

  for (const field of Object.keys(overridePayload)) {
    if (hasScopedField(override, field, scope)) {
      mergedPayload[field] = overridePayload[field]
      base.fieldSources[field] = override.fieldSources[field]
    }
  }

  base.payload = VIDEO_DIRECTOR_CATEGORY_SCHEMAS[categoryId].parse(
    mergedPayload,
  ) as VideoDirectorCategories[K]["payload"]
  base.locked = override.locked || base.locked
  base.conflicts = [...base.conflicts, ...override.conflicts]

  return VideoDirectorCategoryStateSchemas[categoryId].parse(base) as VideoDirectorCategories[K]
}

export const setVideoDirectorScopedCategoryField = <K extends VideoDirectorCategoryId>({
  project: projectInput,
  categoryId,
  field,
  value,
  scope,
}: {
  project: VideoDirectorProject
  categoryId: K
  field: string
  value: unknown
  scope: VideoDirectorScope
}): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))

  if (scope.type === "project") {
    const state = project.categories[categoryId] as {
      payload: Record<string, unknown>
      fieldSources: Record<string, VideoDirectorParameterSource>
    }
    state.payload[field] = value
    state.fieldSources[field] = "user"
    state.payload = VIDEO_DIRECTOR_CATEGORY_SCHEMAS[categoryId].parse(
      state.payload,
    ) as Record<string, unknown>
    project.updatedAt = new Date().toISOString()
    return VideoDirectorProjectSchema.parse(project)
  }

  const node = scopedNode(project, scope)
  if (!node) {
    throw new Error(
      scope.type === "shot"
        ? `Shot ${scope.id} does not exist.`
        : `Variant ${scope.id} does not exist.`,
    )
  }

  const existing = node.categoryOverrides[categoryId]
  const base = existing
    ? structuredClone(existing)
    : structuredClone(project.categories[categoryId])

  const state = base as {
    payload: Record<string, unknown>
    fieldSources: Record<string, VideoDirectorParameterSource>
  }
  state.payload[field] = value
  state.fieldSources[field] = sourceForScope(scope)
  state.payload = VIDEO_DIRECTOR_CATEGORY_SCHEMAS[categoryId].parse(
    state.payload,
  ) as Record<string, unknown>

  ;(node.categoryOverrides as Record<string, unknown>)[categoryId] =
    VideoDirectorCategoryStateSchemas[categoryId].parse(state)

  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}

export const toggleVideoDirectorScopedCategoryLock = ({
  project: projectInput,
  categoryId,
  scope,
}: {
  project: VideoDirectorProject
  categoryId: VideoDirectorCategoryId
  scope: VideoDirectorScope
}): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))

  if (scope.type === "project") {
    project.categories[categoryId].locked = !project.categories[categoryId].locked
    project.updatedAt = new Date().toISOString()
    return VideoDirectorProjectSchema.parse(project)
  }

  const node = scopedNode(project, scope)
  if (!node) return project

  const existing = node.categoryOverrides[categoryId]
  const state = existing
    ? structuredClone(existing)
    : structuredClone(project.categories[categoryId])
  state.locked = !state.locked
  ;(node.categoryOverrides as Record<string, unknown>)[categoryId] =
    VideoDirectorCategoryStateSchemas[categoryId].parse(state)
  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}

export const resetVideoDirectorScopedCategory = ({
  project: projectInput,
  categoryId,
  scope,
}: {
  project: VideoDirectorProject
  categoryId: VideoDirectorCategoryId
  scope: VideoDirectorScope
}): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))
  if (scope.type === "project") {
    throw new Error("Project reset must use the canonical default category state.")
  }

  const node = scopedNode(project, scope)
  if (!node) return project
  delete node.categoryOverrides[categoryId]
  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}

export const listVideoDirectorScopeOptions = (
  projectInput: VideoDirectorProject,
): Array<{ key: string; label: string; scope: VideoDirectorScope }> => {
  const project = VideoDirectorProjectSchema.parse(projectInput)
  return [
    { key: "project", label: "PROJECT", scope: { type: "project" } },
    ...project.shots.map((shot, index) => ({
      key: `shot:${shot.id}`,
      label: `SHOT ${String(index + 1).padStart(2, "0")} · ${shot.label}`,
      scope: { type: "shot" as const, id: shot.id },
    })),
    ...project.variants.map((variant, index) => ({
      key: `variant:${variant.id}`,
      label: `VARIANT ${String.fromCharCode(65 + index)} · ${variant.label}`,
      scope: { type: "variant" as const, id: variant.id },
    })),
  ]
}

export const parseVideoDirectorScopeKey = (
  key: string,
  project: VideoDirectorProject,
): VideoDirectorScope => {
  if (key === "project") return { type: "project" }
  const [type, id] = key.split(":", 2)
  if (type === "shot" && project.shots.some((shot) => shot.id === id)) {
    return { type: "shot", id }
  }
  if (type === "variant" && project.variants.some((variant) => variant.id === id)) {
    return { type: "variant", id }
  }
  return { type: "project" }
}
