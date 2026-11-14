import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // `/` is the AstroBarry landing page and `/game.html` is the React game.
  // Both must be production entries or a static deploy would lose the game.
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        game: resolve(root, 'game.html'),
      },
    },
  },
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
})
