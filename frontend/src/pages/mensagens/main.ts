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
  conversasSimuladas,
  enviarMensagemSimulada,
  mensagensSimuladas,
  responderSimulado,
  type MatchExemplo,
  type MensagemSimulada,
} from '../../scripts/matchSimulado';
import { avatarImg, generoPorNome } from '../../scripts/avatars';
import { carregarMeuPerfil } from '../../scripts/meuPerfil';
import type { Conversa, Mensagem } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor', 'mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const layoutEl = document.getElementById('mensagens-layout') as HTMLDivElement;
const conversasListEl = document.getElementById('conversas-list') as HTMLDivElement;
const chatBoxEl = document.getElementById('chat-box') as HTMLDivElement;
const chatCabecaEl = document.getElementById('chat-cabeca') as HTMLDivElement;
const formEl = document.getElementById('form-mensagem') as HTMLFormElement;
const conteudoEl = document.getElementById('conteudo') as HTMLInputElement;
const submitBtn = formEl.querySelector('button[type="submit"]') as HTMLButtonElement;

let conversaAtivaId: number | null = null;
let simuladaAtiva: MatchExemplo | null = null;
let pollTimer: ReturnType<typeof setInterval> | undefined;
// minha imagem (foto ou logo), mostrada ao lado das minhas mensagens
let minhaImg = '';

// Startup e investidor: conversas de exemplo (demonstração). Mentor: só conversas reais.
const simulados = usuario.tipo === 'mentor' ? [] : conversasSimuladas(usuario.tipo);

const PAPEL_LABEL = { investidor: 'Investidor', mentor: 'Mentor', startup: 'Startup' } as const;

// Marca visualmente (classe .ativa) qual botão da lista corresponde à conversa aberta.
function selecionarConversaNaLista(chave: string): void {
  conversasListEl.querySelectorAll<HTMLButtonElement>('button[data-chave]').forEach((btn) => {
    btn.classList.toggle('ativa', btn.dataset.chave === chave);
  });
}

function escapeHtml(texto: string): string {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/** No celular, mostra só a conversa aberta (a lista volta pelo botão "‹"). */
function mostrarChat(aberto: boolean): void {
  layoutEl.classList.toggle('mensagens-layout--aberta', aberto);
}

function avatarDe(ex: Pick<MatchExemplo, 'nome' | 'papel' | 'genero' | 'id'>, tamanho: number): string {
  const eLogo = ex.papel === 'startup' || ex.id === 'rede-nordeste-anjos';
  return avatarImg(ex.nome, { tipo: eLogo ? 'startup' : 'pessoa', genero: ex.genero, tamanho });
}

function cabecalho(nome: string, subtitulo: string, avatar: string, perfilHref?: string): void {
  chatCabecaEl.hidden = false;
  chatCabecaEl.innerHTML = `
    <button type="button" class="voltar" data-voltar aria-label="Voltar para as conversas">‹</button>
    ${avatar}
    <div style="min-width:0;flex:1">
      <p class="nome">${escapeHtml(nome)}</p>
      <p class="sub">${escapeHtml(subtitulo)}</p>
    </div>
    ${perfilHref ? `<a class="btn btn-outline" href="${escapeHtml(perfilHref)}">Ver perfil</a>` : ''}
  `;
  chatCabecaEl.querySelector('[data-voltar]')?.addEventListener('click', () => mostrarChat(false));
}

function linha(texto: string, minha: boolean, avatar: string, hora?: string): string {
  return `
    <div class="chat-linha ${minha ? 'minha' : ''}">
      ${avatar}
      <div class="mensagem ${minha ? 'minha' : ''}">
        ${texto}${hora ? `<span class="hora-msg">${escapeHtml(hora)}</span>` : ''}
      </div>
    </div>
  `;
}

function renderSimuladas(exemplo: MatchExemplo, mensagens: MensagemSimulada[], digitando = false): void {
  const avatarOutro = avatarDe(exemplo, 30);
  chatBoxEl.innerHTML =
    mensagens
      .map(
        (m) =>
          (m.dia ? `<div class="chat-dia">${escapeHtml(m.dia)}</div>` : '') +
          linha(escapeHtml(m.texto), m.minha, m.minha ? minhaImg && imgMini(minhaImg) : avatarOutro, m.hora),
      )
      .join('') +
    (digitando
      ? `<div class="chat-linha">${avatarOutro}<div class="mensagem digitando">digitando…</div></div>`
      : '');
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
}

function imgMini(src: string): string {
  return `<img class="av" src="${src}" alt="" width="30" height="30" style="width:30px;height:30px" />`;
}

// Abre uma conversa simulada (sem polling: tudo está no navegador).
function abrirSimulada(exemplo: MatchExemplo): void {
  clearInterval(pollTimer);
  conversaAtivaId = null;
  simuladaAtiva = exemplo;
  selecionarConversaNaLista(`sim-${exemplo.id}`);
  cabecalho(
    exemplo.nome,
    exemplo.subtitulo ?? `${PAPEL_LABEL[exemplo.papel]} · ${exemplo.localizacao}`,
    avatarDe(exemplo, 44),
    exemplo.perfilHref,
  );
  mostrarChat(true);
  conteudoEl.disabled = false;
  submitBtn.disabled = false;
  renderSimuladas(exemplo, mensagensSimuladas(exemplo));
}

// Busca as mensagens da conversa e redesenha as bolhas de chat. `minha` decide se a
// bolha usa a classe .minha (mensagem enviada pelo usuário logado) ou não.
async function carregarMensagens(conversaId: number, nomeOutro: string): Promise<void> {
  const mensagens = await api.get<Mensagem[]>(
    `/conversations/${conversaId}/messages`
  );
  const avatarOutro = avatarImg(nomeOutro, { genero: generoPorNome(nomeOutro), tamanho: 30 });

  chatBoxEl.innerHTML = mensagens
    .map((m) => {
      const minha = m.remetenteId === usuario.id;
      return linha(escapeHtml(m.conteudo), minha, minha ? (minhaImg ? imgMini(minhaImg) : '') : avatarOutro);
    })
    .join('');

  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
}

const conversasReais = new Map<number, Conversa>();

// Abre uma conversa: seleciona na lista, libera o formulário de envio, carrega as
// mensagens e liga o "polling" (recarrega a cada 5s enquanto essa conversa estiver aberta).
function abrirConversa(conversaId: number): void {
  conversaAtivaId = conversaId;
  simuladaAtiva = null;
  selecionarConversaNaLista(`real-${conversaId}`);
  const conversa = conversasReais.get(conversaId);
  const nome = conversa?.titulo ?? 'Conversa';
  cabecalho(
    nome,
    conversa?.tipo === 'direta' ? 'Conversa direta' : 'Match confirmado',
    avatarImg(nome, { genero: generoPorNome(nome), tamanho: 44 }),
  );
  mostrarChat(true);
  conteudoEl.disabled = false;
  submitBtn.disabled = false;

  carregarMensagens(conversaId, nome).catch(() => {
    chatBoxEl.innerHTML = '<p class="form-error">Erro ao carregar mensagens.</p>';
  });

  clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (conversaAtivaId) void carregarMensagens(conversaAtivaId, nome);
  }, 5000);
}

function itemConversa(opcoes: {
  chave: string;
  atributos: string;
  avatar: string;
  nome: string;
  papel?: keyof typeof PAPEL_LABEL;
  rotulo?: string;
  previa: string;
  hora?: string;
}): string {
  const tag = opcoes.papel
    ? `<span class="papel-tag ${opcoes.papel}">${PAPEL_LABEL[opcoes.papel]}</span>`
    : opcoes.rotulo
      ? `<span class="papel-tag">${escapeHtml(opcoes.rotulo)}</span>`
      : '';
  return `
    <button type="button" class="conversa-item" data-chave="${opcoes.chave}" ${opcoes.atributos}>
      ${opcoes.avatar}
      <span class="corpo">
        <span class="linha1"><span class="nome">${escapeHtml(opcoes.nome)}</span><span class="hora">${escapeHtml(opcoes.hora ?? '')}</span></span>
        <span class="linha2">${tag}<span class="previa-msg">${escapeHtml(opcoes.previa)}</span></span>
      </span>
    </button>`;
}

function renderConversas(conversas: Conversa[]): void {
  conversas.forEach((c) => conversasReais.set(c.id, c));

  const simuladasHtml = simulados
    .map((m) => {
      const msgs = mensagensSimuladas(m);
      const ultima = msgs[msgs.length - 1];
      return itemConversa({
        chave: `sim-${m.id}`,
        atributos: `data-simulado="${m.id}"`,
        avatar: avatarDe(m, 44),
        nome: m.nome,
        papel: m.papel,
        previa: `${ultima?.minha ? 'Você: ' : ''}${ultima?.texto ?? ''}`,
        hora: ultima?.hora,
      });
    })
    .join('');

  const reaisHtml = conversas
    .map((c) =>
      itemConversa({
        chave: `real-${c.id}`,
        atributos: `data-conversa-id="${c.id}" data-match-id="${c.matchId ?? ''}"`,
        avatar: avatarImg(c.titulo, { genero: generoPorNome(c.titulo), tamanho: 44 }),
        nome: c.titulo,
        rotulo: c.tipo === 'direta' ? 'Conversa direta' : 'Match',
        previa: c.tipo === 'direta' ? 'Conversa direta com o mentor' : 'Match confirmado: diga olá!',
      }),
    )
    .join('');

  if (!simuladasHtml && !reaisHtml) {
    conversasListEl.innerHTML = '<p class="text-muted" style="padding:14px">Nenhuma conversa ainda.</p>';
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
function abrirSimuladaDaUrl(): boolean {
  const id = new URLSearchParams(window.location.search).get('simulado');
  if (!id) return false;
  const exemplo = buscarSimulado(usuario.tipo, id);
  if (!exemplo) return false;
  abrirSimulada(exemplo);
  return true;
}

// No computador, já deixa a primeira conversa aberta (a tela não fica vazia).
function abrirPrimeiraNoDesktop(): void {
  if (conversaAtivaId || simuladaAtiva) return;
  if (window.matchMedia('(max-width: 720px)').matches) return;
  const primeira = conversasListEl.querySelector<HTMLButtonElement>('button[data-chave]');
  primeira?.click();
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const texto = conteudoEl.value.trim();
  if (!texto) return;

  // conversa simulada: grava no navegador e o outro lado responde em 1,5 s
  if (simuladaAtiva) {
    const exemplo = simuladaAtiva;
    conteudoEl.value = '';
    renderSimuladas(exemplo, enviarMensagemSimulada(exemplo, texto), true);
    window.setTimeout(() => {
      const mensagens = responderSimulado(exemplo);
      if (simuladaAtiva === exemplo) renderSimuladas(exemplo, mensagens);
      renderConversas([...conversasReais.values()]);
      selecionarConversaNaLista(`sim-${exemplo.id}`);
    }, 1500);
    return;
  }

  if (!conversaAtivaId) return;

  try {
    await api.post(`/conversations/${conversaAtivaId}/messages`, { conteudo: conteudoEl.value.trim() });
    conteudoEl.value = '';
    await carregarMensagens(conversaAtivaId, conversasReais.get(conversaAtivaId)?.titulo ?? '');
  } catch {
    // Mantém o texto no campo para o usuário tentar novamente.
  }
});

// ---------------------------------------------------------------------------
// Conversa direta do mentor (networking com startups e investidores)
// ---------------------------------------------------------------------------

const novaConversaEl = document.getElementById('nova-conversa') as HTMLElement;
const novaDestinoEl = document.getElementById('nova-destino') as HTMLSelectElement;
const novaIniciarEl = document.getElementById('nova-iniciar') as HTMLButtonElement;
const novaErroEl = document.getElementById('nova-erro') as HTMLElement;

interface PaginaNomes {
  items: { id: number; nomeFantasia?: string; nome?: string }[];
}

async function iniciarDireta(tipo: 'startup' | 'investidor', perfilId: number): Promise<void> {
  const conversa = await api.post<Conversa>('/conversations/direct', { tipo, perfilId });
  const conversas = await api.get<Conversa[]>('/conversations');
  renderConversas(conversas);
  abrirConversa(conversa.id);
}

async function prepararNovaConversa(): Promise<void> {
  novaConversaEl.hidden = false;
  const [startups, investidores] = await Promise.all([
    api.get<PaginaNomes>('/startups?limit=50').catch(() => ({ items: [] }) as PaginaNomes),
    api.get<PaginaNomes>('/investors?limit=50').catch(() => ({ items: [] }) as PaginaNomes),
  ]);
  const opcoes = [
    ...startups.items.map(
      (s) => `<option value="startup:${s.id}">Startup · ${escapeHtml(s.nomeFantasia ?? `#${s.id}`)}</option>`,
    ),
    ...investidores.items.map(
      (i) => `<option value="investidor:${i.id}">Investidor · ${escapeHtml(i.nome ?? `#${i.id}`)}</option>`,
    ),
  ];
  novaDestinoEl.innerHTML = opcoes.length
    ? '<option value="">Escolha com quem falar…</option>' + opcoes.join('')
    : '<option value="">Nenhuma startup ou investidor cadastrado ainda</option>';
}

novaIniciarEl.addEventListener('click', async () => {
  novaErroEl.textContent = '';
  const [tipo, id] = novaDestinoEl.value.split(':');
  if (!tipo || !id) {
    novaErroEl.textContent = 'Escolha uma startup ou um investidor.';
    return;
  }
  try {
    await iniciarDireta(tipo as 'startup' | 'investidor', Number(id));
  } catch (error) {
    novaErroEl.textContent =
      error instanceof ApiError ? error.message : 'Não foi possível iniciar a conversa.';
  }
});

async function init(): Promise<void> {
  const meu = await carregarMeuPerfil(usuario).catch(() => null);
  minhaImg = meu?.img ?? '';
  const conversas = await api.get<Conversa[]>('/conversations');
  renderConversas(conversas);

  if (usuario.tipo === 'mentor') {
    await prepararNovaConversa();
    // Veio de Solicitações/Agenda com ?conversarCom=startup-12: abre (ou cria) a conversa direta.
    const alvo = new URLSearchParams(window.location.search).get('conversarCom');
    if (alvo) {
      const [tipo, id] = alvo.split('-');
      if ((tipo === 'startup' || tipo === 'investidor') && Number(id)) {
        await iniciarDireta(tipo, Number(id));
      }
    }
    return;
  }

  // Se veio de um link "Matches -> Mensagens" com ?matchId=123, abre essa conversa
  // automaticamente em vez de deixar a tela em branco esperando um clique.
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get('matchId');
  if (matchId) {
    const conversa = conversas.find((c) => c.matchId === Number(matchId));
    if (conversa) abrirConversa(conversa.id);
  }
  if (!abrirSimuladaDaUrl()) abrirPrimeiraNoDesktop();
}

init().catch((error) => {
  // mesmo sem a API, as conversas simuladas continuam disponíveis
  renderConversas([]);
  conversasListEl.insertAdjacentHTML(
    'afterbegin',
    `<p class="form-error" style="padding:0 14px">${error instanceof ApiError ? error.message : 'Erro ao carregar conversas.'}</p>`,
  );
  if (!abrirSimuladaDaUrl()) abrirPrimeiraNoDesktop();
});
