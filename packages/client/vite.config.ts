import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 8080,
    open: true,
  },
  build: {
    outDir: '../build',
  },
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/assets',
    },
  },
});
