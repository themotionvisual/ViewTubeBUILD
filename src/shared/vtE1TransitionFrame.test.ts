import { describe, expect, it } from 'vitest';
import { transitionFrameStyleFor } from './vtE1TransitionFrame.js';

describe('VT_E1 preview/final transition frame contract', () => {
  it('crossfades with complementary opacity on both sides', () => {
    const outgoing = transitionFrameStyleFor('crossfade', 0.25, 'exiting');
    const incoming = transitionFrameStyleFor('crossfade', 0.25, 'entering');
    expect(outgoing.opacity).toBeCloseTo(0.75, 6);
    expect(incoming.opacity).toBeCloseTo(0.25, 6);
    expect(outgoing.opacity + incoming.opacity).toBeCloseTo(1, 6);
  });

  it('uses the same directional slide geometry for preview and final render callers', () => {
    expect(transitionFrameStyleFor('slideRight', 0, 'entering').transform).toBe('translateX(100%)');
    expect(transitionFrameStyleFor('slideRight', 1, 'entering').transform).toBe('translateX(0%)');
    expect(transitionFrameStyleFor('slideRight', 1, 'exiting').transform).toBe('translateX(-100%)');
    expect(transitionFrameStyleFor('slideLeft', 1, 'exiting').transform).toBe('translateX(100%)');
  });

  it('uses clip geometry for canonical wipes instead of a different final-render approximation', () => {
    const entering = transitionFrameStyleFor('wipeLeft', 0.5, 'entering');
    const exiting = transitionFrameStyleFor('wipeLeft', 0.5, 'exiting');
    expect(entering.clipPath).toBe('inset(0 50% 0 0)');
    expect(exiting.clipPath).toBe('inset(0 50% 0 0)');
    expect(entering.transform).toBe('');
  });

  it('keeps zoom scale and opacity deterministic at fixture frames', () => {
    expect(transitionFrameStyleFor('zoom', 0, 'entering')).toMatchObject({
      opacity: 0,
      transform: 'scale(0.86)',
    });
    expect(transitionFrameStyleFor('zoom', 1, 'entering')).toMatchObject({
      opacity: 1,
      transform: 'scale(1)',
    });
    expect(transitionFrameStyleFor('zoom', 1, 'exiting')).toMatchObject({
      opacity: 0,
      transform: 'scale(1.2)',
    });
  });

  it('gives cut a deterministic midpoint ownership handoff', () => {
    expect(transitionFrameStyleFor('cut', 0.49, 'exiting').opacity).toBe(1);
    expect(transitionFrameStyleFor('cut', 0.49, 'entering').opacity).toBe(0);
    expect(transitionFrameStyleFor('cut', 0.5, 'exiting').opacity).toBe(0);
    expect(transitionFrameStyleFor('cut', 0.5, 'entering').opacity).toBe(1);
  });
});
