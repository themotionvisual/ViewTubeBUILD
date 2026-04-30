import type { RenderJobRequest, TimelineState } from "../contracts";

type ResolutionProfile = "720" | "1080" | "1k" | "2k" | "4k";
type AspectRatio = "16:9" | "9:16";

export interface RemotionBridgeCompositionSpec {
  fps: number;
  durationInSeconds: number;
  width: number;
  height: number;
}

export interface RemotionBridgeJobV1 {
  kind: "remotionRender";
  targetFormat: "mp4" | "mov";
  composition: RemotionBridgeCompositionSpec;
  exportProfile: ResolutionProfile;
  schemaVersion: "EditorProjectV3";
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

export const createRemotionRenderJobPayload = (input: {
  state: TimelineState;
  format: "mp4" | "mov";
  resolutionProfile: ResolutionProfile;
  aspect: AspectRatio;
}): RemotionBridgeJobV1 => {
  const fps = clampFps(input.state.fps);
  const durationInFrames = resolveDurationInFrames(input.state);
  const { width, height } = resolveCompositionDimensions({
    resolutionProfile: input.resolutionProfile,
    aspect: input.aspect,
  });

  return {
    kind: "remotionRender",
    targetFormat: input.format,
    composition: {
      fps,
      durationInSeconds: Number((durationInFrames / fps).toFixed(3)),
      width,
      height,
    },
    exportProfile: input.resolutionProfile,
    schemaVersion: "EditorProjectV3",
    project: input.state,
  };
};

export const createRenderJobRequestFromBridgePayload = (
  payload: RemotionBridgeJobV1,
  projectId: string,
): RenderJobRequest => {
  const aspect: AspectRatio = payload.composition.width >= payload.composition.height ? "16:9" : "9:16";
  return {
    projectId,
    format: payload.targetFormat,
    resolutionProfile: payload.exportProfile,
    aspect,
    compositionSpec: {
      fps: payload.composition.fps,
      width: payload.composition.width,
      height: payload.composition.height,
      durationInFrames: Math.max(1, Math.round(payload.composition.durationInSeconds * payload.composition.fps)),
    },
  };
};

export const serializeRemotionRenderJobPayload = (payload: RemotionBridgeJobV1): string => {
  return JSON.stringify(payload, null, 2);
};
