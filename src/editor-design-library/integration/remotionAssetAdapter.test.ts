import {describe, expect, it} from 'vitest';
import {remotionAssetCatalog, remotionAssetToTimelineClip, resolveRemotionAssetClip} from './remotionAssetAdapter';

describe('remotionAssetAdapter', () => {
  it('exposes the complete Remotion asset registry to the editor layer', () => {
    expect(remotionAssetCatalog).toHaveLength(100);
    expect(remotionAssetCatalog.filter((asset) => asset.type === 'static')).toHaveLength(50);
    expect(remotionAssetCatalog.filter((asset) => asset.type === 'motion')).toHaveLength(50);
  });

  it('creates a clip-owned asset that the render boundary can normalize', () => {
    const clip = remotionAssetToTimelineClip('motion-003', {
      clipId: 'clip-orbit-grid',
      trackId: 't_overlay',
      startSec: 2,
      durationSec: 12,
      props: {speed: 1.5, seed: 42},
    });

    expect(clip.clipType).toBe('remotion-asset');
    expect(clip.remotionAssetId).toBe('motion-003');
    expect(clip.layerId).toBe('remotion-asset-layer-clip-orbit-grid');
    expect(clip.start).toBe(2);
    expect(clip.end).toBe(14);
    expect(resolveRemotionAssetClip(clip)?.name).toBe('Orbit Grid');
  });
});
