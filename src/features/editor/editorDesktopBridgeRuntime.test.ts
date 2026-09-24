import { describe, expect, it } from 'vitest';
import {
  editorProjectFingerprint,
  mobileSeedFromBridgeSnapshot,
  publishDesktopProjectToBridge,
  restoreDesktopProjectFromSnapshot,
  shouldApplyBridgeProject,
} from './editorDesktopBridgeRuntime';

const desktop = {
  schemaVersion: 'EditorProjectV2',
  meta: { durationSec: 30, aspectRatio: '16:9' },
  tracks: [{ id: 'v1', name: 'V1', kind: 'visual', visible: true }],
  layers: [{ id: 'l1', trackId: 'v1', type: 'text', payload: {} }],
  clips: [{ id: 'c1', trackId: 'v1', layerId: 'l1', start: 0, end: 4 }, { id: 'c2', trackId: 'v1', layerId: 'l1', start: 4, end: 8 }],
  transitions: [{ id: 'tr1', leftClipId: 'c1', rightClipId: 'c2', durationSec: 0.4, nominalSeamSec: 4, type: 'fade', presentation: 'fade', params: {} }],
};

describe('editorDesktopBridgeRuntime', () => {
  it('creates a stable timeline fingerprint for equivalent projects', () => {
    expect(editorProjectFingerprint(desktop)).toBe(editorProjectFingerprint({ ...desktop }));
    expect(editorProjectFingerprint({ ...desktop, clips: [{ ...desktop.clips[0], end: 5 }] }))
      .not.toBe(editorProjectFingerprint(desktop));
  });

  it('fingerprints transition presentation and layer payload changes, not just clip timing', () => {
    expect(editorProjectFingerprint({
      ...desktop,
      transitions: [{ ...desktop.transitions[0], type: 'slideRight', presentation: 'slide', params: { direction: 'from-right' } }],
    })).not.toBe(editorProjectFingerprint(desktop));

    expect(editorProjectFingerprint({
      ...desktop,
      layers: [{ ...desktop.layers[0], payload: { x: 24 } }],
    })).not.toBe(editorProjectFingerprint(desktop));
  });

  it('keeps fingerprints stable when object keys are reordered', () => {
    const reordered = {
      transitions: desktop.transitions,
      clips: desktop.clips,
      layers: desktop.layers,
      tracks: desktop.tracks,
      meta: desktop.meta,
      schemaVersion: desktop.schemaVersion,
    };
    expect(editorProjectFingerprint(reordered)).toBe(editorProjectFingerprint(desktop));
  });

  it('publishes a valid desktop project without needing a browser runtime', () => {
    const snapshot = publishDesktopProjectToBridge(desktop, 100);
    expect(snapshot).toMatchObject({
      version: 1,
      source: 'desktop',
      updatedAt: 100,
      project: desktop,
    });
  });

  it('restores mobile timeline edits into the full desktop project shape', () => {
    const mobileSnapshot = {
      version: 1 as const,
      source: 'mobile' as const,
      updatedAt: 200,
      project: {
        ...desktop,
        durationSec: 30,
        tracks: [{
          id: 'v1',
          name: 'V1',
          kind: 'video' as const,
          desktopKind: 'visual',
          desktopVisible: true,
          hidden: false,
        }],
        clips: [{ ...desktop.clips[0], start: 2, end: 6 }],
      },
    };

    const result = restoreDesktopProjectFromSnapshot(mobileSnapshot, desktop);
    expect(result.applied).toBe(true);
    expect(result.source).toBe('mobile');
    expect(result.project.layers).toEqual(desktop.layers);
    expect(result.project.tracks?.[0]?.kind).toBe('visual');
    expect(result.project.clips[0]).toMatchObject({ start: 2, end: 6, layerId: 'l1' });
  });

  it('creates a mobile-safe seed from a desktop snapshot', () => {
    const seed = mobileSeedFromBridgeSnapshot({
      version: 1,
      source: 'desktop',
      updatedAt: 250,
      project: desktop,
    });

    expect(seed?.durationSec).toBe(30);
    expect(seed?.tracks[0]).toMatchObject({ kind: 'video', desktopKind: 'visual' });
    expect(seed?.layers).toEqual(desktop.layers);
    expect(seed?.transitions).toEqual(desktop.transitions);
  });

  it('survives a desktop to mobile to desktop round-trip with canonical transition identity intact', () => {
    const mobileSeed = mobileSeedFromBridgeSnapshot({
      version: 1,
      source: 'desktop',
      updatedAt: 275,
      project: desktop,
    });
    expect(mobileSeed).toBeDefined();

    const result = restoreDesktopProjectFromSnapshot({
      version: 1,
      source: 'mobile',
      updatedAt: 276,
      project: mobileSeed!,
    }, desktop);

    expect(result.applied).toBe(true);
    expect(result.project.layers).toEqual(desktop.layers);
    expect(result.project.transitions).toEqual(desktop.transitions);
    expect(result.project.tracks?.[0]?.kind).toBe('visual');
  });

  it('does not re-apply stale or equivalent bridge snapshots', () => {
    const snapshot = {
      version: 1 as const,
      source: 'desktop' as const,
      updatedAt: 300,
      project: desktop,
    };
    expect(shouldApplyBridgeProject(desktop, snapshot, 300)).toBe(false);
    expect(shouldApplyBridgeProject(desktop, snapshot, 0)).toBe(false);
    expect(shouldApplyBridgeProject(
      { ...desktop, clips: [{ ...desktop.clips[0], end: 7 }] },
      snapshot,
      0,
    )).toBe(true);
  });
});
