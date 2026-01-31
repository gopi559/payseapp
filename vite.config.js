import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Vite loads .env from project ROOT only (not from src/)
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = (env.VITE_API_BASE_URL || 'https://backend.api-innovitegra.in').trim()

  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
    },
    server: {
      proxy: {
        '/login': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
          timeout: 60000,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('[proxy /login error]', err.message)
            })
          },
        },
        '/webcust': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
          timeout: 60000,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('[proxy error]', err.message)
            })
          },
        },
      },
    },
  }
})
