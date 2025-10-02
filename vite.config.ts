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
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Aumenta o limite para 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor libraries em chunks menores
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-accordion'],
          supabase: ['@supabase/supabase-js'],
          utils: ['lucide-react', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  preview: {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate'
    }
  }
})
