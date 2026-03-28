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
    host: true, // Listen on all network interfaces (0.0.0.0) so Docker can map the port
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Ensures hot-reloading detects file saves reliably through the Docker volume
    },
  },
})
