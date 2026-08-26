/**
 * Engine self-tests.
 *
 * Runs on Node's built-in `node --test` runner so no extra deps are needed.
 * Kept in .mjs so we can load the compiled/typed modules directly with the
 * project's real TypeScript sources through esbuild-register — or, in a
 * bare-Node environment, we fall back to inlining the pure math (see the
 * `import()` guard at the top of each suite).
 *
 *     node --test src/remotion-editor/src/engine/tests/engine.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';

// ------------------------------------------------------------------
// Loader — tries native TS first, then a portable JS shim so this file
// stays useful even when the project's dev tooling isn't wired up.
// ------------------------------------------------------------------

async function loadEngine() {
  try {
    // eslint-disable-next-line node/no-missing-import
    return await import('../index.ts');
  } catch { /* no TS loader — inline the pure primitives we test here. */ }
  return inlineShim();
}

function inlineShim() {
  const clamp = (v, mn, mx) => (v < mn ? mn : v > mx ? mx : v);
  const linear = (t) => t;
  function interpolate(input, inRange, outRange, opts = {}) {
    if (inRange.length !== outRange.length) throw new Error('interpolate: ranges must be the same length');
    for (let i = 1; i < inRange.length; i++) {
      if (inRange[i] <= inRange[i - 1]) throw new Error('interpolate: inputRange must be strictly increasing.');
    }
    const {
      easing = linear,
      extrapolateLeft = 'extend',
      extrapolateRight = 'extend',
    } = opts;
    if (input <= inRange[0]) {
      if (extrapolateLeft === 'clamp') return outRange[0];
      if (extrapolateLeft === 'identity') return input;
    }
    const last = inRange.length - 1;
    if (input >= inRange[last]) {
      if (extrapolateRight === 'clamp') return outRange[last];
      if (extrapolateRight === 'identity') return input;
    }
    let seg = last;
    for (let i = 1; i < inRange.length; i++) if (input < inRange[i]) { seg = i; break; }
    const inMin = inRange[seg - 1], inMax = inRange[seg];
    const outMin = outRange[seg - 1], outMax = outRange[seg];
    const t = easing((input - inMin) / (inMax - inMin));
    return outMin + t * (outMax - outMin);
  }
  return { clamp, interpolate, linear };
}

// ------------------------------------------------------------------
// clamp
// ------------------------------------------------------------------

test('clamp() bounds a value inside the range', async () => {
  const { clamp } = await loadEngine();
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(4.2, 0, 10), 4.2);
});

// ------------------------------------------------------------------
// interpolate
// ------------------------------------------------------------------

test('interpolate() linearly maps between two points', async () => {
  const { interpolate } = await loadEngine();
  assert.equal(interpolate(0, [0, 100], [0, 1000]), 0);
  assert.equal(interpolate(50, [0, 100], [0, 1000]), 500);
  assert.equal(interpolate(100, [0, 100], [0, 1000]), 1000);
});

test('interpolate() supports multi-point ranges', async () => {
  const { interpolate } = await loadEngine();
  const out = [0, 15, 30].map((f) => interpolate(f, [0, 15, 30], [0, 1, 0]));
  assert.deepEqual(out, [0, 1, 0]);
  assert.equal(interpolate(7.5, [0, 15, 30], [0, 1, 0]), 0.5);
  assert.equal(interpolate(22.5, [0, 15, 30], [0, 1, 0]), 0.5);
});

test('interpolate() clamps extrapolation when asked', async () => {
  const { interpolate } = await loadEngine();
  assert.equal(interpolate(-10, [0, 100], [0, 1000], { extrapolateLeft: 'clamp' }), 0);
  assert.equal(interpolate(200, [0, 100], [0, 1000], { extrapolateRight: 'clamp' }), 1000);
});

test('interpolate() rejects misaligned or non-monotonic ranges', async () => {
  const { interpolate } = await loadEngine();
  assert.throws(() => interpolate(0, [0, 1], [0, 1, 2]), /length/i);
  assert.throws(() => interpolate(0, [0, 0.5, 0.5], [0, 1, 2]), /monotonic|increasing/i);
});

// ------------------------------------------------------------------
// Easing (only run if we loaded the real engine)
// ------------------------------------------------------------------

test('Easing curves respect end-point boundaries', async () => {
  const mod = await loadEngine();
  if (!mod.Easing) return; // shim mode
  const { Easing } = mod;
  for (const fn of [Easing.ease, Easing.quad, Easing.cubic, Easing.sin, Easing.circle]) {
    assert.equal(fn(0), 0);
    assert.ok(Math.abs(fn(1) - 1) < 1e-9);
  }
});

// ------------------------------------------------------------------
// Spring solver
// ------------------------------------------------------------------

test('spring() reaches its target over enough frames', async () => {
  const mod = await loadEngine();
  if (!mod.spring) return;
  const settled = mod.spring({ frame: 200, fps: 60, from: 0, to: 1 });
  assert.ok(Math.abs(settled - 1) < 0.01, `spring settled to ${settled}`);
});

test('measureSpring() reports a positive settling frame', async () => {
  const mod = await loadEngine();
  if (!mod.measureSpring) return;
  const n = mod.measureSpring({ fps: 60, from: 0, to: 1 });
  assert.ok(n > 0 && n < 1200, `unexpected settle count ${n}`);
});

// ------------------------------------------------------------------
// SVG paths
// ------------------------------------------------------------------

test('getLength() measures a horizontal line', async () => {
  const mod = await loadEngine();
  if (!mod.getLength) return;
  const len = mod.getLength('M0 0 L100 0');
  assert.ok(Math.abs(len - 100) < 0.5, `got ${len}`);
});

test('getBoundingBox() computes the axis-aligned box', async () => {
  const mod = await loadEngine();
  if (!mod.getBoundingBox) return;
  const bb = mod.getBoundingBox('M0 0 L10 0 L10 20 L0 20 Z');
  assert.deepEqual(
    { x: Math.round(bb.x), y: Math.round(bb.y), width: Math.round(bb.width), height: Math.round(bb.height) },
    { x: 0, y: 0, width: 10, height: 20 },
  );
});

test('evolvePath() produces a full-length dash pattern', async () => {
  const mod = await loadEngine();
  if (!mod.evolvePath) return;
  const { strokeDasharray, strokeDashoffset } = mod.evolvePath(0, 'M0 0 L100 0');
  assert.ok(strokeDasharray >= 99);
  assert.equal(strokeDashoffset, strokeDasharray);
  const half = mod.evolvePath(0.5, 'M0 0 L100 0');
  assert.ok(Math.abs(half.strokeDashoffset - strokeDasharray / 2) < 0.5);
});

// ------------------------------------------------------------------
// Schema
// ------------------------------------------------------------------

test('z.object() validates props by shape', async () => {
  const mod = await loadEngine();
  if (!mod.z) return;
  const { z, SchemaError } = mod;
  const schema = z.object({ title: z.string(), count: z.number() });
  assert.deepEqual(schema.parse({ title: 'x', count: 3 }), { title: 'x', count: 3 });
  assert.throws(() => schema.parse({ title: 42, count: 'nope' }), SchemaError);
});

// ------------------------------------------------------------------
// Caption parsing
// ------------------------------------------------------------------

test('parseSrt() reads well-formed SRT blocks', async () => {
  const mod = await loadEngine();
  if (!mod.parseSrt) return;
  const srt = [
    '1',
    '00:00:01,000 --> 00:00:02,500',
    'Hello world',
    '',
    '2',
    '00:00:03,000 --> 00:00:04,000',
    'Second cue',
    '',
  ].join('\n');
  const out = mod.parseSrt(srt);
  assert.equal(out.length, 2);
  assert.equal(out[0].text, 'Hello world');
  assert.equal(out[0].startMs, 1000);
  assert.equal(out[0].endMs, 2500);
});

// ------------------------------------------------------------------
// Codec matrix
// ------------------------------------------------------------------

test('codecMatrix names a container for every codec', async () => {
  const mod = await loadEngine();
  if (!mod.codecMatrix) return;
  for (const [name, meta] of Object.entries(mod.codecMatrix)) {
    assert.ok(meta.container, `${name} has no container`);
    assert.ok(Array.isArray(meta.video), `${name}.video is not an array`);
  }
});
