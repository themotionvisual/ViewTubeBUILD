import { VT_E1_ANIMATED_FX_KEYS } from './vtE1FxCatalog.js';

/**
 * Canonical VT_E1 visual-frame contract shared by browser preview and final render.
 * Framework-free by design.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const clamp01 = (value) => clamp(value, 0, 1);

export const VT_E1_VISUAL_ANIMATED_PROPS = Object.freeze([
  'x',
  'y',
  'scale',
  'rotation',
  'width',
  'height',
  'fontSize',
  'strokeWidth',
  ...VT_E1_ANIMATED_FX_KEYS,
]);

export const VT_E1_DEFAULT_CLIP_VISUAL_TRANSFORM = Object.freeze({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
  cropLeft: 0,
  cropRight: 0,
  cropTop: 0,
  cropBottom: 0,
});

export function readVtE1ClipVisualTransform(clip) {
  const raw = clip?.transform && typeof clip.transform === 'object' ? clip.transform : {};
  const cropLeft = clamp01(clip?.cropLeft ?? raw.cropLeft ?? 0);
  const cropRight = clamp01(clip?.cropRight ?? raw.cropRight ?? 0);
  const cropTop = clamp01(clip?.cropTop ?? raw.cropTop ?? 0);
  const cropBottom = clamp01(clip?.cropBottom ?? raw.cropBottom ?? 0);
  const horizontalTotal = Math.min(0.98, cropLeft + cropRight);
  const verticalTotal = Math.min(0.98, cropTop + cropBottom);
  const normalizedRight = horizontalTotal >= 0.98
    ? Math.max(0, 0.98 - cropLeft)
    : cropRight;
  const normalizedBottom = verticalTotal >= 0.98
    ? Math.max(0, 0.98 - cropTop)
    : cropBottom;

  return {
    x: Number(raw.x ?? 0) || 0,
    y: Number(raw.y ?? 0) || 0,
    scaleX: Math.max(0.05, Number(raw.scaleX ?? 1) || 1),
    scaleY: Math.max(0.05, Number(raw.scaleY ?? 1) || 1),
    rotation: Number(raw.rotation ?? 0) || 0,
    opacity: clamp01(raw.opacity ?? 1),
    cropLeft,
    cropRight: normalizedRight,
    cropTop,
    cropBottom: normalizedBottom,
  };
}

export function easeVtE1KeyframeProgress(rawT, interp) {
  const t = clamp01(rawT);
  if (interp === 'easeIn') return t * t;
  if (interp === 'easeOut') return 1 - (1 - t) * (1 - t);
  if (interp === 'easeInOut') return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  if (interp === 'springy') return clamp01(1 - Math.cos(t * Math.PI * 2.25) * Math.exp(-t * 4.2));
  if (interp === 'bell') return clamp01(Math.sin(t * Math.PI));
  return t;
}

export function evaluateVtE1KeyframedValue(base, keyframes, prop, localSeconds) {
  const list = (Array.isArray(keyframes) ? keyframes : [])
    .filter((keyframe) => keyframe?.values && Object.prototype.hasOwnProperty.call(keyframe.values, prop))
    .sort((a, b) => Number(a.offsetSec ?? 0) - Number(b.offsetSec ?? 0));

  if (!list.length) return base;
  if (localSeconds <= Number(list[0].offsetSec ?? 0)) return list[0].values?.[prop] ?? base;
  const last = list[list.length - 1];
  if (localSeconds >= Number(last.offsetSec ?? 0)) return last.values?.[prop] ?? base;

  for (let index = 0; index < list.length - 1; index += 1) {
    const left = list[index];
    const right = list[index + 1];
    const leftSec = Number(left.offsetSec ?? 0);
    const rightSec = Number(right.offsetSec ?? 0);
    if (localSeconds < leftSec || localSeconds > rightSec) continue;

    const leftValue = left.values?.[prop];
    const rightValue = right.values?.[prop];
    const rawT = clamp01((localSeconds - leftSec) / Math.max(0.001, rightSec - leftSec));
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      const t = easeVtE1KeyframeProgress(rawT, String(right.interp ?? left.interp ?? 'linear'));
      return leftValue + (rightValue - leftValue) * t;
    }
    return rawT < 1 ? leftValue : rightValue;
  }

  return base;
}

export function evaluateVtE1VisualPayload(payload, clip, localSeconds) {
  const next = { ...(payload || {}) };
  for (const prop of VT_E1_VISUAL_ANIMATED_PROPS) {
    next[prop] = evaluateVtE1KeyframedValue(next[prop], clip?.keyframes, prop, localSeconds);
  }
  return next;
}

export function resolveVtE1VisualFrame(payload, clip, localSeconds, defaultWidth = 1920, defaultHeight = 1080) {
  const evaluatedPayload = evaluateVtE1VisualPayload(payload, clip, Math.max(0, Number(localSeconds) || 0));
  const clipTransform = readVtE1ClipVisualTransform(clip);
  const baseScale = Math.max(0.0001, Number(evaluatedPayload.scale ?? 1) || 1);
  return {
    payload: evaluatedPayload,
    x: (Number(evaluatedPayload.x ?? 0) || 0) + clipTransform.x,
    y: (Number(evaluatedPayload.y ?? 0) || 0) + clipTransform.y,
    width: Math.max(1, Number(evaluatedPayload.width ?? defaultWidth) || defaultWidth),
    height: Math.max(1, Number(evaluatedPayload.height ?? defaultHeight) || defaultHeight),
    scaleX: baseScale * clipTransform.scaleX,
    scaleY: baseScale * clipTransform.scaleY,
    rotation: (Number(evaluatedPayload.rotation ?? 0) || 0) + clipTransform.rotation,
    opacity: clamp01((Number(evaluatedPayload.opacity ?? 1) || 0) * clipTransform.opacity),
    cropLeft: clipTransform.cropLeft,
    cropRight: clipTransform.cropRight,
    cropTop: clipTransform.cropTop,
    cropBottom: clipTransform.cropBottom,
  };
}

export function vtE1MediaCropStyle(clip) {
  const transform = readVtE1ClipVisualTransform(clip);
  const scaleX = 1 / Math.max(0.001, 1 - transform.cropLeft - transform.cropRight);
  const scaleY = 1 / Math.max(0.001, 1 - transform.cropTop - transform.cropBottom);
  const translateX = (-transform.cropLeft) * scaleX * 100;
  const translateY = (-transform.cropTop) * scaleY * 100;
  return {
    transform: `translate(${translateX}%, ${translateY}%) scale(${scaleX}, ${scaleY})`,
    transformOrigin: '0 0',
  };
}

export function sortVtE1Tracks(tracks) {
  return (Array.isArray(tracks) ? tracks : [])
    .map((track, index) => ({ track, index }))
    .sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.track?.order)) ? Number(a.track.order) : a.index;
      const bOrder = Number.isFinite(Number(b.track?.order)) ? Number(b.track.order) : b.index;
      return aOrder - bOrder || a.index - b.index;
    })
    .map((entry) => entry.track);
}
