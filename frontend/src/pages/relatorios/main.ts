// Tela: Relatórios — lógica
// ===========================
//
// Não chama nenhum endpoint novo: busca GET /interests/sent
// e GET /matches (já usados noutras telas) e calcula,
// no próprio frontend, alguns indicadores simples.
//
// Indicadores:
// - total de interesses enviados
// - total de matches
// - taxa de conversão
// - score médio de compatibilidade

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

import type {
  Interesse,
  Match,
} from '../../scripts/types';


const usuario = requireAuth(['investidor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);


const metricasEl =
  document.getElementById('metricas') as HTMLDivElement;


// =========================
// CARD DE MÉTRICA
// =========================

function metricCard(
  titulo: string,
  valor: string | number,
  descricao: string,
): string {

  return `
    <div class="card relatorios-card">

      <div class="relatorios-card-number">
        ${valor}
      </div>

      <div class="relatorios-card-title">
        ${titulo}
      </div>

      <div class="relatorios-card-description">
        ${descricao}
      </div>

    </div>
  `;
}


// =========================
// CARREGAMENTO DOS DADOS
// =========================

async function init(): Promise<void> {

  const [enviados, matches] =
    await Promise.all([

      api.get<Interesse[]>(
        '/interests/sent',
      ),

      api.get<Match[]>(
        '/matches',
      ),

    ]);


  // Total de interesses enviados

  const totalEnviados =
    enviados.length;


  // Total de matches

  const totalMatches =
    matches.length;


  // Taxa de conversão

  const taxaConversao =
    totalEnviados === 0
      ? 0
      : Math.round(
          (totalMatches / totalEnviados) * 100,
        );


  // Score médio de compatibilidade

  const scoreMedio =
    totalMatches === 0
      ? 0
      : Math.round(
          matches.reduce(
            (soma, match) =>
              soma + match.scoreCompatibilidade,
            0,
          ) / totalMatches,
        );


  // =========================
  // RENDERIZAÇÃO
  // =========================

  metricasEl.innerHTML = [

    metricCard(
      'Interesses enviados',
      totalEnviados,
      'Startups em que você demonstrou interesse.',
    ),

    metricCard(
      'Matches confirmados',
      totalMatches,
      'Interesse mútuo — conexões ativas.',
    ),

    metricCard(
      'Taxa de conversão',
      `${taxaConversao}%`,
      'Interesses que viraram match.',
    ),

    metricCard(
      'Score médio de compatibilidade',
      scoreMedio,
      'Média dos seus matches, de 0 a 100.',
    ),

  ].join('');

}


// =========================
// TRATAMENTO DE ERRO
// =========================

init().catch((error) => {

  metricasEl.innerHTML = `
    <p class="form-error">
      ${
        error instanceof ApiError
          ? error.message
          : 'Erro ao calcular relatórios.'
      }
    </p>
  `;

});