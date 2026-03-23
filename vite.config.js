import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Vite loads .env from project ROOT only (not from src/)
  const env = loadEnv(mode, process.cwd(), '')
  const rawApiBase = (env.VITE_API_BASE_URL || '').trim()
  let proxyTarget = 'http://localhost'

  try {
    const parsed = new URL(rawApiBase)
    proxyTarget = `${parsed.protocol}//${parsed.host}`
  } catch {
    proxyTarget = rawApiBase.replace(/\/webcust\/?$/i, '')
  }

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
          target: proxyTarget,
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
          target: proxyTarget,
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
