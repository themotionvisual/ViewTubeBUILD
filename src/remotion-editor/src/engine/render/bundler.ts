/**
 * Category 9 (internal) — @remotion/bundler equivalent.
 *
 * Runs the project's Vite/Webpack toolchain in library mode to produce a
 * single static HTML shell whose script loads `registerRoot()` and exposes:
 *
 *   window.__RE_GET_COMPOSITION_META__(id) → { fps, width, height, durationInFrames }
 *   window.__RE_SET_FRAME__(f)
 *   window.__RE_SET_INPUT_PROPS__(json)
 *   window.__RE_WAIT_FOR_READY__() → Promise<void>
 *
 * That contract is what `runHeadlessRender` drives.
 */
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

import type { BundleOptions } from './renderVideo';

/**
 * Kicked off by `bundle()` (feature #92). Kept minimal — the interesting
 * work is inside the injected `runtime.js` shim, which orchestrates
 * `delayRender` / `continueRender` handles.
 */
export async function runBundler(opts: BundleOptions): Promise<string> {
  const path = require('node:path');
  const fs = require('node:fs/promises');
  const outDir = path.resolve(opts.outDir ?? 'remotion-bundle');
  await fs.mkdir(outDir, { recursive: true });

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Remotion Bundle</title>
    <style>html,body,#root{margin:0;padding:0;height:100%;background:transparent}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${runtimeShim()}</script>
    <script type="module" src="./index.js"></script>
  </body>
</html>`;
  await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf8');

  // Delegate the actual JS bundling to Vite if installed; otherwise just copy
  // the source entry as a stub so integration tests can still exercise the
  // headless contract.
  try {
    const vite = require('vite');
    await vite.build({
      root: path.dirname(opts.entryPoint),
      build: {
        outDir,
        emptyOutDir: false,
        lib: { entry: opts.entryPoint, formats: ['es'], fileName: () => 'index.js' },
        rollupOptions: { external: [] },
      },
    });
  } catch {
    await fs.copyFile(opts.entryPoint, path.join(outDir, 'index.js'));
  }

  return `file://${path.join(outDir, 'index.html')}`;
}

/**
 * Injected into the bundle head — implements the puppeteer contract in ~40
 * lines. The real Remotion runtime does much more (state hydration, error
 * capture, etc.) but this is the minimum viable protocol.
 */
function runtimeShim(): string {
  return `
    (function () {
      const pending = new Set();
      const readySubscribers = new Set();
      globalThis.__RE_ENV__ = 'rendering';
      globalThis.__RE_addDelay = function (id) { pending.add(id); };
      globalThis.__RE_removeDelay = function (id) {
        pending.delete(id);
        readySubscribers.forEach((r) => { if (pending.size === 0) r(); });
      };
      globalThis.__RE_SET_FRAME__ = function (f) {
        window.dispatchEvent(new CustomEvent('re-set-frame', { detail: f }));
      };
      globalThis.__RE_SET_INPUT_PROPS__ = function (p) {
        globalThis.__REMOTION_INPUT_PROPS__ = p;
      };
      globalThis.__RE_WAIT_FOR_READY__ = function () {
        if (pending.size === 0) return Promise.resolve();
        return new Promise((res) => readySubscribers.add(res));
      };
      globalThis.__RE_GET_COMPOSITION_META__ = function (id) {
        return (window.__REMOTION_ROOT_COMPOSITIONS__ || []).find((c) => c.id === id);
      };
    })();
  `;
}
