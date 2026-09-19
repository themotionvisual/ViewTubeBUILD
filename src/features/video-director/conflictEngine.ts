import type { VideoDirectorCategoryId } from "./categorySchemas"
import {
  VideoDirectorProjectSchema,
  type VideoDirectorConflictSchema,
  type VideoDirectorProject,
} from "./projectSchema"

export interface VideoDirectorConflict {
  id: string
  code: string
  message: string
  severity: "warning" | "blocking"
  categoryId: VideoDirectorCategoryId
  fields: string[]
  relatedCategoryIds: VideoDirectorCategoryId[]
}

const conflict = (
  value: Omit<VideoDirectorConflict, "id">,
): VideoDirectorConflict => ({
  ...value,
  id: `${value.categoryId}:${value.code}`,
})

export const evaluateVideoDirectorConflicts = (
  project: VideoDirectorProject,
): VideoDirectorConflict[] => {
  const validated = VideoDirectorProjectSchema.parse(project)
  const results: VideoDirectorConflict[] = []

  const shotStructure = validated.categories["shot-structure"].payload
  const transitions = validated.categories.transitions.payload
  const cameraMovement = validated.categories["camera-movement"].payload
  const focusDepth = validated.categories["focus-depth"].payload
  const references = validated.categories["references-seeds"].payload
  const continuity = validated.categories["consistency-continuity"].payload
  const output = validated.categories["generation-output"].payload

  if (shotStructure.mode === "single-take" && shotStructure.shotCount > 1) {
    results.push(conflict({
      code: "single_take_multiple_shots",
      message: "Single Take cannot request more than one shot. Set Shot Count to 1 or choose a multi-shot structure.",
      severity: "blocking",
      categoryId: "shot-structure",
      fields: ["mode", "shotCount"],
      relatedCategoryIds: [],
    }))
  }

  if (
    shotStructure.mode === "single-take" &&
    (transitions.defaultType !== "cut" || transitions.durationFrames > 0)
  ) {
    results.push(conflict({
      code: "single_take_transition",
      message: "Transitions have no effect inside a single continuous take.",
      severity: "warning",
      categoryId: "transitions",
      fields: ["defaultType", "durationFrames"],
      relatedCategoryIds: ["shot-structure"],
    }))
  }

  if (
    cameraMovement.type === "static" &&
    (
      Math.abs(cameraMovement.panDegrees) > 0.01 ||
      Math.abs(cameraMovement.tiltDegrees) > 0.01 ||
      Math.abs(cameraMovement.orbitDegrees) > 0.01 ||
      cameraMovement.distanceMeters > 0.01 ||
      cameraMovement.shake > 0.01
    )
  ) {
    results.push(conflict({
      code: "static_camera_has_motion",
      message: "Static camera is selected while movement parameters are non-zero.",
      severity: "warning",
      categoryId: "camera-movement",
      fields: ["type", "panDegrees", "tiltDegrees", "orbitDegrees", "distanceMeters", "shake"],
      relatedCategoryIds: [],
    }))
  }

  if (focusDepth.mode === "rack-focus" && focusDepth.rackFocusEndMeters === undefined) {
    results.push(conflict({
      code: "rack_focus_missing_target",
      message: "Rack Focus needs an ending focus distance.",
      severity: "blocking",
      categoryId: "focus-depth",
      fields: ["mode", "rackFocusEndMeters"],
      relatedCategoryIds: ["camera-lens"],
    }))
  }

  const identityReferenceCount = references.references.filter(
    (reference) => reference.role === "identity" || reference.role === "subject",
  ).length

  if (identityReferenceCount > 0 && continuity.identityStrength < 0.25) {
    results.push(conflict({
      code: "identity_reference_low_continuity",
      message: "Identity references are configured while identity continuity is set very low.",
      severity: "warning",
      categoryId: "consistency-continuity",
      fields: ["identityStrength"],
      relatedCategoryIds: ["references-seeds"],
    }))
  }

  if (output.aspectRatio === "custom" && validated.categories.composition.payload.safeZones) {
    results.push(conflict({
      code: "custom_ratio_safe_zone_review",
      message: "Custom output dimensions are active. Review composition safe zones before final rendering.",
      severity: "warning",
      categoryId: "composition",
      fields: ["safeZones"],
      relatedCategoryIds: ["generation-output"],
    }))
  }

  if (validated.mode === "variations" && validated.variants.length < 2 && output.outputs < 2) {
    results.push(conflict({
      code: "variation_mode_single_output",
      message: "Variations mode is active but fewer than two variants/outputs are configured.",
      severity: "warning",
      categoryId: "generation-output",
      fields: ["outputs"],
      relatedCategoryIds: ["concept-direction"],
    }))
  }

  return results
}

export const applyVideoDirectorConflicts = (
  project: VideoDirectorProject,
): VideoDirectorProject => {
  const next = structuredClone(VideoDirectorProjectSchema.parse(project))

  for (const state of Object.values(next.categories)) {
    state.conflicts = []
  }

  const conflicts = evaluateVideoDirectorConflicts(next)
  for (const item of conflicts) {
    next.categories[item.categoryId].conflicts.push({
      id: item.id,
      code: item.code,
      message: item.message,
      severity: item.severity,
      fields: item.fields,
      relatedCategoryIds: item.relatedCategoryIds,
    })
  }

  return VideoDirectorProjectSchema.parse(next)
}
