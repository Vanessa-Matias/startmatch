// Tela: Eventos e Editais — lógica (SIMULAÇÃO, sem backend e sem banco de dados)
// ===============================================================================
// Plus opcional do projeto: mostra eventos reais do ecossistema de Recife
// (Mangue.Bit e REC'n'Play) e simula o fluxo de participação das startups.
//   - startup: "Quero participar" -> escreve um mini-pitch e se inscreve (ou cancela);
//   - investidor / admin: veem as startups inscritas (exemplos fictícios + as inscrições
//     feitas por quem está testando);
//   - admin: também cadastra e remove eventos da demonstração.
// Tudo é guardado no localStorage do navegador (ver eventosData.ts) — nada vai para a API.

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import {
  EVENTOS_BASE,
  INSCRICOES_EXEMPLO,
  type EventoDemo,
  type InscricaoDemo,
} from './eventosData';

const usuario = requireAuth(['admin', 'startup', 'investidor', 'mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const isAdmin = usuario.tipo === 'admin';
const isStartup = usuario.tipo === 'startup';
const podeVerInscritos = isAdmin || usuario.tipo === 'investidor';

const STORAGE_KEY = 'sc_demo_eventos';

interface EstadoDemo {
  custom: EventoDemo[];
  removidos: string[];
  inscricoes: InscricaoDemo[];
}

function lerEstado(): EstadoDemo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EstadoDemo;
  } catch {
    // localStorage indisponível ou corrompido: começa do zero.
  }
  return { custom: [], removidos: [], inscricoes: [] };
}

function salvarEstado(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // Sem localStorage a simulação continua funcionando até recarregar a página.
  }
}

let estado = lerEstado();

const listaEl = document.getElementById('eventos-lista') as HTMLElement;
const errorEl = document.getElementById('eventos-error') as HTMLElement;
const successEl = document.getElementById('eventos-success') as HTMLElement;
const subtituloEl = document.getElementById('eventos-subtitulo') as HTMLElement;
const formCard = document.getElementById('evento-form-card') as HTMLElement;
const form = document.getElementById('evento-form') as HTMLFormElement;
const formError = document.getElementById('evento-form-error') as HTMLElement;
const formSuccess = document.getElementById('evento-form-success') as HTMLElement;

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function avisar(tipo: 'erro' | 'sucesso', texto: string): void {
  errorEl.textContent = tipo === 'erro' ? texto : '';
  successEl.textContent = tipo === 'sucesso' ? texto : '';
}

function eventosVisiveis(): EventoDemo[] {
  return [...EVENTOS_BASE, ...estado.custom].filter((e) => !estado.removidos.includes(e.id));
}

function inscritosDo(eventoId: string): InscricaoDemo[] {
  return [
    ...estado.inscricoes.filter((i) => i.eventoId === eventoId),
    ...INSCRICOES_EXEMPLO.filter((i) => i.eventoId === eventoId),
  ];
}

function minhaInscricao(eventoId: string): InscricaoDemo | undefined {
  return estado.inscricoes.find((i) => i.eventoId === eventoId && i.usuarioId === usuario.id);
}

function encerrado(evento: EventoDemo): boolean {
  return new Date(evento.dataFim).getTime() < Date.now();
}

function renderEvento(evento: EventoDemo): string {
  const fim = encerrado(evento);
  const inscrita = !!minhaInscricao(evento.id);
  const total = inscritosDo(evento.id).length;

  const badges = [
    evento.destaque ? `<span class="badge badge-accent">${escapeHtml(evento.destaque)}</span>` : '',
    fim ? '<span class="badge">Encerrado</span>' : '<span class="badge badge-success">Inscrições abertas</span>',
    isStartup && inscrita ? '<span class="badge badge-success">Você está inscrita</span>' : '',
  ].join(' ');

  const acoes: string[] = [];
  if (isStartup) {
    if (inscrita) {
      acoes.push(`<button class="btn btn-outline" data-acao="cancelar" data-id="${evento.id}">Cancelar inscrição</button>`);
    } else if (!fim) {
      acoes.push(`<button class="btn btn-primary" data-acao="inscrever" data-id="${evento.id}">Quero participar</button>`);
    }
  }
  if (podeVerInscritos) {
    acoes.push(`<button class="btn btn-outline" data-acao="inscritos" data-id="${evento.id}">Ver startups inscritas (${total})</button>`);
  } else if (isStartup) {
    acoes.push(`<button class="btn btn-outline" data-acao="inscritos" data-id="${evento.id}">Quem vai participar (${total})</button>`);
  }
  if (isAdmin && !evento.base) {
    acoes.push(`<button class="btn btn-outline" data-acao="remover" data-id="${evento.id}">Remover evento</button>`);
  }

  const imagem = evento.imagem
    ? `<img class="evento-imagem" src="${escapeHtml(evento.imagem)}" alt="Divulgação: ${escapeHtml(evento.titulo)}" loading="lazy" />`
    : '';
  const link = evento.linkExterno
    ? `<p><a class="btn-link" href="${escapeHtml(evento.linkExterno)}" target="_blank" rel="noopener noreferrer">Saiba mais sobre o evento</a></p>`
    : '';

  return `
    <article class="card evento-card${evento.imagem ? '' : ' sem-imagem'}" data-evento="${escapeHtml(evento.id)}">
      ${imagem}
      <div>
        <h2>${escapeHtml(evento.titulo)}</h2>
        <p>${badges}</p>
        <p>${escapeHtml(evento.descricao)}</p>
        <div class="evento-meta">
          <span>📅 ${escapeHtml(evento.quando)}</span>
          <span>📍 ${escapeHtml(evento.local)}</span>
          <span>👥 ${total} startup(s) inscrita(s)</span>
        </div>
        ${link}
        <div class="evento-acoes">${acoes.join('')}</div>
        <div class="evento-painel" data-painel="${escapeHtml(evento.id)}" hidden></div>
      </div>
    </article>
  `;
}

function renderLista(): void {
  const eventos = eventosVisiveis();
  listaEl.innerHTML = eventos.length
    ? eventos.map(renderEvento).join('')
    : '<div class="empty-state">Nenhum evento disponível no momento.</div>';
}

function painelDe(id: string): HTMLElement {
  return listaEl.querySelector(`[data-painel="${CSS.escape(id)}"]`) as HTMLElement;
}

function mostrarInscritos(id: string): void {
  const painel = painelDe(id);
  if (!painel.hidden && !painel.querySelector('form')) {
    painel.hidden = true;
    return;
  }
  const inscritos = inscritosDo(id);
  painel.hidden = false;
  painel.innerHTML = inscritos.length
    ? inscritos
        .map(
          (i) => `
            <div class="inscrito-item">
              <strong>${escapeHtml(i.nomeFantasia)}</strong>
              <span class="text-muted">${escapeHtml(i.detalhe)}</span>
              <p>${escapeHtml(i.miniPitch)}</p>
              ${i.videoNome ? `<p class="text-muted">🎬 Vídeo pitch: ${escapeHtml(i.videoNome)}</p>` : ''}
            </div>`,
        )
        .join('')
    : '<p class="text-muted">Nenhuma startup inscrita ainda.</p>';
}

function mostrarFormInscricao(id: string): void {
  const painel = painelDe(id);
  if (!painel.hidden && painel.querySelector('form')) {
    painel.hidden = true;
    return;
  }
  painel.hidden = false;
  const idSeguro = escapeHtml(id);
  painel.innerHTML = `
    <form class="inscricao-form" data-inscricao-form="${idSeguro}">
      <div class="field">
        <label for="pitch-${idSeguro}"><strong>Mini-pitch</strong> — apresente sua startup em poucas linhas</label>
        <textarea class="textarea" id="pitch-${idSeguro}" required maxlength="500"></textarea>
      </div>

      <div class="field">
        <label for="video-${idSeguro}"><strong>Mini-pitch em vídeo</strong> (opcional) — até 5 minutos</label>
        <div class="video-drop" data-video-drop>
          <input type="file" id="video-${idSeguro}" accept="video/*" data-video-input />
          <span class="video-drop-icone" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <path d="M7 10l5 5 5-5"></path>
              <path d="M12 15V3"></path>
            </svg>
          </span>
          <strong data-video-titulo>Clique ou arraste seu vídeo aqui</strong>
          <small data-video-info>MP4, MOV ou WEBM · duração máxima de 5 minutos</small>
        </div>
      </div>

      <div class="inscricao-acoes">
        <button class="btn btn-outline" type="button" data-acao="fechar-inscricao" data-id="${idSeguro}">Cancelar</button>
        <button class="btn btn-primary" type="submit">Enviar</button>
      </div>
    </form>`;
}

// ---------- Vídeo do mini-pitch (opcional, até 5 minutos) ----------
const VIDEO_MAX_SEGUNDOS = 5 * 60;

/** Lê a duração do vídeo pelos metadados, sem enviar o arquivo a lugar nenhum. */
function duracaoDoVideo(arquivo: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('vídeo inválido'));
    };
    video.src = url;
  });
}

function formatarDuracao(segundos: number): string {
  const total = Math.round(segundos);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

async function selecionarVideo(input: HTMLInputElement): Promise<void> {
  const area = input.closest('[data-video-drop]') as HTMLElement;
  const titulo = area.querySelector('[data-video-titulo]') as HTMLElement;
  const info = area.querySelector('[data-video-info]') as HTMLElement;
  const arquivo = input.files?.[0];

  const limpar = () => {
    input.value = '';
    area.classList.remove('tem-video');
    titulo.textContent = 'Clique ou arraste seu vídeo aqui';
    info.textContent = 'MP4, MOV ou WEBM · duração máxima de 5 minutos';
  };

  if (!arquivo) {
    limpar();
    return;
  }
  if (!arquivo.type.startsWith('video/')) {
    limpar();
    avisar('erro', 'Selecione um arquivo de vídeo.');
    return;
  }

  try {
    const duracao = await duracaoDoVideo(arquivo);
    if (duracao > VIDEO_MAX_SEGUNDOS) {
      limpar();
      avisar('erro', `O vídeo tem ${formatarDuracao(duracao)} — o limite é de 5 minutos.`);
      return;
    }
    area.classList.add('tem-video');
    titulo.textContent = arquivo.name;
    info.textContent = `Duração ${formatarDuracao(duracao)} · clique para trocar o vídeo`;
    avisar('sucesso', '');
  } catch {
    limpar();
    avisar('erro', 'Não foi possível ler este vídeo. Tente outro arquivo.');
  }
}

function inscrever(id: string, miniPitch: string, videoNome?: string): void {
  if (minhaInscricao(id)) {
    avisar('erro', 'Sua startup já está inscrita neste evento.');
    return;
  }
  estado.inscricoes.push({
    eventoId: id,
    nomeFantasia: usuario.nome,
    detalhe: 'Inscrição feita nesta demonstração',
    miniPitch,
    videoNome,
    exemplo: false,
    usuarioId: usuario.id,
  });
  salvarEstado();
  renderLista();
  avisar('sucesso', 'Inscrição realizada com sucesso!');
}

function cancelar(id: string): void {
  estado.inscricoes = estado.inscricoes.filter((i) => !(i.eventoId === id && i.usuarioId === usuario.id));
  salvarEstado();
  renderLista();
  avisar('sucesso', 'Inscrição cancelada.');
}

function remover(id: string): void {
  if (!window.confirm('Remover este evento da demonstração?')) return;
  estado.custom = estado.custom.filter((e) => e.id !== id);
  estado.inscricoes = estado.inscricoes.filter((i) => i.eventoId !== id);
  salvarEstado();
  renderLista();
  avisar('sucesso', 'Evento removido.');
}

// ---------- Cadastro de evento (admin, simulado) ----------
form.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.textContent = '';
  formSuccess.textContent = '';

  const dados = new FormData(form);
  const texto = (campo: string) => String(dados.get(campo) ?? '').trim();
  const dataLocal = texto('dataEvento');

  if (!texto('titulo') || !texto('descricao') || !texto('local') || !dataLocal) {
    formError.textContent = 'Preencha título, descrição, data e local.';
    return;
  }

  const data = new Date(dataLocal);
  const quando = `${data.toLocaleDateString('pt-BR', { dateStyle: 'long' })} · ${data.toLocaleTimeString('pt-BR', { timeStyle: 'short' })}`;

  estado.custom.push({
    id: `custom-${Date.now()}`,
    titulo: texto('titulo'),
    descricao: texto('descricao'),
    quando,
    dataFim: data.toISOString(),
    local: texto('local'),
    linkExterno: texto('linkExterno') || undefined,
    base: false,
  });
  salvarEstado();
  form.reset();
  renderLista();
  formSuccess.textContent = 'Evento publicado com sucesso!';
});

// ---------- Cliques (delegação) ----------
listaEl.addEventListener('click', (event) => {
  const botao = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-acao]');
  if (!botao) return;
  const id = botao.dataset.id as string;
  avisar('sucesso', '');
  switch (botao.dataset.acao) {
    case 'inscritos':
      mostrarInscritos(id);
      break;
    case 'inscrever':
      mostrarFormInscricao(id);
      break;
    case 'fechar-inscricao':
      painelDe(id).hidden = true;
      break;
    case 'cancelar':
      cancelar(id);
      break;
    case 'remover':
      remover(id);
      break;
  }
});

listaEl.addEventListener('submit', (event) => {
  const alvo = event.target as HTMLFormElement;
  if (!alvo.dataset.inscricaoForm) return;
  event.preventDefault();
  const pitch = alvo.querySelector('textarea')?.value.trim() ?? '';
  if (!pitch) {
    avisar('erro', 'Escreva seu mini-pitch antes de enviar.');
    return;
  }
  const video = alvo.querySelector<HTMLInputElement>('[data-video-input]')?.files?.[0];
  inscrever(alvo.dataset.inscricaoForm, pitch, video?.name);
});

listaEl.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.matches('[data-video-input]')) void selecionarVideo(input);
});

// Destaque visual ao arrastar um arquivo sobre a área do vídeo.
listaEl.addEventListener('dragover', (event) => {
  (event.target as HTMLElement).closest('[data-video-drop]')?.classList.add('arrastando');
});
['dragleave', 'drop'].forEach((tipo) =>
  listaEl.addEventListener(tipo, (event) => {
    (event.target as HTMLElement).closest('[data-video-drop]')?.classList.remove('arrastando');
  }),
);

// ---------- Início ----------
if (isAdmin) {
  formCard.hidden = false;
  subtituloEl.textContent = 'Cadastre eventos e acompanhe as startups inscritas.';
} else if (isStartup) {
  subtituloEl.textContent = 'Escolha um evento e se inscreva com um mini-pitch da sua startup.';
} else if (podeVerInscritos) {
  subtituloEl.textContent = 'Acompanhe os eventos e conheça as startups que vão participar.';
} else {
  subtituloEl.textContent = 'Eventos do ecossistema de inovação do Recife.';
}

renderLista();
