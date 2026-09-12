import { describe, expect, it } from 'vitest';
import { desktopTimelineAdapter } from './desktopTimelineAdapter.js';

const clip = (id: string, start: number, end: number, trackId = 'v1') => ({
  id,
  trackId,
  layerId: id,
  start,
  end,
  sourceInSec: start,
  sourceOutSec: end,
  keyframes: [],
});

describe('desktop timeline adapter', () => {
  it('preserves source ranges and keyframes when splitting', () => {
    const clips = [{
      ...clip('a', 2, 8),
      sourceInSec: 10,
      sourceOutSec: 16,
      keyframes: [{ id: 'k1', offsetSec: 1 }, { id: 'k2', offsetSec: 5 }],
    }];
    const result = desktopTimelineAdapter.split(clips, 'a', 5, () => 'a-right');
    expect(result.changed).toBe(true);
    expect(result.left).toMatchObject({ end: 5, sourceOutSec: 13 });
    expect(result.right).toMatchObject({ id: 'a-right', start: 5, sourceInSec: 13 });
    expect(result.right.keyframes).toEqual([{ id: 'k2', offsetSec: 2 }]);
  });

  it('slips without changing outer timeline edges', () => {
    const result = desktopTimelineAdapter.slip([{ ...clip('a', 2, 5), sourceInSec: 3, sourceOutSec: 6 }], 'a', 2, 10);
    expect(result.clip).toMatchObject({ start: 2, end: 5, sourceInSec: 5, sourceOutSec: 8 });
  });

  it('slides a contiguous middle clip through canonical seam math', () => {
    const result = desktopTimelineAdapter.slide([clip('a', 0, 3), clip('b', 3, 6), clip('c', 6, 10)], 'b', 1);
    expect(result.changed).toBe(true);
    expect(result.clips.map((entry: { id: string; start: number; end: number }) => [entry.id, entry.start, entry.end])).toEqual([
      ['a', 0, 4], ['b', 4, 7], ['c', 7, 10],
    ]);
  });

  it('reports a rejected slide without mutating clips', () => {
    const clips = [clip('a', 0, 2), clip('b', 3, 6), clip('c', 6, 10)];
    const result = desktopTimelineAdapter.slide(clips, 'b', 1);
    expect(result.changed).toBe(false);
    expect(result.reason).toContain('Close both seams');
  });

  it('ripple deletes per track', () => {
    const result = desktopTimelineAdapter.rippleDelete([
      clip('a', 0, 2), clip('b', 2, 4), clip('c', 4, 6), clip('music', 1, 7, 'a1'),
    ], ['b']);
    expect(result.clips.find((entry: { id: string }) => entry.id === 'c')).toMatchObject({ start: 2, end: 4 });
    expect(result.clips.find((entry: { id: string }) => entry.id === 'music')).toMatchObject({ start: 1, end: 7 });
  });
});
