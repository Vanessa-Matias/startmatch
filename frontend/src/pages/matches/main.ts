// Tela: Matches — lógica
// =======================
// Busca GET /matches (retorna matches dos dois lados — startup ou investidor,
// dependendo de quem está logado) e renderiza um card por match.
//
// Detalhe importante: cada Match vem do backend com startup E investidor
// preenchidos (populados), então o frontend usa usuario.tipo para decidir qual dos
// dois é "a contraparte" (quem mostrar no card) — se eu sou startup, quero ver
// dados do investidor, e vice-versa.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Match } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);
const listEl = document.getElementById('matches-list') as HTMLDivElement;

function renderCard(match: Match): string {
  // "Contraparte" = o outro lado do match, em relação a quem está logado.
  const contraparte = usuario.tipo === 'startup' ? match.investidor : match.startup;
  const titulo =
    usuario.tipo === 'startup'
      ? `${match.investidor?.tipo.toUpperCase()} · ${match.investidor?.cidade}/${match.investidor?.uf}`
      : match.startup?.nomeFantasia;
  const descricao =
    usuario.tipo === 'startup' ? match.investidor?.teseInvestimento : match.startup?.descricao;

  if (!contraparte) return ''; // segurança: se o backend não populou o relacionamento, pula o card

  // Clicar no card leva direto para a conversa daquele match (ver tela mensagens/).
  return `
    <a class="card" href="../mensagens/index.html?matchId=${match.id}" style="text-decoration:none;color:inherit">
      <span class="badge badge-success">Match · ${match.scoreCompatibilidade} pts</span>
      <div class="card-title">${titulo}</div>
      <p class="text-muted">${descricao ?? ''}</p>
    </a>
  `;
}

async function init(): Promise<void> {
  const matches = await api.get<Match[]>('/matches');
  if (matches.length === 0) {
    listEl.innerHTML = '<p class="text-muted">Nenhum match ainda. Continue explorando a busca!</p>';
    return;
  }
  listEl.innerHTML = matches.map(renderCard).join('');
}

init().catch((error) => {
  listEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar matches.'}</p>`;
});
