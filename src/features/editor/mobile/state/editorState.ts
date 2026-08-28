/**
 * Shared mobile-editor state.
 *
 * A small reducer holding everything the mobile UI needs to render: the
 * project (clips, tracks, transitions), the playhead, the current selection,
 * the active tool, and which panel sheet is open. Both layouts (portrait,
 * landscape) mount the same reducer so switching orientation mid-edit
 * doesn't lose state.
 *
 * The reducer is deliberately independent of the giant `VT_E1.jsx` desktop
 * editor. When we're ready to unify, this module can be lifted into a
 * shared parent and the desktop file dispatches into the same reducer.
 */
import { useCallback, useMemo, useReducer } from 'react';
import type { VtE1Clip, VtE1Project, VtE1Transition } from '../../../../shared/vtE1TimelineContract';
import type { VtE1EditorStore as CanonicalEditorStore } from '../../shared/editorStoreContract';

/* ------------------------------------------------------------------ */
/* Track                                                              */
/* ------------------------------------------------------------------ */

export type TrackKind = 'video' | 'audio' | 'overlay' | 'caption';

export interface Track {
  id: string;
  name: string;
  kind: TrackKind;
  muted?: boolean;
  locked?: boolean;
  hidden?: boolean;
  color?: string;
}

/* ------------------------------------------------------------------ */
/* Selection                                                          */
/* ------------------------------------------------------------------ */

export interface Selection {
  clipIds: string[];
  trackId: string | null;
  transitionId: string | null;
}

const emptySelection: Selection = { clipIds: [], trackId: null, transitionId: null };

/* ------------------------------------------------------------------ */
/* Tool                                                               */
/* ------------------------------------------------------------------ */

export type Tool =
  | 'select'
  | 'trim'
  | 'split'
  | 'text'
  | 'audio'
  | 'transitions'
  | 'effects'
  | 'export';

/* ------------------------------------------------------------------ */
/* Full state                                                         */
/* ------------------------------------------------------------------ */

export interface EditorState {
  project: VtE1Project & { tracks: Track[]; durationSec: number };
  playheadSec: number;
  playing: boolean;
  playbackRate: number;
  zoomPxPerSec: number;      // timeline scale (pixels per second)
  selection: Selection;
  tool: Tool;
  panel: {
    open: boolean;
    /** which panel is currently shown */
    id: Tool;
    /** 0..1 — sheet expansion (0 = collapsed peek, 1 = full-height). */
    height: number;
  };
  history: {
    past: string[];   // serialised snapshots
    future: string[];
  };
}

/* ------------------------------------------------------------------ */
/* Actions                                                            */
/* ------------------------------------------------------------------ */

export type EditorAction =
  | { type: 'setPlayhead'; sec: number }
  | { type: 'setPlaying'; playing: boolean }
  | { type: 'togglePlaying' }
  | { type: 'setPlaybackRate'; rate: number }
  | { type: 'setZoom'; pxPerSec: number }
  | { type: 'selectClip'; id: string; additive?: boolean }
  | { type: 'selectTrack'; id: string | null }
  | { type: 'selectTransition'; id: string | null }
  | { type: 'clearSelection' }
  | { type: 'setTool'; tool: Tool }
  | { type: 'openPanel'; id: Tool; height?: number }
  | { type: 'closePanel' }
  | { type: 'setPanelHeight'; height: number }
  | { type: 'setPanelId'; id: Tool }
  | { type: 'addClip'; clip: VtE1Clip }
  | { type: 'updateClip'; id: string; patch: Partial<VtE1Clip> }
  | { type: 'moveClip'; id: string; deltaSec: number }
  | { type: 'trimClip'; id: string; side: 'left' | 'right'; sec: number }
  | { type: 'splitClipAtPlayhead'; id: string }
  | { type: 'deleteClips'; ids: string[] }
  | { type: 'duplicateClip'; id: string }
  | { type: 'muteTrack'; id: string; muted?: boolean }
  | { type: 'lockTrack'; id: string; locked?: boolean }
  | { type: 'hideTrack'; id: string; hidden?: boolean }
  | { type: 'addTransition'; transition: VtE1Transition }
  | { type: 'removeTransition'; id: string }
  | { type: 'undo' }
  | { type: 'redo' };

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const snapshot = (s: EditorState): string =>
  JSON.stringify({
    project: s.project,
    playhead: s.playheadSec,
    selection: s.selection,
  });

const withHistory = (prev: EditorState, next: EditorState): EditorState => ({
  ...next,
  history: {
    past: [...prev.history.past.slice(-49), snapshot(prev)],
    future: [],
  },
});

const clampSec = (v: number, max: number) => Math.max(0, Math.min(v, max));

/* ------------------------------------------------------------------ */
/* Reducer                                                            */
/* ------------------------------------------------------------------ */

export function initialState(project?: Partial<EditorState['project']>): EditorState {
  const p: EditorState['project'] = {
    clips: [],
    transitions: [],
    tracks: [
      { id: 't_video', name: 'Video', kind: 'video' },
      { id: 't_overlay', name: 'Overlay', kind: 'overlay' },
      { id: 't_audio', name: 'Audio', kind: 'audio' },
    ],
    durationSec: 30,
    ...(project ?? {}),
  };
  return {
    project: p,
    playheadSec: 0,
    playing: false,
    playbackRate: 1,
    zoomPxPerSec: 40,
    selection: emptySelection,
    tool: 'select',
    panel: { open: false, id: 'select', height: 0.55 },
    history: { past: [], future: [] },
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'setPlayhead':
      return { ...state, playheadSec: clampSec(action.sec, state.project.durationSec) };
    case 'setPlaying':
      return { ...state, playing: action.playing };
    case 'togglePlaying':
      return { ...state, playing: !state.playing };
    case 'setPlaybackRate':
      return { ...state, playbackRate: Math.max(0.1, Math.min(4, action.rate)) };
    case 'setZoom':
      return { ...state, zoomPxPerSec: Math.max(4, Math.min(400, action.pxPerSec)) };

    case 'selectClip': {
      const clipIds = action.additive
        ? state.selection.clipIds.includes(action.id)
          ? state.selection.clipIds.filter((x) => x !== action.id)
          : [...state.selection.clipIds, action.id]
        : [action.id];
      return { ...state, selection: { ...emptySelection, clipIds } };
    }
    case 'selectTrack':
      return { ...state, selection: { ...emptySelection, trackId: action.id } };
    case 'selectTransition':
      return { ...state, selection: { ...emptySelection, transitionId: action.id } };
    case 'clearSelection':
      return { ...state, selection: emptySelection };

    case 'setTool':
      return { ...state, tool: action.tool };

    case 'openPanel':
      return { ...state, panel: { open: true, id: action.id, height: action.height ?? state.panel.height } };
    case 'closePanel':
      return { ...state, panel: { ...state.panel, open: false } };
    case 'setPanelHeight':
      return { ...state, panel: { ...state.panel, height: Math.max(0.15, Math.min(1, action.height)) } };
    case 'setPanelId':
      return { ...state, panel: { ...state.panel, id: action.id } };

    case 'addClip': {
      const next = { ...state, project: { ...state.project, clips: [...state.project.clips, action.clip] } };
      return withHistory(state, next);
    }
    case 'updateClip': {
      const next = {
        ...state,
        project: {
          ...state.project,
          clips: state.project.clips.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
        },
      };
      return withHistory(state, next);
    }
    case 'moveClip': {
      const next = {
        ...state,
        project: {
          ...state.project,
          clips: state.project.clips.map((c) => {
            if (c.id !== action.id) return c;
            const dur = c.end - c.start;
            const start = Math.max(0, c.start + action.deltaSec);
            return { ...c, start, end: start + dur };
          }),
        },
      };
      return withHistory(state, next);
    }
    case 'trimClip': {
      const next = {
        ...state,
        project: {
          ...state.project,
          clips: state.project.clips.map((c) => {
            if (c.id !== action.id) return c;
            if (action.side === 'left') return { ...c, start: Math.min(c.end - 0.1, Math.max(0, action.sec)) };
            return { ...c, end: Math.max(c.start + 0.1, Math.min(state.project.durationSec, action.sec)) };
          }),
        },
      };
      return withHistory(state, next);
    }
    case 'splitClipAtPlayhead': {
      const clip = state.project.clips.find((c) => c.id === action.id);
      if (!clip || state.playheadSec <= clip.start || state.playheadSec >= clip.end) return state;
      const left = { ...clip, end: state.playheadSec };
      const right = { ...clip, id: `${clip.id}_r_${Date.now().toString(36)}`, start: state.playheadSec };
      const next = {
        ...state,
        project: {
          ...state.project,
          clips: state.project.clips.flatMap((c) => (c.id === clip.id ? [left, right] : [c])),
        },
      };
      return withHistory(state, next);
    }
    case 'deleteClips': {
      const set = new Set(action.ids);
      const next = {
        ...state,
        project: {
          ...state.project,
          clips: state.project.clips.filter((c) => !set.has(c.id)),
          transitions: (state.project.transitions ?? []).filter(
            (t) => !set.has(t.leftClipId) && !set.has(t.rightClipId),
          ),
        },
        selection: emptySelection,
      };
      return withHistory(state, next);
    }
    case 'duplicateClip': {
      const clip = state.project.clips.find((c) => c.id === action.id);
      if (!clip) return state;
      const dur = clip.end - clip.start;
      const dup: VtE1Clip = { ...clip, id: `${clip.id}_dup_${Date.now().toString(36)}`, start: clip.end, end: clip.end + dur };
      return withHistory(state, {
        ...state,
        project: { ...state.project, clips: [...state.project.clips, dup] },
      });
    }
    case 'muteTrack':
      return {
        ...state,
        project: {
          ...state.project,
          tracks: state.project.tracks.map((t) =>
            t.id === action.id ? { ...t, muted: action.muted ?? !t.muted } : t,
          ),
        },
      };
    case 'lockTrack':
      return {
        ...state,
        project: {
          ...state.project,
          tracks: state.project.tracks.map((t) =>
            t.id === action.id ? { ...t, locked: action.locked ?? !t.locked } : t,
          ),
        },
      };
    case 'hideTrack':
      return {
        ...state,
        project: {
          ...state.project,
          tracks: state.project.tracks.map((t) =>
            t.id === action.id ? { ...t, hidden: action.hidden ?? !t.hidden } : t,
          ),
        },
      };
    case 'addTransition': {
      const next = {
        ...state,
        project: {
          ...state.project,
          transitions: [...(state.project.transitions ?? []), action.transition],
        },
      };
      return withHistory(state, next);
    }
    case 'removeTransition': {
      const next = {
        ...state,
        project: {
          ...state.project,
          transitions: (state.project.transitions ?? []).filter((t) => (t as { id?: string }).id !== action.id),
        },
      };
      return withHistory(state, next);
    }

    case 'undo': {
      const last = state.history.past[state.history.past.length - 1];
      if (!last) return state;
      const past = state.history.past.slice(0, -1);
      const future = [snapshot(state), ...state.history.future];
      const parsed = JSON.parse(last) as { project: EditorState['project']; playhead: number; selection: Selection };
      return { ...state, project: parsed.project, playheadSec: parsed.playhead, selection: parsed.selection, history: { past, future } };
    }
    case 'redo': {
      const next = state.history.future[0];
      if (!next) return state;
      const parsed = JSON.parse(next) as { project: EditorState['project']; playhead: number; selection: Selection };
      const past = [...state.history.past, snapshot(state)];
      const future = state.history.future.slice(1);
      return { ...state, project: parsed.project, playheadSec: parsed.playhead, selection: parsed.selection, history: { past, future } };
    }

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* useEditorState hook                                                */
/* ------------------------------------------------------------------ */

/** Transitional mobile implementation of the canonical VT-E1 store contract. */
export interface EditorStore extends CanonicalEditorStore {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Derived read-only helpers.
  selectedClips: VtE1Clip[];
  trackById: (id: string) => Track | undefined;
  clipsOnTrack: (trackId: string) => VtE1Clip[];
  activeClipAtPlayhead: (trackId?: string) => VtE1Clip | undefined;
  canUndo: boolean;
  canRedo: boolean;
}

export function useEditorState(seed?: Partial<EditorState['project']>): EditorStore {
  const [state, dispatch] = useReducer(editorReducer, undefined, () => initialState(seed));

  const selectedClips = useMemo(
    () => state.project.clips.filter((c) => state.selection.clipIds.includes(c.id)),
    [state.project.clips, state.selection.clipIds],
  );
  const trackById = useCallback(
    (id: string) => state.project.tracks.find((t) => t.id === id),
    [state.project.tracks],
  );
  const clipsOnTrack = useCallback(
    (trackId: string) => state.project.clips.filter((c) => c.trackId === trackId).sort((a, b) => a.start - b.start),
    [state.project.clips],
  );
  const activeClipAtPlayhead = useCallback(
    (trackId?: string) =>
      state.project.clips.find(
        (c) =>
          state.playheadSec >= c.start &&
          state.playheadSec < c.end &&
          (trackId ? c.trackId === trackId : true),
      ),
    [state.project.clips, state.playheadSec],
  );

  return {
    state,
    dispatch,
    selectedClips,
    trackById,
    clipsOnTrack,
    activeClipAtPlayhead,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
  };
}
