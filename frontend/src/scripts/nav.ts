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
      href: '../canvas/index.html',
      label: 'Canvas',
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
    href: '../agenda/index.html',
    label: 'Agenda',
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

  const linksHtml = links
    .map(
      (link) =>
        `<a href="${link.href}">${link.label}</a>`,
    )
    .join('');

  navEl.innerHTML = `
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
  `;

  if (showLogout) {
    document
      .getElementById('nav-logout')
      ?.addEventListener('click', () => {
        logout();
      });
  }
}