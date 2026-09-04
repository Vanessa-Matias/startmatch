// Tela: Histórico de mentorias — lógica

// =======================================
//
// Nesta primeira entrega, ainda não existe endpoint de sessões
// de mentoria no backend.
//
// Os dados abaixo são demonstrativos e ficam somente no frontend,
// deixando a estrutura pronta para receber os dados reais futuramente.
//
// =======================================

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['mentor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

// --------------------------------------------------
// Dados demonstrativos
// --------------------------------------------------

interface SessaoMentoria {
  startup: string;
  data: string;
  horario: string;
  duracao: string;
  formato: string;
  tema: string;
}

const sessoes: SessaoMentoria[] = [
  {
    startup: 'Startup #1',
    data: '02/09/2026',
    horario: '14:00',
    duracao: '1h',
    formato: 'Online',
    tema: 'Estratégia e crescimento da startup'
  }
];

// --------------------------------------------------
// Elementos
// --------------------------------------------------

const historicoList = document.getElementById(
  'historico-list'
) as HTMLElement;

const horasRealizadas = document.getElementById(
  'horas-realizadas'
) as HTMLElement;

const mentoriasConcluidas = document.getElementById(
  'mentorias-concluidas'
) as HTMLElement;

const startupsAtendidas = document.getElementById(
  'startups-atendidas'
) as HTMLElement;

const sessoesRealizadas = document.getElementById(
  'sessoes-realizadas'
) as HTMLElement;

const metaMentorias = document.getElementById(
  'meta-mentorias'
) as HTMLElement;

const progressoMentorias = document.getElementById(
  'progresso-mentorias'
) as HTMLElement;

// --------------------------------------------------
// Calcula e atualiza os indicadores
// --------------------------------------------------

function atualizarResumo(): void {
  const totalSessoes = sessoes.length;

  const startupsUnicas = new Set(
    sessoes.map((sessao) => sessao.startup)
  );

  const totalHoras = sessoes.reduce(
    (total, sessao) => {
      const duracao = sessao.duracao
        .replace('h', '')
        .replace(',', '.')
        .trim();

      const horas = Number(duracao);

      return total + (Number.isNaN(horas) ? 0 : horas);
    },
    0
  );

  // Horas realizadas
  horasRealizadas.textContent =
    totalHoras > 0
      ? `${totalHoras}h`
      : '0h';

  // Mentorias concluídas
  mentoriasConcluidas.textContent =
    String(totalSessoes);

  // Startups atendidas
  startupsAtendidas.textContent =
    String(startupsUnicas.size);

  // Sessões realizadas
  sessoesRealizadas.textContent =
    String(totalSessoes);

  // --------------------------------------------------
  // Meta demonstrativa mensal
  // --------------------------------------------------

  const meta = 5;

  const realizadas = Math.min(
    totalSessoes,
    meta
  );

  metaMentorias.textContent =
    `${realizadas} / ${meta}`;

  const percentual =
    meta > 0
      ? Math.min(
          (realizadas / meta) * 100,
          100
        )
      : 0;

  progressoMentorias.style.width =
    `${percentual}%`;
}

// --------------------------------------------------
// Renderiza as sessões
// --------------------------------------------------

function renderSessoes(): void {
  if (sessoes.length === 0) {
    historicoList.innerHTML = `
      <div class="card">
        <p class="text-muted">
          Nenhuma sessão registrada ainda.
        </p>
      </div>
    `;

    return;
  }

  historicoList.innerHTML = sessoes
    .map(
      (sessao) => `
        <article class="card historico-sessao">

          <div class="historico-sessao-header">

            <div class="historico-sessao-empresa">

              <h3>${sessao.startup}</h3>

              <p>
                Mentoria concluída
              </p>

            </div>

            <span class="badge badge-success">
              Concluída
            </span>

          </div>

          <div class="historico-sessao-detalhes">

            <div class="historico-detalhe">

              <span class="historico-detalhe-label">
                Data
              </span>

              <strong>
                ${sessao.data}
              </strong>

            </div>

            <div class="historico-detalhe">

              <span class="historico-detalhe-label">
                Horário
              </span>

              <strong>
                ${sessao.horario}
              </strong>

            </div>

            <div class="historico-detalhe">

              <span class="historico-detalhe-label">
                Duração
              </span>

              <strong>
                ${sessao.duracao}
              </strong>

            </div>

            <div class="historico-detalhe">

              <span class="historico-detalhe-label">
                Formato
              </span>

              <strong>
                ${sessao.formato}
              </strong>

            </div>

          </div>

          <div class="historico-sessao-tema">

            <span>
              Tema da mentoria
            </span>

            <strong>
              ${sessao.tema}
            </strong>

          </div>

        </article>
      `
    )
    .join('');
}

// --------------------------------------------------
// Inicialização
// --------------------------------------------------

atualizarResumo();
renderSessoes();