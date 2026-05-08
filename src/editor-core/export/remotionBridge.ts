import type { RenderJobRequest, TimelineState } from "../contracts";

type ResolutionProfile = "720" | "1080" | "1k" | "2k" | "4k";
type AspectRatio = "16:9" | "9:16";
type RenderMode = "realtime" | "quality" | "frame-perfect";
type OutputFormat = "mp4" | "mov" | "webp";
type QualityProfile = "draft" | "preview" | "final" | "prores" | "webp-archive";

export interface RemotionBridgeCompositionSpecV2 {
  fps: number;
  durationInFrames: number;
  durationInSeconds: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  resolutionProfile: ResolutionProfile;
}

export interface RenderValidationResultV2 {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalizedRequest?: {
    format: OutputFormat;
    renderMode: RenderMode;
    qualityProfile: QualityProfile;
  };
}

export interface FrameAuditManifestV1 {
  mode: "frame-perfect";
  sampleEveryNFrames: number;
  expectedFrameCount: number;
}

export interface RemotionBridgeJobV2 {
  kind: "remotionRender";
  targetFormat: OutputFormat;
  renderMode: RenderMode;
  qualityProfile: QualityProfile;
  codecProfile: {
    videoCodec: string;
    audioCodec: string;
    pixelFormat: string;
    bitrateMbps: number;
    alpha: boolean;
  };
  compositionMeta: RemotionBridgeCompositionSpecV2;
  propsResolutionTrace: {
    defaultProps: Record<string, unknown>;
    inputProps: Record<string, unknown>;
    resolvedProps: Record<string, unknown>;
    metadataSource: "default-props" | "input-props" | "calculate-metadata" | "fallback";
  };
  frameAuditManifest?: FrameAuditManifestV1;
  exportProfile: ResolutionProfile;
  schemaVersion: "RenderRequestV2";
  validation: RenderValidationResultV2;
  project: TimelineState;
}

const RESOLUTION_BASE: Record<ResolutionProfile, { width: number; height: number }> = {
  "720": { width: 1280, height: 720 },
  "1080": { width: 1920, height: 1080 },
  "1k": { width: 1920, height: 1080 },
  "2k": { width: 2560, height: 1440 },
  "4k": { width: 3840, height: 2160 },
};

const clampFps = (fps: number): number => {
  if (!Number.isFinite(fps)) return 30;
  return Math.max(12, Math.min(120, Math.round(fps)));
};

const resolveDurationInFrames = (state: TimelineState): number => {
  const clipEndFrame = state.clips.reduce((max, clip) => Math.max(max, clip.endFrame), 0);
  return Math.max(1, clipEndFrame || state.fps * 3);
};

const resolveCompositionDimensions = (input: {
  resolutionProfile: ResolutionProfile;
  aspect: AspectRatio;
}): { width: number; height: number } => {
  const base = RESOLUTION_BASE[input.resolutionProfile];
  if (input.aspect === "9:16") {
    return { width: base.height, height: base.width };
  }
  return { width: base.width, height: base.height };
};

const resolveQualityProfile = (input: {
  format: OutputFormat;
  renderMode: RenderMode;
  qualityProfile?: QualityProfile;
}): QualityProfile => {
  if (input.qualityProfile) return input.qualityProfile;
  if (input.renderMode === "realtime") return "preview";
  if (input.renderMode === "frame-perfect") {
    if (input.format === "mov") return "prores";
    if (input.format === "webp") return "webp-archive";
    return "final";
  }
  return "final";
};

const resolveCodecProfile = (input: {
  format: OutputFormat;
  qualityProfile: QualityProfile;
}): RemotionBridgeJobV2["codecProfile"] => {
  if (input.format === "mov") {
    return {
      videoCodec: input.qualityProfile === "prores" ? "prores_ks" : "h264",
      audioCodec: "pcm_s16le",
      pixelFormat: input.qualityProfile === "prores" ? "yuva444p10le" : "yuv420p",
      bitrateMbps: input.qualityProfile === "prores" ? 220 : 45,
      alpha: input.qualityProfile === "prores",
    };
  }
  if (input.format === "webp") {
    return {
      videoCodec: "libwebp",
      audioCodec: "none",
      pixelFormat: "yuva420p",
      bitrateMbps: 14,
      alpha: true,
    };
  }
  return {
    videoCodec: "libx264",
    audioCodec: "aac",
    pixelFormat: "yuv420p",
    bitrateMbps: input.qualityProfile === "draft" ? 12 : 24,
    alpha: false,
  };
};

export const validateRenderRequestV2 = (input: {
  compositionMeta: RemotionBridgeCompositionSpecV2;
  format: OutputFormat;
  renderMode: RenderMode;
  qualityProfile: QualityProfile;
  state: TimelineState;
}): RenderValidationResultV2 => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const meta = input.compositionMeta;

  if (!Number.isFinite(meta.fps) || meta.fps <= 0) errors.push("fps must be greater than 0");
  if (!Number.isFinite(meta.width) || meta.width <= 0) errors.push("width must be greater than 0");
  if (!Number.isFinite(meta.height) || meta.height <= 0) errors.push("height must be greater than 0");
  if (!Number.isFinite(meta.durationInFrames) || meta.durationInFrames <= 0) errors.push("durationInFrames must be greater than 0");
  if (!Number.isFinite(meta.durationInSeconds) || meta.durationInSeconds <= 0) errors.push("durationInSeconds must be greater than 0");

  if (input.state.clips.length === 0) {
    warnings.push("timeline has no clips; fallback duration metadata applied");
  }

  if (input.renderMode === "frame-perfect") {
    warnings.push("frame-perfect mode is slower and intended for final QA exports");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedRequest: {
      format: input.format,
      renderMode: input.renderMode,
      qualityProfile: input.qualityProfile,
    },
  };
};

export const createRemotionRenderJobPayload = (input: {
  state: TimelineState;
  format: OutputFormat;
  resolutionProfile: ResolutionProfile;
  aspect: AspectRatio;
  renderMode?: RenderMode;
  qualityProfile?: QualityProfile;
}): RemotionBridgeJobV2 => {
  const fps = clampFps(input.state.fps);
  const durationInFrames = resolveDurationInFrames(input.state);
  const durationInSeconds = Number((durationInFrames / fps).toFixed(3));
  const renderMode = input.renderMode ?? "quality";
  const qualityProfile = resolveQualityProfile({
    format: input.format,
    renderMode,
    qualityProfile: input.qualityProfile,
  });
  const { width, height } = resolveCompositionDimensions({
    resolutionProfile: input.resolutionProfile,
    aspect: input.aspect,
  });

  const compositionMeta: RemotionBridgeCompositionSpecV2 = {
    fps,
    durationInFrames,
    durationInSeconds,
    width,
    height,
    aspectRatio: input.aspect,
    resolutionProfile: input.resolutionProfile,
  };

  const propsResolutionTrace: RemotionBridgeJobV2["propsResolutionTrace"] = {
    defaultProps: { fps: 30, resolutionProfile: "1080", aspectRatio: "16:9" },
    inputProps: {
      fps: input.state.fps,
      resolutionProfile: input.resolutionProfile,
      aspectRatio: input.aspect,
    },
    resolvedProps: {
      fps,
      resolutionProfile: input.resolutionProfile,
      aspectRatio: input.aspect,
      durationInFrames,
    },
    metadataSource: "fallback",
  };

  const validation = validateRenderRequestV2({
    compositionMeta,
    format: input.format,
    renderMode,
    qualityProfile,
    state: input.state,
  });

  return {
    kind: "remotionRender",
    targetFormat: input.format,
    renderMode,
    qualityProfile,
    codecProfile: resolveCodecProfile({ format: input.format, qualityProfile }),
    compositionMeta,
    propsResolutionTrace,
    frameAuditManifest:
      renderMode === "frame-perfect"
        ? {
            mode: "frame-perfect",
            sampleEveryNFrames: 1,
            expectedFrameCount: durationInFrames,
          }
        : undefined,
    exportProfile: input.resolutionProfile,
    schemaVersion: "RenderRequestV2",
    validation,
    project: input.state,
  };
};

export const createRenderJobRequestFromBridgePayload = (
  payload: RemotionBridgeJobV2,
  projectId: string,
): RenderJobRequest => {
  return {
    projectId,
    format: payload.targetFormat,
    resolutionProfile: payload.exportProfile,
    aspect: payload.compositionMeta.aspectRatio,
    renderMode: payload.renderMode,
    qualityProfile: payload.qualityProfile,
    codecProfile: payload.codecProfile,
    propsResolutionTrace: payload.propsResolutionTrace,
    frameAuditConfig: payload.frameAuditManifest
      ? { enabled: true, sampleEveryNFrames: payload.frameAuditManifest.sampleEveryNFrames }
      : { enabled: false },
    compositionSpec: {
      fps: payload.compositionMeta.fps,
      width: payload.compositionMeta.width,
      height: payload.compositionMeta.height,
      durationInFrames: payload.compositionMeta.durationInFrames,
      durationInSeconds: payload.compositionMeta.durationInSeconds,
    },
  };
};

export const serializeRemotionRenderJobPayload = (payload: RemotionBridgeJobV2): string => {
  return JSON.stringify(payload, null, 2);
};
