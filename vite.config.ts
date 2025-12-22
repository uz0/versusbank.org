import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { copyFileSync, existsSync, writeFileSync } from 'fs'
import { markdownInject } from './src/vite-plugin-md-inject'

export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Optimize for PWA
    assetsInlineLimit: 4096,
    minify: 'esbuild',
    // Enable SSG generation
    ssrEmitAssets: true,
    reportCompressedSize: false
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    // Handle SPA routing
    historyApiFallback: true
  },
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'js/workers/[name].[hash].js'
      }
    }
  },
  plugins: [
    // Inject README.md content directly into index.html at build time
    markdownInject({
      markdownPath: 'README.md',
      targetId: 'content',
      contentClass: 'retro-content'
    }),

    // Custom plugin to copy CNAME and robots.txt to docs
    {
      name: 'copy-cname-robots',
      closeBundle() {
        const outDir = 'docs'

        // Copy CNAME if it exists in root, otherwise create it
        const cnameSource = resolve(__dirname, 'CNAME')
        const cnameDest = resolve(__dirname, outDir, 'CNAME')

        if (existsSync(cnameSource)) {
          copyFileSync(cnameSource, cnameDest)
        } else {
          // Create CNAME with default content
          writeFileSync(cnameDest, 'versusbank.org\n')
        }

        // Copy robots.txt from src
        const robotsSource = resolve(__dirname, 'src', 'robots.txt')
        const robotsDest = resolve(__dirname, outDir, 'robots.txt')

        if (existsSync(robotsSource)) {
          copyFileSync(robotsSource, robotsDest)
        }

        console.log('✓ Copied CNAME and robots.txt to docs/')
      }
    },
    // PWA Plugin with comprehensive offline support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon-16.png',
        'icons/icon-32.png',
        'icons/icon-144.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'favicon.ico',
        'robots.txt'
      ],
      manifest: {
        name: 'VersusBank - 16-bit Financial Game',
        short_name: 'VersusBank',
        description: 'Experience 16-bit retro gaming with modern financial mechanics - Fully offline PWA',
        theme_color: '#0f0f1e',
        background_color: '#0f0f1e',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-16.png',
            sizes: '16x16',
            type: 'image/png'
          },
          {
            src: 'icons/icon-32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Start Game',
            short_name: 'Play',
            description: 'Start a new game session',
            url: '/?action=newgame',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          }
        ],
        categories: ['games', 'entertainment']
      },
      // Workbox configuration for offline-first
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,wav,mp3,json}'
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        offlineGoogleAnalytics: false
      },
      strategies: 'generateSW'
    })
  ],
  optimizeDeps: {
    include: []
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  define: {
    // Environment variables
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
})