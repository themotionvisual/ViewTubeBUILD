/**
 * Pure VT_E1 Shorts framing contract. This module deliberately has no React,
 * DOM, or Remotion dependency so browser preview and final rendering use the
 * identical crop and interpolation math.
 */
export type ShortsFramingConfig = {
  mode: 'single' | 'split';
  aspectPreset: '9:16' | '1:1' | '4:5';
  xPosition: number;
  yPosition: number;
  zoom: number;
  splitRatio: number;
  closeupPosition: 'top' | 'bottom';
  closeupZoom: number;
  closeupX: number;
  transition: 'pan' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bell' | 'cut';
  smoothing: number;
};

export type ShortsKeyframe = Partial<ShortsFramingConfig> & { id?: string; time: number };
export type ShortsSegment = { id?: string; label?: string; start: number; end: number };

export const SHORTS_EXTRACTOR_DEFAULT_CONFIG: ShortsFramingConfig = Object.freeze({
  mode: 'single', aspectPreset: '9:16', xPosition: 0.5, yPosition: 0.5, zoom: 1,
  splitRatio: 0.55, closeupPosition: 'top', closeupZoom: 2.2, closeupX: 0.5,
  transition: 'ease-in-out', smoothing: 0.45,
});

export const SHORTS_EXTRACTOR_ASPECTS = Object.freeze({
  '9:16': { width: 1080, height: 1920, ratio: 9 / 16 },
  '1:1': { width: 1080, height: 1080, ratio: 1 },
  '4:5': { width: 1080, height: 1350, ratio: 4 / 5 },
});

export const SHORTS_EXTRACTOR_TRANSITIONS = Object.freeze([
  { id: 'pan', label: 'Linear' }, { id: 'ease-in', label: 'Ease In' },
  { id: 'ease-out', label: 'Ease Out' }, { id: 'ease-in-out', label: 'Ease I/O' },
  { id: 'bell', label: 'Bell' }, { id: 'cut', label: 'Cut' },
]);

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));

export const normalizeShortsExtractorConfig = (config: Partial<ShortsFramingConfig> = {}): ShortsFramingConfig => {
  const input = config as Record<string, unknown>;
  const aspectPreset = input.aspectPreset === '1:1' || input.aspectPreset === '4:5' || input.aspectPreset === '9:16'
    ? input.aspectPreset : SHORTS_EXTRACTOR_DEFAULT_CONFIG.aspectPreset;
  const transition = SHORTS_EXTRACTOR_TRANSITIONS.some((entry) => entry.id === input.transition)
    ? input.transition as ShortsFramingConfig['transition'] : SHORTS_EXTRACTOR_DEFAULT_CONFIG.transition;
  return {
    ...SHORTS_EXTRACTOR_DEFAULT_CONFIG,
    ...input,
    mode: input.mode === 'split' ? 'split' : 'single',
    aspectPreset,
    xPosition: clamp(Number(input.xPosition ?? SHORTS_EXTRACTOR_DEFAULT_CONFIG.xPosition), 0, 1),
    yPosition: clamp(Number(input.yPosition ?? SHORTS_EXTRACTOR_DEFAULT_CONFIG.yPosition), 0, 1),
    zoom: clamp(Number(input.zoom ?? SHORTS_EXTRACTOR_DEFAULT_CONFIG.zoom), 1, 5),
    splitRatio: clamp(Number(input.splitRatio ?? SHORTS_EXTRACTOR_DEFAULT_CONFIG.splitRatio), 0.15, 0.85),
    closeupPosition: input.closeupPosition === 'bottom' ? 'bottom' : 'top',
    closeupZoom: clamp(Number(input.closeupZoom ?? SHORTS_EXTRACTOR_DEFAULT_CONFIG.closeupZoom), 1, 6),
    closeupX: clamp(Number(input.closeupX ?? input.xPosition ?? SHORTS_EXTRACTOR_DEFAULT_CONFIG.closeupX), 0, 1),
    transition,
    smoothing: clamp(Number(input.smoothing ?? SHORTS_EXTRACTOR_DEFAULT_CONFIG.smoothing), 0, 1),
  };
};

export const easeShortsTransition = (transition: string, value: number) => {
  const t = clamp(value, 0, 1);
  if (transition === 'cut') return t < 1 ? 0 : 1;
  if (transition === 'ease-in') return t * t;
  if (transition === 'ease-out') return 1 - ((1 - t) * (1 - t));
  if (transition === 'ease-in-out') return t < 0.5 ? 2 * t * t : 1 - (2 * (1 - t) * (1 - t));
  if (transition === 'bell') return 0.5 * (1 - Math.cos(Math.PI * t));
  return t;
};

export const interpolateShortsConfig = (
  baseConfig: Partial<ShortsFramingConfig> = {},
  inputKeyframes: ShortsKeyframe[] = [],
  sourceSeconds = 0,
): ShortsFramingConfig => {
  const base = normalizeShortsExtractorConfig(baseConfig);
  const keyframes = [...inputKeyframes].sort((a, b) => Number(a.time || 0) - Number(b.time || 0));
  if (!keyframes.length) return base;
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];
  if (sourceSeconds <= Number(first.time || 0)) return normalizeShortsExtractorConfig({ ...base, ...first });
  if (sourceSeconds >= Number(last.time || 0)) return normalizeShortsExtractorConfig({ ...base, ...last });
  const rightIndex = keyframes.findIndex((keyframe) => Number(keyframe.time || 0) >= sourceSeconds);
  const right = keyframes[Math.max(1, rightIndex)] || last;
  const left = keyframes[Math.max(0, rightIndex - 1)] || first;
  const span = Math.max(0.0001, Number(right.time || 0) - Number(left.time || 0));
  const t = easeShortsTransition(String(right.transition || base.transition), (sourceSeconds - Number(left.time || 0)) / span);
  const lerp = (key: keyof ShortsFramingConfig) => Number(left[key] ?? base[key]) + ((Number(right[key] ?? base[key]) - Number(left[key] ?? base[key])) * t);
  return normalizeShortsExtractorConfig({
    ...base,
    ...right,
    mode: t < 0.5 ? (left.mode || base.mode) : (right.mode || base.mode),
    aspectPreset: t < 0.5 ? (left.aspectPreset || base.aspectPreset) : (right.aspectPreset || base.aspectPreset),
    closeupPosition: t < 0.5 ? (left.closeupPosition || base.closeupPosition) : (right.closeupPosition || base.closeupPosition),
    xPosition: lerp('xPosition'), yPosition: lerp('yPosition'), zoom: lerp('zoom'),
    splitRatio: lerp('splitRatio'), closeupX: lerp('closeupX'), closeupZoom: lerp('closeupZoom'),
    smoothing: lerp('smoothing'),
  });
};

export const getShortsCropMetrics = (
  config: Partial<ShortsFramingConfig>, sourceAspect = 16 / 9, outputAspect = 9 / 16,
  regionHeightRatio = 1, closeup = false,
) => {
  const normalized = normalizeShortsExtractorConfig(config);
  const zoom = Math.max(1, Number(closeup ? normalized.closeupZoom : normalized.zoom));
  const targetAspect = outputAspect / Math.max(0.05, regionHeightRatio);
  let cropHeightPct = 100 / zoom;
  let cropWidthPct = (targetAspect / Math.max(0.05, sourceAspect) / zoom) * 100;
  if (cropWidthPct > 100) {
    cropWidthPct = 100;
    cropHeightPct = Math.min(100, (sourceAspect / targetAspect) * 100);
  }
  const xPosition = clamp(Number(closeup ? normalized.closeupX : normalized.xPosition), 0, 1);
  const yPosition = clamp(normalized.yPosition, 0, 1);
  return {
    sourceAspect, outputAspect, zoom, cropWidthPct, cropHeightPct,
    leftPct: xPosition * (100 - cropWidthPct), topPct: yPosition * (100 - cropHeightPct),
  };
};

export const getShortsCropStyle = (
  config: Partial<ShortsFramingConfig>, sourceAspect = 16 / 9, outputAspect = 9 / 16,
  regionHeightRatio = 1, closeup = false,
) => {
  const { cropWidthPct, cropHeightPct, leftPct, topPct } = getShortsCropMetrics(config, sourceAspect, outputAspect, regionHeightRatio, closeup);
  return {
    position: 'absolute' as const,
    width: `${10000 / Math.max(1, cropWidthPct)}%`, height: `${10000 / Math.max(1, cropHeightPct)}%`,
    left: `${-(leftPct / Math.max(1, cropWidthPct)) * 100}%`, top: `${-(topPct / Math.max(1, cropHeightPct)) * 100}%`,
    right: 'auto', bottom: 'auto', transform: 'none', transformOrigin: 'top left', objectFit: 'fill' as const,
    maxWidth: 'none', maxHeight: 'none',
  };
};

/** Keeps boundary keyframes while reducing dense tracking proposals deterministically. */
export const smoothShortsKeyframes = (input: ShortsKeyframe[], effectiveness = 0.45) => {
  const keyframes = [...input].sort((a, b) => Number(a.time || 0) - Number(b.time || 0));
  if (keyframes.length < 3) return keyframes;
  const radius = Math.max(1, Math.round(clamp(effectiveness, 0, 1) * 3));
  return keyframes.map((keyframe, index) => {
    if (index === 0 || index === keyframes.length - 1) return keyframe;
    const nearby = keyframes.slice(Math.max(0, index - radius), Math.min(keyframes.length, index + radius + 1));
    const average = (key: 'xPosition' | 'yPosition') => nearby.reduce((sum, entry) => sum + Number(entry[key] ?? 0.5), 0) / nearby.length;
    return { ...keyframe, xPosition: average('xPosition'), yPosition: average('yPosition') };
  });
};
