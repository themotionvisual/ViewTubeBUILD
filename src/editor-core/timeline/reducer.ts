import type {
  EditorClip,
  EditorKeyframe,
  TimelineCommand,
  TimelineState,
} from "../contracts";
import { snapFrame } from "./snap";

const MIN_CLIP_FRAMES = 1;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const stateSnapshot = (state: TimelineState): Omit<TimelineState, "history" | "past" | "future"> => ({
  fps: state.fps,
  tracks: state.tracks,
  clips: state.clips,
  keyframes: state.keyframes,
  transitions: state.transitions,
  effects: state.effects,
  selectedClipId: state.selectedClipId,
  playheadFrame: state.playheadFrame,
  zoom: state.zoom,
  snapping: state.snapping,
  snapStepFrames: state.snapStepFrames,
  pointerAction: state.pointerAction,
});

const normalizeClip = (clip: EditorClip): EditorClip => {
  const startFrame = Math.max(0, clip.startFrame);
  const endFrame = Math.max(startFrame + MIN_CLIP_FRAMES, clip.endFrame);
  return {
    ...clip,
    startFrame,
    endFrame,
    volume: clip.volume ?? 1,
    muted: clip.muted ?? false,
    x: clip.x ?? 0,
    y: clip.y ?? 0,
    scale: clip.scale ?? 1,
    rotation: clip.rotation ?? 0,
    opacity: clip.opacity ?? 1,
    clipType: clip.clipType ?? (clip.kind === "text" ? "text" : "media"),
    mediaUrl: clip.mediaUrl ?? "",
    text: clip.text ?? "",
  };
};

const upsertClip = (clips: EditorClip[], clip: EditorClip): EditorClip[] => {
  const index = clips.findIndex((item) => item.id === clip.id);
  if (index < 0) return [...clips, clip];
  return clips.map((item) => (item.id === clip.id ? clip : item));
};

const remapKeyframesForSplit = (
  keyframes: EditorKeyframe[],
  clipId: string,
  newClipId: string,
  splitFrame: number,
): EditorKeyframe[] => {
  return keyframes.flatMap((keyframe) => {
    if (keyframe.clipId !== clipId) return [keyframe];
    if (keyframe.frame < splitFrame) return [keyframe];
    return [{ ...keyframe, id: `${keyframe.id}-r`, clipId: newClipId }];
  });
};

const removeClipRefs = (state: TimelineState, clipId: string): TimelineState => ({
  ...state,
  clips: state.clips.filter((clip) => clip.id !== clipId),
  keyframes: state.keyframes.filter((keyframe) => keyframe.clipId !== clipId),
  transitions: state.transitions.filter(
    (transition) => transition.fromClipId !== clipId && transition.toClipId !== clipId,
  ),
  selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
});

const applySnap = (state: TimelineState, frame: number, clipId?: string): number => {
  if (!state.snapping) return frame;
  return snapFrame({
    frame,
    clipId,
    clips: state.clips,
    playheadFrame: state.playheadFrame,
    stepFrames: state.snapStepFrames,
    thresholdFrames: Math.max(2, Math.floor(state.snapStepFrames / 2)),
  });
};

export const createTimelineState = (fps = 30): TimelineState => ({
  fps,
  tracks: [
    { id: "video-1", name: "Video", kind: "video", index: 0, viewportState: "normal" },
    { id: "image-1", name: "Image", kind: "image", index: 1, viewportState: "normal" },
    { id: "text-1", name: "Text", kind: "text", index: 2, viewportState: "normal" },
    { id: "audio-1", name: "Audio", kind: "audio", index: 3, viewportState: "normal" },
  ],
  clips: [],
  keyframes: [],
  transitions: [],
  effects: [],
  selectedClipId: null,
  playheadFrame: 0,
  zoom: 1,
  snapping: true,
  snapStepFrames: Math.max(1, Math.floor(fps / 2)),
  history: [],
  past: [],
  future: [],
  pointerAction: null,
});

const splitClipAtFrame = (
  state: TimelineState,
  clipId: string,
  frame: number,
  newClipId: string,
): TimelineState => {
  const clip = state.clips.find((item) => item.id === clipId);
  if (!clip) return state;
  const safeFrame = clamp(frame, clip.startFrame + MIN_CLIP_FRAMES, clip.endFrame - MIN_CLIP_FRAMES);
  if (safeFrame <= clip.startFrame || safeFrame >= clip.endFrame) return state;

  const left = { ...clip, endFrame: safeFrame, groupedWithNext: false };
  const right = { ...clip, id: newClipId, startFrame: safeFrame };

  return {
    ...state,
    clips: state.clips.flatMap((item) => (item.id === clip.id ? [left, right] : [item])),
    keyframes: remapKeyframesForSplit(state.keyframes, clip.id, newClipId, safeFrame),
    transitions: state.transitions.filter((transition) => transition.fromClipId !== clip.id),
    selectedClipId: right.id,
  };
};

const applyArrowCut = (
  state: TimelineState,
  clipId: string,
  frame: number,
  deleteSide: "none" | "left" | "right",
): TimelineState => {
  const clip = state.clips.find((item) => item.id === clipId);
  if (!clip) return state;
  const cut = clamp(frame, clip.startFrame + MIN_CLIP_FRAMES, clip.endFrame - MIN_CLIP_FRAMES);
  if (cut <= clip.startFrame || cut >= clip.endFrame) return state;

  if (deleteSide === "left") {
    return {
      ...state,
      clips: state.clips.map((item) =>
        item.id === clipId ? { ...item, startFrame: cut, groupedWithNext: false } : item,
      ),
      keyframes: state.keyframes
        .filter((keyframe) => keyframe.clipId !== clipId || keyframe.frame >= cut)
        .map((keyframe) =>
          keyframe.clipId === clipId && keyframe.frame < cut
            ? { ...keyframe, frame: cut }
            : keyframe,
        ),
      transitions: state.transitions.filter((transition) => transition.fromClipId !== clipId),
    };
  }

  if (deleteSide === "right") {
    return {
      ...state,
      clips: state.clips.map((item) =>
        item.id === clipId ? { ...item, endFrame: cut, groupedWithNext: false } : item,
      ),
      keyframes: state.keyframes.filter(
        (keyframe) => keyframe.clipId !== clipId || keyframe.frame <= cut,
      ),
      transitions: state.transitions.filter((transition) => transition.fromClipId !== clipId),
    };
  }

  return splitClipAtFrame(state, clipId, cut, `${clipId}-split-${Date.now()}`);
};

const applyMutation = (
  state: TimelineState,
  command: Exclude<TimelineCommand, { type: "undo" } | { type: "redo" }>,
): TimelineState => {
  switch (command.type) {
    case "insertClip": {
      const safeClip = normalizeClip(command.clip);
      return {
        ...state,
        clips: upsertClip(state.clips, safeClip),
        selectedClipId: safeClip.id,
      };
    }
    case "moveClip": {
      const rawStart = Math.max(0, command.startFrame);
      const rawEnd = Math.max(rawStart + MIN_CLIP_FRAMES, command.endFrame);
      const snappedStart = applySnap(state, rawStart, command.clipId);
      const duration = rawEnd - rawStart;
      const snappedEnd = clamp(snappedStart + duration, snappedStart + MIN_CLIP_FRAMES, 20000);

      return {
        ...state,
        clips: state.clips.map((clip) =>
          clip.id === command.clipId
            ? {
                ...clip,
                trackId: command.trackId,
                startFrame: snappedStart,
                endFrame: snappedEnd,
              }
            : clip,
        ),
        keyframes: state.keyframes.map((keyframe) => {
          const target = state.clips.find((clip) => clip.id === command.clipId);
          if (!target || keyframe.clipId !== command.clipId) return keyframe;
          const shift = snappedStart - target.startFrame;
          return { ...keyframe, frame: Math.max(0, keyframe.frame + shift) };
        }),
      };
    }
    case "trimClipStart": {
      return {
        ...state,
        clips: state.clips.map((clip) => {
          if (clip.id !== command.clipId) return clip;
          const snapped = applySnap(state, command.startFrame, clip.id);
          return { ...clip, startFrame: clamp(snapped, 0, clip.endFrame - MIN_CLIP_FRAMES) };
        }),
      };
    }
    case "trimClipEnd": {
      return {
        ...state,
        clips: state.clips.map((clip) => {
          if (clip.id !== command.clipId) return clip;
          const snapped = applySnap(state, command.endFrame, clip.id);
          return {
            ...clip,
            endFrame: clamp(snapped, clip.startFrame + MIN_CLIP_FRAMES, 20000),
          };
        }),
      };
    }
    case "splitClip":
      return splitClipAtFrame(state, command.clipId, command.frame, command.newClipId);
    case "deleteClip":
      return removeClipRefs(state, command.clipId);
    case "arrowCut":
      return applyArrowCut(state, command.clipId, command.frame, command.deleteSide);
    case "groupSeam": {
      return {
        ...state,
        clips: state.clips.map((clip) =>
          clip.id === command.clipId ? { ...clip, groupedWithNext: command.enabled } : clip,
        ),
      };
    }
    case "setTransition": {
      const transitions = state.transitions.filter(
        (transition) => transition.fromClipId !== command.transition.fromClipId,
      );
      return {
        ...state,
        transitions: [...transitions, command.transition],
      };
    }
    case "setKeyframe": {
      const keyframes = state.keyframes.filter((keyframe) => keyframe.id !== command.keyframe.id);
      return {
        ...state,
        keyframes: [...keyframes, command.keyframe].sort((a, b) => a.frame - b.frame),
      };
    }
    case "removeKeyframe": {
      return {
        ...state,
        keyframes: state.keyframes.filter((keyframe) => keyframe.id !== command.keyframeId),
      };
    }
    case "setPlayhead": {
      return {
        ...state,
        playheadFrame: Math.max(0, applySnap(state, command.frame)),
      };
    }
    case "setZoom": {
      return {
        ...state,
        zoom: clamp(command.zoom, 0.25, 8),
      };
    }
    case "setSnapping": {
      return {
        ...state,
        snapping: command.enabled,
      };
    }
    case "setSnapStep": {
      return {
        ...state,
        snapStepFrames: clamp(command.frames, 1, Math.max(1, state.fps * 5)),
      };
    }
    case "selectClip": {
      return {
        ...state,
        selectedClipId: command.clipId,
      };
    }
    case "setClipColor": {
      return {
        ...state,
        clips: state.clips.map((clip) =>
          clip.id === command.clipId ? { ...clip, color: command.color } : clip,
        ),
      };
    }
    case "setClipSpeed": {
      return {
        ...state,
        clips: state.clips.map((clip) =>
          clip.id === command.clipId
            ? { ...clip, speed: clamp(command.speed, 0.1, 8) }
            : clip,
        ),
      };
    }
    case "setClipProps": {
      return {
        ...state,
        clips: state.clips.map((clip) =>
          clip.id === command.clipId
            ? { ...clip, ...command.props }
            : clip,
        ),
      };
    }
    case "setTrackViewportState": {
      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === command.trackId
            ? { ...track, viewportState: command.viewportState }
            : track,
        ),
      };
    }
    case "beginPointerAction": {
      return {
        ...state,
        pointerAction: command.action,
      };
    }
    case "cancelPointerAction": {
      return {
        ...state,
        pointerAction: null,
      };
    }
    case "commitPointerAction": {
      return {
        ...state,
        pointerAction: null,
      };
    }
  }
};

export const applyTimelineCommand = (state: TimelineState, command: TimelineCommand): TimelineState => {
  if (command.type === "undo") {
    const previous = state.past[state.past.length - 1];
    if (!previous) return state;
    return {
      ...state,
      ...previous,
      history: state.history,
      past: state.past.slice(0, -1),
      future: [stateSnapshot(state), ...state.future],
    };
  }

  if (command.type === "redo") {
    const next = state.future[0];
    if (!next) return state;
    return {
      ...state,
      ...next,
      history: state.history,
      past: [...state.past, stateSnapshot(state)],
      future: state.future.slice(1),
    };
  }

  const nextState = applyMutation(state, command);
  if (nextState === state) return state;

  return {
    ...nextState,
    history: [...state.history, command],
    past: [...state.past, stateSnapshot(state)],
    future: [],
  };
};

export const getAdjacentClipOnTrack = (
  state: TimelineState,
  clipId: string,
): { left?: EditorClip; right?: EditorClip } => {
  const current = state.clips.find((clip) => clip.id === clipId);
  if (!current) return {};
  const ordered = state.clips
    .filter((clip) => clip.trackId === current.trackId)
    .sort((a, b) => a.startFrame - b.startFrame);
  const index = ordered.findIndex((clip) => clip.id === clipId);

  return {
    left: index > 0 ? ordered[index - 1] : undefined,
    right: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
};
