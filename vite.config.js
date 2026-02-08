import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        fitness: resolve(__dirname, 'fitness.html'),
        travel: resolve(__dirname, 'travel.html'),
        events: resolve(__dirname, 'events.html'),
        memories: resolve(__dirname, 'memories.html'),
        indy: resolve(__dirname, 'indy.html'),
      },
    },
  },
})
