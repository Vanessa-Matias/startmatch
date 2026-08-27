// Tela: Gestão de planos — lógica
// =================================
// Reaproveita o mesmo GET /admin/metrics do dashboard-admin — só olha os campos
// startupsPorPlano e investidoresPorPlano, que já vêm prontos do backend
// (admin.service.ts conta quantos registros existem em cada valor do enum
// PlanoAssinatura).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { AdminMetrics } from '../../scripts/types';

const usuario = requireAuth(['admin']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const startupsEl = document.getElementById('startups-planos') as HTMLDivElement;
const investidoresEl = document.getElementById('investidores-planos') as HTMLDivElement;

function renderPlanos(container: HTMLDivElement, porPlano: Record<string, number>): void {
  container.innerHTML = Object.entries(porPlano)
    .map(([plano, total]) => `
      <div class="card">
        <div class="card-title">${total}</div>
        <p class="text-muted">Plano ${plano}</p>
      </div>
    `)
    .join('');
}

async function init(): Promise<void> {
  const metrics = await api.get<AdminMetrics>('/admin/metrics');
  renderPlanos(startupsEl, metrics.startupsPorPlano);
  renderPlanos(investidoresEl, metrics.investidoresPorPlano);
}

init().catch((error) => {
  startupsEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar planos.'}</p>`;
  investidoresEl.innerHTML = '';
});
