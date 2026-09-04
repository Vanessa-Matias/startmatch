// Tela: Dashboard do Investidor — lógica
// ======================================
//
// Carrega os dados básicos do investidor
// e exibe as informações do próprio perfil
// no dashboard.
//
// As áreas de sugestões e oportunidades
// continuam bloqueadas para usuários que
// ainda não possuem plano.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Investidor } from '../../scripts/types';

const usuario = requireAuth(['investidor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);

const resumoEl =
  document.getElementById('resumo-perfil') as HTMLElement;

const tipoInvestidorEl =
  document.getElementById(
    'card-tipo-investidor',
  ) as HTMLElement;

const localizacaoInvestidorEl =
  document.getElementById(
    'card-localizacao-investidor',
  ) as HTMLElement;

const investimentoInvestidorEl =
  document.getElementById(
    'card-investimento-investidor',
  ) as HTMLElement;

const planoInvestidorEl =
  document.getElementById(
    'card-plano-investidor',
  ) as HTMLElement;


// Tradução dos tipos de investidor para
// textos mais amigáveis.

const TIPO_INVESTIDOR_LABEL: Record<string, string> = {
  anjo: 'Investidor Anjo',
  fundo: 'Fundo',
  corporate: 'Corporate',
  aceleradora: 'Aceleradora',
  venture_capital: 'Venture Capital',
};


// Formata valores monetários em reais.

function formatMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
}


// Renderiza os quatro cards principais
// com os dados reais do investidor.

function renderCards(investidor: Investidor): void {
  tipoInvestidorEl.textContent =
    TIPO_INVESTIDOR_LABEL[investidor.tipo] ??
    investidor.tipo ??
    '—';

  localizacaoInvestidorEl.textContent =
    investidor.cidade && investidor.uf
      ? `${investidor.cidade}/${investidor.uf}`
      : '—';

  investimentoInvestidorEl.textContent =
    `${formatMoeda(investidor.investimentoMin)} – ` +
    `${formatMoeda(investidor.investimentoMax)}`;

  planoInvestidorEl.textContent =
    investidor.planoAssinatura || '—';
}


// Renderiza o resumo do perfil.

function renderResumo(investidor: Investidor): void {
  resumoEl.innerHTML = `
    <div class="card-title">
      ${
        TIPO_INVESTIDOR_LABEL[investidor.tipo] ??
        investidor.tipo
      }
      ·
      ${investidor.cidade}/${investidor.uf}
    </div>

    <p>
      ${investidor.teseInvestimento}
    </p>

    <p class="text-muted">
      Faixa de investimento:
      ${formatMoeda(investidor.investimentoMin)}
      –
      ${formatMoeda(investidor.investimentoMax)}
    </p>

    <span class="badge">
      Plano ${investidor.planoAssinatura}
    </span>
  `;
}


async function init(): Promise<void> {
  // Busca os dados reais do investidor
  // logado, seguindo a mesma lógica usada
  // no Dashboard da Startup.

  const investidor =
    await api.get<Investidor>('/investors/me');

  renderCards(investidor);
  renderResumo(investidor);
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