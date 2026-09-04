// vite.config.ts

import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fg from 'fast-glob';

const pageEntries = fg
  .sync('src/pages/*/index.html')
  .reduce<Record<string, string>>((acc, file) => {
    const name = file.split('/')[2];

    acc[name] = resolve(import.meta.dirname, file);

    return acc;
  }, {});

export default defineConfig({
  root: '.',

  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ...pageEntries,
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});