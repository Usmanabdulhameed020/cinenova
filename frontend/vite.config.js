import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'Cinenova.png'],
      manifest: {
        name: 'CineNova',
        short_name: 'CineNova',
        description: 'CineNova Movie Stream App',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/Cinenova.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Cinenova.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Cinenova.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})