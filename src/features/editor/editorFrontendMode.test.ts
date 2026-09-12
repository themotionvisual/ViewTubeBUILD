import { describe, expect, it } from 'vitest';
import {
  editorHostModeFor,
  normalizeEditorFrontendMode,
  resolveEditorFrontendMode,
} from './editorFrontendMode';

describe('editor frontend mode contract', () => {
  it('defaults unknown values to current main', () => {
    expect(normalizeEditorFrontendMode(undefined)).toBe('current-main');
    expect(normalizeEditorFrontendMode('something-else')).toBe('current-main');
  });

  it('preserves the linked classic mode', () => {
    expect(normalizeEditorFrontendMode('linked-classic')).toBe('linked-classic');
  });

  it('lets an explicit linked query override a stored current mode', () => {
    expect(resolveEditorFrontendMode({ queryValue: 'linked', storedValue: 'current-main' })).toBe('linked-classic');
  });

  it('lets an explicit current query override a stored linked mode', () => {
    expect(resolveEditorFrontendMode({ queryValue: 'current', storedValue: 'linked-classic' })).toBe('current-main');
  });

  it('falls back to the stored preference when there is no recognized query value', () => {
    expect(resolveEditorFrontendMode({ storedValue: 'linked-classic' })).toBe('linked-classic');
    expect(resolveEditorFrontendMode({ queryValue: 'unknown', storedValue: 'current-main' })).toBe('current-main');
  });

  it('forces the linked deployment presentation through the classic desktop VT_E1 host', () => {
    expect(editorHostModeFor('linked-classic', 'auto')).toBe('desktop');
    expect(editorHostModeFor('linked-classic', 'mobile')).toBe('desktop');
  });

  it('leaves current main responsive host requests unchanged', () => {
    expect(editorHostModeFor('current-main', 'auto')).toBe('auto');
    expect(editorHostModeFor('current-main', 'mobile')).toBe('mobile');
    expect(editorHostModeFor('current-main', 'desktop')).toBe('desktop');
  });
});
