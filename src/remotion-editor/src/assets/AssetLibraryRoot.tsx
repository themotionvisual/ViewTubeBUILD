import React from 'react';
import { Composition, Folder, Still } from 'remotion';
import { AssetContactSheet, ASSET_SHEET_COUNT } from './AssetContactSheet';
import { AssetRenderer } from './AssetRenderer';
import { AssetGallery } from './AssetGallery';
import { motionAssets, staticAssets } from './catalog';

export const AssetLibraryRoot: React.FC = () => (
  <>
    <Folder name="Asset-Library-Static">
      {staticAssets.map((asset) => (
        <Still
          key={asset.id}
          id={asset.id}
          component={AssetRenderer}
          width={1920}
          height={1080}
          defaultProps={{ assetId: asset.id }}
        />
      ))}
    </Folder>

    <Folder name="Asset-Library-Motion">
      {motionAssets.map((asset) => (
        <Composition
          key={asset.id}
          id={asset.id}
          component={AssetRenderer}
          durationInFrames={asset.durationInFrames}
          fps={asset.fps}
          width={1920}
          height={1080}
          defaultProps={{ assetId: asset.id }}
        />
      ))}
    </Folder>

    <Folder name="Asset-Library-Development">
      <Composition
        id="AssetGallery"
        component={AssetGallery}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>

    <Folder name="Asset-Library-Review">
      {Array.from({ length: ASSET_SHEET_COUNT }, (_, page) => (
        <Still
          key={page}
          id={`AssetSheet-${String(page + 1).padStart(2, '0')}`}
          component={AssetContactSheet}
          width={1920}
          height={1080}
          defaultProps={{ page }}
        />
      ))}
    </Folder>
  </>
);
