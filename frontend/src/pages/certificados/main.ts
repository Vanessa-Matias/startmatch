// Tela: Certificados — lógica
// =============================
// Página só protegida por papel + menu — a exportação real depende do histórico
// de sessões de mentoria, que ainda não existe no backend (ver comentário no
// index.html desta tela).

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);
