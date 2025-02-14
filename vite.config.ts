
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['/sb-preview/runtime.js'],
  server: {
    port: 8080,
    open: true,
    preTransformRequests: false,
  },
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/expression-webcomponent.ts',
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
  plugins: [
    dts(),
  ],
})
