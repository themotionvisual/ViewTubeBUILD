/**
 * Category 7 (part 1) — Async pipeline & error handling.
 *
 * delayRender / continueRender / cancelRender give any component a way to hold
 * the frame capture open while async work (fonts, textures, remote data) is
 * still resolving. Timeouts protect headless renderers from hanging forever.
 *
 * Features covered: 65–68 (async lifecycle) and #69 (onError fallback).
 * The rest of category 7 (getInputProps, 3D / Skia / Lottie / Tailwind) lives
 * in `bridges.tsx` so this file stays framework-independent.
 */

interface Handle {
  id: number;
  label: string;
  createdAt: number;
  timeoutMs: number;
  timer: ReturnType<typeof setTimeout>;
  error?: Error;
}

const handles = new Map<number, Handle>();
let nextId = 1;

let listeners: Array<(state: { pending: number; errors: Error[] }) => void> = [];

function emit() {
  const errors: Error[] = [];
  for (const h of handles.values()) if (h.error) errors.push(h.error);
  const snapshot = { pending: handles.size, errors };
  for (const l of listeners) l(snapshot);
}

/** Subscribe from the renderer / player to know when the frame is ready. */
export function subscribeRenderState(fn: (s: { pending: number; errors: Error[] }) => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}

/**
 * Feature #65 — pause the headless capture until `continueRender(handle)` is
 * called. In preview it's a no-op UX-wise but still tracked so the studio can
 * light up a "waiting for X" indicator.
 */
export function delayRender(label = 'delayRender()', opts?: { delayRenderTimeoutInMilliseconds?: number }): number {
  const id = nextId++;
  const timeoutMs = opts?.delayRenderTimeoutInMilliseconds ?? 28_000;
  const timer = setTimeout(() => {
    const h = handles.get(id);
    if (!h) return;
    h.error = new Error(`delayRender() timeout after ${timeoutMs}ms: ${label}`);
    emit();
  }, timeoutMs);
  handles.set(id, { id, label, createdAt: Date.now(), timeoutMs, timer });
  emit();
  return id;
}

/** Feature #66. */
export function continueRender(id: number): void {
  const h = handles.get(id);
  if (!h) return;
  clearTimeout(h.timer);
  handles.delete(id);
  emit();
}

/** Feature #67. */
export function cancelRender(idOrError: number | Error, err?: Error): void {
  if (typeof idOrError === 'number') {
    const h = handles.get(idOrError);
    if (h) {
      clearTimeout(h.timer);
      h.error = err ?? new Error(`cancelRender(${h.label})`);
    }
  } else {
    // Global cancel with reason.
    for (const h of handles.values()) {
      clearTimeout(h.timer);
      h.error = idOrError;
    }
  }
  emit();
}

/* ------------------------------------------------------------------ */
/* Feature #69 — onError fallback rules                                */
/* ------------------------------------------------------------------ */

export type ErrorFallbackRule =
  | { on: 'asset-load'; action: 'fail' | 'skip-frame' | 'use-placeholder' }
  | { on: 'delay-render-timeout'; action: 'fail' | 'continue' };

const rules: ErrorFallbackRule[] = [];

export function onError(rule: ErrorFallbackRule): void {
  rules.push(rule);
}

export function getErrorRules(): readonly ErrorFallbackRule[] {
  return rules.slice();
}
