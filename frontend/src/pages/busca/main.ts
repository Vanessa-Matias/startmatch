// Tela: Busca — lógica
// =====================
// Tela mais complexa do frontend: serve tanto startups (buscando investidores)
// quanto investidores (buscando startups), com filtros de texto, segmento, UF, e
// filtros específicos de cada lado (estágio para startups, faixa de investimento
// para investidores), mais paginação.
//
// Fluxo geral:
//   1. Descobre o tipo do usuário logado e decide o "modo" da tela
//      (buscandoInvestidores = true/false) — isso muda título, filtros visíveis e
//      qual endpoint é chamado.
//   2. Cada mudança em qualquer filtro reinicia a página para 1 e dispara uma nova
//      busca depois de 300ms sem digitar (debounce) — evita bombardear a API a
//      cada tecla digitada no campo de texto.
//   3. renderResults desenha os cards e os botões de paginação.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { UFS } from '../../scripts/ufs';
import { TIPO_INVESTIDOR_LABEL, escapeHtml } from '../../scripts/investidor';
import type { Investidor, PaginatedResponse, Segmento, Startup } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);
// true = usuário é startup buscando investidores / false = investidor buscando startups
const buscandoInvestidores = usuario.tipo === 'startup';

const tituloEl = document.getElementById('titulo-busca') as HTMLHeadingElement;
tituloEl.textContent = buscandoInvestidores ? 'Buscar investidores' : 'Buscar startups';

// Mostra/esconde os filtros específicos de cada lado da busca.
document.getElementById('filtro-estagio')!.hidden = buscandoInvestidores;
document.getElementById('filtro-investimento')!.hidden = !buscandoInvestidores;

const textoEl = document.getElementById('texto') as HTMLInputElement;
const segmentoEl = document.getElementById('segmentoId') as HTMLSelectElement;
const estagioEl = document.getElementById('estagio') as HTMLSelectElement;
const investimentoMinEl = document.getElementById('investimentoMin') as HTMLInputElement;
const investimentoMaxEl = document.getElementById('investimentoMax') as HTMLInputElement;
const ufEl = document.getElementById('uf') as HTMLSelectElement;
const resultsEl = document.getElementById('results') as HTMLDivElement;
const paginationEl = document.getElementById('pagination') as HTMLDivElement;

let page = 1;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

for (const uf of UFS) {
  const option = document.createElement('option');
  option.value = uf;
  option.textContent = uf;
  ufEl.appendChild(option);
}

function renderStartupCard(startup: Startup): string {
  return `
    <a
      class="card"
      href="../perfil-startup/index.html?id=${startup.id}"
      style="text-decoration:none;color:inherit"
    >
      <div class="card-title">${startup.nomeFantasia}</div>
      <p class="text-muted">${startup.cidade}/${startup.uf}</p>
      <p>${startup.descricao}</p>
    </a>
  `;
}

function renderInvestorCard(investidor: Investidor): string {
  return `
    <a class="card" href="../perfil-investidor/index.html?id=${investidor.id}" style="text-decoration:none;color:inherit">
      <div class="card-title">${escapeHtml(investidor.nome ?? 'Investidor')}</div>
      <p class="text-muted">${TIPO_INVESTIDOR_LABEL[investidor.tipo]} · ${investidor.cidade}/${investidor.uf}</p>
      <p>${escapeHtml(investidor.teseInvestimento)}</p>
      <div>${(investidor.segmentos ?? []).map((seg) => `<span class="badge">${escapeHtml(seg.nome)}</span>`).join(' ')}</div>
    </a>
  `;
}

// Monta a query string da URL a partir do estado atual dos filtros na tela.
function buildQuery(): string {
  const params = new URLSearchParams();
  if (textoEl.value) params.set('texto', textoEl.value);
  if (segmentoEl.value) params.set('segmentoId', segmentoEl.value);
  if (ufEl.value) params.set('uf', ufEl.value);

  if (!buscandoInvestidores && estagioEl.value) {
    params.set('estagio', estagioEl.value);
  }
  if (buscandoInvestidores) {
    if (investimentoMinEl.value) params.set('investimentoMin', investimentoMinEl.value);
    if (investimentoMaxEl.value) params.set('investimentoMax', investimentoMaxEl.value);
  }

  params.set('page', String(page));
  params.set('limit', '12');
  return params.toString();
}

async function search(): Promise<void> {
  resultsEl.innerHTML = '<p class="text-muted">Buscando…</p>';
  const query = buildQuery();

  try {
    if (buscandoInvestidores) {
      const result = await api.get<PaginatedResponse<Investidor>>(`/investors?${query}`);
      renderResults(result, renderInvestorCard);
    } else {
      const result = await api.get<PaginatedResponse<Startup>>(`/startups?${query}`);
      renderResults(result, renderStartupCard);
    }
  } catch (error) {
    resultsEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao buscar.'}</p>`;
  }
}

// Genérica: recebe o resultado paginado e a função que sabe renderizar UM item
// (renderStartupCard ou renderInvestorCard), e desenha tanto os cards quanto os
// botões de "Anterior/Próxima".
function renderResults<T>(result: PaginatedResponse<T>, renderCard: (item: T) => string): void {
  if (result.items.length === 0) {
    resultsEl.innerHTML = '<p class="text-muted">Nenhum resultado encontrado.</p>';
    paginationEl.innerHTML = '';
    return;
  }

  resultsEl.innerHTML = result.items.map(renderCard).join('');

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  paginationEl.innerHTML = `
    <button class="btn btn-outline" id="prev-page" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
    <span class="text-muted">Página ${page} de ${totalPages}</span>
    <button class="btn btn-outline" id="next-page" ${page >= totalPages ? 'disabled' : ''}>Próxima</button>
  `;

  document.getElementById('prev-page')?.addEventListener('click', () => {
    page = Math.max(1, page - 1);
    void search();
  });
  document.getElementById('next-page')?.addEventListener('click', () => {
    page = page + 1;
    void search();
  });
}

// Chamado toda vez que um filtro muda: volta para a página 1 e espera 300ms de
// "silêncio" antes de buscar de novo (debounce) — assim digitar "fintech" não
// dispara 7 buscas, uma por letra.
function onFilterChange(): void {
  page = 1;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void search(), 300);
}

[textoEl, segmentoEl, estagioEl, investimentoMinEl, investimentoMaxEl, ufEl].forEach((el) => {
  el.addEventListener('input', onFilterChange);
  el.addEventListener('change', onFilterChange);
});

async function init(): Promise<void> {
  const segmentos = await api.get<Segmento[]>('/segments');
  for (const segmento of segmentos) {
    const option = document.createElement('option');
    option.value = String(segmento.id);
    option.textContent = segmento.nome;
    segmentoEl.appendChild(option);
  }
  await search();
}

init().catch((error) => {
  resultsEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar busca.'}</p>`;
});
