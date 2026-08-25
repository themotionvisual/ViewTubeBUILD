/**
 * Category 8 — Studio GUI & Interactive Controls
 *
 * Preview shell, prop-controls schema, sub-frame scrubbing, pan / zoom,
 * FPS / speed toggles, timeline toggles, audio visualiser bar, keyboard maps.
 *
 * Features covered: 75–82.
 */
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  CompositionSpec,
  FrameProvider,
  Environment,
  resolveConfig,
  useRafClock,
} from '../core/composition';
import { AudioData, visualizeAudio } from '../audio/audio';

/* ------------------------------------------------------------------ */
/* Feature #76 — InteractivitySchema (visual prop controls)           */
/* ------------------------------------------------------------------ */

export type ControlSpec =
  | { kind: 'text'; label?: string; default?: string }
  | { kind: 'number'; label?: string; min?: number; max?: number; step?: number; default?: number }
  | { kind: 'slider'; label?: string; min: number; max: number; step?: number; default?: number }
  | { kind: 'color'; label?: string; default?: string }
  | { kind: 'boolean'; label?: string; default?: boolean }
  | { kind: 'select'; label?: string; options: string[]; default?: string };

export interface InteractivitySchema<Props> {
  controls: { [K in keyof Props]?: ControlSpec };
}

/** Turn a schema into an initial props object (used before user tweaks). */
export function initialFromSchema<P extends object>(schema: InteractivitySchema<P>): Partial<P> {
  const out: any = {};
  for (const [k, spec] of Object.entries(schema.controls ?? {})) {
    if (!spec) continue;
    if ('default' in (spec as any)) out[k] = (spec as any).default;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Feature #82 — Keyboard navigation                                  */
/* ------------------------------------------------------------------ */

export interface KeyMap {
  playPause: string[];
  stepForward: string[];
  stepBackward: string[];
  jumpForward: string[];
  jumpBackward: string[];
  toStart: string[];
  toEnd: string[];
  toggleTimeline: string[];
  toggleLoop: string[];
}

export const defaultKeyMap: KeyMap = {
  playPause: [' '],
  stepForward: ['ArrowRight'],
  stepBackward: ['ArrowLeft'],
  jumpForward: ['Shift+ArrowRight'],
  jumpBackward: ['Shift+ArrowLeft'],
  toStart: ['Home'],
  toEnd: ['End'],
  toggleTimeline: ['t'],
  toggleLoop: ['l'],
};

function eventKey(ev: KeyboardEvent) {
  const mods: string[] = [];
  if (ev.shiftKey) mods.push('Shift');
  if (ev.metaKey) mods.push('Meta');
  if (ev.altKey) mods.push('Alt');
  if (ev.ctrlKey) mods.push('Ctrl');
  return [...mods, ev.key].join('+');
}

export function useKeyboardControls(map: KeyMap, onAction: (a: keyof KeyMap) => void) {
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      const k = eventKey(ev);
      for (const [action, keys] of Object.entries(map)) {
        if ((keys as string[]).includes(k)) {
          ev.preventDefault();
          onAction(action as keyof KeyMap);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [map, onAction]);
}

/* ------------------------------------------------------------------ */
/* Feature #79 — Diagnostic FPS + speed toggles                        */
/* Feature #77 — Sub-frame scrubbing controls                          */
/* Feature #75 — Live in-browser preview shell                         */
/* ------------------------------------------------------------------ */

export interface StudioPreviewProps {
  composition: CompositionSpec;
  propsOverride?: Record<string, unknown>;
  environment?: Environment;
  initialSpeed?: number;
  keyMap?: KeyMap;
}

export const StudioPreview: React.FC<StudioPreviewProps> = ({
  composition,
  propsOverride,
  environment = 'preview',
  initialSpeed = 1,
  keyMap = defaultKeyMap,
}) => {
  const config = useMemo(() => resolveConfig(composition), [composition]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [zoom, setZoom] = useState(1);
  const [showTimeline, setShowTimeline] = useState(true);
  const [frame, seek] = useRafClock(playing, config.fps, config.durationInFrames, speed);
  const props = { ...composition.defaultProps, ...(propsOverride ?? {}) };

  useKeyboardControls(keyMap, useCallback((action) => {
    switch (action) {
      case 'playPause': setPlaying((p) => !p); break;
      case 'stepForward': seek(frame + 1); break;
      case 'stepBackward': seek(frame - 1); break;
      case 'jumpForward': seek(frame + config.fps); break;
      case 'jumpBackward': seek(frame - config.fps); break;
      case 'toStart': seek(0); break;
      case 'toEnd': seek(config.durationInFrames - 1); break;
      case 'toggleTimeline': setShowTimeline((s) => !s); break;
    }
  }, [frame, seek, config.fps, config.durationInFrames]));

  const Comp = composition.component as React.ComponentType<unknown>;
  return (
    <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%' }}>
      {/* Feature #78 — pan/zoom viewport */}
      <div
        style={{
          position: 'relative',
          overflow: 'auto',
          background: '#111',
        }}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom((z) => Math.max(0.1, Math.min(4, z - e.deltaY * 0.001)));
          }
        }}
      >
        <div
          style={{
            width: config.width * zoom,
            height: config.height * zoom,
            transformOrigin: '0 0',
            transform: `scale(${zoom})`,
            position: 'relative',
          }}
        >
          <div style={{ width: config.width, height: config.height, position: 'relative' }}>
            <FrameProvider frame={frame} config={config} env={environment}>
              <Comp {...props} />
            </FrameProvider>
          </div>
        </div>
      </div>
      {/* Bottom controls */}
      <PreviewControls
        frame={frame}
        seek={seek}
        playing={playing}
        setPlaying={setPlaying}
        speed={speed}
        setSpeed={setSpeed}
        config={config}
        showTimeline={showTimeline}
        setShowTimeline={setShowTimeline}
      />
    </div>
  );
};

const PreviewControls: React.FC<{
  frame: number;
  seek: (f: number) => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;
  config: ReturnType<typeof resolveConfig>;
  showTimeline: boolean;
  setShowTimeline: (v: boolean) => void;
}> = ({ frame, seek, playing, setPlaying, speed, setSpeed, config, showTimeline, setShowTimeline }) => {
  return (
    <div style={{ padding: 8, background: '#222', color: '#eee', display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={() => setPlaying(!playing)}>{playing ? '❚❚' : '▶'}</button>
      <button onClick={() => seek(frame - 1)} title="Prev frame">◀</button>
      <input
        type="range"
        min={0}
        max={config.durationInFrames - 1}
        value={frame}
        onChange={(e) => seek(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <button onClick={() => seek(frame + 1)} title="Next frame">▶</button>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {frame}/{config.durationInFrames - 1}
      </span>
      <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
        {[0.25, 0.5, 1, 2, 4].map((v) => <option key={v} value={v}>{v}×</option>)}
      </select>
      <label style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <input type="checkbox" checked={showTimeline} onChange={(e) => setShowTimeline(e.target.checked)} />
        timeline
      </label>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Feature #80 — Timeline track toggles                                */
/* ------------------------------------------------------------------ */

interface TimelineTrackState { id: string; visible: boolean; locked: boolean; isolated: boolean }

type TrackAction =
  | { type: 'toggleVisible'; id: string }
  | { type: 'toggleLock'; id: string }
  | { type: 'isolate'; id: string }
  | { type: 'showAll' };

function trackReducer(state: TimelineTrackState[], action: TrackAction): TimelineTrackState[] {
  switch (action.type) {
    case 'toggleVisible':
      return state.map((t) => t.id === action.id ? { ...t, visible: !t.visible } : t);
    case 'toggleLock':
      return state.map((t) => t.id === action.id ? { ...t, locked: !t.locked } : t);
    case 'isolate':
      return state.map((t) => ({ ...t, visible: t.id === action.id, isolated: t.id === action.id }));
    case 'showAll':
      return state.map((t) => ({ ...t, visible: true, isolated: false }));
  }
}

export function useTimelineTracks(ids: string[]) {
  const initial = useMemo(
    () => ids.map((id) => ({ id, visible: true, locked: false, isolated: false })),
    [ids.join('|')],
  );
  return useReducer(trackReducer, initial);
}

/* ------------------------------------------------------------------ */
/* Feature #81 — Audio visualiser bar                                  */
/* ------------------------------------------------------------------ */

export const AudioVisualiserBar: React.FC<{
  audioData: AudioData;
  frame: number;
  fps: number;
  buckets?: number;
  height?: number;
}> = ({ audioData, frame, fps, buckets = 48, height = 40 }) => {
  const values = useMemo(
    () => visualizeAudio({ audioData, frame, fps, numberOfSamples: buckets }),
    [audioData, frame, fps, buckets],
  );
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: '#4ade80',
            height: `${Math.round(v * 100)}%`,
            transition: 'height 60ms linear',
          }}
        />
      ))}
    </div>
  );
};
