// Tela: Histórico de mentorias — lógica
// =======================================
// Ainda sem backend de sessões de mentoria (ver comentário no index.html desta
// tela) — por enquanto só protege a tela por papel e monta o menu.

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);
