import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  preview: {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate'
    }
  }
})
