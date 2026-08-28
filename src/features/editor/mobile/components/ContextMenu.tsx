/**
 * Long-press context menu.
 *
 * Positioned as a floating card near the touch point, but auto-flipped when
 * it would spill off-screen. Renders a flat list of actions with
 * icon + label + optional destructive style.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  at: { x: number; y: number };
  onDismiss: () => void;
  title?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, at, onDismiss, title }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(at);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = at.x - rect.width / 2;
    let y = at.y - rect.height - 12;
    if (y < pad) y = at.y + 12;
    if (x + rect.width + pad > vw) x = vw - rect.width - pad;
    if (x < pad) x = pad;
    if (y + rect.height + pad > vh) y = vh - rect.height - pad;
    setPos({ x, y });
  }, [at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    const onDown = (e: PointerEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onDismiss();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown, { capture: true } as EventListenerOptions);
    };
  }, [onDismiss]);

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: 'fixed',
        top: pos.y,
        left: pos.x,
        minWidth: 200,
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        boxShadow: '0 20px 40px rgba(0,0,0,0.55)',
        padding: 6,
        zIndex: 200,
      }}
    >
      {title && (
        <div style={{
          padding: '6px 10px 8px',
          fontSize: 10,
          fontWeight: 800,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          borderBottom: '1px solid #1e293b',
          marginBottom: 4,
        }}>
          {title}
        </div>
      )}
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          disabled={item.disabled}
          onClick={() => { item.onSelect(); onDismiss(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: item.destructive ? '#f87171' : '#e2e8f0',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'left',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            opacity: item.disabled ? 0.4 : 1,
            touchAction: 'manipulation',
          }}
          onPointerEnter={(e) => {
            if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
          }}
          onPointerLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <span style={{ width: 20, textAlign: 'center', opacity: 0.85 }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
