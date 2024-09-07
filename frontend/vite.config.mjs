import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import IstanbulPlugin from 'vite-plugin-istanbul'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    IstanbulPlugin({
      cypress: true,
      include: ['src/*'],
      exclude: ['node_modules', 'cypress'],
      extension: ['.js', '.ts', '.vue'],
      requireEnv: false // Do not require environment variable for instrumentation
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext' // Ensure modern syntax support
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
