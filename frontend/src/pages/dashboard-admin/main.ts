// Tela: Dashboard do Administrador — lógica
// ============================================
//
// Busca GET /admin/metrics e apresenta os
// principais indicadores da plataforma.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

import type { AdminMetrics } from '../../scripts/types';

const usuario = requireAuth(['admin']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);

const indicadoresEl =
  document.getElementById('indicadores') as HTMLDivElement;


const ICONES = {
  usuarios: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M16 4a4 4 0 0 1 0 8M22 21c0-3-1.8-5.6-4.5-6.6"/>',
  startups: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0"/><path d="M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  investidores: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  mentores: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  matches: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
};


/**
 * Cria um card de indicador do Dashboard
 * (mesmo padrão .kpi-card dos outros dashboards).
 */
function card(
  titulo: string,
  valor: number,
  descricao: string,
  icone: keyof typeof ICONES,
  cor = '',
): string {
  return `
    <div class="card kpi-card">
      <span class="kpi-icon ${cor}" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONES[icone]}</svg>
      </span>

      <div class="kpi-body">
        <p class="kpi-label">${titulo}</p>
        <div class="kpi-value">${valor}</div>
        <p class="kpi-desc">${descricao}</p>
      </div>
    </div>
  `;
}


/**
 * Carrega os dados do Dashboard.
 */
async function init(): Promise<void> {
  const metrics = await api.get<AdminMetrics>(
    '/admin/metrics',
  );

  indicadoresEl.innerHTML = [
    card(
      'Usuários',
      metrics.totalUsuarios,
      'Total de contas cadastradas.',
      'usuarios',
    ),

    card(
      'Startups',
      metrics.totalStartups,
      'Perfis de startup completos.',
      'startups',
      'kpi-icon--green',
    ),

    card(
      'Investidores',
      metrics.totalInvestidores,
      'Perfis de investidor completos.',
      'investidores',
      'kpi-icon--sky',
    ),

    card(
      'Mentores',
      metrics.totalMentores,
      `${metrics.mentoresPortoDigital} vinculados ao Porto Digital.`,
      'mentores',
      'kpi-icon--violet',
    ),

    card(
      'Matches',
      metrics.totalMatches,
      'Conexões confirmadas (interesse mútuo).',
      'matches',
      'kpi-icon--amber',
    ),
  ].join('');
}


/**
 * Inicialização do Dashboard.
 */
init().catch((error) => {
  indicadoresEl.innerHTML = `
    <p class="form-error">
      ${
        error instanceof ApiError
          ? error.message
          : 'Erro ao carregar indicadores.'
      }
    </p>
  `;
});