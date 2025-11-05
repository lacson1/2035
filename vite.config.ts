import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true, // Auto-open browser
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
  },
  // Better error messages
  clearScreen: false,
})

