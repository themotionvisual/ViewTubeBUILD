import { describe, expect, it } from 'vitest';
import { sourceTimeAtTimelineSec, transitionWindowFor, validateTransitionSeam } from './vtE1TimelineContract.js';

const left = { id: 'left', trackId: 'V1', start: 0, end: 3, sourceInSec: 0, sourceOutSec: 3.5 };
const right = { id: 'right', trackId: 'V1', start: 3, end: 6, sourceInSec: 0.5, sourceOutSec: 4 };

describe('VT_E1 timeline contract', () => {
  it('accepts a shared seam and rejects gaps or cross-track transitions', () => {
    expect(validateTransitionSeam(left, right).valid).toBe(true);
    expect(validateTransitionSeam(left, { ...right, start: 3.2 }).valid).toBe(false);
    expect(validateTransitionSeam(left, { ...right, trackId: 'V2' }).valid).toBe(false);
  });

  it('maps source time through a valid transition window', () => {
    const project = { clips: [left, right], transitions: [{ leftClipId: 'left', rightClipId: 'right', durationSec: 0.5, nominalSeamSec: 3 }] };
    expect(transitionWindowFor(project.transitions[0], left, right)).toMatchObject({ startSec: 2.75, endSec: 3.25 });
    expect(sourceTimeAtTimelineSec(project, left, 3.1)).toBeCloseTo(3.6, 4);
    expect(sourceTimeAtTimelineSec(project, right, 2.9)).toBeCloseTo(0.4, 4);
  });
});
