import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.png'],
      manifest: {
        short_name: 'Presence',
        name: 'Presence',
        icons: [
          {
            "src": "app-icon.png",
            "type": "image/png",
            "sizes": "192x192"
          }
        ],
        start_url: '.',
        display: 'standalone',
        orientation: "portrait"
      },
    }),
  ],
  css: {
    postcss: './postcss.config.js'
  }
});