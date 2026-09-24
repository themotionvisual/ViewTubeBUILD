import { describe, expect, it } from 'vitest';
import {
  VT_E1_ACCEPTED_TRANSITION_TYPES,
  VT_E1_TRANSITION_CATALOG,
  normalizeVtE1TransitionType,
  resolveVtE1TransitionDefinition,
  transitionParamsFor,
  transitionPresentationFor,
} from './vtE1TransitionCatalog.js';

describe('VT_E1 transition catalog', () => {
  it('keeps canonical transition ids unique and render-safe', () => {
    const ids = VT_E1_TRANSITION_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      'cut',
      'fade',
      'crossfade',
      'slideLeft',
      'slideRight',
      'wipeLeft',
      'wipeRight',
      'zoom',
    ]);
  });

  it('maps legacy generic ids onto canonical directional ids', () => {
    expect(normalizeVtE1TransitionType('slide')).toBe('slideLeft');
    expect(normalizeVtE1TransitionType('wipe')).toBe('wipeLeft');
    expect(VT_E1_ACCEPTED_TRANSITION_TYPES).toContain('slide');
    expect(VT_E1_ACCEPTED_TRANSITION_TYPES).toContain('wipe');
  });

  it('drives preview presentation and parameters from the same definition', () => {
    expect(transitionPresentationFor('slideRight')).toBe('slide');
    expect(transitionParamsFor('slideRight')).toMatchObject({ direction: 'from-right' });
    expect(transitionPresentationFor('wipeLeft')).toBe('wipe');
    expect(transitionParamsFor('wipeLeft')).toMatchObject({ direction: 'from-left' });
    expect(resolveVtE1TransitionDefinition('zoom')).toMatchObject({
      id: 'zoom',
      presentation: 'zoom',
      renderType: 'zoom',
    });
  });

  it('falls back to fade instead of inventing an unsupported transition', () => {
    expect(normalizeVtE1TransitionType('unknown-transition')).toBe('fade');
    expect(resolveVtE1TransitionDefinition('unknown-transition').label).toBe('Fade');
  });
});
