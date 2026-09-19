import { z } from "zod"
import {
  VideoDirectorProjectSchema,
  type VideoDirectorProject,
} from "./projectSchema"

export const SemanticDirectorPlanSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: z.string().min(1),
  name: z.string(),
  mode: z.enum(["single", "variations", "sequence", "campaign"]),
  brief: z.string(),
  objective: z.string(),
  audience: z.string(),
  visual: z.object({
    medium: z.string(),
    period: z.string(),
    realism: z.number(),
    stylization: z.number(),
    palette: z.array(z.string()),
    exactPaletteLock: z.boolean(),
    grade: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    texture: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    lighting: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  }),
  camera: z.object({
    captureFamily: z.string(),
    focalLengthMm: z.number(),
    aperture: z.number(),
    movement: z.string(),
    movementSpeed: z.number(),
    rig: z.string(),
    focusMode: z.string(),
    focusDistanceMeters: z.number(),
  }),
  composition: z.object({
    shotScale: z.string(),
    framing: z.string(),
    subjectX: z.number(),
    subjectY: z.number(),
    horizonY: z.number(),
    safeZones: z.boolean(),
  }),
  motion: z.object({
    durationSeconds: z.number(),
    frameRate: z.number(),
    pacing: z.string(),
    shotStructure: z.string(),
    shotCount: z.number(),
    transition: z.string(),
    playbackRate: z.number(),
  }),
  emotion: z.object({
    triumphantVsSomber: z.number(),
    energeticVsCalm: z.number(),
    warmth: z.number(),
    tension: z.number(),
    intensity: z.number(),
  }),
  audio: z.object({
    voiceEnabled: z.boolean(),
    voiceScript: z.string(),
    musicEnabled: z.boolean(),
    musicPrompt: z.string(),
    musicBpm: z.number(),
    ambienceEnabled: z.boolean(),
    ambiencePrompt: z.string(),
    targetLufs: z.number(),
  }),
  graphics: z.object({
    captionsEnabled: z.boolean(),
    captionPosition: z.string(),
    captionAnimation: z.string(),
    textOverlayCount: z.number(),
    graphicOverlayCount: z.number(),
    effectTypes: z.array(z.string()),
  }),
  continuity: z.object({
    identityStrength: z.number(),
    wardrobeStrength: z.number(),
    environmentStrength: z.number(),
    colorContinuity: z.number(),
    lightingContinuity: z.number(),
    entityLabels: z.array(z.string()),
  }),
  constraints: z.object({
    tags: z.array(z.string()),
    forbiddenObjects: z.array(z.string()),
    forbiddenTraits: z.array(z.string()),
    freeText: z.string(),
    enforcement: z.string(),
  }),
  output: z.object({
    providerMode: z.string(),
    providerId: z.string().nullable(),
    modelId: z.string().nullable(),
    quality: z.string(),
    resolution: z.string(),
    aspectRatio: z.string(),
    outputs: z.number(),
    nativeAudioRequested: z.boolean(),
    upscale: z.boolean(),
    hdr: z.boolean(),
  }),
}).strict()

export type SemanticDirectorPlan = z.infer<typeof SemanticDirectorPlanSchema>

export const buildSemanticDirectorPlan = (
  projectInput: VideoDirectorProject,
): SemanticDirectorPlan => {
  const project = VideoDirectorProjectSchema.parse(projectInput)
  const concept = project.categories["concept-direction"].payload
  const style = project.categories["visual-style"].payload
  const palette = project.categories["color-palette"].payload
  const grade = project.categories["grade-exposure"].payload
  const texture = project.categories["texture-film"].payload
  const lighting = project.categories.lighting.payload
  const lens = project.categories["camera-lens"].payload
  const movement = project.categories["camera-movement"].payload
  const perspective = project.categories["perspective-capture"].payload
  const focus = project.categories["focus-depth"].payload
  const composition = project.categories.composition.payload
  const timing = project.categories["timing-pacing"].payload
  const structure = project.categories["shot-structure"].payload
  const transitions = project.categories.transitions.payload
  const speed = project.categories["speed-motion"].payload
  const emotion = project.categories["emotion-tone"].payload
  const voice = project.categories["voice-dialogue"].payload
  const music = project.categories.music.payload
  const mix = project.categories["ambience-mix"].payload
  const captions = project.categories.captions.payload
  const text = project.categories["text-titles"].payload
  const overlays = project.categories["stickers-overlays"].payload
  const effects = project.categories["visual-effects"].payload
  const continuity = project.categories["consistency-continuity"].payload
  const negative = project.categories["negative-constraints"].payload
  const output = project.categories["generation-output"].payload

  return SemanticDirectorPlanSchema.parse({
    schemaVersion: 1,
    projectId: project.id,
    name: project.name,
    mode: project.mode,
    brief: concept.brief,
    objective: concept.objective,
    audience: concept.audience,
    visual: {
      medium: style.medium,
      period: style.period,
      realism: style.realism,
      stylization: style.stylization,
      palette: palette.colors,
      exactPaletteLock: palette.exactLock,
      grade: {
        exposureEv: grade.exposureEv,
        contrast: grade.contrast,
        highlights: grade.highlights,
        shadows: grade.shadows,
        temperatureK: grade.temperatureK,
        tint: grade.tint,
        saturation: grade.saturation,
        vibrance: grade.vibrance,
        gamma: grade.gamma,
      },
      texture: {
        grain: texture.grain,
        halation: texture.halation,
        bloom: texture.bloom,
        vignette: texture.vignette,
        scratches: texture.scratches,
        dust: texture.dust,
        gateWeave: texture.gateWeave,
        chromaticAberration: texture.chromaticAberration,
        sharpness: texture.sharpness,
        filmStock: texture.filmStock,
      },
      lighting: {
        keyAzimuthDegrees: lighting.keyAzimuthDegrees,
        keyElevationDegrees: lighting.keyElevationDegrees,
        temperatureK: lighting.temperatureK,
        keyIntensity: lighting.keyIntensity,
        softness: lighting.softness,
        fillIntensity: lighting.fillIntensity,
        rimIntensity: lighting.rimIntensity,
        volumetric: lighting.volumetric,
      },
    },
    camera: {
      captureFamily: lens.captureFamily,
      focalLengthMm: lens.focalLengthMm,
      aperture: lens.aperture,
      movement: movement.type,
      movementSpeed: movement.speed,
      rig: perspective.rig,
      focusMode: focus.mode,
      focusDistanceMeters: focus.focusDistanceMeters,
    },
    composition: {
      shotScale: composition.shotScale,
      framing: composition.framing,
      subjectX: composition.subjectX,
      subjectY: composition.subjectY,
      horizonY: composition.horizonY,
      safeZones: composition.safeZones,
    },
    motion: {
      durationSeconds: timing.durationSeconds,
      frameRate: timing.frameRate,
      pacing: timing.pacing,
      shotStructure: structure.mode,
      shotCount: structure.shotCount,
      transition: transitions.defaultType,
      playbackRate: speed.playbackRate,
    },
    emotion: {
      triumphantVsSomber: emotion.triumphantVsSomber,
      energeticVsCalm: emotion.energeticVsCalm,
      warmth: emotion.warmth,
      tension: emotion.tension,
      intensity: emotion.intensity,
    },
    audio: {
      voiceEnabled: voice.enabled,
      voiceScript: voice.script,
      musicEnabled: music.enabled,
      musicPrompt: music.prompt,
      musicBpm: music.bpm,
      ambienceEnabled: mix.ambienceEnabled,
      ambiencePrompt: mix.ambiencePrompt,
      targetLufs: mix.targetLufs,
    },
    graphics: {
      captionsEnabled: captions.enabled,
      captionPosition: captions.position,
      captionAnimation: captions.animation,
      textOverlayCount: text.overlays.length,
      graphicOverlayCount: overlays.items.length,
      effectTypes: effects.effects.map((effect) => effect.type),
    },
    continuity: {
      identityStrength: continuity.identityStrength,
      wardrobeStrength: continuity.wardrobeStrength,
      environmentStrength: continuity.environmentStrength,
      colorContinuity: continuity.colorContinuity,
      lightingContinuity: continuity.lightingContinuity,
      entityLabels: continuity.entities.map((entity) => entity.label),
    },
    constraints: {
      tags: negative.tags,
      forbiddenObjects: negative.forbiddenObjects,
      forbiddenTraits: negative.forbiddenTraits,
      freeText: negative.freeText,
      enforcement: negative.enforcement,
    },
    output: {
      providerMode: output.providerMode,
      providerId: output.providerId ?? null,
      modelId: output.modelId ?? null,
      quality: output.quality,
      resolution: output.resolution,
      aspectRatio: output.aspectRatio,
      outputs: output.outputs,
      nativeAudioRequested: output.generateAudio,
      upscale: output.upscale,
      hdr: output.hdr,
    },
  })
}

const pct = (value: number) => `${Math.round(value * 100)}%`
const axis = (value: number, negative: string, positive: string) => {
  if (Math.abs(value) < 0.12) return "neutral"
  return `${Math.round(Math.abs(value) * 100)}% ${value < 0 ? negative : positive}`
}

export const compileProviderAgnosticDirectorPrompt = (
  planInput: SemanticDirectorPlan,
): string => {
  const plan = SemanticDirectorPlanSchema.parse(planInput)
  const lines: string[] = []

  if (plan.brief.trim()) lines.push(`SUBJECT & ACTION: ${plan.brief.trim()}`)
  if (plan.objective.trim()) lines.push(`CREATIVE OBJECTIVE: ${plan.objective.trim()}`)
  if (plan.audience.trim()) lines.push(`AUDIENCE: ${plan.audience.trim()}`)

  lines.push(
    `VISUAL LANGUAGE: ${plan.visual.medium}; realism ${pct(plan.visual.realism)}; stylization ${pct(plan.visual.stylization)}${plan.visual.period ? `; period/era ${plan.visual.period}` : ""}.`,
  )

  if (plan.visual.palette.length) {
    lines.push(
      `COLOR PALETTE: ${plan.visual.palette.join(", ")}${plan.visual.exactPaletteLock ? "; treat these colors as a locked palette" : ""}.`,
    )
  }

  lines.push(
    `CAMERA: ${plan.camera.captureFamily} capture, ${plan.camera.focalLengthMm}mm lens at f/${plan.camera.aperture}; ${plan.camera.rig} perspective; ${plan.camera.movement} movement at ${pct(plan.camera.movementSpeed)} intensity; ${plan.camera.focusMode} focus around ${plan.camera.focusDistanceMeters}m.`,
  )

  lines.push(
    `COMPOSITION: ${plan.composition.shotScale} shot, ${plan.composition.framing} framing, subject at ${Math.round(plan.composition.subjectX * 100)}% x / ${Math.round(plan.composition.subjectY * 100)}% y, horizon ${Math.round(plan.composition.horizonY * 100)}%.`,
  )

  lines.push(
    `MOTION & EDITING: ${plan.motion.durationSeconds}s at ${plan.motion.frameRate}fps; ${plan.motion.pacing} pacing; ${plan.motion.shotStructure}; target ${plan.motion.shotCount} shot${plan.motion.shotCount === 1 ? "" : "s"}; ${plan.motion.transition} transitions; ${plan.motion.playbackRate}x playback.`,
  )

  lines.push(
    `EMOTIONAL DIRECTION: ${axis(plan.emotion.triumphantVsSomber, "somber", "triumphant")}, ${axis(plan.emotion.energeticVsCalm, "calm", "energetic")}; tension ${pct(plan.emotion.tension)}; intensity ${pct(plan.emotion.intensity)}.`,
  )

  const grade = plan.visual.grade
  lines.push(
    `GRADE: exposure ${grade.exposureEv} EV; contrast ${grade.contrast}; temperature ${grade.temperatureK}K; saturation ${grade.saturation}%; vibrance ${grade.vibrance}; gamma ${grade.gamma}.`,
  )

  const texture = plan.visual.texture
  if (
    Number(texture.grain) > 0 ||
    Number(texture.halation) > 0 ||
    Number(texture.bloom) > 0 ||
    String(texture.filmStock || "").trim()
  ) {
    lines.push(
      `TEXTURE: grain ${texture.grain}%; halation ${texture.halation}%; bloom ${texture.bloom}%${texture.filmStock ? `; stock/recipe ${texture.filmStock}` : ""}.`,
    )
  }

  if (plan.continuity.entityLabels.length) {
    lines.push(
      `CONTINUITY: preserve ${plan.continuity.entityLabels.join(", ")}; identity ${pct(plan.continuity.identityStrength)}, wardrobe ${pct(plan.continuity.wardrobeStrength)}, environment ${pct(plan.continuity.environmentStrength)}.`,
    )
  }

  const forbids = [
    ...plan.constraints.tags,
    ...plan.constraints.forbiddenObjects,
    ...plan.constraints.forbiddenTraits,
  ]
  if (plan.constraints.freeText.trim()) forbids.push(plan.constraints.freeText.trim())
  if (forbids.length) {
    lines.push(
      `NEGATIVE CONSTRAINTS (${plan.constraints.enforcement}): avoid ${forbids.join("; ")}.`,
    )
  }

  lines.push(
    `OUTPUT INTENT: ${plan.output.aspectRatio}, ${plan.output.resolution}, ${plan.output.quality} quality, ${plan.output.outputs} output${plan.output.outputs === 1 ? "" : "s"}.`,
  )

  return lines.join("\n")
}

export const compileSemanticDirectorPacket = (project: VideoDirectorProject) => {
  const plan = buildSemanticDirectorPlan(project)
  return {
    plan,
    prompt: compileProviderAgnosticDirectorPrompt(plan),
    json: JSON.stringify(plan, null, 2),
  }
}
