// Tela: Relatórios — lógica
// ===========================
// Não chama nenhum endpoint novo: busca GET /interests/sent e GET /matches (já
// usados noutras telas) e calcula, no próprio frontend, alguns indicadores
// simples — total de interesses enviados, total de matches e taxa de conversão.
// O "relatório agregado do ecossistema" (Premium) é só uma prévia estática por
// enquanto (ver comentário no index.html desta tela).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Interesse, Match } from '../../scripts/types';

const usuario = requireAuth(['investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const metricasEl = document.getElementById('metricas') as HTMLDivElement;

function metricCard(titulo: string, valor: string | number, descricao: string): string {
  return `
    <div class="card">
      <div class="card-title">${valor}</div>
      <p>${titulo}</p>
      <p class="text-muted">${descricao}</p>
    </div>
  `;
}

async function init(): Promise<void> {
  const [enviados, matches] = await Promise.all([
    api.get<Interesse[]>('/interests/sent'),
    api.get<Match[]>('/matches'),
  ]);

  const totalEnviados = enviados.length;
  const totalMatches = matches.length;
  const taxaConversao = totalEnviados === 0 ? 0 : Math.round((totalMatches / totalEnviados) * 100);
  const scoreMedio =
    totalMatches === 0
      ? 0
      : Math.round(matches.reduce((soma, m) => soma + m.scoreCompatibilidade, 0) / totalMatches);

  metricasEl.innerHTML = [
    metricCard('Interesses enviados', totalEnviados, 'Startups em que você demonstrou interesse.'),
    metricCard('Matches confirmados', totalMatches, 'Interesse mútuo — conexões ativas.'),
    metricCard('Taxa de conversão', `${taxaConversao}%`, 'Interesses que viraram match.'),
    metricCard('Score médio de compatibilidade', scoreMedio, 'Média dos seus matches, de 0 a 100.'),
  ].join('');
}

init().catch((error) => {
  metricasEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao calcular relatórios.'}</p>`;
});
