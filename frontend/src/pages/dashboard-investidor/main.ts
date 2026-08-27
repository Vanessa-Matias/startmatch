// Tela: Dashboard do Investidor — lógica
// =========================================
// Parecido com o dashboard-startup, mas com uma etapa extra: depois de buscar as
// sugestões, cruza com a lista de interesses já ENVIADOS (GET /interests/sent) para
// separar "Oportunidades em aberto" (sugestões que o investidor ainda não contatou)
// das sugestões gerais.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Interesse, Investidor, Suggestion } from '../../scripts/types';

const usuario = requireAuth(['investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const resumoEl = document.getElementById('resumo-perfil') as HTMLElement;
const sugestoesEl = document.getElementById('sugestoes') as HTMLDivElement;
const oportunidadesEl = document.getElementById('oportunidades') as HTMLDivElement;

function renderResumo(investidor: Investidor): void {
  resumoEl.innerHTML = `
    <div class="card-title">${investidor.tipo.toUpperCase()} · ${investidor.cidade}/${investidor.uf}</div>
    <p>${investidor.teseInvestimento}</p>
    <p class="text-muted">Faixa: R$ ${investidor.investimentoMin.toLocaleString('pt-BR')} – R$ ${investidor.investimentoMax.toLocaleString('pt-BR')}</p>
    <span class="badge">Plano ${investidor.planoAssinatura}</span>
  `;
}

// Função genérica reutilizada tanto para "sugestões" quanto para "oportunidades" —
// recebe o container e a mensagem a mostrar quando a lista está vazia.
function renderCards(container: HTMLDivElement, sugestoes: Suggestion[], emptyMessage: string): void {
  if (sugestoes.length === 0) {
    container.innerHTML = `<p class="text-muted">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = sugestoes
    .map((s) => {
      const startup = s.startup!;
      return `
        <a class="card" href="../perfil/index.html?tipo=startup&id=${startup.id}" style="text-decoration:none;color:inherit">
          <span class="badge badge-score">${s.score} pts</span>
          <div class="card-title">${startup.nomeFantasia}</div>
          <p class="text-muted">${startup.cidade}/${startup.uf}</p>
          <p>${startup.descricao}</p>
        </a>
      `;
    })
    .join('');
}

async function init(): Promise<void> {
  const [investidor, sugestoes, enviados] = await Promise.all([
    api.get<Investidor>('/investors/me'),
    api.get<Suggestion[]>('/matches/suggestions'),
    api.get<Interesse[]>('/interests/sent'),
  ]);

  renderResumo(investidor);
  renderCards(sugestoesEl, sugestoes, 'Nenhuma sugestão disponível no momento.');

  // "Oportunidades em aberto" = sugestões cujo id de startup NÃO está no conjunto
  // de startups para as quais já foi enviado interesse.
  const startupIdsContatados = new Set(enviados.map((i) => i.startupId));
  const oportunidades = sugestoes.filter((s) => !startupIdsContatados.has(s.startup!.id));
  renderCards(oportunidadesEl, oportunidades, 'Você já demonstrou interesse em todas as sugestões.');
}

init().catch((error) => {
  resumoEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar dashboard.'}</p>`;
});
