// Tela: Plano e assinatura — lógica
// ===================================
// Busca o perfil de negócio do usuário (GET /startups/me ou /investors/me) só
// para ler o campo planoAssinatura — mesma lógica que antes vivia dentro de
// Configurações. A tabela comparativa dos planos é conteúdo estático (mesmos
// valores também usados na tela pública Planos).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Investidor, PlanoAssinatura, Startup } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const planoAtualEl = document.getElementById('plano-atual') as HTMLSpanElement;
const comparacaoEl = document.getElementById('planos-comparacao') as HTMLDivElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;

const PLANOS_STARTUP = [
  { nome: 'Básico', preco: 'grátis', detalhe: 'Perfil completo, aparece na busca, interesses limitados/mês, Canvas simples.' },
  { nome: 'Plus', preco: '~R$ 149–199/mês', detalhe: 'Perfil em destaque, interesses ilimitados, métricas de visualização, mentoria paga por sessão avulsa.' },
  { nome: 'Premium', preco: '~R$ 349–399/mês', detalhe: 'Tudo do Plus + prioridade no match, relatório de compatibilidade, selo verificado, 4 mentorias grátis/mês.' },
];

const PLANOS_INVESTIDOR = [
  { nome: 'Básico', preco: 'grátis', detalhe: 'Busca com filtros simples, interesses limitados/mês.' },
  { nome: 'Plus', preco: '~R$ 199–249/mês', detalhe: 'Filtros avançados, sugestões automáticas, interesses ilimitados.' },
  { nome: 'Premium', preco: '~R$ 499–599/mês', detalhe: 'Tese estruturada, acesso antecipado, relatórios agregados do ecossistema, matchmaking assistido.' },
];

function renderComparacao(planoAtual: PlanoAssinatura): void {
  const planos = usuario.tipo === 'startup' ? PLANOS_STARTUP : PLANOS_INVESTIDOR;
  const nomeAtualNormalizado = planoAtual.toLowerCase();

  comparacaoEl.innerHTML = planos
    .map((plano) => {
      const ativo = plano.nome.toLowerCase() === nomeAtualNormalizado;
      return `
        <div class="card" ${ativo ? 'style="border-color: var(--color-primary)"' : ''}>
          <div class="card-title">${plano.nome} ${ativo ? '<span class="badge badge-success">atual</span>' : ''}</div>
          <p class="text-muted">${plano.preco}</p>
          <p>${plano.detalhe}</p>
        </div>
      `;
    })
    .join('');
}

async function init(): Promise<void> {
  const path = usuario.tipo === 'startup' ? '/startups/me' : '/investors/me';
  const perfil = await api.get<Startup | Investidor>(path);
  const planoAtual = perfil.planoAssinatura;
  planoAtualEl.textContent = planoAtual;
  renderComparacao(planoAtual);
}

init().catch((error) => {
  errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao carregar plano.';
});
