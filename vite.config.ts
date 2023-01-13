import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // eslint({
    //   lintOnStart: true,
    // }),
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
    },
  },
})
