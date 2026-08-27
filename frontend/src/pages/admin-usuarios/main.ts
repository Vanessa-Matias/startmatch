// Tela: Gestão de usuários — lógica
// ===================================
// Busca GET /users (endpoint novo, só admin — RolesGuard no backend) e desenha
// uma linha por usuário. Sem paginação nesta 1ª entrega — para uma base de
// usuários pequena (escopo acadêmico) uma lista simples já é suficiente.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Usuario } from '../../scripts/types';

const usuario = requireAuth(['admin']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const listEl = document.getElementById('usuarios-list') as HTMLDivElement;

const TIPO_LABEL: Record<string, string> = {
  startup: 'Startup',
  investidor: 'Investidor',
  mentor: 'Mentor',
  admin: 'Admin',
};

function renderLinha(u: Usuario): string {
  return `
    <div class="card">
      <div class="card-title">${u.nome} <span class="badge">${TIPO_LABEL[u.tipo] ?? u.tipo}</span></div>
      <p class="text-muted">${u.email}</p>
      <p class="text-muted">Cadastrado em ${new Date(u.criadoEm).toLocaleDateString('pt-BR')}</p>
    </div>
  `;
}

async function init(): Promise<void> {
  const usuarios = await api.get<Usuario[]>('/users');
  listEl.innerHTML = usuarios.map(renderLinha).join('');
}

init().catch((error) => {
  listEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar usuários.'}</p>`;
});
