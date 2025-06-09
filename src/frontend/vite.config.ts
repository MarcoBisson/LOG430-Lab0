import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  server: { port: 3001 },
  build: { outDir: '../dist/frontend' },
  resolve: {
    alias: { '@': '/frontend/src' }
  }
});