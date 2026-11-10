// Tela: Mentorias — lógica
// ==========================
// A startup vê os mentores voluntários (GET /mentors) e agenda uma mentoria
// (POST /mentorias): escolhe dia e horário, tema e uma mensagem. O mentor aceita
// ou recusa; depois da sessão ele marca como realizada e o certificado é gerado.
//
// Regras do plano (validadas no backend):
//   - Básico: sem mentoria (o botão leva para a página de planos);
//   - Plus: 1 mentoria por mês; Premium: 2 por mês;
//   - cada mentor tem um limite de mentorias por mês e não aceita dois horários iguais.
//
// Foto, cargo, empresa e tempo de carreira do mentor ainda vêm do que ele salvou
// na tela Perfil, no navegador (scripts/mentorDemo.ts). Modalidade, duração, dias e
// horários e mentorias por mês vêm do banco.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { MODALIDADE_LABEL, iniciais, lerPerfilExtra } from '../../scripts/mentorDemo';
import { renderNav } from '../../scripts/nav';
import type { CotaMensal, Mentor, Mentoria } from '../../scripts/types';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const listEl = document.getElementById('mentores-list') as HTMLDivElement;

interface MentorExemplo {
  id: string;
  nome: string;
  /** Caminho/data URL da foto; vazio mostra as iniciais. */
  foto: string;
  cargo: string;
  empresa: string;
  anosCarreira: number | null;
  areaAtuacao: string;
  bio: string;
  especialidades: string[];
  disponibilidade: string;
  modalidade: string;
  /** "30 minutos" ou "1 hora". */
  duracao: string;
  mentoriasPorMes: number;
  /** Id do mentor no banco (usado para agendar). */
  mentorId: number;
  redeParceira: boolean;
  /** Selo azul de verificado. */
  verificado: boolean;
}

// Sem perfis de exemplo: só mentores reais podem receber agendamento.
const MENTORES_EXEMPLO: MentorExemplo[] = [];

// Perfis cadastrados na base que não devem aparecer nesta tela
// (área de atuação contendo um destes trechos).
const AREAS_OCULTAS = ['front-end', 'front end', 'frontend', 'growth e captação'];

function oculto(mentor: Mentor): boolean {
  // quem já preencheu o Perfil (nome/cargo/empresa) sempre aparece
  const extra = lerPerfilExtra(mentor.id);
  if (extra.nome || extra.cargo || extra.empresa) return false;
  const area = mentor.areaAtuacao.trim().toLowerCase();
  return AREAS_OCULTAS.some((trecho) => area.includes(trecho));
}

function textoDuracao(minutos: number): string {
  return minutos === 30 ? '30 minutos' : '1 hora';
}

function badgeTipo(redeParceira: boolean): string {
  return redeParceira
    ? '<span class="badge-eyebrow badge-eyebrow--green">Mentor da Rede Parceira</span>'
    : '<span class="badge-eyebrow badge-eyebrow--sky">Mentor independente</span>';
}

// Selo de verificado no estilo do Instagram (roseta azul com check branco).
const SELO_VERIFICADO = `
  <svg class="selo-verificado" viewBox="0 0 24 24" role="img" aria-label="Perfil verificado">
    <title>Perfil verificado</title>
    <path fill="#0095f6" d="M12.00 2.40Q15.26 -0.17 16.80 3.69Q20.91 3.09 20.31 7.20Q24.17 8.74 21.60 12.00Q24.17 15.26 20.31 16.80Q20.91 20.91 16.80 20.31Q15.26 24.17 12.00 21.60Q8.74 24.17 7.20 20.31Q3.09 20.91 3.69 16.80Q-0.17 15.26 2.40 12.00Q-0.17 8.74 3.69 7.20Q3.09 3.09 7.20 3.69Q8.74 -0.17 12.00 2.40Z"/>
    <path fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7.8 12.3l2.8 2.8 5.6-5.8"/>
  </svg>
`;

function escapeHtml(texto: string): string {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function fotoHtml(mentor: MentorExemplo, classe: string): string {
  return mentor.foto
    ? `<img class="${classe}" src="${mentor.foto}" alt="Foto de ${escapeHtml(mentor.nome)}" loading="lazy" />`
    : `<span class="${classe} mentor-iniciais" aria-hidden="true">${iniciais(mentor.nome)}</span>`;
}

function cargoEmpresa(mentor: MentorExemplo): string {
  return [mentor.cargo, mentor.empresa].filter(Boolean).join(' · ');
}

/** Mentor real (API) + perfil extra salvo pelo mentor -> mesmo formato do card. */
function deMentorReal(mentor: Mentor): MentorExemplo {
  const extra = lerPerfilExtra(mentor.id);
  return {
    id: `real-${mentor.id}`,
    mentorId: mentor.id,
    nome: extra.nome || mentor.nome || 'Mentor StartMatch',
    foto: extra.foto,
    cargo: escapeHtml(extra.cargo),
    empresa: escapeHtml(extra.empresa),
    anosCarreira: extra.anosExperiencia,
    areaAtuacao: escapeHtml(mentor.areaAtuacao),
    bio: escapeHtml(mentor.bio),
    especialidades: mentor.especialidades.map(escapeHtml),
    disponibilidade: escapeHtml(mentor.disponibilidade),
    modalidade: MODALIDADE_LABEL[mentor.modalidade] ?? mentor.modalidade,
    duracao: textoDuracao(mentor.duracaoMinutos),
    mentoriasPorMes: mentor.mentoriasPorMes,
    redeParceira: mentor.vinculoPortoDigital,
    verificado: Boolean(extra.foto && extra.empresa),
  };
}

// todos os perfis da lista (exemplos + reais), para o "Ver perfil"
const perfis = new Map<string, MentorExemplo>(MENTORES_EXEMPLO.map((m) => [m.id, m]));

function tags(especialidades: string[]): string {
  return especialidades.map((e) => `<span class="badge">${e}</span>`).join(' ');
}

function botaoSolicitar(id: string): string {
  return `
    <button class="btn btn-primary btn-block" type="button" data-solicitar="${id}">
      Agendar mentoria
    </button>
  `;
}

function renderExemplo(mentor: MentorExemplo): string {
  return `
    <div class="card mentor-card">
      <div class="mentor-head">
        ${fotoHtml(mentor, 'mentor-foto')}
        <div>
          <div class="card-title mentor-nome">${escapeHtml(mentor.nome)}${mentor.verificado ? SELO_VERIFICADO : ''}</div>
          <p class="text-muted mentor-area">${cargoEmpresa(mentor) || 'Mentor da plataforma StartMatch'}</p>
        </div>
      </div>
      ${badgeTipo(mentor.redeParceira)}
      <p class="mentor-bio">${mentor.areaAtuacao}</p>
      <p class="mentor-tags">${tags(mentor.especialidades)}</p>
      <div class="mentor-acoes">
        <button class="btn btn-outline btn-block" type="button" data-ver-perfil="${mentor.id}">
          Ver perfil
        </button>
        ${botaoSolicitar(mentor.id)}
      </div>
    </div>
  `;
}

/*
 * ================================
 * MODAL (ver perfil / solicitar)
 * ================================
 */

const modalEl = document.createElement('div');
modalEl.className = 'modal-backdrop';
modalEl.hidden = true;
document.body.appendChild(modalEl);

function fecharModal(): void {
  modalEl.hidden = true;
  modalEl.innerHTML = '';
}

function abrirModal(conteudo: string): void {
  modalEl.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button type="button" class="modal-close mentor-modal-close" aria-label="Fechar" data-fechar>✕</button>
      ${conteudo}
    </div>
  `;
  modalEl.hidden = false;
  (modalEl.querySelector('[data-fechar]') as HTMLButtonElement).focus();
}

modalEl.addEventListener('click', (event) => {
  const alvo = event.target as HTMLElement;
  if (alvo === modalEl || alvo.closest('[data-fechar]')) {
    fecharModal();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalEl.hidden) fecharModal();
});

function abrirPerfil(mentor: MentorExemplo): void {
  abrirModal(`
    <div class="mentor-perfil">
      ${fotoHtml(mentor, 'mentor-perfil-foto')}
      <h2>${escapeHtml(mentor.nome)}${mentor.verificado ? SELO_VERIFICADO : ''}</h2>
      <p class="mentor-perfil-cargo">${
        mentor.cargo && mentor.empresa
          ? `${mentor.cargo} na <strong>${mentor.empresa}</strong>`
          : cargoEmpresa(mentor) || mentor.areaAtuacao
      }</p>
      ${badgeTipo(mentor.redeParceira)}
    </div>
    <ul class="mentor-info">
      <li><strong>Tempo de carreira:</strong> ${mentor.anosCarreira ? `${mentor.anosCarreira} anos` : '—'}</li>
      <li><strong>Área:</strong> ${mentor.areaAtuacao}</li>
      <li><strong>Disponibilidade:</strong> ${mentor.disponibilidade}</li>
      <li><strong>Modalidade:</strong> ${mentor.modalidade}</li>
      <li><strong>Duração:</strong> ${mentor.duracao}</li>
      <li><strong>Mentorias por mês:</strong> ${mentor.mentoriasPorMes}</li>
    </ul>
    <p class="mentor-bio">${mentor.bio}</p>
    <p class="mentor-tags">${tags(mentor.especialidades)}</p>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline" data-fechar>Fechar</button>
      <button type="button" class="btn btn-primary" data-solicitar="${mentor.id}">Agendar mentoria</button>
    </div>
  `);
}

// ---------------------------------------------------------------------------
// Agendamento
// ---------------------------------------------------------------------------

let cota: CotaMensal | null = null;

function abrirSemPlano(): void {
  abrirModal(`
    <div class="modal-header"><h3>Agendar mentoria</h3></div>
    <p class="modal-body">
      Agendar mentorias é um recurso dos planos <strong>Plus</strong> (1 mentoria por mês)
      e <strong>Premium</strong> (2 por mês). Faça upgrade do seu plano para agendar.
    </p>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline" data-fechar>Fechar</button>
      <a class="btn btn-primary" href="../plano/index.html">Ver planos</a>
    </div>
  `);
}

// Valor mínimo do campo de data: daqui a 1 hora, no formato do input datetime-local.
function minimoDataHora(): string {
  const d = new Date(Date.now() + 60 * 60_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function abrirAgendamento(mentor: MentorExemplo): void {
  if (cota && cota.limite === 0) {
    abrirSemPlano();
    return;
  }
  abrirModal(`
    <div class="modal-header"><h3>Agendar mentoria com ${escapeHtml(mentor.nome)}</h3></div>
    <form id="form-agendar" class="modal-body">
      <p class="text-muted">
        ${mentor.duracao} · ${mentor.modalidade}<br />
        Dias e horários do mentor: ${mentor.disponibilidade}
      </p>
      <div class="field">
        <label for="ag-data">Dia e horário</label>
        <input class="input" id="ag-data" type="datetime-local" min="${minimoDataHora()}" required />
      </div>
      <div class="field">
        <label for="ag-tema">Tema da mentoria</label>
        <input class="input" id="ag-tema" type="text" maxlength="120" placeholder="Ex.: Preparar o pitch para investidores" required />
      </div>
      <div class="field">
        <label for="ag-msg">Mensagem para o mentor (opcional)</label>
        <textarea class="input" id="ag-msg" rows="3" maxlength="500"></textarea>
      </div>
      <p id="ag-erro" class="form-error" aria-live="polite"></p>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" data-fechar>Cancelar</button>
        <button type="submit" class="btn btn-primary" id="ag-enviar">Enviar pedido</button>
      </div>
    </form>
  `);

  const form = modalEl.querySelector('#form-agendar') as HTMLFormElement;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const erroEl = modalEl.querySelector('#ag-erro') as HTMLElement;
    const botao = modalEl.querySelector('#ag-enviar') as HTMLButtonElement;
    const data = (modalEl.querySelector('#ag-data') as HTMLInputElement).value;
    const tema = (modalEl.querySelector('#ag-tema') as HTMLInputElement).value.trim();
    const mensagem = (modalEl.querySelector('#ag-msg') as HTMLTextAreaElement).value.trim();
    erroEl.textContent = '';
    botao.disabled = true;
    botao.textContent = 'Enviando…';
    try {
      await api.post('/mentorias', {
        mentorId: mentor.mentorId,
        dataHora: new Date(data).toISOString(),
        tema,
        mensagem,
      });
      abrirModal(`
        <div class="modal-header"><h3>Pedido enviado!</h3></div>
        <p class="modal-body">
          O mentor vai aceitar ou recusar. Acompanhe o status em "Minhas mentorias" abaixo.
        </p>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-fechar>Ok</button>
        </div>
      `);
      await atualizarCotaEMinhas();
    } catch (error) {
      erroEl.textContent =
        error instanceof ApiError ? error.message : 'Não foi possível agendar agora.';
      botao.disabled = false;
      botao.textContent = 'Enviar pedido';
    }
  });
}

// um único listener para os botões da lista e do modal
document.addEventListener('click', (event) => {
  const alvo = event.target as HTMLElement;

  const perfilBtn = alvo.closest<HTMLElement>('[data-ver-perfil]');
  if (perfilBtn) {
    const mentor = perfis.get(perfilBtn.dataset.verPerfil ?? '');
    if (mentor) abrirPerfil(mentor);
    return;
  }

  const solicitarBtn = alvo.closest<HTMLElement>('[data-solicitar]');
  if (solicitarBtn) {
    const mentor = perfis.get(solicitarBtn.dataset.solicitar ?? '');
    if (mentor) abrirAgendamento(mentor);
    return;
  }

  const cancelarBtn = alvo.closest<HTMLElement>('[data-cancelar]');
  if (cancelarBtn) {
    void cancelarMentoria(Number(cancelarBtn.dataset.cancelar), cancelarBtn as HTMLButtonElement);
  }
});

// ---------------------------------------------------------------------------
// Cota do plano e "Minhas mentorias"
// ---------------------------------------------------------------------------

const cotaEl = document.getElementById('cota-mentorias') as HTMLElement;
const minhasEl = document.getElementById('minhas-mentorias') as HTMLElement;

const PLANO_NOME: Record<string, string> = { basico: 'Básico', plus: 'Plus', premium: 'Premium' };

function renderCota(): void {
  if (!cota) return;
  const plano = PLANO_NOME[cota.plano] ?? cota.plano;
  if (!cota.limite) {
    cotaEl.innerHTML = `
      <strong>Plano ${plano}:</strong> o plano Básico não inclui mentorias.
      <a class="btn-link" href="../plano/index.html">Faça upgrade para Plus (1 por mês) ou Premium (2 por mês)</a>.
    `;
    return;
  }
  cotaEl.innerHTML = `
    <strong>Plano ${plano}:</strong> você usou <strong>${cota.usados} de ${cota.limite}</strong>
    mentoria(s) neste mês.
  `;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: '<span class="badge-eyebrow badge-eyebrow--amber">Aguardando o mentor</span>',
  aceita: '<span class="badge-eyebrow badge-eyebrow--green">Confirmada</span>',
  recusada: '<span class="badge-eyebrow badge-eyebrow--gray">Recusada</span>',
  realizada: '<span class="badge-eyebrow badge-eyebrow--green">Realizada</span>',
  cancelada: '<span class="badge-eyebrow badge-eyebrow--gray">Cancelada</span>',
};

function renderMinhas(lista: Mentoria[]): void {
  if (lista.length === 0) {
    minhasEl.innerHTML =
      '<p class="text-muted">Você ainda não pediu nenhuma mentoria. Escolha um mentor acima.</p>';
    return;
  }
  minhasEl.innerHTML = lista
    .map((m) => {
      const quando = new Date(m.dataHora).toLocaleString('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short',
      });
      const podeCancelar = m.status === 'pendente' || m.status === 'aceita';
      return `
        <div class="card" style="margin-bottom: var(--spacing-sm)">
          <div class="card-title">${escapeHtml(m.tema)} ${STATUS_LABEL[m.status] ?? ''}</div>
          <p class="text-muted">
            Mentor: ${escapeHtml(m.mentorNome)} · ${quando} · ${textoDuracao(m.duracaoMinutos)}
          </p>
          ${
            m.codigoCertificado
              ? `<p class="text-muted">Código do certificado: <strong>${m.codigoCertificado}</strong></p>`
              : ''
          }
          ${
            podeCancelar
              ? `<button type="button" class="btn btn-outline" data-cancelar="${m.id}">Cancelar mentoria</button>`
              : ''
          }
        </div>
      `;
    })
    .join('');
}

async function atualizarCotaEMinhas(): Promise<void> {
  const [novaCota, minhas] = await Promise.all([
    api.get<CotaMensal>('/mentorias/quota'),
    api.get<Mentoria[]>('/mentorias'),
  ]);
  cota = novaCota;
  renderCota();
  renderMinhas(minhas.slice().reverse());
}

async function cancelarMentoria(id: number, botao: HTMLButtonElement): Promise<void> {
  botao.disabled = true;
  try {
    await api.patch(`/mentorias/${id}/status`, { status: 'cancelada' });
    await atualizarCotaEMinhas();
  } catch (error) {
    botao.disabled = false;
    alert(error instanceof ApiError ? error.message : 'Não foi possível cancelar agora.');
  }
}

/*
 * ================================
 * LISTA
 * ================================
 */

const exemplosHtml = MENTORES_EXEMPLO.map(renderExemplo).join('');
listEl.innerHTML = exemplosHtml;

async function init(): Promise<void> {
  const mentores = await api.get<Mentor[]>('/mentors');
  const reais = mentores.filter((m) => !oculto(m)).map(deMentorReal);
  reais.forEach((m) => perfis.set(m.id, m));
  listEl.innerHTML =
    exemplosHtml +
    (reais.length
      ? reais.map(renderExemplo).join('')
      : '<p class="text-muted">Nenhum mentor cadastrado ainda.</p>');
  await atualizarCotaEMinhas();
}

init().catch((error) => {
  listEl.innerHTML =
    exemplosHtml +
    `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar mentores.'}</p>`;
});
