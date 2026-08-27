// src/scripts/nav.ts
// ====================
// Menu de navegação das telas autenticadas, num lugar só. Antes cada tela
// (dashboard-startup, busca, matches, mensagens...) tinha uma lista de links FIXA
// escrita direto no HTML — o problema é que ela não mudava por tipo de usuário e
// não seguia o fluxo definido no fluxograma da designer (Aula 02 - PI.pdf).
//
// Agora todo <nav id="nav-links"></nav> de tela autenticada é preenchido por
// renderNav(), que sabe exatamente quais telas cada papel (startup, investidor,
// mentor, admin) deve enxergar — o MESMO menu, na MESMA ordem, em toda tela. Isso é
// o que garante que a navegação do código bate com o fluxograma: se uma tela nova
// entrar no fluxo, ela entra aqui uma vez só e aparece em todo lugar.
//
// Em MODO DEMONSTRAÇÃO (scripts/mock.ts), renderNav() também desenha um pequeno
// seletor "🧪 Ver como: Startup · Investidor · Mentor · Admin" no canto do menu —
// deixa a Agnes pular pra qualquer dashboard sem precisar sair e entrar de novo.
// Ele só aparece com MOCK_MODE ligado; some sozinho quando o banco de dados real
// entrar.
//
// Não precisa mexer neste arquivo para alterações visuais — a aparência do menu
// (cores, espaçamento) é toda controlada por .navbar/.navbar nav em components.css.

import { dashboardPathForRole, saveSession } from './auth';
import { MOCK_MODE } from './mock';
import { MOCK_USUARIO_POR_TIPO } from './mockData';
import type { Usuario } from './types';

export interface NavLink {
  href: string;
  label: string;
}

// Ordem e rótulos aqui = ordem e rótulos do "Fluxo de navegação do StartMatch"
// (fluxograma da designer) — ver a tabela completa em GUIA-FRONTEND.md.
export const NAV_BY_ROLE: Record<Usuario['tipo'], NavLink[]> = {
  startup: [
    { href: '../dashboard-startup/index.html', label: 'Dashboard' },
    { href: '../busca/index.html', label: 'Buscar investidores' },
    { href: '../interesses/index.html', label: 'Interesses' },
    { href: '../matches/index.html', label: 'Matches' },
    { href: '../mensagens/index.html', label: 'Mensagens' },
    { href: '../mentorias/index.html', label: 'Mentorias' },
    { href: '../canvas/index.html', label: 'Canvas' },
    { href: '../plano/index.html', label: 'Plano' },
  ],
  investidor: [
    { href: '../dashboard-investidor/index.html', label: 'Dashboard' },
    { href: '../busca/index.html', label: 'Buscar startups' },
    { href: '../interesses/index.html', label: 'Interesses' },
    { href: '../matches/index.html', label: 'Matches' },
    { href: '../mensagens/index.html', label: 'Mensagens' },
    { href: '../relatorios/index.html', label: 'Relatórios' },
    { href: '../plano/index.html', label: 'Plano' },
  ],
  mentor: [
    { href: '../dashboard-mentor/index.html', label: 'Dashboard' },
    { href: '../agenda/index.html', label: 'Agenda' },
    { href: '../solicitacoes/index.html', label: 'Solicitações' },
    { href: '../historico-mentorias/index.html', label: 'Histórico' },
    { href: '../certificados/index.html', label: 'Certificados' },
  ],
  admin: [
    { href: '../dashboard-admin/index.html', label: 'Dashboard' },
    { href: '../admin-usuarios/index.html', label: 'Usuários' },
    { href: '../admin-planos/index.html', label: 'Planos' },
    { href: '../admin-relatorios/index.html', label: 'Relatórios' },
    { href: '../admin-lgpd/index.html', label: 'Governança e LGPD' },
    { href: '../admin-auditoria/index.html', label: 'Auditoria' },
  ],
};

// "Configurações" aparece pro final do menu em todo papel — é a única tela comum
// aos quatro tipos de usuário.
const CONFIGURACOES_LINK: NavLink = { href: '../configuracoes/index.html', label: 'Configurações' };

/**
 * Preenche um elemento <nav> com os links certos para o tipo de usuário logado.
 * Uso típico, no topo do main.ts de qualquer tela autenticada:
 *
 *   const usuario = requireAuth(['startup']);
 *   renderNav(document.getElementById('nav-links')!, usuario.tipo);
 */
export function renderNav(navEl: HTMLElement, tipo: Usuario['tipo']): void {
  const links = [...NAV_BY_ROLE[tipo], CONFIGURACOES_LINK];
  const linksHtml = links.map((link) => `<a href="${link.href}">${link.label}</a>`).join('');
  navEl.innerHTML = MOCK_MODE ? linksHtml + renderMockSwitcher(tipo) : linksHtml;

  if (!MOCK_MODE) return;

  navEl.querySelectorAll<HTMLAnchorElement>('[data-mock-switch]').forEach((botao) => {
    botao.addEventListener('click', (event) => {
      event.preventDefault();
      const novoTipo = botao.dataset.mockSwitch as Usuario['tipo'];
      saveSession('mock-token', MOCK_USUARIO_POR_TIPO[novoTipo]);
      window.location.href = dashboardPathForRole(novoTipo);
    });
  });
}

// Só usado em modo demonstração (ver comentário no topo do arquivo) — troca
// instantaneamente o papel "logado" e manda pro dashboard correspondente.
function renderMockSwitcher(tipoAtual: Usuario['tipo']): string {
  const papeis: { tipo: Usuario['tipo']; label: string }[] = [
    { tipo: 'startup', label: 'Startup' },
    { tipo: 'investidor', label: 'Investidor' },
    { tipo: 'mentor', label: 'Mentor' },
    { tipo: 'admin', label: 'Admin' },
  ];
  const botoes = papeis
    .map((p) => {
      const estilo = p.tipo === tipoAtual ? 'text-decoration:underline;font-weight:700;' : '';
      return `<a href="#" data-mock-switch="${p.tipo}" style="${estilo}">${p.label}</a>`;
    })
    .join(' · ');
  return `<span style="margin-left:auto;opacity:.85;font-size:0.85rem">🧪 Ver como: ${botoes}</span>`;
}
