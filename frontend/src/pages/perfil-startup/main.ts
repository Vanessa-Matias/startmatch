import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Startup } from '../../scripts/types';

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

if (!id) {
  detalheEl.innerHTML = `
    <p class="form-error">
      Perfil da startup inválido.
    </p>
  `;

  btnInteresse.hidden = true;

  throw new Error('ID da startup não informado.');
}

const ESTAGIO_LABEL: Record<string, string> = {
  ideacao: 'Ideação',
  mvp: 'MVP',
  operacao: 'Operação',
  scale_up: 'Scale-up',
};

function renderStartup(startup: Startup): void {
  detalheEl.innerHTML = `
    <div class="perfil-startup">

      <div class="perfil-startup-header">
        <div>
          <h1>${startup.nomeFantasia}</h1>

          <p class="text-muted">
            ${startup.cidade}/${startup.uf}
          </p>
        </div>

        <span class="badge">
          ${ESTAGIO_LABEL[startup.estagio] ?? startup.estagio}
        </span>
      </div>

      <div class="perfil-startup-body">

        <section>
          <h2>Sobre a startup</h2>
          <p>${startup.descricao}</p>
        </section>

        <section>
          <h2>Investimento pretendido</h2>

          <p>
            R$ ${Number(startup.investimentoPretendido).toLocaleString('pt-BR')}
          </p>
        </section>

        <section>
          <h2>Segmentos</h2>

          <div class="perfil-startup-segmentos">
            ${startup.segmentos
              .map(
                (segmento) => `
                  <span class="badge">
                    ${segmento.nome}
                    ${segmento.principal ? ' ★' : ''}
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
  btnInteresse.textContent = 'Interesse registrado';
}

async function carregarPerfil(): Promise<void> {
  try {
    const startup = await api.get<Startup>(
      `/startups/${id}`
    );

    renderStartup(startup);

    /*
     * Apenas investidores podem demonstrar interesse
     * em uma startup.
     */
    if (usuario.tipo !== 'investidor') {
      btnInteresse.hidden = true;
    }
  } catch (error) {
    detalheEl.innerHTML = `
      <p class="form-error">
        ${
          error instanceof ApiError
            ? error.message
            : 'Erro ao carregar perfil da startup.'
        }
      </p>
    `;

    btnInteresse.hidden = true;
  }
}

btnInteresse.addEventListener('click', async () => {
  errorEl.textContent = '';

  try {
    await api.post('/interests', {
      contraparteId: Number(id),
    });

    marcarInteresseRegistrado();
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
});

void carregarPerfil();