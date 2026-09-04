// Tela: Interesses — lógica
// ==========================
//
// Busca os interesses recebidos e enviados.
// Os dois endpoints já existem no backend.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Interesse } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

const recebidosEl = document.getElementById(
  'interesses-recebidos'
) as HTMLDivElement;

const enviadosEl = document.getElementById(
  'interesses-enviados'
) as HTMLDivElement;

const totalEl = document.getElementById(
  'interesses-total'
) as HTMLElement;

const tipoContraparte =
  usuario.tipo === 'startup'
    ? 'investidor'
    : 'startup';

function contraparteId(interesse: Interesse): number {
  return tipoContraparte === 'investidor'
    ? interesse.investidorId
    : interesse.startupId;
}

function getNome(interesse: Interesse): string {
  if (tipoContraparte === 'investidor') {
    return 'Investidor';
  }

  return `Startup #${interesse.startupId}`;
}

function getInitials(nome: string): string {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!partes.length) {
    return 'SM';
  }

  return partes
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function renderLista(
  container: HTMLDivElement,
  interesses: Interesse[],
  vazioMsg: string
): void {
  if (interesses.length === 0) {
    container.innerHTML = `
      <p class="text-muted">
        ${vazioMsg}
      </p>
    `;

    return;
  }

  container.innerHTML = interesses
    .map((interesse) => {
      const id = contraparteId(interesse);
      const nome = getNome(interesse);

      const data = new Date(
        interesse.criadoEm
      ).toLocaleDateString('pt-BR');

      return `
        <a
          class="interesse-card"
          href="../perfil/index.html?tipo=${tipoContraparte}&id=${id}"
        >

          <div class="interesse-card-top">

            <div class="interesse-avatar">
              ${getInitials(nome)}
            </div>

            <div class="interesse-person">

              <div class="interesse-name">
                ${nome}
              </div>

              <div class="interesse-location">
                ${tipoContraparte === 'investidor'
                  ? 'Investidor'
                  : 'Startup'}
              </div>

            </div>

          </div>

          <span class="badge badge-success">
            Interesse
          </span>

          <div class="interesse-date">
            Interesse registrado em ${data}
          </div>

          <div class="interesse-footer">

            <span class="interesse-status">
              Aguardando conexão
            </span>

            <span class="btn btn-primary">
              Ver perfil
            </span>

          </div>

        </a>
      `;
    })
    .join('');
}

async function init(): Promise<void> {
  const [recebidos, enviados] = await Promise.all([
    api.get<Interesse[]>('/interests/received'),
    api.get<Interesse[]>('/interests/sent'),
  ]);

  totalEl.textContent = String(
    recebidos.length + enviados.length
  );

  renderLista(
    recebidosEl,
    recebidos,
    'Nenhum interesse recebido ainda.'
  );

  renderLista(
    enviadosEl,
    enviados,
    'Você ainda não demonstrou interesse em ninguém — explore a busca!'
  );
}

init().catch((error) => {
  const mensagem =
    error instanceof ApiError
      ? error.message
      : 'Erro ao carregar interesses.';

  recebidosEl.innerHTML = `
    <p class="form-error">
      ${mensagem}
    </p>
  `;

  enviadosEl.innerHTML = `
    <p class="text-muted">
      Não foi possível carregar os interesses enviados.
    </p>
  `;

  totalEl.textContent = '—';
});