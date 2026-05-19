import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker for PWA
registerSW({ immediate: true })

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
