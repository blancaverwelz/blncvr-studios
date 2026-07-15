import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project site lives at /blncvr-studios/
// Local: http://localhost:5173/blncvr-studios/
export default defineConfig({
  base: '/blncvr-studios/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
