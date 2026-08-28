/**
 * Category 6 — Media Acceleration & Frame Synchronization
 *
 * <Video>, <OffthreadVideo>, static asset paths, preloaders, animated image
 * primitive, metadata reader, non-destructive crop, HTML-in-canvas rendering,
 * and object-fit / loop-volume-curve controls.
 *
 * Features covered: 53–62.
 */
import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig, getRemotionEnvironment } from '../core/composition';
import { delayRender, continueRender, cancelRender } from '../devx/asyncGuards';

/* ------------------------------------------------------------------ */
/* Feature #55 — staticFile                                           */
/* ------------------------------------------------------------------ */

/** Root of the `public/` folder — configurable via `REMOTION_PUBLIC_URL`. */
export function getPublicRoot(): string {
  const g = globalThis as any;
  return g.REMOTION_PUBLIC_URL || g.process?.env?.REMOTION_PUBLIC_URL || '/';
}

export function staticFile(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  const root = getPublicRoot().replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return `${root}/${p}`;
}

/* ------------------------------------------------------------------ */
/* Feature #56 — Asset preloaders                                     */
/* ------------------------------------------------------------------ */

const preloadCache = new Map<string, Promise<unknown>>();

function preloadGeneric<T>(key: string, load: () => Promise<T>): () => Promise<T> {
  if (!preloadCache.has(key)) preloadCache.set(key, load());
  return () => preloadCache.get(key) as Promise<T>;
}

export const preloadImage = (src: string) =>
  preloadGeneric(`img:${src}`, () => new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  }));

export const preloadAudio = (src: string) =>
  preloadGeneric(`aud:${src}`, () => fetch(src).then((r) => r.arrayBuffer()));

export const preloadVideo = (src: string) =>
  preloadGeneric(`vid:${src}`, () => new Promise<void>((res) => {
    const el = document.createElement('video');
    el.preload = 'auto';
    el.src = src;
    el.oncanplay = () => res();
    el.load();
  }));

export const preloadFont = (family: string, url: string, descriptors?: FontFaceDescriptors) =>
  preloadGeneric(`font:${family}:${url}`, async () => {
    const face = new FontFace(family, `url(${url})`, descriptors);
    await face.load();
    (document.fonts as unknown as { add(f: FontFace): void }).add(face);
    return face;
  });

/* ------------------------------------------------------------------ */
/* Frame-seeking mixin — used by <Video> / <OffthreadVideo> / <Gif>   */
/* ------------------------------------------------------------------ */

interface CropRect {
  cropLeft?: number;
  cropTop?: number;
  cropRight?: number;
  cropBottom?: number;
}

interface FitProps {
  /** Feature #61. */
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
}

function useFrameSync(
  el: React.RefObject<HTMLMediaElement | null>,
  startFrom: number,
  playbackRate: number,
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useEffect(() => {
    if (!el.current) return;
    const t = Math.max(0, (frame - startFrom) / fps) * playbackRate;
    if (Math.abs(el.current.currentTime - t) > 1 / fps / 2) {
      el.current.currentTime = t;
    }
    el.current.playbackRate = playbackRate;
  }, [frame, fps, startFrom, playbackRate, el]);
}

/* ------------------------------------------------------------------ */
/* Feature #53 — <Video>                                              */
/* ------------------------------------------------------------------ */

export interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement>, CropRect, FitProps {
  src: string;
  startFrom?: number;
  endAt?: number;
  playbackRate?: number;
  /** Feature #62. */
  loopVolumeCurveBehavior?: 'continue' | 'repeat';
}

export const Video: React.FC<VideoProps> = ({
  src,
  startFrom = 0,
  endAt,
  playbackRate = 1,
  cropLeft = 0,
  cropRight = 0,
  cropTop = 0,
  cropBottom = 0,
  objectFit = 'cover',
  loopVolumeCurveBehavior = 'continue',
  style,
  ...rest
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const frame = useCurrentFrame();
  useFrameSync(ref, startFrom, playbackRate);
  if (endAt !== undefined && frame >= endAt) return null;

  // Feature #59 — non-destructive crop via CSS transforms so we don't demux.
  const scaleX = 1 / Math.max(0.001, 1 - cropLeft - cropRight);
  const scaleY = 1 / Math.max(0.001, 1 - cropTop - cropBottom);
  const translateX = (-cropLeft) * scaleX * 100;
  const translateY = (-cropTop) * scaleY * 100;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} data-loop-volume-behavior={loopVolumeCurveBehavior}>
      <video
        ref={ref}
        src={src}
        muted={rest.muted}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          transform: `translate(${translateX}%, ${translateY}%) scale(${scaleX}, ${scaleY})`,
          transformOrigin: '0 0',
          ...style,
        }}
        {...rest}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Feature #54 — <OffthreadVideo>                                     */
/* ------------------------------------------------------------------ */

/**
 * In the browser it just renders as `<Video>`; during headless render the
 * `Environment === 'rendering'` branch is expected to be intercepted by the
 * CLI's off-thread frame extractor (see `render/renderVideo.ts`) which
 * substitutes a per-frame `<img>` decoded via `ffmpeg -ss …`.
 */
export const OffthreadVideo: React.FC<VideoProps & { transparent?: boolean }> = (props) => {
  const env = getRemotionEnvironment();
  if (env === 'rendering' || env === 'still') {
    // Server-side path: request the specific frame from the off-thread daemon.
    return <OffthreadFrame {...props} />;
  }
  return <Video {...props} />;
};

const OffthreadFrame: React.FC<VideoProps & { transparent?: boolean }> = ({
  src, startFrom = 0, playbackRate = 1, objectFit = 'cover', style, transparent, ...rest
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, (frame - startFrom) / fps) * playbackRate;
  // The CLI extractor listens on this URL scheme — see renderer for details.
  const url = `/_offthread?src=${encodeURIComponent(src)}&t=${t}${transparent ? '&transparent=1' : ''}`;
  return <img src={url} style={{ width: '100%', height: '100%', objectFit, ...style }} {...(rest as any)} />;
};

/* ------------------------------------------------------------------ */
/* Feature #57 — <Gif> / animated images                              */
/* ------------------------------------------------------------------ */

export interface GifProps extends React.ImgHTMLAttributes<HTMLImageElement>, FitProps {
  src: string;
  /** Frames of the GIF/WEBP loop. If omitted we fall back to naïve <img>. */
  frames?: string[];
  fpsOverride?: number;
  loop?: boolean;
}

export const Gif: React.FC<GifProps> = ({
  src, frames, fpsOverride, loop = true, objectFit = 'cover', style, ...rest
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!frames || frames.length === 0) {
    return <img src={src} style={{ width: '100%', height: '100%', objectFit, ...style }} {...rest} />;
  }
  const stepFps = fpsOverride ?? fps;
  const idx = loop
    ? Math.floor((frame * stepFps) / fps) % frames.length
    : Math.min(frames.length - 1, Math.floor((frame * stepFps) / fps));
  return <img src={frames[idx]} style={{ width: '100%', height: '100%', objectFit, ...style }} {...rest} />;
};

/* ------------------------------------------------------------------ */
/* Feature #58 — getVideoMetadata                                     */
/* ------------------------------------------------------------------ */

export interface VideoMetadata {
  durationInSeconds: number;
  width: number;
  height: number;
  fps: number | null;
  aspectRatio: number;
  audioCodec: string | null;
  supportsSeeking: boolean;
}

export function getVideoMetadata(src: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.src = src;
    el.onloadedmetadata = () => resolve({
      durationInSeconds: el.duration,
      width: el.videoWidth,
      height: el.videoHeight,
      fps: null, // browsers don't expose fps, off-thread daemon does
      aspectRatio: el.videoWidth / (el.videoHeight || 1),
      audioCodec: null,
      supportsSeeking: true,
    });
    el.onerror = () => reject(new Error(`Failed to read metadata for ${src}`));
  });
}

/* ------------------------------------------------------------------ */
/* Feature #60 — <HtmlCanvas>                                         */
/* ------------------------------------------------------------------ */

/**
 * Renders a DOM subtree offscreen and rasterises it into a canvas each frame.
 * Falls back to `html-to-image`-style SVG-in-foreignObject when the DOM API
 * isn't available (e.g. in the off-thread renderer).
 */
export const HtmlCanvas: React.FC<{
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ width, height, children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const handle = delayRender('HtmlCanvas rasterise');
    const xml = new XMLSerializer().serializeToString(host);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, width, height);
      ctx?.drawImage(img, 0, 0, width, height);
      continueRender(handle);
    };
    img.onerror = () => cancelRender(handle, new Error('HtmlCanvas render failed'));
    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [frame, width, height]);

  return (
    <>
      <div ref={hostRef} style={{ position: 'absolute', left: -99999, width, height }}>
        {children}
      </div>
      <canvas ref={canvasRef} width={width} height={height} />
    </>
  );
};
