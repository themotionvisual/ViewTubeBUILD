/**
 * ToolDock — primary editor tool bar in canonical ViewTube light styling.
 */
import React from 'react';
import { EditorStore, Tool } from '../state/editorState';

interface ToolDockProps {
  store: EditorStore;
  orientation: 'row' | 'column';
  tools?: Tool[];
}

const TOOL_ICONS: Record<Tool, string> = { select: '☰', trim: '✂', split: '⤴', text: 'T', audio: '♪', transitions: '↔', effects: '✧', export: '⇪' };
const TOOL_LABELS: Record<Tool, string> = { select: 'Select', trim: 'Trim', split: 'Split', text: 'Text', audio: 'Audio', transitions: 'Fx-tx', effects: 'Effects', export: 'Export' };
const defaultTools: Tool[] = ['select', 'text', 'audio', 'transitions', 'effects', 'export'];
const CYAN = '#36E0F6';
const INK = '#248b99';

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
        background: '#fff',
        borderRadius: 7,
        border: `3px solid ${INK}`,
        boxShadow: '3px 3px 0 rgba(54,224,246,.35)',
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
              if (state.panel.open && state.panel.id === t) dispatch({ type: 'closePanel' });
              else dispatch({ type: 'openPanel', id: t, height: state.panel.height });
            }}
            style={{
              width: btnSize,
              height: btnSize,
              minWidth: btnSize,
              minHeight: btnSize,
              borderRadius: 5,
              border: `2px solid ${INK}`,
              background: active ? CYAN : '#fff',
              color: '#000',
              boxShadow: active ? '2px 2px 0 rgba(54,224,246,.55)' : '2px 2px 0 rgba(54,224,246,.28)',
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
            <span style={{ fontSize: 20, lineHeight: 1 }}>{TOOL_ICONS[t]}</span>
            <span style={{ fontSize: 9, fontWeight: 900, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{TOOL_LABELS[t]}</span>
          </button>
        );
      })}
    </div>
  );
};
