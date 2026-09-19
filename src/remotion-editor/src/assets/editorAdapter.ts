import { getAssetDefinition } from './catalog';
import type { AssetDefinition, AssetVisualProps } from './types';

export interface EditorAssetLayerPayload extends Partial<AssetVisualProps> {
  assetId: AssetDefinition['id'];
  assetName: string;
  assetCategory: string;
  assetFamily: string;
  loopDurationSeconds: number;
  cycleMode: AssetDefinition['cycleMode'];
  loopBehavior: AssetDefinition['loopBehavior'];
  previewFrame: number;
}

export interface CreateAssetTimelineObjectOptions {
  assetId: AssetDefinition['id'];
  trackId: string;
  startSec: number;
  durationSec?: number;
  layerId?: string;
  clipId?: string;
  overrides?: Partial<AssetVisualProps>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const createAssetTimelineObject = (options: CreateAssetTimelineObjectOptions) => {
  const asset = getAssetDefinition(options.assetId);
  const durationSec = Math.max(
    0.05,
    options.durationSec ?? (asset.type === 'motion' ? asset.recommendedDurationSeconds : 5),
  );
  const layerId = options.layerId ?? `asset-layer-${asset.id}`;
  const clipId = options.clipId ?? `asset-clip-${asset.id}`;

  const payload: EditorAssetLayerPayload & Record<string, unknown> = {
    assetId: asset.id,
    assetName: asset.name,
    assetCategory: asset.category,
    assetFamily: asset.family,
    loopDurationSeconds: asset.loopDurationSeconds,
    cycleMode: asset.cycleMode,
    loopBehavior: asset.loopBehavior,
    previewFrame: asset.previewFrame,
    ...asset.defaults,
    ...options.overrides,
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? 960,
    height: options.height ?? 540,
  };

  return {
    layer: {
      id: layerId,
      type: 'remotion-asset' as const,
      trackId: options.trackId,
      visible: true,
      payload,
    },
    clip: {
      id: clipId,
      layerId,
      trackId: options.trackId,
      start: Math.max(0, options.startSec),
      end: Math.max(0, options.startSec) + durationSec,
    },
  };
};
