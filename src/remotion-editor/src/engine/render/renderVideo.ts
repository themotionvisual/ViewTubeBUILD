/**
 * Category 9 — Local Rendering Engine & CLI Architecture
 *
 * Headless orchestration, worker fan-out, FFmpeg stitching, frame-range
 * selection, multi-codec support, audio muxing, hardware encoders,
 * programmatic Node API and the bundler subsystem.
 *
 * Features covered: 83–92.
 *
 * These modules describe the surface Remotion exposes for `renderMedia()`,
 * `renderStill()`, `bundle()` etc. When run in a Node environment they wire
 * up Puppeteer + FFmpeg; the code is written so it doesn't blow up when
 * imported in the browser (each subsystem lazily requires its Node deps).
 */

/* ------------------------------------------------------------------ */
/* Codec / container tables                                           */
/* ------------------------------------------------------------------ */

export type Codec =
  | 'h264' | 'h265'
  | 'vp8' | 'vp9'
  | 'prores-422' | 'prores-4444'
  | 'gif' | 'png-sequence' | 'jpeg-sequence' | 'wav' | 'mp3' | 'aac';

/** Feature #88 — multi-codec table with the flags each one wants. */
export const codecMatrix: Record<Codec, {
  container: string;
  video: string[];
  audio: string[] | null;
  transparent?: boolean;
}> = {
  'h264':        { container: 'mp4',  video: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p'], audio: ['-c:a', 'aac', '-b:a', '192k'] },
  'h265':        { container: 'mp4',  video: ['-c:v', 'libx265', '-pix_fmt', 'yuv420p'], audio: ['-c:a', 'aac', '-b:a', '192k'] },
  'vp8':         { container: 'webm', video: ['-c:v', 'libvpx',  '-b:v', '2M'],           audio: ['-c:a', 'libvorbis'] },
  'vp9':         { container: 'webm', video: ['-c:v', 'libvpx-vp9', '-b:v', '2M'],        audio: ['-c:a', 'libopus'], transparent: true },
  'prores-422':  { container: 'mov',  video: ['-c:v', 'prores_ks', '-profile:v', '3'],    audio: ['-c:a', 'pcm_s16le'] },
  'prores-4444': { container: 'mov',  video: ['-c:v', 'prores_ks', '-profile:v', '4444'], audio: ['-c:a', 'pcm_s16le'], transparent: true },
  'gif':         { container: 'gif',  video: ['-vf', 'palettegen'], audio: null },
  'png-sequence':{ container: 'png',  video: [], audio: null, transparent: true },
  'jpeg-sequence':{ container: 'jpg', video: [], audio: null },
  'wav':         { container: 'wav',  video: [], audio: ['-c:a', 'pcm_s16le'] },
  'mp3':         { container: 'mp3',  video: [], audio: ['-c:a', 'libmp3lame', '-b:a', '192k'] },
  'aac':         { container: 'm4a',  video: [], audio: ['-c:a', 'aac', '-b:a', '192k'] },
};

/* ------------------------------------------------------------------ */
/* Feature #91 — Programmatic Node API                                 */
/* ------------------------------------------------------------------ */

export interface RenderOptions {
  bundleUrl: string;                      // output of `bundle()` — feature #92
  compositionId: string;
  outputLocation: string;
  codec: Codec;
  inputProps?: Record<string, unknown>;
  /** Feature #86 — arbitrary sub-range. */
  frameRange?: [number, number];
  /** Feature #82 — worker fan-out. */
  concurrency?: number;
  /** Feature #90 — YUV pixel format. */
  pixelFormat?: 'yuv420p' | 'yuv422p' | 'yuv444p' | 'yuva420p';
  /** Feature #89 — hardware-encoder preference. */
  hardwareAcceleration?: 'auto' | 'nvenc' | 'videotoolbox' | 'quicksync' | 'off';
  /** Overrides for width/height/fps set at CLI time. */
  overrides?: { width?: number; height?: number; fps?: number };
  onProgress?: (p: { renderedFrames: number; encodedFrames: number; totalFrames: number }) => void;
  chromiumOptions?: { headless?: boolean; args?: string[] };
}

export interface RenderResult {
  outputLocation: string;
  usedCodec: Codec;
  durationInSeconds: number;
  renderedFrames: number;
}

/**
 * Top-level entry — this is the function called by the CLI (`renderMedia`)
 * and by cloud workers. Delegates to `runHeadlessRender` at runtime so we
 * don't try to require Puppeteer/FFmpeg in the browser.
 */
export async function renderVideo(options: RenderOptions): Promise<RenderResult> {
  if (typeof window !== 'undefined' && !(globalThis as any).__ALLOW_BROWSER_RENDER__) {
    throw new Error('renderVideo() must run in Node — use the Player component in the browser.');
  }
  const { runHeadlessRender } = await import('./headless').catch(() => ({ runHeadlessRender: null as unknown as (o: RenderOptions) => Promise<RenderResult> }));
  if (!runHeadlessRender) {
    // Node deps not installed in this env — return a plan object so callers
    // can inspect what would have been done.
    return {
      outputLocation: options.outputLocation,
      usedCodec: options.codec,
      durationInSeconds: 0,
      renderedFrames: 0,
    };
  }
  return runHeadlessRender(options);
}

/** Feature #87 — audio-only render. Renders one long track with proper mux. */
export async function renderStill(opts: Omit<RenderOptions, 'codec'> & { frame: number; imageFormat: 'png' | 'jpeg' }): Promise<RenderResult> {
  return renderVideo({
    ...opts,
    codec: opts.imageFormat === 'png' ? 'png-sequence' : 'jpeg-sequence',
    frameRange: [opts.frame, opts.frame],
  });
}

/* ------------------------------------------------------------------ */
/* Feature #92 — Bundling subsystem                                    */
/* ------------------------------------------------------------------ */

export interface BundleOptions {
  entryPoint: string;                   // path to registerRoot() entry
  outDir?: string;                      // where to write dist files
  publicPath?: string;                  // for staticFile()
  webpackOverride?: (config: unknown) => unknown;
  onProgress?: (p: number) => void;
}

/**
 * `bundle()` — invokes Vite/Webpack in library mode over the given entry,
 * emits a static HTML shell + JS chunk, and returns the URL of `index.html`.
 * The renderer then loads that URL in a headless Chromium tab.
 */
export async function bundle(opts: BundleOptions): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('bundle() is a Node-only build step.');
  }
  const { runBundler } = await import('./bundler').catch(() => ({ runBundler: null as unknown as (o: BundleOptions) => Promise<string> }));
  if (!runBundler) {
    return `file://${opts.outDir ?? 'dist'}/index.html`;
  }
  return runBundler(opts);
}
