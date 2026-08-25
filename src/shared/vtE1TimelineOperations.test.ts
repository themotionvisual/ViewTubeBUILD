import { describe, expect, it } from 'vitest';
import { rippleDeleteTimelineClips, slideTimelineClip, slipTimelineClip, splitTimelineClip } from './vtE1TimelineOperations.js';

const clip = (id: string, start: number, end: number) => ({ id, trackId: 'v1', layerId: id, start, end, sourceInSec: start, sourceOutSec: end, keyframes: [] });

describe('VT_E1 timeline operations', () => {
  it('splits timeline and source offsets together', () => {
    const result = splitTimelineClip({ ...clip('a', 2, 8), sourceInSec: 10, sourceOutSec: 16 }, 5);
    expect(result?.left).toMatchObject({ start: 2, end: 5, sourceInSec: 10, sourceOutSec: 13 });
    expect(result?.right).toMatchObject({ start: 5, end: 8, sourceInSec: 13, sourceOutSec: 16 });
  });

  it('slips without changing timeline edges', () => {
    expect(slipTimelineClip(clip('a', 2, 5), 3, 10)).toMatchObject({ start: 2, end: 5, sourceInSec: 5, sourceOutSec: 8 });
  });

  it('slides a contiguous clip by trimming its neighbors', () => {
    const result = slideTimelineClip([clip('a', 0, 3), clip('b', 3, 6), clip('c', 6, 10)], 'b', 1);
    expect(result.appliedDeltaSec).toBe(1);
    expect(result.clips.map((entry) => [entry.id, entry.start, entry.end])).toEqual([['a', 0, 4], ['b', 4, 7], ['c', 7, 10]]);
  });

  it('ripple deletes selected durations per track', () => {
    const result = rippleDeleteTimelineClips([clip('a', 0, 2), clip('b', 4, 6), clip('c', 7, 9)], ['b']);
    expect(result.map((entry) => [entry.id, entry.start, entry.end])).toEqual([['a', 0, 2], ['c', 5, 7]]);
  });
});
