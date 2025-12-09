import { defineConfig } from 'vite'
import { builtinModules } from 'module'

export default defineConfig({
  build: {
    target: 'node18',
    outDir: '.vite/build',
    emptyOutDir: false,
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'], // IMPORTANT
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`)
      ]
    }
  }
})
