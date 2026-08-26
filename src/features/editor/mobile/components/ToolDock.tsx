/**
 * ToolDock — the primary tool bar. In landscape it hugs the left edge, in
 * portrait it becomes a horizontal action row above the timeline. Every
 * button is a 44x44 hit target and opens the corresponding PanelSheet tab.
 */
import React from 'react';
import { EditorStore, Tool } from '../state/editorState';

interface ToolDockProps {
  store: EditorStore;
  orientation: 'row' | 'column';
  tools?: Tool[];
}

const TOOL_ICONS: Record<Tool, string> = {
  select: '☰',
  trim: '✂',
  split: '⤴',
  text: 'T',
  audio: '♪',
  transitions: '↔',
  effects: '✧',
  export: '⇪',
};

const TOOL_LABELS: Record<Tool, string> = {
  select: 'Select',
  trim: 'Trim',
  split: 'Split',
  text: 'Text',
  audio: 'Audio',
  transitions: 'Fx-tx',
  effects: 'Effects',
  export: 'Export',
};

const defaultTools: Tool[] = ['select', 'text', 'audio', 'transitions', 'effects', 'export'];

export const ToolDock: React.FC<ToolDockProps> = ({ store, orientation, tools = defaultTools }) => {
  const { state, dispatch } = store;
  const isRow = orientation === 'row';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        gap: 6,
        padding: 6,
        background: '#0f172a',
        borderRadius: 14,
        border: '1px solid #1e293b',
        overflow: isRow ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {tools.map((t) => {
        const active = state.tool === t || state.panel.id === t;
        return (
          <button
            key={t}
            onClick={() => {
              dispatch({ type: 'setTool', tool: t });
              if (state.panel.open && state.panel.id === t) {
                dispatch({ type: 'closePanel' });
              } else {
                dispatch({ type: 'openPanel', id: t, height: state.panel.height });
              }
            }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              border: 'none',
              background: active ? '#22d3ee' : '#1e293b',
              color: active ? '#0f172a' : '#e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation',
              flex: '0 0 auto',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{TOOL_ICONS[t]}</span>
            <span style={{ fontSize: 8.5, fontWeight: 800, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {TOOL_LABELS[t]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
