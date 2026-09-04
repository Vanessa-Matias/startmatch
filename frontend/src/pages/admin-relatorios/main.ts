// =========================================================
// Tela: Relatórios (Admin)
// =========================================================
//
// Relatório administrativo consolidado da plataforma.
//
// Utiliza somente o endpoint já existente:
// GET /admin/metrics
//
// O histórico acumulado fica preparado no frontend.
// Quando o backend disponibilizar os dados históricos,
// eles poderão ser conectados à função renderHistorico().
//
// Não altera dados e não interfere nas telas dos demais
// perfis.
// =========================================================

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { AdminMetrics } from '../../scripts/types';

// =========================================================
// AUTENTICAÇÃO
// =========================================================

const usuario = requireAuth(['admin']);

// =========================================================
// NAVBAR
// =========================================================

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);

// =========================================================
// ELEMENTOS
// =========================================================

const usuariosTipoEl = document.getElementById(
  'usuarios-tipo',
) as HTMLTableSectionElement;

const startupsEstagioEl = document.getElementById(
  'startups-estagio',
) as HTMLTableSectionElement;

const totalUsuariosEl = document.getElementById(
  'total-usuarios',
) as HTMLSpanElement;

const totalStartupsEl = document.getElementById(
  'total-startups',
) as HTMLSpanElement;

const totalInvestidoresEl = document.getElementById(
  'total-investidores',
) as HTMLSpanElement;

const totalMentoresEl = document.getElementById(
  'total-mentores',
) as HTMLSpanElement;

const btnHistorico = document.getElementById(
  'btn-historico',
) as HTMLButtonElement;

const historicoContent = document.getElementById(
  'historico-content',
) as HTMLDivElement;

const historicoRelatorioEl = document.getElementById(
  'historico-relatorio',
) as HTMLTableSectionElement;

const historicoPeriodoEl = document.getElementById(
  'historico-periodo',
) as HTMLSelectElement;

// =========================================================
// HISTÓRICO
// =========================================================

interface HistoricoRelatorio {
  periodo: string;
  usuarios: number;
  startups: number;
  investidores: number;
  mentores: number;
}

let historico: HistoricoRelatorio[] = [];

// =========================================================
// NORMALIZAR TEXTOS
// =========================================================
//
// Corrige termos que podem vir do backend sem acentuação.
//
// Exemplos:
// operacao -> Operação
// ideacao  -> Ideação
//
// Outros textos permanecem como vieram da API.
// =========================================================

function formatarTextoRelatorio(
  valor: string,
): string {
  const texto = valor.trim();

  if (!texto) {
    return texto;
  }

  const termos: Record<string, string> = {
    admin: 'Admin',
    administrador: 'Administrador',
    administradora: 'Administradora',
    startup: 'Startup',
    startups: 'Startups',
    investidor: 'Investidor',
    investidores: 'Investidores',
    mentor: 'Mentor',
    mentores: 'Mentores',

    ideacao: 'Ideação',
    'ideação': 'Ideação',

    validacao: 'Validação',
    'validação': 'Validação',

    operacao: 'Operação',
    'operação': 'Operação',

    crescimento: 'Crescimento',
    escala: 'Escala',
  };

  const chave = texto.toLowerCase();

  if (termos[chave]) {
    return termos[chave];
  }

  /*
   * Para qualquer outro texto que venha do backend,
   * coloca a primeira letra de cada palavra em maiúscula.
   */

  return texto
    .toLocaleLowerCase('pt-BR')
    .replace(
      /(^|\s)([a-záàâãéêíóôõúç])/g,
      (_match, inicio, letra) =>
        `${inicio}${letra.toLocaleUpperCase('pt-BR')}`,
    );
}
// =========================================================
// TOTAL
// =========================================================

function calcularTotal(
  mapa: Record<string, number>,
): number {
  return Object.values(mapa).reduce(
    (total, quantidade) => total + quantidade,
    0,
  );
}

// =========================================================
// LOCALIZAR TIPO
// =========================================================

function encontrarTipo(
  mapa: Record<string, number>,
  tipo: string,
): number {
  const entrada = Object.entries(mapa).find(
    ([chave]) =>
      chave.toLowerCase() === tipo.toLowerCase(),
  );

  return entrada?.[1] ?? 0;
}

// =========================================================
// FORMATAR PERCENTUAL
// =========================================================

function calcularPercentual(
  valor: number,
  total: number,
): string {
  if (total <= 0) {
    return '0%';
  }

  return `${((valor / total) * 100).toFixed(1)}%`;
}

// =========================================================
// ESCAPE DE HTML
// =========================================================

function escapeHtml(valor: string): string {
  return valor
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// =========================================================
// RENDERIZAR TABELA
// =========================================================

function renderTabela(
  container: HTMLTableSectionElement,
  mapa: Record<string, number>,
  total: number,
): void {
  const entradas = Object.entries(mapa);

  if (entradas.length === 0) {
    container.innerHTML = `
      <tr>
        <td
          colspan="3"
          class="admin-relatorios-empty"
        >
          Nenhum dado disponível.
        </td>
      </tr>
    `;

    return;
  }

  const linhas = entradas
    .sort(([, quantidadeA], [, quantidadeB]) => {
      return quantidadeB - quantidadeA;
    })
    .map(([chave, quantidade]) => {
      const percentual = calcularPercentual(
        quantidade,
        total,
      );

      const percentualNumero =
        total > 0
          ? (quantidade / total) * 100
          : 0;

      const nomeFormatado =
        formatarTextoRelatorio(chave);

      return `
        <tr>
          <td>
            ${escapeHtml(nomeFormatado)}
          </td>

          <td>
            <div class="admin-relatorios-proporcao">
              <div class="admin-relatorios-barra">
                <div
                  class="admin-relatorios-barra-fill"
                  style="width: ${percentualNumero}%"
                ></div>
              </div>

              <span class="admin-relatorios-percentual">
                ${percentual}
              </span>
            </div>
          </td>

          <td class="admin-relatorios-table-value">
            ${quantidade}
          </td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    ${linhas}

    <tr class="admin-relatorios-table-total">
      <td>Total</td>

      <td>
        100%
      </td>

      <td class="admin-relatorios-table-value">
        ${total}
      </td>
    </tr>
  `;
}

// =========================================================
// FILTRAR HISTÓRICO
// =========================================================

function filtrarHistorico(
  dados: HistoricoRelatorio[],
  filtro: string,
): HistoricoRelatorio[] {
  if (filtro === 'todos') {
    return dados;
  }

  /*
   * O formato definitivo dos períodos ainda será definido
   * pelo backend.
   *
   * A estrutura do filtro já está preparada para receber
   * essa informação posteriormente.
   */

  return dados;
}

// =========================================================
// RENDERIZAR HISTÓRICO
// =========================================================

function renderHistorico(): void {
  const filtro = historicoPeriodoEl.value;

  const dadosFiltrados = filtrarHistorico(
    historico,
    filtro,
  );

  if (dadosFiltrados.length === 0) {
    historicoRelatorioEl.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="admin-relatorios-empty"
        >
          Nenhum dado histórico disponível no momento.
        </td>
      </tr>
    `;

    return;
  }

  historicoRelatorioEl.innerHTML = dadosFiltrados
    .map((item) => {
      return `
        <tr>
          <td>
            ${escapeHtml(item.periodo)}
          </td>

          <td class="admin-relatorios-historico-table-value">
            ${item.usuarios}
          </td>

          <td class="admin-relatorios-historico-table-value">
            ${item.startups}
          </td>

          <td class="admin-relatorios-historico-table-value">
            ${item.investidores}
          </td>

          <td class="admin-relatorios-historico-table-value">
            ${item.mentores}
          </td>
        </tr>
      `;
    })
    .join('');
}

// =========================================================
// ABRIR / FECHAR HISTÓRICO
// =========================================================

function alternarHistorico(): void {
  const aberto =
    btnHistorico.getAttribute('aria-expanded') === 'true';

  const novoEstado = !aberto;

  btnHistorico.setAttribute(
    'aria-expanded',
    String(novoEstado),
  );

  historicoContent.classList.toggle(
    'is-open',
    novoEstado,
  );

  historicoContent.hidden = !novoEstado;

  if (novoEstado) {
    renderHistorico();
  }
}

btnHistorico.addEventListener(
  'click',
  alternarHistorico,
);

// =========================================================
// FILTRO DO HISTÓRICO
// =========================================================

historicoPeriodoEl.addEventListener(
  'change',
  () => {
    renderHistorico();
  },
);

// =========================================================
// CARREGAMENTO
// =========================================================

async function init(): Promise<void> {
  const metrics = await api.get<AdminMetrics>(
    '/admin/metrics',
  );

  // =======================================================
  // TOTAIS
  // =======================================================

  const totalUsuarios = calcularTotal(
    metrics.usuariosPorTipo,
  );

  const totalStartups = calcularTotal(
    metrics.startupsPorEstagio,
  );

  const totalInvestidores = encontrarTipo(
    metrics.usuariosPorTipo,
    'investidor',
  );

  const totalMentores = encontrarTipo(
    metrics.usuariosPorTipo,
    'mentor',
  );

  // =======================================================
  // RESUMO
  // =======================================================

  totalUsuariosEl.textContent =
    String(totalUsuarios);

  totalStartupsEl.textContent =
    String(totalStartups);

  totalInvestidoresEl.textContent =
    String(totalInvestidores);

  totalMentoresEl.textContent =
    String(totalMentores);

  // =======================================================
  // TABELA DE USUÁRIOS
  // =======================================================

  renderTabela(
    usuariosTipoEl,
    metrics.usuariosPorTipo,
    totalUsuarios,
  );

  // =======================================================
  // TABELA DE STARTUPS
  // =======================================================

  renderTabela(
    startupsEstagioEl,
    metrics.startupsPorEstagio,
    totalStartups,
  );

  // =======================================================
  // HISTÓRICO
  // =======================================================

  historico = [];

  renderHistorico();
}

// =========================================================
// TRATAMENTO DE ERRO
// =========================================================

init().catch((error: unknown) => {
  const mensagem =
    error instanceof ApiError
      ? error.message
      : 'Erro ao carregar relatórios.';

  // =======================================================
  // RESUMO
  // =======================================================

  totalUsuariosEl.textContent = '—';
  totalStartupsEl.textContent = '—';
  totalInvestidoresEl.textContent = '—';
  totalMentoresEl.textContent = '—';

  // =======================================================
  // USUÁRIOS
  // =======================================================

  usuariosTipoEl.innerHTML = `
    <tr>
      <td
        colspan="3"
        class="form-error admin-relatorios-empty"
      >
        ${escapeHtml(mensagem)}
      </td>
    </tr>
  `;

  // =======================================================
  // STARTUPS
  // =======================================================

  startupsEstagioEl.innerHTML = `
    <tr>
      <td
        colspan="3"
        class="form-error admin-relatorios-empty"
      >
        Não foi possível carregar os dados.
      </td>
    </tr>
  `;

  // =======================================================
  // HISTÓRICO
  // =======================================================

  historico = [];

  renderHistorico();
});