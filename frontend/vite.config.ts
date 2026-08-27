// vite.config.ts
// ================
// Configuração do Vite em modo "multi-page app" (MPA): como o frontend é feito em
// HTML/CSS/TS puro (sem React/Vue), cada tela vive numa pasta própria dentro de
// src/pages/<tela>/ com seu próprio index.html + main.ts. Este arquivo ensina o Vite
// a enxergar TODAS essas telas como pontos de entrada do build.
//
// Se você (Agnes) criar uma tela NOVA (ex.: src/pages/notificacoes/index.html), não
// precisa mexer aqui — o bloco abaixo descobre a pasta nova automaticamente. Só rodar
// `npm run dev` de novo caso o servidor já estivesse ligado.

import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fg from 'fast-glob';

// Procura todo arquivo "src/pages/*/index.html" e monta um objeto
// { nomeDaPasta: caminhoAbsoluto } — isso vira a lista de "entradas" do build de produção.
const pageEntries = fg.sync('src/pages/*/index.html').reduce<Record<string, string>>((acc, file) => {
  const name = file.split('/')[2]; // ex.: "src/pages/login/index.html" -> "login"
  acc[name] = resolve(import.meta.dirname, file);
  return acc;
}, {});

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'), // tela raiz (redirecionamento)
        ...pageEntries, // todas as telas descobertas acima
      },
    },
  },
  server: {
    // Em desenvolvimento, qualquer chamada do frontend para "/api/..." é redirecionada
    // para o backend NestJS rodando em localhost:3000. Isso evita configurar CORS no
    // backend só para rodar local — o navegador acha que está tudo no mesmo domínio.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
