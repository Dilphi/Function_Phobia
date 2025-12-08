// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // слушать все интерфейсы
    allowedHosts: [
      '49d85e957bfc.ngrok-free.app',
      // или для любых поддоменов ngrok:
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})