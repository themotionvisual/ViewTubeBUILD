import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AssetThumbnail } from './AssetRenderer';
import { assetRegistry } from './catalog';

export const ASSETS_PER_SHEET = 20;
export const ASSET_SHEET_COUNT = Math.ceil(assetRegistry.length / ASSETS_PER_SHEET);

export const AssetContactSheet: React.FC<{ page: number }> = ({ page }) => {
  const start = Math.max(0, Math.floor(page)) * ASSETS_PER_SHEET;
  const assets = assetRegistry.slice(start, start + ASSETS_PER_SHEET);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0E1118',
        padding: 30,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 18,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {assets.map((asset) => (
        <div
          key={asset.id}
          style={{
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 14,
            backgroundColor: '#171D29',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ position: 'absolute', inset: '0 0 42px 0', overflow: 'hidden' }}>
            <AssetThumbnail assetId={asset.id} />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 'auto 0 0 0',
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '0 12px',
              color: '#F6F7FB',
              backgroundColor: '#171D29',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</span>
            <span style={{ color: '#AAB3C5', fontSize: 11 }}>{asset.id}</span>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
