// Tela: Governança e LGPD — lógica

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['admin']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);