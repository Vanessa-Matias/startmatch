// src/main.ts
// ============
// Ponto de entrada do frontend.
//
// Ao abrir http://localhost:5173/,
// o usuário deve começar pela Home pública.
//
// As telas internas continuam podendo ser acessadas
// diretamente pelas próprias URLs e continuam usando
// suas respectivas regras de autenticação.
//
// IMPORTANTE:
// Este arquivo não altera o design de nenhuma tela.

import { registerServiceWorker } from './scripts/pwa';

registerServiceWorker();

// Sempre inicia o site pela Home pública.
window.location.href = '/src/pages/home/index.html';