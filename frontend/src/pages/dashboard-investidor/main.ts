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
import { escapeHtml } from '../../scripts/investidor';
import type { Interesse, Investidor, Match, Startup } from '../../scripts/types';

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


// Nome e badge de cada plano (mesmo visual da página de Planos).
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

// Valor compacto para os cards: R$ 100 mil, R$ 1,5 mi. Usa espaço que não
// quebra (\u00a0), para a linha só quebrar no traço entre mínimo e máximo.
function formatMoedaCurta(valor: number): string {
  let texto: string;
  if (valor >= 1_000_000) {
    texto = `R$ ${(valor / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  } else if (valor >= 1_000) {
    texto = `R$ ${(valor / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
  } else {
    texto = `R$ ${valor}`;
  }
  return texto.replace(/ /g, '\u00a0');
}

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
    `${formatMoedaCurta(investidor.investimentoMin)} – ` +
    `${formatMoedaCurta(investidor.investimentoMax)}`;

  planoInvestidorEl.innerHTML =
    planoHtml(investidor.planoAssinatura);
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

    ${planoHtml(investidor.planoAssinatura)}
  `;
}


// ---------------------------------------------------------------------------
// Painel de atividade (pedido do professor): ao entrar, o investidor vê quantas
// startups estão disponíveis, quantos matches já tem, quantos interesses
// recebeu e quais são as startups mais novas da plataforma.
// ---------------------------------------------------------------------------

const ESTAGIO_LABEL: Record<string, string> = {
  ideacao: 'Ideação',
  mvp: 'MVP',
  operacao: 'Operação',
  scale_up: 'Scale-up',
};

interface StartupsPagina {
  items: Startup[];
  total: number;
}

interface Sugestao {
  score: number;
  startup?: Startup;
}

function cardStartup(st: Startup, score?: number): string {
  const segmentos = (st.segmentos ?? []).map((s) => s.nome).join(', ');
  return `
    <a class="card card-feature" href="../perfil-startup/index.html?id=${st.id}"
       style="display:block;text-decoration:none;color:inherit;margin-bottom:12px">
      <div class="card-title">
        ${escapeHtml(st.nomeFantasia)}
        ${score !== undefined ? `<span class="badge-plan badge-plan--green" style="margin-left:8px">${score}/100</span>` : ''}
      </div>
      <p class="text-muted">
        ${escapeHtml(ESTAGIO_LABEL[st.estagio] ?? st.estagio)} · ${escapeHtml(st.cidade)}/${escapeHtml(st.uf)}
        ${segmentos ? ` · ${escapeHtml(segmentos)}` : ''}
      </p>
    </a>
  `;
}

async function carregarPainel(): Promise<void> {
  const novasEl = document.getElementById('novas-startups') as HTMLElement;
  const sugestoesEl = document.getElementById('sugestoes') as HTMLElement;
  const kpiDisponiveisEl = document.getElementById('kpi-disponiveis') as HTMLElement;
  const kpiMatchesEl = document.getElementById('kpi-matches') as HTMLElement;
  const kpiInteressesEl = document.getElementById('kpi-interesses') as HTMLElement;

  try {
    const [pagina, matches, recebidos, sugestoes] = await Promise.all([
      api.get<StartupsPagina>('/startups?limit=3'),
      api.get<Match[]>('/matches'),
      api.get<Interesse[]>('/interests/received'),
      api.get<Sugestao[]>('/matches/suggestions').catch(() => [] as Sugestao[]),
    ]);

    const comMatch = new Set(matches.map((m) => m.startupId));
    const pendentes = recebidos.filter((i) => !comMatch.has(i.startupId));

    kpiDisponiveisEl.textContent = String(pagina.total);
    kpiMatchesEl.textContent = String(matches.length);
    kpiInteressesEl.textContent = String(pendentes.length);

    novasEl.innerHTML = pagina.items.length
      ? pagina.items.map((st) => cardStartup(st)).join('')
      : '<p class="text-muted">Ainda não há startups cadastradas.</p>';

    const top = sugestoes.filter((s) => s.startup).slice(0, 3);
    sugestoesEl.innerHTML = top.length
      ? top.map((s) => cardStartup(s.startup as Startup, s.score)).join('')
      : '<p class="text-muted">Sem sugestões por enquanto. Complete seu perfil para melhorar o ranking.</p>';
  } catch (error) {
    const msg =
      error instanceof ApiError ? error.message : 'Erro ao carregar o painel.';
    novasEl.innerHTML = `<p class="form-error">${escapeHtml(msg)}</p>`;
    sugestoesEl.innerHTML = '';
  }
}


async function init(): Promise<void> {
  // Busca os dados reais do investidor
  // logado, seguindo a mesma lógica usada
  // no Dashboard da Startup.

  const investidor =
    await api.get<Investidor>('/investors/me');

  renderCards(investidor);
  renderResumo(investidor);

  await carregarPainel();
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