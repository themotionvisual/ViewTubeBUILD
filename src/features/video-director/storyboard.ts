import {
  VideoDirectorProjectSchema,
  type VideoDirectorProject,
  type VideoDirectorShotSchema,
  type VideoDirectorVariantSchema,
} from "./projectSchema"

const makeId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`}`

export const createVideoDirectorShot = ({
  label,
  order,
  startSeconds,
  durationSeconds,
  description = "",
}: {
  label: string
  order: number
  startSeconds: number
  durationSeconds: number
  description?: string
}) => ({
  id: makeId("shot"),
  label,
  order,
  enabled: true,
  startSeconds,
  durationSeconds,
  description,
  categoryOverrides: {},
})

export const buildVideoDirectorStoryboard = (
  projectInput: VideoDirectorProject,
): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))
  const structure = project.categories["shot-structure"].payload
  const totalDuration = project.categories["timing-pacing"].payload.durationSeconds
  const count = structure.mode === "single-take" ? 1 : Math.max(1, structure.shotCount)
  const duration = Math.max(0.25, totalDuration / count)

  const existing = [...project.shots].sort((a, b) => a.order - b.order)
  const shots = Array.from({ length: count }, (_, index) => {
    const previous = existing[index]
    if (previous) {
      return {
        ...previous,
        order: index,
        startSeconds: Number((index * duration).toFixed(3)),
        durationSeconds: Number(
          (index === count - 1 ? totalDuration - index * duration : duration).toFixed(3),
        ),
      }
    }
    return createVideoDirectorShot({
      label: `Shot ${String(index + 1).padStart(2, "0")}`,
      order: index,
      startSeconds: Number((index * duration).toFixed(3)),
      durationSeconds: Number(
        (index === count - 1 ? totalDuration - index * duration : duration).toFixed(3),
      ),
    })
  })

  project.shots = shots
  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}

export const reorderVideoDirectorShot = (
  projectInput: VideoDirectorProject,
  shotId: string,
  direction: -1 | 1,
): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))
  const ordered = [...project.shots].sort((a, b) => a.order - b.order)
  const index = ordered.findIndex((shot) => shot.id === shotId)
  const target = index + direction
  if (index < 0 || target < 0 || target >= ordered.length) return project

  ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
  project.shots = ordered.map((shot, order) => ({ ...shot, order }))
  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}

export const removeVideoDirectorShot = (
  projectInput: VideoDirectorProject,
  shotId: string,
): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))
  project.shots = project.shots
    .filter((shot) => shot.id !== shotId)
    .sort((a, b) => a.order - b.order)
    .map((shot, order) => ({ ...shot, order }))
  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}

export const duplicateVideoDirectorShot = (
  projectInput: VideoDirectorProject,
  shotId: string,
): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))
  const ordered = [...project.shots].sort((a, b) => a.order - b.order)
  const index = ordered.findIndex((shot) => shot.id === shotId)
  if (index < 0) return project

  const source = ordered[index]
  const copy = {
    ...structuredClone(source),
    id: makeId("shot"),
    label: `${source.label} Copy`,
    order: index + 1,
  }
  ordered.splice(index + 1, 0, copy)
  project.shots = ordered.map((shot, order) => ({ ...shot, order }))
  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}

export const ensureVideoDirectorVariants = (
  projectInput: VideoDirectorProject,
  count: number,
): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))
  const safeCount = Math.max(0, Math.min(24, Math.trunc(count)))
  const existing = project.variants

  project.variants = Array.from({ length: safeCount }, (_, index) => {
    if (existing[index]) return existing[index]
    return {
      id: makeId("variant"),
      label: `Variant ${String.fromCharCode(65 + index)}`,
      enabled: true,
      variationStrength: project.categories["concept-direction"].payload.variationStrength,
      allowedCategories: [],
      categoryOverrides: {},
    }
  })

  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}
