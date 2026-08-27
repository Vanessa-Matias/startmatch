// src/main.ts
// ============
// Ponto de entrada carregado pelo index.html da raiz. Não renderiza nada na tela —
// faz duas coisas antes de qualquer outra tela aparecer:
//
//   1. Registra o service worker do PWA (registerServiceWorker, de scripts/pwa.ts)
//      — permite o site funcionar como "app instalável" e com cache offline básico.
//   2. Decide para onde mandar o usuário:
//        - Se já está logado (tem token salvo) -> manda direto para o dashboard do
//          seu tipo de usuário (startup, investidor, etc).
//        - Se não está logado                  -> manda para a Home (área pública do
//          site — Etapa 1 do fluxograma da designer), de onde a pessoa decide se
//          quer conhecer a plataforma, entrar ou criar conta.
//
// Quem decide "qual dashboard" é a função dashboardPathForRole, definida em
// scripts/auth.ts.

import { isAuthenticated, getUser, dashboardPathForRole } from './scripts/auth';
import { registerServiceWorker } from './scripts/pwa';

registerServiceWorker();

if (isAuthenticated()) {
  const usuario = getUser()!;
  window.location.href = `/src/pages/${dashboardPathForRole(usuario.tipo).replace('../', '')}`;
} else {
  window.location.href = '/src/pages/home/index.html';
}
