// Tela: Relatórios (Admin) — lógica
// ===================================
// Mesmo endpoint do dashboard-admin (GET /admin/metrics), só que exibindo os
// campos de detalhamento (usuariosPorTipo, startupsPorEstagio) que o dashboard
// principal não mostra.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { AdminMetrics } from '../../scripts/types';

const usuario = requireAuth(['admin']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const usuariosTipoEl = document.getElementById('usuarios-tipo') as HTMLDivElement;
const startupsEstagioEl = document.getElementById('startups-estagio') as HTMLDivElement;

function renderContagem(container: HTMLDivElement, mapa: Record<string, number>, prefixo: string): void {
  container.innerHTML = Object.entries(mapa)
    .map(([chave, total]) => `
      <div class="card">
        <div class="card-title">${total}</div>
        <p class="text-muted">${prefixo} ${chave}</p>
      </div>
    `)
    .join('');
}

async function init(): Promise<void> {
  const metrics = await api.get<AdminMetrics>('/admin/metrics');
  renderContagem(usuariosTipoEl, metrics.usuariosPorTipo, 'Tipo:');
  renderContagem(startupsEstagioEl, metrics.startupsPorEstagio, 'Estágio:');
}

init().catch((error) => {
  usuariosTipoEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar relatórios.'}</p>`;
  startupsEstagioEl.innerHTML = '';
});
