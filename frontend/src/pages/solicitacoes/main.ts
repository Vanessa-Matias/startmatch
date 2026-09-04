// Tela: Solicitações — lógica
// ============================
//
// Nesta primeira entrega, a solicitação exibida é demonstrativa.
// Ainda não existe endpoint/entidade de solicitação de mentoria
// no backend. As ações funcionam somente no frontend.
//
// As opções Aceitar e Recusar permanecem sempre disponíveis,
// permitindo que o mentor mude de ideia.

// --------------------------------------------------
// Imports
// --------------------------------------------------

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

// --------------------------------------------------
// Autenticação e navegação
// --------------------------------------------------

const usuario = requireAuth(['mentor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

// --------------------------------------------------
// Elementos da tela
// --------------------------------------------------

const aceitarSolicitacao = document.getElementById(
  'aceitar-solicitacao'
) as HTMLButtonElement;

const recusarSolicitacao = document.getElementById(
  'recusar-solicitacao'
) as HTMLButtonElement;

const mensagensSolicitacao = document.getElementById(
  'mensagens-solicitacao'
) as HTMLAnchorElement;

const statusSolicitacao = document.getElementById(
  'status-solicitacao'
) as HTMLElement;

const resultadoSolicitacao = document.getElementById(
  'resultado-solicitacao'
) as HTMLElement;

const pendentesSolicitacoes = document.getElementById(
  'pendentes-solicitacoes'
) as HTMLElement;

const aceitasSolicitacoes = document.getElementById(
  'aceitas-solicitacoes'
) as HTMLElement;

// --------------------------------------------------
// Estado demonstrativo
// --------------------------------------------------

type StatusSolicitacao =
  | 'pendente'
  | 'aceita'
  | 'recusada';

const STORAGE_KEY = 'startmatch-solicitacao-mentor-status';

function obterStatusSalvo(): StatusSolicitacao {
  const status = localStorage.getItem(STORAGE_KEY);

  if (
    status === 'pendente' ||
    status === 'aceita' ||
    status === 'recusada'
  ) {
    return status;
  }

  return 'pendente';
}

let statusAtual: StatusSolicitacao = obterStatusSalvo();

// --------------------------------------------------
// Resultado
// --------------------------------------------------

function mostrarResultado(
  mensagem: string,
  tipo: 'success' | 'error'
): void {
  resultadoSolicitacao.textContent = mensagem;

  resultadoSolicitacao.classList.add('is-visible');

  resultadoSolicitacao.classList.remove(
    'is-success',
    'is-error'
  );

  resultadoSolicitacao.classList.add(
    tipo === 'success'
      ? 'is-success'
      : 'is-error'
  );
}

// --------------------------------------------------
// Atualiza visual da solicitação
// --------------------------------------------------

function atualizarTela(): void {
  statusSolicitacao.classList.remove(
    'badge-accent',
    'badge-success',
    'badge'
  );

  if (statusAtual === 'aceita') {
    statusSolicitacao.textContent = 'Mentoria aceita';

    statusSolicitacao.classList.add(
      'badge-success'
    );

    mensagensSolicitacao.classList.add(
      'is-visible'
    );

    pendentesSolicitacoes.textContent = '0';
    aceitasSolicitacoes.textContent = '1';

    return;
  }

  if (statusAtual === 'recusada') {
    statusSolicitacao.textContent =
      'Solicitação recusada';

    statusSolicitacao.classList.add('badge');

    mensagensSolicitacao.classList.remove(
      'is-visible'
    );

    pendentesSolicitacoes.textContent = '0';
    aceitasSolicitacoes.textContent = '0';

    return;
  }

  statusSolicitacao.textContent =
    'Aguardando resposta';

  statusSolicitacao.classList.add(
    'badge-accent'
  );

  mensagensSolicitacao.classList.remove(
    'is-visible'
  );

  pendentesSolicitacoes.textContent = '1';
  aceitasSolicitacoes.textContent = '0';
}

// --------------------------------------------------
// Salva o estado
// --------------------------------------------------

function salvarStatus(
  status: StatusSolicitacao
): void {
  statusAtual = status;

  localStorage.setItem(
    STORAGE_KEY,
    status
  );

  atualizarTela();
}

// --------------------------------------------------
// Aceitar
// --------------------------------------------------

aceitarSolicitacao.addEventListener(
  'click',
  () => {
    salvarStatus('aceita');

    mostrarResultado(
      'Mentoria aceita. Você pode conversar com a startup pelas mensagens.',
      'success'
    );
  }
);

// --------------------------------------------------
// Recusar
// --------------------------------------------------

recusarSolicitacao.addEventListener(
  'click',
  () => {
    salvarStatus('recusada');

    mostrarResultado(
      'Solicitação recusada. Você ainda pode aceitar novamente caso mude de ideia.',
      'error'
    );
  }
);

// --------------------------------------------------
// Inicialização
// --------------------------------------------------

atualizarTela();