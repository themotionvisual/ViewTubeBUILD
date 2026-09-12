import { describe, expect, it } from 'vitest';
import {
  desktopProjectCanRoundTripThroughMobile,
  desktopProjectToMobileBridgeProject,
  mobileBridgeProjectToDesktopProject,
  mobileTrackKindForDesktopTrack,
} from './editorDesktopProjectAdapter';

const desktopProject = {
  schemaVersion: 'EditorProjectV2',
  meta: {
    durationSec: 42,
    aspectRatio: '16:9',
    projectName: 'Bridge Test',
  },
  tracks: [
    { id: 'v1', name: 'V1', kind: 'visual', visible: true, locked: false, muted: false, color: '#f00' },
    { id: 'a1', name: 'AUDIO', kind: 'audio', visible: true, locked: false, muted: true, color: '#0ff' },
  ],
  layers: [
    { id: 'layer-1', trackId: 'v1', type: 'text', visible: true },
  ],
  clips: [
    { id: 'clip-1', trackId: 'v1', layerId: 'layer-1', start: 0, end: 4 },
  ],
  transitions: [],
  seamLinks: [{ leftClipId: 'clip-1', rightClipId: 'clip-2' }],
};

describe('editorDesktopProjectAdapter', () => {
  it('maps desktop visual/audio tracks into the mobile contract without losing their desktop kind', () => {
    const mobile = desktopProjectToMobileBridgeProject(desktopProject);

    expect(mobile.durationSec).toBe(42);
    expect(mobile.tracks[0]).toMatchObject({
      id: 'v1',
      kind: 'video',
      desktopKind: 'visual',
      desktopVisible: true,
    });
    expect(mobile.tracks[1]).toMatchObject({
      id: 'a1',
      kind: 'audio',
      desktopKind: 'audio',
      muted: true,
    });
    expect(mobile.layers).toEqual(desktopProject.layers);
    expect(mobile.seamLinks).toEqual(desktopProject.seamLinks);
  });

  it('restores the desktop track vocabulary and preserves non-mobile project fields', () => {
    const mobile = desktopProjectToMobileBridgeProject(desktopProject);
    mobile.clips = [{ ...mobile.clips[0], start: 1, end: 5 }];
    mobile.tracks[0] = { ...mobile.tracks[0], hidden: true };

    const restored = mobileBridgeProjectToDesktopProject(mobile, desktopProject);

    expect(restored.schemaVersion).toBe('EditorProjectV2');
    expect(restored.meta?.durationSec).toBe(42);
    expect(restored.layers).toEqual(desktopProject.layers);
    expect(restored.tracks?.[0]).toMatchObject({
      id: 'v1',
      kind: 'visual',
      visible: true,
    });
    expect(restored.clips[0]).toMatchObject({ start: 1, end: 5, layerId: 'layer-1' });
  });

  it('maps unknown visual-like tracks to video and caption/overlay names to the expected mobile kinds', () => {
    expect(mobileTrackKindForDesktopTrack('visual', 'V3')).toBe('video');
    expect(mobileTrackKindForDesktopTrack(undefined, 'Captions')).toBe('caption');
    expect(mobileTrackKindForDesktopTrack(undefined, 'Overlay')).toBe('overlay');
    expect(mobileTrackKindForDesktopTrack('audio', 'Music')).toBe('audio');
  });

  it('rejects projects that cannot safely round-trip through timeline editing', () => {
    expect(desktopProjectCanRoundTripThroughMobile(desktopProject)).toBe(true);
    expect(desktopProjectCanRoundTripThroughMobile({ clips: [], tracks: undefined })).toBe(false);
    expect(desktopProjectCanRoundTripThroughMobile({
      clips: [{ id: 'bad', trackId: 'v1', start: 'x', end: 4 }],
      tracks: [],
    })).toBe(false);
  });
});
