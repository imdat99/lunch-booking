import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // eslint({
    //   lintOnStart: true,
    // }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Happy Lunch',
        short_name: 'Happy Lunch',
        description: 'Booking and Share Lunch Money',
        background_color: '#FFF',
        theme_color: '#FFF',
        start_url: '/',
        icons: [
          {
            src: '/favicon.png',
            size: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
    },
  },
})
