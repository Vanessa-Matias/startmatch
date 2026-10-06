// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import fg from 'fast-glob';

const pageEntries = fg
  .sync('src/pages/*/index.html')
  .reduce<Record<string, string>>((acc, file) => {
    const name = file.split('/')[2];

    acc[name] = resolve(import.meta.dirname, file);

    return acc;
  }, {});

export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET (em frontend/.env.local) escolhe qual backend o `npm run dev`
  // usa: o local (padrão) ou o publicado, ex.: https://startmatch-api.onrender.com
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3000';

  return {
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
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
};
});
