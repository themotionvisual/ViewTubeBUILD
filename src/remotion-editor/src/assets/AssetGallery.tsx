import React, { useMemo, useState } from 'react';
import { useCurrentFrame } from 'remotion';
import { AssetRenderer, AssetThumbnail } from './AssetRenderer';
import { assetRegistry } from './catalog';
import type { AspectRatioKey, AssetDefinition, AssetVisualProps } from './types';

const PAGE_SIZE = 12;

const ratioDimensions: Record<AspectRatioKey, { width: number; height: number }> = {
  '16:9': { width: 1600, height: 900 },
  '9:16': { width: 900, height: 1600 },
  '1:1': { width: 1000, height: 1000 },
  '4:5': { width: 800, height: 1000 },
};

const panel: React.CSSProperties = {
  backgroundColor: '#171D29',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  minWidth: 0,
  color: '#D5DBE8',
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  minHeight: 38,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.16)',
  backgroundColor: '#0F141E',
  color: '#F5F7FB',
  padding: '0 10px',
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  minHeight: 38,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.16)',
  backgroundColor: '#232B3B',
  color: '#F5F7FB',
  padding: '0 12px',
  fontWeight: 800,
  cursor: 'pointer',
};

export const AssetGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'static' | 'motion'>('all');
  const [category, setCategory] = useState('all');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [ratio, setRatio] = useState<AspectRatioKey>('16:9');
  const [selectedId, setSelectedId] = useState<AssetDefinition['id']>('motion-001');
  const [page, setPage] = useState(0);
  const [overrides, setOverrides] = useState<Partial<AssetVisualProps>>({});

  const categories = useMemo(
    () => Array.from(new Set(assetRegistry.map((asset) => asset.category))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assetRegistry.filter((asset) => {
      if (type !== 'all' && asset.type !== type) return false;
      if (category !== 'all' && asset.category !== category) return false;
      if (intensityFilter !== 'all' && asset.motionIntensity !== intensityFilter) return false;
      if (!needle) return true;
      return [
        asset.id,
        asset.name,
        asset.category,
        asset.family,
        ...asset.tags,
        ...asset.recommendedUses,
      ].join(' ').toLowerCase().includes(needle);
    });
  }, [category, intensityFilter, query, type]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleAssets = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const selected = assetRegistry.find((asset) => asset.id === selectedId) ?? assetRegistry[0];
  const dimensions = ratioDimensions[ratio];
  const previewAspect = dimensions.width / dimensions.height;
  const previewWidth = previewAspect >= 1 ? 720 : 420;
  const previewHeight = previewWidth / previewAspect;

  const selectAsset = (asset: AssetDefinition) => {
    setSelectedId(asset.id);
    setOverrides({});
  };

  const updateNumber = (key: keyof AssetVisualProps, value: number) =>
    setOverrides((current) => ({ ...current, [key]: value }));

  const updateString = (key: keyof AssetVisualProps, value: string) =>
    setOverrides((current) => ({ ...current, [key]: value }));

  const onQuery = (value: string) => {
    setQuery(value);
    setPage(0);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(430px, 0.85fr)',
        gap: 18,
        padding: 22,
        backgroundColor: '#0D1119',
        color: '#F5F7FB',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <section style={{ ...panel, padding: 16, minWidth: 0, display: 'grid', gridTemplateRows: 'auto auto 1fr auto', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>100 Remotion Assets</div>
            <div style={{ color: '#9FA9BC', fontSize: 13, marginTop: 4 }}>
              Native Studio gallery · frame {frame} · Studio transport owns play, pause and scrubbing
            </div>
          </div>
          <div style={{ color: '#C4CCDA', fontSize: 13, fontWeight: 800 }}>
            {filtered.length} shown
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.6fr) repeat(3, minmax(120px, 0.7fr))', gap: 9 }}>
          <label style={labelStyle}>
            Search
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="grid, title, ambient…"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Type
            <select value={type} onChange={(event) => { setType(event.target.value as typeof type); setPage(0); }} style={inputStyle}>
              <option value="all">All</option>
              <option value="static">Static</option>
              <option value="motion">Motion</option>
            </select>
          </label>
          <label style={labelStyle}>
            Category
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }} style={inputStyle}>
              <option value="all">All</option>
              {categories.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            Intensity
            <select value={intensityFilter} onChange={(event) => { setIntensityFilter(event.target.value); setPage(0); }} style={inputStyle}>
              <option value="all">All</option>
              <option value="SUBTLE">Subtle</option>
              <option value="AMBIENT">Ambient</option>
              <option value="MODERATE">Moderate</option>
              <option value="ENERGETIC">Energetic</option>
            </select>
          </label>
        </div>

        <div style={{ minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoRows: '1fr', gap: 10 }}>
          {visibleAssets.map((asset) => (
            <button
              type="button"
              key={asset.id}
              onClick={() => selectAsset(asset)}
              style={{
                position: 'relative',
                minWidth: 0,
                minHeight: 0,
                padding: 0,
                overflow: 'hidden',
                borderRadius: 10,
                border: asset.id === selected.id ? '2px solid #DDE3EF' : '1px solid rgba(255,255,255,0.12)',
                backgroundColor: '#101621',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ position: 'absolute', inset: '0 0 36px 0', overflow: 'hidden' }}>
                <AssetThumbnail
                  assetId={asset.id}
                  layoutWidth={1600}
                  layoutHeight={900}
                />
              </div>
              <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: 36, padding: '5px 8px', boxSizing: 'border-box', backgroundColor: '#161D29' }}>
                <div style={{ color: '#F5F7FB', fontSize: 11, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</div>
                <div style={{ color: '#919CB1', fontSize: 9, marginTop: 2 }}>{asset.id} · {asset.family}</div>
              </div>
            </button>
          ))}
          {!visibleAssets.length && (
            <div style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', color: '#9FA9BC', fontWeight: 800 }}>
              No assets match these filters.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button type="button" disabled={safePage <= 0} onClick={() => setPage(Math.max(0, safePage - 1))} style={{ ...buttonStyle, opacity: safePage <= 0 ? 0.45 : 1 }}>Previous</button>
          <div style={{ fontSize: 12, color: '#AAB4C7', fontWeight: 800 }}>Page {safePage + 1} / {pageCount}</div>
          <button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))} style={{ ...buttonStyle, opacity: safePage >= pageCount - 1 ? 0.45 : 1 }}>Next</button>
        </div>
      </section>

      <section style={{ ...panel, padding: 16, minWidth: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{selected.name}</div>
            <div style={{ color: '#9FA9BC', fontSize: 12, marginTop: 5 }}>
              {selected.id} · {selected.category} · {selected.family} · {selected.type === 'motion' ? `${selected.loopDurationSeconds}s loop` : 'still'}
            </div>
          </div>
          <button type="button" onClick={() => setOverrides({})} style={buttonStyle}>Reset</button>
        </div>

        <div style={{ minHeight: 0, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 12, backgroundColor: '#080B11', border: '1px solid rgba(255,255,255,0.1)', padding: 14 }}>
          <div
            style={{
              position: 'relative',
              width: previewWidth,
              height: previewHeight,
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
              borderRadius: 8,
              backgroundColor: '#05070B',
            }}
          >
            <AssetRenderer
              assetId={selected.id}
              layoutWidth={dimensions.width}
              layoutHeight={dimensions.height}
              {...overrides}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 11 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 9 }}>
            <label style={labelStyle}>
              Ratio
              <select value={ratio} onChange={(event) => setRatio(event.target.value as AspectRatioKey)} style={inputStyle}>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:5">4:5</option>
              </select>
            </label>
            <label style={labelStyle}>
              Primary
              <input type="color" value={String(overrides.primaryColor ?? selected.defaults.primaryColor)} onChange={(event) => updateString('primaryColor', event.target.value)} style={{ ...inputStyle, padding: 4 }} />
            </label>
            <label style={labelStyle}>
              Secondary
              <input type="color" value={String(overrides.secondaryColor ?? selected.defaults.secondaryColor)} onChange={(event) => updateString('secondaryColor', event.target.value)} style={{ ...inputStyle, padding: 4 }} />
            </label>
            <label style={labelStyle}>
              Accent
              <input type="color" value={String(overrides.accentColor ?? selected.defaults.accentColor)} onChange={(event) => updateString('accentColor', event.target.value)} style={{ ...inputStyle, padding: 4 }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 9 }}>
            <label style={labelStyle}>
              Density {Number(overrides.density ?? selected.defaults.density).toFixed(2)}
              <input type="range" min="0.25" max="2" step="0.05" value={Number(overrides.density ?? selected.defaults.density)} onChange={(event) => updateNumber('density', Number(event.target.value))} />
            </label>
            <label style={labelStyle}>
              Speed {Number(overrides.speed ?? selected.defaults.speed).toFixed(2)}
              <input type="range" min="0.1" max="4" step="0.05" value={Number(overrides.speed ?? selected.defaults.speed)} onChange={(event) => updateNumber('speed', Number(event.target.value))} disabled={selected.type === 'static'} />
            </label>
            <label style={labelStyle}>
              Intensity {Number(overrides.intensity ?? selected.defaults.intensity).toFixed(2)}
              <input type="range" min="0" max="2.5" step="0.05" value={Number(overrides.intensity ?? selected.defaults.intensity)} onChange={(event) => updateNumber('intensity', Number(event.target.value))} />
            </label>
            <label style={labelStyle}>
              Seed {Math.round(Number(overrides.seed ?? selected.defaults.seed))}
              <input type="range" min="0" max="9999" step="1" value={Number(overrides.seed ?? selected.defaults.seed)} onChange={(event) => updateNumber('seed', Number(event.target.value))} />
            </label>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, color: '#AAB4C7', fontSize: 11, fontWeight: 800 }}>
            <span>{selected.motionIntensity}</span>
            <span>·</span>
            <span>{selected.loopBehavior}</span>
            <span>·</span>
            <span>{selected.supportedRatios.join(' / ')}</span>
            <span>·</span>
            <span>preview frame {selected.previewFrame}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
