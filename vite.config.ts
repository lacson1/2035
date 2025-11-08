import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA temporarily disabled for deployment
  ],
  server: {
    port: 5173,
    host: true,
    open: true, // Auto-open browser
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'recharts'],
          utils: ['zod'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to reduce warnings
  },
  // Better error messages
  clearScreen: false,
})

