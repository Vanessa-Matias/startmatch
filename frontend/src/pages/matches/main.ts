// Tela: Matches — lógica
// =======================
//
// Busca os matches confirmados e preenche o layout da tela.
// O HTML já exibe a estrutura visual enquanto a API está carregando.
//
// SIMULAÇÃO DE MATCH (demonstração): além dos matches reais, a tela mostra
// matches de exemplo no mesmo formato de card, e o botão "Simular novo match"
// cria mais um, com o aviso "É um match!". "Enviar mensagem" abre a conversa
// simulada na tela de Mensagens. Tudo fica só no navegador (sessionStorage),
// nada vai para o banco — ver scripts/matchSimulado.ts.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import {
  matchesSimulados,
  simularNovoMatch,
  temMaisParaSimular,
  type MatchExemplo,
} from '../../scripts/matchSimulado';
import type { Match } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

const listEl = document.getElementById('matches-list') as HTMLDivElement;

const totalEl = document.getElementById(
  'matches-total'
) as HTMLElement;

const btnSimular = document.getElementById(
  'btn-simular-match'
) as HTMLButtonElement;

let totalReais = 0;

/*
 * ================================
 * CARDS
 * ================================
 */

function getNome(match: Match): string {
  if (usuario.tipo === 'startup') return 'Investidor';

  return match.startup?.nomeFantasia ?? 'Startup';
}

function getLocalizacao(match: Match): string {
  const pessoa =
    usuario.tipo === 'startup'
      ? match.investidor
      : match.startup;

  return pessoa
    ? `${pessoa.cidade}/${pessoa.uf}`
    : '';
}

function getDescricao(match: Match): string {
  return usuario.tipo === 'startup'
    ? match.investidor?.teseInvestimento ?? ''
    : match.startup?.descricao ?? '';
}

function getInitials(nome: string): string {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!partes.length) return 'SM';

  return partes
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

interface CardDados {
  nome: string;
  localizacao: string;
  descricao: string;
  score: number;
  href: string;
  simulado: boolean;
  novo?: boolean;
}

function cardHtml(dados: CardDados): string {
  return `
    <a
      class="match-card${dados.novo ? ' match-card--novo' : ''}"
      href="${dados.href}"
    >
      <div class="match-card-top">
        <div class="match-avatar">
          ${getInitials(dados.nome)}
        </div>

        <div>
          <div class="match-card-name">
            ${dados.nome}
            ${dados.simulado ? '<span class="match-sim-tag">simulação</span>' : ''}
          </div>

          <div class="match-card-meta">
            ${dados.localizacao}
          </div>
        </div>
      </div>

      <span class="badge badge-success">
        Match · ${dados.score} pts
      </span>

      <p class="match-card-description text-muted">
        ${dados.descricao}
      </p>

      <div class="match-card-footer">
        <span class="text-muted">
          Interesse mútuo
        </span>

        <span class="btn btn-primary">
          Enviar mensagem
        </span>
      </div>
    </a>
  `;
}

function renderCard(match: Match): string {
  const contraparte =
    usuario.tipo === 'startup'
      ? match.investidor
      : match.startup;

  if (!contraparte) return '';

  return cardHtml({
    nome: getNome(match),
    localizacao: getLocalizacao(match),
    descricao: getDescricao(match),
    score: match.scoreCompatibilidade,
    href: `../mensagens/index.html?matchId=${match.id}`,
    simulado: false,
  });
}

function renderExemplo(exemplo: MatchExemplo, novo = false): string {
  return cardHtml({
    ...exemplo,
    href: `../mensagens/index.html?simulado=${exemplo.id}`,
    simulado: true,
    novo,
  });
}

function atualizarTotal(): void {
  totalEl.textContent = String(totalReais + matchesSimulados(usuario.tipo).length);
}

/*
 * ================================
 * MODAL "É UM MATCH!"
 * ================================
 */

const modalEl = document.createElement('div');
modalEl.className = 'modal-backdrop';
modalEl.hidden = true;
document.body.appendChild(modalEl);

function fecharModal(): void {
  modalEl.hidden = true;
  modalEl.innerHTML = '';
}

function abrirModalMatch(exemplo: MatchExemplo): void {
  modalEl.innerHTML = `
    <div class="modal match-modal" role="dialog" aria-modal="true" aria-labelledby="match-modal-titulo">
      <div class="match-modal-avatars" aria-hidden="true">
        <span class="match-avatar">${getInitials(usuario.tipo === 'startup' ? 'Sua Startup' : 'Você')}</span>
        <span class="match-modal-heart">♥</span>
        <span class="match-avatar match-avatar--b">${getInitials(exemplo.nome)}</span>
      </div>
      <h2 id="match-modal-titulo">É um match!</h2>
      <p class="text-muted">
        Você e <strong>${exemplo.nome}</strong> demonstraram interesse um no
        outro. Compatibilidade de <strong>${exemplo.score} pts</strong>.
      </p>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" data-fechar>Continuar explorando</button>
        <a class="btn btn-primary" href="../mensagens/index.html?simulado=${exemplo.id}">Enviar mensagem</a>
      </div>
    </div>
  `;
  modalEl.hidden = false;
  (modalEl.querySelector('[data-fechar]') as HTMLButtonElement).focus();
}

modalEl.addEventListener('click', (event) => {
  const alvo = event.target as HTMLElement;
  if (alvo === modalEl || alvo.closest('[data-fechar]')) fecharModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalEl.hidden) fecharModal();
});

/*
 * ================================
 * SIMULAR NOVO MATCH
 * ================================
 */

function atualizarBotao(): void {
  if (!temMaisParaSimular(usuario.tipo)) {
    btnSimular.disabled = true;
    btnSimular.title = 'Todos os matches de exemplo já foram simulados';
  }
}

btnSimular.addEventListener('click', () => {
  const exemplo = simularNovoMatch(usuario.tipo);
  if (!exemplo) return;

  // remove o aviso de "nenhum match" se ele estiver na lista
  listEl.querySelector('.matches-vazio')?.remove();
  listEl.insertAdjacentHTML('afterbegin', renderExemplo(exemplo, true));

  atualizarTotal();
  atualizarBotao();
  abrirModalMatch(exemplo);
});

/*
 * ================================
 * CARREGAMENTO
 * ================================
 */

// exemplos já exibidos (inclui os simulados antes de a API responder)
// os simulados mais recentes aparecem primeiro
function exemplosHtml(): string {
  return matchesSimulados(usuario.tipo)
    .slice()
    .reverse()
    .map((e) => renderExemplo(e))
    .join('');
}

async function init(): Promise<void> {
  const matches = await api.get<Match[]>('/matches');

  const cards = matches
    .map(renderCard)
    .filter(Boolean);

  totalReais = cards.length;
  atualizarTotal();

  listEl.innerHTML = cards.join('') + exemplosHtml();
}

init().catch((error) => {
  listEl.innerHTML =
    exemplosHtml() +
    `
    <p class="form-error matches-vazio">
      ${
        error instanceof ApiError
          ? error.message
          : 'Erro ao carregar matches.'
      }
    </p>
  `;

  atualizarTotal();
});

atualizarBotao();
