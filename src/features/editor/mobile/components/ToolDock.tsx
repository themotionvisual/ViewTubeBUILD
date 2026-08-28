/**
 * ToolDock — the primary tool bar. In landscape it hugs the left edge, in
 * portrait it becomes a horizontal action row above the timeline. Every
 * button is a 44x44 hit target and opens the corresponding PanelSheet tab.
 */
import React from 'react';
import { MousePointer2, Scissors, Type, Music2, Shuffle, Sparkles, Upload, Split } from 'lucide-react';
import { EditorStore, Tool } from '../state/editorState';

interface ToolDockProps {
  store: EditorStore;
  orientation: 'row' | 'column';
  tools?: Tool[];
}

const TOOL_ICONS: Record<Tool, React.ComponentType<{ size?: number }>> = {
  select: MousePointer2,
  trim: Scissors,
  split: Split,
  text: Type,
  audio: Music2,
  transitions: Shuffle,
  effects: Sparkles,
  export: Upload,
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
  const btnSize = isRow ? 54 : 56;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        gap: 4,
        padding: 4,
        background: '#ffffff',
        borderRadius: 8,
        border: '2px solid #111',
        overflowX: isRow ? 'auto' : 'hidden',
        overflowY: isRow ? 'hidden' : 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        height: isRow ? '100%' : 'auto',
        maxWidth: '100%',
        boxSizing: 'border-box',
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
              width: btnSize,
              height: btnSize,
              minWidth: btnSize,
              minHeight: btnSize,
              borderRadius: 6,
              border: '2px solid #111',
              background: active ? '#40c6e9' : '#ffffff',
              color: '#111',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation',
              flex: '0 0 auto',
              padding: 0,
            }}
          >
            {React.createElement(TOOL_ICONS[t], { size: 20 })}
            <span style={{ fontSize: 9, fontWeight: 800, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {TOOL_LABELS[t]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
