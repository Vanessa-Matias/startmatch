// src/scripts/nav.ts

import { logout } from './auth';
import type { Usuario } from './types';

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_BY_ROLE: Record<
  Usuario['tipo'],
  NavLink[]
> = {
  startup: [
    {
      href: '../dashboard-startup/index.html',
      label: 'Dashboard',
    },
    {
      href: '../busca/index.html',
      label: 'Buscar investidores',
    },
    {
      href: '../interesses-startup/index.html',
      label: 'Interesses',
    },
    {
      href: '../matches/index.html',
      label: 'Matches',
    },
    {
      href: '../mensagens/index.html',
      label: 'Mensagens',
    },
    {
      href: '../mentorias/index.html',
      label: 'Mentorias',
    },
    {
      href: '../comprar-mentorias/index.html',
      label: 'Mentorias extras',
    },
    {
      href: '../canvas/index.html',
      label: 'Canvas',
    },
    {
      href: '../eventos/index.html',
      label: 'Eventos',
    },
    {
      href: '../plano/index.html',
      label: 'Plano',
    },
  ],

  investidor: [
    {
      href: '../dashboard-investidor/index.html',
      label: 'Dashboard',
    },
    {
      href: '../busca/index.html',
      label: 'Buscar startups',
    },
    {
      href: '../interesses-investidor/index.html',
      label: 'Interesses',
    },
    {
      href: '../matches/index.html',
      label: 'Matches',
    },
    {
      href: '../mensagens/index.html',
      label: 'Mensagens',
    },
    {
      href: '../relatorios/index.html',
      label: 'Relatórios',
    },
    {
      href: '../eventos/index.html',
      label: 'Eventos',
    },
    {
      href: '../plano/index.html',
      label: 'Plano',
    },
  ],

  mentor: [
  {
    href: '../dashboard-mentor/index.html',
    label: 'Dashboard',
  },
  {
    href: '../perfil-mentor/index.html',
    label: 'Perfil',
  },
  {
    href: '../agenda/index.html',
    label: 'Agenda',
  },
  {
    href: '../eventos/index.html',
    label: 'Eventos',
  },
  {
    href: '../solicitacoes/index.html',
    label: 'Solicitações',
  },
  {
    href: '../mensagens/index.html',
    label: 'Mensagens',
  },
  {
    href: '../historico-mentorias/index.html',
    label: 'Histórico',
  },
  {
    href: '../certificados/index.html',
    label: 'Certificados',
  },
  {
    href: '../plano/index.html',
    label: 'Plano',
  },
],

  admin: [
    {
      href: '../dashboard-admin/index.html',
      label: 'Dashboard',
    },
    {
      href: '../admin-usuarios/index.html',
      label: 'Usuários',
    },
    {
      href: '../admin-planos/index.html',
      label: 'Planos',
    },
    {
      href: '../admin-relatorios/index.html',
      label: 'Relatórios',
    },
    {
      href: '../eventos/index.html',
      label: 'Eventos',
    },
    {
      href: '../admin-lgpd/index.html',
      label: 'Governança e LGPD',
    },
    {
      href: '../admin-auditoria/index.html',
      label: 'Auditoria',
    },
  ],
};

const CONFIGURACOES_LINK: NavLink = {
  href: '../configuracoes/index.html',
  label: 'Configurações',
};

export function renderNav(
  navEl: HTMLElement,
  tipo: Usuario['tipo'],
  showLogout = true,
): void {
  const links = [
    ...NAV_BY_ROLE[tipo],
    CONFIGURACOES_LINK,
  ];

  // marca o link da tela atual (ex.: ".../plano/index.html")
  const paginaAtual = window.location.pathname.split('/').slice(-2).join('/');

  const linksHtml = links
    .map((link) => {
      const atual = link.href.endsWith(paginaAtual);
      return `<a href="${link.href}"${atual ? ' aria-current="page"' : ''}>${link.label}</a>`;
    })
    .join('');

  // Menu hambúrguer: as seções ficam num painel que abre no botão de 3
  // linhas, para o menu ocupar menos espaço. Estilo em components.css
  // (.nav--hamburger).
  navEl.classList.add('nav--hamburger');
  navEl.innerHTML = `
    <button
      type="button"
      class="nav-toggle"
      aria-expanded="false"
      aria-controls="nav-menu"
      aria-label="Abrir menu"
    >
      <span></span><span></span><span></span>
    </button>

    <div class="nav-menu" id="nav-menu" hidden>
      ${linksHtml}

      ${
        showLogout
          ? `
            <button
              type="button"
              class="nav-logout"
              id="nav-logout"
            >
              Sair
            </button>
          `
          : ''
      }
    </div>
  `;

  const toggle = navEl.querySelector('.nav-toggle') as HTMLButtonElement;
  const menu = navEl.querySelector('.nav-menu') as HTMLDivElement;

  function setOpen(open: boolean): void {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(menu.hidden !== false);
  });

  // fecha ao clicar fora do menu ou apertar Esc
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !navEl.contains(event.target as Node)) {
      setOpen(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  if (showLogout) {
    document
      .getElementById('nav-logout')
      ?.addEventListener('click', () => {
        logout();
      });
  }
}
