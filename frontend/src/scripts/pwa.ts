// src/scripts/pwa.ts
// ====================
// Registra o Service Worker do PWA (o arquivo /sw.js, servido da raiz do site) —
// é o que permite o navegador cachear o site e mostrar o ícone de "instalar app".
//
// Só roda em produção (import.meta.env.PROD) e só se o navegador suportar Service
// Worker — em desenvolvimento (`npm run dev`) fica desligado de propósito, para não
// atrapalhar o hot-reload do Vite com cache antigo.
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}
