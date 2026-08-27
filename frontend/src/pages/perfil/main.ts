// Tela: Perfil — lógica
// =======================
// Lê "tipo" e "id" da URL (ex.: perfil/index.html?tipo=startup&id=5) para saber
// QUAL perfil mostrar — essa tela não tem conteúdo fixo, ela é reaproveitada tanto
// para ver uma startup quanto um investidor.
//
// Se os parâmetros da URL não fizerem sentido (faltando, ou tipo inválido), mostra
// erro e para a execução ali mesmo (throw), sem tentar continuar.
//
// O botão "Tenho interesse" chama POST /interests. Um detalhe importante: se o
// backend responder 409 (conflito — já existe um interesse registrado), a tela
// trata isso como sucesso (marcarInteresseRegistrado), porque o RESULTADO para o
// usuário é o mesmo — "já demonstrei interesse nesse perfil".

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Investidor, Startup } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');
const id = params.get('id');

const detalheEl = document.getElementById('perfil-detalhe') as HTMLDivElement;
const btnInteresse = document.getElementById('btn-interesse') as HTMLButtonElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;

// Validação dos parâmetros da URL — sem tipo/id válidos, não tem o que mostrar.
if (!tipo || !id || (tipo !== 'startup' && tipo !== 'investidor')) {
  detalheEl.innerHTML = '<p class="form-error">Perfil inválido.</p>';
  btnInteresse.hidden = true;
  throw new Error('Parâmetros de perfil inválidos.');
}

const ESTAGIO_LABEL: Record<string, string> = {
  ideacao: 'Ideação',
  mvp: 'MVP',
  operacao: 'Operação',
  scale_up: 'Scale-up',
};

function renderStartup(startup: Startup): void {
  detalheEl.innerHTML = `
    <div class="card-title">${startup.nomeFantasia}</div>
    <p class="text-muted">${ESTAGIO_LABEL[startup.estagio] ?? startup.estagio} · ${startup.cidade}/${startup.uf}</p>
    <p>${startup.descricao}</p>
    <p class="text-muted">Investimento pretendido: R$ ${startup.investimentoPretendido.toLocaleString('pt-BR')}</p>
    <p>${startup.segmentos.map((s) => `<span class="badge">${s.nome}${s.principal ? ' ★' : ''}</span>`).join(' ')}</p>
  `;
}

function renderInvestidor(investidor: Investidor): void {
  detalheEl.innerHTML = `
    <div class="card-title">${investidor.tipo.toUpperCase()} · ${investidor.cidade}/${investidor.uf}</div>
    <p>${investidor.teseInvestimento}</p>
    <p class="text-muted">Faixa: R$ ${investidor.investimentoMin.toLocaleString('pt-BR')} – R$ ${investidor.investimentoMax.toLocaleString('pt-BR')}</p>
    <p>${investidor.segmentos.map((s) => `<span class="badge">${s.nome}</span>`).join(' ')}</p>
  `;
}

function marcarInteresseRegistrado(): void {
  btnInteresse.disabled = true;
  btnInteresse.textContent = 'Interesse registrado';
}

async function init(): Promise<void> {
  // Se estou olhando o "meu próprio tipo" de perfil (ex.: uma startup vendo outra
  // startup por engano), esconde o botão de interesse — não faz sentido demonstrar
  // interesse em alguém do mesmo lado do mercado.
  if (tipo === usuario.tipo) {
    btnInteresse.hidden = true;
  }

  if (tipo === 'startup') {
    const startup = await api.get<Startup>(`/startups/${id}`);
    renderStartup(startup);
  } else {
    const investidor = await api.get<Investidor>(`/investors/${id}`);
    renderInvestidor(investidor);
  }
}

btnInteresse.addEventListener('click', async () => {
  errorEl.textContent = '';
  try {
    await api.post('/interests', { contraparteId: Number(id) });
    marcarInteresseRegistrado();
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      // 409 = já existia interesse registrado antes — trata como sucesso.
      marcarInteresseRegistrado();
    } else {
      errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao registrar interesse.';
    }
  }
});

init().catch((error) => {
  detalheEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar perfil.'}</p>`;
  btnInteresse.hidden = true;
});
