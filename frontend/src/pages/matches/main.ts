// Tela: Matches — lógica
// =======================
//
// Busca os matches confirmados e preenche o layout da tela.
// O HTML já exibe a estrutura visual enquanto a API está carregando.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Match } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

const listEl = document.getElementById('matches-list') as HTMLDivElement;

const totalEl = document.getElementById(
  'matches-total'
) as HTMLElement;

function getNome(match: Match): string {
  if (usuario.tipo === 'startup') return 'Investidor';

  return match.startup?.nomeFantasia ?? 'Startup';
}

function getLocalizacao(match: Match): string {
  const pessoa =
    usuario.tipo === 'startup'
      ? match.investidor
      : match.startup;

  return pessoa
    ? `${pessoa.cidade}/${pessoa.uf}`
    : '';
}

function getDescricao(match: Match): string {
  return usuario.tipo === 'startup'
    ? match.investidor?.teseInvestimento ?? ''
    : match.startup?.descricao ?? '';
}

function getInitials(nome: string): string {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!partes.length) return 'SM';

  return partes
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function renderCard(match: Match): string {
  const contraparte =
    usuario.tipo === 'startup'
      ? match.investidor
      : match.startup;

  if (!contraparte) return '';

  const nome = getNome(match);
  const localizacao = getLocalizacao(match);
  const descricao = getDescricao(match);

  return `
    <a
      class="match-card"
      href="../mensagens/index.html?matchId=${match.id}"
    >
      <div class="match-card-top">
        <div class="match-avatar">
          ${getInitials(nome)}
        </div>

        <div>
          <div class="match-card-name">
            ${nome}
          </div>

          <div class="match-card-meta">
            ${localizacao}
          </div>
        </div>
      </div>

      <span class="badge badge-success">
        Match · ${match.scoreCompatibilidade} pts
      </span>

      <p class="match-card-description text-muted">
        ${descricao}
      </p>

      <div class="match-card-footer">
        <span class="text-muted">
          Interesse mútuo
        </span>

        <span class="btn btn-primary">
          Enviar mensagem
        </span>
      </div>
    </a>
  `;
}

async function init(): Promise<void> {
  const matches = await api.get<Match[]>('/matches');

  totalEl.textContent = String(matches.length);

  const cards = matches
    .map(renderCard)
    .filter(Boolean)
    .join('');

  if (!cards) {
    listEl.innerHTML = `
      <p class="text-muted">
        Nenhum match ainda. Continue explorando a busca!
      </p>
    `;

    return;
  }

  listEl.innerHTML = cards;
}

init().catch((error) => {
  listEl.innerHTML = `
    <p class="form-error">
      ${
        error instanceof ApiError
          ? error.message
          : 'Erro ao carregar matches.'
      }
    </p>
  `;

  totalEl.textContent = '—';
});