// Tela: Dashboard do Mentor — lógica
// ====================================
// Busca GET /mentors/me e mostra um resumo do perfil (área de atuação,
// especialidades, disponibilidade, plano de assinatura e, se aplicável, o selo
// de vínculo com o Porto Digital — que dá direito ao desconto de 70–80% na
// assinatura).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

const usuario = requireAuth(['mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const resumoEl = document.getElementById('resumo-perfil') as HTMLElement;

function renderResumo(mentor: Mentor): void {
  const badgePorto = mentor.vinculoPortoDigital
    ? '<span class="badge badge-success">Mentor Porto Digital</span>'
    : '<span class="badge">Mentor independente</span>';

  resumoEl.innerHTML = `
    <div class="card-title">${mentor.areaAtuacao} ${badgePorto}</div>
    <p>${mentor.bio}</p>
    <p class="text-muted">${mentor.especialidades.map((e) => `<span class="badge">${e}</span>`).join(' ')}</p>
    <p class="text-muted">Disponibilidade: ${mentor.disponibilidade}</p>
    <span class="badge">Plano ${mentor.planoAssinatura}</span>
  `;
}

async function init(): Promise<void> {
  const mentor = await api.get<Mentor>('/mentors/me');
  renderResumo(mentor);
}

init().catch((error) => {
  resumoEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar dashboard.'}</p>`;
});
