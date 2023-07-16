import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    minify: false,
    outDir: 'build',
    emptyOutDir: false,
    lib: {
      name: '@zd/engine',
      formats: ['cjs', 'es'],
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
    },
  },
});
