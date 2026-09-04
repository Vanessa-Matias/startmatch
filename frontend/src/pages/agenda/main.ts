import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
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

    resumoDisponibilidade.textContent =
      'Ativa';

    resumoStatus.textContent =
      'Disponível';

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

    resumoDisponibilidade.textContent =
      'Inativa';

    resumoStatus.textContent =
      'Indisponível';
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

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

init();