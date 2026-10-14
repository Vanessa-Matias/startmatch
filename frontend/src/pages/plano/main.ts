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

const usuario = requireAuth([
  'startup',
  'investidor',
  'mentor',
]);

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
      'Perfil completo, aparece na busca dos investidores, interesses limitados por mês, Canvas simples.',
  },
  {
    nome: 'Plus',
    preco: 'R$ 350/mês',
    badge: 'badge-plan badge-plan--blue',
    detalhe:
      'Perfil em destaque, interesses ilimitados, métricas de visualização e 1 mentoria por mês incluída. Precisa de mais? Compre pacotes de mentorias extras.',
  },
  {
    nome: 'Premium',
    preco: 'R$ 500/mês',
    badge: 'badge-plan badge-plan--green',
    detalhe:
      'Tudo do Plus + prioridade no algoritmo de match, relatório de compatibilidade, selo "verificado" e 3 mentorias por mês incluídas.',
  },
];

const PLANOS_INVESTIDOR: Plano[] = [
  {
    nome: 'Básico',
    preco: 'Grátis',
    badge: 'badge-plan badge-plan--gray',
    detalhe:
      'Busca com filtros simples (segmento, estágio), interesses limitados por mês.',
  },
  {
    nome: 'Plus',
    preco: 'R$ 400/mês',
    badge: 'badge-plan badge-plan--blue',
    detalhe:
      'Filtros avançados (faixa de investimento, tração, localização), sugestões automáticas, interesses ilimitados.',
  },
  {
    nome: 'Premium',
    preco: 'R$ 600/mês',
    badge: 'badge-plan badge-plan--green',
    detalhe:
      'Tese estruturada, acesso antecipado a startups do seu perfil, relatórios agregados do ecossistema, matchmaking assistido por mentor.',
  },
];

const PLANOS_MENTOR: Plano[] = [
  {
    nome: 'Mentor da Rede Parceira',
    preco: '20% de desconto · R$ 160/mês',
    badge: 'badge-neon badge-neon--green',
    detalhe:
      'Plano do mentor independente com 20% de desconto, badge exclusivo, certificado de horas exportável, acesso à vitrine de startups e destaque de perfil nas mentorias extras.',
  },
  {
    nome: 'Mentor independente',
    preco: 'R$ 200/mês',
    badge: 'badge-neon badge-neon--sky',
    detalhe:
      'Acesso à vitrine de startups, certificados que comprovam suas mentorias e destaque de perfil nas indicações de mentorias extras.',
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
  } else if (usuario.tipo === 'investidor') {
    planos = PLANOS_INVESTIDOR;
  } else {
    planos = PLANOS_MENTOR;
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
  let path: string;

  if (usuario.tipo === 'startup') {
    path = '/startups/me';
  } else if (usuario.tipo === 'investidor') {
    path = '/investors/me';
  } else {
    path = '/mentors/me';
  }

  const perfil = await api.get<
    Startup |
    Investidor |
    { planoAssinatura: PlanoAssinatura }
  >(path);

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
