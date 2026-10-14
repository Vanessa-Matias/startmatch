// Tela: Dashboard do Mentor — lógica
// ====================================
// Busca GET /mentors/me e junta com os dados da área do mentor que ficam no
// navegador (scripts/mentorDemo.ts):
//   - resumo do perfil: foto, nome, cargo e empresa salvos na tela Perfil
//   - indicadores: solicitações pendentes e próximas sessões (tela
//     Solicitações), horas realizadas (Histórico) e plano atual (backend)

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import {
  formatarHoras,
  iniciais,
  lerPerfilExtra,
  proximasSessoes,
  solicitacoesPendentes,
  totalHoras,
} from '../../scripts/mentorDemo';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

const usuario = requireAuth(['mentor']);

renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const resumoEl = document.getElementById('mentor-resumo') as HTMLElement;

const PLANO_LABEL: Record<string, { nome: string; badge: string }> = {
  basico: { nome: 'Básico', badge: 'badge-plan--gray' },
  plus: { nome: 'Plus', badge: 'badge-plan--blue' },
  premium: { nome: 'Premium', badge: 'badge-plan--green' },
};

function planoHtml(plano: string | undefined): string {
  if (!plano) return '—';
  const info = PLANO_LABEL[plano.toLowerCase()] ?? { nome: plano, badge: 'badge-plan--gray' };
  return `<span class="badge-plan ${info.badge}">${info.nome}</span>`;
}

function escapeHtml(texto: string): string {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Indicadores que não dependem da API (vêm das outras telas do mentor)
function renderIndicadoresLocais(): void {
  const pendentes = solicitacoesPendentes().length;
  const proximas = proximasSessoes().length;
  (document.getElementById('kpi-pendentes') as HTMLElement).textContent = String(pendentes);
  (document.getElementById('kpi-proximas') as HTMLElement).textContent = String(proximas);
  (document.getElementById('kpi-horas') as HTMLElement).textContent = formatarHoras(totalHoras());
}

function renderResumo(mentor: Mentor): void {
  const extra = lerPerfilExtra(mentor.id);
  const nome = extra.nome || usuario.nome || 'Seu nome';
  const cargoEmpresa = [extra.cargo, extra.empresa].filter(Boolean).join(' · ');
  const perfilIncompleto = !extra.foto || !extra.cargo || !extra.empresa;

  const foto = extra.foto
    ? `<img class="mentor-resumo-foto" src="${extra.foto}" alt="Sua foto de perfil" />`
    : `<span class="mentor-resumo-foto mentor-resumo-iniciais" aria-hidden="true">${iniciais(nome)}</span>`;

  const tipo = mentor.vinculoPortoDigital
    ? '<span class="badge-eyebrow badge-eyebrow--green">Mentor da Rede Parceira</span>'
    : '<span class="badge-eyebrow badge-eyebrow--sky">Mentor independente</span>';

  const anos = extra.anosExperiencia
    ? `<span class="badge-eyebrow badge-eyebrow--gray">${extra.anosExperiencia} anos de experiência</span>`
    : '';

  resumoEl.innerHTML = `
    ${foto}
    <div class="mentor-resumo-info">
      <h2>${escapeHtml(nome)}</h2>
      <p class="mentor-resumo-cargo">${escapeHtml(cargoEmpresa || 'Cargo e empresa não informados')}</p>
      <div class="mentor-resumo-badges">
        ${tipo}
        <span class="badge-eyebrow">${escapeHtml(mentor.areaAtuacao)}</span>
        ${anos}
      </div>
    </div>
    <a class="btn-pill btn-pill--sm" href="../perfil-mentor/index.html">
      Editar perfil
      <svg class="btn-pill-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    ${
      perfilIncompleto
        ? '<p class="mentor-resumo-aviso">Complete seu perfil com foto, cargo e empresa: é isso que as startups veem antes de solicitar uma mentoria.</p>'
        : ''
    }
  `;

  (document.getElementById('kpi-plano') as HTMLElement).innerHTML = planoHtml(mentor.planoAssinatura);
}

renderIndicadoresLocais();

async function init(): Promise<void> {
  const mentor = await api.get<Mentor>('/mentors/me');
  renderResumo(mentor);
}

init().catch((error) => {
  resumoEl.innerHTML = `<p class="form-error">${
    error instanceof ApiError ? error.message : 'Erro ao carregar dashboard.'
  }</p>`;
});
