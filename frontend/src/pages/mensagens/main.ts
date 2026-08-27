// Tela: Mensagens — lógica
// ==========================
// A tela mais "dinâmica" do frontend. Pontos principais:
//
//   - Ao abrir a página, carrega a lista de conversas (GET /conversations). Se a URL
//     tiver "?matchId=123" (é assim que o link vem da tela de Matches), a conversa
//     correspondente já abre automaticamente.
//   - abrirConversa() marca o botão ativo na lista, habilita o campo de digitação e
//     começa um POLLING: a cada 5 segundos, busca as mensagens de novo (setInterval)
//     — não é um chat em tempo real de verdade (não usa WebSocket), é um "atualiza
//     sozinho de tempos em tempos", suficiente para o escopo desta 1ª entrega.
//   - Enviar uma mensagem faz POST e recarrega a lista de mensagens na hora.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { Conversa, Mensagem } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const conversasListEl = document.getElementById('conversas-list') as HTMLDivElement;
const chatBoxEl = document.getElementById('chat-box') as HTMLDivElement;
const formEl = document.getElementById('form-mensagem') as HTMLFormElement;
const conteudoEl = document.getElementById('conteudo') as HTMLInputElement;
const submitBtn = formEl.querySelector('button[type="submit"]') as HTMLButtonElement;

let conversaAtivaId: number | null = null;
let pollTimer: ReturnType<typeof setInterval> | undefined;

// Marca visualmente (classe .ativa) qual botão da lista corresponde à conversa aberta.
function selecionarConversaNaLista(conversaId: number): void {
  conversasListEl.querySelectorAll<HTMLButtonElement>('button[data-conversa-id]').forEach((btn) => {
    btn.classList.toggle('ativa', Number(btn.dataset.conversaId) === conversaId);
  });
}

// Busca as mensagens da conversa e redesenha as bolhas de chat. `minha` decide se a
// bolha usa a classe .minha (mensagem enviada pelo usuário logado) ou não.
async function carregarMensagens(conversaId: number): Promise<void> {
  const mensagens = await api.get<Mensagem[]>(`/conversations/${conversaId}/messages`);
  chatBoxEl.innerHTML = mensagens
    .map((m) => {
      const minha = m.remetenteId === usuario.id;
      return `<div class="mensagem ${minha ? 'minha' : ''}">${m.conteudo}</div>`;
    })
    .join('');
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight; // rola para a mensagem mais recente
}

// Abre uma conversa: seleciona na lista, libera o formulário de envio, carrega as
// mensagens e liga o "polling" (recarrega a cada 5s enquanto essa conversa estiver aberta).
function abrirConversa(conversaId: number): void {
  conversaAtivaId = conversaId;
  selecionarConversaNaLista(conversaId);
  conteudoEl.disabled = false;
  submitBtn.disabled = false;

  carregarMensagens(conversaId).catch(() => {
    chatBoxEl.innerHTML = '<p class="form-error">Erro ao carregar mensagens.</p>';
  });

  clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (conversaAtivaId) void carregarMensagens(conversaAtivaId);
  }, 5000);
}

function renderConversas(conversas: Conversa[]): void {
  if (conversas.length === 0) {
    conversasListEl.innerHTML = '<p class="text-muted">Nenhuma conversa ainda.</p>';
    return;
  }

  conversasListEl.innerHTML = conversas
    .map(
      (c) =>
        `<button type="button" data-conversa-id="${c.id}" data-match-id="${c.matchId}">Conversa · Match #${c.matchId}</button>`,
    )
    .join('');

  conversasListEl.querySelectorAll<HTMLButtonElement>('button[data-conversa-id]').forEach((btn) => {
    btn.addEventListener('click', () => abrirConversa(Number(btn.dataset.conversaId)));
  });
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!conversaAtivaId || !conteudoEl.value.trim()) return;

  try {
    await api.post(`/conversations/${conversaAtivaId}/messages`, { conteudo: conteudoEl.value.trim() });
    conteudoEl.value = '';
    await carregarMensagens(conversaAtivaId);
  } catch {
    // Mantém o texto no campo para o usuário tentar novamente.
  }
});

async function init(): Promise<void> {
  const conversas = await api.get<Conversa[]>('/conversations');
  renderConversas(conversas);

  // Se veio de um link "Matches -> Mensagens" com ?matchId=123, abre essa conversa
  // automaticamente em vez de deixar a tela em branco esperando um clique.
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get('matchId');
  if (matchId) {
    const conversa = conversas.find((c) => c.matchId === Number(matchId));
    if (conversa) abrirConversa(conversa.id);
  }
}

init().catch((error) => {
  conversasListEl.innerHTML = `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar conversas.'}</p>`;
});
