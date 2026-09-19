import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/learningpack/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/learningpack/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/learningpack/, ''),
      },
    },
  },
})
