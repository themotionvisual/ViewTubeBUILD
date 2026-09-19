import { z } from "zod"

export const VideoDirectorCategoryIdSchema = z.enum([
  "concept-direction",
  "visual-style",
  "emotion-tone",
  "composition",
  "camera-lens",
  "camera-movement",
  "focus-depth",
  "perspective-capture",
  "color-palette",
  "grade-exposure",
  "texture-film",
  "lighting",
  "timing-pacing",
  "shot-structure",
  "transitions",
  "speed-motion",
  "voice-dialogue",
  "music",
  "sound-effects",
  "ambience-mix",
  "captions",
  "text-titles",
  "stickers-overlays",
  "visual-effects",
  "references-seeds",
  "consistency-continuity",
  "negative-constraints",
  "generation-output",
])

export type VideoDirectorCategoryId = z.infer<typeof VideoDirectorCategoryIdSchema>

const unitInterval = z.number().min(0).max(1)
const normalizedAxis = z.number().min(-1).max(1)
const percentage = z.number().min(0).max(100)
const degrees = z.number().min(-360).max(360)
const seconds = z.number().min(0).max(86_400)
const nonEmptyString = z.string().trim().min(1)
const optionalNonEmptyString = nonEmptyString.optional()
const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Expected a 6-digit hex color")
const TimelinePointSchema = z.object({
  t: z.number().min(0).max(1),
  value: unitInterval,
}).strict()

export const ConceptDirectionPayloadSchema = z.object({
  brief: z.string().max(20_000).default(""),
  objective: z.string().max(500).default(""),
  audience: z.string().max(500).default(""),
  callToAction: z.string().max(500).default(""),
  treatment: z.string().max(6_000).default(""),
  conceptCount: z.number().int().min(1).max(12).default(1),
  variationStrength: z.enum(["subtle", "balanced", "radical"]).default("balanced"),
  targetPlatform: z.enum(["youtube", "youtube-shorts", "multi-platform", "custom"]).default("youtube"),
}).strict()

export const VisualStylePayloadSchema = z.object({
  mode: z.enum(["auto", "recipe", "custom"]).default("auto"),
  recipeIds: z.array(nonEmptyString).max(12).default([]),
  descriptors: z.array(nonEmptyString).max(32).default([]),
  realism: unitInterval.default(0.8),
  stylization: unitInterval.default(0.2),
  period: z.string().max(200).default(""),
  medium: z.enum(["auto", "cinematic", "documentary", "commercial", "animation", "illustration", "archival", "experimental"]).default("auto"),
}).strict()

export const EmotionTonePayloadSchema = z.object({
  triumphantVsSomber: normalizedAxis.default(0),
  energeticVsCalm: normalizedAxis.default(0),
  warmth: normalizedAxis.default(0),
  tension: unitInterval.default(0.5),
  intensity: unitInterval.default(0.5),
  descriptors: z.array(nonEmptyString).max(24).default([]),
}).strict()

export const CompositionPayloadSchema = z.object({
  shotScale: z.enum(["auto", "extreme-wide", "wide", "full", "medium", "medium-close", "close", "extreme-close"]).default("auto"),
  framing: z.enum(["auto", "thirds", "centered", "symmetrical", "negative-space", "leading-lines", "custom"]).default("auto"),
  subjectX: unitInterval.default(0.5),
  subjectY: unitInterval.default(0.5),
  horizonY: unitInterval.default(0.5),
  headroom: unitInterval.default(0.5),
  leadRoom: unitInterval.default(0.5),
  safeZones: z.boolean().default(true),
}).strict()

export const CameraLensPayloadSchema = z.object({
  captureFamily: z.enum(["auto", "cinema", "full-frame", "super35", "medium-format", "phone", "action-camera", "vintage-video"]).default("auto"),
  focalLengthMm: z.number().min(1).max(1200).default(35),
  aperture: z.number().min(0.7).max(64).default(4),
  anamorphicSqueeze: z.number().min(1).max(2.5).default(1),
  distortion: normalizedAxis.default(0),
  fisheye: unitInterval.default(0),
  macro: unitInterval.default(0),
  telephotoCompression: unitInterval.default(0),
}).strict()

export const CameraMovementPayloadSchema = z.object({
  type: z.enum(["auto", "static", "pan", "tilt", "dolly", "truck", "pedestal", "orbit", "crane", "drone", "handheld", "steadicam", "pov"]).default("auto"),
  speed: unitInterval.default(0.35),
  distanceMeters: z.number().min(0).max(10_000).default(0),
  panDegrees: degrees.default(0),
  tiltDegrees: z.number().min(-180).max(180).default(0),
  rollDegrees: z.number().min(-180).max(180).default(0),
  orbitDegrees: degrees.default(0),
  stabilization: unitInterval.default(0.8),
  shake: unitInterval.default(0),
}).strict()

export const FocusDepthPayloadSchema = z.object({
  mode: z.enum(["auto", "deep", "shallow", "subject-lock", "rack-focus", "custom"]).default("auto"),
  focusDistanceMeters: z.number().min(0.05).max(100_000).default(5),
  rackFocusEndMeters: z.number().min(0.05).max(100_000).optional(),
  depthStrength: unitInterval.default(0.5),
  bokeh: unitInterval.default(0.4),
  focusBreathing: unitInterval.default(0),
}).strict()

export const PerspectiveCapturePayloadSchema = z.object({
  rig: z.enum(["auto", "tripod", "shoulder", "phone-pov", "security-camera", "drone", "bodycam", "dashcam", "webcam", "action-camera", "helmet-cam"]).default("auto"),
  cameraHeightMeters: z.number().min(0).max(10_000).default(1.6),
  pitchDegrees: z.number().min(-90).max(90).default(0),
  yawDegrees: z.number().min(-180).max(180).default(0),
  rollDegrees: z.number().min(-180).max(180).default(0),
  fieldOfViewDegrees: z.number().min(1).max(179).default(55),
  firstPerson: z.boolean().default(false),
}).strict()

export const ColorPalettePayloadSchema = z.object({
  colors: z.array(HexColorSchema).min(1).max(8).default(["#6E7F8D", "#C8B38B", "#ECE6D7"]),
  exactLock: z.boolean().default(false),
  dominantColor: HexColorSchema.optional(),
  dominance: unitInterval.default(0.5),
  extractedFromAssetId: optionalNonEmptyString,
}).strict()

export const GradeExposurePayloadSchema = z.object({
  exposureEv: z.number().min(-5).max(5).default(0),
  contrast: z.number().min(-100).max(100).default(0),
  highlights: z.number().min(-100).max(100).default(0),
  shadows: z.number().min(-100).max(100).default(0),
  whites: z.number().min(-100).max(100).default(0),
  blacks: z.number().min(-100).max(100).default(0),
  temperatureK: z.number().int().min(1_000).max(20_000).default(6_500),
  tint: z.number().min(-100).max(100).default(0),
  saturation: z.number().min(0).max(200).default(100),
  vibrance: z.number().min(-100).max(100).default(0),
  gamma: z.number().min(0.1).max(5).default(1),
}).strict()

export const TextureFilmPayloadSchema = z.object({
  grain: percentage.default(0),
  halation: percentage.default(0),
  bloom: percentage.default(0),
  vignette: percentage.default(0),
  scratches: percentage.default(0),
  dust: percentage.default(0),
  gateWeave: percentage.default(0),
  chromaticAberration: percentage.default(0),
  sharpness: z.number().min(-100).max(100).default(0),
  filmStock: z.string().max(200).default(""),
}).strict()

export const LightingPayloadSchema = z.object({
  keyAzimuthDegrees: z.number().min(-180).max(180).default(45),
  keyElevationDegrees: z.number().min(-90).max(90).default(25),
  temperatureK: z.number().int().min(1_000).max(20_000).default(5_600),
  keyIntensity: unitInterval.default(0.7),
  softness: unitInterval.default(0.5),
  fillIntensity: unitInterval.default(0.35),
  rimIntensity: unitInterval.default(0.2),
  volumetric: unitInterval.default(0),
}).strict()

export const TimingPacingPayloadSchema = z.object({
  durationSeconds: z.number().min(1).max(3_600).default(8),
  frameRate: z.union([z.literal(15), z.literal(23.976), z.literal(24), z.literal(25), z.literal(30), z.literal(48), z.literal(50), z.literal(60)]).default(24),
  pacing: z.enum(["auto", "slow", "measured", "standard", "fast", "frenetic"]).default("auto"),
  openingHookSeconds: z.number().min(0).max(60).default(0),
  finalHoldSeconds: z.number().min(0).max(60).default(0),
  energyCurve: z.array(TimelinePointSchema).max(64).default([]),
  tensionCurve: z.array(TimelinePointSchema).max(64).default([]),
}).strict()

export const ShotStructurePayloadSchema = z.object({
  mode: z.enum(["single-take", "auto-multi-shot", "manual-storyboard", "montage", "interview-broll", "narrative-sequence", "trailer", "product-demo", "explainer"]).default("auto-multi-shot"),
  shotCount: z.number().int().min(1).max(100).default(4),
  averageShotSeconds: z.number().min(0.25).max(600).default(2),
  continuityStrength: unitInterval.default(0.7),
  preserveScreenDirection: z.boolean().default(true),
  preserveTimeOfDay: z.boolean().default(true),
}).strict()

export const TransitionsPayloadSchema = z.object({
  defaultType: z.enum(["cut", "crossfade", "match-cut", "dip", "wipe", "optical-bridge", "custom"]).default("cut"),
  durationFrames: z.number().int().min(0).max(240).default(0),
  audioCrossfadeMs: z.number().int().min(0).max(10_000).default(80),
  matchMotion: z.boolean().default(false),
  recipeId: optionalNonEmptyString,
}).strict()

export const SpeedMotionPayloadSchema = z.object({
  playbackRate: z.number().min(0.05).max(20).default(1),
  interpolation: z.enum(["none", "optical-flow", "rife", "film"]).default("none"),
  motionBlur: unitInterval.default(0.5),
  speedCurve: z.array(TimelinePointSchema).max(64).default([]),
  preserveAudioPitch: z.boolean().default(true),
}).strict()

export const VoiceDialoguePayloadSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.enum(["auto", "generated", "upload", "recorded"]).default("auto"),
  language: z.string().max(64).default("en"),
  voiceId: optionalNonEmptyString,
  script: z.string().max(50_000).default(""),
  speakingRate: z.number().min(0.5).max(2).default(1),
  expressiveness: unitInterval.default(0.5),
  dialogueGainDb: z.number().min(-60).max(24).default(0),
}).strict()

export const MusicPayloadSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.enum(["auto", "generated", "upload", "library"]).default("auto"),
  assetId: optionalNonEmptyString,
  prompt: z.string().max(4_000).default(""),
  bpm: z.number().min(20).max(300).default(90),
  key: z.string().max(32).default(""),
  genre: z.string().max(200).default(""),
  intensity: unitInterval.default(0.5),
  beatSync: z.enum(["off", "quarter", "half", "bar", "drops", "auto"]).default("auto"),
}).strict()

const SoundCueSchema = z.object({
  id: nonEmptyString,
  timeSeconds: seconds,
  label: nonEmptyString,
  source: z.enum(["generated", "upload", "library", "auto"]).default("auto"),
  assetId: optionalNonEmptyString,
  prompt: z.string().max(1_000).default(""),
  gainDb: z.number().min(-60).max(24).default(0),
}).strict()

export const SoundEffectsPayloadSchema = z.object({
  enabled: z.boolean().default(false),
  cues: z.array(SoundCueSchema).max(256).default([]),
  autoDetectEvents: z.boolean().default(true),
}).strict()

const SpatialSourceSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  x: normalizedAxis,
  y: normalizedAxis,
  gainDb: z.number().min(-60).max(24).default(0),
}).strict()

export const AmbienceMixPayloadSchema = z.object({
  ambienceEnabled: z.boolean().default(false),
  ambiencePrompt: z.string().max(2_000).default(""),
  spatialWidth: unitInterval.default(0.5),
  dialogueDuckingDb: z.number().min(0).max(30).default(8),
  targetLufs: z.number().min(-40).max(-5).default(-14),
  limiterCeilingDb: z.number().min(-12).max(0).default(-1),
  spatialSources: z.array(SpatialSourceSchema).max(64).default([]),
}).strict()

export const CaptionsPayloadSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.enum(["auto", "transcription", "script", "upload"]).default("auto"),
  styleRecipeId: optionalNonEmptyString,
  maxWordsPerLine: z.number().int().min(1).max(20).default(6),
  position: z.enum(["top", "upper-third", "center", "lower-third", "bottom"]).default("bottom"),
  animation: z.enum(["none", "word-pop", "karaoke", "fade", "slide", "custom"]).default("none"),
  burnIn: z.boolean().default(false),
}).strict()

const TextOverlaySchema = z.object({
  id: nonEmptyString,
  text: z.string().max(4_000),
  role: z.enum(["title", "subtitle", "lower-third", "label", "watermark", "custom"]),
  startSeconds: seconds,
  durationSeconds: z.number().min(0.05).max(86_400),
  x: unitInterval,
  y: unitInterval,
  scale: z.number().min(0.05).max(20).default(1),
  opacity: unitInterval.default(1),
  styleRecipeId: optionalNonEmptyString,
}).strict()

export const TextTitlesPayloadSchema = z.object({
  overlays: z.array(TextOverlaySchema).max(256).default([]),
  safeMargins: z.boolean().default(true),
}).strict()

const GraphicOverlaySchema = z.object({
  id: nonEmptyString,
  assetId: nonEmptyString,
  startSeconds: seconds,
  durationSeconds: z.number().min(0.05).max(86_400),
  x: unitInterval,
  y: unitInterval,
  scale: z.number().min(0.01).max(20).default(1),
  rotationDegrees: z.number().min(-360).max(360).default(0),
  opacity: unitInterval.default(1),
  blendMode: z.enum(["normal", "screen", "multiply", "overlay", "soft-light", "add"]).default("normal"),
}).strict()

export const StickersOverlaysPayloadSchema = z.object({
  items: z.array(GraphicOverlaySchema).max(512).default([]),
}).strict()

const EffectSchema = z.object({
  id: nonEmptyString,
  type: z.enum(["fog", "snow", "rain", "dust", "embers", "bloom", "lens-flare", "vignette", "grain", "chromatic-aberration", "deflicker", "stabilize", "custom"]),
  intensity: unitInterval.default(0.5),
  startSeconds: seconds.default(0),
  endSeconds: seconds.optional(),
  blendMode: z.enum(["normal", "screen", "multiply", "overlay", "soft-light", "add"]).default("normal"),
  maskAssetId: optionalNonEmptyString,
}).strict()

export const VisualEffectsPayloadSchema = z.object({
  effects: z.array(EffectSchema).max(128).default([]),
}).strict()

const WeightedReferenceSchema = z.object({
  id: nonEmptyString,
  assetId: nonEmptyString,
  type: z.enum(["image", "video", "audio", "palette", "mask", "depth", "style"]),
  role: z.enum(["subject", "identity", "lighting", "composition", "motion", "style", "audio", "environment", "custom"]),
  weight: unitInterval.default(0.5),
}).strict()

export const ReferencesSeedsPayloadSchema = z.object({
  seed: z.number().int().min(0).max(2_147_483_647).nullable().default(null),
  lockSeed: z.boolean().default(false),
  variationNoise: unitInterval.default(0.5),
  references: z.array(WeightedReferenceSchema).max(64).default([]),
}).strict()

const ContinuityEntitySchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  type: z.enum(["character", "wardrobe", "prop", "vehicle", "location", "product", "logo", "custom"]),
  referenceAssetIds: z.array(nonEmptyString).max(32).default([]),
  lockedTraits: z.array(nonEmptyString).max(64).default([]),
  allowedVariation: z.array(nonEmptyString).max(64).default([]),
}).strict()

export const ConsistencyContinuityPayloadSchema = z.object({
  entities: z.array(ContinuityEntitySchema).max(128).default([]),
  identityStrength: unitInterval.default(0.8),
  wardrobeStrength: unitInterval.default(0.8),
  environmentStrength: unitInterval.default(0.7),
  colorContinuity: unitInterval.default(0.7),
  lightingContinuity: unitInterval.default(0.6),
}).strict()

export const NegativeConstraintsPayloadSchema = z.object({
  tags: z.array(nonEmptyString).max(256).default([]),
  forbiddenObjects: z.array(nonEmptyString).max(128).default([]),
  forbiddenTraits: z.array(nonEmptyString).max(128).default([]),
  freeText: z.string().max(8_000).default(""),
  enforcement: z.enum(["advisory", "standard", "strict"]).default("standard"),
}).strict()

export const GenerationOutputPayloadSchema = z.object({
  providerMode: z.enum(["auto", "manual"]).default("auto"),
  providerId: optionalNonEmptyString,
  modelId: optionalNonEmptyString,
  quality: z.enum(["draft", "preview", "final"]).default("preview"),
  resolution: z.enum(["480p", "720p", "1080p", "2k", "4k"]).default("720p"),
  aspectRatio: z.enum(["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "custom"]).default("16:9"),
  width: z.number().int().min(64).max(16_384).optional(),
  height: z.number().int().min(64).max(16_384).optional(),
  outputs: z.number().int().min(1).max(24).default(1),
  generateAudio: z.boolean().default(true),
  upscale: z.boolean().default(false),
  interpolateFps: z.union([z.literal(24), z.literal(25), z.literal(30), z.literal(48), z.literal(50), z.literal(60), z.literal(120)]).optional(),
  hdr: z.boolean().default(false),
  container: z.enum(["mp4", "mov", "webm"]).default("mp4"),
}).strict().superRefine((value, ctx) => {
  if (value.aspectRatio === "custom" && (!value.width || !value.height)) {
    ctx.addIssue({
      code: "custom",
      message: "Custom aspect ratio requires width and height.",
      path: ["aspectRatio"],
    })
  }
  if (value.providerMode === "manual" && (!value.providerId || !value.modelId)) {
    ctx.addIssue({
      code: "custom",
      message: "Manual provider mode requires providerId and modelId.",
      path: ["providerMode"],
    })
  }
})

export const VIDEO_DIRECTOR_CATEGORY_SCHEMAS = {
  "concept-direction": ConceptDirectionPayloadSchema,
  "visual-style": VisualStylePayloadSchema,
  "emotion-tone": EmotionTonePayloadSchema,
  "composition": CompositionPayloadSchema,
  "camera-lens": CameraLensPayloadSchema,
  "camera-movement": CameraMovementPayloadSchema,
  "focus-depth": FocusDepthPayloadSchema,
  "perspective-capture": PerspectiveCapturePayloadSchema,
  "color-palette": ColorPalettePayloadSchema,
  "grade-exposure": GradeExposurePayloadSchema,
  "texture-film": TextureFilmPayloadSchema,
  "lighting": LightingPayloadSchema,
  "timing-pacing": TimingPacingPayloadSchema,
  "shot-structure": ShotStructurePayloadSchema,
  "transitions": TransitionsPayloadSchema,
  "speed-motion": SpeedMotionPayloadSchema,
  "voice-dialogue": VoiceDialoguePayloadSchema,
  "music": MusicPayloadSchema,
  "sound-effects": SoundEffectsPayloadSchema,
  "ambience-mix": AmbienceMixPayloadSchema,
  "captions": CaptionsPayloadSchema,
  "text-titles": TextTitlesPayloadSchema,
  "stickers-overlays": StickersOverlaysPayloadSchema,
  "visual-effects": VisualEffectsPayloadSchema,
  "references-seeds": ReferencesSeedsPayloadSchema,
  "consistency-continuity": ConsistencyContinuityPayloadSchema,
  "negative-constraints": NegativeConstraintsPayloadSchema,
  "generation-output": GenerationOutputPayloadSchema,
} as const

export type VideoDirectorCategoryPayloadMap = {
  [K in keyof typeof VIDEO_DIRECTOR_CATEGORY_SCHEMAS]: z.infer<(typeof VIDEO_DIRECTOR_CATEGORY_SCHEMAS)[K]>
}

export const parseVideoDirectorCategoryPayload = <K extends VideoDirectorCategoryId>(
  categoryId: K,
  value: unknown,
): VideoDirectorCategoryPayloadMap[K] =>
  VIDEO_DIRECTOR_CATEGORY_SCHEMAS[categoryId].parse(value) as VideoDirectorCategoryPayloadMap[K]

export const safeParseVideoDirectorCategoryPayload = <K extends VideoDirectorCategoryId>(
  categoryId: K,
  value: unknown,
) => VIDEO_DIRECTOR_CATEGORY_SCHEMAS[categoryId].safeParse(value)
