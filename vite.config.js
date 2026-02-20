import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base для GitHub Pages — должен совпадать с путём в URL (имя репозитория)
const BASE = process.env.GITHUB_PAGES ? '/react_RIP/' : '/'

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
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
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})



