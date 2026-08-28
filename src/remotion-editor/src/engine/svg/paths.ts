/**
 * Category 4 — Vector & SVG Path Engine
 *
 * Path length, tangent, warping, normalization, trim, morph, bounding-box,
 * scaling, reversal, smooth-waveform builder, and primitive shape helpers.
 *
 * Features covered: 31–41 (plus feature #32 `evolvePath` / #33 `interpolatePath`
 * from category 3 which live here because they operate on the vector model).
 */

/* ------------------------------------------------------------------ */
/* Tiny path tokeniser                                                */
/* ------------------------------------------------------------------ */

type PathCommand = { c: string; args: number[] };

const CMD = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:e[+-]?\d+)?)/g;

function tokenise(d: string): PathCommand[] {
  const out: PathCommand[] = [];
  let current: PathCommand | null = null;
  let m: RegExpExecArray | null;
  while ((m = CMD.exec(d)) !== null) {
    if (m[1]) {
      current = { c: m[1], args: [] };
      out.push(current);
    } else if (current) {
      current.args.push(parseFloat(m[2]));
    }
  }
  return out;
}

function serialise(cmds: PathCommand[]): string {
  return cmds.map((c) => c.c + c.args.map((n) => +n.toFixed(4)).join(' ')).join(' ');
}

/* ------------------------------------------------------------------ */
/* Feature #35 — normalizePath  (relative → absolute)                 */
/* ------------------------------------------------------------------ */

export function normalizePath(d: string): string {
  const cmds = tokenise(d);
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  const out: PathCommand[] = [];
  for (const cmd of cmds) {
    const c = cmd.c;
    const a = cmd.args.slice();
    switch (c) {
      case 'M': x = a[0]; y = a[1]; startX = x; startY = y; out.push({ c: 'M', args: [x, y] }); break;
      case 'm': x += a[0]; y += a[1]; startX = x; startY = y; out.push({ c: 'M', args: [x, y] }); break;
      case 'L': x = a[0]; y = a[1]; out.push({ c: 'L', args: [x, y] }); break;
      case 'l': x += a[0]; y += a[1]; out.push({ c: 'L', args: [x, y] }); break;
      case 'H': x = a[0]; out.push({ c: 'L', args: [x, y] }); break;
      case 'h': x += a[0]; out.push({ c: 'L', args: [x, y] }); break;
      case 'V': y = a[0]; out.push({ c: 'L', args: [x, y] }); break;
      case 'v': y += a[0]; out.push({ c: 'L', args: [x, y] }); break;
      case 'C': out.push({ c: 'C', args: [a[0], a[1], a[2], a[3], a[4], a[5]] }); x = a[4]; y = a[5]; break;
      case 'c':
        out.push({ c: 'C', args: [x + a[0], y + a[1], x + a[2], y + a[3], x + a[4], y + a[5]] });
        x += a[4]; y += a[5]; break;
      case 'Z':
      case 'z': out.push({ c: 'Z', args: [] }); x = startX; y = startY; break;
      default:
        // Q/T/S/A: pass-through absolute; convert simple relatives.
        if (c === c.toLowerCase()) {
          for (let i = 0; i < a.length; i += 2) { a[i] += x; a[i + 1] += y; }
          out.push({ c: c.toUpperCase(), args: a });
        } else {
          out.push({ c, args: a });
        }
        if (a.length >= 2) { x = a[a.length - 2]; y = a[a.length - 1]; }
    }
  }
  return serialise(out);
}

/* ------------------------------------------------------------------ */
/* Sample-based length machinery                                      */
/* ------------------------------------------------------------------ */

const SAMPLES_PER_UNIT = 4;

interface Sample { x: number; y: number; len: number; angle: number }

function samplePath(d: string): Sample[] {
  const cmds = tokenise(normalizePath(d));
  const out: Sample[] = [];
  let x = 0;
  let y = 0;
  let total = 0;
  const push = (nx: number, ny: number) => {
    const dx = nx - x;
    const dy = ny - y;
    const step = Math.hypot(dx, dy);
    total += step;
    out.push({ x: nx, y: ny, len: total, angle: (Math.atan2(dy, dx) * 180) / Math.PI });
    x = nx; y = ny;
  };
  const bezier = (p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]) => {
    const chord = Math.hypot(p3[0] - p0[0], p3[1] - p0[1]);
    const steps = Math.max(8, Math.ceil(chord * SAMPLES_PER_UNIT));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const bx = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
      const by = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
      push(bx, by);
    }
  };
  for (const cmd of cmds) {
    switch (cmd.c) {
      case 'M': x = cmd.args[0]; y = cmd.args[1]; out.push({ x, y, len: total, angle: 0 }); break;
      case 'L': push(cmd.args[0], cmd.args[1]); break;
      case 'C': bezier([x, y], [cmd.args[0], cmd.args[1]], [cmd.args[2], cmd.args[3]], [cmd.args[4], cmd.args[5]]); break;
      case 'Z':
      case 'z':
        if (out.length) push(out[0].x, out[0].y);
        break;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Feature #31 — getLength                                            */
/* ------------------------------------------------------------------ */

export function getLength(d: string): number {
  const s = samplePath(d);
  return s.length ? s[s.length - 1].len : 0;
}

/* ------------------------------------------------------------------ */
/* Feature #33 — getTangentAtLength                                   */
/* ------------------------------------------------------------------ */

export function getPointAtLength(d: string, distance: number): { x: number; y: number } {
  const s = samplePath(d);
  if (!s.length) return { x: 0, y: 0 };
  const clamped = Math.max(0, Math.min(distance, s[s.length - 1].len));
  for (let i = 1; i < s.length; i++) {
    if (s[i].len >= clamped) {
      const t = (clamped - s[i - 1].len) / (s[i].len - s[i - 1].len || 1);
      return { x: s[i - 1].x + (s[i].x - s[i - 1].x) * t, y: s[i - 1].y + (s[i].y - s[i - 1].y) * t };
    }
  }
  return { x: s[s.length - 1].x, y: s[s.length - 1].y };
}

export function getTangentAtLength(d: string, distance: number): { x: number; y: number; angle: number } {
  const p = getPointAtLength(d, distance);
  const next = getPointAtLength(d, distance + 0.5);
  const angle = (Math.atan2(next.y - p.y, next.x - p.x) * 180) / Math.PI;
  return { ...p, angle };
}

/* ------------------------------------------------------------------ */
/* Feature #32 — cutPath (a.k.a. sub-path trimming)                   */
/* ------------------------------------------------------------------ */

export function cutPath(d: string, from: number, to: number): string {
  const total = getLength(d);
  const a = Math.max(0, Math.min(from, total));
  const b = Math.max(a, Math.min(to, total));
  const steps = Math.max(2, Math.round(b - a));
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = a + ((b - a) * i) / steps;
    const p = getPointAtLength(d, t);
    parts.push(`${i === 0 ? 'M' : 'L'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`);
  }
  return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/* Feature #34 — warpPath (procedural deformation)                    */
/* ------------------------------------------------------------------ */

export function warpPath(
  d: string,
  fn: (p: { x: number; y: number; length: number }) => { x: number; y: number },
): string {
  const s = samplePath(d);
  return s.map((sp, i) => {
    const w = fn({ x: sp.x, y: sp.y, length: sp.len });
    return `${i === 0 ? 'M' : 'L'}${w.x.toFixed(3)} ${w.y.toFixed(3)}`;
  }).join(' ');
}

/* ------------------------------------------------------------------ */
/* Feature #37 — getBoundingBox                                       */
/* ------------------------------------------------------------------ */

export interface BBox { x: number; y: number; width: number; height: number }

export function getBoundingBox(d: string): BBox {
  const s = samplePath(d);
  if (!s.length) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of s) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/* ------------------------------------------------------------------ */
/* Feature #36 — centerPath                                           */
/* ------------------------------------------------------------------ */

export function centerPath(d: string): string {
  const bb = getBoundingBox(d);
  const cx = bb.x + bb.width / 2;
  const cy = bb.y + bb.height / 2;
  return warpPath(d, ({ x, y }) => ({ x: x - cx, y: y - cy }));
}

/* ------------------------------------------------------------------ */
/* Feature #38 — scalePath                                            */
/* ------------------------------------------------------------------ */

export function scalePath(d: string, sx: number, sy = sx): string {
  return warpPath(d, ({ x, y }) => ({ x: x * sx, y: y * sy }));
}

/* ------------------------------------------------------------------ */
/* Feature #39 — reversePath                                          */
/* ------------------------------------------------------------------ */

export function reversePath(d: string): string {
  const s = samplePath(d);
  const rev = s.slice().reverse();
  return rev
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`)
    .join(' ');
}

/* ------------------------------------------------------------------ */
/* Feature #33 (evolvePath) — animate stroke length                   */
/* ------------------------------------------------------------------ */

/**
 * Returns SVG stroke-dash props that animate a path's stroke from 0 → 100 %
 * according to `progress` (0..1). Feed into `<path>` props directly.
 */
export function evolvePath(
  progress: number,
  d: string,
): { strokeDasharray: number; strokeDashoffset: number } {
  const total = getLength(d);
  const p = Math.max(0, Math.min(1, progress));
  return { strokeDasharray: total, strokeDashoffset: total * (1 - p) };
}

/* ------------------------------------------------------------------ */
/* Feature #34 (interpolatePath) — morph between path A and B         */
/* ------------------------------------------------------------------ */

export function interpolatePath(t: number, a: string, b: string): string {
  const sa = samplePath(a);
  const sb = samplePath(b);
  const n = Math.max(sa.length, sb.length);
  const resample = (samples: Sample[]) => {
    if (samples.length === n) return samples;
    const total = samples[samples.length - 1]?.len ?? 0;
    const out: Sample[] = [];
    for (let i = 0; i < n; i++) {
      const dist = (i / (n - 1)) * total;
      const p = getPointAtLength(samplesToPath(samples), dist);
      out.push({ x: p.x, y: p.y, len: dist, angle: 0 });
    }
    return out;
  };
  const A = resample(sa);
  const B = resample(sb);
  const clamped = Math.max(0, Math.min(1, t));
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = A[i].x + (B[i].x - A[i].x) * clamped;
    const y = A[i].y + (B[i].y - A[i].y) * clamped;
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(3)} ${y.toFixed(3)}`);
  }
  return parts.join(' ');
}

function samplesToPath(s: Sample[]): string {
  return s.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
}

/* ------------------------------------------------------------------ */
/* Feature #40 — createSmoothSvgPath (audio waveforms & the like)     */
/* ------------------------------------------------------------------ */

/**
 * Cardinal-spline smoothing so raw arrays (audio amplitudes, sparklines) turn
 * into fluid SVG paths. Tension 0.5 matches Remotion's audio smoothing curve.
 */
export function createSmoothSvgPath(
  points: Array<{ x: number; y: number }>,
  tension = 0.5,
): string {
  if (points.length < 2) return '';
  const cps: string[] = [`M${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    cps.push(`C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
  }
  return cps.join(' ');
}

/* ------------------------------------------------------------------ */
/* Feature #41 — Primitive shape synthesizers (@remotion/shapes)      */
/* ------------------------------------------------------------------ */

export const shapes = {
  rect: (w: number, h: number, r = 0): string => {
    if (r <= 0) return `M0 0 H${w} V${h} H0 Z`;
    const rr = Math.min(r, w / 2, h / 2);
    return `M${rr} 0 H${w - rr} A${rr} ${rr} 0 0 1 ${w} ${rr} V${h - rr} A${rr} ${rr} 0 0 1 ${w - rr} ${h} H${rr} A${rr} ${rr} 0 0 1 0 ${h - rr} V${rr} A${rr} ${rr} 0 0 1 ${rr} 0 Z`;
  },
  polygon: (points: number, radius: number): string => {
    const step = (Math.PI * 2) / points;
    return Array.from({ length: points }, (_, i) => {
      const a = -Math.PI / 2 + step * i;
      return `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * radius).toFixed(3)} ${(Math.sin(a) * radius).toFixed(3)}`;
    }).join(' ') + ' Z';
  },
  star: (points: number, outer: number, inner: number): string => {
    const step = Math.PI / points;
    return Array.from({ length: points * 2 }, (_, i) => {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + step * i;
      return `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`;
    }).join(' ') + ' Z';
  },
  gear: (teeth: number, outer: number, inner: number, tipRatio = 0.55): string => {
    const step = (Math.PI * 2) / (teeth * 2);
    const out: string[] = [];
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = step * i + step * tipRatio * (i % 2 === 0 ? 0 : 1);
      out.push(`${i === 0 ? 'M' : 'L'}${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`);
    }
    return out.join(' ') + ' Z';
  },
  circle: (radius: number): string =>
    `M${-radius} 0 A${radius} ${radius} 0 1 0 ${radius} 0 A${radius} ${radius} 0 1 0 ${-radius} 0 Z`,
};
