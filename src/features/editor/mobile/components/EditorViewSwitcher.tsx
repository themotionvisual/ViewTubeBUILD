import React from 'react';
import type { CompositionAspect } from '../MobileEditor';

export type EditorFrontend = 'auto' | 'mobile' | 'desktop';
export type EditorLayoutChoice = 'auto' | 'portrait' | 'landscape';

interface EditorViewSwitcherProps {
  frontend?: EditorFrontend;
  onFrontendChange?: (value: EditorFrontend) => void;
  layout: EditorLayoutChoice;
  onLayoutChange: (value: EditorLayoutChoice) => void;
  aspect: CompositionAspect;
  onAspectChange: (value: CompositionAspect) => void;
  allowDesktop?: boolean;
  compact?: boolean;
}

const GROUP_STYLE: React.CSSProperties = {
  display: 'flex', gap: 2, padding: 2, background: '#fff', border: '2px solid #111', borderRadius: 5,
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 7, lineHeight: 1, fontWeight: 900, letterSpacing: '.35px', textTransform: 'uppercase', color: '#111',
};

const optionStyle = (active: boolean): React.CSSProperties => ({
  height: 24, minWidth: 34, padding: '0 6px', border: '1.5px solid #111', borderRadius: 3,
  background: active ? '#36E0F6' : '#fff', color: '#111', fontSize: 8, lineHeight: 1,
  fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap',
});

function Group<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      <span style={LABEL_STYLE}>{label}</span>
      <div style={GROUP_STYLE} role="group" aria-label={label}>
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={value === option.value}
            onClick={() => onChange(option.value)} style={optionStyle(value === option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const EditorViewSwitcher: React.FC<EditorViewSwitcherProps> = ({
  frontend = 'mobile', onFrontendChange, layout, onLayoutChange, aspect, onAspectChange,
  allowDesktop = false, compact = false,
}) => (
  <div
    data-editor-view-switcher
    style={{
      display: 'flex', alignItems: 'end', flexWrap: 'wrap', gap: compact ? 3 : 5,
      padding: compact ? 3 : 5, background: '#fff', border: '2px solid #111', borderRadius: 6,
      boxShadow: '2px 2px 0 rgba(0,0,0,.3)', maxWidth: 'calc(100vw - 12px)',
    }}
  >
    {allowDesktop && onFrontendChange && (
      <Group label="Interface" value={frontend} onChange={onFrontendChange} options={[
        { value: 'auto', label: 'Auto' }, { value: 'mobile', label: 'Mobile' }, { value: 'desktop', label: 'Desktop' },
      ]} />
    )}
    <Group label="Layout" value={layout} onChange={onLayoutChange} options={[
      { value: 'auto', label: 'Auto' }, { value: 'portrait', label: 'Upright' }, { value: 'landscape', label: 'Sideways' },
    ]} />
    <Group label="Video" value={aspect} onChange={onAspectChange} options={[
      { value: 'portrait', label: '9:16' }, { value: 'landscape', label: '16:9' },
    ]} />
  </div>
);
