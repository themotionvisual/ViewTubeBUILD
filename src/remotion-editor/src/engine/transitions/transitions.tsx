/**
 * Transitions library — builds on <Sequence> to cross-fade / slide / wipe
 * between adjacent tracks with a chosen presentation style. Mirrors the
 * shape of `@remotion/transitions`: consumers hand us `<TransitionSeries>`
 * with alternating `<TransitionSeries.Sequence>` and `<TransitionSeries.Transition>`
 * children; we materialise Sequences with correct overlaps automatically.
 */
import React, { Children, useMemo } from 'react';
import { FrameProvider, useCurrentFrame, useVideoConfig } from '../core/composition';
import { Easing, clamp, interpolate } from '../animation/math';

/* ------------------------------------------------------------------ */
/* Presentation contract                                              */
/* ------------------------------------------------------------------ */

/**
 * A presentation renders both sides of a transition each frame, given a
 * normalised progress value (0 → 1). Direction is `entering` for the incoming
 * clip and `exiting` for the outgoing one.
 */
export interface PresentationProps {
  progress: number;
  direction: 'entering' | 'exiting';
  passedProps: Record<string, unknown>;
  children: React.ReactNode;
}

export interface PresentationSpec {
  component: React.ComponentType<PresentationProps>;
  props?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Built-in presentations                                              */
/* ------------------------------------------------------------------ */

const Fade: React.FC<PresentationProps> = ({ progress, direction, children }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: direction === 'entering' ? progress : 1 - progress }}>
    {children}
  </div>
);

const Slide: React.FC<PresentationProps> = ({ progress, direction, passedProps, children }) => {
  const dir = (passedProps.direction as 'from-left' | 'from-right' | 'from-top' | 'from-bottom') ?? 'from-right';
  const axis = dir === 'from-left' || dir === 'from-right' ? 'X' : 'Y';
  const sign = dir === 'from-left' || dir === 'from-top' ? -1 : 1;
  const start = direction === 'entering' ? sign * 100 : 0;
  const end = direction === 'entering' ? 0 : -sign * 100;
  const value = start + (end - start) * progress;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate${axis}(${value}%)` }}>
      {children}
    </div>
  );
};

const Wipe: React.FC<PresentationProps> = ({ progress, direction, passedProps, children }) => {
  const dir = (passedProps.direction as 'from-left' | 'from-right' | 'from-top' | 'from-bottom') ?? 'from-left';
  const isEnter = direction === 'entering';
  const p = isEnter ? progress : 1 - progress;
  const clips: Record<string, string> = {
    'from-left':   `inset(0 ${(1 - p) * 100}% 0 0)`,
    'from-right':  `inset(0 0 0 ${(1 - p) * 100}%)`,
    'from-top':    `inset(0 0 ${(1 - p) * 100}% 0)`,
    'from-bottom': `inset(${(1 - p) * 100}% 0 0 0)`,
  };
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: clips[dir] }}>{children}</div>
  );
};

const Iris: React.FC<PresentationProps> = ({ progress, direction, children }) => {
  const p = direction === 'entering' ? progress : 1 - progress;
  const radius = p * 75;
  return (
    <div style={{ position: 'absolute', inset: 0, clipPath: `circle(${radius}% at 50% 50%)` }}>{children}</div>
  );
};

const Flip: React.FC<PresentationProps> = ({ progress, direction, passedProps, children }) => {
  const axis = (passedProps.axis as 'x' | 'y') ?? 'y';
  const angle = direction === 'entering' ? -180 + progress * 180 : progress * 180;
  const hidden = direction === 'entering' ? progress < 0.5 : progress > 0.5;
  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 1200 }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        transform: `rotate${axis.toUpperCase()}(${angle}deg)`,
        backfaceVisibility: 'hidden',
        opacity: hidden ? 0 : 1,
      }}>
        {children}
      </div>
    </div>
  );
};

const Clock: React.FC<PresentationProps> = ({ progress, direction, children }) => {
  const p = direction === 'entering' ? progress : 1 - progress;
  // Angular clip using conic-gradient mask.
  const mask = `conic-gradient(from 0deg, black ${p * 360}deg, transparent 0)`;
  return (
    <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask }}>{children}</div>
  );
};

export const presentations = {
  fade: (): PresentationSpec => ({ component: Fade }),
  slide: (props?: { direction?: 'from-left' | 'from-right' | 'from-top' | 'from-bottom' }): PresentationSpec =>
    ({ component: Slide, props: props as Record<string, unknown> | undefined }),
  wipe: (props?: { direction?: 'from-left' | 'from-right' | 'from-top' | 'from-bottom' }): PresentationSpec =>
    ({ component: Wipe, props: props as Record<string, unknown> | undefined }),
  iris: (): PresentationSpec => ({ component: Iris }),
  flip: (props?: { axis?: 'x' | 'y' }): PresentationSpec =>
    ({ component: Flip, props: props as Record<string, unknown> | undefined }),
  clockWipe: (): PresentationSpec => ({ component: Clock }),
};

/* ------------------------------------------------------------------ */
/* Timing helpers                                                      */
/* ------------------------------------------------------------------ */

export interface TimingSpec {
  durationInFrames: number;
  easing?: (t: number) => number;
}

export function linearTiming(spec: TimingSpec): TimingSpec {
  return { durationInFrames: spec.durationInFrames, easing: spec.easing ?? Easing.linear };
}

export function springTiming(spec: { config?: Parameters<typeof interpolate>[3]; durationInFrames: number }): TimingSpec {
  // Approximate spring shape with a bezier — good enough for transitions; the
  // full spring goes on to overshoot which would break the [0,1] contract.
  return { durationInFrames: spec.durationInFrames, easing: Easing.bezier(0.16, 1, 0.3, 1) };
}

/* ------------------------------------------------------------------ */
/* <TransitionSeries>                                                  */
/* ------------------------------------------------------------------ */

interface SeqProps {
  durationInFrames: number;
  children: React.ReactNode;
}

interface TransitionProps {
  presentation: PresentationSpec;
  timing: TimingSpec;
}

const TSeq: React.FC<SeqProps> = () => null;
TSeq.displayName = 'TransitionSeries.Sequence';

const TTrans: React.FC<TransitionProps> = () => null;
TTrans.displayName = 'TransitionSeries.Transition';

interface Segment {
  kind: 'sequence' | 'transition';
  from: number;
  duration: number;
  node: React.ReactElement;
}

function buildSegments(children: React.ReactNode): Segment[] {
  const segs: Segment[] = [];
  let cursor = 0;
  const list = Children.toArray(children).filter(React.isValidElement) as React.ReactElement<SeqProps | TransitionProps>[];
  for (let i = 0; i < list.length; i++) {
    const el = list[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayName = (el.type as any).displayName;
    if (displayName === 'TransitionSeries.Sequence') {
      const seqEl = el as React.ReactElement<SeqProps>;
      segs.push({ kind: 'sequence', from: cursor, duration: seqEl.props.durationInFrames, node: seqEl });
      cursor += seqEl.props.durationInFrames;
    } else if (displayName === 'TransitionSeries.Transition') {
      const trEl = el as React.ReactElement<TransitionProps>;
      // Transitions steal `duration` frames of overlap from BOTH neighbours.
      const dur = trEl.props.timing.durationInFrames;
      segs.push({ kind: 'transition', from: cursor - dur, duration: dur, node: trEl });
    }
  }
  return segs;
}

export const TransitionSeries = Object.assign(
  function TransitionSeries({ children }: { children: React.ReactNode }) {
    const frame = useCurrentFrame();
    const cfg = useVideoConfig();
    const segments = useMemo(() => buildSegments(children), [children]);

    const rendered: React.ReactNode[] = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.kind !== 'sequence') continue;
      const sequenceEl = seg.node as React.ReactElement<SeqProps>;

      const prevTrans = segments[i - 1]?.kind === 'transition'
        ? (segments[i - 1].node as React.ReactElement<TransitionProps>)
        : null;
      const nextTrans = segments[i + 1]?.kind === 'transition'
        ? (segments[i + 1].node as React.ReactElement<TransitionProps>)
        : null;

      const start = seg.from;
      const end = seg.from + seg.duration;
      if (frame < start - (prevTrans?.props.timing.durationInFrames ?? 0)) continue;
      if (frame >= end + (nextTrans?.props.timing.durationInFrames ?? 0)) continue;

      // Decide which transition (if any) applies at this exact frame.
      let inner = sequenceEl.props.children;

      if (prevTrans && frame < start) {
        const { presentation, timing } = prevTrans.props;
        const t = (frame - (start - timing.durationInFrames)) / timing.durationInFrames;
        const p = (timing.easing ?? Easing.linear)(clamp(t, 0, 1));
        const C = presentation.component;
        inner = <C progress={p} direction="entering" passedProps={presentation.props ?? {}}>{inner}</C>;
      } else if (nextTrans && frame >= end - nextTrans.props.timing.durationInFrames) {
        const { presentation, timing } = nextTrans.props;
        const t = (frame - (end - timing.durationInFrames)) / timing.durationInFrames;
        const p = (timing.easing ?? Easing.linear)(clamp(t, 0, 1));
        const C = presentation.component;
        inner = <C progress={p} direction="exiting" passedProps={presentation.props ?? {}}>{inner}</C>;
      }

      // Localise the frame inside this sequence.
      const localFrame = frame - start;
      rendered.push(
        <FrameProvider key={i} frame={localFrame} config={{ ...cfg, durationInFrames: seg.duration }}>
          <div style={{ position: 'absolute', inset: 0 }}>{inner}</div>
        </FrameProvider>,
      );
    }
    return <>{rendered}</>;
  },
  { Sequence: TSeq, Transition: TTrans },
);
