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

// https://vite.dev/config/
// NOTE: Vite 8 uses Rolldown (not Rollup/esbuild) as the bundler, so chunking
// tuning uses Rolldown-native options (`advancedChunks`).
export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), stripDebugConsole()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Heavy analytics views are lazy-loaded now, so a few large-but-deferred
    // chunks are expected and shouldn't spam the build log.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split large, stable third-party libraries into their own long-lived
        // chunks so they cache independently of app code and across routes.
        advancedChunks: {
          groups: [
            { name: 'react-vendor', test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|react-is|scheduler)[\\/]/ },
            { name: 'recharts', test: /[\\/]node_modules[\\/]recharts[\\/]/ },
            { name: 'google-charts', test: /[\\/]node_modules[\\/]react-google-charts[\\/]/ },
            { name: 'motion', test: /[\\/]node_modules[\\/]framer-motion[\\/]/ },
            { name: 'bg-removal', test: /[\\/]node_modules[\\/]@imgly[\\/]background-removal[\\/]/ },
            { name: 'genai', test: /[\\/]node_modules[\\/]@google[\\/]genai[\\/]/ },
            { name: 'jszip', test: /[\\/]node_modules[\\/]jszip[\\/]/ },
          ],
        },
      },
    },
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
