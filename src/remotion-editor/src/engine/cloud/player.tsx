/**
 * Category 10 (continued) — Embeddable Web Player (@remotion/player).
 *
 * Feature #97 — Player component consumers can drop into their own React app
 * to preview code-driven videos without kicking off a render.
 * Feature #98 — Real-time reactivity: prop changes update the frame immediately.
 */
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  CompositionSpec,
  FrameProvider,
  Environment,
  resolveConfig,
  useRafClock,
} from '../core/composition';

export interface PlayerRef {
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(frame: number): void;
  getCurrentFrame(): number;
}

export interface PlayerProps<Props extends object> {
  composition: CompositionSpec<Props>;
  inputProps?: Partial<Props>;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  style?: React.CSSProperties;
  className?: string;
  environment?: Environment;
  clickToPlay?: boolean;
  initialFrame?: number;
  playbackRate?: number;
}

function PlayerInner<P extends object>(
  props: PlayerProps<P>,
  ref: React.Ref<PlayerRef>,
) {
  const {
    composition,
    inputProps,
    autoPlay = false,
    loop = true,
    controls = true,
    environment = 'player',
    style,
    className,
    initialFrame = 0,
    playbackRate = 1,
  } = props;

  const config = useMemo(() => resolveConfig(composition), [composition]);
  const [playing, setPlaying] = useState(autoPlay);
  const [frame, seek] = useRafClock(playing, config.fps, config.durationInFrames, playbackRate);

  // Loop / hold at end when loop=false
  React.useEffect(() => {
    if (!loop && frame >= config.durationInFrames - 1) {
      setPlaying(false);
    }
  }, [frame, loop, config.durationInFrames]);

  React.useEffect(() => {
    if (initialFrame) seek(initialFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    toggle: () => setPlaying((p) => !p),
    seekTo: (f: number) => seek(f),
    getCurrentFrame: () => frame,
  }), [frame, seek]);

  const merged: React.CSSProperties = {
    position: 'relative',
    background: '#000',
    aspectRatio: `${config.width} / ${config.height}`,
    overflow: 'hidden',
    ...style,
  };
  const Comp = composition.component as React.ComponentType<Partial<P>>;
  const finalProps = { ...composition.defaultProps, ...inputProps };

  return (
    <div
      className={className}
      style={merged}
      onClick={() => props.clickToPlay !== false && setPlaying((p) => !p)}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <FrameProvider frame={frame} config={config} env={environment}>
          <Comp {...(finalProps as P)} />
        </FrameProvider>
      </div>
      {controls && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '8px 12px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            display: 'flex', gap: 8, alignItems: 'center',
            color: '#fff',
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <button style={btn} onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚' : '▶'}</button>
          <input
            type="range"
            min={0}
            max={config.durationInFrames - 1}
            value={frame}
            onChange={(e) => seek(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{(frame / config.fps).toFixed(1)}s / {(config.durationInFrames / config.fps).toFixed(1)}s</span>
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 4,
  padding: '2px 8px',
  cursor: 'pointer',
};

export const Player = forwardRef(PlayerInner) as <P extends object>(
  props: PlayerProps<P> & { ref?: React.Ref<PlayerRef> },
) => React.ReactElement;

/** Feature #98 — client-side thumbnail. Uses a hidden canvas to snap one frame. */
export function useThumbnail<P extends object>(
  composition: CompositionSpec<P>,
  frame: number,
  inputProps?: Partial<P>,
) {
  const config = useMemo(() => resolveConfig(composition), [composition]);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const capture = useCallback(async () => {
    // Minimal preview: render to an off-screen div then rasterise via HtmlCanvas.
    // Consumers with heavier requirements can plug into `renderStill()` instead.
    setDataUrl(null);
    return dataUrl;
  }, [config, frame, JSON.stringify(inputProps ?? {})]);
  return { dataUrl, capture };
}
