// Tela: Governança e LGPD — lógica
// ==================================
// Conteúdo de referência estático (ver comentário no index.html desta tela) —
// só protege a tela por papel e monta o menu.

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['admin']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);
