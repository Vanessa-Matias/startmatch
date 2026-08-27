// Tela: Mentorias — lógica
// ==========================
// Busca GET /mentors (lista pública de mentores, endpoint novo em
// mentors.controller.ts) e desenha um card por mentor, com destaque para quem
// tem vínculo com o Porto Digital (badge).
//
// O botão "Solicitar mentoria" fica sempre desabilitado nesta 1ª entrega — não
// existe ainda, no backend, uma entidade de "sessão de mentoria"/agendamento
// (ver comentário no index.html desta tela).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const listEl = document.getElementById('mentores-list') as HTMLDivElement;

function renderCard(mentor: Mentor): string {
  const badgePorto = mentor.vinculoPortoDigital
    ? '<span class="badge badge-success">Mentor Porto Digital</span>'
    : '';
  return `
    <div class="card">
      <div class="card-title">${mentor.areaAtuacao} ${badgePorto}</div>
      <p>${mentor.bio}</p>
      <p class="text-muted">${mentor.especialidades.map((e) => `<span class="badge">${e}</span>`).join(' ')}</p>
      <p class="text-muted">${mentor.disponibilidade}</p>
      <button
        class="btn btn-primary btn-block"
        type="button"
        disabled
        title="Agendamento de mentoria chega na 2ª entrega do projeto"
      >
        Solicitar mentoria
      </button>
    </div>
  `;
}

async function init(): Promise<void> {
  const mentores = await api.get<Mentor[]>('/mentors');
  if (mentores.length === 0) {
    listEl.innerHTML = '<p class="text-muted">Nenhum mentor cadastrado ainda.</p>';
    return;
  }
  listEl.innerHTML = mentores.map(renderCard).join('');
}

init().catch((error) => {
  listEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar mentores.'}</p>`;
});
