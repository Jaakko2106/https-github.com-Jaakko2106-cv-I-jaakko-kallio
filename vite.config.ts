import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: [
            'uusomakuva.png',
            'Asiakirja20241229_184155.pdf',
          ],
          manifest: {
            id: '/',
            name: 'Jaakko CV',
            short_name: 'JaakkoCV',
            description: 'Jaakko Kallio - Interactive CV',
            theme_color: '#4f46e5',
            background_color: '#f1f0f6',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/uusomakuva.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/uusomakuva.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2,ttf,webp,avif,pdf}'],
            navigateFallback: '/index.html',
            navigateFallbackDenylist: [/^\/api\//],
            cleanupOutdatedCaches: true,
            clientsClaim: true,
            skipWaiting: true,
            runtimeCaching: [
              // 1. Google Fonts stylesheets (CSS)
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'google-fonts-stylesheets',
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 2. Google Fonts webfont files (.woff2, .woff)
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-webfonts',
                  expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 3. CDN scripts and styles (Tailwind CDN, AI Studio CDN, jsDelivr, Cloudflare CDN)
              {
                urlPattern: /^https:\/\/(?:cdn\.tailwindcss\.com|aistudiocdn\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'cdn-scripts-and-styles',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 4. Remote content images & avatars (Wikimedia, Google User Content, Placehold.co, Unsplash)
              {
                urlPattern: /^https:\/\/(?:upload\.wikimedia\.org|lh3\.googleusercontent\.com|placehold\.co|images\.unsplash\.com|i\.imgur\.com)\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'remote-images-cache',
                  expiration: {
                    maxEntries: 150,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                    purgeOnQuotaError: true,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 5. Generic static images (JPG, PNG, WebP, SVG, AVIF, GIF, ICO)
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'static-images-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 6. Media video streams & sample videos with Range Requests for smooth playback offline
              {
                urlPattern: /^https:\/\/commondatastorage\.googleapis\.com\/.*|\.(?:mp4|webm|ogg|mov)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'media-videos-cache',
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
                    purgeOnQuotaError: true,
                  },
                  rangeRequests: true,
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 7. Static document downloads (.pdf)
              {
                urlPattern: /\.(?:pdf)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'pdf-documents-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 8. Firebase Firestore API (with networkTimeoutSeconds to fallback swiftly to cached docs when offline)
              {
                urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firebase-firestore-cache',
                  networkTimeoutSeconds: 3,
                  expiration: {
                    maxEntries: 150,
                    maxAgeSeconds: 60 * 60 * 24 * 14, // 2 weeks
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // 9. Firebase Auth & Identity Tokens (offline authentication state continuity)
              {
                urlPattern: /^https:\/\/(?:identitytoolkit|securetoken)\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firebase-auth-cache',
                  networkTimeoutSeconds: 3,
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 1, // 1 day
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          },
          devOptions: {
            enabled: true,
            type: 'module',
          },
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

