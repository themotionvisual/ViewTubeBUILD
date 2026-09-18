import type {VtE1Clip} from '../../shared/vtE1TimelineContract';
import {
  assetRegistry,
  getAssetDefinition,
} from '../../remotion-editor/src/assets/catalog';
import type {
  AssetDefinition,
  AssetVisualProps,
} from '../../remotion-editor/src/assets/types';

export const remotionAssetCatalog = assetRegistry;

export interface RemotionAssetClipOptions {
  startSec: number;
  durationSec?: number;
  trackId?: string;
  clipId?: string;
  props?: Partial<AssetVisualProps>;
}

const defaultClipId = (assetId: string) =>
  `remotion_asset_${assetId}_${Date.now().toString(36)}`;

export function remotionAssetToTimelineClip(
  assetId: AssetDefinition['id'],
  options: RemotionAssetClipOptions,
): VtE1Clip {
  const asset = getAssetDefinition(assetId);
  const start = Math.max(0, Number(options.startSec || 0));
  const duration = Math.max(
    0.05,
    Number(
      options.durationSec
      ?? (asset.type === 'motion' ? asset.recommendedDurationSeconds : 5),
    ),
  );
  const clipId = options.clipId || defaultClipId(asset.id);

  return {
    id: clipId,
    layerId: `remotion-asset-layer-${clipId}`,
    trackId: options.trackId || 't_overlay',
    start,
    end: start + duration,
    clipType: 'remotion-asset',
    remotionAssetId: asset.id,
    remotionAssetName: asset.name,
    remotionAssetCategory: asset.category,
    remotionAssetFamily: asset.family,
    remotionAssetProps: asset.schema.parse({
      ...asset.defaults,
      ...(options.props || {}),
    }),
    remotionAssetMeta: {
      type: asset.type,
      loopDurationSeconds: asset.loopDurationSeconds,
      recommendedDurationSeconds: asset.recommendedDurationSeconds,
      previewFrame: asset.previewFrame,
      loopBehavior: asset.loopBehavior,
      cycleMode: asset.cycleMode,
      motionIntensity: asset.motionIntensity,
      supportedRatios: asset.supportedRatios,
    },
  };
}

export function isRemotionAssetClip(
  clip: VtE1Clip | null | undefined,
): clip is VtE1Clip & {
  clipType: 'remotion-asset';
  remotionAssetId: AssetDefinition['id'];
} {
  return Boolean(
    clip
    && clip.clipType === 'remotion-asset'
    && typeof clip.remotionAssetId === 'string',
  );
}

export function resolveRemotionAssetClip(clip: VtE1Clip) {
  if (!isRemotionAssetClip(clip)) return undefined;
  return getAssetDefinition(clip.remotionAssetId);
}
