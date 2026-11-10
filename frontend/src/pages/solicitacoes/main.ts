// Tela: Solicitações — lógica
// ============================
//
// Mostra as mentorias que as startups pediram a este mentor (GET /mentorias).
// O mentor aceita ou recusa (PATCH /mentorias/:id/status). Aceitar coloca a
// sessão nas "Próximas sessões" da Agenda. Depois do horário combinado, o
// mentor marca a sessão como realizada e o sistema gera o certificado.
//
// "Conversar com a startup" abre uma conversa direta em Mensagens (o mentor
// pode falar com a startup quando quiser, sem precisar de match).

import { ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import {
  SOLICITACOES,
  carregarMentoriasDoMentor,
  definirStatus,
  marcarRealizada,
  iniciais,
  statusDe,
  type Solicitacao,
  type StatusSolicitacao,
} from '../../scripts/mentorDemo';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['mentor']);

renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const listaEl = document.getElementById('solicitacoes-list') as HTMLDivElement;

const STATUS_BADGE: Record<StatusSolicitacao, string> = {
  pendente: '<span class="badge-eyebrow badge-eyebrow--amber">Aguardando resposta</span>',
  aceita: '<span class="badge-eyebrow badge-eyebrow--green">Mentoria aceita</span>',
  recusada: '<span class="badge-eyebrow badge-eyebrow--gray">Solicitação recusada</span>',
};

function renderResumo(): void {
  const status = SOLICITACOES.map((s) => statusDe(s.id));
  (document.getElementById('total-solicitacoes') as HTMLElement).textContent = String(SOLICITACOES.length);
  (document.getElementById('pendentes-solicitacoes') as HTMLElement).textContent = String(
    status.filter((s) => s === 'pendente').length,
  );
  (document.getElementById('aceitas-solicitacoes') as HTMLElement).textContent = String(
    status.filter((s) => s === 'aceita').length,
  );
}

function cardHtml(s: Solicitacao): string {
  const status = statusDe(s.id);
  return `
    <article class="card item-card" data-id="${s.id}">
      <div class="item-card-head">
        <div class="item-card-title">
          <span class="item-avatar" aria-hidden="true">${iniciais(s.startup)}</span>
          <div>
            <h3>${s.startup}</h3>
            <p>${s.cidade} · ${s.tema}</p>
          </div>
        </div>
        ${STATUS_BADGE[status]}
      </div>

      <div class="item-details">
        <div>
          <span class="item-detail-label">Data solicitada</span>
          <span class="item-detail-value">${s.data}</span>
        </div>
        <div>
          <span class="item-detail-label">Horário</span>
          <span class="item-detail-value">${s.horario}</span>
        </div>
        <div>
          <span class="item-detail-label">Formato</span>
          <span class="item-detail-value">${s.formato}</span>
        </div>
      </div>

      <p class="item-note">“${s.mensagem}”</p>

      <div class="item-actions">
        <a class="btn btn-outline" href="../mensagens/index.html?conversarCom=startup-${s.startupId}">Conversar com a startup</a>
        ${
          status === 'recusada'
            ? ''
            : '<button type="button" class="btn btn-outline" data-acao="recusada">Recusar</button>'
        }
        ${
          status === 'aceita'
            ? s.podeConcluir
              ? '<button type="button" class="btn btn-primary" data-acao="realizada">Marcar como realizada</button>'
              : '<a class="btn btn-primary" href="../agenda/index.html">Ver na agenda</a>'
            : '<button type="button" class="btn btn-primary" data-acao="aceita">Aceitar mentoria</button>'
        }
      </div>
      <p class="solicitacao-resultado" aria-live="polite"></p>
    </article>
  `;
}

function render(): void {
  renderResumo();
  listaEl.innerHTML = SOLICITACOES.length
    ? SOLICITACOES.map(cardHtml).join('')
    : '<p class="text-muted">Nenhuma solicitação de mentoria por enquanto. Quando uma startup pedir, ela aparece aqui.</p>';
}

listaEl.addEventListener('click', async (event) => {
  const botao = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-acao]');
  if (!botao) return;
  const card = botao.closest<HTMLElement>('[data-id]');
  if (!card?.dataset.id) return;

  const id = card.dataset.id;
  const acao = botao.dataset.acao as StatusSolicitacao | 'realizada';
  botao.disabled = true;

  let mensagem = '';
  let erro = false;
  try {
    if (acao === 'realizada') {
      await marcarRealizada(id);
      mensagem = 'Mentoria realizada! O certificado já está disponível em Certificados.';
    } else {
      await definirStatus(id, acao);
      mensagem =
        acao === 'aceita'
          ? 'Mentoria aceita! A sessão já aparece nas próximas sessões da sua Agenda.'
          : 'Solicitação recusada.';
    }
  } catch (error) {
    erro = true;
    mensagem = error instanceof ApiError ? error.message : 'Não foi possível atualizar agora.';
  }

  render();
  // a mentoria realizada sai desta lista; as demais continuam e mostram o aviso
  const resultado = listaEl.querySelector<HTMLElement>(`[data-id="${id}"] .solicitacao-resultado`);
  if (resultado) {
    resultado.textContent = mensagem;
    resultado.classList.add(erro || acao === 'recusada' ? 'is-error' : 'is-success');
  }
});

async function init(): Promise<void> {
  await carregarMentoriasDoMentor();
  render();
}

init().catch((error) => {
  listaEl.innerHTML = `<p class="form-error">${
    error instanceof ApiError ? error.message : 'Erro ao carregar as solicitações.'
  }</p>`;
});

