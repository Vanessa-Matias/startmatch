// Tela: Matches — lógica
// =======================
//
// Busca os matches confirmados e preenche o layout da tela.
// O HTML já exibe a estrutura visual enquanto a API está carregando.
//
// Além dos matches reais, a tela mostra matches de exemplo (marcados como
// "simulação") no mesmo formato de card. O aviso "É um match!" agora aparece nas
// telas de perfil, quando o interesse vira match de verdade — ver
// scripts/matchModal.ts. Os exemplos ficam só no navegador (sessionStorage),
// nada vai para o banco — ver scripts/matchSimulado.ts.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import {
  matchesSimulados,
  type MatchExemplo,
} from '../../scripts/matchSimulado';
import { avatarImg, generoPorNome } from '../../scripts/avatars';
import { extraInvestidor, extraStartup } from '../../scripts/perfilExtra';
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

let totalReais = 0;

/*
 * ================================
 * CARDS
 * ================================
 */

function getNome(match: Match): string {
  if (usuario.tipo === 'startup') return match.investidor?.nome ?? 'Investidor';

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

interface CardDados {
  nome: string;
  localizacao: string;
  descricao: string;
  score: number;
  href: string;
  simulado: boolean;
  novo?: boolean;
  /** HTML do avatar/logo (img). */
  avatar: string;
}

function cardHtml(dados: CardDados): string {
  return `
    <a
      class="match-card${dados.novo ? ' match-card--novo' : ''}"
      href="${dados.href}"
    >
      <div class="match-card-top">
        ${dados.avatar}

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

  const nome = getNome(match);
  const avatar =
    usuario.tipo === 'startup' && match.investidor
      ? (() => {
          const extra = extraInvestidor({ ...match.investidor, nome });
          return avatarImg(nome, { genero: extra.genero, foto: extra.foto, tamanho: 48 });
        })()
      : match.startup
        ? (() => {
            const extra = extraStartup(match.startup);
            return avatarImg(nome, { tipo: 'startup', cor: extra.logoCor ?? undefined, tamanho: 48 });
          })()
        : avatarImg(nome, { genero: generoPorNome(nome), tamanho: 48 });

  return cardHtml({
    nome,
    localizacao: getLocalizacao(match),
    descricao: getDescricao(match),
    score: match.scoreCompatibilidade,
    href: `../mensagens/index.html?matchId=${match.id}`,
    simulado: false,
    avatar,
  });
}

function renderExemplo(exemplo: MatchExemplo): string {
  const eLogo = exemplo.papel === 'startup' || exemplo.id === 'rede-nordeste-anjos';
  return cardHtml({
    ...exemplo,
    href: `../mensagens/index.html?simulado=${exemplo.id}`,
    simulado: true,
    avatar: avatarImg(exemplo.nome, {
      tipo: eLogo ? 'startup' : 'pessoa',
      genero: exemplo.genero,
      tamanho: 48,
    }),
  });
}

function atualizarTotal(): void {
  totalEl.textContent = String(totalReais + matchesSimulados(usuario.tipo).length);
}

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

