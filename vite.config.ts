import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
    svelte()
  ],
  resolve: {
    conditions: ['browser', 'svelte']
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
