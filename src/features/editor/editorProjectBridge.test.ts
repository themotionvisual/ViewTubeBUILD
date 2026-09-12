import { describe, expect, it } from 'vitest';
import {
  EDITOR_PROJECT_BRIDGE_VERSION,
  normalizeEditorProjectBridgeSnapshot,
  parseEditorProjectBridgeSnapshot,
  writeEditorProjectBridgeSnapshot,
} from './editorProjectBridge';

const project = {
  clips: [
    { id: 'clip-1', trackId: 't_video', start: 0, end: 4 },
  ],
  transitions: [],
};

describe('editorProjectBridge', () => {
  it('normalizes a valid versioned mobile snapshot', () => {
    expect(normalizeEditorProjectBridgeSnapshot({
      version: EDITOR_PROJECT_BRIDGE_VERSION,
      source: 'mobile',
      updatedAt: 100,
      project,
    })).toEqual({
      version: 1,
      source: 'mobile',
      updatedAt: 100,
      project,
    });
  });

  it('rejects malformed or future-version snapshots', () => {
    expect(normalizeEditorProjectBridgeSnapshot(null)).toBeNull();
    expect(normalizeEditorProjectBridgeSnapshot({ version: 2, source: 'mobile', updatedAt: 1, project })).toBeNull();
    expect(normalizeEditorProjectBridgeSnapshot({ version: 1, source: 'other', updatedAt: 1, project })).toBeNull();
    expect(normalizeEditorProjectBridgeSnapshot({ version: 1, source: 'mobile', updatedAt: 1, project: {} })).toBeNull();
  });

  it('parses valid storage JSON and fails closed on invalid JSON', () => {
    const raw = JSON.stringify({
      version: 1,
      source: 'desktop',
      updatedAt: 200,
      project,
    });
    expect(parseEditorProjectBridgeSnapshot(raw)?.source).toBe('desktop');
    expect(parseEditorProjectBridgeSnapshot('{broken')).toBeNull();
  });

  it('can create a deterministic snapshot without a browser', () => {
    expect(writeEditorProjectBridgeSnapshot('mobile', project, 1234)).toEqual({
      version: 1,
      source: 'mobile',
      updatedAt: 1234,
      project,
    });
  });
});
