import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@components', replacement: resolve(__dirname, 'src/components') },
      { find: '@hooks',       replacement: resolve(__dirname, 'src/hooks') },
      { find: /^@types$/,    replacement: resolve(__dirname, 'src/types.ts') },
    ],
  },
  server: {
    host: true,
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://host.docker.internal:3000',
        changeOrigin: true,
      },
    },
  },
})
