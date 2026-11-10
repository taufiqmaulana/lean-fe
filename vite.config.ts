import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const src = `${projectRoot}src`

export default defineConfig({
  root: 'src/lib',
  build: { outDir: `${projectRoot}dist`, emptyOutDir: true },
  plugins: [
    // Must be first: it annotates JSX before other plugins transform it
    devtools({
      // Hold Shift+Alt+Ctrl/Cmd and click an element to open its source in the editor
      injectSource: { enabled: true },
      // Browser console → terminal ([Client]) and server console → browser ([Server])
      consolePiping: { enabled: true, levels: ['log', 'info', 'warn', 'error', 'debug'] },
      // Strip @tanstack/*-devtools imports and their JSX from production builds
      removeDevtoolsOnBuild: true,
    }),
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
