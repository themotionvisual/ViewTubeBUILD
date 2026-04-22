import { z } from "zod";

export const KeyframeValueSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  rotation: z.number().optional(),
  opacity: z.number().optional(),
  blur: z.number().optional(),
  hue: z.number().optional(),
  sat: z.number().optional(),
  bri: z.number().optional(),
});

export const EditorClipSchema = z.object({
  id: z.string().min(1),
  trackId: z.string().min(1),
  kind: z.enum(["video", "image", "text", "audio", "effects"]),
  sourceId: z.string().min(1),
  title: z.string().min(1),
  color: z.string().min(1),
  startFrame: z.number().int().nonnegative(),
  endFrame: z.number().int().positive(),
  speed: z.number().positive(),
  groupedWithNext: z.boolean(),
  keyframeIds: z.array(z.string()),
  effectIds: z.array(z.string()),
});

export const EditorTransitionSchema = z.object({
  id: z.string().min(1),
  fromClipId: z.string().min(1),
  toClipId: z.string().min(1),
  type: z.enum(["none", "crossfade", "wipe", "slide", "flip"]),
  durationInFrames: z.number().int().nonnegative(),
});

export const EditorKeyframeSchema = z.object({
  id: z.string().min(1),
  clipId: z.string().min(1),
  frame: z.number().int().nonnegative(),
  easing: z.enum(["linear", "easeIn", "easeOut", "easeInOut", "spring", "bezier"]),
  value: KeyframeValueSchema,
});

export const TimelinePatchSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("insertClip"), clip: EditorClipSchema }),
  z.object({
    op: z.literal("moveClip"),
    clipId: z.string().min(1),
    trackId: z.string().min(1),
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().nonnegative(),
  }),
  z.object({ op: z.literal("trimClip"), clipId: z.string().min(1), side: z.enum(["left", "right"]), frame: z.number().int().nonnegative() }),
  z.object({ op: z.literal("splitClip"), clipId: z.string().min(1), frame: z.number().int().nonnegative(), newClipId: z.string().min(1) }),
  z.object({ op: z.literal("deleteClip"), clipId: z.string().min(1) }),
  z.object({ op: z.literal("setTransition"), transition: EditorTransitionSchema }),
  z.object({ op: z.literal("setKeyframe"), keyframe: EditorKeyframeSchema }),
  z.object({ op: z.literal("setClipColor"), clipId: z.string().min(1), color: z.string().min(1) }),
]);

export const AIPatchPlanSchema = z.object({
  reason: z.string().min(1),
  operations: z.array(TimelinePatchSchema),
});

export const MediaImportSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

export const RenderRequestSchema = z.object({
  presetId: z.string().min(1),
  format: z.enum(["mp4", "mov", "wav", "svg", "gif", "png-sequence", "json", "html"]),
  includeAudio: z.boolean().optional(),
});

export const ExportArtifactSchema = z.object({
  id: z.string().min(1),
  format: z.enum(["mp4", "mov", "wav", "svg", "gif", "png-sequence", "json", "html"]),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  status: z.enum(["queued", "ready", "failed"]),
  downloadUrl: z.string().optional(),
});

export const TimelineInteractionSchema = z.object({
  pointerKind: z.enum(["move", "trim-start", "trim-end", "keyframe"]),
  clipId: z.string().min(1),
  frame: z.number().int().nonnegative(),
});
