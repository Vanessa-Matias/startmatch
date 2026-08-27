// Tela: Interesses — lógica
// ===========================
// Busca GET /interests/received e GET /interests/sent em paralelo — os dois
// endpoints já existem no backend e já aceitam tanto startup quanto investidor
// (ver interests.controller.ts), então esta tela não precisou de nada novo no
// backend, só reunir os dois lados numa tela própria.
//
// Cada card leva para o perfil detalhado da contraparte (mesma tela de
// perfil/ usada em busca, sugestões e matches).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Interesse } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const recebidosEl = document.getElementById('interesses-recebidos') as HTMLDivElement;
const enviadosEl = document.getElementById('interesses-enviados') as HTMLDivElement;

// Tipo da CONTRAPARTE (o outro lado do interesse) — se eu sou startup, a
// contraparte de qualquer interesse (enviado ou recebido) é sempre um investidor.
const tipoContraparte = usuario.tipo === 'startup' ? 'investidor' : 'startup';

function contraparteId(interesse: Interesse): number {
  return tipoContraparte === 'investidor' ? interesse.investidorId : interesse.startupId;
}

function renderLista(container: HTMLDivElement, interesses: Interesse[], vazioMsg: string): void {
  if (interesses.length === 0) {
    container.innerHTML = `<p class="text-muted">${vazioMsg}</p>`;
    return;
  }

  container.innerHTML = interesses
    .map((i) => {
      const id = contraparteId(i);
      return `
        <a class="card" href="../perfil/index.html?tipo=${tipoContraparte}&id=${id}" style="text-decoration:none;color:inherit">
          <div class="card-title">${tipoContraparte === 'investidor' ? 'Investidor' : 'Startup'} #${id}</div>
          <p class="text-muted">Em ${new Date(i.criadoEm).toLocaleDateString('pt-BR')}</p>
        </a>
      `;
    })
    .join('');
}

async function init(): Promise<void> {
  const [recebidos, enviados] = await Promise.all([
    api.get<Interesse[]>('/interests/received'),
    api.get<Interesse[]>('/interests/sent'),
  ]);

  renderLista(recebidosEl, recebidos, 'Nenhum interesse recebido ainda.');
  renderLista(enviadosEl, enviados, 'Você ainda não demonstrou interesse em ninguém — explore a busca!');
}

init().catch((error) => {
  recebidosEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar interesses.'}</p>`;
  enviadosEl.innerHTML = '';
});
