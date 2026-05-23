import type { EditorEngineState, EditorTimelineClip, KeyframePoint } from "./editorEngine";

export interface RemotionBindingConfig {
  compositionId: string;
  fps: number;
  width: number;
  height: number;
  durationStrategy: "fitToContent" | "fixed";
  durationInFrames?: number;
  qualityProfile: "draft" | "preview" | "final";
}

export interface RemotionSequenceSpec {
  id: string;
  from: number;
  durationInFrames: number;
  clipId: string;
  layerId: string;
  trackId: string;
  speed: number;
  style: {
    color: string;
    easing: "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring";
  };
  transitionToNext?: EditorTimelineClip["transitionToNext"];
  groupWithNext: boolean;
  keyframes: KeyframePoint[];
}

export interface RemotionCompositionSpec {
  compositionId: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  qualityProfile: RemotionBindingConfig["qualityProfile"];
  snapshotId: string;
  compileVersion: number;
  sequences: RemotionSequenceSpec[];
}

export interface TimelineToRemotionCompiler {
  compile: (
    timelineState: EditorEngineState,
    bindingConfig: RemotionBindingConfig,
  ) => RemotionCompositionSpec;
}

const secondsToFrames = (seconds: number, fps: number): number =>
  Math.max(1, Math.round(seconds * fps));

const resolveDurationInFrames = (
  clips: EditorTimelineClip[],
  bindingConfig: RemotionBindingConfig,
): number => {
  if (bindingConfig.durationStrategy === "fixed") {
    return bindingConfig.durationInFrames || secondsToFrames(15, bindingConfig.fps);
  }

  const maxEnd = clips.reduce((max, clip) => Math.max(max, clip.end), 0);
  return Math.max(1, secondsToFrames(maxEnd, bindingConfig.fps));
};

const resolvePrimaryEasing = (keyframes: KeyframePoint[]): RemotionSequenceSpec["style"]["easing"] => {
  const springPoint = keyframes.find((point) => point.easing === "spring");
  if (springPoint) return "spring";
  const easeOutPoint = keyframes.find((point) => point.easing === "easeOut");
  if (easeOutPoint) return "easeOut";
  const easeInPoint = keyframes.find((point) => point.easing === "easeIn");
  if (easeInPoint) return "easeIn";
  const easeInOutPoint = keyframes.find((point) => point.easing === "easeInOut");
  if (easeInOutPoint) return "easeInOut";
  return "linear";
};

export const timelineToRemotionCompiler: TimelineToRemotionCompiler = {
  compile: (timelineState, bindingConfig) => {
    const sequences = [...timelineState.clips]
      .sort((a, b) => a.start - b.start)
      .map((clip) => {
        const from = secondsToFrames(clip.start, bindingConfig.fps);
        const durationInFrames = secondsToFrames(clip.end - clip.start, bindingConfig.fps);

        const spec: RemotionSequenceSpec = {
          id: `${bindingConfig.compositionId}:${clip.id}`,
          from,
          durationInFrames,
          clipId: clip.id,
          layerId: clip.layerId,
          trackId: clip.trackId,
          speed: clip.speed,
          style: {
            color: clip.color,
            easing: resolvePrimaryEasing(clip.keyframes),
          },
          transitionToNext: clip.transitionToNext,
          groupWithNext: clip.groupWithNext,
          keyframes: clip.keyframes,
        };

        return spec;
      });

    return {
      compositionId: bindingConfig.compositionId,
      fps: bindingConfig.fps,
      width: bindingConfig.width,
      height: bindingConfig.height,
      durationInFrames: resolveDurationInFrames(timelineState.clips, bindingConfig),
      qualityProfile: bindingConfig.qualityProfile,
      snapshotId: timelineState.snapshotId,
      compileVersion: timelineState.compileVersion,
      sequences,
    };
  },
};

export interface PreviewRenderRequest {
  snapshotId: string;
  compileVersion: number;
  bindingConfig: RemotionBindingConfig;
}

export interface FinalRenderRequest extends PreviewRenderRequest {
  exportFormat: "mp4" | "mov" | "webm";
  qualityPreset: "standard" | "high" | "ultra";
}

export interface PreviewRenderResponse {
  status: "ready";
  composition: RemotionCompositionSpec;
}

export const buildPreviewRender = (
  timelineState: EditorEngineState,
  request: PreviewRenderRequest,
): PreviewRenderResponse => {
  const composition = timelineToRemotionCompiler.compile(timelineState, request.bindingConfig);
  return {
    status: "ready",
    composition,
  };
};
