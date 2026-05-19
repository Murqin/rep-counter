import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'icon-512.png', 'screenshots/1.png', 'screenshots/2.png', 'screenshots/3.png', 'screenshots/4.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/sw.js$/]
      },
      manifest: {
        id: '/',
        name: 'Rep Counter',
        short_name: 'RepCounter',
        description: 'A minimalist, AMOLED-first Rep Counter PWA designed for peak performance and zero distractions.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        categories: ['fitness', 'health', 'productivity'],
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/1.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Counter Screen'
          },
          {
            src: 'screenshots/2.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Settings Screen'
          },
          {
            src: 'screenshots/3.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Rest Timer'
          },
          {
            src: 'screenshots/4.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Success Screen'
          }
        ],
        shortcuts: [
          {
            name: 'Quick Start',
            url: '/',
            icons: [{ src: '/icon-512.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  resolve: {
    conditions: ['browser', 'svelte']
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
