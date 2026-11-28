// src/scripts/publicNav.ts
//
// Menu das páginas públicas no celular: o botão de 3 linhas (.nav-toggle)
// abre/fecha o painel com os links. No computador o botão fica escondido
// e os links aparecem direto na barra (estilo na própria página).

import { initCreators } from './creators';

export function initPublicNav(): void {
  initCreators();

  const nav = document.querySelector<HTMLElement>('nav.public-menu');
  const toggle = nav?.querySelector<HTMLButtonElement>('.nav-toggle');

  if (!nav || !toggle) return;

  function setOpen(open: boolean): void {
    nav!.classList.toggle('is-open', open);
    toggle!.setAttribute('aria-expanded', String(open));
    toggle!.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!nav.classList.contains('is-open'));
  });

  // fecha ao clicar fora, ao escolher um link ou ao apertar Esc
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !nav.contains(event.target as Node)) {
      setOpen(false);
    }
  });

  // "Quem criou o StartMatch": fecha o menu suspenso ao clicar fora dele
  const creators = nav.querySelector<HTMLDetailsElement>('.nav-creators');
  if (creators) {
    document.addEventListener('click', (event) => {
      if (creators.open && !creators.contains(event.target as Node)) {
        creators.open = false;
      }
    });
  }

  nav.querySelectorAll('.public-menu-links a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}
