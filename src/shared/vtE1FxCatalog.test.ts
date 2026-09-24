import { describe, expect, it } from 'vitest';
import {
  VT_E1_DEFAULT_FX_ORDER,
  VT_E1_FX_CATALOG,
  normalizeVtE1FxDisabled,
  normalizeVtE1FxOrder,
  resetVtE1FxPatch,
  vtE1FilterCss,
  vtE1FxOpacity,
  vtE1FxValue,
} from './vtE1FxCatalog.js';

describe('VT_E1 FX catalog', () => {
  it('has one unique canonical id for every currently rendered layer effect', () => {
    const ids = VT_E1_FX_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      'blur',
      'saturation',
      'brightness',
      'hue',
      'contrast',
      'sepia',
      'grayscale',
      'opacity',
    ]);
  });

  it('normalizes effect order without dropping canonical effects', () => {
    expect(normalizeVtE1FxOrder(['hue', 'blur', 'hue', 'unknown'])).toEqual([
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

  it('clamps payload values to the catalog contract', () => {
    expect(vtE1FxValue({ blur: 999 }, 'blur')).toBe(40);
    expect(vtE1FxValue({ hue: -999 }, 'hue')).toBe(-180);
    expect(vtE1FxValue({ saturation: 'nope' }, 'saturation')).toBe(1);
  });

  it('renders filter css in project-defined order with disabled effects removed', () => {
    expect(vtE1FilterCss({
      blur: 2,
      saturation: 1.2,
      brightness: 0.8,
      fxOrder: ['brightness', 'blur', 'saturation'],
      fxDisabled: { saturation: true },
    })).toBe('brightness(0.8) blur(2px) contrast(1)');
  });

  it('treats bypass and disabled opacity consistently', () => {
    expect(vtE1FxOpacity({ opacity: 0.25 })).toBe(0.25);
    expect(vtE1FxOpacity({ opacity: 0.25, fxDisabled: { opacity: true } })).toBe(1);
    expect(vtE1FxOpacity({ opacity: 0.25, fxBypass: true })).toBe(1);
    expect(normalizeVtE1FxDisabled({ blur: 1, fake: true })).toEqual({ blur: true });
  });

  it('produces a reset patch from catalog defaults', () => {
    const patch = resetVtE1FxPatch();
    expect(patch).toMatchObject({
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
    expect(patch.fxOrder).toEqual([...VT_E1_DEFAULT_FX_ORDER]);
  });
});
