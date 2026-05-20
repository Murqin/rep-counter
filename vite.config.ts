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
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'screenshots/1.png', 'screenshots/2.png', 'screenshots/3.png', 'screenshots/4.png', 'screenshots/desktop.jpg'],
      manifest: {
        name: 'Rep Counter',
        short_name: 'RepCount',
        description: 'Track your workout reps and rest periods with a clean, distraction-free interface.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/1.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Rep Counter - Active Workout'
          },
          {
            src: '/screenshots/2.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Rep Counter - Timer Rest Period'
          },
          {
            src: '/screenshots/3.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Rep Counter - Success Screen'
          },
          {
            src: '/screenshots/4.png',
            sizes: '1290x2220',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Rep Counter - Preset Manager'
          },
          {
            src: '/screenshots/desktop.jpg',
            sizes: '1024x1024',
            type: 'image/jpeg',
            form_factor: 'wide',
            label: 'Rep Counter - Desktop View'
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    conditions: ['browser', 'svelte']
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
