import type {
  EditorProjectV3,
  ExportValidationIssueV1,
  ExportValidationResultV1,
  PropsResolutionTraceV1,
  ResolvedCompositionMetaV1,
  TimelineState,
} from "../contracts";

const RESOLUTION_BASE: Record<ResolvedCompositionMetaV1["resolutionProfile"], { width: number; height: number }> = {
  "720": { width: 1280, height: 720 },
  "1080": { width: 1920, height: 1080 },
  "1k": { width: 1920, height: 1080 },
  "2k": { width: 2560, height: 1440 },
  "4k": { width: 3840, height: 2160 },
};

export const buildResolvedCompositionMeta = (input: {
  fps: number;
  durationInFrames?: number;
  durationInSeconds?: number;
  compositionWidth?: number;
  compositionHeight?: number;
  aspectRatio?: ResolvedCompositionMetaV1["aspectRatio"];
  resolutionProfile?: ResolvedCompositionMetaV1["resolutionProfile"];
}): ResolvedCompositionMetaV1 => {
  const aspectRatio = input.aspectRatio ?? "16:9";
  const resolutionProfile = input.resolutionProfile ?? "1080";
  const base = RESOLUTION_BASE[resolutionProfile];

  const defaultWidth = aspectRatio === "16:9" ? base.width : base.height;
  const defaultHeight = aspectRatio === "16:9" ? base.height : base.width;

  const fps = Number.isFinite(input.fps) && input.fps > 0 ? Math.round(input.fps) : 30;
  const durationInFramesFromSeconds =
    Number.isFinite(input.durationInSeconds) && (input.durationInSeconds as number) > 0
      ? Math.max(1, Math.round((input.durationInSeconds as number) * fps))
      : 0;
  const durationInFramesRaw =
    Number.isFinite(input.durationInFrames) && (input.durationInFrames as number) > 0
      ? Math.round(input.durationInFrames as number)
      : durationInFramesFromSeconds;
  const durationInFrames = Math.max(1, durationInFramesRaw || fps * 3);

  const width =
    Number.isFinite(input.compositionWidth) && (input.compositionWidth as number) > 0
      ? Math.round(input.compositionWidth as number)
      : defaultWidth;
  const height =
    Number.isFinite(input.compositionHeight) && (input.compositionHeight as number) > 0
      ? Math.round(input.compositionHeight as number)
      : defaultHeight;

  const durationInSeconds = Number((durationInFrames / fps).toFixed(3));

  return {
    compositionWidth: width,
    compositionHeight: height,
    fps,
    durationInFrames,
    durationInSeconds,
    aspectRatio,
    resolutionProfile,
  };
};

export const createPropsResolutionTrace = (input?: Partial<PropsResolutionTraceV1>): PropsResolutionTraceV1 => {
  return {
    defaultProps: input?.defaultProps ?? {},
    inputProps: input?.inputProps ?? {},
    resolvedProps: input?.resolvedProps ?? (input?.inputProps ?? {}),
    metadataSource: input?.metadataSource ?? "fallback",
  };
};

export const createEditorProjectV3 = (input: {
  sourceEditor: EditorProjectV3["sourceEditor"];
  timeline: EditorProjectV3["timeline"];
  compositionMeta: ResolvedCompositionMetaV1;
  propsResolution?: Partial<PropsResolutionTraceV1>;
  editorState?: Record<string, unknown>;
  exportMeta?: EditorProjectV3["exportMeta"];
}): EditorProjectV3 => {
  return {
    version: "EditorProjectV3",
    schemaVersion: "3.0.0",
    sourceEditor: input.sourceEditor,
    exportedAt: new Date().toISOString(),
    compositionMeta: input.compositionMeta,
    propsResolution: createPropsResolutionTrace(input.propsResolution),
    timeline: input.timeline,
    editorState: input.editorState,
    exportMeta: input.exportMeta,
  };
};

const asIssue = (code: string, message: string, path?: string): ExportValidationIssueV1 => ({ code, message, path });

export const validateEditorProjectV3 = (raw: unknown): ExportValidationResultV1 => {
  const errors: ExportValidationIssueV1[] = [];
  const warnings: ExportValidationIssueV1[] = [];

  if (!raw || typeof raw !== "object") {
    return {
      valid: false,
      errors: [asIssue("INVALID_ROOT", "Export payload must be an object.", "$")],
      warnings,
    };
  }

  const candidate = raw as Partial<EditorProjectV3>;
  if (candidate.version !== "EditorProjectV3") {
    errors.push(asIssue("INVALID_VERSION", "Expected version to be EditorProjectV3.", "$.version"));
  }

  if (!candidate.timeline) {
    errors.push(asIssue("MISSING_TIMELINE", "timeline block is required.", "$.timeline"));
  }

  const timeline = candidate.timeline ?? {
    fps: 30,
    playheadFrame: 0,
    zoom: 1,
    snapping: true,
    tracks: [],
    clips: [],
    keyframes: [],
    transitions: [],
  };

  const clipEndFrame = Array.isArray(timeline.clips)
    ? timeline.clips.reduce((max, clip) => Math.max(max, Number((clip as { endFrame?: number }).endFrame ?? 0)), 0)
    : 0;

  const normalizedMeta = buildResolvedCompositionMeta({
    fps: Number((candidate.compositionMeta as Partial<ResolvedCompositionMetaV1> | undefined)?.fps ?? timeline.fps ?? 30),
    durationInFrames: Number((candidate.compositionMeta as Partial<ResolvedCompositionMetaV1> | undefined)?.durationInFrames ?? clipEndFrame),
    compositionWidth: Number((candidate.compositionMeta as Partial<ResolvedCompositionMetaV1> | undefined)?.compositionWidth ?? 0),
    compositionHeight: Number((candidate.compositionMeta as Partial<ResolvedCompositionMetaV1> | undefined)?.compositionHeight ?? 0),
    aspectRatio: (candidate.compositionMeta as Partial<ResolvedCompositionMetaV1> | undefined)?.aspectRatio ?? candidate.exportMeta?.aspect ?? "16:9",
    resolutionProfile:
      (candidate.compositionMeta as Partial<ResolvedCompositionMetaV1> | undefined)?.resolutionProfile ??
      candidate.exportMeta?.resolutionProfile ??
      "1080",
  });

  if (normalizedMeta.compositionWidth <= 0 || normalizedMeta.compositionHeight <= 0) {
    errors.push(asIssue("INVALID_RESOLUTION", "Composition width and height must be greater than 0.", "$.compositionMeta"));
  }
  if (normalizedMeta.durationInFrames <= 0) {
    errors.push(asIssue("INVALID_DURATION", "durationInFrames must be greater than 0.", "$.compositionMeta.durationInFrames"));
  }

  if (clipEndFrame === 0) {
    warnings.push(
      asIssue(
        "EMPTY_TIMELINE",
        "Timeline has no clips. Default non-zero composition metadata has been applied for safe export.",
        "$.timeline.clips",
      ),
    );
  }

  const normalizedProject: EditorProjectV3 = {
    version: "EditorProjectV3",
    schemaVersion: "3.0.0",
    sourceEditor: candidate.sourceEditor ?? "launch",
    exportedAt: candidate.exportedAt ?? new Date().toISOString(),
    compositionMeta: normalizedMeta,
    propsResolution: createPropsResolutionTrace(candidate.propsResolution),
    timeline: {
      fps: Number(timeline.fps ?? normalizedMeta.fps),
      playheadFrame: Number(timeline.playheadFrame ?? 0),
      zoom: Number(timeline.zoom ?? 1),
      snapping: Boolean(timeline.snapping ?? true),
      tracks: Array.isArray(timeline.tracks) ? timeline.tracks : [],
      clips: Array.isArray(timeline.clips) ? timeline.clips : [],
      keyframes: Array.isArray(timeline.keyframes) ? timeline.keyframes : [],
      transitions: Array.isArray(timeline.transitions) ? timeline.transitions : [],
    },
    editorState: candidate.editorState,
    exportMeta: {
      aspect: normalizedMeta.aspectRatio,
      resolutionProfile: normalizedMeta.resolutionProfile,
    },
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedProject,
  };
};

export const timelineToLaunchV3Timeline = (state: TimelineState): EditorProjectV3["timeline"] => {
  return {
    fps: state.fps,
    playheadFrame: state.playheadFrame,
    zoom: state.zoom,
    snapping: state.snapping,
    tracks: state.tracks,
    clips: state.clips,
    keyframes: state.keyframes,
    transitions: state.transitions,
  };
};
