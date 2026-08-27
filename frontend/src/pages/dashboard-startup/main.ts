// Tela: Dashboard da Startup — lógica
// =====================================
// Ao carregar, dispara 3 chamadas de API em paralelo (Promise.all) e renderiza cada
// bloco assim que os dados chegam:
//   - GET /startups/me           -> dados do próprio perfil (renderResumo)
//   - GET /matches/suggestions   -> investidores compatíveis (renderSugestoes)
//   - GET /interests/received    -> quem demonstrou interesse na startup (renderInteresses)
//
// Cada "render*" só monta uma string de HTML e joga no innerHTML do container —
// é o padrão usado em quase toda tela que lista coisas (busca, matches, etc.).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Interesse, Startup, Suggestion } from '../../scripts/types';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const resumoEl = document.getElementById('resumo-perfil') as HTMLElement;
const sugestoesEl = document.getElementById('sugestoes') as HTMLDivElement;
const interessesEl = document.getElementById('interesses-recebidos') as HTMLDivElement;

// Tradução dos valores do enum EstagioStartup para texto amigável.
const ESTAGIO_LABEL: Record<string, string> = {
  ideacao: 'Ideação',
  mvp: 'MVP',
  operacao: 'Operação',
  scale_up: 'Scale-up',
};

function renderResumo(startup: Startup): void {
  resumoEl.innerHTML = `
    <div class="card-title">${startup.nomeFantasia}</div>
    <p class="text-muted">${ESTAGIO_LABEL[startup.estagio] ?? startup.estagio} · ${startup.cidade}/${startup.uf}</p>
    <p>${startup.descricao}</p>
    <span class="badge">Plano ${startup.planoAssinatura}</span>
  `;
}

function renderSugestoes(sugestoes: Suggestion[]): void {
  if (sugestoes.length === 0) {
    sugestoesEl.innerHTML = '<p class="text-muted">Nenhuma sugestão disponível no momento.</p>';
    return;
  }

  // Cada card de sugestão é um link clicável para a tela de perfil do investidor.
  sugestoesEl.innerHTML = sugestoes
    .map((s) => {
      const investidor = s.investidor!;
      return `
        <a class="card" href="../perfil/index.html?tipo=investidor&id=${investidor.id}" style="text-decoration:none;color:inherit">
          <span class="badge badge-score">${s.score} pts</span>
          <div class="card-title">${investidor.tipo.toUpperCase()} · ${investidor.cidade}/${investidor.uf}</div>
          <p class="text-muted">${investidor.teseInvestimento}</p>
        </a>
      `;
    })
    .join('');
}

function renderInteresses(interesses: Interesse[]): void {
  if (interesses.length === 0) {
    interessesEl.innerHTML = '<p class="text-muted">Nenhum interesse recebido ainda.</p>';
    return;
  }

  interessesEl.innerHTML = interesses
    .map(
      (i) => `
        <a class="card" href="../perfil/index.html?tipo=investidor&id=${i.investidorId}" style="text-decoration:none;color:inherit">
          Investidor #${i.investidorId} demonstrou interesse no seu perfil.
        </a>
      `,
    )
    .join('');
}

async function init(): Promise<void> {
  const [startup, sugestoes, interesses] = await Promise.all([
    api.get<Startup>('/startups/me'),
    api.get<Suggestion[]>('/matches/suggestions'),
    api.get<Interesse[]>('/interests/received'),
  ]);

  renderResumo(startup);
  renderSugestoes(sugestoes);
  renderInteresses(interesses);
}

init().catch((error) => {
  resumoEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar dashboard.'}</p>`;
});
