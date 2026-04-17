export type EditorTrackId = "media" | "text" | "audio" | "effects";

export interface EditorTrack {
  id: EditorTrackId;
  name: string;
  order: number;
}

export interface KeyframePoint {
  time: number;
  props: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
    blur?: number;
  };
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring";
}

export interface EditorTimelineClip {
  id: string;
  layerId: string;
  trackId: EditorTrackId;
  start: number;
  end: number;
  color: string;
  speed: number;
  keyframes: KeyframePoint[];
  groupWithNext: boolean;
  transitionToNext?: {
    type: "none" | "crossfade" | "wipe" | "slide";
    duration: number;
  };
}

export interface EditorEngineState {
  tracks: EditorTrack[];
  clips: EditorTimelineClip[];
  history: EditorTimelineCommand[];
  snapshotId: string;
  compileVersion: number;
  past: EditorTimelineClip[][];
  future: EditorTimelineClip[][];
}

export type EditorTimelineCommand =
  | { type: "insertClip"; clip: EditorTimelineClip }
  | { type: "moveClip"; clipId: string; trackId: EditorTrackId; start: number; end: number }
  | { type: "trimClipStart"; clipId: string; start: number }
  | { type: "trimClipEnd"; clipId: string; end: number }
  | { type: "splitClip"; clipId: string; at: number; newClipId: string }
  | { type: "deleteClip"; clipId: string }
  | { type: "deleteSegment"; clipId: string; side: "left" | "right"; at: number }
  | { type: "groupSeam"; leftClipId: string; enabled: boolean }
  | {
      type: "setTransition";
      leftClipId: string;
      transition: EditorTimelineClip["transitionToNext"];
    }
  | { type: "setClipColor"; clipId: string; color: string }
  | { type: "setClipSpeed"; clipId: string; speed: number }
  | { type: "setClipKeyframes"; clipId: string; keyframes: KeyframePoint[] }
  | { type: "undo" }
  | { type: "redo" };

const clampNumber = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const withSnapshot = (state: EditorEngineState): EditorEngineState => ({
  ...state,
  snapshotId: `${Date.now()}-${state.compileVersion + 1}`,
  compileVersion: state.compileVersion + 1,
});

const applyCommandToClips = (
  clips: EditorTimelineClip[],
  command: Exclude<EditorTimelineCommand, { type: "undo" } | { type: "redo" }>,
): EditorTimelineClip[] => {
  switch (command.type) {
    case "insertClip": {
      const existing = clips.find((clip) => clip.id === command.clip.id);
      if (existing) return clips;
      return [...clips, command.clip];
    }
    case "moveClip": {
      return clips.map((clip) => {
        if (clip.id !== command.clipId) return clip;
        return {
          ...clip,
          trackId: command.trackId,
          start: clampNumber(command.start, 0, 10000),
          end: clampNumber(Math.max(command.end, command.start + 0.05), 0.05, 10000),
        };
      });
    }
    case "trimClipStart": {
      return clips.map((clip) => {
        if (clip.id !== command.clipId) return clip;
        return {
          ...clip,
          start: clampNumber(command.start, 0, clip.end - 0.05),
        };
      });
    }
    case "trimClipEnd": {
      return clips.map((clip) => {
        if (clip.id !== command.clipId) return clip;
        return {
          ...clip,
          end: clampNumber(command.end, clip.start + 0.05, 10000),
        };
      });
    }
    case "splitClip": {
      const target = clips.find((clip) => clip.id === command.clipId);
      if (!target) return clips;
      if (command.at <= target.start + 0.05 || command.at >= target.end - 0.05) return clips;
      const left: EditorTimelineClip = { ...target, end: command.at };
      const right: EditorTimelineClip = {
        ...target,
        id: command.newClipId,
        start: command.at,
        groupWithNext: false,
        transitionToNext: undefined,
      };
      return clips.flatMap((clip) => {
        if (clip.id !== target.id) return [clip];
        return [left, right];
      });
    }
    case "deleteClip": {
      return clips.filter((clip) => clip.id !== command.clipId);
    }
    case "deleteSegment": {
      return clips.flatMap((clip) => {
        if (clip.id !== command.clipId) return [clip];
        if (command.side === "left") {
          if (command.at >= clip.end - 0.05) return [];
          return [{ ...clip, start: clampNumber(command.at, 0, clip.end - 0.05) }];
        }
        if (command.at <= clip.start + 0.05) return [];
        return [{ ...clip, end: clampNumber(command.at, clip.start + 0.05, 10000) }];
      });
    }
    case "groupSeam": {
      return clips.map((clip) =>
        clip.id === command.leftClipId ? { ...clip, groupWithNext: command.enabled } : clip,
      );
    }
    case "setTransition": {
      return clips.map((clip) =>
        clip.id === command.leftClipId ? { ...clip, transitionToNext: command.transition } : clip,
      );
    }
    case "setClipColor": {
      return clips.map((clip) =>
        clip.id === command.clipId ? { ...clip, color: command.color } : clip,
      );
    }
    case "setClipSpeed": {
      return clips.map((clip) =>
        clip.id === command.clipId
          ? { ...clip, speed: clampNumber(command.speed, 0.1, 8) }
          : clip,
      );
    }
    case "setClipKeyframes": {
      return clips.map((clip) =>
        clip.id === command.clipId ? { ...clip, keyframes: command.keyframes } : clip,
      );
    }
  }
};

export const createEditorEngineState = (clips: EditorTimelineClip[]): EditorEngineState => ({
  tracks: [
    { id: "media", name: "Media", order: 0 },
    { id: "text", name: "Text", order: 1 },
    { id: "audio", name: "Audio", order: 2 },
    { id: "effects", name: "Effects", order: 3 },
  ],
  clips,
  history: [],
  snapshotId: `${Date.now()}-0`,
  compileVersion: 0,
  past: [],
  future: [],
});

export const reduceEditorCommand = (
  state: EditorEngineState,
  command: EditorTimelineCommand,
): EditorEngineState => {
  if (command.type === "undo") {
    const previous = state.past[state.past.length - 1];
    if (!previous) return state;
    return withSnapshot({
      ...state,
      clips: previous,
      past: state.past.slice(0, -1),
      future: [state.clips, ...state.future],
    });
  }

  if (command.type === "redo") {
    const next = state.future[0];
    if (!next) return state;
    return withSnapshot({
      ...state,
      clips: next,
      past: [...state.past, state.clips],
      future: state.future.slice(1),
    });
  }

  const nextClips = applyCommandToClips(state.clips, command);
  if (nextClips === state.clips) return state;

  return withSnapshot({
    ...state,
    clips: nextClips,
    history: [...state.history, command],
    past: [...state.past, state.clips],
    future: [],
  });
};

export const replayTimelineCommands = (
  initial: EditorEngineState,
  commands: Array<Exclude<EditorTimelineCommand, { type: "undo" } | { type: "redo" }>>,
): EditorEngineState => {
  return commands.reduce(
    (state, command) => reduceEditorCommand(state, command),
    initial,
  );
};

export const getClipAtTime = (
  clips: EditorTimelineClip[],
  time: number,
): EditorTimelineClip[] => clips.filter((clip) => clip.start <= time && clip.end >= time);

export const findAdjacentClipOnTrack = (
  clips: EditorTimelineClip[],
  trackId: EditorTrackId,
  clipId: string,
): { left?: EditorTimelineClip; right?: EditorTimelineClip } => {
  const trackClips = clips
    .filter((clip) => clip.trackId === trackId)
    .sort((a, b) => a.start - b.start);
  const index = trackClips.findIndex((clip) => clip.id === clipId);
  return {
    left: index > 0 ? trackClips[index - 1] : undefined,
    right: index >= 0 && index < trackClips.length - 1 ? trackClips[index + 1] : undefined,
  };
};
