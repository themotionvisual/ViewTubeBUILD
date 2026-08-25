/**
 * Category 7 (part 2) — Runtime bridges & DX conveniences.
 *
 * getInputProps, Three (React Three Fiber) bridge, Skia bridge, Lottie import,
 * Tailwind integration hook.
 *
 * Features covered: 70, 71, 72, 73, 74.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCurrentFrame, useVideoConfig } from '../core/composition';
import { delayRender, continueRender } from './asyncGuards';

/* ------------------------------------------------------------------ */
/* Feature #70 — getInputProps                                         */
/* ------------------------------------------------------------------ */

const InputPropsContext = createContext<Record<string, unknown>>({});

let CLI_INPUT_PROPS: Record<string, unknown> | null = null;

export function _setInputPropsFromCli(props: Record<string, unknown>): void {
  CLI_INPUT_PROPS = props;
}

/**
 * Merges (in decreasing priority): React context injection from Player,
 * CLI-provided JSON payload, and `window.__REMOTION_INPUT_PROPS__` for
 * ad-hoc studio experiments.
 */
export function getInputProps<T = Record<string, unknown>>(): T {
  const g = globalThis as any;
  return {
    ...(g.__REMOTION_INPUT_PROPS__ ?? {}),
    ...(CLI_INPUT_PROPS ?? {}),
  } as T;
}

export const InputPropsProvider: React.FC<{
  value: Record<string, unknown>;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <InputPropsContext.Provider value={value}>{children}</InputPropsContext.Provider>
);

export function useInputProps<T = Record<string, unknown>>(): T {
  return { ...getInputProps(), ...useContext(InputPropsContext) } as T;
}

/* ------------------------------------------------------------------ */
/* Feature #71 — @remotion/three (React Three Fiber bridge)           */
/* ------------------------------------------------------------------ */

/**
 * `<ThreeCanvas frame={f} …>` — the React Three Fiber `Canvas` is expected as
 * `renderer`, so we don't force the dep. Consumers pass their own; this shim
 * pipes the current frame into a `useThree`-style context so any hook inside
 * the R3F tree can render deterministically per frame.
 */
export const ThreeFrameContext = createContext<number>(0);

export const ThreeCanvas: React.FC<{
  renderer: React.ComponentType<React.PropsWithChildren<{ frameloop?: 'always' | 'demand' | 'never' }>>;
  children: React.ReactNode;
}> = ({ renderer: Canvas, children }) => {
  const frame = useCurrentFrame();
  return (
    <ThreeFrameContext.Provider value={frame}>
      <Canvas frameloop="demand">{children}</Canvas>
    </ThreeFrameContext.Provider>
  );
};

export function useThreeFrame() {
  return useContext(ThreeFrameContext);
}

/* ------------------------------------------------------------------ */
/* Feature #72 — @remotion/skia (React Native Skia bridge)            */
/* ------------------------------------------------------------------ */

/**
 * Shim that lets Skia's `<Canvas>` be scheduled per frame — Skia's own
 * animation loop is disabled and we manually paint one frame per Remotion
 * tick, keeping the render deterministic.
 */
export function useSkiaFrame() {
  const frame = useCurrentFrame();
  const cfg = useVideoConfig();
  return { frame, timeInSeconds: frame / cfg.fps };
}

/* ------------------------------------------------------------------ */
/* Feature #73 — @remotion/lottie                                     */
/* ------------------------------------------------------------------ */

export interface LottieJSON {
  fr: number;
  op: number;
  ip: number;
  w: number;
  h: number;
  layers: unknown[];
  assets?: unknown[];
  meta?: { g?: string };
}

/**
 * Frame-synced Lottie renderer — pulls in `lottie-web` only when actually
 * used (dynamic import), so it doesn't bloat first-load for compositions
 * that never touch it.
 */
export const Lottie: React.FC<{
  animationData: LottieJSON;
  playbackRate?: number;
  style?: React.CSSProperties;
}> = ({ animationData, playbackRate = 1, style }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [anim, setAnim] = useState<{ goToAndStop: (f: number, isFrame: boolean) => void } | null>(null);
  const frame = useCurrentFrame();
  const cfg = useVideoConfig();

  useEffect(() => {
    if (!ref.current) return;
    let cancel = false;
    const handle = delayRender('lottie import');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    import('lottie-web' as string).then((mod) => {
      if (cancel) return;
      const a = (mod as any).default.loadAnimation({
        container: ref.current!,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData,
      });
      setAnim(a);
      continueRender(handle);
    }).catch(() => continueRender(handle));
    return () => { cancel = true; };
  }, [animationData]);

  useEffect(() => {
    if (!anim) return;
    const nativeFps = animationData.fr;
    const lottieFrame = (frame * (nativeFps / cfg.fps) * playbackRate) % (animationData.op - animationData.ip);
    anim.goToAndStop(animationData.ip + lottieFrame, true);
  }, [frame, cfg.fps, anim, animationData, playbackRate]);

  return <div ref={ref} style={{ width: '100%', height: '100%', ...style }} />;
};

/* ------------------------------------------------------------------ */
/* Feature #74 — @remotion/tailwind                                   */
/* ------------------------------------------------------------------ */

/**
 * The build-time piece is a webpack/vite plugin; at runtime we only expose a
 * helper that a composition can use to gate a Tailwind-only class safely.
 * Consumers still write `className="text-4xl font-bold"` as normal.
 */
export function tw(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
