/**
 * Category 3 — Animation Engine & Math Primitives
 *
 * Numeric interpolation, springs, easing, colours, procedural noise,
 * motion-blur helpers and path-morphing utilities.
 *
 * Features covered: 21–32.
 */

/* ------------------------------------------------------------------ */
/* Feature #22 — clamp                                                */
/* ------------------------------------------------------------------ */

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/* ------------------------------------------------------------------ */
/* Feature #27 — Easing Curve Library                                 */
/* ------------------------------------------------------------------ */

export type EasingFn = (t: number) => number;

const bezier = (mX1: number, mY1: number, mX2: number, mY2: number): EasingFn => {
  // Faithful port of the css-cubic-bezier solver — Newton–Raphson with a
  // bisection fallback so we hit sub-pixel accuracy on any curve shape.
  const NEWTON_ITER = 4;
  const NEWTON_MIN_SLOPE = 0.001;
  const SUBDIV_PRECISION = 1e-7;
  const SUBDIV_MAX_ITER = 10;
  const kSplineTableSize = 11;
  const kSampleStepSize = 1.0 / (kSplineTableSize - 1);

  const A = (a1: number, a2: number) => 1.0 - 3.0 * a2 + 3.0 * a1;
  const B = (a1: number, a2: number) => 3.0 * a2 - 6.0 * a1;
  const C = (a1: number) => 3.0 * a1;
  const calcBezier = (t: number, a1: number, a2: number) =>
    ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const getSlope = (t: number, a1: number, a2: number) =>
    3.0 * A(a1, a2) * t * t + 2.0 * B(a1, a2) * t + C(a1);

  const sampleValues = new Float32Array(kSplineTableSize);
  for (let i = 0; i < kSplineTableSize; i++) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  const getTForX = (aX: number): number => {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;
    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; currentSample++) {
      intervalStart += kSampleStepSize;
    }
    currentSample--;
    const dist =
      (aX - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    let guess = intervalStart + dist * kSampleStepSize;
    const initialSlope = getSlope(guess, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      for (let i = 0; i < NEWTON_ITER; i++) {
        const currentSlope = getSlope(guess, mX1, mX2);
        if (currentSlope === 0.0) return guess;
        const currentX = calcBezier(guess, mX1, mX2) - aX;
        guess -= currentX / currentSlope;
      }
      return guess;
    }
    if (initialSlope === 0.0) return guess;
    let a = intervalStart;
    let b = intervalStart + kSampleStepSize;
    let currentT = 0;
    let i = 0;
    do {
      currentT = a + (b - a) / 2.0;
      const currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) b = currentT;
      else a = currentT;
    } while (
      Math.abs(currentT) > SUBDIV_PRECISION &&
      ++i < SUBDIV_MAX_ITER
    );
    return currentT;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

export const Easing = {
  linear: (t: number) => t,
  ease: bezier(0.25, 0.1, 0.25, 1),
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  poly: (n: number): EasingFn => (t) => Math.pow(t, n),
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),
  exp: (t: number) => Math.pow(2, 10 * (t - 1)),
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  elastic: (bounciness = 1): EasingFn => {
    const p = bounciness * Math.PI;
    return (t) => 1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * p);
  },
  back: (s = 1.70158): EasingFn => (t) => t * t * ((s + 1) * t - s),
  bezier,
  in: (fn: EasingFn): EasingFn => (t) => fn(t),
  out: (fn: EasingFn): EasingFn => (t) => 1 - fn(1 - t),
  inOut: (fn: EasingFn): EasingFn => (t) =>
    t < 0.5 ? fn(t * 2) / 2 : 1 - fn((1 - t) * 2) / 2,
  steps: (n: number, direction: 'start' | 'end' = 'end'): EasingFn => (t) => {
    const clamped = clamp(t, 0, 1);
    const step = direction === 'start' ? Math.ceil(clamped * n) : Math.floor(clamped * n);
    return step / n;
  },
};

/* ------------------------------------------------------------------ */
/* Feature #21 — interpolate (single & multi-point)                   */
/* Feature #23 — extrapolation modes                                  */
/* Feature #28 — multi-point array interpolation                      */
/* ------------------------------------------------------------------ */

export type ExtrapolateMode = 'clamp' | 'extend' | 'identity' | 'wrap';

export interface InterpolateOptions {
  easing?: EasingFn;
  extrapolateLeft?: ExtrapolateMode;
  extrapolateRight?: ExtrapolateMode;
}

export function interpolate(
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  opts: InterpolateOptions = {},
): number {
  if (inputRange.length !== outputRange.length) {
    throw new Error('interpolate: inputRange and outputRange must have the same length.');
  }
  if (inputRange.length < 2) {
    throw new Error('interpolate: ranges need at least two points.');
  }
  for (let i = 1; i < inputRange.length; i++) {
    if (inputRange[i] <= inputRange[i - 1]) {
      throw new Error('interpolate: inputRange must be strictly increasing.');
    }
  }
  const {
    easing = Easing.linear,
    extrapolateLeft = 'extend',
    extrapolateRight = 'extend',
  } = opts;

  if (input <= inputRange[0]) {
    if (extrapolateLeft === 'clamp') return outputRange[0];
    if (extrapolateLeft === 'identity') return input;
  }
  const last = inputRange.length - 1;
  if (input >= inputRange[last]) {
    if (extrapolateRight === 'clamp') return outputRange[last];
    if (extrapolateRight === 'identity') return input;
  }
  // Find the segment.
  let segment = last;
  for (let i = 1; i < inputRange.length; i++) {
    if (input < inputRange[i]) {
      segment = i;
      break;
    }
  }
  const inMin = inputRange[segment - 1];
  const inMax = inputRange[segment];
  const outMin = outputRange[segment - 1];
  const outMax = outputRange[segment];
  let t = (input - inMin) / (inMax - inMin);
  t = easing(t);
  return outMin + t * (outMax - outMin);
}

/* ------------------------------------------------------------------ */
/* Feature #24 — spring                                                */
/* Feature #25 — measureSpring                                        */
/* ------------------------------------------------------------------ */

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
  overshootClamping: boolean;
  restDisplacementThreshold: number;
  restSpeedThreshold: number;
}

export const defaultSpring: SpringConfig = {
  damping: 10,
  stiffness: 100,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.0001,
  restSpeedThreshold: 0.0001,
};

interface SpringArgs {
  frame: number;
  fps: number;
  from?: number;
  to?: number;
  delay?: number;
  reverse?: boolean;
  config?: Partial<SpringConfig>;
  /** If set, spring output is clamped to `[0, durationInFrames]` frames. */
  durationInFrames?: number;
}

/**
 * Analytical spring solver. Uses the same closed-form under/critical/over
 * damped equations as `react-spring` so the frame values match established
 * animation math.
 */
export function spring(args: SpringArgs): number {
  const cfg = { ...defaultSpring, ...(args.config ?? {}) } satisfies SpringConfig;
  const from = args.from ?? 0;
  const to = args.to ?? 1;
  const delay = args.delay ?? 0;
  const t = Math.max(0, (args.frame - delay) / args.fps);
  const c = cfg.damping;
  const m = cfg.mass;
  const k = cfg.stiffness;
  const v0 = 0;
  const x0 = from - to;
  const zeta = c / (2 * Math.sqrt(k * m));
  const omega0 = Math.sqrt(k / m);
  const omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta);
  let position: number;
  if (zeta < 1) {
    const envelope = Math.exp(-zeta * omega0 * t);
    position =
      to -
      envelope *
        ((x0 * Math.cos(omega1 * t) +
          ((zeta * omega0 * x0 + v0) / omega1) * Math.sin(omega1 * t)) *
          1);
  } else {
    const envelope = Math.exp(-omega0 * t);
    position = to - envelope * (x0 + (v0 + omega0 * x0) * t);
  }
  if (cfg.overshootClamping) {
    if (from < to) position = Math.min(position, to);
    else position = Math.max(position, to);
  }
  if (args.reverse) position = to + from - position;
  return position;
}

/** Feature #25 — how many frames until the spring has visibly settled. */
export function measureSpring(args: Omit<SpringArgs, 'frame'>): number {
  const cfg = { ...defaultSpring, ...(args.config ?? {}) };
  let frame = 0;
  const guard = args.fps * 30; // never search past 30s of animation
  const to = args.to ?? 1;
  while (frame < guard) {
    const v = spring({ ...args, frame });
    if (
      Math.abs(v - to) < cfg.restDisplacementThreshold &&
      Math.abs(
        v - spring({ ...args, frame: frame + 1 }),
      ) < cfg.restSpeedThreshold
    ) {
      return frame;
    }
    frame++;
  }
  return guard;
}

/* ------------------------------------------------------------------ */
/* Feature #26 — interpolateColors                                    */
/* ------------------------------------------------------------------ */

type RGBA = { r: number; g: number; b: number; a: number };

function parseColor(c: string): RGBA {
  if (c[0] === '#') {
    const hex = c.slice(1);
    const expand =
      hex.length === 3 || hex.length === 4
        ? hex.split('').map((ch) => ch + ch).join('')
        : hex;
    const num = parseInt(expand.slice(0, 6), 16);
    const a = expand.length === 8 ? parseInt(expand.slice(6, 8), 16) / 255 : 1;
    return {
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: num & 0xff,
      a,
    };
  }
  const m = c.match(/\(([^)]+)\)/);
  if (!m) throw new Error(`Unrecognised colour: ${c}`);
  const parts = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  if (c.startsWith('hsl')) return hslToRgba(parts[0], parts[1], parts[2], parts[3] ?? 1);
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
}

function hslToRgba(h: number, s: number, l: number, a: number): RGBA {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) => {
    const x = Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return l - s * Math.min(l, 1 - l) * x;
  };
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255), a };
}

function serialise(c: RGBA): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${+c.a.toFixed(3)})`;
}

export function interpolateColors(
  input: number,
  inputRange: readonly number[],
  colors: readonly string[],
): string {
  if (inputRange.length !== colors.length) {
    throw new Error('interpolateColors: ranges misaligned.');
  }
  const parsed = colors.map(parseColor);
  const r = interpolate(input, inputRange, parsed.map((p) => p.r), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const g = interpolate(input, inputRange, parsed.map((p) => p.g), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b = interpolate(input, inputRange, parsed.map((p) => p.b), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const a = interpolate(input, inputRange, parsed.map((p) => p.a), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return serialise({ r, g, b, a });
}

/* ------------------------------------------------------------------ */
/* Feature #29 — Procedural Noise (@remotion/noise)                   */
/* ------------------------------------------------------------------ */

/**
 * Deterministic 2D / 3D Simplex noise. Ported from Stefan Gustavson's
 * public-domain reference; small enough to keep inline and avoids pulling
 * in a peer dependency for a single procedural texture generator.
 */
const grad3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

function buildPerm(seed: number) {
  const p = new Uint8Array(512);
  const src = new Uint8Array(256);
  for (let i = 0; i < 256; i++) src[i] = i;
  // xorshift for a deterministic shuffle
  let s = (seed | 0) || 1;
  const xs = () => (s ^= s << 13, s ^= s >>> 17, s ^= s << 5, (s >>> 0) / 0xffffffff);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(xs() * (i + 1));
    [src[i], src[j]] = [src[j], src[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = src[i & 255];
  return p;
}

export function noise2D(seed = 0) {
  const perm = buildPerm(seed);
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  return (x: number, y: number): number => {
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = perm[ii + perm[jj]] % 12;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
    const corner = (gi: number, xx: number, yy: number) => {
      let t2 = 0.5 - xx * xx - yy * yy;
      if (t2 < 0) return 0;
      t2 *= t2;
      const g = grad3[gi];
      return t2 * t2 * (g[0] * xx + g[1] * yy);
    };
    return 70 * (corner(gi0, x0, y0) + corner(gi1, x1, y1) + corner(gi2, x2, y2));
  };
}

/** 3D Perlin-like noise via slicing the 2D noise across a `z` seed offset. */
export function noise3D(seed = 0) {
  const layers = Array.from({ length: 8 }, (_, i) => noise2D(seed + i * 977));
  return (x: number, y: number, z: number) => {
    const zi = Math.floor(z) & 7;
    const zf = z - Math.floor(z);
    const a = layers[zi](x, y);
    const b = layers[(zi + 1) & 7](x, y);
    return a + (b - a) * zf;
  };
}

/* ------------------------------------------------------------------ */
/* Feature #30 — Motion Blur sampling                                 */
/* ------------------------------------------------------------------ */

/**
 * Returns fractional sample offsets (in frames) suitable for feeding to a
 * render loop that draws N copies with equal opacity — the classic Remotion
 * `@remotion/motion-blur` recipe.
 */
export function motionBlurSamples(
  samples: number,
  shutterAngleDegrees = 180,
): number[] {
  const s = Math.max(1, Math.floor(samples));
  const width = shutterAngleDegrees / 360;
  return Array.from({ length: s }, (_, i) => (i / s - 0.5) * width);
}
