import type { EditorKeyframe, KeyframeValue } from "../contracts";

const easeInOut = (t: number): number => {
  if (t < 0.5) return 2 * t * t;
  return 1 - Math.pow(-2 * t + 2, 2) / 2;
};

const cubicBezier = (t: number): number => {
  // Deterministic default cubic-bezier(0.25,0.1,0.25,1)
  const p0 = 0;
  const p1 = 0.1;
  const p2 = 1;
  const p3 = 1;
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

const easing = (kind: EditorKeyframe["easing"], t: number): number => {
  switch (kind) {
    case "easeIn":
      return t * t;
    case "easeOut":
      return 1 - (1 - t) * (1 - t);
    case "easeInOut":
      return easeInOut(t);
    case "spring": {
      const damped = Math.exp(-5 * t) * Math.cos(10 * t);
      return 1 - damped;
    }
    case "bezier":
      return cubicBezier(t);
    default:
      return t;
  }
};

const interpolateValue = (start: number, end: number, t: number): number =>
  start + (end - start) * t;

export const interpolateKeyframes = (
  keyframes: EditorKeyframe[],
  frame: number,
): KeyframeValue => {
  if (keyframes.length === 0) return {};
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  if (frame <= sorted[0].frame) return sorted[0].value;
  if (frame >= sorted[sorted.length - 1].frame) return sorted[sorted.length - 1].value;

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    if (frame < current.frame || frame > next.frame) continue;
    const raw = (frame - current.frame) / (next.frame - current.frame);
    const progress = easing(next.easing, raw);
    const keys = new Set<keyof KeyframeValue>([
      ...Object.keys(current.value),
      ...Object.keys(next.value),
    ] as Array<keyof KeyframeValue>);

    const value: KeyframeValue = {};
    keys.forEach((key) => {
      const start = current.value[key];
      const end = next.value[key];
      if (typeof start === "number" && typeof end === "number") {
        value[key] = interpolateValue(start, end, progress);
      } else if (typeof end === "number") {
        value[key] = end;
      } else if (typeof start === "number") {
        value[key] = start;
      }
    });
    return value;
  }

  return sorted[sorted.length - 1].value;
};
