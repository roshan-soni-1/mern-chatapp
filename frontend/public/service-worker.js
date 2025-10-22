import { VitePWA } from 'vite-plugin-pwa';

export default VitePWA({
  registerType: 'autoUpdate',
  srcDir: 'src',
  filename: 'sw.js', // output service worker
  strategies: 'injectManifest', // allow custom SW code
  manifest: {
    name: 'Talkly',
    short_name: 'Talkly',
    start_url: '/',
    display: 'standalone',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,jpg,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https?.*\.(?:js|css|html|png|jpg|svg)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
});