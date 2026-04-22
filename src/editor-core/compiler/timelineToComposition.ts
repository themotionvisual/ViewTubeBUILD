import type { CompositionBinding, TimelineState, TransitionType } from "../contracts";

export interface CompositionSequenceSpec {
  id: string;
  clipId: string;
  trackId: string;
  from: number;
  durationInFrames: number;
  transitionType: TransitionType;
  easing: "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring" | "bezier";
  color: string;
  speed: number;
  groupedWithNext: boolean;
}

export interface CompositionSpec {
  compositionId: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  sequences: CompositionSequenceSpec[];
}

export const timelineToComposition = (
  state: TimelineState,
  binding: CompositionBinding,
): CompositionSpec => {
  const transitionByFromClip = new Map(
    state.transitions.map((transition) => [transition.fromClipId, transition]),
  );
  const keyframeByClip = new Map<string, TimelineState["keyframes"]>();
  state.keyframes.forEach((keyframe) => {
    const list = keyframeByClip.get(keyframe.clipId) ?? [];
    list.push(keyframe);
    keyframeByClip.set(keyframe.clipId, list);
  });

  const sequences = [...state.clips]
    .sort((a, b) => a.startFrame - b.startFrame)
    .map((clip) => {
      const keyframes = keyframeByClip.get(clip.id) ?? [];
      const easing =
        keyframes.find((keyframe) => keyframe.easing === "spring")?.easing ??
        keyframes[0]?.easing ??
        "linear";
      const transitionType = transitionByFromClip.get(clip.id)?.type ?? "none";
      return {
        id: `${binding.compositionId}:${clip.id}`,
        clipId: clip.id,
        trackId: clip.trackId,
        from: clip.startFrame,
        durationInFrames: Math.max(1, clip.endFrame - clip.startFrame),
        transitionType,
        easing,
        color: clip.color,
        speed: clip.speed,
        groupedWithNext: clip.groupedWithNext,
      };
    });

  const timelineDuration = state.clips.reduce((max, clip) => Math.max(max, clip.endFrame), 1);

  return {
    compositionId: binding.compositionId,
    width: binding.width,
    height: binding.height,
    fps: binding.fps,
    durationInFrames: Math.max(binding.durationInFrames, timelineDuration),
    sequences,
  };
};
