// Tela: Dashboard da Startup — lógica
// =====================================

// Carrega os dados básicos da startup e mantém os recursos
// de sugestões e interesses disponíveis apenas para usuários
// que possuem um plano.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Startup } from '../../scripts/types';


const usuario = requireAuth(['startup']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);


const resumoEl =
  document.getElementById('resumo-perfil') as HTMLElement;

const nomeStartupEl =
  document.getElementById('card-nome-startup') as HTMLElement;

const estagioStartupEl =
  document.getElementById('card-estagio-startup') as HTMLElement;

const investimentoStartupEl =
  document.getElementById('card-investimento-startup') as HTMLElement;

const planoStartupEl =
  document.getElementById('card-plano-startup') as HTMLElement;


// Tradução dos valores do enum EstagioStartup para texto amigável.

const ESTAGIO_LABEL: Record<string, string> = {

  ideacao: 'Ideação',

  mvp: 'MVP',

  operacao: 'Operação',

  scale_up: 'Scale-up',

};


function formatMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
}

function renderCards(startup: Startup): void {
  nomeStartupEl.textContent = startup.nomeFantasia || '—';
  estagioStartupEl.textContent =
    ESTAGIO_LABEL[startup.estagio] ?? startup.estagio ?? '—';
  investimentoStartupEl.textContent = formatMoeda(startup.investimentoPretendido);
  planoStartupEl.textContent = startup.planoAssinatura || '—';
}

function renderResumo(startup: Startup): void {

  resumoEl.innerHTML = `

    <div class="card-title">
      ${startup.nomeFantasia}
    </div>

    <p class="text-muted">
      ${ESTAGIO_LABEL[startup.estagio] ?? startup.estagio}
      ·
      ${startup.cidade}/${startup.uf}
    </p>

    <p>
      ${startup.descricao}
    </p>

    <span class="badge">
      Plano ${startup.planoAssinatura}
    </span>

  `;

}


async function init(): Promise<void> {

  // Nesta versão do dashboard, apenas o resumo do perfil
  // continua sendo carregado pela API.

  const startup =
    await api.get<Startup>('/startups/me');


  renderCards(startup);
  renderResumo(startup);

}


init().catch((error) => {

  resumoEl.innerHTML = `

    <p class="form-error">
      ${
        error instanceof ApiError
          ? error.message
          : 'Erro ao carregar dashboard.'
      }
    </p>

  `;

});