import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { abrirModalMatch, iniciais } from '../../scripts/matchModal';
import type { Investidor, Match } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const detalheEl = document.getElementById(
  'perfil-detalhe'
) as HTMLDivElement;

const btnInteresse = document.getElementById(
  'btn-interesse'
) as HTMLButtonElement;

const errorEl = document.getElementById(
  'form-error'
) as HTMLParagraphElement;

let investidorAtual: Investidor | null = null;

if (!id) {
  detalheEl.innerHTML = `
    <p class="form-error">
      Perfil do investidor inválido.
    </p>
  `;

  btnInteresse.hidden = true;

  throw new Error(
    'ID do investidor não informado.'
  );
}

function renderInvestidor(
  investidor: Investidor
): void {
  detalheEl.innerHTML = `
    <div class="perfil-investidor">

      <div class="perfil-investidor-header">

        <div>
          <h1>
            ${investidor.tipo.toUpperCase()}
          </h1>

          <p class="text-muted">
            ${investidor.cidade}/${investidor.uf}
          </p>
        </div>

      </div>

      <div class="perfil-investidor-body">

        <section>
          <h2>Tese de investimento</h2>

          <p>
            ${investidor.teseInvestimento}
          </p>
        </section>

        <section>
          <h2>Faixa de investimento</h2>

          <p>
            R$
            ${Number(investidor.investimentoMin).toLocaleString('pt-BR')}
            –
            R$
            ${Number(investidor.investimentoMax).toLocaleString('pt-BR')}
          </p>
        </section>

        <section>
          <h2>Segmentos de interesse</h2>

          <div class="perfil-investidor-segmentos">

            ${investidor.segmentos
              .map(
                (segmento) => `
                  <span class="badge">
                    ${segmento.nome}
                  </span>
                `
              )
              .join('')}

          </div>
        </section>

      </div>

    </div>
  `;
}

function marcarInteresseRegistrado(): void {
  btnInteresse.disabled = true;
  btnInteresse.textContent =
    'Interesse registrado';
}

async function carregarPerfil(): Promise<void> {
  try {
    const investidor =
      await api.get<Investidor>(
        `/investors/${id}`
      );

    investidorAtual = investidor;
    renderInvestidor(investidor);

    /*
     * Apenas startups podem demonstrar interesse
     * em investidores.
     */
    if (usuario.tipo !== 'startup') {
      btnInteresse.hidden = true;
    }
  } catch (error) {
    detalheEl.innerHTML = `
      <p class="form-error">
        ${
          error instanceof ApiError
            ? error.message
            : 'Erro ao carregar perfil do investidor.'
        }
      </p>
    `;

    btnInteresse.hidden = true;
  }
}

/*
 * Depois do interesse, confere se o outro lado já tinha demonstrado
 * interesse: nesse caso a API criou o match e mostramos o "É um match!".
 */
async function avisarSeDeuMatch(): Promise<void> {
  try {
    const matches = await api.get<Match[]>('/matches');
    const match = matches.find(
      (m) => m.investidorId === Number(id)
    );
    if (!match) return;

    abrirModalMatch({
      iniciaisVoce: iniciais(usuario.nome),
      iniciaisOutro: 'IN',
      nomeOutro: investidorAtual
        ? `Investidor (${investidorAtual.cidade}/${investidorAtual.uf})`
        : 'o investidor',
      score: match.scoreCompatibilidade,
      hrefMatches: '../matches/index.html',
    });
  } catch {
    // O interesse já foi salvo; se a checagem falhar, o match continua
    // disponível na aba Matches.
  }
}

btnInteresse.addEventListener(
  'click',
  async () => {
    errorEl.textContent = '';

    try {
      await api.post('/interests', {
        contraparteId: Number(id),
      });

      marcarInteresseRegistrado();
      await avisarSeDeuMatch();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409
      ) {
        marcarInteresseRegistrado();
        return;
      }

      errorEl.textContent =
        error instanceof ApiError
          ? error.message
          : 'Erro ao registrar interesse.';
    }
  }
);

void carregarPerfil();