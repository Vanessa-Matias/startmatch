// Tela: Plano e assinatura — lógica
//
// Mostra os planos correspondentes ao tipo
// de usuário logado, com os mesmos nomes,
// badges e preços da página pública de Planos.
//
// A seleção e o pagamento (cartão ou PIX) são
// tratados somente no frontend nesta etapa —
// ver scripts/payment.ts.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { createPayment } from '../../scripts/payment';
import type {
  Investidor,
  PlanoAssinatura,
  Startup,
} from '../../scripts/types';

// Mentores são voluntários e não têm plano: quem chegar aqui volta ao painel.
const usuario = requireAuth([
  'startup',
  'investidor',
  'mentor',
]);

if (usuario.tipo === 'mentor') {
  window.location.replace('../dashboard-mentor/index.html');
}

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);

const planoAtualEl =
  document.getElementById('plano-atual') as HTMLSpanElement;

const comparacaoEl =
  document.getElementById('planos-comparacao') as HTMLDivElement;

const errorEl =
  document.getElementById('form-error') as HTMLParagraphElement;

const pagamento = createPayment(
  document.getElementById('pagamento-area') as HTMLElement,
  {
    onPaid: () => marcarSelecionado(''),
  },
);

/*
 * ================================
 * PLANOS (iguais aos da página pública /planos)
 * ================================
 * badge: classe do badge do nome do plano.
 */

interface Plano {
  nome: string;
  preco: string;
  detalhe: string;
  badge: string;
}

const PLANOS_STARTUP: Plano[] = [
  {
    nome: 'Básico',
    preco: 'Grátis',
    badge: 'badge-plan badge-plan--gray',
    detalhe:
      'Perfil da startup, até 3 interesses por mês e conversa com o investidor depois do match.',
  },
  {
    nome: 'Plus',
    preco: 'R$ 550/mês',
    badge: 'badge-plan badge-plan--blue',
    detalhe:
      'Interesses ilimitados e 1 mentoria por mês com mentores da rede.',
  },
  {
    nome: 'Premium',
    preco: 'R$ 800/mês',
    badge: 'badge-plan badge-plan--green',
    detalhe:
      'Tudo do Plus + prioridade no match, destaque na seção Premium dos investidores, relatório de compatibilidade, selo "verificado" e 2 mentorias por mês.',
  },
];

const PLANOS_INVESTIDOR: Plano[] = [
  {
    nome: 'Básico',
    preco: 'Grátis',
    badge: 'badge-plan badge-plan--gray',
    detalhe:
      'Dashboard simples, até 3 interesses por mês e filtros básicos de busca.',
  },
  {
    nome: 'Plus',
    preco: 'R$ 700/mês',
    badge: 'badge-plan badge-plan--blue',
    detalhe:
      'Dashboard completo, filtros avançados e interesses ilimitados.',
  },
  {
    nome: 'Premium',
    preco: 'R$ 1.200/mês',
    badge: 'badge-plan badge-plan--green',
    detalhe:
      'Tudo do Plus + seção Premium com aviso de novas startups compatíveis, relatórios e exportação de listas.',
  },
];

/*
 * ================================
 * SELEÇÃO DO PLANO
 * ================================
 */

function marcarSelecionado(nome: string): void {
  document
    .querySelectorAll('.plan-card')
    .forEach((card) => {
      card.classList.toggle(
        'plan-selected',
        nome !== '' && card.getAttribute('data-plano') === nome,
      );
    });
}

function selecionarPlano(nome: string, preco: string): void {
  marcarSelecionado(nome);
  pagamento.open(`Plano ${nome} — ${preco}`, nome);
}

/*
 * ================================
 * RENDERIZAÇÃO DOS PLANOS
 * ================================
 */

function renderComparacao(planoAtual: PlanoAssinatura): void {
  let planos: Plano[];

  if (usuario.tipo === 'startup') {
    planos = PLANOS_STARTUP;
  } else {
    planos = PLANOS_INVESTIDOR;
  }

  const nomeAtualNormalizado = planoAtual.toLowerCase();

  comparacaoEl.innerHTML = `
    <div class="grid plan-grid">
      ${planos
        .map((plano) => {
          const ativo = plano.nome.toLowerCase() === nomeAtualNormalizado;

          // O Básico é gratuito: não abre pagamento.
          const planoGratuito = plano.nome === 'Básico';

          let acao = '';
          if (ativo) {
            acao = '<span class="badge badge-success">Plano atual</span>';
          } else if (!planoGratuito) {
            acao = `
              <button
                type="button"
                class="btn btn-primary btn-escolher-plano"
                data-plano="${plano.nome}"
                data-preco="${plano.preco}"
              >
                Assinar plano
              </button>
            `;
          }

          return `
            <div
              class="card plan-card ${ativo ? 'plan-current' : ''}"
              data-plano="${plano.nome}"
            >
              <div class="card-title plan-head">
                <span class="${plano.badge}">${plano.nome}</span>
                <span class="plan-price">${plano.preco}</span>
              </div>

              <p class="text-muted">${plano.detalhe}</p>

              ${acao ? `<div class="plan-actions">${acao}</div>` : ''}
            </div>
          `;
        })
        .join('')}
    </div>
  `;

  document
    .querySelectorAll<HTMLButtonElement>('.btn-escolher-plano')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const nome = button.dataset.plano ?? '';
        const preco = button.dataset.preco ?? '';
        if (!nome || nome === 'Básico') {
          return;
        }
        selecionarPlano(nome, preco);
      });
    });
}

/*
 * ================================
 * CARREGAMENTO DO PERFIL
 * ================================
 */

async function init(): Promise<void> {
  if (usuario.tipo === 'mentor') return;

  const path = usuario.tipo === 'startup' ? '/startups/me' : '/investors/me';

  const perfil = await api.get<Startup | Investidor>(path);

  const planoAtual = perfil.planoAssinatura;

  planoAtualEl.textContent = planoAtual;

  renderComparacao(planoAtual);
}

init().catch((error) => {
  errorEl.textContent =
    error instanceof ApiError
      ? error.message
      : 'Erro ao carregar plano.';
});
