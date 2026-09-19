import {
  VIDEO_DIRECTOR_CATEGORY_SCHEMAS,
  type VideoDirectorCategoryId,
} from "./categorySchemas"
import {
  VideoDirectorProjectSchema,
  type VideoDirectorParameterSource,
  type VideoDirectorProject,
} from "./projectSchema"

export interface VideoDirectorSuggestionPatch {
  categoryId: VideoDirectorCategoryId
  field: string
  value: unknown
}

export interface VideoDirectorSuggestion {
  id: string
  title: string
  reason: string
  sourceCategoryId: VideoDirectorCategoryId
  targetCategoryIds: VideoDirectorCategoryId[]
  priority: "low" | "medium" | "high"
  patches: VideoDirectorSuggestionPatch[]
}

const suggestion = (
  value: Omit<VideoDirectorSuggestion, "id"> & { id?: string },
): VideoDirectorSuggestion => ({
  ...value,
  id: value.id || `${value.sourceCategoryId}:${value.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
})

export const evaluateVideoDirectorSuggestions = (
  projectInput: VideoDirectorProject,
): VideoDirectorSuggestion[] => {
  const project = VideoDirectorProjectSchema.parse(projectInput)
  const output = project.categories["generation-output"].payload
  const composition = project.categories.composition.payload
  const perspective = project.categories["perspective-capture"].payload
  const movement = project.categories["camera-movement"].payload
  const style = project.categories["visual-style"].payload
  const texture = project.categories["texture-film"].payload
  const emotion = project.categories["emotion-tone"].payload
  const music = project.categories.music.payload
  const structure = project.categories["shot-structure"].payload
  const transitions = project.categories.transitions.payload
  const captions = project.categories.captions.payload
  const concept = project.categories["concept-direction"].payload
  const suggestions: VideoDirectorSuggestion[] = []

  if (
    output.aspectRatio === "9:16" &&
    (composition.framing === "auto" || composition.framing === "thirds")
  ) {
    suggestions.push(suggestion({
      title: "Center portrait framing",
      reason: "9:16 output benefits from a centered subject and explicit safe zones before generation or crop conversion.",
      sourceCategoryId: "generation-output",
      targetCategoryIds: ["composition"],
      priority: "high",
      patches: [
        { categoryId: "composition", field: "framing", value: "centered" },
        { categoryId: "composition", field: "subjectX", value: 0.5 },
        { categoryId: "composition", field: "safeZones", value: true },
      ],
    }))
  }

  if (perspective.rig === "drone" && movement.type !== "drone") {
    suggestions.push(suggestion({
      title: "Match drone movement",
      reason: "Drone capture is selected while the camera movement language is not currently set to drone.",
      sourceCategoryId: "perspective-capture",
      targetCategoryIds: ["camera-movement"],
      priority: "medium",
      patches: [
        { categoryId: "camera-movement", field: "type", value: "drone" },
        { categoryId: "camera-movement", field: "stabilization", value: 0.9 },
      ],
    }))
  }

  if (perspective.rig === "phone-pov") {
    const captureFamily = project.categories["camera-lens"].payload.captureFamily
    if (captureFamily !== "phone") {
      suggestions.push(suggestion({
        title: "Match phone capture",
        reason: "Phone POV is selected, so a phone capture family will make lens and distortion planning more coherent.",
        sourceCategoryId: "perspective-capture",
        targetCategoryIds: ["camera-lens"],
        priority: "medium",
        patches: [
          { categoryId: "camera-lens", field: "captureFamily", value: "phone" },
          { categoryId: "camera-lens", field: "focalLengthMm", value: 24 },
        ],
      }))
    }
  }

  if (style.medium === "archival" && texture.grain < 12) {
    suggestions.push(suggestion({
      title: "Add archival texture",
      reason: "Archival visual style is active but the film texture is still nearly clean.",
      sourceCategoryId: "visual-style",
      targetCategoryIds: ["texture-film", "grade-exposure"],
      priority: "medium",
      patches: [
        { categoryId: "texture-film", field: "grain", value: 22 },
        { categoryId: "texture-film", field: "dust", value: 8 },
        { categoryId: "texture-film", field: "filmStock", value: "Archival Newsreel" },
        { categoryId: "grade-exposure", field: "saturation", value: 78 },
      ],
    }))
  }

  if (emotion.energeticVsCalm > 0.45 && music.enabled && music.intensity < 0.65) {
    suggestions.push(suggestion({
      title: "Raise score intensity",
      reason: "The emotional direction is highly energetic while the enabled music intensity is comparatively low.",
      sourceCategoryId: "emotion-tone",
      targetCategoryIds: ["music"],
      priority: "low",
      patches: [
        { categoryId: "music", field: "intensity", value: 0.75 },
        { categoryId: "music", field: "beatSync", value: "auto" },
      ],
    }))
  }

  if (
    structure.mode === "single-take" &&
    (transitions.defaultType !== "cut" || transitions.durationFrames !== 0)
  ) {
    suggestions.push(suggestion({
      title: "Clear unused transitions",
      reason: "A single continuous take does not need between-shot transition timing.",
      sourceCategoryId: "shot-structure",
      targetCategoryIds: ["transitions"],
      priority: "high",
      patches: [
        { categoryId: "transitions", field: "defaultType", value: "cut" },
        { categoryId: "transitions", field: "durationFrames", value: 0 },
      ],
    }))
  }

  if (
    concept.targetPlatform === "youtube-shorts" &&
    output.aspectRatio !== "9:16"
  ) {
    suggestions.push(suggestion({
      title: "Use vertical output",
      reason: "The project is targeted at YouTube Shorts but the current generation ratio is not vertical.",
      sourceCategoryId: "concept-direction",
      targetCategoryIds: ["generation-output", "composition"],
      priority: "high",
      patches: [
        { categoryId: "generation-output", field: "aspectRatio", value: "9:16" },
        { categoryId: "composition", field: "safeZones", value: true },
      ],
    }))
  }

  if (captions.enabled && output.aspectRatio === "9:16" && captions.position === "bottom") {
    suggestions.push(suggestion({
      title: "Lift vertical captions",
      reason: "Bottom captions on 9:16 output can collide with platform UI; lower-third placement is safer.",
      sourceCategoryId: "captions",
      targetCategoryIds: ["captions"],
      priority: "medium",
      patches: [
        { categoryId: "captions", field: "position", value: "lower-third" },
      ],
    }))
  }

  return suggestions
}

const isUserOwnedSource = (source: VideoDirectorParameterSource | undefined) =>
  source === "user" || source === "shot_override" || source === "variant_override"

export const applyVideoDirectorSuggestion = (
  projectInput: VideoDirectorProject,
  item: VideoDirectorSuggestion,
  options: { forceUserOverrides?: boolean } = {},
): VideoDirectorProject => {
  const project = structuredClone(VideoDirectorProjectSchema.parse(projectInput))

  for (const patch of item.patches) {
    const state = project.categories[patch.categoryId] as {
      payload: Record<string, unknown>
      fieldSources: Record<string, VideoDirectorParameterSource>
    }
    const currentSource = state.fieldSources[patch.field]
    if (isUserOwnedSource(currentSource) && !options.forceUserOverrides) continue

    state.payload[patch.field] = patch.value
    state.fieldSources[patch.field] = "ai_directed"
    state.payload = VIDEO_DIRECTOR_CATEGORY_SCHEMAS[patch.categoryId].parse(
      state.payload,
    ) as Record<string, unknown>
  }

  project.updatedAt = new Date().toISOString()
  return VideoDirectorProjectSchema.parse(project)
}
