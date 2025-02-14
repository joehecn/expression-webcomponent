
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['/sb-preview/runtime.js'],
  server: {
    port: 8080,
    open: true,
    preTransformRequests: false,
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'expression-webcomponent',
      formats: ['es'],
      fileName: 'expression-webcomponent',
    },
    rollupOptions: {
      external: ['mathjs', 'penner', 'pixi-viewport', 'pixi.js'],
      output: {
        globals: {
          'mathjs': 'mathjs',
          'penner': 'penner',
          'pixi-viewport': 'pixi-viewport',
          'pixi.js': 'pixi.js',
        },
      },
    },
  },
})
