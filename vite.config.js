import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

const BASE = process.env.GITHUB_PAGES ? '/react_RIP/' : '/'
const isTauri = !!process.env.TAURI_ENV_PLATFORM

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    ...(!isTauri ? [mkcert()] : []),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Система расчёта массы экзопланет',
        short_name: 'Экзопланеты',
        start_url: BASE,
        display: 'standalone',
        background_color: '#0a0a1a',
        theme_color: '#4facfe',
        orientation: 'portrait-primary',
        icons: [
          { src: '/placeholder-service.svg', type: 'image/svg+xml', sizes: '192x192', purpose: 'any' },
          { src: '/placeholder-service.svg', type: 'image/svg+xml', sizes: '512x512', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    https: !isTauri,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})



