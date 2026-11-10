import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const src = `${projectRoot}src`

export default defineConfig({
  root: 'src/lib',
  build: { outDir: `${projectRoot}dist`, emptyOutDir: true },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: `${src}/routes`,
      generatedRouteTree: `${src}/lib/routeTree.gen.ts`,
      tmpDir: `${projectRoot}node_modules/.tanstack`,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': src },
  },
})
