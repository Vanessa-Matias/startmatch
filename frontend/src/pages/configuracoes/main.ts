import { api, ApiError } from '../../scripts/api';
import {
  getToken,
  requireAuth,
  saveSession,
} from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { TipoUsuario } from '../../scripts/types';

const usuario = requireAuth();

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);


/* =========================================================
   ELEMENTOS
   ========================================================= */

const nomeEl =
  document.getElementById(
    'nome',
  ) as HTMLInputElement;

const emailEl =
  document.getElementById(
    'email',
  ) as HTMLInputElement;

const planoNotaEl =
  document.getElementById(
    'plano-nota',
  ) as HTMLParagraphElement;

const formAvaliacao =
  document.getElementById(
    'form-avaliacao',
  ) as HTMLFormElement;

const avaliacaoSuccessEl =
  document.getElementById(
    'form-avaliacao-success',
  ) as HTMLParagraphElement;

const ratingStarsEl =
  document.getElementById(
    'rating-stars',
  ) as HTMLDivElement;

const notaEl =
  document.getElementById(
    'nota',
  ) as HTMLInputElement;

const ratingLabelEl =
  document.getElementById(
    'rating-label',
  ) as HTMLParagraphElement;


/* =========================================================
   AVALIAÇÃO
   ========================================================= */

const ratingLabels: Record<number, string> = {
  1: '1 — Péssimo',
  2: '2 — Ruim',
  3: '3 — Regular',
  4: '4 — Bom',
  5: '5 — Excelente',
};


/* =========================================================
   SOLICITAÇÕES
   ========================================================= */

const REQUESTS_KEY =
  'startmatch-solicitacoes-administrativas';

const EMAILS_KEY =
  'startmatch-emails-usuarios';


type StatusSolicitacao =
  | 'Pendente'
  | 'Em análise'
  | 'Concluída'
  | 'Recusada';


interface SolicitacaoAdministrativa {
  id: string;

  usuarioId: number;

  usuarioNome: string;

  usuarioTipo: TipoUsuario;

  emailAtual: string;

  emailSolicitado: string;

  tipo: 'alteracao_email';

  status: StatusSolicitacao;

  criadoEm: string;
}


/* =========================================================
   CARREGAR SOLICITAÇÕES
   ========================================================= */

function carregarSolicitacoes(): SolicitacaoAdministrativa[] {
  const raw =
    localStorage.getItem(
      REQUESTS_KEY,
    );

  if (!raw) {
    return [];
  }

  try {
    const dados =
      JSON.parse(raw) as unknown;

    if (!Array.isArray(dados)) {
      return [];
    }

    return dados.filter(
      (
        item,
      ): item is SolicitacaoAdministrativa => {
        if (
          !item ||
          typeof item !== 'object'
        ) {
          return false;
        }

        const value =
          item as Record<string, unknown>;

        return (
          value.tipo ===
            'alteracao_email' &&

          typeof value.id ===
            'string' &&

          typeof value.usuarioId ===
            'number' &&

          typeof value.usuarioNome ===
            'string' &&

          (
            value.usuarioTipo ===
              'startup' ||

            value.usuarioTipo ===
              'investidor' ||

            value.usuarioTipo ===
              'mentor' ||

            value.usuarioTipo ===
              'admin'
          ) &&

          typeof value.emailAtual ===
            'string' &&

          typeof value.emailSolicitado ===
            'string' &&

          (
            value.status ===
              'Pendente' ||

            value.status ===
              'Em análise' ||

            value.status ===
              'Concluída' ||

            value.status ===
              'Recusada'
          ) &&

          typeof value.criadoEm ===
            'string'
        );
      },
    );
  } catch {
    return [];
  }
}


/* =========================================================
   SALVAR SOLICITAÇÕES
   ========================================================= */

function salvarSolicitacoes(
  data: SolicitacaoAdministrativa[],
): void {
  localStorage.setItem(
    REQUESTS_KEY,
    JSON.stringify(data),
  );
}


/* =========================================================
   E-MAILS
   ========================================================= */

function carregarEmails(): Record<
  string,
  string
> {
  const raw =
    localStorage.getItem(
      EMAILS_KEY,
    );

  if (!raw) {
    return {};
  }

  try {
    const dados =
      JSON.parse(raw) as unknown;

    return dados &&
      typeof dados === 'object'
      ? (dados as Record<
          string,
          string
        >)
      : {};
  } catch {
    return {};
  }
}


function salvarEmailUsuario(
  id: number,
  email: string,
): void {
  const emails =
    carregarEmails();

  emails[String(id)] =
    email;

  localStorage.setItem(
    EMAILS_KEY,
    JSON.stringify(emails),
  );
}


/* =========================================================
   APLICAR E-MAIL ATUALIZADO
   ========================================================= */

function aplicarEmailAtualizado(): void {
  const email =
    carregarEmails()[
      String(usuario.id)
    ];

  if (
    email &&
    email !== usuario.email
  ) {
    usuario.email =
      email;

    saveSession(
      getToken() ??
        'mock-token',
      usuario,
    );
  }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
  value: unknown,
): string {
  const text =
    String(value ?? '');

  return text.replace(
    /[&<>'"]/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[char] ?? char,
  );
}


/* =========================================================
   DATA
   ========================================================= */

function formatarData(
  value: string,
): string {
  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : date.toLocaleDateString(
        'pt-BR',
      );
}


/* =========================================================
   MENSAGEM SEGURANÇA
   ========================================================= */

function mostrarMensagemSeguranca(
  texto: string,
  erro: boolean,
): void {
  const el =
    document.getElementById(
      'seguranca-message',
    );

  if (!el) {
    return;
  }

  el.textContent =
    texto;

  el.classList.toggle(
    'is-error',
    erro,
  );

  el.classList.toggle(
    'is-success',
    !erro,
  );
}


/* =========================================================
   CRIAR SOLICITAÇÃO
   ========================================================= */

function criarSolicitacaoEmail(
  emailSolicitado: string,
): void {
  const data =
    carregarSolicitacoes();

  const existeSolicitacaoEmAndamento =
    data.some(
      (item) =>
        item.usuarioId ===
          usuario.id &&

        (
          item.status ===
            'Pendente' ||

          item.status ===
            'Em análise'
        ),
    );

  if (
    existeSolicitacaoEmAndamento
  ) {
    mostrarMensagemSeguranca(
      'Já existe uma solicitação de alteração de e-mail em andamento.',
      true,
    );

    return;
  }


  const novaSolicitacao:
    SolicitacaoAdministrativa = {
    id:
      `req-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    usuarioId:
      usuario.id,

    usuarioNome:
      usuario.nome,

    usuarioTipo:
      usuario.tipo,

    emailAtual:
      usuario.email,

    emailSolicitado,

    tipo:
      'alteracao_email',

    status:
      'Pendente',

    criadoEm:
      new Date().toISOString(),
  };


  data.unshift(
    novaSolicitacao,
  );

  salvarSolicitacoes(
    data,
  );


  mostrarMensagemSeguranca(
    'Solicitação enviada com sucesso.',
    false,
  );


  renderizarMinhasSolicitacoes();
}


/* =========================================================
   MINHAS SOLICITAÇÕES
   ========================================================= */

function renderizarMinhasSolicitacoes(): void {
  const lista =
    document.getElementById(
      'minhas-solicitacoes',
    );

  if (!lista) {
    return;
  }


  const minhas =
    carregarSolicitacoes().filter(
      (item) =>
        item.usuarioId ===
        usuario.id,
    );


  if (!minhas.length) {
    lista.innerHTML =
      `
        <p class="text-muted">
          Nenhuma solicitação registrada.
        </p>
      `;

    return;
  }


  lista.innerHTML =
    minhas
      .map(
        (item) => {
          const concluida =
            item.status ===
            'Concluída'
              ? `
                <small
                  class="config-request-complete"
                >
                  Seu e-mail foi alterado.
                </small>
              `
              : '';


          return `
            <div class="config-request-row">

              <div>

                <strong>
                  Alteração de e-mail
                </strong>

                <span>
                  ${escapeHtml(
                    formatarData(
                      item.criadoEm,
                    ),
                  )}

                  ·

                  ${escapeHtml(
                    item.emailSolicitado,
                  )}
                </span>

                ${concluida}

              </div>


              <span
                class="config-request-status"
              >
                ${escapeHtml(
                  item.status,
                )}
              </span>

            </div>
          `;
        },
      )
      .join('');
}


/* =========================================================
   SEGURANÇA DO USUÁRIO
   ========================================================= */

function configurarSegurancaUsuario(): void {
  const security =
    document.getElementById(
      'config-security',
    );

  if (!security) {
    return;
  }


  if (
    usuario.tipo ===
    'admin'
  ) {
    security.classList.add(
      'config-security-hidden',
    );

    return;
  }


  const emailAtual =
    document.getElementById(
      'seguranca-email-atual',
    );

  if (emailAtual) {
    emailAtual.textContent =
      usuario.email;
  }


  const btnEmail =
    document.getElementById(
      'btn-solicitar-email',
    );


  const formEmail =
    document.getElementById(
      'form-solicitar-email',
    ) as HTMLFormElement | null;


  const cancelar =
    document.getElementById(
      'btn-cancelar-email',
    );


  const novoEmail =
    document.getElementById(
      'novo-email',
    ) as HTMLInputElement | null;


  btnEmail?.addEventListener(
    'click',
    () => {
      if (formEmail) {
        formEmail.hidden =
          false;

        novoEmail?.focus();
      }
    },
  );


  cancelar?.addEventListener(
    'click',
    () => {
      if (formEmail) {
        formEmail.hidden =
          true;

        formEmail.reset();
      }
    },
  );


  formEmail?.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();


      const novo =
        novoEmail?.value
          .trim()
          .toLowerCase() ??
        '';


      if (
        !novo ||
        !novo.includes('@')
      ) {
        mostrarMensagemSeguranca(
          'Informe um e-mail válido.',
          true,
        );

        return;
      }


      if (
        novo ===
        usuario.email.toLowerCase()
      ) {
        mostrarMensagemSeguranca(
          'Informe um e-mail diferente do atual.',
          true,
        );

        return;
      }


      criarSolicitacaoEmail(
        novo,
      );


      formEmail.hidden =
        true;

      formEmail.reset();
    },
  );


  const emailAlterado =
    carregarEmails()[
      String(usuario.id)
    ];


  if (emailAlterado) {
    if (emailAtual) {
      emailAtual.textContent =
        emailAlterado;
    }


    const solicitacaoConcluida =
      carregarSolicitacoes().some(
        (item) =>
          item.usuarioId ===
            usuario.id &&

          item.status ===
            'Concluída' &&

          item.emailSolicitado ===
            emailAlterado,
      );


    if (
      solicitacaoConcluida
    ) {
      mostrarMensagemSeguranca(
        'Seu e-mail foi alterado com sucesso.',
        false,
      );
    }
  }


  renderizarMinhasSolicitacoes();
}


/* =========================================================
   RESUMO DO ADMIN
   ========================================================= */

function atualizarResumoAdmin(
  data: SolicitacaoAdministrativa[],
): void {
  const total =
    document.getElementById(
      'total-solicitacoes',
    );

  const pendentes =
    document.getElementById(
      'pendentes-solicitacoes',
    );

  const analise =
    document.getElementById(
      'analise-solicitacoes',
    );

  const concluidas =
    document.getElementById(
      'concluidas-solicitacoes',
    );


  if (total) {
    total.textContent =
      String(data.length);
  }


  if (pendentes) {
    pendentes.textContent =
      String(
        data.filter(
          (item) =>
            item.status ===
            'Pendente',
        ).length,
      );
  }


  if (analise) {
    analise.textContent =
      String(
        data.filter(
          (item) =>
            item.status ===
            'Em análise',
        ).length,
      );
  }


  if (concluidas) {
    concluidas.textContent =
      String(
        data.filter(
          (item) =>
            item.status ===
            'Concluída',
        ).length,
      );
  }
}


/* =========================================================
   TABELA DO ADMIN
   ========================================================= */

function renderizarSolicitacoesAdmin(): void {
  const body =
    document.getElementById(
      'solicitacoes-body',
    );


  if (
    !body ||
    usuario.tipo !==
      'admin'
  ) {
    return;
  }


  const filtro =
    (
      document.getElementById(
        'filtro-status',
      ) as HTMLSelectElement | null
    )?.value ??
    'Todos';


  const data =
    carregarSolicitacoes();


  atualizarResumoAdmin(
    data,
  );


  const filtradas =
    data.filter(
      (item) =>
        filtro ===
          'Todos' ||
        item.status ===
          filtro,
    );


  if (!filtradas.length) {
    body.innerHTML =
      `
        <tr>

          <td
            colspan="6"
            class="admin-request-empty"
          >
            Nenhuma solicitação encontrada.
          </td>

        </tr>
      `;

    return;
  }


  body.innerHTML =
    filtradas
      .map(
        (item) => `
          <tr>

            <td>
              ${escapeHtml(
                formatarData(
                  item.criadoEm,
                ),
              )}
            </td>


            <td>

              <strong>
                ${escapeHtml(
                  item.usuarioNome,
                )}
              </strong>

              <small>
                ${escapeHtml(
                  item.usuarioTipo,
                )}
              </small>

            </td>


            <td>
              ${escapeHtml(
                item.emailAtual,
              )}
            </td>


            <td>
              ${escapeHtml(
                item.emailSolicitado,
              )}
            </td>


            <td>

              <span
                class="admin-request-status"
              >
                ${escapeHtml(
                  item.status,
                )}
              </span>

            </td>


            <td>

              <div
                class="admin-request-actions"
              >

                ${
                  item.status ===
                  'Pendente'
                    ? `
                      <button
                        class="btn btn-outline"
                        type="button"
                        data-request-action="analise"
                        data-request-id="${escapeHtml(
                          item.id,
                        )}"
                      >
                        Analisar
                      </button>
                    `
                    : ''
                }


                ${
                  item.status ===
                    'Pendente' ||
                  item.status ===
                    'Em análise'
                    ? `
                      <button
                        class="btn btn-primary"
                        type="button"
                        data-request-action="concluir"
                        data-request-id="${escapeHtml(
                          item.id,
                        )}"
                      >
                        Concluir
                      </button>


                      <button
                        class="btn btn-outline"
                        type="button"
                        data-request-action="recusar"
                        data-request-id="${escapeHtml(
                          item.id,
                        )}"
                      >
                        Recusar
                      </button>
                    `
                    : ''
                }

              </div>

            </td>

          </tr>
        `,
      )
      .join('');
}


/* =========================================================
   AÇÃO DO ADMIN
   ========================================================= */

function processarSolicitacaoAdmin(
  id: string,
  acao: string,
): void {
  const data =
    carregarSolicitacoes();


  const item =
    data.find(
      (request) =>
        request.id ===
        id,
    );


  if (!item) {
    return;
  }


  if (
    acao ===
    'analise'
  ) {
    item.status =
      'Em análise';
  }


  if (
    acao ===
    'recusar'
  ) {
    item.status =
      'Recusada';
  }


  if (
    acao ===
    'concluir'
  ) {
    item.status =
      'Concluída';


    salvarEmailUsuario(
      item.usuarioId,
      item.emailSolicitado,
    );


    item.emailAtual =
      item.emailSolicitado;
  }


  salvarSolicitacoes(
    data,
  );


  renderizarSolicitacoesAdmin();
}


/* =========================================================
   ADMIN
   ========================================================= */

function configurarAdmin(): void {
  const adminConfig =
    document.getElementById(
      'admin-config',
    );


  if (!adminConfig) {
    return;
  }


  if (
    usuario.tipo !==
    'admin'
  ) {
    adminConfig.classList.remove(
      'is-visible',
    );

    return;
  }


  adminConfig.classList.add(
    'is-visible',
  );


  document.body.classList.add(
    'admin-config-page',
  );


  const adminNome =
    document.getElementById(
      'admin-nome',
    ) as HTMLInputElement | null;


  const adminEmail =
    document.getElementById(
      'admin-email',
    ) as HTMLInputElement | null;


  if (adminNome) {
    adminNome.value =
      usuario.nome;
  }


  if (adminEmail) {
    adminEmail.value =
      usuario.email;
  }


  /* =======================================================
     DADOS PESSOAIS DO ADMIN
     ======================================================= */

  document
    .getElementById(
      'form-admin-dados',
    )
    ?.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();


        const message =
          document.getElementById(
            'admin-dados-message',
          );


        const nome =
          adminNome?.value
            .trim() ??
          '';


        const email =
          adminEmail?.value
            .trim()
            .toLowerCase() ??
          '';


        if (!nome) {
          if (message) {
            message.textContent =
              'Informe seu nome.';

            message.className =
              'admin-config-message is-error';
          }

          return;
        }


        if (
          !email ||
          !email.includes('@')
        ) {
          if (message) {
            message.textContent =
              'Informe um e-mail válido.';

            message.className =
              'admin-config-message is-error';
          }

          return;
        }


        try {
          await api.patch(
            '/users/me',
            {
              nome,
              email,
            },
          );


          usuario.nome =
            nome;

          usuario.email =
            email;


          saveSession(
            getToken() ??
              'mock-token',
            usuario,
          );


          salvarEmailUsuario(
            usuario.id,
            email,
          );


          if (message) {
            message.textContent =
              'Dados salvos com sucesso.';

            message.className =
              'admin-config-message is-success';
          }

        } catch (error) {

          if (message) {
            message.textContent =
              error instanceof ApiError
                ? error.message
                : 'Não foi possível salvar os dados.';

            message.className =
              'admin-config-message is-error';
          }
        }
      },
    );


  /* =======================================================
     FILTRO
     ======================================================= */

  document
    .getElementById(
      'btn-filtrar',
    )
    ?.addEventListener(
      'click',
      renderizarSolicitacoesAdmin,
    );


  /* =======================================================
     AÇÕES DA TABELA
     ======================================================= */

  document
    .getElementById(
      'solicitacoes-body',
    )
    ?.addEventListener(
      'click',
      (event) => {
        const button =
          (
            event.target as HTMLElement
          ).closest<HTMLButtonElement>(
            '[data-request-action]',
          );


        if (
          button?.dataset
            .requestId &&
          button.dataset
            .requestAction
        ) {
          processarSolicitacaoAdmin(
            button.dataset
              .requestId,

            button.dataset
              .requestAction,
          );
        }
      },
    );


  renderizarSolicitacoesAdmin();
}


/* =========================================================
   PLANO
   ========================================================= */

function configurarPlano(): void {
  planoNotaEl.innerHTML =
    usuario.tipo ===
        'startup' ||
    usuario.tipo ===
        'investidor'
      ? `
        Quer ver ou trocar seu plano de assinatura?
        <a class="btn-link" href="../plano/index.html">
          Acesse Plano
        </a>.
      `
      : '';
}


/* =========================================================
   CONFORMIDADE LEGAL
   ========================================================= */

function configurarConformidadeLegal(): void {
  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-legal-toggle]',
    )
    .forEach(
      (botao) => {
        botao.addEventListener(
          'click',
          () => {
            const item =
              botao.closest<HTMLElement>(
                '.config-legal-item',
              );


            if (!item) {
              return;
            }


            const aberto =
              item.classList.contains(
                'is-open',
              );


            item.classList.toggle(
              'is-open',
              !aberto,
            );


            botao.setAttribute(
              'aria-expanded',
              String(
                !aberto,
              ),
            );


            const icon =
              botao.querySelector<HTMLElement>(
                '.config-legal-icon',
              );


            if (icon) {
              icon.textContent =
                aberto
                  ? '+'
                  : '−';
            }
          },
        );
      },
    );
}


/* =========================================================
   ESTRELAS
   ========================================================= */

function atualizarEstrelas(
  nota: number,
): void {
  const valor =
    Math.min(
      5,
      Math.max(
        1,
        nota,
      ),
    );


  ratingStarsEl
    .querySelectorAll<HTMLButtonElement>(
      '.config-star',
    )
    .forEach(
      (estrela) => {
        const n =
          Number(
            estrela.dataset
              .rating,
          );


        estrela.classList.toggle(
          'is-active',
          n <= valor,
        );


        estrela.setAttribute(
          'aria-checked',
          String(
            n === valor,
          ),
        );
      },
    );


  notaEl.value =
    String(valor);


  ratingLabelEl.textContent =
    ratingLabels[
      valor
    ];
}


/* =========================================================
   CLIQUE NAS ESTRELAS
   ========================================================= */

ratingStarsEl.addEventListener(
  'click',
  (event) => {
    const estrela =
      (
        event.target as HTMLElement
      ).closest<HTMLButtonElement>(
        '.config-star',
      );


    if (estrela) {
      atualizarEstrelas(
        Number(
          estrela.dataset
            .rating,
        ),
      );
    }
  },
);


/* =========================================================
   TECLADO NAS ESTRELAS
   ========================================================= */

ratingStarsEl.addEventListener(
  'keydown',
  (event) => {
    const estrela =
      event.target as HTMLElement;


    if (
      !estrela.classList.contains(
        'config-star',
      )
    ) {
      return;
    }


    let nova =
      Number(
        notaEl.value,
      );


    if (
      event.key ===
      'ArrowRight'
    ) {
      nova =
        Math.min(
          5,
          nova + 1,
        );
    }


    if (
      event.key ===
      'ArrowLeft'
    ) {
      nova =
        Math.max(
          1,
          nova - 1,
        );
    }


    if (
      event.key ===
        'ArrowRight' ||
      event.key ===
        'ArrowLeft'
    ) {
      event.preventDefault();


      atualizarEstrelas(
        nova,
      );


      ratingStarsEl
        .querySelector<HTMLButtonElement>(
          `[data-rating="${nova}"]`,
        )
        ?.focus();
    }
  },
);


/* =========================================================
   AVALIAÇÃO
   ========================================================= */

formAvaliacao.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();


    avaliacaoSuccessEl.textContent =
      '';


    const fd =
      new FormData(
        formAvaliacao,
      );


    const nota =
      Number(
        fd.get('nota'),
      );


    const comentario =
      String(
        fd.get(
          'comentario',
        ) ??
          '',
      ).trim() ||
      undefined;


    if (
      !Number.isInteger(
        nota,
      ) ||
      nota < 1 ||
      nota > 5
    ) {
      avaliacaoSuccessEl.textContent =
        'Selecione uma nota de 1 a 5 estrelas.';

      return;
    }


    try {
      await api.post(
        '/beta-evaluation',
        {
          nota,
          comentario,
        },
      );


      avaliacaoSuccessEl.textContent =
        'Obrigado pela avaliação!';


      formAvaliacao.reset();


      atualizarEstrelas(
        5,
      );

    } catch (error) {
      avaliacaoSuccessEl.textContent =
        error instanceof ApiError
          ? error.message
          : 'Erro ao enviar avaliação.';
    }
  },
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function init(): void {

  aplicarEmailAtualizado();


  nomeEl.value =
    usuario.nome;


  emailEl.value =
    usuario.email;


  /* Esconde todas as configurações comuns do Admin */

  const somenteUsuarios =
    document.querySelectorAll<HTMLElement>(
      '.standard-config-section',
    );


  somenteUsuarios.forEach(
    (el) => {
      el.classList.toggle(
        'config-security-hidden',
        usuario.tipo ===
          'admin',
      );
    },
  );


  /* Segurança também fica somente para usuários comuns */

  const seguranca =
    document.getElementById(
      'config-security',
    );


  if (
    seguranca &&
    usuario.tipo ===
      'admin'
  ) {
    seguranca.classList.add(
      'config-security-hidden',
    );
  }


  configurarAdmin();

  configurarSegurancaUsuario();

  configurarPlano();

  atualizarEstrelas(
    5,
  );

  configurarConformidadeLegal();
}


init();