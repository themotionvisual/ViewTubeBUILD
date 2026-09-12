/** Long-press context menu. */
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

const CYAN = '#36E0F6';
const INK = '#248b99';

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
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onDismiss(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown, { capture: true } as EventListenerOptions);
    };
  }, [onDismiss]);

  return (
    <div ref={ref} role="menu" style={{ position: 'fixed', top: pos.y, left: pos.x, minWidth: 200, background: '#fff', border: `3px solid ${INK}`, borderRadius: 7, boxShadow: '4px 4px 0 rgba(54,224,246,.4)', padding: 5, zIndex: 200, color: '#000' }}>
      {title && <div style={{ padding: '6px 8px', fontSize: 9, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: `2px solid ${INK}`, marginBottom: 4, background: CYAN }}>{title}</div>}
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          disabled={item.disabled}
          onClick={() => { item.onSelect(); onDismiss(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 9px', borderRadius: 4, border: `1.5px solid ${INK}`, marginTop: i ? 3 : 0, background: '#fff', color: item.destructive ? '#b91c1c' : '#000', fontSize: 11, fontWeight: 900, textAlign: 'left', cursor: item.disabled ? 'not-allowed' : 'pointer', opacity: item.disabled ? 0.4 : 1, touchAction: 'manipulation' }}
          onPointerEnter={(e) => { if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.background = CYAN; }}
          onPointerLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
        >
          <span style={{ width: 20, textAlign: 'center' }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
