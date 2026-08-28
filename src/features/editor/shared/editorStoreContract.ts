import type { Dispatch } from 'react';
import type {
  VtE1Clip,
  VtE1Project,
  VtE1Transition,
} from '../../../shared/vtE1TimelineContract';

export type VtE1TrackKind = 'video' | 'audio' | 'overlay' | 'caption';

export interface VtE1EditorTrack {
  id: string;
  name: string;
  kind: VtE1TrackKind;
  muted?: boolean;
  locked?: boolean;
  hidden?: boolean;
  visible?: boolean;
  solo?: boolean;
  color?: string;
}

export interface VtE1EditorSelection {
  clipIds: string[];
  trackId: string | null;
  transitionId: string | null;
}

export type VtE1EditorTool =
  | 'select'
  | 'trim'
  | 'split'
  | 'text'
  | 'audio'
  | 'transitions'
  | 'effects'
  | 'export';

export interface VtE1EditorProject extends VtE1Project {
  tracks: VtE1EditorTrack[];
  durationSec: number;
}

export interface VtE1EditorState {
  project: VtE1EditorProject;
  playheadSec: number;
  playing: boolean;
  playbackRate: number;
  zoomPxPerSec: number;
  selection: VtE1EditorSelection;
  tool: VtE1EditorTool;
  panel: {
    open: boolean;
    id: VtE1EditorTool;
    height: number;
  };
  history: {
    past: string[];
    future: string[];
  };
}

export type VtE1EditorAction =
  | { type: 'setPlayhead'; sec: number }
  | { type: 'setPlaying'; playing: boolean }
  | { type: 'togglePlaying' }
  | { type: 'setPlaybackRate'; rate: number }
  | { type: 'setZoom'; pxPerSec: number }
  | { type: 'selectClip'; id: string; additive?: boolean }
  | { type: 'selectTrack'; id: string | null }
  | { type: 'selectTransition'; id: string | null }
  | { type: 'clearSelection' }
  | { type: 'setTool'; tool: VtE1EditorTool }
  | { type: 'openPanel'; id: VtE1EditorTool; height?: number }
  | { type: 'closePanel' }
  | { type: 'setPanelHeight'; height: number }
  | { type: 'setPanelId'; id: VtE1EditorTool }
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

export interface VtE1EditorStore {
  state: VtE1EditorState;
  dispatch: Dispatch<VtE1EditorAction>;
  selectedClips: VtE1Clip[];
  trackById: (id: string) => VtE1EditorTrack | undefined;
  clipsOnTrack: (trackId: string) => VtE1Clip[];
  activeClipAtPlayhead: (trackId?: string) => VtE1Clip | undefined;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Canonical UI/runtime boundary for VT-E1.
 *
 * Desktop and mobile editor surfaces should consume this store contract.
 * Timeline mutation math remains owned by src/shared/vtE1TimelineOperations.js;
 * preview/render timing remains owned by src/shared/vtE1TimelineContract.js.
 */
export type VtE1EditorStoreFactory = (
  seed?: Partial<VtE1EditorProject>,
) => VtE1EditorStore;
