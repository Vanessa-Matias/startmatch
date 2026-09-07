// Tela: Auditoria — lógica
// ==========================
// Busca o histórico real de auditoria em GET /admin/audit-log (backend,
// módulo audit) e aplica os filtros no frontend sobre os dados já
// carregados. A exportação em PDF usa a impressão do navegador.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { AuditLogItem, PaginatedResponse } from '../../scripts/types';

const usuario = requireAuth(['admin']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

type EventoAuditoria = AuditLogItem;

// Populado em carregarEventos() com o retorno real de GET /admin/audit-log.
// Nenhum evento fictício é criado aqui.
let eventosAuditoria: EventoAuditoria[] = [];

const formFiltros = document.getElementById(
  'form-filtros-auditoria'
) as HTMLFormElement;

const campoData = document.getElementById(
  'auditoria-data'
) as HTMLInputElement;

const campoEvento = document.getElementById(
  'auditoria-evento'
) as HTMLSelectElement;

const campoUsuario = document.getElementById(
  'auditoria-usuario'
) as HTMLInputElement;

const btnLimpar = document.getElementById(
  'btn-limpar-auditoria'
) as HTMLButtonElement;

const btnExportarAuditoria = document.getElementById(
  'btn-exportar-auditoria'
) as HTMLButtonElement;

const tabela = document.getElementById(
  'tabela-auditoria'
) as HTMLTableSectionElement;

const totalEventos = document.getElementById(
  'total-eventos'
) as HTMLElement;

const totalAcessos = document.getElementById(
  'total-acessos'
) as HTMLElement;

const totalAdministrativas = document.getElementById(
  'total-administrativas'
) as HTMLElement;

const ultimoEvento = document.getElementById(
  'ultimo-evento'
) as HTMLElement;

const statusAuditoria = document.getElementById(
  'status-auditoria'
) as HTMLElement;

const statusRegistros = document.getElementById(
  'status-registros-auditoria'
) as HTMLElement;

const descricaoResultado = document.getElementById(
  'descricao-resultado-auditoria'
) as HTMLElement;

/* =========================================================
   SEGURANÇA
   ========================================================= */

function escaparHtml(valor: string): string {
  return valor
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* =========================================================
   FILTROS
   ========================================================= */

function obterEventosFiltrados(
  eventos: EventoAuditoria[]
): EventoAuditoria[] {
  const data = campoData.value;
  const tipo = campoEvento.value;

  const usuarioBusca = campoUsuario.value
    .trim()
    .toLocaleLowerCase('pt-BR');

  return eventos.filter((evento) => {
    const correspondeData =
      !data || evento.dataISO === data;

    const correspondeTipo =
      !tipo || evento.tipo === tipo;

    const correspondeUsuario =
      !usuarioBusca ||
      evento.usuario
        .toLocaleLowerCase('pt-BR')
        .includes(usuarioBusca) ||
      evento.email
        .toLocaleLowerCase('pt-BR')
        .includes(usuarioBusca) ||
      evento.acao
        .toLocaleLowerCase('pt-BR')
        .includes(usuarioBusca);

    return (
      correspondeData &&
      correspondeTipo &&
      correspondeUsuario
    );
  });
}

/* =========================================================
   RESULTADO
   ========================================================= */

function classeResultado(
  resultado: EventoAuditoria['resultado']
): string {
  if (resultado === 'Sucesso') {
    return 'admin-auditoria-result admin-auditoria-result-success';
  }

  if (resultado === 'Falha') {
    return 'admin-auditoria-result admin-auditoria-result-error';
  }

  return 'admin-auditoria-result admin-auditoria-result-pending';
}

/* =========================================================
   TABELA
   ========================================================= */

function renderizarTabela(
  eventos: EventoAuditoria[]
): void {
  if (eventos.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="admin-auditoria-empty">
            <h3 class="admin-auditoria-empty-title">
              Nenhum evento registrado
            </h3>

            <p class="admin-auditoria-empty-description">
              O histórico será exibido quando os registros de auditoria
              estiverem disponíveis.
            </p>
          </div>
        </td>
      </tr>
    `;

    return;
  }

  tabela.innerHTML = eventos
    .map(
      (evento) => `
        <tr>
          <td>
            ${escaparHtml(evento.data)}
          </td>

          <td>
            <strong>
              ${escaparHtml(evento.usuario)}
            </strong>

            <br />

            <span class="text-muted">
              ${escaparHtml(evento.email)}
            </span>
          </td>

          <td>
            ${escaparHtml(evento.evento)}
          </td>

          <td>
            ${escaparHtml(evento.acao)}
          </td>

          <td>
            <span class="${classeResultado(evento.resultado)}">
              ${escaparHtml(evento.resultado)}
            </span>
          </td>

          <td>
            ${escaparHtml(evento.origem)}
          </td>
        </tr>
      `
    )
    .join('');
}

/* =========================================================
   INDICADORES
   ========================================================= */

function atualizarIndicadores(
  eventos: EventoAuditoria[]
): void {
  totalEventos.textContent =
    String(eventos.length);

  const acessos = eventos.filter(
    (evento) => evento.tipo === 'login'
  ).length;

  const administrativas = eventos.filter(
    (evento) =>
      evento.tipo === 'plano' ||
      evento.tipo === 'mentor'
  ).length;

  totalAcessos.textContent =
    String(acessos);

  totalAdministrativas.textContent =
    String(administrativas);

  if (eventos.length === 0) {
    ultimoEvento.textContent =
      'Nenhum';

    statusAuditoria.textContent =
      'Sem registros';

    return;
  }

  ultimoEvento.textContent =
    eventos[eventos.length - 1].data;

  statusAuditoria.textContent =
    `${eventos.length} registro${
      eventos.length === 1 ? '' : 's'
    }`;
}

/* =========================================================
   STATUS DA CONSULTA
   ========================================================= */

function atualizarStatusConsulta(
  eventos: EventoAuditoria[]
): void {
  if (eventos.length === 0) {
    statusRegistros.textContent =
      'Nenhum resultado';

    descricaoResultado.textContent =
      'Nenhum evento corresponde aos filtros selecionados.';

    return;
  }

  statusRegistros.textContent =
    `${eventos.length} registro${
      eventos.length === 1 ? '' : 's'
    } encontrado${
      eventos.length === 1 ? '' : 's'
    }`;

  descricaoResultado.textContent =
    'Eventos de auditoria encontrados de acordo com os filtros selecionados.';
}

/* =========================================================
   CONSULTA
   ========================================================= */

function consultarEventos(): void {
  const eventosFiltrados =
    obterEventosFiltrados(
      eventosAuditoria
    );

  renderizarTabela(
    eventosFiltrados
  );

  atualizarIndicadores(
    eventosFiltrados
  );

  atualizarStatusConsulta(
    eventosFiltrados
  );
}

/* =========================================================
   LIMPAR FILTROS
   ========================================================= */

function limparFiltros(): void {
  campoData.value = '';
  campoEvento.value = '';
  campoUsuario.value = '';

  renderizarTabela(
    eventosAuditoria
  );

  atualizarIndicadores(
    eventosAuditoria
  );

  statusRegistros.textContent =
    'Aguardando registros';

  descricaoResultado.textContent =
    'O histórico será exibido quando os registros de auditoria estiverem disponíveis.';
}

/* =========================================================
   EXPORTAÇÃO PDF
   ========================================================= */

function exportarPdf(): void {
  window.print();
}

/* =========================================================
   EVENTOS
   ========================================================= */

formFiltros.addEventListener(
  'submit',
  (event) => {
    event.preventDefault();

    consultarEventos();
  }
);

btnLimpar.addEventListener(
  'click',
  () => {
    limparFiltros();
  }
);

btnExportarAuditoria.addEventListener(
  'click',
  () => {
    exportarPdf();
  }
);

/* =========================================================
   CARREGAMENTO
   ========================================================= */

async function carregarEventos(): Promise<void> {
  statusRegistros.textContent = 'Carregando...';

  try {
    const resposta = await api.get<PaginatedResponse<AuditLogItem>>(
      '/admin/audit-log?limit=200'
    );

    eventosAuditoria = resposta.items;

    consultarEventos();
  } catch (error) {
    renderizarTabela([]);
    atualizarIndicadores([]);

    statusRegistros.textContent = 'Erro ao carregar';

    descricaoResultado.textContent =
      error instanceof ApiError
        ? error.message
        : 'Não foi possível carregar o histórico de auditoria.';
  }
}

carregarEventos();