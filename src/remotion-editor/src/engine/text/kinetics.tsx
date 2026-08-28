/**
 * Kinetic typography helpers — build on the animation math + captions to
 * produce per-word / per-character text animations that stay frame-accurate.
 */
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/composition';
import { Easing, clamp, interpolate, spring } from '../animation/math';
import { Caption } from '../audio/audio';

/* ------------------------------------------------------------------ */
/* Splitters                                                           */
/* ------------------------------------------------------------------ */

export type SplitUnit = 'char' | 'word' | 'line';

export interface SplitToken { text: string; index: number; whitespaceAfter: string }

export function splitText(text: string, by: SplitUnit): SplitToken[] {
  if (by === 'char') {
    return Array.from(text).map((c, i) => ({ text: c, index: i, whitespaceAfter: '' }));
  }
  if (by === 'line') {
    return text.split(/\n/).map((line, i) => ({ text: line, index: i, whitespaceAfter: '\n' }));
  }
  // by === 'word'
  const rx = /(\S+)(\s*)/g;
  const out: SplitToken[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = rx.exec(text)) !== null) {
    out.push({ text: m[1], index: i++, whitespaceAfter: m[2] });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* StaggeredText — springs each token in with a per-token delay        */
/* ------------------------------------------------------------------ */

export interface StaggeredTextProps {
  text: string;
  by?: SplitUnit;
  /** Frames between each token's entrance. */
  stagger?: number;
  /** Frame at which the first token begins. */
  startFrame?: number;
  springConfig?: Parameters<typeof spring>[0]['config'];
  style?: React.CSSProperties;
  className?: string;
  /**
   * Render override so callers can control the exact per-token JSX (e.g. a
   * span with a `data-index`). Receives the token, its animated progress
   * (0..1), and the current absolute frame.
   */
  renderToken?: (token: SplitToken, progress: number, frame: number) => React.ReactNode;
}

export const StaggeredText: React.FC<StaggeredTextProps> = ({
  text,
  by = 'word',
  stagger = 3,
  startFrame = 0,
  springConfig,
  style,
  className,
  renderToken,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = useMemo(() => splitText(text, by), [text, by]);
  return (
    <span className={className} style={{ display: 'inline-block', whiteSpace: 'pre-wrap', ...style }}>
      {tokens.map((tok) => {
        const localFrame = frame - startFrame - tok.index * stagger;
        const progress = clamp(spring({ frame: localFrame, fps, config: springConfig, from: 0, to: 1 }), 0, 1);
        if (renderToken) return <React.Fragment key={tok.index}>{renderToken(tok, progress, frame)}</React.Fragment>;
        return (
          <span
            key={tok.index}
            style={{
              display: 'inline-block',
              opacity: progress,
              transform: `translateY(${(1 - progress) * 24}px)`,
            }}
          >
            {tok.text}
            {tok.whitespaceAfter}
          </span>
        );
      })}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* TypewriterText — reveals characters one at a time                   */
/* ------------------------------------------------------------------ */

export interface TypewriterTextProps {
  text: string;
  /** Characters per second. */
  cps?: number;
  startFrame?: number;
  showCaret?: boolean;
  caret?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  cps = 18,
  startFrame = 0,
  showCaret = true,
  caret = '▍',
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Math.floor(interpolate(frame, [startFrame, startFrame + (text.length * fps) / cps], [0, text.length], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }));
  const shown = text.slice(0, chars);
  const blinkOn = Math.floor(frame / (fps / 2)) % 2 === 0;
  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap', ...style }}>
      {shown}
      {showCaret && (blinkOn || chars < text.length) && <span style={{ opacity: 0.85 }}>{caret}</span>}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Kinetic captions — pair with parseSrt() from ../audio/audio.tsx     */
/* ------------------------------------------------------------------ */

export interface KineticCaptionProps {
  captions: Caption[];
  /** Frames of overlap when a caption swaps out. Default 6. */
  crossfadeFrames?: number;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Renders the caption active at the current frame, cross-faded against the
 * next one. Uses a binary search from the audio module and a small ease.
 */
export const KineticCaption: React.FC<KineticCaptionProps> = ({
  captions,
  crossfadeFrames = 6,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;
  const active = useMemo(() => {
    let lo = 0, hi = captions.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const c = captions[mid];
      if (nowMs < c.startMs) hi = mid - 1;
      else if (nowMs > c.endMs) lo = mid + 1;
      else return { current: c, next: captions[mid + 1] ?? null };
    }
    return { current: null, next: captions[lo] ?? null };
  }, [captions, Math.floor(nowMs / 30)]);

  if (!active.current) return null;
  const msLeft = active.current.endMs - nowMs;
  const msFrame = (crossfadeFrames * 1000) / fps;
  const t = msLeft < msFrame ? Easing.ease(1 - msLeft / msFrame) : 0;
  return (
    <span className={className} style={{ display: 'inline-block', opacity: 1 - t, ...style }}>
      {active.current.text}
    </span>
  );
};
