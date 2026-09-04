// Tela: Dashboard do Mentor — lógica
// ====================================
// Busca GET /mentors/me e mostra números
// nos cards principais do dashboard.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

const usuario = requireAuth(['mentor']);

const navLinks = document.getElementById(
  'nav-links'
) as HTMLElement;

renderNav(navLinks, usuario.tipo);

const perfilEl = document.getElementById(
  'card-perfil-mentor'
) as HTMLElement;

const mentoriasEl = document.getElementById(
  'card-mentorias-mentor'
) as HTMLElement;

const atividadesEl = document.getElementById(
  'card-atividades-mentor'
) as HTMLElement;

/**
 * Renderiza os números principais do mentor
 * nos três cards do dashboard.
 */
function renderResumo(mentor: Mentor): void {
  // Seu perfil:
  // quantidade de especialidades cadastradas.
  const quantidadeEspecialidades =
    mentor.especialidades?.length ?? 0;

  perfilEl.textContent = String(
    quantidadeEspecialidades
  );

  // Suas mentorias:
  // Não existe quantidade de mentorias no objeto Mentor
  // fornecido atualmente.
  mentoriasEl.textContent = '0';

  // Suas atividades:
  // Consideramos área de atuação + especialidades
  // como informações cadastradas no perfil.
  const quantidadeAtividades =
    (mentor.areaAtuacao ? 1 : 0) +
    (mentor.especialidades?.length ?? 0);

  atividadesEl.textContent = String(
    quantidadeAtividades
  );
}

/**
 * Exibe erro de carregamento sem remover
 * os cards ou os atalhos da tela.
 */
function renderErro(error: unknown): void {
  const mensagem =
    error instanceof ApiError
      ? error.message
      : 'Erro ao carregar dashboard.';

  perfilEl.textContent = '0';
  mentoriasEl.textContent = '0';
  atividadesEl.textContent = '0';

  const erroEl = document.createElement('p');

  erroEl.className = 'form-error';
  erroEl.textContent = mensagem;

  document
    .getElementById('dados-dashboard')
    ?.insertAdjacentElement(
      'afterend',
      erroEl
    );
}

/**
 * Inicialização do dashboard.
 */
async function init(): Promise<void> {
  const mentor = await api.get<Mentor>(
    '/mentors/me'
  );

  renderResumo(mentor);
}

init().catch(renderErro);