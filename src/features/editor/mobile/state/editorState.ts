/**
 * Shared mobile-editor state.
 *
 * Both mobile layouts mount the same reducer so orientation changes retain
 * state. During canonical unification the public mobile action API remains
 * stable while advanced timeline mutations delegate to shared operations.
 */
import { useCallback, useMemo, useReducer } from 'react';
import type { VtE1Clip, VtE1Project, VtE1Transition } from '../../../../shared/vtE1TimelineContract';
import {
  rippleDeleteTimelineClips,
  slideTimelineClip,
  slipTimelineClip,
  splitTimelineClip,
} from '../../../../shared/vtE1TimelineOperations.js';

export type TrackKind = 'video' | 'audio' | 'overlay' | 'caption';
export interface Track { id: string; name: string; kind: TrackKind; muted?: boolean; locked?: boolean; hidden?: boolean; color?: string; }
export interface Selection { clipIds: string[]; trackId: string | null; transitionId: string | null; }
const emptySelection: Selection = { clipIds: [], trackId: null, transitionId: null };
export type Tool = 'select' | 'trim' | 'split' | 'text' | 'audio' | 'transitions' | 'effects' | 'export';

export interface EditorState {
  project: VtE1Project & { tracks: Track[]; durationSec: number };
  playheadSec: number;
  playing: boolean;
  playbackRate: number;
  zoomPxPerSec: number;
  selection: Selection;
  tool: Tool;
  panel: { open: boolean; id: Tool; height: number };
  history: { past: string[]; future: string[] };
}

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
  | { type: 'slipClip'; id: string; deltaSec: number; sourceDurationSec?: number }
  | { type: 'slideClip'; id: string; deltaSec: number }
  | { type: 'deleteClips'; ids: string[] }
  | { type: 'rippleDeleteClips'; ids: string[] }
  | { type: 'duplicateClip'; id: string }
  | { type: 'muteTrack'; id: string; muted?: boolean }
  | { type: 'lockTrack'; id: string; locked?: boolean }
  | { type: 'hideTrack'; id: string; hidden?: boolean }
  | { type: 'addTransition'; transition: VtE1Transition }
  | { type: 'removeTransition'; id: string }
  | { type: 'undo' }
  | { type: 'redo' };

const snapshot = (s: EditorState): string => JSON.stringify({ project: s.project, playhead: s.playheadSec, selection: s.selection });
const withHistory = (prev: EditorState, next: EditorState): EditorState => ({ ...next, history: { past: [...prev.history.past.slice(-49), snapshot(prev)], future: [] } });
const clampSec = (v: number, max: number) => Math.max(0, Math.min(v, max));
const withoutTransitionsForClips = (transitions: VtE1Transition[] | undefined, ids: string[]) => {
  const removed = new Set(ids);
  return (transitions ?? []).filter((transition) => !removed.has(transition.leftClipId) && !removed.has(transition.rightClipId));
};

export function initialState(project?: Partial<EditorState['project']>): EditorState {
  const p: EditorState['project'] = {
    clips: [], transitions: [],
    tracks: [
      { id: 't_video', name: 'Video', kind: 'video' },
      { id: 't_overlay', name: 'Overlay', kind: 'overlay' },
      { id: 't_audio', name: 'Audio', kind: 'audio' },
    ],
    durationSec: 30,
    ...(project ?? {}),
  };
  return { project: p, playheadSec: 0, playing: false, playbackRate: 1, zoomPxPerSec: 40, selection: emptySelection, tool: 'select', panel: { open: false, id: 'select', height: 0.55 }, history: { past: [], future: [] } };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'setPlayhead': return { ...state, playheadSec: clampSec(action.sec, state.project.durationSec) };
    case 'setPlaying': return { ...state, playing: action.playing };
    case 'togglePlaying': return { ...state, playing: !state.playing };
    case 'setPlaybackRate': return { ...state, playbackRate: Math.max(0.1, Math.min(4, action.rate)) };
    case 'setZoom': return { ...state, zoomPxPerSec: Math.max(4, Math.min(400, action.pxPerSec)) };
    case 'selectClip': {
      const clipIds = action.additive ? (state.selection.clipIds.includes(action.id) ? state.selection.clipIds.filter((id) => id !== action.id) : [...state.selection.clipIds, action.id]) : [action.id];
      return { ...state, selection: { ...emptySelection, clipIds } };
    }
    case 'selectTrack': return { ...state, selection: { ...emptySelection, trackId: action.id } };
    case 'selectTransition': return { ...state, selection: { ...emptySelection, transitionId: action.id } };
    case 'clearSelection': return { ...state, selection: emptySelection };
    case 'setTool': return { ...state, tool: action.tool };
    case 'openPanel': return { ...state, panel: { open: true, id: action.id, height: action.height ?? state.panel.height } };
    case 'closePanel': return { ...state, panel: { ...state.panel, open: false } };
    case 'setPanelHeight': return { ...state, panel: { ...state.panel, height: Math.max(0.15, Math.min(1, action.height)) } };
    case 'setPanelId': return { ...state, panel: { ...state.panel, id: action.id } };
    case 'addClip': return withHistory(state, { ...state, project: { ...state.project, clips: [...state.project.clips, action.clip] } });
    case 'updateClip': return withHistory(state, { ...state, project: { ...state.project, clips: state.project.clips.map((clip) => clip.id === action.id ? { ...clip, ...action.patch } : clip) } });

    // Basic move/trim/delete semantics intentionally remain unchanged.
    case 'moveClip': {
      const clips = state.project.clips.map((clip) => {
        if (clip.id !== action.id) return clip;
        const duration = clip.end - clip.start;
        const start = Math.max(0, clip.start + action.deltaSec);
        return { ...clip, start, end: start + duration };
      });
      return withHistory(state, { ...state, project: { ...state.project, clips } });
    }
    case 'trimClip': {
      const clips = state.project.clips.map((clip) => {
        if (clip.id !== action.id) return clip;
        if (action.side === 'left') return { ...clip, start: Math.min(clip.end - 0.1, Math.max(0, action.sec)) };
        return { ...clip, end: Math.max(clip.start + 0.1, Math.min(state.project.durationSec, action.sec)) };
      });
      return withHistory(state, { ...state, project: { ...state.project, clips } });
    }
    case 'splitClipAtPlayhead': {
      const clip = state.project.clips.find((entry) => entry.id === action.id);
      if (!clip) return state;
      const split = splitTimelineClip(clip, state.playheadSec);
      if (!split) return state;
      const right: VtE1Clip = { ...split.right, id: `${clip.id}_r_${Date.now().toString(36)}` };
      const clips = state.project.clips.flatMap((entry) => entry.id === clip.id ? [split.left, right] : [entry]);
      return withHistory(state, { ...state, project: { ...state.project, clips } });
    }
    case 'slipClip': {
      const clip = state.project.clips.find((entry) => entry.id === action.id);
      if (!clip) return state;
      const slipped = slipTimelineClip(clip, action.deltaSec, action.sourceDurationSec ?? Number.POSITIVE_INFINITY);
      if (!slipped) return state;
      const clips = state.project.clips.map((entry) => entry.id === action.id ? slipped : entry);
      return withHistory(state, { ...state, project: { ...state.project, clips } });
    }
    case 'slideClip': {
      const result = slideTimelineClip(state.project.clips, action.id, action.deltaSec);
      if (!result.appliedDeltaSec) return state;
      return withHistory(state, { ...state, project: { ...state.project, clips: result.clips } });
    }
    case 'deleteClips': {
      const ids = action.ids;
      const removed = new Set(ids);
      return withHistory(state, {
        ...state,
        project: { ...state.project, clips: state.project.clips.filter((clip) => !removed.has(clip.id)), transitions: withoutTransitionsForClips(state.project.transitions, ids) },
        selection: emptySelection,
      });
    }
    case 'rippleDeleteClips': {
      if (!action.ids.length) return state;
      const clips = rippleDeleteTimelineClips(state.project.clips, action.ids);
      return withHistory(state, {
        ...state,
        project: { ...state.project, clips, transitions: withoutTransitionsForClips(state.project.transitions, action.ids) },
        selection: emptySelection,
      });
    }
    case 'duplicateClip': {
      const clip = state.project.clips.find((entry) => entry.id === action.id);
      if (!clip) return state;
      const duration = clip.end - clip.start;
      const duplicate: VtE1Clip = { ...clip, id: `${clip.id}_dup_${Date.now().toString(36)}`, start: clip.end, end: clip.end + duration };
      return withHistory(state, { ...state, project: { ...state.project, clips: [...state.project.clips, duplicate] } });
    }
    case 'muteTrack': return { ...state, project: { ...state.project, tracks: state.project.tracks.map((track) => track.id === action.id ? { ...track, muted: action.muted ?? !track.muted } : track) } };
    case 'lockTrack': return { ...state, project: { ...state.project, tracks: state.project.tracks.map((track) => track.id === action.id ? { ...track, locked: action.locked ?? !track.locked } : track) } };
    case 'hideTrack': return { ...state, project: { ...state.project, tracks: state.project.tracks.map((track) => track.id === action.id ? { ...track, hidden: action.hidden ?? !track.hidden } : track) } };
    case 'addTransition': return withHistory(state, { ...state, project: { ...state.project, transitions: [...(state.project.transitions ?? []), action.transition] } });
    case 'removeTransition': return withHistory(state, { ...state, project: { ...state.project, transitions: (state.project.transitions ?? []).filter((transition) => (transition as { id?: string }).id !== action.id) } });
    case 'undo': {
      const last = state.history.past[state.history.past.length - 1];
      if (!last) return state;
      const parsed = JSON.parse(last) as { project: EditorState['project']; playhead: number; selection: Selection };
      return { ...state, project: parsed.project, playheadSec: parsed.playhead, selection: parsed.selection, history: { past: state.history.past.slice(0, -1), future: [snapshot(state), ...state.history.future] } };
    }
    case 'redo': {
      const next = state.history.future[0];
      if (!next) return state;
      const parsed = JSON.parse(next) as { project: EditorState['project']; playhead: number; selection: Selection };
      return { ...state, project: parsed.project, playheadSec: parsed.playhead, selection: parsed.selection, history: { past: [...state.history.past, snapshot(state)], future: state.history.future.slice(1) } };
    }
    default: return state;
  }
}

export interface EditorStore {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  selectedClips: VtE1Clip[];
  trackById: (id: string) => Track | undefined;
  clipsOnTrack: (trackId: string) => VtE1Clip[];
  activeClipAtPlayhead: (trackId?: string) => VtE1Clip | undefined;
  canUndo: boolean;
  canRedo: boolean;
}

export function useEditorState(seed?: Partial<EditorState['project']>): EditorStore {
  const [state, dispatch] = useReducer(editorReducer, undefined, () => initialState(seed));
  const selectedClips = useMemo(() => state.project.clips.filter((clip) => state.selection.clipIds.includes(clip.id)), [state.project.clips, state.selection.clipIds]);
  const trackById = useCallback((id: string) => state.project.tracks.find((track) => track.id === id), [state.project.tracks]);
  const clipsOnTrack = useCallback((trackId: string) => state.project.clips.filter((clip) => clip.trackId === trackId).sort((a, b) => a.start - b.start), [state.project.clips]);
  const activeClipAtPlayhead = useCallback((trackId?: string) => state.project.clips.find((clip) => state.playheadSec >= clip.start && state.playheadSec < clip.end && (trackId ? clip.trackId === trackId : true)), [state.project.clips, state.playheadSec]);
  return { state, dispatch, selectedClips, trackById, clipsOnTrack, activeClipAtPlayhead, canUndo: state.history.past.length > 0, canRedo: state.history.future.length > 0 };
}
