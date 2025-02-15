
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
      entry: {
        'ExpressionWebcomponent': 'src/index.ts',
        'expression-webcomponent': 'src/expression-webcomponent.ts'
      },
      name: 'ExpressionWebcomponent',
      formats: ['es'],
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
