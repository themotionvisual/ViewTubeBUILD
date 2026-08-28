/**
 * PanelSheet — bottom sheet that hosts tool panels.
 *
 * Behavior:
 *   - Peek (collapsed) shows the panel tabs + a handle.
 *   - Drag the handle vertically to expand / collapse.
 *   - Swipe horizontally inside the sheet to switch tabs.
 *   - Tap-outside dismiss to peek.
 *   - Content area receives the current tool's props panel via `render`.
 */
import React, { useMemo, useRef } from 'react';
import { EditorStore, Tool } from '../state/editorState';
import { useSwipe } from '../hooks/gestures';

export interface PanelSheetProps {
  store: EditorStore;
  /** Renders the actual panel body for a given tool. */
  render: (tool: Tool, store: EditorStore) => React.ReactNode;
  /** Ordered list of tools to show as tabs in the header. */
  tabs?: Tool[];
  /** Container height in px — the sheet expands within it. */
  containerHeight: number;
}

const defaultTabs: Tool[] = ['select', 'trim', 'text', 'audio', 'effects', 'transitions', 'export'];

export const PanelSheet: React.FC<PanelSheetProps> = ({
  store, render, tabs = defaultTabs, containerHeight,
}) => {
  const { state, dispatch } = store;
  const activeIdx = Math.max(0, tabs.indexOf(state.panel.id));
  const peekPx = 62;   // handle + tabs when collapsed
  const minPx = peekPx;
  const maxPx = Math.max(peekPx, containerHeight - 40);
  const heightPx = state.panel.open ? Math.round(minPx + (maxPx - minPx) * state.panel.height) : peekPx;
  const dragStart = useRef<{ y: number; startHeight: number } | null>(null);

  /* The vertical drag is handled below via a purpose-built handler; the
     horizontal useDragScrub hook wouldn't fit and useSwipe fires only on
     release, so we roll a tiny pointer-y tracker just for the sheet handle. */
  const verticalDrag = useMemo(
    () => makeVerticalDragHandlers({
      onStart: () => {
        dragStart.current = { y: 0, startHeight: heightPx };
        if (!state.panel.open) dispatch({ type: 'openPanel', id: state.panel.id });
      },
      onMove: (dy) => {
        if (!dragStart.current) return;
        const nextPx = Math.max(minPx, Math.min(maxPx, dragStart.current.startHeight - dy));
        const nextH = (nextPx - minPx) / Math.max(1, maxPx - minPx);
        dispatch({ type: 'setPanelHeight', height: nextH });
      },
      onEnd: () => {
        // Snap points: 0 (peek), 0.5, 1
        const target = state.panel.height < 0.25 ? 0 : state.panel.height > 0.75 ? 1 : 0.5;
        dispatch({ type: 'setPanelHeight', height: target });
        if (target === 0 && state.panel.height < 0.05) dispatch({ type: 'closePanel' });
        dragStart.current = null;
      },
    }),
    [dispatch, heightPx, maxPx, minPx, state.panel.height, state.panel.open, state.panel.id],
  );

  /* Swipe horizontally in the header to change tabs. */
  const swipe = useSwipe({
    onSwipeLeft: () => {
      const next = tabs[Math.min(tabs.length - 1, activeIdx + 1)];
      dispatch({ type: 'setPanelId', id: next });
    },
    onSwipeRight: () => {
      const next = tabs[Math.max(0, activeIdx - 1)];
      dispatch({ type: 'setPanelId', id: next });
    },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: heightPx,
        background: '#ffffff',
        borderTop: '2px solid #111',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        transition: dragStart.current ? 'none' : 'height 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
        boxShadow: '0 -4px 0 rgba(17,17,17,0.16)',
      }}
    >
      {/* Drag handle */}
      <div
        {...verticalDrag}
        style={{
          height: 22,
          display: 'grid',
          placeItems: 'center',
          cursor: 'row-resize',
          touchAction: 'none',
        }}
      >
        <div style={{ width: 44, height: 4, borderRadius: 2, background: '#111' }} />
      </div>

      {/* Tabs */}
      <div
        {...swipe}
        onPointerDown={swipe.onPointerDown as unknown as React.PointerEventHandler}
        onPointerUp={swipe.onPointerUp as unknown as React.PointerEventHandler}
        onPointerCancel={swipe.onPointerCancel as unknown as React.PointerEventHandler}
        style={{
          display: 'flex',
          gap: 6,
          padding: '0 12px 10px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              if (!state.panel.open) dispatch({ type: 'openPanel', id: t, height: 0.55 });
              else dispatch({ type: 'setPanelId', id: t });
            }}
            style={{
              flex: '0 0 auto',
              padding: '6px 12px',
              borderRadius: 6,
              border: '2px solid #111',
              background: state.panel.id === t ? '#40c6e9' : '#ffffff',
              color: '#111',
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      {state.panel.open && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 14,
            borderTop: '2px solid #111',
            color: '#111',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {render(state.panel.id, store)}
        </div>
      )}
    </div>
  );
};

/* Small helper — dedicated vertical drag using raw pointer events. */
function makeVerticalDragHandlers(cb: {
  onStart: () => void;
  onMove: (dy: number) => void;
  onEnd: () => void;
}) {
  let start: { y: number; id: number } | null = null;
  return {
    onPointerDown: (ev: React.PointerEvent) => {
      start = { y: ev.clientY, id: ev.pointerId };
      (ev.target as Element).setPointerCapture?.(ev.pointerId);
      cb.onStart();
    },
    onPointerMove: (ev: React.PointerEvent) => {
      if (!start || start.id !== ev.pointerId) return;
      cb.onMove(ev.clientY - start.y);
    },
    onPointerUp: (ev: React.PointerEvent) => {
      if (!start || start.id !== ev.pointerId) return;
      start = null;
      cb.onEnd();
    },
    onPointerCancel: () => { start = null; cb.onEnd(); },
  };
}
