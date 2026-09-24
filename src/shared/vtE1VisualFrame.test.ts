import { describe, expect, it } from 'vitest';
import {
  easeVtE1KeyframeProgress,
  evaluateVtE1KeyframedValue,
  readVtE1ClipVisualTransform,
  resolveVtE1VisualFrame,
  sortVtE1Tracks,
  vtE1MediaCropStyle,
} from './vtE1VisualFrame.js';

describe('VT_E1 preview/final visual frame contract', () => {
  it('uses identical advanced easing math for preview and final callers', () => {
    expect(easeVtE1KeyframeProgress(0.5, 'springy')).toBeCloseTo(
      Math.min(1, Math.max(0, 1 - Math.cos(0.5 * Math.PI * 2.25) * Math.exp(-0.5 * 4.2))),
      8,
    );
    expect(easeVtE1KeyframeProgress(0.5, 'bell')).toBeCloseTo(1, 8);
  });

  it('interpolates numeric keyframes and switches discrete values deterministically', () => {
    const keyframes = [
      { offsetSec: 0, values: { x: 0, fillColor: '#000' }, interp: 'linear' },
      { offsetSec: 2, values: { x: 100, fillColor: '#fff' }, interp: 'easeInOut' },
    ];
    expect(evaluateVtE1KeyframedValue(0, keyframes, 'x', 1)).toBeCloseTo(50, 8);
    expect(evaluateVtE1KeyframedValue('#000', keyframes, 'fillColor', 1)).toBe('#000');
    expect(evaluateVtE1KeyframedValue('#000', keyframes, 'fillColor', 2)).toBe('#fff');
  });

  it('combines layer payload motion with clip transform without changing ownership', () => {
    const clip = {
      transform: { x: 12, y: -8, scaleX: 1.5, scaleY: 0.75, rotation: 10, opacity: 0.5 },
      cropLeft: 0.1,
      cropRight: 0.2,
      keyframes: [
        { offsetSec: 0, values: { x: 0, scale: 1 } },
        { offsetSec: 2, values: { x: 20, scale: 2 } },
      ],
    };
    const frame = resolveVtE1VisualFrame(
      { x: 4, y: 3, scale: 1, rotation: 5, opacity: 0.8, width: 640, height: 360 },
      clip,
      1,
      1920,
      1080,
    );
    expect(frame.x).toBeCloseTo(22, 8);
    expect(frame.y).toBeCloseTo(-5, 8);
    expect(frame.scaleX).toBeCloseTo(2.25, 8);
    expect(frame.scaleY).toBeCloseTo(1.125, 8);
    expect(frame.rotation).toBeCloseTo(15, 8);
    expect(frame.opacity).toBeCloseTo(0.4, 8);
    expect(frame.width).toBe(640);
    expect(frame.height).toBe(360);
  });

  it('normalizes crop to a safe non-destructive media transform', () => {
    const clip = { cropLeft: 0.1, cropRight: 0.2, cropTop: 0.05, cropBottom: 0.15 };
    const transform = readVtE1ClipVisualTransform(clip);
    expect(transform.cropLeft + transform.cropRight).toBeLessThan(0.99);
    const style = vtE1MediaCropStyle(clip);
    expect(style.transform).toContain('translate(');
    expect(style.transform).toContain('scale(');
    expect(style.transformOrigin).toBe('0 0');
  });

  it('uses explicit track order while keeping stable source order as fallback', () => {
    const tracks = [
      { id: 'b', order: 20 },
      { id: 'a', order: 10 },
      { id: 'c' },
    ];
    expect(sortVtE1Tracks(tracks).map((track) => track.id)).toEqual(['c', 'a', 'b']);
    expect(sortVtE1Tracks([{ id: 'a' }, { id: 'b' }]).map((track) => track.id)).toEqual(['a', 'b']);
  });
});
