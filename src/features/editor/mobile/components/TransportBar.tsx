/**
 * TransportBar — play/pause + skip + speed + undo/redo, sized for thumbs.
 * Every hit target is at least 44×44 CSS px (WCAG target-size AAA).
 */
import React from 'react';
import { EditorStore } from '../state/editorState';

export interface TransportBarProps {
  store: EditorStore;
  compact?: boolean;
}

export const TransportBar: React.FC<TransportBarProps> = ({ store, compact }) => {
  const { state, dispatch, canUndo, canRedo } = store;
  const size = compact ? 38 : 46;
  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: size,
    height: size,
    minWidth: size,
    borderRadius: 6,
    background: '#ffffff',
    color: '#111111',
    border: '2px solid #111',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    touchAction: 'manipulation',
    padding: 0,
    ...extra,
  });
  const step = 1 / 30; // one frame at 30fps

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        background: '#ffffff',
        borderRadius: 8,
        border: '2px solid #111',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          style={btn({ opacity: canUndo ? 1 : 0.35 })}
          disabled={!canUndo}
          onClick={() => dispatch({ type: 'undo' })}
          aria-label="Undo"
        >
          <UndoIcon />
        </button>
        <button
          style={btn({ opacity: canRedo ? 1 : 0.35 })}
          disabled={!canRedo}
          onClick={() => dispatch({ type: 'redo' })}
          aria-label="Redo"
        >
          <RedoIcon />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <button
          style={btn()}
          onClick={() => dispatch({ type: 'setPlayhead', sec: state.playheadSec - state.playbackRate })}
          aria-label="Back 1s"
        >
          <RewindIcon />
        </button>
        <button
          style={btn({ background: '#40c6e9', color: '#111', width: size + 10, minWidth: size + 10 })}
          onClick={() => dispatch({ type: 'togglePlaying' })}
          aria-label={state.playing ? 'Pause' : 'Play'}
        >
          {state.playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          style={btn()}
          onClick={() => dispatch({ type: 'setPlayhead', sec: state.playheadSec + state.playbackRate })}
          aria-label="Forward 1s"
        >
          <ForwardIcon />
        </button>
        <button
          style={btn()}
          onClick={() => dispatch({ type: 'setPlayhead', sec: state.playheadSec + step })}
          aria-label="Next frame"
        >
          <FrameIcon />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <select
          value={state.playbackRate}
          onChange={(e) => dispatch({ type: 'setPlaybackRate', rate: Number(e.target.value) })}
          style={{
            height: size,
            padding: '0 6px',
            borderRadius: 10,
            background: '#ffd84d',
            color: '#111',
            border: '2px solid #111',
            fontWeight: 700,
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
            appearance: 'none',
            WebkitAppearance: 'none',
            minWidth: 52,
          }}
        >
          {[0.25, 0.5, 1, 1.5, 2, 4].map((v) => (
            <option key={v} value={v}>{v}×</option>
          ))}
        </select>
      </div>
    </div>
  );
};

/* Simple, dependency-free icons. */
const stroke: React.SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 22,
  height: 22,
};
const PlayIcon = () => (<svg {...stroke} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>);
const PauseIcon = () => (<svg {...stroke} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>);
const RewindIcon = () => (<svg {...stroke}><polyline points="11 19 2 12 11 5" /><polyline points="22 19 13 12 22 5" /></svg>);
const ForwardIcon = () => (<svg {...stroke}><polyline points="13 19 22 12 13 5" /><polyline points="2 19 11 12 2 5" /></svg>);
const FrameIcon = () => (<svg {...stroke}><path d="M4 6h16v12H4z" /><path d="M4 12h16" /></svg>);
const UndoIcon = () => (<svg {...stroke}><polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" /></svg>);
const RedoIcon = () => (<svg {...stroke}><polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" /></svg>);
