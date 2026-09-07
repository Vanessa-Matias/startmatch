// Tela: Governança e LGPD — lógica
// ===================================
// A tabela de mapeamento de dados e os controles de governança são conteúdo
// de referência (estático — descrevem POLÍTICA, não dado transacional). A
// seção "Consentimentos registrados" é a parte real: busca o resumo agregado
// em GET /admin/lgpd-summary (backend, AdminService.getLgpdSummary) e mostra
// quantos consentimentos já foram de fato aceitos pelos usuários.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { LgpdSummary } from '../../scripts/types';

const usuario = requireAuth(['admin']);

renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const totalEl = document.getElementById(
  'lgpd-total-consentimentos'
) as HTMLElement;
const termosEl = document.getElementById('lgpd-termos-uso') as HTMLElement;
const privacidadeEl = document.getElementById(
  'lgpd-privacidade'
) as HTMLElement;
const marketingEl = document.getElementById('lgpd-marketing') as HTMLElement;

async function init(): Promise<void> {
  try {
    const resumo = await api.get<LgpdSummary>('/admin/lgpd-summary');

    totalEl.textContent = String(resumo.totalConsentimentosAceitos);
    termosEl.textContent = String(resumo.porTipo['termos_uso'] ?? 0);
    privacidadeEl.textContent = String(resumo.porTipo['privacidade'] ?? 0);
    marketingEl.textContent = String(resumo.porTipo['marketing'] ?? 0);
  } catch (error) {
    const mensagem =
      error instanceof ApiError ? error.message : 'Erro ao carregar dados.';

    totalEl.textContent = '—';
    termosEl.textContent = '—';
    privacidadeEl.textContent = '—';
    marketingEl.textContent = '—';
    totalEl.title = mensagem;
  }
}

init();
