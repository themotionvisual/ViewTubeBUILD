/**
 * Category 1 — Core Composition & Temporal Model
 *
 * Deterministic frame clock, parameterised compositions, schema validation,
 * environment detection, folder trees, root entry-point and layout primitives.
 *
 * Features covered: 1–10.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface VideoConfig {
  /** Playback frames-per-second. */
  fps: number;
  /** Canvas width in pixels. */
  width: number;
  /** Canvas height in pixels. */
  height: number;
  /** Total length of the composition, in whole frames. */
  durationInFrames: number;
  /** Convenience: `durationInFrames / fps`. */
  durationInSeconds: number;
  /** Composition id, unique within the root. */
  id: string;
}

export type Environment = 'preview' | 'rendering' | 'still' | 'player';

export interface CompositionMetadataResolver<Props = Record<string, unknown>> {
  (input: { props: Props; defaultProps: Props; abortSignal?: AbortSignal }):
    | Partial<Omit<VideoConfig, 'id' | 'durationInSeconds'>>
    | Promise<Partial<Omit<VideoConfig, 'id' | 'durationInSeconds'>>>;
}

export interface CompositionSpec<Props = Record<string, unknown>> {
  /** Kebab or camel-case id, stable across renders. */
  id: string;
  /** React component that draws one frame. */
  component: React.ComponentType<Props>;
  /** Total number of frames the composition can render. */
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  /** Values injected when nothing overrides them from CLI, Player or Studio. */
  defaultProps: Props;
  /** Schema (see `schema.ts`) validating props before render. */
  schema?: {
    parse: (v: unknown) => Props;
  };
  /** Optional async metadata resolver — lets duration/fps depend on data. */
  calculateMetadata?: CompositionMetadataResolver<Props>;
  /** Folder path (see `Folder`); slash-separated. */
  folder?: string;
  /** Marks this composition as a Still (single-frame). Feature #5. */
  isStill?: boolean;
}

/* ------------------------------------------------------------------ */
/* Contexts                                                           */
/* ------------------------------------------------------------------ */

const FrameContext = createContext<number>(0);
const ConfigContext = createContext<VideoConfig | null>(null);
const EnvContext = createContext<Environment>('preview');
const FolderContext = createContext<string>('');

/* ------------------------------------------------------------------ */
/* Feature #1 — Deterministic Frame Clock                             */
/* ------------------------------------------------------------------ */

/**
 * `useCurrentFrame()` — integer frame counter for the current composition.
 * Always deterministic: two renders of the same frame produce identical output.
 */
export function useCurrentFrame(): number {
  return useContext(FrameContext);
}

/* ------------------------------------------------------------------ */
/* Feature #3 — Video Config Hook                                     */
/* ------------------------------------------------------------------ */

/**
 * `useVideoConfig()` — access composition-level metadata from any descendant.
 * Throws when called outside a composition so bugs surface early.
 */
export function useVideoConfig(): VideoConfig {
  const cfg = useContext(ConfigContext);
  if (!cfg) {
    throw new Error(
      'useVideoConfig() called outside of a <Composition> or Player.',
    );
  }
  return cfg;
}

/* ------------------------------------------------------------------ */
/* Feature #9 — Environment Detection                                 */
/* ------------------------------------------------------------------ */

export function getRemotionEnvironment(): Environment {
  // Uses the context if we're inside a tree; otherwise sniff `globalThis`.
  const g = globalThis as unknown as {
    __RE_ENV__?: Environment;
    process?: { env?: Record<string, string | undefined> };
  };
  if (g.__RE_ENV__) return g.__RE_ENV__;
  const proc = g.process?.env;
  if (proc?.REMOTION_RENDER) return 'rendering';
  if (proc?.REMOTION_STILL) return 'still';
  if (typeof window === 'undefined') return 'rendering';
  return 'preview';
}

export function useEnvironment(): Environment {
  return useContext(EnvContext);
}

/* ------------------------------------------------------------------ */
/* Feature #7 — Folder Hierarchy                                      */
/* ------------------------------------------------------------------ */

/** Nest `<Composition>` and `<Still>` targets under a folder path. */
export const Folder: React.FC<{ name: string; children: React.ReactNode }> = ({
  name,
  children,
}) => {
  const parent = useContext(FolderContext);
  const path = parent ? `${parent}/${name}` : name;
  return (
    <FolderContext.Provider value={path}>{children}</FolderContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Feature #10 — Schema Validation (adapter)                          */
/* ------------------------------------------------------------------ */

export interface PropSchema<T> {
  parse: (v: unknown) => T;
}

/** Wrap any Zod-shaped schema; kept minimal so we don't force a dependency. */
export function asSchema<T>(schema: PropSchema<T>): PropSchema<T> {
  return schema;
}

/* ------------------------------------------------------------------ */
/* Feature #4 & #5 — <Composition> / <Still>                          */
/* ------------------------------------------------------------------ */

/**
 * Global registry populated at import time by `<Composition>` / `<Still>` and
 * consumed by `registerRoot()` (feature #6).
 */
const registry: CompositionSpec[] = [];

export function getRegisteredCompositions(): readonly CompositionSpec[] {
  return registry.slice();
}

function registerSpec<Props>(spec: CompositionSpec<Props>) {
  const dupe = registry.findIndex((c) => c.id === spec.id);
  if (dupe >= 0) registry[dupe] = spec as CompositionSpec;
  else registry.push(spec as CompositionSpec);
}

interface CompositionProps<Props>
  extends Omit<CompositionSpec<Props>, 'folder' | 'isStill' | 'defaultProps'> {
  defaultProps?: Props;
}

export function Composition<Props extends Record<string, unknown>>(
  props: CompositionProps<Props>,
): React.ReactElement | null {
  const folder = useContext(FolderContext);
  useEffect(() => {
    registerSpec<Props>({
      ...props,
      defaultProps: (props.defaultProps ?? ({} as Props)),
      folder,
      isStill: false,
    });
  }, [folder, props]);
  return null;
}

export function Still<Props extends Record<string, unknown>>(
  props: Omit<CompositionProps<Props>, 'durationInFrames' | 'fps'>,
): React.ReactElement | null {
  const folder = useContext(FolderContext);
  useEffect(() => {
    registerSpec<Props>({
      ...props,
      durationInFrames: 1,
      fps: 1,
      defaultProps: (props.defaultProps ?? ({} as Props)),
      folder,
      isStill: true,
    });
  }, [folder, props]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Feature #6 — Root Entry Point                                      */
/* ------------------------------------------------------------------ */

let ROOT_MOUNTED: React.ComponentType | null = null;

/**
 * Register the root component. Called once from `src/index.ts`; the Studio,
 * CLI renderer and Player all pick the same root up via `getRegisteredRoot`.
 */
export function registerRoot(component: React.ComponentType): void {
  ROOT_MOUNTED = component;
}

export function getRegisteredRoot(): React.ComponentType | null {
  return ROOT_MOUNTED;
}

/* ------------------------------------------------------------------ */
/* Feature #8 — <AbsoluteFill>                                        */
/* ------------------------------------------------------------------ */

/**
 * Layer stack that always fills the composition dimensions.
 * Uses `inset:0` and absolute positioning so multiple `<AbsoluteFill>`s
 * naturally overlap without margin collapse.
 */
export const AbsoluteFill = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AbsoluteFill({ style, children, ...rest }, ref) {
  const merged: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...style,
  };
  return (
    <div ref={ref} style={merged} {...rest}>
      {children}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Frame + config providers (used by Player / renderer)               */
/* ------------------------------------------------------------------ */

export const FrameProvider: React.FC<{
  frame: number;
  config: VideoConfig;
  env?: Environment;
  children: React.ReactNode;
}> = ({ frame, config, env = 'preview', children }) => {
  return (
    <EnvContext.Provider value={env}>
      <ConfigContext.Provider value={config}>
        <FrameContext.Provider value={frame}>{children}</FrameContext.Provider>
      </ConfigContext.Provider>
    </EnvContext.Provider>
  );
};

/**
 * Small hook used by the Studio preview to drive `FrameProvider` from
 * `requestAnimationFrame`. Not used during headless render — the render loop
 * calls `FrameProvider` with the frame number directly.
 */
export function useRafClock(
  running: boolean,
  fps: number,
  totalFrames: number,
  speed = 1,
): [number, (f: number) => void] {
  const [frame, setFrame] = useState(0);
  const startRef = useRef<{ t: number; f: number } | null>(null);
  const seek = useCallback((f: number) => {
    setFrame(Math.max(0, Math.min(totalFrames - 1, Math.round(f))));
    startRef.current = null;
  }, [totalFrames]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const step = (t: number) => {
      if (!startRef.current) startRef.current = { t, f: frame };
      const dt = (t - startRef.current.t) / 1000;
      const next = Math.floor(startRef.current.f + dt * fps * speed);
      if (next >= totalFrames) {
        setFrame(0);
        startRef.current = { t, f: 0 };
      } else if (next !== frame) {
        setFrame(next);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, fps, totalFrames, speed]);

  return [frame, seek];
}

/* Convenience — build a full VideoConfig from a spec + resolved overrides. */
export function resolveConfig<P>(
  spec: CompositionSpec<P>,
  overrides: Partial<VideoConfig> = {},
): VideoConfig {
  const fps = Math.max(1, overrides.fps ?? spec.fps);
  const durationInFrames = Math.max(
    1,
    overrides.durationInFrames ?? spec.durationInFrames,
  );
  return {
    id: spec.id,
    fps,
    width: Math.max(1, overrides.width ?? spec.width),
    height: Math.max(1, overrides.height ?? spec.height),
    durationInFrames,
    durationInSeconds: durationInFrames / fps,
  };
}
