import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project site lives at /blncvr-portfolio/
// Local: http://localhost:5173/blncvr-portfolio/
export default defineConfig({
  base: '/blncvr-portfolio/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
