/**
 * Gesture hooks for the mobile editor.
 *
 * Each hook returns a small set of ref-based handlers that attach to a
 * target element. They coexist — a single element can carry a pinch AND a
 * drag AND a long-press without stepping on each other, because they each
 * only claim gestures they can recognise. All hooks use PointerEvents so
 * mouse, touch, and pen all work.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ================================================================== */
/* usePinchZoom                                                        */
/* ================================================================== */

export interface PinchState {
  scale: number;             // current live scale during the gesture, 1 when idle
  midpoint: { x: number; y: number };
  active: boolean;
}

export interface PinchHandlers {
  onPointerDown: React.PointerEventHandler;
  onPointerMove: React.PointerEventHandler;
  onPointerUp: React.PointerEventHandler;
  onPointerCancel: React.PointerEventHandler;
}

interface PinchOptions {
  /** Called whenever the pinch scale changes. Delta is `scale / prevScale`. */
  onPinch?: (info: { scale: number; delta: number; midpoint: { x: number; y: number } }) => void;
  onPinchEnd?: () => void;
}

export function usePinchZoom(opts: PinchOptions = {}): { pinch: PinchState; handlers: PinchHandlers } {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const startDistance = useRef<number | null>(null);
  const lastScale = useRef(1);
  const [pinch, setPinch] = useState<PinchState>({ scale: 1, midpoint: { x: 0, y: 0 }, active: false });

  const distance = () => {
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return 0;
    const [a, b] = pts;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const midpoint = () => {
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return { x: 0, y: 0 };
    const [a, b] = pts;
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  const onPointerDown = useCallback((ev: React.PointerEvent) => {
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pointers.current.size === 2) {
      startDistance.current = distance();
      lastScale.current = 1;
      setPinch({ scale: 1, midpoint: midpoint(), active: true });
    }
  }, []);

  const onPointerMove = useCallback((ev: React.PointerEvent) => {
    if (!pointers.current.has(ev.pointerId)) return;
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pointers.current.size === 2 && startDistance.current) {
      const d = distance();
      const scale = d / startDistance.current;
      const delta = scale / (lastScale.current || 1);
      lastScale.current = scale;
      const mid = midpoint();
      setPinch({ scale, midpoint: mid, active: true });
      opts.onPinch?.({ scale, delta, midpoint: mid });
    }
  }, [opts]);

  const end = useCallback((ev: React.PointerEvent) => {
    pointers.current.delete(ev.pointerId);
    if (pointers.current.size < 2) {
      startDistance.current = null;
      if (pinch.active) {
        opts.onPinchEnd?.();
        setPinch({ scale: 1, midpoint: { x: 0, y: 0 }, active: false });
      }
    }
  }, [pinch.active, opts]);

  return { pinch, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end } };
}

/* ================================================================== */
/* useDragScrub — horizontal drag → scalar delta                       */
/* ================================================================== */

export interface DragScrubHandlers {
  onPointerDown: React.PointerEventHandler;
  onPointerMove: React.PointerEventHandler;
  onPointerUp: React.PointerEventHandler;
  onPointerCancel: React.PointerEventHandler;
}

interface DragScrubOptions {
  /** Pixels per unit — how many CSS pixels of horizontal drag = 1 unit. */
  pixelsPerUnit?: number;
  /** Called with the accumulated delta (in "units") since drag started. */
  onScrub: (delta: number, info: { startX: number; currentX: number; velocity: number }) => void;
  onScrubStart?: () => void;
  onScrubEnd?: (velocityUnitsPerSec: number) => void;
  /** Cancel the drag when the pointer moves this many px vertically first. */
  cancelIfVertical?: number;
  /** Prevent scrub from starting while another gesture (e.g. pinch) is active. */
  guard?: () => boolean;
}

export function useDragScrub(opts: DragScrubOptions): DragScrubHandlers {
  const ppu = opts.pixelsPerUnit ?? 1;
  const active = useRef(false);
  const start = useRef({ x: 0, y: 0, t: 0 });
  const last = useRef({ x: 0, t: 0 });
  const captured = useRef<number | null>(null);
  const cancelled = useRef(false);

  const onPointerDown = useCallback((ev: React.PointerEvent) => {
    if (opts.guard?.()) return;
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    active.current = true;
    cancelled.current = false;
    captured.current = ev.pointerId;
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    start.current = { x: ev.clientX, y: ev.clientY, t: ev.timeStamp };
    last.current = { x: ev.clientX, t: ev.timeStamp };
    opts.onScrubStart?.();
  }, [opts]);

  const onPointerMove = useCallback((ev: React.PointerEvent) => {
    if (!active.current || captured.current !== ev.pointerId || cancelled.current) return;
    const dx = ev.clientX - start.current.x;
    const dy = ev.clientY - start.current.y;
    if (opts.cancelIfVertical !== undefined && Math.abs(dy) > opts.cancelIfVertical && Math.abs(dy) > Math.abs(dx)) {
      cancelled.current = true;
      active.current = false;
      return;
    }
    const delta = dx / ppu;
    const dt = Math.max(1, ev.timeStamp - last.current.t);
    const velocity = (ev.clientX - last.current.x) / ppu / (dt / 1000);
    last.current = { x: ev.clientX, t: ev.timeStamp };
    opts.onScrub(delta, { startX: start.current.x, currentX: ev.clientX, velocity });
  }, [opts, ppu]);

  const end = useCallback((ev: React.PointerEvent) => {
    if (captured.current !== ev.pointerId) return;
    const wasActive = active.current && !cancelled.current;
    active.current = false;
    captured.current = null;
    if (wasActive) {
      const dt = Math.max(1, ev.timeStamp - last.current.t + 16);
      const vel = (ev.clientX - last.current.x) / ppu / (dt / 1000);
      opts.onScrubEnd?.(vel);
    }
  }, [opts, ppu]);

  return { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end };
}

/* ================================================================== */
/* useLongPress                                                        */
/* ================================================================== */

interface LongPressOptions {
  ms?: number;
  /** Cancel if pointer moves this many pixels. */
  moveThresholdPx?: number;
  onLongPress: (info: { x: number; y: number; target: EventTarget | null }) => void;
  /** Fires when the finger goes down — usable for haptics. */
  onPressStart?: () => void;
  /** Fires when the press releases before the timer, or after cancel. */
  onPressCancel?: () => void;
}

export function useLongPress(opts: LongPressOptions) {
  const ms = opts.ms ?? 500;
  const move = opts.moveThresholdPx ?? 10;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  const cancel = useCallback((_ev?: React.PointerEvent) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!fired.current) opts.onPressCancel?.();
    start.current = null;
    fired.current = false;
  }, [opts]);

  return useMemo(
    () => ({
      onPointerDown: (ev: React.PointerEvent) => {
        start.current = { x: ev.clientX, y: ev.clientY };
        opts.onPressStart?.();
        fired.current = false;
        const targetX = ev.clientX;
        const targetY = ev.clientY;
        const targetEl = ev.target;
        timer.current = setTimeout(() => {
          fired.current = true;
          // Haptic hint if the browser supports it.
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            (navigator as Navigator & { vibrate: (p: number | number[]) => boolean }).vibrate(15);
          }
          opts.onLongPress({ x: targetX, y: targetY, target: targetEl });
        }, ms);
      },
      onPointerMove: (ev: React.PointerEvent) => {
        if (!start.current) return;
        if (Math.hypot(ev.clientX - start.current.x, ev.clientY - start.current.y) > move) cancel();
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onPointerLeave: cancel,
    }),
    [ms, move, opts, cancel],
  );
}

/* ================================================================== */
/* useSwipe — horizontal swipes between tabs                           */
/* ================================================================== */

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minDistance?: number;      // default 48px
  maxOffAxis?: number;       // default 40px
  maxDurationMs?: number;    // default 500ms
}

export function useSwipe(opts: SwipeOptions) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const min = opts.minDistance ?? 48;
  const off = opts.maxOffAxis ?? 40;
  const max = opts.maxDurationMs ?? 500;

  return {
    onPointerDown: (ev: React.PointerEvent) => {
      start.current = { x: ev.clientX, y: ev.clientY, t: ev.timeStamp };
    },
    onPointerUp: (ev: React.PointerEvent) => {
      if (!start.current) return;
      const dx = ev.clientX - start.current.x;
      const dy = ev.clientY - start.current.y;
      const dt = ev.timeStamp - start.current.t;
      start.current = null;
      if (dt > max) return;
      if (Math.abs(dx) >= min && Math.abs(dy) <= off) {
        if (dx > 0) opts.onSwipeRight?.();
        else opts.onSwipeLeft?.();
      } else if (Math.abs(dy) >= min && Math.abs(dx) <= off) {
        if (dy > 0) opts.onSwipeDown?.();
        else opts.onSwipeUp?.();
      }
    },
    onPointerCancel: () => { start.current = null; },
  };
}

/* ================================================================== */
/* useSuppressBrowserZoom — put on the editor root                     */
/* Prevents double-tap zoom / pinch-zooming the page instead of the     */
/* timeline. Meta viewport should also carry `user-scalable=no`.        */
/* ================================================================== */

export function useSuppressBrowserZoom(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stopGesture = (ev: Event) => ev.preventDefault();
    el.addEventListener('gesturestart', stopGesture as EventListener);
    el.addEventListener('gesturechange', stopGesture as EventListener);
    let lastTap = 0;
    const stopDoubleTap = (ev: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) ev.preventDefault();
      lastTap = now;
    };
    el.addEventListener('touchend', stopDoubleTap, { passive: false });
    return () => {
      el.removeEventListener('gesturestart', stopGesture as EventListener);
      el.removeEventListener('gesturechange', stopGesture as EventListener);
      el.removeEventListener('touchend', stopDoubleTap);
    };
  }, [ref]);
}
