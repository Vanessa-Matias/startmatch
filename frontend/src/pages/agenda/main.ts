import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import {
  iniciais,
  proximasSessoes,
} from '../../scripts/mentorDemo';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

const usuario = requireAuth(['mentor']);

/* =========================================================
   NAVBAR
   ========================================================= */

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);

/* =========================================================
   ELEMENTOS DA DISPONIBILIDADE
   ========================================================= */

const disponibilidadeEl =
  document.getElementById(
    'disponibilidade',
  ) as HTMLParagraphElement;

const btnAlternarDisponibilidade =
  document.getElementById(
    'btn-alternar-disponibilidade',
  ) as HTMLButtonElement;

const statusDot =
  document.getElementById(
    'status-dot',
  ) as HTMLElement;

const textoStatusDisponibilidade =
  document.getElementById(
    'texto-status-disponibilidade',
  ) as HTMLElement;

const resumoDisponibilidade =
  document.getElementById(
    'resumo-disponibilidade',
  ) as HTMLElement;

const resumoStatus =
  document.getElementById(
    'resumo-status',
  ) as HTMLElement;

/* =========================================================
   ELEMENTOS DA CONFIGURAÇÃO
   ========================================================= */

const horarioInicio =
  document.getElementById(
    'horario-inicio',
  ) as HTMLInputElement;

const horarioFim =
  document.getElementById(
    'horario-fim',
  ) as HTMLInputElement;

const diasSelecionados =
  document.getElementById(
    'dias-selecionados',
  ) as HTMLElement;

const horariosSelecionados =
  document.getElementById(
    'horarios-selecionados',
  ) as HTMLElement;

const erroDisponibilidade =
  document.getElementById(
    'erro-disponibilidade',
  ) as HTMLParagraphElement;

const salvarDisponibilidade =
  document.getElementById(
    'salvar-disponibilidade',
  ) as HTMLButtonElement;

/* =========================================================
   ESTADO
   ========================================================= */

let disponibilidadeAtiva = true;

// Dias, horários e status ficam salvos no navegador para a tela abrir como o
// mentor deixou; o texto da disponibilidade também vai para o backend
// (PATCH /mentors/me), aparecendo no Perfil e para as startups em Mentorias.
interface AgendaSalva {
  ativa: boolean;
  dias: string[];
  inicio: string;
  fim: string;
}
const CHAVE_AGENDA = 'sm_mentor_agenda';

function lerAgenda(): AgendaSalva | null {
  try {
    const valor = localStorage.getItem(CHAVE_AGENDA);
    return valor ? (JSON.parse(valor) as AgendaSalva) : null;
  } catch {
    return null;
  }
}

function gravarAgenda(): void {
  const agenda: AgendaSalva = {
    ativa: disponibilidadeAtiva,
    dias: Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="dia"]:checked'),
    ).map((input) => input.value),
    inicio: horarioInicio.value,
    fim: horarioFim.value,
  };
  try {
    localStorage.setItem(CHAVE_AGENDA, JSON.stringify(agenda));
  } catch {
    // sem armazenamento: só não é lembrado
  }
}

function aplicarAgendaSalva(): void {
  const agenda = lerAgenda();
  if (!agenda) return;
  disponibilidadeAtiva = agenda.ativa;
  document.querySelectorAll<HTMLInputElement>('input[name="dia"]').forEach((input) => {
    input.checked = agenda.dias.includes(input.value);
  });
  if (agenda.inicio) horarioInicio.value = agenda.inicio;
  if (agenda.fim) horarioFim.value = agenda.fim;
}

/* =========================================================
   PRÓXIMAS SESSÕES (solicitações aceitas)
   ========================================================= */
const proximasListEl = document.getElementById('proximas-list') as HTMLDivElement;
const resumoSessoes = document.getElementById('resumo-sessoes') as HTMLElement;

function renderProximasSessoes(): void {
  const sessoes = proximasSessoes();
  resumoSessoes.textContent = String(sessoes.length);

  if (sessoes.length === 0) {
    proximasListEl.innerHTML = `
      <div class="lista-vazia">
        Nenhuma sessão agendada ainda.
        <a class="btn-link" href="../solicitacoes/index.html">Ver solicitações</a>
      </div>
    `;
    return;
  }

  proximasListEl.innerHTML = sessoes
    .map(
      (s) => `
        <article class="card item-card">
          <div class="item-card-head">
            <div class="item-card-title">
              <span class="item-avatar" aria-hidden="true">${iniciais(s.startup)}</span>
              <div>
                <h3>${s.startup}</h3>
                <p>${s.tema}</p>
              </div>
            </div>
            <span class="badge-eyebrow badge-eyebrow--green">Confirmada</span>
          </div>
          <div class="item-details">
            <div><span class="item-detail-label">Data</span><span class="item-detail-value">${s.data}</span></div>
            <div><span class="item-detail-label">Horário</span><span class="item-detail-value">${s.horario}</span></div>
            <div><span class="item-detail-label">Formato</span><span class="item-detail-value">${s.formato}</span></div>
          </div>
          <div class="item-actions">
            <a class="btn btn-outline" href="../mensagens/index.html?simulado=${s.id}">Conversar com a startup</a>
          </div>
        </article>
      `,
    )
    .join('');
}

/** Texto de disponibilidade enviado ao backend, ex.: "Segunda a sexta, 14:00 às 18:00". */
function textoDisponibilidade(): string {
  return `${diasSelecionados.textContent?.trim() ?? ''}, ${horarioInicio.value} às ${horarioFim.value}`;
}

/* =========================================================
   NOMES DOS DIAS
   ========================================================= */

const diasNomes: Record<string, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

/* =========================================================
   ATUALIZA OS DIAS E HORÁRIOS NO CARD
   ========================================================= */

function atualizarResumoDisponibilidade(): void {
  const dias = Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'input[name="dia"]:checked',
    ),
  ).map(
    (input) => input.value,
  );

  /* ---------------------------------------------------------
     Dias
     --------------------------------------------------------- */

  if (dias.length === 0) {
    diasSelecionados.textContent =
      'Nenhum dia selecionado';

  } else if (
    dias.length === 5 &&
    !dias.includes('sabado') &&
    !dias.includes('domingo')
  ) {
    diasSelecionados.textContent =
      'Segunda a sexta';

  } else {
    diasSelecionados.textContent =
      dias
        .map(
          (dia) => diasNomes[dia],
        )
        .join(', ');
  }

  /* ---------------------------------------------------------
     Horários
     --------------------------------------------------------- */

  if (
    horarioInicio.value &&
    horarioFim.value
  ) {
    horariosSelecionados.textContent =
      `${horarioInicio.value} às ${horarioFim.value}`;

    } else {
    horariosSelecionados.textContent =
      'Não informado';
  }

  resumoDisponibilidade.textContent =
    `${diasSelecionados.textContent?.trim()} · ${horariosSelecionados.textContent?.trim()}`;
}

/* =========================================================
   ATUALIZA DISPONIBILIDADE
   ========================================================= */

function atualizarStatusDisponibilidade(): void {
  if (disponibilidadeAtiva) {
    /* -------------------------------------------------------
       Status
       ------------------------------------------------------- */

    statusDot.classList.remove(
      'is-pending',
    );

    textoStatusDisponibilidade.textContent =
      'Disponibilidade ativa';

    disponibilidadeEl.textContent =
      'Você está disponível para realizar mentorias.';

    /* -------------------------------------------------------
       Botão
       ------------------------------------------------------- */

    btnAlternarDisponibilidade.textContent =
      'Disponível';

    btnAlternarDisponibilidade.classList.remove(
      'is-inactive',
    );

    btnAlternarDisponibilidade.setAttribute(
      'aria-pressed',
      'true',
    );

    /* -------------------------------------------------------
       Resumo
       ------------------------------------------------------- */

        resumoStatus.innerHTML =
      '<span class="badge-eyebrow badge-eyebrow--green">Disponível</span>';

  } else {
    /* -------------------------------------------------------
       Status
       ------------------------------------------------------- */

    statusDot.classList.add(
      'is-pending',
    );

    textoStatusDisponibilidade.textContent =
      'Disponibilidade não ativa';

    disponibilidadeEl.textContent =
      'Você não está disponível para realizar mentorias no momento.';

    /* -------------------------------------------------------
       Botão
       ------------------------------------------------------- */

    btnAlternarDisponibilidade.textContent =
      'Não disponível';

    btnAlternarDisponibilidade.classList.add(
      'is-inactive',
    );

    btnAlternarDisponibilidade.setAttribute(
      'aria-pressed',
      'false',
    );

    /* -------------------------------------------------------
       Resumo
       ------------------------------------------------------- */

        resumoStatus.innerHTML =
      '<span class="badge-eyebrow badge-eyebrow--gray">Indisponível</span>';
  }
}

/* =========================================================
   BOTÃO DISPONÍVEL / NÃO DISPONÍVEL
   ========================================================= */

btnAlternarDisponibilidade.addEventListener(
  'click',
  () => {
        disponibilidadeAtiva =
      !disponibilidadeAtiva;
    atualizarStatusDisponibilidade();
    gravarAgenda();
  },
);

/* =========================================================
   SALVAR DIAS E HORÁRIOS
   ========================================================= */

salvarDisponibilidade.addEventListener(
  'click',
  () => {
    /* Limpa erro anterior */

    erroDisponibilidade.textContent =
      '';

    /* -------------------------------------------------------
       Verifica os dias
       ------------------------------------------------------- */

    const dias = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[name="dia"]:checked',
      ),
    );

    if (dias.length === 0) {
      erroDisponibilidade.textContent =
        'Selecione pelo menos um dia da semana.';

      return;
    }

    /* -------------------------------------------------------
       Verifica horários
       ------------------------------------------------------- */

    if (
      !horarioInicio.value ||
      !horarioFim.value
    ) {
      erroDisponibilidade.textContent =
        'Informe o horário inicial e final.';

      return;
    }

    /* -------------------------------------------------------
       Verifica se horário final é maior
       ------------------------------------------------------- */

    if (
      horarioInicio.value >=
      horarioFim.value
    ) {
      erroDisponibilidade.textContent =
        'O horário final deve ser maior que o horário inicial.';

      return;
    }

    /* -------------------------------------------------------
       Atualiza a interface
       ------------------------------------------------------- */

        disponibilidadeAtiva = true;
    atualizarResumoDisponibilidade();
    atualizarStatusDisponibilidade();
    gravarAgenda();

    // leva a disponibilidade para o perfil (e para as startups em Mentorias)
    void api
      .patch('/mentors/me', { disponibilidade: textoDisponibilidade() })
      .catch(() => {
        erroDisponibilidade.textContent =
          'Disponibilidade salva aqui, mas não foi possível atualizar o seu perfil agora.';
      });

    /* -------------------------------------------------------
       Feedback visual
       ------------------------------------------------------- */

    const textoOriginal =
      salvarDisponibilidade.textContent;

    salvarDisponibilidade.textContent =
      'Disponibilidade salva';

    salvarDisponibilidade.disabled =
      true;

    setTimeout(
      () => {
        salvarDisponibilidade.textContent =
          textoOriginal;

        salvarDisponibilidade.disabled =
          false;
      },
      1200,
    );
  },
);

/* =========================================================
   CARREGAR DADOS DO MENTOR
   ========================================================= */

async function init(): Promise<void> {
  try {
    const mentor =
      await api.get<Mentor>(
        '/mentors/me',
      );

    /* -------------------------------------------------------
       Dados existentes do mentor
       ------------------------------------------------------- */

    if (mentor.disponibilidade) {
      disponibilidadeEl.textContent =
        'Você está disponível para realizar mentorias.';
    }

        /* -------------------------------------------------------
       Inicializa a interface
       ------------------------------------------------------- */
    aplicarAgendaSalva();
    atualizarResumoDisponibilidade();
    atualizarStatusDisponibilidade();

  } catch (error) {
    disponibilidadeEl.textContent =
      error instanceof ApiError
        ? error.message
        : 'Erro ao carregar agenda.';

        resumoDisponibilidade.textContent =
      '—';
    resumoStatus.textContent =
      '—';
  }
}

renderProximasSessoes();

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

init();