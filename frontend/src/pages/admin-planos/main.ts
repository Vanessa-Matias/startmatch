// Tela: Gestão de planos — lógica
// =================================
//
// Mantém os cards de cada plano e permite clicar neles
// para visualizar e pesquisar os usuários daquele plano.
//
// A pesquisa é feita EXCLUSIVAMENTE pelo nome.
//
// Startups  -> GET /startups
// Investidores -> GET /investors
// Mentores -> GET /mentors

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

import type {
  Startup,
  Investidor,
  Mentor,
  PaginatedResponse,
} from '../../scripts/types';


// ============================================================
// AUTENTICAÇÃO
// ============================================================

const usuario = requireAuth(['admin']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);


// ============================================================
// ELEMENTOS — STARTUPS
// ============================================================

const startupsEl =
  document.getElementById('startups-planos') as HTMLDivElement;

const startupsFiltro =
  document.getElementById('startups-filtro') as HTMLDivElement;

const startupsFiltroTitulo =
  document.getElementById('startups-filtro-titulo') as HTMLHeadingElement;

const startupsPesquisa =
  document.getElementById('startups-pesquisa') as HTMLInputElement;

const startupsLista =
  document.getElementById('startups-lista') as HTMLDivElement;


// ============================================================
// ELEMENTOS — INVESTIDORES
// ============================================================

const investidoresEl =
  document.getElementById('investidores-planos') as HTMLDivElement;

const investidoresFiltro =
  document.getElementById('investidores-filtro') as HTMLDivElement;

const investidoresFiltroTitulo =
  document.getElementById(
    'investidores-filtro-titulo',
  ) as HTMLHeadingElement;

const investidoresPesquisa =
  document.getElementById(
    'investidores-pesquisa',
  ) as HTMLInputElement;

const investidoresLista =
  document.getElementById(
    'investidores-lista',
  ) as HTMLDivElement;


// ============================================================
// ELEMENTOS — MENTORES
// ============================================================

const mentoresEl =
  document.getElementById('mentores-planos') as HTMLDivElement;

const mentoresFiltro =
  document.getElementById('mentores-filtro') as HTMLDivElement;

const mentoresFiltroTitulo =
  document.getElementById(
    'mentores-filtro-titulo',
  ) as HTMLHeadingElement;

const mentoresPesquisa =
  document.getElementById(
    'mentores-pesquisa',
  ) as HTMLInputElement;

const mentoresLista =
  document.getElementById(
    'mentores-lista',
  ) as HTMLDivElement;


// ============================================================
// DADOS CARREGADOS
// ============================================================

let startups: Startup[] = [];

let investidores: Investidor[] = [];

let mentores: Mentor[] = [];


// ============================================================
// PLANOS
// ============================================================

const planos = [
  'basico',
  'plus',
  'premium',
];


// ============================================================
// PLANO SELECIONADO
// ============================================================

let startupPlanoSelecionado: string | null = null;

let investidorPlanoSelecionado: string | null = null;

let mentorPlanoSelecionado: string | null = null;


// ============================================================
// FORMATAÇÃO DO NOME DO PLANO
// ============================================================

function nomePlano(plano: string): string {

  return (
    plano.charAt(0).toUpperCase() +
    plano.slice(1)
  );

}


// ============================================================
// NORMALIZA TEXTO PARA PESQUISA
// ============================================================

function normalizarTexto(valor: unknown): string {

  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

}


// ============================================================
// CARDS DOS PLANOS
// ============================================================

function renderCardsPlanos(
  container: HTMLDivElement,
  contagens: Record<string, number>,
  tipo: 'startup' | 'investidor' | 'mentor',
): void {

  container.innerHTML = planos
    .map((plano) => {

      let selecionado = false;

      if (tipo === 'startup') {
        selecionado =
          startupPlanoSelecionado === plano;
      }

      if (tipo === 'investidor') {
        selecionado =
          investidorPlanoSelecionado === plano;
      }

      if (tipo === 'mentor') {
        selecionado =
          mentorPlanoSelecionado === plano;
      }

      const total =
        contagens[plano] ?? 0;

      return `
        <div
          class="plan-card ${selecionado ? 'active' : ''}"
          data-plano="${plano}"
          data-tipo="${tipo}"
          tabindex="0"
          role="button"
          aria-label="Filtrar ${tipo}s do plano ${nomePlano(plano)}"
        >

          <div class="plan-card-number">
            ${total}
          </div>

          <div class="plan-card-name">
            Plano ${nomePlano(plano)}
          </div>

          <div class="plan-card-hint">
            Clique para visualizar
          </div>

        </div>
      `;

    })
    .join('');


  // ==========================================================
  // EVENTOS DOS CARDS
  // ==========================================================

  container
    .querySelectorAll<HTMLElement>('.plan-card')
    .forEach((card) => {

      card.addEventListener('click', () => {

        const plano =
          card.dataset.plano;

        if (!plano) {
          return;
        }


        // ------------------------------------------------------
        // STARTUP
        // ------------------------------------------------------

        if (tipo === 'startup') {

          startupPlanoSelecionado =
            startupPlanoSelecionado === plano
              ? null
              : plano;

          startupsPesquisa.value = '';

          renderCardsPlanos(
            startupsEl,
            contarPlanosStartups(),
            'startup',
          );

          renderFiltroStartups();
        }


        // ------------------------------------------------------
        // INVESTIDOR
        // ------------------------------------------------------

        if (tipo === 'investidor') {

          investidorPlanoSelecionado =
            investidorPlanoSelecionado === plano
              ? null
              : plano;

          investidoresPesquisa.value = '';

          renderCardsPlanos(
            investidoresEl,
            contarPlanosInvestidores(),
            'investidor',
          );

          renderFiltroInvestidores();
        }


        // ------------------------------------------------------
        // MENTOR
        // ------------------------------------------------------

        if (tipo === 'mentor') {

          mentorPlanoSelecionado =
            mentorPlanoSelecionado === plano
              ? null
              : plano;

          mentoresPesquisa.value = '';

          renderCardsPlanos(
            mentoresEl,
            contarPlanosMentores(),
            'mentor',
          );

          renderFiltroMentores();
        }

      });


      // --------------------------------------------------------
      // ACESSIBILIDADE — ENTER / ESPAÇO
      // --------------------------------------------------------

      card.addEventListener('keydown', (event) => {

        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {

          event.preventDefault();

          card.click();
        }

      });

    });

}


// ============================================================
// CONTAGEM DE STARTUPS POR PLANO
// ============================================================

function contarPlanosStartups(): Record<string, number> {

  const resultado: Record<string, number> = {
    basico: 0,
    plus: 0,
    premium: 0,
  };

  startups.forEach((startup) => {

    const plano =
      startup.planoAssinatura;

    if (
      plano &&
      plano in resultado
    ) {

      resultado[plano]++;
    }

  });

  return resultado;
}


// ============================================================
// CONTAGEM DE INVESTIDORES POR PLANO
// ============================================================

function contarPlanosInvestidores(): Record<string, number> {

  const resultado: Record<string, number> = {
    basico: 0,
    plus: 0,
    premium: 0,
  };

  investidores.forEach((investidor) => {

    const plano =
      investidor.planoAssinatura;

    if (
      plano &&
      plano in resultado
    ) {

      resultado[plano]++;
    }

  });

  return resultado;
}


// ============================================================
// CONTAGEM DE MENTORES POR PLANO
// ============================================================

function contarPlanosMentores(): Record<string, number> {

  const resultado: Record<string, number> = {
    basico: 0,
    plus: 0,
    premium: 0,
  };

  mentores.forEach((mentor) => {

    const plano =
      mentor.planoAssinatura;

    if (
      plano &&
      plano in resultado
    ) {

      resultado[plano]++;
    }

  });

  return resultado;
}


// ============================================================
// CARD DE STARTUP
// ============================================================

function renderStartup(
  startup: Startup,
): string {

  return `
    <div class="user-card">

      <h4 class="user-card-name">
        ${startup.nomeFantasia}
      </h4>

      <p class="user-card-info">
        ${startup.cidade ?? ''}
        ${startup.uf ? ` - ${startup.uf}` : ''}
      </p>

      <p class="user-card-info">
        ${startup.descricao ?? 'Sem descrição cadastrada.'}
      </p>

      <span class="user-card-plan">
        Plano ${nomePlano(startup.planoAssinatura)}
      </span>

    </div>
  `;
}


// ============================================================
// CARD DE INVESTIDOR
// ============================================================

function renderInvestidor(
  investidor: Investidor,
): string {

  /*
   * O nome é priorizado.
   * Caso sua API utilize outro campo de nome,
   * podemos ajustar somente esta parte.
   */

  const nome =
    (investidor as any).nome ??
    (investidor as any).nomeCompleto ??
    `Investidor #${investidor.id}`;

  return `
    <div class="user-card">

      <h4 class="user-card-name">
        ${nome}
      </h4>

      <p class="user-card-info">
        ${investidor.cidade ?? ''}
        ${investidor.uf ? ` - ${investidor.uf}` : ''}
      </p>

      <p class="user-card-info">
        Tipo: ${investidor.tipo ?? 'Não informado'}
      </p>

      <span class="user-card-plan">
        Plano ${nomePlano(investidor.planoAssinatura)}
      </span>

    </div>
  `;
}


// ============================================================
// CARD DE MENTOR
// ============================================================

function renderMentor(
  mentor: Mentor,
): string {

  const nome =
    (mentor as any).nome ??
    (mentor as any).nomeCompleto ??
    `Mentor #${mentor.id}`;

  return `
    <div class="user-card">

      <h4 class="user-card-name">
        ${nome}
      </h4>

      <p class="user-card-info">
        ${mentor.areaAtuacao ?? 'Área de atuação não informada.'}
      </p>

      <p class="user-card-info">
        ${mentor.bio ?? 'Sem descrição cadastrada.'}
      </p>

      <span class="user-card-plan">
        Plano ${nomePlano(mentor.planoAssinatura)}
      </span>

    </div>
  `;
}


// ============================================================
// FILTRO DE STARTUPS
// ============================================================

function renderFiltroStartups(): void {

  if (!startupPlanoSelecionado) {

    startupsFiltro.classList.remove(
      'visible',
    );

    return;
  }


  startupsFiltro.classList.add(
    'visible',
  );

  startupsFiltroTitulo.textContent =
    `Startups — Plano ${nomePlano(
      startupPlanoSelecionado,
    )}`;


  const pesquisa =
    normalizarTexto(
      startupsPesquisa.value,
    );


  const filtradas =
    startups.filter((startup) => {

      const mesmoPlano =
        startup.planoAssinatura ===
        startupPlanoSelecionado;

      /*
       * PESQUISA SOMENTE PELO NOME.
       */
      const nome =
        normalizarTexto(
          startup.nomeFantasia,
        );

      return (
        mesmoPlano &&
        nome.includes(pesquisa)
      );

    });


  if (filtradas.length === 0) {

    startupsLista.innerHTML = `
      <p class="empty-message">
        Nenhuma startup encontrada para este plano.
      </p>
    `;

    return;
  }


  startupsLista.innerHTML =
    filtradas
      .map(renderStartup)
      .join('');
}


// ============================================================
// FILTRO DE INVESTIDORES
// ============================================================

function renderFiltroInvestidores(): void {

  if (!investidorPlanoSelecionado) {

    investidoresFiltro.classList.remove(
      'visible',
    );

    return;
  }


  investidoresFiltro.classList.add(
    'visible',
  );

  investidoresFiltroTitulo.textContent =
    `Investidores — Plano ${nomePlano(
      investidorPlanoSelecionado,
    )}`;


  const pesquisa =
    normalizarTexto(
      investidoresPesquisa.value,
    );


  const filtrados =
    investidores.filter((investidor) => {

      const mesmoPlano =
        investidor.planoAssinatura ===
        investidorPlanoSelecionado;


      /*
       * PESQUISA SOMENTE PELO NOME.
       */

      const nome =
        normalizarTexto(
          (investidor as any).nome ??
          (investidor as any).nomeCompleto ??
          '',
        );


      return (
        mesmoPlano &&
        nome.includes(pesquisa)
      );

    });


  if (filtrados.length === 0) {

    investidoresLista.innerHTML = `
      <p class="empty-message">
        Nenhum investidor encontrado para este plano.
      </p>
    `;

    return;
  }


  investidoresLista.innerHTML =
    filtrados
      .map(renderInvestidor)
      .join('');
}


// ============================================================
// FILTRO DE MENTORES
// ============================================================

function renderFiltroMentores(): void {

  if (!mentorPlanoSelecionado) {

    mentoresFiltro.classList.remove(
      'visible',
    );

    return;
  }


  mentoresFiltro.classList.add(
    'visible',
  );

  mentoresFiltroTitulo.textContent =
    `Mentores — Plano ${nomePlano(
      mentorPlanoSelecionado,
    )}`;


  const pesquisa =
    normalizarTexto(
      mentoresPesquisa.value,
    );


  const filtrados =
    mentores.filter((mentor) => {

      const mesmoPlano =
        mentor.planoAssinatura ===
        mentorPlanoSelecionado;


      /*
       * PESQUISA SOMENTE PELO NOME.
       */

      const nome =
        normalizarTexto(
          (mentor as any).nome ??
          (mentor as any).nomeCompleto ??
          '',
        );


      return (
        mesmoPlano &&
        nome.includes(pesquisa)
      );

    });


  if (filtrados.length === 0) {

    mentoresLista.innerHTML = `
      <p class="empty-message">
        Nenhum mentor encontrado para este plano.
      </p>
    `;

    return;
  }


  mentoresLista.innerHTML =
    filtrados
      .map(renderMentor)
      .join('');
}


// ============================================================
// PESQUISA EM TEMPO REAL
// ============================================================

startupsPesquisa.addEventListener(
  'input',
  renderFiltroStartups,
);

investidoresPesquisa.addEventListener(
  'input',
  renderFiltroInvestidores,
);

mentoresPesquisa.addEventListener(
  'input',
  renderFiltroMentores,
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function init(): Promise<void> {

  const [
    startupsResponse,
    investidoresResponse,
    mentoresResponse,
  ] = await Promise.all([

    api.get<PaginatedResponse<Startup>>(
      '/startups',
    ),

    api.get<PaginatedResponse<Investidor>>(
      '/investors',
    ),

    api.get<Mentor[]>(
      '/mentors',
    ),

  ]);


  startups =
    startupsResponse.items ?? [];

  investidores =
    investidoresResponse.items ?? [];

  mentores =
    mentoresResponse ?? [];


  // ==========================================================
  // RENDERIZA OS CARDS
  // ==========================================================

  renderCardsPlanos(
    startupsEl,
    contarPlanosStartups(),
    'startup',
  );

  renderCardsPlanos(
    investidoresEl,
    contarPlanosInvestidores(),
    'investidor',
  );

  renderCardsPlanos(
    mentoresEl,
    contarPlanosMentores(),
    'mentor',
  );

}


// ============================================================
// TRATAMENTO DE ERRO
// ============================================================

init().catch((error) => {

  const mensagem =
    error instanceof ApiError
      ? error.message
      : 'Erro ao carregar os dados dos planos.';


  startupsEl.innerHTML =
    `<p class="form-error">${mensagem}</p>`;

  investidoresEl.innerHTML = '';

  mentoresEl.innerHTML = '';

});