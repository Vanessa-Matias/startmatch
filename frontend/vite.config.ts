// vite.config.ts

import { defineConfig, loadEnv, type Plugin } from 'vite';
import { resolve } from 'node:path';
import fg from 'fast-glob';

const pageEntries = fg
  .sync('src/pages/*/index.html')
  .reduce<Record<string, string>>((acc, file) => {
    const name = file.split('/')[2];

    acc[name] = resolve(import.meta.dirname, file);

    return acc;
  }, {});

// No build, o Vite coloca o link do CSS no FIM do <head>, depois dos <style> escritos
// dentro de cada página. Aí o components.css (ex.: `.card { background: branco }`)
// passa por cima dos estilos da página (ex.: cards Plus/Premium/Mentor, cards da Home).
// No `npm run dev` isso não acontece, por isso aparecia certo no localhost e errado
// na Vercel. Este plugin recoloca os links do CSS antes do primeiro <style>.
function stylesheetsAntesDosEstilosDaPagina(): Plugin {
  return {
    name: 'stylesheets-antes-dos-estilos-da-pagina',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const links = html.match(/<link rel="stylesheet"[^>]*>/g);
        if (!links) return html;
        const semLinks = links.reduce((acc, link) => acc.replace(link, ''), html);
        const posStyle = semLinks.indexOf('<style');
        if (posStyle === -1) return html;
        return `${semLinks.slice(0, posStyle)}${links.join('\n    ')}\n    ${semLinks.slice(posStyle)}`;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET (em frontend/.env.local) escolhe qual backend o `npm run dev`
  // usa: o local (padrão) ou o publicado, ex.: https://startmatch-api.onrender.com
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3000';

  return {
  root: '.',

  plugins: [stylesheetsAntesDosEstilosDaPagina()],

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
