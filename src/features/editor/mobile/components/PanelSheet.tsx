/**
 * PanelSheet — bottom sheet that hosts editor pages opened from navigation.
 */
import React, { useMemo, useRef } from 'react';
import { EditorStore, Tool } from '../state/editorState';
import { useSwipe } from '../hooks/gestures';

export interface PanelSheetProps {
  store: EditorStore;
  render: (tool: Tool, store: EditorStore) => React.ReactNode;
  tabs?: Tool[];
  containerHeight: number;
  /** Hide the old always-visible Select/Text/Audio/etc tab module. */
  navigationOnly?: boolean;
}

const defaultTabs: Tool[] = ['select', 'trim', 'text', 'audio', 'effects', 'transitions', 'export'];
const CYAN = '#36E0F6';
const INK = '#248b99';

export const PanelSheet: React.FC<PanelSheetProps> = ({ store, render, tabs = defaultTabs, containerHeight, navigationOnly = false }) => {
  const { state, dispatch } = store;
  const activeIdx = Math.max(0, tabs.indexOf(state.panel.id));
  const peekPx = navigationOnly ? 0 : 62;
  const minPx = navigationOnly ? 46 : peekPx;
  const maxPx = Math.max(minPx, containerHeight - 40);
  const heightPx = state.panel.open ? Math.round(minPx + (maxPx - minPx) * state.panel.height) : peekPx;
  const dragStart = useRef<{ y: number; startHeight: number } | null>(null);

  const verticalDrag = useMemo(() => makeVerticalDragHandlers({
    onStart: () => {
      dragStart.current = { y: 0, startHeight: heightPx };
      if (!state.panel.open) dispatch({ type: 'openPanel', id: state.panel.id });
    },
    onMove: (dy) => {
      if (!dragStart.current) return;
      const nextPx = Math.max(minPx, Math.min(maxPx, dragStart.current.startHeight - dy));
      dispatch({ type: 'setPanelHeight', height: (nextPx - minPx) / Math.max(1, maxPx - minPx) });
    },
    onEnd: () => {
      const target = state.panel.height < 0.25 ? 0 : state.panel.height > 0.75 ? 1 : 0.5;
      dispatch({ type: 'setPanelHeight', height: target });
      if (target === 0 && state.panel.height < 0.05) dispatch({ type: 'closePanel' });
      dragStart.current = null;
    },
  }), [dispatch, heightPx, maxPx, minPx, state.panel.height, state.panel.open, state.panel.id]);

  const swipe = useSwipe({
    onSwipeLeft: () => dispatch({ type: 'setPanelId', id: tabs[Math.min(tabs.length - 1, activeIdx + 1)] }),
    onSwipeRight: () => dispatch({ type: 'setPanelId', id: tabs[Math.max(0, activeIdx - 1)] }),
  });

  if (navigationOnly && !state.panel.open) return null;

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: heightPx, background: '#fff', border: `3px solid ${INK}`, borderBottom: 0, borderTopLeftRadius: 9, borderTopRightRadius: 9, transition: dragStart.current ? 'none' : 'height 220ms cubic-bezier(0.2, 0.8, 0.2, 1)', display: 'flex', flexDirection: 'column', zIndex: 30, boxShadow: '0 -4px 0 rgba(54,224,246,.24)' }}>
      <div {...verticalDrag} style={{ height: 22, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', cursor: 'row-resize', touchAction: 'none', background: CYAN, borderBottom: `2px solid ${INK}` }}>
        <span />
        <div style={{ width: 44, height: 4, borderRadius: 2, background: '#000' }} />
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => dispatch({ type: 'closePanel' })} aria-label="Close editor page" style={{ justifySelf: 'end', width: 24, height: 20, marginRight: 3, border: `1.5px solid ${INK}`, borderRadius: 3, background: '#fff', color: '#000', fontWeight: 900, lineHeight: 1 }}>×</button>
      </div>
      {!navigationOnly && <div {...swipe} onPointerDown={swipe.onPointerDown as unknown as React.PointerEventHandler} onPointerUp={swipe.onPointerUp as unknown as React.PointerEventHandler} onPointerCancel={swipe.onPointerCancel as unknown as React.PointerEventHandler} style={{ display: 'flex', gap: 4, padding: '5px 8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', background: '#fff' }}>
        {tabs.map((t) => <button key={t} onClick={() => { if (!state.panel.open) dispatch({ type: 'openPanel', id: t, height: 0.55 }); else dispatch({ type: 'setPanelId', id: t }); }} style={{ flex: '0 0 auto', padding: '5px 9px', borderRadius: 4, border: `2px solid ${INK}`, background: state.panel.id === t ? CYAN : '#fff', color: '#000', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.4, cursor: 'pointer', touchAction: 'manipulation', boxShadow: '2px 2px 0 rgba(54,224,246,.28)' }}>{t}</button>)}
      </div>}
      {state.panel.open && <div style={{ flex: 1, overflowY: 'auto', padding: 10, borderTop: navigationOnly ? 0 : `2px solid ${INK}`, color: '#000', background: '#fff', WebkitOverflowScrolling: 'touch' }}>{render(state.panel.id, store)}</div>}
    </div>
  );
};

function makeVerticalDragHandlers(cb: { onStart: () => void; onMove: (dy: number) => void; onEnd: () => void; }) {
  let start: { y: number; id: number } | null = null;
  return {
    onPointerDown: (ev: React.PointerEvent) => { start = { y: ev.clientY, id: ev.pointerId }; (ev.target as Element).setPointerCapture?.(ev.pointerId); cb.onStart(); },
    onPointerMove: (ev: React.PointerEvent) => { if (!start || start.id !== ev.pointerId) return; cb.onMove(ev.clientY - start.y); },
    onPointerUp: (ev: React.PointerEvent) => { if (!start || start.id !== ev.pointerId) return; start = null; cb.onEnd(); },
    onPointerCancel: () => { start = null; cb.onEnd(); },
  };
}
