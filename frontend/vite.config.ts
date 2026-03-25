import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    'process.env.VITE_BACKEND_PROD_API_URL': JSON.stringify(process.env.VITE_BACKEND_PROD_API_URL),
    'process.env.VITE_API_SECRET_KEY': JSON.stringify(process.env.VITE_API_SECRET_KEY),
    'process.env.VITE_INTERNAL_PORT': JSON.stringify(process.env.VITE_INTERNAL_PORT),
    'process.env.VITE_BACKEND_DEV_API_URL': JSON.stringify(process.env.VITE_BACKEND_DEV_API_URL),
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    host: true,
    port: parseInt(process.env.VITE_INTERNAL_PORT || '5173'),
    strictPort: true,
    hmr: {
      host: 'localhost',
    },
    // watch: {
    //   followSymlinks: false,
    // },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
});