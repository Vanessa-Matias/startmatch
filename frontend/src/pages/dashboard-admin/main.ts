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


/**
 * Cria um card de indicador do Dashboard.
 */
function card(
  titulo: string,
  valor: number,
  descricao: string,
): string {
  return `
    <div class="card admin-stat">

      <div class="admin-stat-number">
        ${valor}
      </div>

      <div class="admin-stat-title">
        ${titulo}
      </div>

      <p class="text-muted admin-stat-description">
        ${descricao}
      </p>

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
    ),

    card(
      'Startups',
      metrics.totalStartups,
      'Perfis de startup completos.',
    ),

    card(
      'Investidores',
      metrics.totalInvestidores,
      'Perfis de investidor completos.',
    ),

    card(
      'Mentores',
      metrics.totalMentores,
      `${metrics.mentoresPortoDigital} vinculados ao Porto Digital.`,
    ),

    card(
      'Matches',
      metrics.totalMatches,
      'Conexões confirmadas (interesse mútuo).',
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