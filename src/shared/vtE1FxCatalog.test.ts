import { describe, expect, it } from 'vitest';
import {
  VT_E1_ANIMATED_FX_KEYS,
  VT_E1_DEFAULT_FX_ORDER,
  VT_E1_FX_CATALOG,
  buildVtE1Filter,
  clampVtE1FxValue,
  normalizeVtE1FxOrder,
  resetVtE1FxPatch,
  resolveVtE1FxDisabled,
  resolveVtE1FxOpacity,
} from './vtE1FxCatalog.js';

describe('VT_E1 FX catalog', () => {
  it('owns one unique canonical FX vocabulary', () => {
    const keys = VT_E1_FX_CATALOG.map((entry) => entry.key);
    expect(keys).toEqual([
      'blur',
      'saturation',
      'brightness',
      'hue',
      'contrast',
      'sepia',
      'grayscale',
      'opacity',
    ]);
    expect(new Set(keys).size).toBe(keys.length);
    expect(VT_E1_DEFAULT_FX_ORDER).toEqual(keys);
    expect(VT_E1_ANIMATED_FX_KEYS).toEqual(keys);
  });

  it('normalizes custom order without duplicates or unknown effects', () => {
    expect(normalizeVtE1FxOrder(['hue', 'blur', 'hue', 'not-real'])).toEqual([
      'hue',
      'blur',
      'saturation',
      'brightness',
      'contrast',
      'sepia',
      'grayscale',
      'opacity',
    ]);
  });

  it('uses identical deterministic CSS filter math for every caller', () => {
    const payload = {
      blur: 3,
      saturation: 1.25,
      brightness: 0.9,
      hue: -20,
      contrast: 1.1,
      sepia: 0.2,
      grayscale: 0.1,
      fxOrder: ['hue', 'blur', 'contrast', 'saturation', 'brightness', 'sepia', 'grayscale'],
    };
    expect(buildVtE1Filter(payload)).toBe(
      'hue-rotate(-20deg) blur(3px) contrast(1.1) saturate(1.25) brightness(0.9) sepia(0.2) grayscale(0.1)',
    );
  });

  it('honors per-effect disable and rack bypass', () => {
    const payload = {
      blur: 4,
      saturation: 1.2,
      fxDisabled: { blur: true, madeUp: true },
    };
    expect(resolveVtE1FxDisabled(payload)).toEqual({ blur: true });
    expect(buildVtE1Filter(payload)).not.toContain('blur(');
    expect(buildVtE1Filter({ ...payload, fxBypass: true })).toBe('');
    expect(resolveVtE1FxOpacity({ opacity: 0.2, fxBypass: true }, 0.2)).toBe(1);
  });

  it('clamps values and produces one reset patch from catalog defaults', () => {
    expect(clampVtE1FxValue('blur', -3)).toBe(0);
    expect(clampVtE1FxValue('grayscale', 2)).toBe(1);
    expect(clampVtE1FxValue('hue', 999)).toBe(180);
    expect(resetVtE1FxPatch()).toMatchObject({
      blur: 0,
      saturation: 1,
      brightness: 1,
      hue: 0,
      contrast: 1,
      sepia: 0,
      grayscale: 0,
      opacity: 1,
      fxBypass: false,
      fxDisabled: {},
    });
  });
});
