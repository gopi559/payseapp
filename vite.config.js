import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
  },
  server: {
    proxy: {
      '/webcust': {
        target: 'https://backend.api-innovitegra.in',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.log('[proxy error]', err.message)
          })
        },
      },
    },
  },
})
