// Tela: Solicitações — lógica
// =============================
// Ainda não existe endpoint de solicitação de mentoria no backend (ver
// comentário no index.html desta tela) — por enquanto só protege a tela por
// papel e monta o menu, sem buscar nada da API.

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);
