import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
})