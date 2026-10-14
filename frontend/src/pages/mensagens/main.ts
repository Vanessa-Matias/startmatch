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
//   - CONVERSAS SIMULADAS (apresentação): os matches de exemplo da tela de Matches
//     também aparecem aqui ("?simulado=<id>" abre direto). As mensagens delas ficam
//     só no navegador (sessionStorage) e o outro lado responde sozinho — nada vai
//     para o backend. Ver scripts/matchSimulado.ts.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import {
  buscarSimulado,
  enviarMensagemSimulada,
  matchesSimulados,
  mensagensSimuladas,
  responderSimulado,
  type MatchExemplo,
  type MensagemSimulada,
} from '../../scripts/matchSimulado';
import type { Conversa, Mensagem } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor', 'mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const conversasListEl = document.getElementById('conversas-list') as HTMLDivElement;
const chatBoxEl = document.getElementById('chat-box') as HTMLDivElement;
const formEl = document.getElementById('form-mensagem') as HTMLFormElement;
const conteudoEl = document.getElementById('conteudo') as HTMLInputElement;
const submitBtn = formEl.querySelector('button[type="submit"]') as HTMLButtonElement;

let conversaAtivaId: number | null = null;
let simuladaAtiva: MatchExemplo | null = null;
let pollTimer: ReturnType<typeof setInterval> | undefined;

// Startup e investidor: matches simulados. Mentor: startups que pediram mentoria.
const simulados = matchesSimulados(usuario.tipo);

// Marca visualmente (classe .ativa) qual botão da lista corresponde à conversa aberta.
function selecionarConversaNaLista(chave: string): void {
  conversasListEl.querySelectorAll<HTMLButtonElement>('button[data-chave]').forEach((btn) => {
    btn.classList.toggle('ativa', btn.dataset.chave === chave);
  });
}

function bolha(texto: string, minha: boolean): string {
  return `
    <div class="mensagem ${minha ? 'minha' : ''}">
      ${texto}
    </div>
  `;
}

function escapeHtml(texto: string): string {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function renderSimuladas(mensagens: MensagemSimulada[], digitando = false): void {
  chatBoxEl.innerHTML =
    mensagens.map((m) => bolha(escapeHtml(m.texto), m.minha)).join('') +
    (digitando ? '<div class="mensagem digitando">digitando…</div>' : '');
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
}

// Abre uma conversa simulada (sem polling: tudo está no navegador).
function abrirSimulada(exemplo: MatchExemplo): void {
  clearInterval(pollTimer);
  conversaAtivaId = null;
  simuladaAtiva = exemplo;
  selecionarConversaNaLista(`sim-${exemplo.id}`);
  conteudoEl.disabled = false;
  submitBtn.disabled = false;
  renderSimuladas(mensagensSimuladas(exemplo));
  conteudoEl.focus();
}

// Busca as mensagens da conversa e redesenha as bolhas de chat. `minha` decide se a
// bolha usa a classe .minha (mensagem enviada pelo usuário logado) ou não.
async function carregarMensagens(conversaId: number): Promise<void> {
  const mensagens = await api.get<Mensagem[]>(
    `/conversations/${conversaId}/messages`
  );

  chatBoxEl.innerHTML = mensagens
    .map((m) => {
      const minha = m.remetenteId === usuario.id;

      return bolha(escapeHtml(m.conteudo), minha);
    })
    .join('');

  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
}

// Abre uma conversa: seleciona na lista, libera o formulário de envio, carrega as
// mensagens e liga o "polling" (recarrega a cada 5s enquanto essa conversa estiver aberta).
function abrirConversa(conversaId: number): void {
  conversaAtivaId = conversaId;
  simuladaAtiva = null;
  selecionarConversaNaLista(`real-${conversaId}`);
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
  const simuladasHtml = simulados
    .map(
      (m) =>
        `<button type="button" data-chave="sim-${m.id}" data-simulado="${m.id}">${m.nome}<span class="conversa-sim-tag">${usuario.tipo === 'mentor' ? 'solicitação de mentoria' : 'simulação'}</span></button>`,
    )
    .join('');

  const reaisHtml = conversas
    .map(
      (c) =>
        `<button type="button" data-chave="real-${c.id}" data-conversa-id="${c.id}" data-match-id="${c.matchId}">Conversa · Match #${c.matchId}</button>`,
    )
    .join('');

  if (!simuladasHtml && !reaisHtml) {
    conversasListEl.innerHTML = '<p class="text-muted">Nenhuma conversa ainda.</p>';
    return;
  }

  conversasListEl.innerHTML = reaisHtml + simuladasHtml;

  conversasListEl.querySelectorAll<HTMLButtonElement>('button[data-conversa-id]').forEach((btn) => {
    btn.addEventListener('click', () => abrirConversa(Number(btn.dataset.conversaId)));
  });
  conversasListEl.querySelectorAll<HTMLButtonElement>('button[data-simulado]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exemplo = simulados.find((m) => m.id === btn.dataset.simulado);
      if (exemplo) abrirSimulada(exemplo);
    });
  });
}

// Abre a conversa simulada vinda do link da tela de Matches (?simulado=<id>).
function abrirSimuladaDaUrl(): void {
  const id = new URLSearchParams(window.location.search).get('simulado');
  if (!id) return;
  const exemplo = buscarSimulado(usuario.tipo, id);
  if (exemplo) abrirSimulada(exemplo);
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const texto = conteudoEl.value.trim();
  if (!texto) return;

  // conversa simulada: grava no navegador e o outro lado responde em 1,5 s
  if (simuladaAtiva) {
    const exemplo = simuladaAtiva;
    conteudoEl.value = '';
    renderSimuladas(enviarMensagemSimulada(exemplo, texto), true);
    window.setTimeout(() => {
      const mensagens = responderSimulado(exemplo);
      if (simuladaAtiva === exemplo) renderSimuladas(mensagens);
    }, 1500);
    return;
  }

  if (!conversaAtivaId) return;

  try {
    await api.post(`/conversations/${conversaAtivaId}/messages`, { conteudo: conteudoEl.value.trim() });
    conteudoEl.value = '';
    await carregarMensagens(conversaAtivaId);
  } catch {
    // Mantém o texto no campo para o usuário tentar novamente.
  }
});

async function init(): Promise<void> {
  // Mentor não tem conversas reais: a API (/conversations) é só de startup e
  // investidor. Para ele, a tela mostra apenas as conversas de demonstração.
  if (usuario.tipo === 'mentor') {
    renderConversas([]);
    abrirSimuladaDaUrl();
    return;
  }

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
  abrirSimuladaDaUrl();
}

init().catch((error) => {
  // mesmo sem a API, as conversas simuladas continuam disponíveis
  renderConversas([]);
  conversasListEl.insertAdjacentHTML(
    'afterbegin',
    `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar conversas.'}</p>`,
  );
  abrirSimuladaDaUrl();
});
