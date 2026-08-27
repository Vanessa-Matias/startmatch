// Tela: Agenda — lógica
// =======================
// Por enquanto só lê o campo "disponibilidade" do perfil do mentor (texto livre
// cadastrado em cadastro-mentor/). A lista de sessões agendadas fica vazia de
// propósito (ver comentário no index.html desta tela) até existir uma entidade de
// sessão de mentoria no backend.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

const usuario = requireAuth(['mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const disponibilidadeEl = document.getElementById('disponibilidade') as HTMLParagraphElement;

async function init(): Promise<void> {
  const mentor = await api.get<Mentor>('/mentors/me');
  disponibilidadeEl.textContent = mentor.disponibilidade;
}

init().catch((error) => {
  disponibilidadeEl.textContent = error instanceof ApiError ? error.message : 'Erro ao carregar agenda.';
});
