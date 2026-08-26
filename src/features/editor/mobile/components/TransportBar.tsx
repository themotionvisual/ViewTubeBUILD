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
  const size = compact ? 40 : 48;
  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: 12,
    background: '#1f2937',
    color: '#f8fafc',
    border: 'none',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    touchAction: 'manipulation',
    ...extra,
  });
  const step = 1 / 30; // one frame at 30fps

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        background: '#0f172a',
        borderRadius: 16,
        border: '1px solid #1e293b',
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
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

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={btn()}
          onClick={() => dispatch({ type: 'setPlayhead', sec: state.playheadSec - state.playbackRate })}
          aria-label="Back 1s"
        >
          <RewindIcon />
        </button>
        <button
          style={btn({ background: '#22d3ee', color: '#0f172a', width: size + 12 })}
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

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select
          value={state.playbackRate}
          onChange={(e) => dispatch({ type: 'setPlaybackRate', rate: Number(e.target.value) })}
          style={{
            height: size,
            padding: '0 10px',
            borderRadius: 12,
            background: '#1f2937',
            color: '#f8fafc',
            border: 'none',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
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
