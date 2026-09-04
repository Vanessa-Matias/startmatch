// Tela: Interesses para Investidores
// ==================================
// O investidor seleciona segmentos e visualiza STARTUPS compatíveis.
// O layout segue o mesmo padrão visual da tela interesses-startup.

import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['investidor']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo,
);

const segmentosContainer = document.getElementById(
  'segmentos-container',
) as HTMLDivElement;

const selectedCount = document.getElementById(
  'selected-count',
) as HTMLElement;

// Campo de pesquisa por texto
const textoBusca = document.getElementById(
  'texto',
) as HTMLInputElement;

const startupsGrid = document.getElementById(
  'startups-grid',
) as HTMLDivElement;

const btnSalvar = document.getElementById(
  'btn-salvar-preferencias',
) as HTMLButtonElement;

const modal = document.getElementById(
  'modal-perfil',
) as HTMLDivElement;

const modalNome = document.getElementById(
  'modal-nome',
) as HTMLElement;

const modalEmpresa = document.getElementById(
  'modal-empresa',
) as HTMLElement;

const modalAportes = document.getElementById(
  'modal-aportes',
) as HTMLElement;

const btnFecharModal = document.getElementById(
  'btn-fechar-modal',
) as HTMLButtonElement;

const listaSegmentos = [
  'Fintech',
  'Healthtech',
  'Edtech',
  'Agtech',
  'SaaS B2B',
  'Martech',
  'Logtech',
  'Retailtech',
  'Greentech / Cleantech',
  'Cybersecurity',
  'Mobtech',
  'Economia Criativa',
];

interface StartupInteresse {
  id: string;
  nome: string;
  empresa: string;
  segmentos: string[];
}

let startupsData: StartupInteresse[] = [
  {
    id: 'card-1',
    nome: 'Startup #1',
    empresa: 'Sawa • Diverno Startups',
    segmentos: ['Fintech', 'Healthtech'],
  },

  {
    id: 'card-2',
    nome: 'Startup #2',
    empresa: 'Sawa • Diverno Startups',
    segmentos: ['Fintech', 'Edtech'],
  },

  {
    id: 'card-3',
    nome: 'Startup #3',
    empresa: 'Sawa • Diverno Startups',
    segmentos: ['Healthtech', 'Agtech'],
  },

  {
    id: 'card-4',
    nome: 'Startup #4',
    empresa: 'Venture Tech',
    segmentos: ['SaaS B2B', 'Cybersecurity'],
  },
];

let selecoes: string[] = [];

/**
 * Renderiza os segmentos de interesse.
 */
function renderizarSegmentos(): void {
  segmentosContainer.innerHTML = '';

  listaSegmentos.forEach((nome) => {
    const index = selecoes.indexOf(nome);
    const isSelected = index !== -1;

    const chip = document.createElement('label');

    chip.className = `segmento-chip ${
      isSelected ? 'selected' : ''
    }`;

    chip.innerHTML = `
      <input
        type="checkbox"
        ${isSelected ? 'checked' : ''}
      >

      <span>${nome}</span>

      <span class="priority-badge">
        ${isSelected ? index + 1 : ''}
      </span>
    `;

    const checkbox = chip.querySelector(
      'input[type="checkbox"]',
    );

    checkbox?.addEventListener(
      'change',
      () => toggleSegmento(nome),
    );

    segmentosContainer.appendChild(chip);
  });

  selectedCount.textContent = String(
    selecoes.length,
  );
}

/**
 * Adiciona ou remove um segmento da seleção.
 */
function toggleSegmento(nome: string): void {
  const index = selecoes.indexOf(nome);

  if (index === -1) {
    selecoes.push(nome);
  } else {
    selecoes.splice(index, 1);
  }

  renderizarSegmentos();

  // Atualiza os resultados imediatamente
  // quando o usuário seleciona/remove um segmento.
  renderizarStartups(
    obterStartupsFiltradas(),
  );
}

/**
 * Retorna as startups filtradas pelos segmentos
 * e também pelo campo de pesquisa.
 */
function obterStartupsFiltradas(): StartupInteresse[] {
  const texto = textoBusca.value
    .trim()
    .toLowerCase();

  return startupsData.filter((startup) => {
    /*
     * FILTRO 1 — SEGMENTOS
     *
     * Se nenhum segmento foi selecionado,
     * todas as startups podem aparecer.
     *
     * Se houver segmentos selecionados,
     * a startup precisa possuir pelo menos
     * um dos segmentos escolhidos.
     */
    const segmentoCompativel =
      selecoes.length === 0 ||
      startup.segmentos.some((segmento) =>
        selecoes.includes(segmento),
      );

    if (!segmentoCompativel) {
      return false;
    }

    /*
     * FILTRO 2 — PESQUISA POR TEXTO
     *
     * A pesquisa verifica:
     * - nome da startup;
     * - empresa;
     * - segmentos.
     */
    if (texto.length === 0) {
      return true;
    }

    const conteudoStartup = [
      startup.nome,
      startup.empresa,
      startup.segmentos.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return conteudoStartup.includes(texto);
  });
}

/**
 * Renderiza os cards das startups.
 */
function renderizarStartups(
  startups: StartupInteresse[],
): void {
  startupsGrid.innerHTML = '';

  if (startups.length === 0) {
    startupsGrid.innerHTML = `
      <div class="empty-state">
        Nenhuma startup encontrada para os filtros selecionados.
      </div>
    `;

    return;
  }

  startups.forEach((startup) => {
    const card = document.createElement('div');

    card.className = 'investor-card';
    card.id = startup.id;

    card.innerHTML = `
      <div class="investor-card-header">
        <div class="investor-info">
          <h3>${startup.nome}</h3>

          <p>${startup.empresa}</p>
        </div>
      </div>

      <div class="investor-card-body">
        <strong>Atua em:</strong>
        ${startup.segmentos.join(', ')}
      </div>

      <div class="investor-card-actions">

        <button
          class="btn-ver"
          type="button"
        >
          Ver Perfil
        </button>

        <button
          class="btn-aceitar"
          type="button"
        >
          Aceitar
        </button>

        <button
          class="btn-recusar"
          type="button"
        >
          Recusar
        </button>

      </div>
    `;

    card
      .querySelector('.btn-ver')
      ?.addEventListener(
        'click',
        () => verPerfil(startup),
      );

    card
      .querySelector('.btn-aceitar')
      ?.addEventListener(
        'click',
        () => aceitarPerfil(startup.id),
      );

    card
      .querySelector('.btn-recusar')
      ?.addEventListener(
        'click',
        () => recusarPerfil(startup.id),
      );

    startupsGrid.appendChild(card);
  });
}

/**
 * Salva/atualiza os filtros e renderiza os resultados.
 */
function salvarEFiltrar(): void {
  renderizarStartups(
    obterStartupsFiltradas(),
  );
}

/**
 * Abre o modal com os dados da startup.
 */
function verPerfil(
  startup: StartupInteresse,
): void {
  modalNome.textContent = startup.nome;

  modalEmpresa.textContent =
    startup.empresa;

  modalAportes.textContent =
    startup.segmentos.join(', ');

  modal.classList.add('active');
}

/**
 * Fecha o modal.
 */
function fecharModal(): void {
  modal.classList.remove('active');
}

/**
 * Recusa uma startup.
 */
function recusarPerfil(
  startupId: string,
): void {
  const card =
    document.getElementById(startupId);

  if (!card) {
    return;
  }

  card.classList.add('fade-out');

  setTimeout(() => {
    startupsData =
      startupsData.filter(
        (startup) =>
          startup.id !== startupId,
      );

    salvarEFiltrar();
  }, 300);
}

/**
 * Aceita uma startup.
 */
function aceitarPerfil(
  startupId: string,
): void {
  const card =
    document.getElementById(startupId);

  if (!card) {
    return;
  }

  const actions =
    card.querySelector(
      '.investor-card-actions',
    );

  if (!actions) {
    return;
  }

  actions.innerHTML = `
    <span
      style="
        color: #15803d;
        font-weight: 600;
        font-size: 0.85rem;
      "
    >
      Match Aceito!
    </span>
  `;

  setTimeout(() => {
    card.classList.add('fade-out');

    setTimeout(() => {
      startupsData =
        startupsData.filter(
          (startup) =>
            startup.id !== startupId,
        );

      salvarEFiltrar();
    }, 300);
  }, 1000);
}

/**
 * Botão "Salvar Preferências".
 */
btnSalvar.addEventListener(
  'click',
  salvarEFiltrar,
);

/**
 * Pesquisa por texto.
 *
 * Atualiza os cards enquanto o usuário digita,
 * sem precisar clicar em outro botão.
 */
textoBusca.addEventListener(
  'input',
  () => {
    renderizarStartups(
      obterStartupsFiltradas(),
    );
  },
);

/**
 * Fecha o modal pelo botão X.
 */
btnFecharModal.addEventListener(
  'click',
  fecharModal,
);

/**
 * Fecha o modal clicando fora do conteúdo.
 */
modal.addEventListener(
  'click',
  (event) => {
    if (event.target === modal) {
      fecharModal();
    }
  },
);

/**
 * Inicialização da tela.
 */
renderizarSegmentos();

renderizarStartups(
  startupsData,
);