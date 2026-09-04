// Tela: Plano e assinatura — lógica
//
// Mostra os planos correspondentes ao tipo
// de usuário logado.
//
// A seleção e o formulário de pagamento são
// tratados somente no frontend nesta etapa.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
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
  document.getElementById(
    'plano-atual',
  ) as HTMLSpanElement;

const comparacaoEl =
  document.getElementById(
    'planos-comparacao',
  ) as HTMLDivElement;

const errorEl =
  document.getElementById(
    'form-error',
  ) as HTMLParagraphElement;

const pagamentoEl =
  document.getElementById(
    'pagamento',
  ) as HTMLElement;

const planoSelecionadoTextoEl =
  document.getElementById(
    'plano-selecionado-texto',
  ) as HTMLParagraphElement;

const btnCartao =
  document.getElementById(
    'btn-cartao',
  ) as HTMLButtonElement;

const btnPix =
  document.getElementById(
    'btn-pix',
  ) as HTMLButtonElement;

const formCartao =
  document.getElementById(
    'form-cartao',
  ) as HTMLFormElement;

const formPix =
  document.getElementById(
    'form-pix',
  ) as HTMLDivElement;

const btnConfirmarPagamento =
  document.getElementById(
    'btn-confirmar-pagamento',
  ) as HTMLButtonElement;

const nomeCartaoEl =
  document.getElementById(
    'nome-cartao',
  ) as HTMLInputElement;

const numeroCartaoEl =
  document.getElementById(
    'numero-cartao',
  ) as HTMLInputElement;

const validadeCartaoEl =
  document.getElementById(
    'validade-cartao',
  ) as HTMLInputElement;

const cvvCartaoEl =
  document.getElementById(
    'cvv-cartao',
  ) as HTMLInputElement;

const btnGerarPix =
  document.getElementById(
    'btn-gerar-pix',
  ) as HTMLButtonElement;

const pixGerado =
  document.getElementById(
    'pix-gerado',
  ) as HTMLDivElement;

const pixCodeEl =
  document.getElementById(
    'pix-code',
  ) as HTMLDivElement;

const btnCopiarPix =
  document.getElementById(
    'btn-copiar-pix',
  ) as HTMLButtonElement;


/*
 * ================================
 * PLANOS
 * ================================
 */

const PLANOS_STARTUP = [
  {
    nome: 'Básico',
    preco: 'grátis',
    detalhe:
      'Perfil completo, aparece na busca dos investidores, interesses limitados por mês, Canvas simples.',
  },
  {
    nome: 'Plus',
    preco: '~R$ 149–199/mês',
    detalhe:
      'Perfil em destaque, interesses ilimitados, métricas de visualização, mentoria paga por sessão avulsa.',
  },
  {
    nome: 'Premium',
    preco: '~R$ 349–399/mês',
    detalhe:
      'Tudo do Plus + prioridade no algoritmo de match, relatório de compatibilidade, selo "verificado", 4 sessões de mentoria grátis por mês.',
  },
];

const PLANOS_INVESTIDOR = [
  {
    nome: 'Básico',
    preco: 'grátis',
    detalhe:
      'Busca com filtros simples (segmento, estágio), interesses limitados por mês.',
  },
  {
    nome: 'Plus',
    preco: '~R$ 199–249/mês',
    detalhe:
      'Filtros avançados (faixa de investimento, tração, localização), sugestões automáticas, interesses ilimitados.',
  },
  {
    nome: 'Premium',
    preco: '~R$ 499–599/mês',
    detalhe:
      'Tese estruturada, acesso antecipado a startups do seu perfil, relatórios agregados do ecossistema, matchmaking assistido por mentor.',
  },
];

const PLANOS_MENTOR = [
  {
    nome: 'Mentor da Rede Parceira',
    preco: '70–80% de desconto',
    detalhe:
      'Para mentores vinculados a empresas parceiras — badge exclusivo, certificado de horas exportável e acesso à vitrine de startups.',
  },
  {
    nome: 'Mentor independente',
    preco: '~R$ 79–99/mês',
    detalhe:
      'Acesso à mesma vitrine de startups — ferramenta de networking e captação de clientes.',
  },
];

let planoSelecionado = '';


/*
 * ================================
 * REGRAS DOS CAMPOS DO CARTÃO
 * ================================
 */

/*
 * Número do cartão:
 * aceita somente números e no máximo 16.
 */

numeroCartaoEl.addEventListener(
  'input',
  () => {
    numeroCartaoEl.value =
      numeroCartaoEl.value
        .replace(/\D/g, '')
        .slice(0, 16);
  },
);


/*
 * Validade:
 * aceita somente números.
 *
 * Depois dos dois primeiros números,
 * adiciona automaticamente a barra.
 *
 * Exemplo:
 * 0528 -> 05/28
 */

validadeCartaoEl.addEventListener(
  'input',
  () => {
    const numeros =
      validadeCartaoEl.value
        .replace(/\D/g, '')
        .slice(0, 4);

    if (numeros.length > 2) {
      validadeCartaoEl.value =
        `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    } else {
      validadeCartaoEl.value =
        numeros;
    }
  },
);


/*
 * CVV:
 * aceita somente números e no máximo 3.
 */

cvvCartaoEl.addEventListener(
  'input',
  () => {
    cvvCartaoEl.value =
      cvvCartaoEl.value
        .replace(/\D/g, '')
        .slice(0, 3);
  },
);


/*
 * ================================
 * MÉTODO DE PAGAMENTO
 * ================================
 */

function selecionarMetodo(
  metodo: 'cartao' | 'pix',
): void {
  btnCartao.classList.toggle(
    'active',
    metodo === 'cartao',
  );

  btnPix.classList.toggle(
    'active',
    metodo === 'pix',
  );

  formCartao.hidden =
    metodo !== 'cartao';

  formPix.hidden =
    metodo !== 'pix';
}


/*
 * ================================
 * SELEÇÃO DO PLANO
 * ================================
 */

function selecionarPlano(
  nome: string,
  preco: string,
): void {
  planoSelecionado = nome;

  planoSelecionadoTextoEl.textContent =
    `Plano selecionado: ${nome} — ${preco}`;

  /*
   * Marca visualmente o plano escolhido.
   */

  document
    .querySelectorAll('.plan-card')
    .forEach((card) => {
      card.classList.toggle(
        'plan-selected',
        card.getAttribute('data-plano') === nome,
      );
    });

  /*
   * Coloca o pagamento imediatamente
   * abaixo do plano selecionado.
   *
   * Não usamos scrollIntoView.
   */

  const planoCard = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.plan-card',
    ),
  ).find(
    (card) =>
      card.getAttribute('data-plano') === nome,
  );

  if (planoCard) {
    planoCard.after(pagamentoEl);
  }

  pagamentoEl.hidden = false;

  /*
   * Sempre começa pelo cartão.
   */

  selecionarMetodo('cartao');

  /*
   * Garante que o botão esteja
   * preparado para um novo pagamento.
   */

  btnConfirmarPagamento.classList.remove(
    'btn-payment-success',
  );

  btnConfirmarPagamento.classList.add(
    'btn-primary',
  );

  btnConfirmarPagamento.textContent =
    'Confirmar pagamento';
}


/*
 * ================================
 * RENDERIZAÇÃO DOS PLANOS
 * ================================
 */

function renderComparacao(
  planoAtual: PlanoAssinatura,
): void {
  let planos;

  if (usuario.tipo === 'startup') {
    planos = PLANOS_STARTUP;
  } else if (usuario.tipo === 'investidor') {
    planos = PLANOS_INVESTIDOR;
  } else {
    planos = PLANOS_MENTOR;
  }

  const nomeAtualNormalizado =
    planoAtual.toLowerCase();

  comparacaoEl.innerHTML = `
    <div class="grid">
      ${planos
        .map((plano) => {
          const ativo =
            plano.nome.toLowerCase() ===
            nomeAtualNormalizado;

          /*
           * O Básico é gratuito.
           * Não deve abrir pagamento.
           */

          const planoGratuito =
            plano.nome === 'Básico';

          let badge = '';

          if (plano.nome === 'Básico') {
            badge =
              '<span class="badge">grátis</span>';
          } else if (
            usuario.tipo === 'mentor' &&
            plano.nome ===
              'Mentor da Rede Parceira'
          ) {
            badge =
              '<span class="badge badge-success">70–80% de desconto</span>';
          } else {
            badge = `
              <span class="badge badge-accent">
                ${plano.preco}
              </span>
            `;
          }

          /*
           * Plano atual:
           * mostra somente "Plano atual".
           */

          if (ativo) {
            return `
              <div
                class="card plan-card plan-current"
                data-plano="${plano.nome}"
                data-pago="${planoGratuito ? 'false' : 'true'}"
              >
                <div class="card-title">
                  ${plano.nome}
                  ${badge}

                  <span class="badge badge-success">
                    atual
                  </span>
                </div>

                <p class="text-muted">
                  ${plano.detalhe}
                </p>

                <div class="plan-actions">
                  <span class="badge">
                    Plano atual
                  </span>
                </div>
              </div>
            `;
          }

          /*
           * Plano Básico:
           * não possui botão.
           */

          if (planoGratuito) {
            return `
              <div
                class="card plan-card"
                data-plano="${plano.nome}"
                data-pago="false"
              >
                <div class="card-title">
                  ${plano.nome}
                  ${badge}
                </div>

                <p class="text-muted">
                  ${plano.detalhe}
                </p>
              </div>
            `;
          }

          /*
           * Planos pagos:
           * possuem botão para abrir o pagamento.
           */

          return `
            <div
              class="card plan-card"
              data-plano="${plano.nome}"
              data-pago="true"
            >
              <div class="card-title">
                ${plano.nome}
                ${badge}
              </div>

              <p class="text-muted">
                ${plano.detalhe}
              </p>

              <div class="plan-actions">
                <button
                  type="button"
                  class="btn btn-primary btn-escolher-plano"
                  data-plano="${plano.nome}"
                  data-preco="${plano.preco}"
                >
                  Assinar plano
                </button>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;

  /*
   * Eventos dos botões dos planos pagos.
   */

  document
    .querySelectorAll<HTMLButtonElement>(
      '.btn-escolher-plano',
    )
    .forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          const nome =
            button.dataset.plano ?? '';

          const preco =
            button.dataset.preco ?? '';

          if (!nome) {
            return;
          }

          /*
           * O Básico não possui pagamento.
           * Esta verificação permanece como
           * proteção adicional.
           */

          if (nome === 'Básico') {
            return;
          }

          selecionarPlano(
            nome,
            preco,
          );
        },
      );
    });
}


/*
 * ================================
 * PAGAMENTO COM CARTÃO
 * ================================
 */

btnCartao.addEventListener(
  'click',
  () => {
    selecionarMetodo('cartao');
  },
);

btnPix.addEventListener(
  'click',
  () => {
    selecionarMetodo('pix');
  },
);


/*
 * Confirmação do cartão.
 */

formCartao.addEventListener(
  'submit',
  (event) => {
    event.preventDefault();

    if (!planoSelecionado) {
      return;
    }

    const nome =
      nomeCartaoEl.value.trim();

    const numero =
      numeroCartaoEl.value.trim();

    const validade =
      validadeCartaoEl.value.trim();

    const cvv =
      cvvCartaoEl.value.trim();


    /*
     * Nome obrigatório.
     */

    if (!nome) {
      nomeCartaoEl.focus();
      return;
    }


    /*
     * Número precisa ter exatamente
     * 16 números.
     */

    const numeroValido =
      /^\d{16}$/.test(numero);

    if (!numeroValido) {
      numeroCartaoEl.focus();
      return;
    }


    /*
     * Validade precisa estar no formato
     * MM/AA.
     */

    const validadeValida =
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(
        validade,
      );

    if (!validadeValida) {
      validadeCartaoEl.focus();
      return;
    }


    /*
     * CVV precisa ter exatamente
     * 3 números.
     */

    const cvvValido =
      /^\d{3}$/.test(cvv);

    if (!cvvValido) {
      cvvCartaoEl.focus();
      return;
    }


    /*
     * ==============================
     * PAGAMENTO CONFIRMADO
     * ==============================
     *
     * Somente o botão muda para verde.
     */

    btnConfirmarPagamento.classList.remove(
      'btn-primary',
    );

    btnConfirmarPagamento.classList.add(
      'btn-payment-success',
    );

    btnConfirmarPagamento.textContent =
      'Pagamento confirmado';


    /*
     * Após 1,2 segundo:
     *
     * - limpa os campos;
     * - limpa o plano;
     * - remove o verde;
     * - fecha pagamento;
     * - prepara para outro pagamento.
     */

    window.setTimeout(() => {

      /*
       * Limpa os dados digitados.
       */

      formCartao.reset();


      /*
       * Botão volta para azul.
       */

      btnConfirmarPagamento.classList.remove(
        'btn-payment-success',
      );

      btnConfirmarPagamento.classList.add(
        'btn-primary',
      );

      btnConfirmarPagamento.textContent =
        'Confirmar pagamento';


      /*
       * Limpa o plano selecionado.
       */

      planoSelecionado = '';

      planoSelecionadoTextoEl.textContent =
        '';


      /*
       * Remove a seleção visual
       * dos planos.
       */

      document
        .querySelectorAll('.plan-card')
        .forEach((card) => {
          card.classList.remove(
            'plan-selected',
          );
        });


      /*
       * Limpa o PIX anterior.
       */

      pixGerado.hidden = true;

      pixCodeEl.textContent = '';


      /*
       * Fecha a área de pagamento.
       */

      pagamentoEl.hidden = true;


      /*
       * Próximo pagamento começa
       * novamente pelo cartão.
       */

      selecionarMetodo('cartao');

    }, 1200);
  },
);


/*
 * ================================
 * PAGAMENTO VIA PIX
 * ================================
 */

btnGerarPix.addEventListener(
  'click',
  () => {
    if (!planoSelecionado) {
      return;
    }

    const codigoPix =
      `STARTMATCH-${planoSelecionado.toUpperCase()}-${Date.now()}`;

    pixCodeEl.textContent =
      codigoPix;

    pixGerado.hidden = false;
  },
);


btnCopiarPix.addEventListener(
  'click',
  async () => {
    const codigo =
      pixCodeEl.textContent ?? '';

    if (!codigo) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        codigo,
      );

      btnCopiarPix.textContent =
        'Código copiado!';

      window.setTimeout(() => {
        btnCopiarPix.textContent =
          'Copiar código PIX';
      }, 2000);

    } catch {
      btnCopiarPix.textContent =
        'Não foi possível copiar';
    }
  },
);


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

  const planoAtual =
    perfil.planoAssinatura;

  planoAtualEl.textContent =
    planoAtual;

  renderComparacao(
    planoAtual,
  );
}

init().catch((error) => {
  errorEl.textContent =
    error instanceof ApiError
      ? error.message
      : 'Erro ao carregar plano.';
});