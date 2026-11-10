// Tela: Dashboard da Startup — lógica
// =====================================

// Carrega os dados básicos da startup e mantém os recursos
// de sugestões e interesses disponíveis apenas para usuários
// que possuem um plano.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { escapeHtml, TIPO_INVESTIDOR_LABEL } from '../../scripts/investidor';
import type { Interesse, Investidor, Match, Startup } from '../../scripts/types';


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

const interessesEl =
  document.getElementById('interesses-recebidos') as HTMLElement;

const planoStartupEl =
  document.getElementById('card-plano-startup') as HTMLElement;


// Tradução dos valores do enum EstagioStartup para texto amigável.

const ESTAGIO_LABEL: Record<string, string> = {

  ideacao: 'Ideação',

  mvp: 'MVP',

  operacao: 'Operação',

  scale_up: 'Scale-up',

};


// Nome e badge de cada plano (mesmo visual da página de Planos e dos
// dashboards de investidor e mentor).
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
  planoStartupEl.innerHTML = planoHtml(startup.planoAssinatura);
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

    ${planoHtml(startup.planoAssinatura)}

  `;

}


// Interesses recebidos: investidores que clicaram em "Tenho interesse" na startup
// e ainda não viraram match. Fica liberado em todos os planos, porque é daqui que
// a startup vê quem quer conversar e aceita o interesse (o limite de interesses
// do plano Básico vale só para os interesses ENVIADOS).
async function carregarInteressesRecebidos(): Promise<void> {
  const [recebidos, matches] = await Promise.all([
    api.get<Interesse[]>('/interests/received'),
    api.get<Match[]>('/matches'),
  ]);

  const comMatch = new Set(matches.map((m) => m.investidorId));
  const pendentes = recebidos.filter((i) => !comMatch.has(i.investidorId));

  if (pendentes.length === 0) {
    interessesEl.innerHTML = `
      <div class="card card-feature">
        <div class="card-title">Nenhum interesse novo</div>
        <p class="text-muted">
          Quando um investidor demonstrar interesse no seu perfil, ele aparece aqui.
          ${matches.length ? `Você já tem ${matches.length} match(es).` : ''}
        </p>
        <a class="btn-pill btn-pill--sm" href="../interesses-startup/index.html">Ver interesses</a>
      </div>
    `;
    return;
  }

  const investidores = await Promise.all(
    pendentes.slice(0, 3).map((i) =>
      api.get<Investidor>(`/investors/${i.investidorId}`).catch(() => null),
    ),
  );

  const linhas = investidores
    .filter((inv): inv is Investidor => inv !== null)
    .map(
      (inv) =>
        `<li><strong>${escapeHtml(inv.nome ?? `Investidor #${inv.id}`)}</strong> · ${escapeHtml(
          TIPO_INVESTIDOR_LABEL[inv.tipo] ?? inv.tipo,
        )} · ${escapeHtml(inv.cidade)}/${escapeHtml(inv.uf)}</li>`,
    )
    .join('');

  interessesEl.innerHTML = `
    <div class="card card-feature">
      <div class="card-title">
        ${pendentes.length} investidor(es) com interesse no seu perfil
      </div>
      <ul class="text-muted" style="margin:8px 0 14px 18px">${linhas}</ul>
      <a class="btn-pill btn-pill--sm" href="../interesses-startup/index.html">Ver e aceitar</a>
    </div>
  `;
}


async function init(): Promise<void> {

  // Nesta versão do dashboard, apenas o resumo do perfil
  // continua sendo carregado pela API.

  const startup =
    await api.get<Startup>('/startups/me');


  renderCards(startup);
  renderResumo(startup);

  await carregarInteressesRecebidos().catch(() => {
    interessesEl.innerHTML =
      '<p class="text-muted">Não foi possível carregar os interesses agora.</p>';
  });

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