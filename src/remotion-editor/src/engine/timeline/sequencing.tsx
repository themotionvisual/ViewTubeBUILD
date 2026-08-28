/**
 * Category 2 — Timeline & Sequencing Primitives
 *
 * Sequence, Series, Loop, Freeze, premount/postmount, non-destructive trim,
 * and per-layer timeline visibility.
 *
 * Features covered: 11–20.
 */
import React, { Children, createContext, useContext, useMemo } from 'react';
import { FrameProvider, useCurrentFrame, useVideoConfig } from '../core/composition';

/* ------------------------------------------------------------------ */
/* Feature #20 — showInTimeline metadata channel                      */
/* ------------------------------------------------------------------ */

export interface TimelineHint {
  /** Renders in the editor's timeline track list; default true. */
  showInTimeline?: boolean;
  /** Colour swatch shown by the editor. */
  color?: string;
  /** Human label for the track. */
  name?: string;
}

const TimelineHintContext = createContext<TimelineHint>({ showInTimeline: true });
export const useTimelineHint = () => useContext(TimelineHintContext);

/* ------------------------------------------------------------------ */
/* Feature #11 — <Sequence>                                           */
/* Feature #12 — Relative time scoping                                */
/* Feature #17 — Premount                                             */
/* Feature #18 — Postmount                                            */
/* Feature #19 — trimBefore / trimAfter                               */
/* ------------------------------------------------------------------ */

export interface SequenceProps extends TimelineHint {
  /** Global frame at which this child track becomes active. */
  from?: number;
  /** Number of frames this track is active. `Infinity` runs to composition end. */
  durationInFrames?: number;
  /**
   * Preload children this many frames before their start frame — useful for
   * heavy video assets so decoders warm up before the cut. Feature #17.
   */
  premountFor?: number;
  /**
   * Keep children mounted this many frames past their natural end so DOM state
   * (canvas history, WebGL contexts) survives. Feature #18.
   */
  postmountFor?: number;
  /**
   * Skip the first N frames of the child clip's own local timeline without
   * re-encoding the underlying source. Feature #19.
   */
  trimBefore?: number;
  /** Trim tail frames from the child clip. Feature #19. */
  trimAfter?: number;
  /**
   * Decide how to translate the parent frame into the child frame. Defaults to
   * "local" — the child sees frame `parent - from + trimBefore`. Feature #12.
   */
  layout?: 'local' | 'global';
  children: React.ReactNode;
}

export const Sequence: React.FC<SequenceProps> = ({
  from = 0,
  durationInFrames = Infinity,
  premountFor = 0,
  postmountFor = 0,
  trimBefore = 0,
  trimAfter = 0,
  layout = 'local',
  showInTimeline = true,
  color,
  name,
  children,
}) => {
  const parentFrame = useCurrentFrame();
  const cfg = useVideoConfig();

  const start = from - premountFor;
  const naturalEnd = from + durationInFrames;
  const end = naturalEnd + postmountFor;

  if (parentFrame < start || parentFrame >= end) return null;

  const local = Math.max(0, parentFrame - from) + trimBefore;
  const cappedLocal =
    trimAfter > 0
      ? Math.min(local, durationInFrames - trimAfter - 1)
      : local;

  const nextFrame = layout === 'global' ? parentFrame : cappedLocal;
  const localDuration = Math.max(
    1,
    (durationInFrames === Infinity ? cfg.durationInFrames : durationInFrames) -
      trimBefore -
      trimAfter,
  );
  const nextCfg = { ...cfg, durationInFrames: localDuration };

  return (
    <TimelineHintContext.Provider value={{ showInTimeline, color, name }}>
      <FrameProvider frame={nextFrame} config={nextCfg}>
        {children}
      </FrameProvider>
    </TimelineHintContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Feature #13 — <Series>                                             */
/* Feature #14 — Series sequence overlaps (via `offset`)              */
/* ------------------------------------------------------------------ */

interface SeriesSequenceProps extends TimelineHint {
  durationInFrames: number;
  /**
   * Negative to overlap into the previous sibling (dynamic cross-fades).
   * Positive to leave a gap. Applied on top of the natural end-to-end chain.
   * Feature #14.
   */
  offset?: number;
  children: React.ReactNode;
}

const SeriesSequence: React.FC<SeriesSequenceProps> & {
  displayName?: string;
} = () => null; // Rendered indirectly by Series below.
SeriesSequence.displayName = 'Series.Sequence';

export const Series = Object.assign(
  function Series({ children }: { children: React.ReactNode }) {
    let cursor = 0;
    const rendered: React.ReactNode[] = [];
    Children.forEach(children, (child, idx) => {
      if (!React.isValidElement(child)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const el = child as React.ReactElement<SeriesSequenceProps>;
      const dur = el.props.durationInFrames;
      const offset = el.props.offset ?? 0;
      const from = cursor + offset;
      rendered.push(
        <Sequence
          key={idx}
          from={from}
          durationInFrames={dur}
          showInTimeline={el.props.showInTimeline}
          color={el.props.color}
          name={el.props.name}
        >
          {el.props.children}
        </Sequence>,
      );
      cursor = from + dur;
    });
    return <>{rendered}</>;
  },
  { Sequence: SeriesSequence },
);

/* ------------------------------------------------------------------ */
/* Feature #15 — <Loop>                                               */
/* ------------------------------------------------------------------ */

export interface LoopProps {
  /** Length of one iteration in frames. */
  durationInFrames: number;
  /** Number of iterations; omit for infinite. */
  times?: number;
  layout?: 'local' | 'global';
  children: React.ReactNode;
}

export const Loop: React.FC<LoopProps> = ({
  durationInFrames,
  times,
  layout = 'local',
  children,
}) => {
  const parentFrame = useCurrentFrame();
  const cfg = useVideoConfig();
  const iteration = Math.floor(parentFrame / durationInFrames);
  if (times !== undefined && iteration >= times) return null;
  const local =
    layout === 'global' ? parentFrame : parentFrame % durationInFrames;
  return (
    <FrameProvider frame={local} config={{ ...cfg, durationInFrames }}>
      {children}
    </FrameProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Feature #16 — <Freeze>                                             */
/* ------------------------------------------------------------------ */

export const Freeze: React.FC<{ frame: number; children: React.ReactNode }> = ({
  frame,
  children,
}) => {
  const cfg = useVideoConfig();
  return (
    <FrameProvider frame={frame} config={cfg}>
      {children}
    </FrameProvider>
  );
};

/* ------------------------------------------------------------------ */
/* Utility: enumerate declared timeline layers                        */
/* Used by the Studio timeline view.                                  */
/* ------------------------------------------------------------------ */

export interface TimelineDescriptor {
  from: number;
  durationInFrames: number;
  name?: string;
  color?: string;
  visible: boolean;
}

export function useDeclaredTimelineLayers(): TimelineDescriptor[] {
  const hint = useTimelineHint();
  const cfg = useVideoConfig();
  return useMemo(
    () => [
      {
        from: 0,
        durationInFrames: cfg.durationInFrames,
        name: hint.name,
        color: hint.color,
        visible: hint.showInTimeline !== false,
      },
    ],
    [cfg, hint],
  );
}
