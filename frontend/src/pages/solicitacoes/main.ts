// Tela: Solicitações — lógica
// ============================
//
// Os pedidos são demonstrativos (scripts/mentorDemo.ts -> SOLICITACOES): ainda
// não existe endpoint/entidade de solicitação de mentoria no backend. O status
// de cada um (pendente / aceita / recusada) fica no navegador e é o mesmo que o
// Dashboard e a Agenda leem — aceitar uma solicitação a coloca nas "Próximas
// sessões" da Agenda.
//
// "Conversar com a startup" abre a conversa simulada em Mensagens, que já chega
// com a mensagem do pedido (scripts/matchSimulado.ts).

import { requireAuth } from '../../scripts/auth';
import {
  SOLICITACOES,
  definirStatus,
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
        <a class="btn btn-outline" href="../mensagens/index.html?simulado=${s.id}">Conversar com a startup</a>
        ${
          status === 'recusada'
            ? ''
            : '<button type="button" class="btn btn-outline" data-acao="recusada">Recusar</button>'
        }
        ${
          status === 'aceita'
            ? '<a class="btn btn-primary" href="../agenda/index.html">Ver na agenda</a>'
            : '<button type="button" class="btn btn-primary" data-acao="aceita">Aceitar mentoria</button>'
        }
      </div>
      <p class="solicitacao-resultado" aria-live="polite"></p>
    </article>
  `;
}

function render(): void {
  renderResumo();
  listaEl.innerHTML = SOLICITACOES.map(cardHtml).join('');
}

listaEl.addEventListener('click', (event) => {
  const botao = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-acao]');
  if (!botao) return;
  const card = botao.closest<HTMLElement>('[data-id]');
  if (!card?.dataset.id) return;

  const id = card.dataset.id;
  const acao = botao.dataset.acao as StatusSolicitacao;
  definirStatus(id, acao);
  render();

  const resultado = listaEl.querySelector<HTMLElement>(`[data-id="${id}"] .solicitacao-resultado`);
  if (resultado) {
    resultado.textContent =
      acao === 'aceita'
        ? 'Mentoria aceita! A sessão já aparece nas próximas sessões da sua Agenda.'
        : 'Solicitação recusada. Você ainda pode aceitar caso mude de ideia.';
    resultado.classList.add(acao === 'aceita' ? 'is-success' : 'is-error');
  }
});

render();
