import { z } from "zod"
import {
  AmbienceMixPayloadSchema,
  CameraLensPayloadSchema,
  CameraMovementPayloadSchema,
  CaptionsPayloadSchema,
  ColorPalettePayloadSchema,
  CompositionPayloadSchema,
  ConceptDirectionPayloadSchema,
  ConsistencyContinuityPayloadSchema,
  EmotionTonePayloadSchema,
  FocusDepthPayloadSchema,
  GenerationOutputPayloadSchema,
  GradeExposurePayloadSchema,
  LightingPayloadSchema,
  MusicPayloadSchema,
  NegativeConstraintsPayloadSchema,
  PerspectiveCapturePayloadSchema,
  ReferencesSeedsPayloadSchema,
  ShotStructurePayloadSchema,
  SoundEffectsPayloadSchema,
  SpeedMotionPayloadSchema,
  StickersOverlaysPayloadSchema,
  TextTitlesPayloadSchema,
  TextureFilmPayloadSchema,
  TimingPacingPayloadSchema,
  TransitionsPayloadSchema,
  VideoDirectorCategoryIdSchema,
  VisualEffectsPayloadSchema,
  VisualStylePayloadSchema,
  VoiceDialoguePayloadSchema,
} from "./categorySchemas"
import type { VideoDirectorCategoryId } from "./categorySchemas"

export const VIDEO_DIRECTOR_PROJECT_SCHEMA_VERSION = 1 as const

export const VideoDirectorModeSchema = z.enum(["single", "variations", "sequence", "campaign"])
export type VideoDirectorMode = z.infer<typeof VideoDirectorModeSchema>

export const VideoDirectorParameterSourceSchema = z.enum([
  "auto",
  "user",
  "recipe",
  "ai_directed",
  "shot_override",
  "variant_override",
  "provider_default",
])
export type VideoDirectorParameterSource = z.infer<typeof VideoDirectorParameterSourceSchema>

export const VideoDirectorCategoryStatusSchema = z.enum([
  "empty",
  "mixed",
  "configured",
  "recipe",
  "conflict",
])
export type VideoDirectorCategoryStatus = z.infer<typeof VideoDirectorCategoryStatusSchema>

export const VideoDirectorConflictSchema = z.object({
  id: z.string().trim().min(1),
  code: z.string().trim().min(1),
  message: z.string().trim().min(1),
  severity: z.enum(["warning", "blocking"]).default("warning"),
  fields: z.array(z.string().trim().min(1)).max(32).default([]),
  relatedCategoryIds: z.array(VideoDirectorCategoryIdSchema).max(12).default([]),
}).strict()

const FieldSourcesSchema = z.record(z.string(), VideoDirectorParameterSourceSchema).default({})

const makeCategoryStateSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z.object({
    locked: z.boolean().default(false),
    recipeId: z.string().trim().min(1).optional(),
    fieldSources: FieldSourcesSchema,
    conflicts: z.array(VideoDirectorConflictSchema).max(128).default([]),
    payload: payloadSchema,
  }).strict()

export const VideoDirectorCategoryStateSchemas = {
  "concept-direction": makeCategoryStateSchema(ConceptDirectionPayloadSchema),
  "visual-style": makeCategoryStateSchema(VisualStylePayloadSchema),
  "emotion-tone": makeCategoryStateSchema(EmotionTonePayloadSchema),
  "composition": makeCategoryStateSchema(CompositionPayloadSchema),
  "camera-lens": makeCategoryStateSchema(CameraLensPayloadSchema),
  "camera-movement": makeCategoryStateSchema(CameraMovementPayloadSchema),
  "focus-depth": makeCategoryStateSchema(FocusDepthPayloadSchema),
  "perspective-capture": makeCategoryStateSchema(PerspectiveCapturePayloadSchema),
  "color-palette": makeCategoryStateSchema(ColorPalettePayloadSchema),
  "grade-exposure": makeCategoryStateSchema(GradeExposurePayloadSchema),
  "texture-film": makeCategoryStateSchema(TextureFilmPayloadSchema),
  "lighting": makeCategoryStateSchema(LightingPayloadSchema),
  "timing-pacing": makeCategoryStateSchema(TimingPacingPayloadSchema),
  "shot-structure": makeCategoryStateSchema(ShotStructurePayloadSchema),
  "transitions": makeCategoryStateSchema(TransitionsPayloadSchema),
  "speed-motion": makeCategoryStateSchema(SpeedMotionPayloadSchema),
  "voice-dialogue": makeCategoryStateSchema(VoiceDialoguePayloadSchema),
  "music": makeCategoryStateSchema(MusicPayloadSchema),
  "sound-effects": makeCategoryStateSchema(SoundEffectsPayloadSchema),
  "ambience-mix": makeCategoryStateSchema(AmbienceMixPayloadSchema),
  "captions": makeCategoryStateSchema(CaptionsPayloadSchema),
  "text-titles": makeCategoryStateSchema(TextTitlesPayloadSchema),
  "stickers-overlays": makeCategoryStateSchema(StickersOverlaysPayloadSchema),
  "visual-effects": makeCategoryStateSchema(VisualEffectsPayloadSchema),
  "references-seeds": makeCategoryStateSchema(ReferencesSeedsPayloadSchema),
  "consistency-continuity": makeCategoryStateSchema(ConsistencyContinuityPayloadSchema),
  "negative-constraints": makeCategoryStateSchema(NegativeConstraintsPayloadSchema),
  "generation-output": makeCategoryStateSchema(GenerationOutputPayloadSchema),
} as const

export const VideoDirectorCategoriesSchema = z.object({
  "concept-direction": VideoDirectorCategoryStateSchemas["concept-direction"],
  "visual-style": VideoDirectorCategoryStateSchemas["visual-style"],
  "emotion-tone": VideoDirectorCategoryStateSchemas["emotion-tone"],
  "composition": VideoDirectorCategoryStateSchemas["composition"],
  "camera-lens": VideoDirectorCategoryStateSchemas["camera-lens"],
  "camera-movement": VideoDirectorCategoryStateSchemas["camera-movement"],
  "focus-depth": VideoDirectorCategoryStateSchemas["focus-depth"],
  "perspective-capture": VideoDirectorCategoryStateSchemas["perspective-capture"],
  "color-palette": VideoDirectorCategoryStateSchemas["color-palette"],
  "grade-exposure": VideoDirectorCategoryStateSchemas["grade-exposure"],
  "texture-film": VideoDirectorCategoryStateSchemas["texture-film"],
  "lighting": VideoDirectorCategoryStateSchemas["lighting"],
  "timing-pacing": VideoDirectorCategoryStateSchemas["timing-pacing"],
  "shot-structure": VideoDirectorCategoryStateSchemas["shot-structure"],
  "transitions": VideoDirectorCategoryStateSchemas["transitions"],
  "speed-motion": VideoDirectorCategoryStateSchemas["speed-motion"],
  "voice-dialogue": VideoDirectorCategoryStateSchemas["voice-dialogue"],
  "music": VideoDirectorCategoryStateSchemas["music"],
  "sound-effects": VideoDirectorCategoryStateSchemas["sound-effects"],
  "ambience-mix": VideoDirectorCategoryStateSchemas["ambience-mix"],
  "captions": VideoDirectorCategoryStateSchemas["captions"],
  "text-titles": VideoDirectorCategoryStateSchemas["text-titles"],
  "stickers-overlays": VideoDirectorCategoryStateSchemas["stickers-overlays"],
  "visual-effects": VideoDirectorCategoryStateSchemas["visual-effects"],
  "references-seeds": VideoDirectorCategoryStateSchemas["references-seeds"],
  "consistency-continuity": VideoDirectorCategoryStateSchemas["consistency-continuity"],
  "negative-constraints": VideoDirectorCategoryStateSchemas["negative-constraints"],
  "generation-output": VideoDirectorCategoryStateSchemas["generation-output"],
}).strict()

export const VideoDirectorCategoryOverridesSchema = z.object({
  "concept-direction": VideoDirectorCategoryStateSchemas["concept-direction"].optional(),
  "visual-style": VideoDirectorCategoryStateSchemas["visual-style"].optional(),
  "emotion-tone": VideoDirectorCategoryStateSchemas["emotion-tone"].optional(),
  "composition": VideoDirectorCategoryStateSchemas["composition"].optional(),
  "camera-lens": VideoDirectorCategoryStateSchemas["camera-lens"].optional(),
  "camera-movement": VideoDirectorCategoryStateSchemas["camera-movement"].optional(),
  "focus-depth": VideoDirectorCategoryStateSchemas["focus-depth"].optional(),
  "perspective-capture": VideoDirectorCategoryStateSchemas["perspective-capture"].optional(),
  "color-palette": VideoDirectorCategoryStateSchemas["color-palette"].optional(),
  "grade-exposure": VideoDirectorCategoryStateSchemas["grade-exposure"].optional(),
  "texture-film": VideoDirectorCategoryStateSchemas["texture-film"].optional(),
  "lighting": VideoDirectorCategoryStateSchemas["lighting"].optional(),
  "timing-pacing": VideoDirectorCategoryStateSchemas["timing-pacing"].optional(),
  "shot-structure": VideoDirectorCategoryStateSchemas["shot-structure"].optional(),
  "transitions": VideoDirectorCategoryStateSchemas["transitions"].optional(),
  "speed-motion": VideoDirectorCategoryStateSchemas["speed-motion"].optional(),
  "voice-dialogue": VideoDirectorCategoryStateSchemas["voice-dialogue"].optional(),
  "music": VideoDirectorCategoryStateSchemas["music"].optional(),
  "sound-effects": VideoDirectorCategoryStateSchemas["sound-effects"].optional(),
  "ambience-mix": VideoDirectorCategoryStateSchemas["ambience-mix"].optional(),
  "captions": VideoDirectorCategoryStateSchemas["captions"].optional(),
  "text-titles": VideoDirectorCategoryStateSchemas["text-titles"].optional(),
  "stickers-overlays": VideoDirectorCategoryStateSchemas["stickers-overlays"].optional(),
  "visual-effects": VideoDirectorCategoryStateSchemas["visual-effects"].optional(),
  "references-seeds": VideoDirectorCategoryStateSchemas["references-seeds"].optional(),
  "consistency-continuity": VideoDirectorCategoryStateSchemas["consistency-continuity"].optional(),
  "negative-constraints": VideoDirectorCategoryStateSchemas["negative-constraints"].optional(),
  "generation-output": VideoDirectorCategoryStateSchemas["generation-output"].optional(),
}).strict()

export type VideoDirectorCategories = z.infer<typeof VideoDirectorCategoriesSchema>
export type VideoDirectorCategoryOverrides = z.infer<typeof VideoDirectorCategoryOverridesSchema>

export const VideoDirectorAssetSchema = z.object({
  id: z.string().trim().min(1),
  kind: z.enum(["image", "video", "audio", "svg", "mask", "depth", "document"]),
  source: z.enum(["upload", "vault", "generated", "external"]),
  name: z.string().max(500).default(""),
  uri: z.string().max(8_000).optional(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/i).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).strict()

export const VideoDirectorShotSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  order: z.number().int().min(0),
  enabled: z.boolean().default(true),
  startSeconds: z.number().min(0).default(0),
  durationSeconds: z.number().min(0.05).max(3_600).default(2),
  description: z.string().max(8_000).default(""),
  startFrameAssetId: z.string().trim().min(1).optional(),
  endFrameAssetId: z.string().trim().min(1).optional(),
  categoryOverrides: VideoDirectorCategoryOverridesSchema.default({}),
}).strict()

export const VideoDirectorVariantSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  enabled: z.boolean().default(true),
  variationStrength: z.enum(["subtle", "balanced", "radical"]).default("balanced"),
  allowedCategories: z.array(VideoDirectorCategoryIdSchema).max(28).default([]),
  categoryOverrides: VideoDirectorCategoryOverridesSchema.default({}),
}).strict()

export const VideoDirectorRecipeRefSchema = z.object({
  id: z.string().trim().min(1),
  version: z.string().trim().min(1),
  label: z.string().trim().min(1),
  scope: z.enum(["project", "category", "shot", "camera", "color", "audio", "caption", "transition"]),
  categoryIds: z.array(VideoDirectorCategoryIdSchema).max(28).default([]),
}).strict()

export const VideoDirectorGenerationJobSchema = z.object({
  id: z.string().trim().min(1),
  shotId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  idempotencyKey: z.string().trim().min(16),
  status: z.enum(["planned", "queued", "running", "post-processing", "completed", "failed", "cancelled"]).default("planned"),
  providerId: z.string().trim().min(1).optional(),
  modelId: z.string().trim().min(1).optional(),
  providerJobId: z.string().trim().min(1).optional(),
  estimatedCredits: z.number().min(0).optional(),
  actualCredits: z.number().min(0).optional(),
  outputAssetIds: z.array(z.string().trim().min(1)).default([]),
  errorCode: z.string().max(300).optional(),
  errorMessage: z.string().max(4_000).optional(),
}).strict()

export const VideoDirectorProjectSchema = z.object({
  schemaVersion: z.literal(VIDEO_DIRECTOR_PROJECT_SCHEMA_VERSION),
  id: z.string().trim().min(1),
  name: z.string().max(500).default("Untitled Video Director project"),
  contentBuildId: z.string().trim().min(1).optional(),
  legacyProjectId: z.string().trim().min(1).optional(),
  mode: VideoDirectorModeSchema.default("single"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activeCategoryId: VideoDirectorCategoryIdSchema.default("concept-direction"),
  categories: VideoDirectorCategoriesSchema,
  shots: z.array(VideoDirectorShotSchema).max(256).default([]),
  variants: z.array(VideoDirectorVariantSchema).max(24).default([]),
  assets: z.array(VideoDirectorAssetSchema).max(4_096).default([]),
  recipes: z.array(VideoDirectorRecipeRefSchema).max(256).default([]),
  jobs: z.array(VideoDirectorGenerationJobSchema).max(4_096).default([]),
}).strict()

export type VideoDirectorProject = z.infer<typeof VideoDirectorProjectSchema>

const defaultCategoryState = <T extends z.ZodTypeAny>(schema: T) => ({
  locked: false,
  fieldSources: {},
  conflicts: [],
  payload: schema.parse({}),
})

export const createDefaultVideoDirectorCategories = (): VideoDirectorCategories =>
  VideoDirectorCategoriesSchema.parse({
    "concept-direction": defaultCategoryState(ConceptDirectionPayloadSchema),
    "visual-style": defaultCategoryState(VisualStylePayloadSchema),
    "emotion-tone": defaultCategoryState(EmotionTonePayloadSchema),
    "composition": defaultCategoryState(CompositionPayloadSchema),
    "camera-lens": defaultCategoryState(CameraLensPayloadSchema),
    "camera-movement": defaultCategoryState(CameraMovementPayloadSchema),
    "focus-depth": defaultCategoryState(FocusDepthPayloadSchema),
    "perspective-capture": defaultCategoryState(PerspectiveCapturePayloadSchema),
    "color-palette": defaultCategoryState(ColorPalettePayloadSchema),
    "grade-exposure": defaultCategoryState(GradeExposurePayloadSchema),
    "texture-film": defaultCategoryState(TextureFilmPayloadSchema),
    "lighting": defaultCategoryState(LightingPayloadSchema),
    "timing-pacing": defaultCategoryState(TimingPacingPayloadSchema),
    "shot-structure": defaultCategoryState(ShotStructurePayloadSchema),
    "transitions": defaultCategoryState(TransitionsPayloadSchema),
    "speed-motion": defaultCategoryState(SpeedMotionPayloadSchema),
    "voice-dialogue": defaultCategoryState(VoiceDialoguePayloadSchema),
    "music": defaultCategoryState(MusicPayloadSchema),
    "sound-effects": defaultCategoryState(SoundEffectsPayloadSchema),
    "ambience-mix": defaultCategoryState(AmbienceMixPayloadSchema),
    "captions": defaultCategoryState(CaptionsPayloadSchema),
    "text-titles": defaultCategoryState(TextTitlesPayloadSchema),
    "stickers-overlays": defaultCategoryState(StickersOverlaysPayloadSchema),
    "visual-effects": defaultCategoryState(VisualEffectsPayloadSchema),
    "references-seeds": defaultCategoryState(ReferencesSeedsPayloadSchema),
    "consistency-continuity": defaultCategoryState(ConsistencyContinuityPayloadSchema),
    "negative-constraints": defaultCategoryState(NegativeConstraintsPayloadSchema),
    "generation-output": defaultCategoryState(GenerationOutputPayloadSchema),
  })

const makeId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`}`

export const createEmptyVideoDirectorProject = (
  name = "Untitled Video Director project",
): VideoDirectorProject => {
  const timestamp = new Date().toISOString()
  return VideoDirectorProjectSchema.parse({
    schemaVersion: VIDEO_DIRECTOR_PROJECT_SCHEMA_VERSION,
    id: makeId("vtd"),
    name,
    mode: "single",
    createdAt: timestamp,
    updatedAt: timestamp,
    activeCategoryId: "concept-direction",
    categories: createDefaultVideoDirectorCategories(),
    shots: [],
    variants: [],
    assets: [],
    recipes: [],
    jobs: [],
  })
}

export const deriveVideoDirectorCategoryStatus = (
  state: {
    recipeId?: string
    fieldSources: Record<string, VideoDirectorParameterSource>
    conflicts: readonly unknown[]
  },
): VideoDirectorCategoryStatus => {
  if (state.conflicts.length > 0) return "conflict"

  const sources = Object.values(state.fieldSources)
  if (sources.length === 0 || sources.every((source) => source === "auto" || source === "provider_default")) {
    return "empty"
  }

  if (state.recipeId && sources.every((source) => source === "recipe")) {
    return "recipe"
  }

  const hasAutomatic = sources.some((source) => source === "auto" || source === "provider_default")
  const hasExplicit = sources.some((source) =>
    source === "user" ||
    source === "recipe" ||
    source === "ai_directed" ||
    source === "shot_override" ||
    source === "variant_override",
  )

  if (hasAutomatic && hasExplicit) return "mixed"
  return "configured"
}

export const parseVideoDirectorProject = (value: unknown): VideoDirectorProject =>
  VideoDirectorProjectSchema.parse(value)

export const safeParseVideoDirectorProject = (value: unknown) =>
  VideoDirectorProjectSchema.safeParse(value)

export const parseVideoDirectorCategoryState = <K extends VideoDirectorCategoryId>(
  categoryId: K,
  value: unknown,
) => VideoDirectorCategoryStateSchemas[categoryId].parse(value)
