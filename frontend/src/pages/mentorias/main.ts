// Tela: Mentorias — lógica
// ==========================
// Mostra os mentores para a startup escolher com quem quer mentoria.
//
// Antes dos mentores reais (GET /mentors) aparecem 3 PERFIS DE EXEMPLO
// (MENTORES_EXEMPLO), com foto, empresa e tempo de carreira, montados a partir
// das regras de Mentores e Mentorias extras da página de Planos. Servem para
// demonstrar a tela; para tirar, basta esvaziar a lista.
//
// Os mentores reais usam o MESMO card: área, bio, especialidades e
// disponibilidade vêm do backend, e foto, cargo, empresa, tempo de experiência e
// modalidade vêm do que o mentor salvou na tela Perfil (scripts/mentorDemo.ts).
//
// - "Ver perfil" abre um modal com o perfil completo do mentor.
// - "Solicitar mentoria" funciona em modo DEMONSTRAÇÃO: ainda não existe
//   agendamento no backend, então o modal sempre avisa que a startup não tem
//   mais mentorias disponíveis e oferece a compra de mentorias extras.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { MODALIDADE_LABEL, iniciais, lerPerfilExtra } from '../../scripts/mentorDemo';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

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
  pacotes: string;
  redeParceira: boolean;
  /** Selo azul de verificado. */
  verificado: boolean;
}

const MENTORES_EXEMPLO: MentorExemplo[] = [
  {
    id: 'mariana',
    nome: 'Mariana Albuquerque',
    foto: '/imagens/mentores/mariana-albuquerque.png',
    cargo: 'CEO',
    empresa: 'Pitang',
    anosCarreira: 18,
    areaAtuacao: 'Estratégia e captação de investimento',
    bio: 'Lidera a Pitang e já acompanhou dezenas de startups do Porto Digital. Ajuda a estruturar o pitch, definir valuation e se preparar para rodadas com investidores-anjo.',
    especialidades: ['Pitch para investidores', 'Valuation', 'Rodada anjo'],
    disponibilidade: 'Segunda a sexta, 9h às 12h',
    modalidade: 'Online ou presencial (Recife)',
    pacotes: 'Básico, Start e Premium',
    redeParceira: true,
    verificado: true,
  },
  {
    id: 'rafael',
    nome: 'Rafael Cavalcanti',
    foto: '/imagens/mentores/rafael-cavalcanti.png',
    cargo: 'Desenvolvedor de Software',
    empresa: 'Capgemini',
    anosCarreira: 9,
    areaAtuacao: 'Produto e tecnologia',
    bio: 'Desenvolvedor na Capgemini, com experiência em produtos digitais de grande escala. Orienta a construção do MVP, a escolha da arquitetura e as boas práticas de código.',
    especialidades: ['MVP', 'Arquitetura de software', 'Boas práticas de código'],
    disponibilidade: 'Terças e quintas, 14h às 18h',
    modalidade: 'Online',
    pacotes: 'Básico e Start',
    redeParceira: false,
    verificado: true,
  },
  {
    id: 'juliana',
    nome: 'Juliana Freitas',
    foto: '/imagens/mentores/juliana-freitas.png',
    cargo: 'Engenheira de Dados Sênior',
    empresa: 'Hub de Inovação Bradesco',
    anosCarreira: 7,
    areaAtuacao: 'Dados e métricas de crescimento',
    bio: 'Engenheira de dados sênior no Hub de Inovação Bradesco. Ajuda startups a organizar seus dados, definir as métricas certas e tomar decisões de crescimento com base nelas.',
    especialidades: ['Engenharia de dados', 'Métricas de produto', 'Analytics'],
    disponibilidade: 'Segunda, quarta e sexta, 18h às 21h',
    modalidade: 'Online ou presencial (Recife)',
    pacotes: 'Start e Premium',
    redeParceira: true,
    verificado: true,
  },
];

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
    nome: extra.nome || 'Mentor StartMatch',
    foto: extra.foto,
    cargo: escapeHtml(extra.cargo),
    empresa: escapeHtml(extra.empresa),
    anosCarreira: extra.anosExperiencia,
    areaAtuacao: escapeHtml(mentor.areaAtuacao),
    bio: escapeHtml(mentor.bio),
    especialidades: mentor.especialidades.map(escapeHtml),
    disponibilidade: escapeHtml(mentor.disponibilidade),
    modalidade: MODALIDADE_LABEL[extra.modalidade],
    pacotes: 'Básico, Start e Premium',
    redeParceira: mentor.vinculoPortoDigital,
    verificado: Boolean(extra.foto && extra.empresa),
  };
}

// todos os perfis da lista (exemplos + reais), para o "Ver perfil"
const perfis = new Map<string, MentorExemplo>(MENTORES_EXEMPLO.map((m) => [m.id, m]));

function tags(especialidades: string[]): string {
  return especialidades.map((e) => `<span class="badge">${e}</span>`).join(' ');
}

const BOTAO_SOLICITAR = `
  <button class="btn btn-primary btn-block" type="button" data-solicitar>
    Solicitar mentoria
  </button>
`;

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
        ${BOTAO_SOLICITAR}
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
      <li><strong>Pacotes de mentorias extras:</strong> ${mentor.pacotes}</li>
    </ul>
    <p class="mentor-bio">${mentor.bio}</p>
    <p class="mentor-tags">${tags(mentor.especialidades)}</p>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline" data-fechar>Fechar</button>
      <button type="button" class="btn btn-primary" data-solicitar>Solicitar mentoria</button>
    </div>
  `);
}

function abrirSemSaldo(): void {
  abrirModal(`
    <div class="modal-header"><h3>Solicitar mentoria</h3></div>
    <p class="modal-body">
      Você não tem mais mentorias disponíveis. Aguarde o próximo mês ou
      assine mais pacotes.
    </p>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline" data-fechar>Fechar</button>
      <a class="btn btn-primary" href="../comprar-mentorias/index.html">Comprar mentorias extras</a>
    </div>
  `);
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

  if (alvo.closest('[data-solicitar]')) {
    abrirSemSaldo();
  }
});

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
  listEl.innerHTML = exemplosHtml + reais.map(renderExemplo).join('');
}

init().catch((error) => {
  listEl.innerHTML =
    exemplosHtml +
    `<p class="form-error">${error instanceof ApiError ? error.message : 'Erro ao carregar mentores.'}</p>`;
});
