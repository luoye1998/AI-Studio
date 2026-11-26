import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 相对 base：Electron file:// 加载与静态托管都能用
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5180,
    host: '127.0.0.1',
  },
});
