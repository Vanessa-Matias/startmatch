// Tela: Gestão de usuários — lógica
// ===================================
//
// Busca GET /users e permite:
// - pesquisar por nome;
// - filtrar por tipo;
// - filtrar por plano;
// - combinar os filtros;
// - limpar filtros.
//
// A lista é atualizada em tempo real.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Usuario } from '../../scripts/types';

// ============================================================
// AUTENTICAÇÃO
// ============================================================

const usuario = requireAuth(['admin']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);

// ============================================================
// ELEMENTOS
// ============================================================

const listEl =
  document.getElementById('usuarios-list') as HTMLDivElement;

const pesquisaNomeEl =
  document.getElementById('pesquisa-nome') as HTMLInputElement;

const filtroTipoEl =
  document.getElementById('filtro-tipo') as HTMLSelectElement;

const filtroPlanoEl =
  document.getElementById('filtro-plano') as HTMLSelectElement;

const limparFiltrosEl =
  document.getElementById('limpar-filtros') as HTMLButtonElement;

const usuariosCountEl =
  document.getElementById('usuarios-count') as HTMLSpanElement;

// ============================================================
// DADOS
// ============================================================

let usuarios: Usuario[] = [];

// ============================================================
// LABELS
// ============================================================

const TIPO_LABEL: Record<string, string> = {
  startup: 'Startup',
  investidor: 'Investidor',
  mentor: 'Mentor',
  admin: 'Admin',
};

const PLANO_LABEL: Record<string, string> = {
  basico: 'Básico',
  plus: 'Plus',
  premium: 'Premium',
};

// ============================================================
// NORMALIZA TEXTO
// ============================================================

function normalizarTexto(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ============================================================
// NOME DO PLANO
// ============================================================

function nomePlano(plano: unknown): string {
  const valor = normalizarTexto(plano);

  return PLANO_LABEL[valor] ?? String(plano ?? 'Não informado');
}

// ============================================================
// RENDERIZA USUÁRIO
// ============================================================

function renderLinha(u: Usuario): string {
  const tipoLabel =
    TIPO_LABEL[u.tipo] ?? u.tipo;

  /*
   * O endpoint /users pode trazer apenas os dados
   * básicos do usuário.
   *
   * Por isso usamos uma leitura segura do plano,
   * caso ele exista no retorno.
   */

  const plano = (u as Usuario & {
    planoAssinatura?: string;
  }).planoAssinatura;

  const planoHtml = plano
    ? `
        <span class="user-card-plan">
          Plano ${nomePlano(plano)}
        </span>
      `
    : '';

  const dataCadastro = u.criadoEm
    ? new Date(u.criadoEm).toLocaleDateString('pt-BR')
    : 'Não informado';

  return `
    <article class="user-card">

      <div class="user-card-header">

        <h3 class="user-card-name">
          ${u.nome}
        </h3>

        <span class="user-card-type">
          ${tipoLabel}
        </span>

      </div>

      <p class="user-card-info">
        Cadastrado em ${dataCadastro}
      </p>

      ${planoHtml}

    </article>
  `;
}

// ============================================================
// FILTROS
// ============================================================

function obterUsuariosFiltrados(): Usuario[] {

  const pesquisa = normalizarTexto(
    pesquisaNomeEl.value,
  );

  const tipoSelecionado =
    filtroTipoEl.value;

  const planoSelecionado =
    filtroPlanoEl.value;

  return usuarios.filter((u) => {

    // --------------------------------------------------------
    // Filtro por nome
    // --------------------------------------------------------

    const nome = normalizarTexto(u.nome);

    const correspondeNome =
      !pesquisa ||
      nome.includes(pesquisa);

    // --------------------------------------------------------
    // Filtro por tipo
    // --------------------------------------------------------

    const correspondeTipo =
      tipoSelecionado === 'todos' ||
      normalizarTexto(u.tipo) ===
        normalizarTexto(tipoSelecionado);

    // --------------------------------------------------------
    // Filtro por plano
    // --------------------------------------------------------

    const plano =
      (u as Usuario & {
        planoAssinatura?: string;
      }).planoAssinatura;

    const correspondePlano =
      planoSelecionado === 'todos' ||
      normalizarTexto(plano) ===
        normalizarTexto(planoSelecionado);

    return (
      correspondeNome &&
      correspondeTipo &&
      correspondePlano
    );
  });
}

// ============================================================
// RENDERIZA LISTA
// ============================================================

function renderUsuarios(): void {

  const filtrados =
    obterUsuariosFiltrados();

  usuariosCountEl.innerHTML = `
    <strong>${filtrados.length}</strong>
    ${
      filtrados.length === 1
        ? 'usuário encontrado'
        : 'usuários encontrados'
    }
  `;

  if (filtrados.length === 0) {

    listEl.innerHTML = `
      <p class="empty-message">
        Nenhum usuário encontrado com os filtros selecionados.
      </p>
    `;

    return;
  }

  listEl.innerHTML =
    filtrados
      .map(renderLinha)
      .join('');
}

// ============================================================
// EVENTOS DOS FILTROS
// ============================================================

pesquisaNomeEl.addEventListener(
  'input',
  renderUsuarios,
);

filtroTipoEl.addEventListener(
  'change',
  renderUsuarios,
);

filtroPlanoEl.addEventListener(
  'change',
  renderUsuarios,
);

// ============================================================
// LIMPAR FILTROS
// ============================================================

limparFiltrosEl.addEventListener(
  'click',
  () => {

    pesquisaNomeEl.value = '';

    filtroTipoEl.value = 'todos';

    filtroPlanoEl.value = 'todos';

    renderUsuarios();
  },
);

// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function init(): Promise<void> {

  usuarios = await api.get<Usuario[]>(
    '/users',
  );

  renderUsuarios();
}

// ============================================================
// TRATAMENTO DE ERRO
// ============================================================

init().catch((error) => {

  const mensagem =
    error instanceof ApiError
      ? error.message
      : 'Erro ao carregar usuários.';

  usuariosCountEl.textContent = '';

  listEl.innerHTML = `
    <p class="form-error">
      ${mensagem}
    </p>
  `;
});