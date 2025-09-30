import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.riskthinking.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy: any) => {
          proxy.on('proxyReq', (proxyReq: any) => {
            // Add the authorization header to the proxied request
            proxyReq.setHeader('Authorization', 'Bearer zbLnoZJaplE1jbyXQzF2XZVE2fY7aJYg');
          });
        },
      },
    },
  },
})
