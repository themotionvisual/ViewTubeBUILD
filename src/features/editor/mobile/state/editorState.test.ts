import { describe, expect, it } from 'vitest';
import { editorReducer, initialState } from './editorState';

const seed = () => initialState({
  durationSec: 20,
  clips: [
    { id: 'a', trackId: 't_video', layerId: 'a', start: 0, end: 3, sourceInSec: 0, sourceOutSec: 3, keyframes: [] },
    { id: 'b', trackId: 't_video', layerId: 'b', start: 3, end: 6, sourceInSec: 4, sourceOutSec: 7, keyframes: [{ id: 'k', offsetSec: 2, value: 1 }] },
    { id: 'c', trackId: 't_video', layerId: 'c', start: 6, end: 10, sourceInSec: 6, sourceOutSec: 10, keyframes: [] },
    { id: 'music', trackId: 't_audio', layerId: 'music', start: 1, end: 9, sourceInSec: 1, sourceOutSec: 9, keyframes: [] },
  ],
  transitions: [],
});

describe('mobile editor canonical timeline adapters', () => {
  it('keeps ordinary move semantics independent from slide', () => {
    const state = editorReducer(seed(), { type: 'moveClip', id: 'b', deltaSec: 1 });
    expect(state.project.clips.find((clip) => clip.id === 'a')).toMatchObject({ start: 0, end: 3 });
    expect(state.project.clips.find((clip) => clip.id === 'b')).toMatchObject({ start: 4, end: 7 });
    expect(state.project.clips.find((clip) => clip.id === 'c')).toMatchObject({ start: 6, end: 10 });
  });

  it('slips source range without moving timeline edges', () => {
    const state = editorReducer(seed(), { type: 'slipClip', id: 'b', deltaSec: 2, sourceDurationSec: 12 });
    expect(state.project.clips.find((clip) => clip.id === 'b')).toMatchObject({ start: 3, end: 6, sourceInSec: 6, sourceOutSec: 9 });
  });

  it('slides through canonical neighboring-clip math', () => {
    const state = editorReducer(seed(), { type: 'slideClip', id: 'b', deltaSec: 1 });
    expect(state.project.clips.filter((clip) => clip.trackId === 't_video').map((clip) => [clip.id, clip.start, clip.end])).toEqual([
      ['a', 0, 4], ['b', 4, 7], ['c', 7, 10],
    ]);
  });

  it('ripple deletes on the affected track without shifting audio', () => {
    const state = editorReducer(seed(), { type: 'rippleDeleteClips', ids: ['b'] });
    expect(state.project.clips.find((clip) => clip.id === 'c')).toMatchObject({ start: 3, end: 7 });
    expect(state.project.clips.find((clip) => clip.id === 'music')).toMatchObject({ start: 1, end: 9 });
  });

  it('records advanced edits in the same bounded history path', () => {
    const state = editorReducer(seed(), { type: 'slideClip', id: 'b', deltaSec: 1 });
    expect(state.history.past).toHaveLength(1);
    const restored = editorReducer(state, { type: 'undo' });
    expect(restored.project.clips.find((clip) => clip.id === 'b')).toMatchObject({ start: 3, end: 6 });
  });
});
