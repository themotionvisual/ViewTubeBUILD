import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * Build-only plugin that neutralises developer-noise logging
 * (`console.log` / `console.info` / `console.debug`) in production bundles
 * while deliberately preserving `console.warn` / `console.error` so real
 * diagnostics still surface. Each call is rewritten to an inert no-op
 * (`(()=>{})(...)`), which is syntactically valid in both statement and
 * expression positions. Only project source is touched — never dependencies.
 */
function stripDebugConsole(): Plugin {
  const CALL = /\bconsole\s*\.\s*(log|info|debug)\b/g
  return {
    name: 'vt-strip-debug-console',
    apply: 'build',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('/node_modules/')) return null
      if (!/\.[cm]?[jt]sx?$/.test(id)) return null
      if (!CALL.test(code)) return null
      CALL.lastIndex = 0
      return { code: code.replace(CALL, '(()=>{})'), map: null }
    },
  }
}

/**
 * `flag-icons` ships CSS with two rules per country — `.fi-xx` (4x3
 * background image) AND `.fi-xx.fis` (1x1 square background image) — plus
 * both SVG variants for all ~250 countries. The app only ever uses
 * `<span class="fi fi-XX">` (4x3), never `.fis`, so shipping the square
 * variant is pure waste: 270+ unused `.fis` CSS rules bloat the analytics
 * bundle, and Vite's CSS asset-URL scan drags every 1x1 SVG into
 * `dist/assets/` even though nothing renders it. Strip the square rules
 * before Vite processes the CSS so the `url(../flags/1x1/…)` references
 * disappear and the square SVGs never get emitted.
 */
function trimFlagIconsCss(): Plugin {
  const SQUARE_RULE = /,\.fi-[a-z-]+\.fis\{background-image:url\([^)]+1x1\/[^)]+\)\}/g
  const SQUARE_RULE_STANDALONE = /\.fi-[a-z-]+\.fis\{background-image:url\([^)]+1x1\/[^)]+\)\}/g
  return {
    name: 'vt-trim-flag-icons-css',
    apply: 'build',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('flag-icons') || !id.endsWith('.css')) return null
      const trimmed = code
        .replace(SQUARE_RULE, '')
        .replace(SQUARE_RULE_STANDALONE, '')
      if (trimmed === code) return null
      return { code: trimmed, map: null }
    },
  }
}

// https://vite.dev/config/
// NOTE: Vite 8 uses Rolldown (not Rollup/esbuild) as the bundler, so chunking
// tuning uses Rolldown-native options (`advancedChunks`).
export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), stripDebugConsole(), trimFlagIconsCss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Target modern browsers so we don't ship a decade of syntax polyfills to
    // every user; Vercel's default browserslist matches this.
    target: 'es2022',
    cssCodeSplit: true,
    // We deliberately keep sourcemaps off in prod — they double the transfer
    // and were previously the largest slice of assets/ on Vercel.
    sourcemap: false,
    // Heavy analytics views are lazy-loaded now, so a few large-but-deferred
    // chunks are expected and shouldn't spam the build log.
    chunkSizeWarningLimit: 1500,
    // Vite eagerly `<link modulepreload>`s every chunk reachable via static
    // imports from the entry — even ones that only a lazy route actually
    // needs. On a data-heavy app that costs first-paint ~500 kB gzip of chunks
    // (recharts, motion, genai, etc.) most visitors never look at. Filter the
    // preload set down to the true "used on nearly every route" chunks and
    // let the browser fetch the rest on demand when the route resolves.
    modulePreload: {
      polyfill: true,
      resolveDependencies: (_url, deps) => deps.filter((dep) => {
        // Skip heavy libraries that only specific routes actually mount.
        // Route-splitting still applies — Vite still emits the chunk, we just
        // don't tell the browser to fetch it up-front.
        return !/recharts|motion|genai|jszip|bg-removal|google-charts|VtSyncDataVisualsToolbox|GraphsPageCharts|Editor|PerformanceHub|AIBrainCommandInterface|NativeUIKit/i.test(dep)
      }),
    },
    rollupOptions: {
      output: {
        // Split large, stable third-party libraries into their own long-lived
        // chunks so they cache independently of app code and across routes.
        // Priority: put the most first-paint-critical groups earliest so their
        // rule matches before the catch-all `vendor` group below.
        advancedChunks: {
          groups: [
            { name: 'react-vendor', test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|react-is|scheduler)[\\/]/ },
            { name: 'recharts', test: /[\\/]node_modules[\\/]recharts[\\/]/ },
            { name: 'google-charts', test: /[\\/]node_modules[\\/]react-google-charts[\\/]/ },
            { name: 'motion', test: /[\\/]node_modules[\\/]framer-motion[\\/]/ },
            { name: 'bg-removal', test: /[\\/]node_modules[\\/]@imgly[\\/]background-removal[\\/]/ },
            { name: 'genai', test: /[\\/]node_modules[\\/]@google[\\/]genai[\\/]/ },
            { name: 'jszip', test: /[\\/]node_modules[\\/]jszip[\\/]/ },
            // Splitting Radix out of the shared `ui` chunk lets routes that
            // don't use dialogs/menus (the entire Editor surface, the render
            // benches) skip 70+ kB gzip on first paint.
            { name: 'radix', test: /[\\/]node_modules[\\/]@radix-ui[\\/]/ },
            // dnd-kit is only used by editor/timeline surfaces — never on the
            // dashboard or analytics landing pages.
            { name: 'dnd-kit', test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/ },
            // lucide-react ships ~1kb per icon; keeping it in its own long-
            // lived chunk means an icon change doesn't invalidate app code.
            { name: 'lucide', test: /[\\/]node_modules[\\/]lucide-react[\\/]/ },
          ],
        },
      },
    },
  },
  // Pre-bundle the heavy dependency graphs used on first paint so cold dev
  // starts don't dogpile Vite's on-demand transformer with hundreds of
  // Radix/lucide primitives at once.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'lucide-react',
    ],
  },
  esbuild: {
    // Strip legal comments; every kilobyte counts on mobile.
    legalComments: 'none',
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    host: true, // Listen on all network interfaces (0.0.0.0) so Docker can map the port
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/vt-e1/render-svg-frames': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/vt-e1/render': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/vt-e1/ai': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
      '/billing': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173,
    },
    watch: {
      usePolling: true, // Ensures hot-reloading detects file saves reliably through the Docker volume
    },
  },
}))
