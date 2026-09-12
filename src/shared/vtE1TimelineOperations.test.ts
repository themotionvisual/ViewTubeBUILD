import { describe, expect, it } from 'vitest';
import { rippleDeleteTimelineClips, slideTimelineClip, slipTimelineClip, splitTimelineClip } from './vtE1TimelineOperations.js';

const clip = (id: string, start: number, end: number, trackId = 'v1') => ({ id, trackId, layerId: id, start, end, sourceInSec: start, sourceOutSec: end, keyframes: [] });

describe('VT_E1 timeline operations', () => {
  it('splits timeline and source offsets together', () => {
    const result = splitTimelineClip({ ...clip('a', 2, 8), sourceInSec: 10, sourceOutSec: 16 }, 5);
    expect(result?.left).toMatchObject({ start: 2, end: 5, sourceInSec: 10, sourceOutSec: 13 });
    expect(result?.right).toMatchObject({ start: 5, end: 8, sourceInSec: 13, sourceOutSec: 16 });
  });

  it('preserves and rebases keyframes across a split', () => {
    const result = splitTimelineClip({
      ...clip('a', 2, 8),
      sourceInSec: 10,
      sourceOutSec: 16,
      keyframes: [
        { id: 'k0', offsetSec: 1, value: 0 },
        { id: 'k1', offsetSec: 3, value: 50 },
        { id: 'k2', offsetSec: 5, value: 100 },
      ],
    }, 5);

    expect(result?.left.keyframes.map((keyframe) => [keyframe.id, keyframe.offsetSec])).toEqual([
      ['k0', 1],
      ['k1', 3],
    ]);
    expect(result?.right.keyframes.map((keyframe) => [keyframe.id, keyframe.offsetSec])).toEqual([
      ['k1', 0],
      ['k2', 2],
    ]);
  });

  it('rejects a split on either clip boundary', () => {
    expect(splitTimelineClip(clip('a', 2, 8), 2)).toBeNull();
    expect(splitTimelineClip(clip('a', 2, 8), 8)).toBeNull();
  });

  it('slips without changing timeline edges', () => {
    expect(slipTimelineClip(clip('a', 2, 5), 3, 10)).toMatchObject({ start: 2, end: 5, sourceInSec: 5, sourceOutSec: 8 });
  });

  it('clamps slip to the available source duration', () => {
    expect(slipTimelineClip({ ...clip('a', 2, 5), sourceInSec: 6, sourceOutSec: 9 }, 8, 10)).toMatchObject({
      start: 2,
      end: 5,
      sourceInSec: 7,
      sourceOutSec: 10,
    });
  });

  it('slides a contiguous clip by trimming its neighbors', () => {
    const result = slideTimelineClip([clip('a', 0, 3), clip('b', 3, 6), clip('c', 6, 10)], 'b', 1);
    expect(result.appliedDeltaSec).toBe(1);
    expect(result.clips.map((entry) => [entry.id, entry.start, entry.end])).toEqual([['a', 0, 4], ['b', 4, 7], ['c', 7, 10]]);
  });

  it('refuses to slide when either adjacent seam is open', () => {
    const result = slideTimelineClip([clip('a', 0, 2), clip('b', 3, 6), clip('c', 6, 10)], 'b', 1);
    expect(result.appliedDeltaSec).toBe(0);
    expect(result.reason).toContain('Close both seams');
  });

  it('ripple deletes selected durations per track', () => {
    const result = rippleDeleteTimelineClips([clip('a', 0, 2), clip('b', 4, 6), clip('c', 7, 9)], ['b']);
    expect(result.map((entry) => [entry.id, entry.start, entry.end])).toEqual([['a', 0, 2], ['c', 5, 7]]);
  });

  it('keeps ripple-delete shifts isolated to each track', () => {
    const result = rippleDeleteTimelineClips([
      clip('a', 0, 2, 'v1'),
      clip('b', 2, 4, 'v1'),
      clip('c', 4, 6, 'v1'),
      clip('music', 1, 5, 'a1'),
    ], ['b']);
    expect(result.find((entry) => entry.id === 'c')).toMatchObject({ start: 2, end: 4 });
    expect(result.find((entry) => entry.id === 'music')).toMatchObject({ start: 1, end: 5 });
  });
});
