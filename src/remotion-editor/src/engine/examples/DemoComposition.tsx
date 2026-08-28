/**
 * Demo composition — exercises the core, timeline, transitions, text, and SVG
 * modules end-to-end so you can see the engine work in the Remotion Studio.
 *
 * Register it via `<Composition id="EngineDemo" component={DemoComposition} …/>`.
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  evolvePath,
  shapes,
  Sequence,
  Loop,
} from '../index';
import { TransitionSeries, presentations, linearTiming } from '../transitions/transitions';
import { StaggeredText, TypewriterText } from '../text/kinetics';

const BG = '#0b1220';
const FG = '#f8fafc';
const ACCENT = '#22d3ee';

const IntroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 120, mass: 1 } });
  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center', color: FG }}>
      <div style={{ transform: `scale(${s})`, textAlign: 'center' }}>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
          ViewTube <span style={{ color: ACCENT }}>Engine</span>
        </div>
        <div style={{ fontSize: 32, opacity: 0.7, marginTop: 12 }}>100 features, one runtime.</div>
      </div>
    </AbsoluteFill>
  );
};

const FeatureRoll: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG, color: FG, padding: 80, justifyContent: 'center' }}>
      <div style={{ fontSize: 28, opacity: 0.6, marginBottom: 16 }}>Category 3 — animation</div>
      <StaggeredText
        text="Interpolate, spring, easing, noise, motion blur."
        by="word"
        stagger={4}
        springConfig={{ damping: 14, stiffness: 140, mass: 1 }}
        style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}
      />
      <div style={{ marginTop: 48, fontSize: 24, opacity: 0.8 }}>
        <TypewriterText text="> ready(_)" cps={12} />
      </div>
    </AbsoluteFill>
  );
};

const PathReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const total = durationInFrames;
  const progress = interpolate(frame, [0, total - 6], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const star = shapes.star(5, 220, 90);
  const dash = evolvePath(progress, star);
  const spin = interpolate(frame, [0, durationInFrames], [0, 360]);
  const opacity = Math.min(1, frame / (fps * 0.4));
  return (
    <AbsoluteFill style={{ background: BG, color: FG, alignItems: 'center', justifyContent: 'center' }}>
      <svg width={520} height={520} viewBox="-260 -260 520 520" style={{ opacity }}>
        <g transform={`rotate(${spin})`}>
          <path
            d={star}
            fill="none"
            stroke={ACCENT}
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
            {...dash}
          />
        </g>
      </svg>
      <div style={{ marginTop: 24, fontSize: 22, opacity: 0.7 }}>evolvePath · shapes.star</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', color: FG, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ opacity, textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 600 }}>Built with the engine at</div>
        <div style={{ fontSize: 28, opacity: 0.6, marginTop: 8 }}>
          src/remotion-editor/src/engine
        </div>
      </div>
      {/* Loop a pulsing accent bar just to demonstrate <Loop>. */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Loop durationInFrames={30}>
          <PulseBar />
        </Loop>
      </div>
    </AbsoluteFill>
  );
};

const PulseBar: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 15, 30], [0.4, 1, 0.4]);
  return (
    <div style={{ width: 320, height: 4, borderRadius: 2, background: ACCENT, transform: `scaleX(${s})`, opacity: s }} />
  );
};

/* ------------------------------------------------------------------ */
/* Composition — wires the scenes with cross-fades                    */
/* ------------------------------------------------------------------ */

export const DemoComposition: React.FC = () => {
  const fade = presentations.fade();
  const wipe = presentations.wipe({ direction: 'from-right' });
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <IntroCard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <FeatureRoll />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <PathReveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={90}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Watermark that stays visible for the whole comp, hidden from timeline. */}
      <Sequence from={0} showInTimeline={false}>
        <div style={{ position: 'absolute', bottom: 24, right: 32, color: FG, opacity: 0.4, fontSize: 14 }}>
          engine · demo
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export const DEMO_DURATION_IN_FRAMES = 90 + 120 + 120 + 90; // sequence durations only; transitions overlap
