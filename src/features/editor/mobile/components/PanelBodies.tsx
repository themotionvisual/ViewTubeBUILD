/**
 * PanelBodies — thin default rendering for each Tool tab in the PanelSheet.
 * The desktop editor can override this by passing its own `render()` prop
 * to <PanelSheet>. These bodies are meant to be immediately useful on mobile,
 * not a full port of the desktop panels.
 */
import React from 'react';
import { EditorStore, Tool } from '../state/editorState';
import type { VtE1Transition } from '../../../../shared/vtE1TimelineContract';

interface PanelProps { store: EditorStore }

const row: React.CSSProperties = { display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' };
const btn: React.CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  borderRadius: 10,
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#e2e8f0',
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  cursor: 'pointer',
};
const primary: React.CSSProperties = { ...btn, background: '#22d3ee', color: '#0f172a', border: 'none' };
const label: React.CSSProperties = { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 };

const SelectPanel: React.FC<PanelProps> = ({ store }) => {
  const { selectedClips, dispatch } = store;
  if (selectedClips.length === 0) {
    return <div style={{ opacity: 0.6, fontSize: 13 }}>Tap a clip in the timeline to select it. Long-press for more actions.</div>;
  }
  return (
    <div>
      <div style={label}>Selected · {selectedClips.length}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {selectedClips.map((c) => (
          <li key={c.id} style={{ padding: 8, background: '#1e293b', borderRadius: 8, fontSize: 12 }}>
            <div style={{ fontWeight: 800 }}>{String(c.id)}</div>
            <div style={{ opacity: 0.7 }}>
              {c.start.toFixed(2)}s → {c.end.toFixed(2)}s
            </div>
          </li>
        ))}
      </ul>
      <div style={{ ...row, marginTop: 12 }}>
        <button style={btn} onClick={() => selectedClips.forEach((c) => dispatch({ type: 'duplicateClip', id: c.id }))}>Duplicate</button>
        <button style={{ ...btn, color: '#f87171' }} onClick={() => dispatch({ type: 'deleteClips', ids: selectedClips.map((c) => c.id) })}>Delete</button>
      </div>
    </div>
  );
};

const TrimPanel: React.FC<PanelProps> = ({ store }) => {
  const { selectedClips, dispatch, state } = store;
  const clip = selectedClips[0];
  if (!clip) return <div style={{ opacity: 0.6 }}>Select a clip to trim.</div>;
  return (
    <div>
      <div style={label}>Trim start</div>
      <input
        type="range"
        min={0}
        max={clip.end - 0.1}
        step={0.05}
        value={clip.start}
        onChange={(e) => dispatch({ type: 'trimClip', id: clip.id, side: 'left', sec: Number(e.target.value) })}
        style={{ width: '100%' }}
      />
      <div style={{ ...label, marginTop: 12 }}>Trim end</div>
      <input
        type="range"
        min={clip.start + 0.1}
        max={state.project.durationSec}
        step={0.05}
        value={clip.end}
        onChange={(e) => dispatch({ type: 'trimClip', id: clip.id, side: 'right', sec: Number(e.target.value) })}
        style={{ width: '100%' }}
      />
      <div style={{ ...row, marginTop: 14 }}>
        <button
          style={btn}
          onClick={() => dispatch({ type: 'splitClipAtPlayhead', id: clip.id })}
          disabled={state.playheadSec <= clip.start || state.playheadSec >= clip.end}
        >Split at playhead</button>
      </div>
    </div>
  );
};

const TextPanel: React.FC<PanelProps> = ({ store }) => {
  const { state, dispatch } = store;
  return (
    <div>
      <div style={label}>Add text</div>
      <input
        placeholder="Type overlay text…"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          background: '#1e293b',
          border: '1px solid #334155',
          color: '#e2e8f0',
          fontSize: 14,
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const value = (e.currentTarget as HTMLInputElement).value.trim();
            if (!value) return;
            dispatch({
              type: 'addClip',
              clip: {
                id: `text_${Date.now().toString(36)}`,
                trackId: 't_overlay',
                start: state.playheadSec,
                end: state.playheadSec + 2,
                text: value,
              },
            });
            (e.currentTarget as HTMLInputElement).value = '';
          }
        }}
      />
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.6 }}>Press Return to drop a 2-second title at the playhead.</div>
    </div>
  );
};

const AudioPanel: React.FC<PanelProps> = ({ store }) => {
  const { state, dispatch } = store;
  return (
    <div>
      <div style={label}>Tracks</div>
      {state.project.tracks.map((t) => (
        <div key={t.id} style={{ ...row, background: '#1e293b', padding: 8, borderRadius: 8 }}>
          <span style={{ fontWeight: 800, flex: 1 }}>{t.name}</span>
          <button
            style={{ ...btn, flex: 'none', width: 88, background: t.muted ? '#ef4444' : '#334155' }}
            onClick={() => dispatch({ type: 'muteTrack', id: t.id })}
          >{t.muted ? 'Muted' : 'Mute'}</button>
        </div>
      ))}
    </div>
  );
};

const TransitionsPanel: React.FC<PanelProps> = ({ store }) => {
  const { selectedClips, state, dispatch } = store;
  const list: Array<{ key: string; label: string }> = [
    { key: 'fade', label: 'Fade' },
    { key: 'slide', label: 'Slide' },
    { key: 'wipe', label: 'Wipe' },
    { key: 'iris', label: 'Iris' },
    { key: 'flip', label: 'Flip' },
    { key: 'clockWipe', label: 'Clock' },
  ];
  const [left, right] = selectedClips.slice(0, 2);
  const canAdd = Boolean(left && right);
  return (
    <div>
      <div style={label}>{canAdd ? `Add transition between ${left.id} and ${right.id}` : 'Select two adjacent clips to add a transition'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {list.map((t) => (
          <button
            key={t.key}
            disabled={!canAdd}
            style={{ ...btn, opacity: canAdd ? 1 : 0.4 }}
            onClick={() => {
              if (!canAdd) return;
              const transition: VtE1Transition = {
                leftClipId: left.id,
                rightClipId: right.id,
                durationSec: 0.4,
                nominalSeamSec: (left.end + right.start) / 2,
                // Extra fields (id, presentation) are allowed by the
                // index-signature on VtE1Transition.
                id: `${t.key}_${Date.now().toString(36)}`,
                presentation: t.key,
              };
              dispatch({ type: 'addTransition', transition });
            }}
          >{t.label}</button>
        ))}
      </div>
      <div style={{ ...label, marginTop: 14 }}>Existing</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(state.project.transitions ?? []).map((tr, i) => (
          <li key={i} style={{ ...row, background: '#1e293b', padding: 8, borderRadius: 8 }}>
            <span style={{ flex: 1, fontSize: 12 }}>
              {String((tr as { presentation?: string }).presentation ?? 'transition')} · {tr.leftClipId} → {tr.rightClipId}
            </span>
            <button
              style={{ ...btn, flex: 'none', width: 68, color: '#f87171' }}
              onClick={() => dispatch({ type: 'removeTransition', id: String((tr as unknown as { id: string }).id) })}
            >Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const EffectsPanel: React.FC<PanelProps> = () => (
  <div style={{ opacity: 0.65, fontSize: 13 }}>
    Effects panel — coming next: color, blur, motion blur (uses <code>@engine/animation motionBlurSamples</code>).
  </div>
);

const ExportPanel: React.FC<PanelProps> = ({ store }) => {
  const { state } = store;
  return (
    <div>
      <div style={label}>Export</div>
      <div style={{ background: '#1e293b', padding: 12, borderRadius: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Duration</div>
        <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
          {state.project.durationSec.toFixed(1)}s
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Clips</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{state.project.clips.length}</div>
      </div>
      <button style={primary}>Render MP4 (H.264)</button>
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.6 }}>Uses the engine's <code>renderVideo()</code> pipeline when wired.</div>
    </div>
  );
};

export const PanelBodies = {
  select: SelectPanel,
  trim: TrimPanel,
  split: TrimPanel,
  text: TextPanel,
  audio: AudioPanel,
  transitions: TransitionsPanel,
  effects: EffectsPanel,
  export: ExportPanel,
} satisfies Record<Tool, React.FC<PanelProps>>;

export function renderPanelBody(tool: Tool, store: EditorStore) {
  const Body = PanelBodies[tool];
  return <Body store={store} />;
}
