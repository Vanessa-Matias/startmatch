// Tela: Dashboard do Administrador — lógica
// ============================================
// Busca GET /admin/metrics (endpoint novo, só admin acessa — RolesGuard no
// backend) e desenha os cards de indicadores gerais. Um gráfico de crescimento
// ao longo do tempo (como no mockup da designer) fica para uma fase futura,
// quando existir histórico de dados — por enquanto são contagens do momento.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { AdminMetrics } from '../../scripts/types';

const usuario = requireAuth(['admin']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const indicadoresEl = document.getElementById('indicadores') as HTMLDivElement;

function card(titulo: string, valor: number, descricao: string): string {
  return `
    <div class="card">
      <div class="card-title">${valor}</div>
      <p>${titulo}</p>
      <p class="text-muted">${descricao}</p>
    </div>
  `;
}

async function init(): Promise<void> {
  const metrics = await api.get<AdminMetrics>('/admin/metrics');

  indicadoresEl.innerHTML = [
    card('Usuários', metrics.totalUsuarios, 'Total de contas cadastradas.'),
    card('Startups', metrics.totalStartups, 'Perfis de startup completos.'),
    card('Investidores', metrics.totalInvestidores, 'Perfis de investidor completos.'),
    card('Mentores', metrics.totalMentores, `${metrics.mentoresPortoDigital} vinculados ao Porto Digital.`),
    card('Matches', metrics.totalMatches, 'Conexões confirmadas (interesse mútuo).'),
  ].join('');
}

init().catch((error) => {
  indicadoresEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar indicadores.'}</p>`;
});
