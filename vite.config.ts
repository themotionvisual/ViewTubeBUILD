import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
      },
      '/billing': {
        target: 'http://localhost:3000',
        changeOrigin: true,
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
})
