import { interpolate } from 'remotion';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const normalizedFrame = (frame: number, durationInFrames: number) => {
  const duration = Math.max(1, Math.floor(durationInFrames));
  return ((frame % duration) + duration) % duration / duration;
};

export const loopProgress = (
  frame: number,
  fps: number,
  loopDurationSeconds: number,
  speed = 1,
  phase = 0,
) => {
  const loopFrames = Math.max(1, fps * Math.max(0.05, loopDurationSeconds));
  const directedFrame = frame * Math.max(0.001, speed) + phase * loopFrames;
  return ((directedFrame % loopFrames) + loopFrames) % loopFrames / loopFrames;
};

export const pingPongProgress = (progress: number) => {
  const p = ((progress % 1) + 1) % 1;
  return p < 0.5 ? p * 2 : (1 - p) * 2;
};

export const phaseOffset = (progress: number, offset: number) =>
  ((progress + offset) % 1 + 1) % 1;

export const loopRotation = (progress: number, turns = 1) =>
  progress * 360 * turns;

export const waveValue = (
  progress: number,
  phase = 0,
  amplitude = 1,
  harmonics = 1,
) => Math.sin((progress * harmonics + phase) * Math.PI * 2) * amplitude;

export const orbitalPosition = (
  progress: number,
  radiusX: number,
  radiusY = radiusX,
  phase = 0,
) => {
  const angle = (progress + phase) * Math.PI * 2;
  return { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY };
};

export const safeInterpolate = (
  value: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
) =>
  interpolate(value, [...inputRange], [...outputRange], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const staggerProgress = (
  progress: number,
  index: number,
  count: number,
  spread = 0.6,
) => {
  const safeCount = Math.max(1, count);
  const offset = (index / safeCount) * spread;
  return clamp((progress - offset) / Math.max(0.001, 1 - spread), 0, 1);
};

const hash32 = (input: number) => {
  let x = input | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
};

export const seededRandom = (seed: number, index = 0) =>
  hash32((seed | 0) + Math.imul(index + 1, 0x9e3779b1)) / 0xffffffff;

export const responsiveScale = (width: number, height: number) =>
  Math.min(width, height) / 1080;

export const aspectRatioLayout = (width: number, height: number) => {
  const ratio = width / Math.max(1, height);
  if (ratio >= 1.45) return { key: '16:9' as const, isPortrait: false, ratio };
  if (ratio <= 0.7) return { key: '9:16' as const, isPortrait: true, ratio };
  if (ratio <= 0.9) return { key: '4:5' as const, isPortrait: true, ratio };
  return { key: '1:1' as const, isPortrait: false, ratio };
};

export const periodicDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
};
