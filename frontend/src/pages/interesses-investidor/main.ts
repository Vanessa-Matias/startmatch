// Tela: Interesses para Investidores
// ==================================
// Mostra as STARTUPS que demonstraram interesse no perfil do investidor
// (GET /interests/received). "Aceitar" devolve o interesse (POST /interests):
// como o interesse passa a ser mútuo, a API cria o match e a tela mostra o
// "É um match!". Os segmentos servem de filtro sobre a lista.
// O layout segue o mesmo padrão visual da tela interesses-startup.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { abrirModalMatch, iniciais } from '../../scripts/matchModal';
import { escapeHtml } from '../../scripts/investidor';
import type { Interesse, Match, Startup } from '../../scripts/types';

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

const ESTAGIO_LABEL: Record<string, string> = {
  ideacao: 'Ideação',
  mvp: 'MVP',
  operacao: 'Operação',
  scale_up: 'Scale-up',
};

interface StartupInteresse {
  id: string;
  startupId: number;
  nome: string;
  empresa: string;
  segmentos: string[];
  /** true quando já existe match com esta startup. */
  jaMatch: boolean;
}

let startupsData: StartupInteresse[] = [];
let carregando = true;
let erroCarga = '';

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

  if (carregando) {
    startupsGrid.innerHTML = `
      <div class="empty-state">Carregando interesses…</div>
    `;
    return;
  }

  if (erroCarga) {
    startupsGrid.innerHTML = `
      <div class="empty-state">${escapeHtml(erroCarga)}</div>
    `;
    return;
  }

  if (startups.length === 0) {
    startupsGrid.innerHTML = `
      <div class="empty-state">
        ${
          startupsData.length === 0
            ? 'Nenhuma startup demonstrou interesse em você ainda.'
            : 'Nenhuma startup encontrada para os filtros selecionados.'
        }
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
          <h3>${escapeHtml(startup.nome)}</h3>

          <p>${escapeHtml(startup.empresa)}</p>
        </div>
      </div>

      <div class="investor-card-body">
        <strong>Atua em:</strong>
        ${escapeHtml(startup.segmentos.join(', '))}
      </div>

      <div class="investor-card-actions">
        ${
          startup.jaMatch
            ? `<span style="color:#15803d;font-weight:600;font-size:0.85rem">Match aceito!</span>
               <a class="btn-ver" href="../matches/index.html" style="text-decoration:none">Ver matches</a>`
            : `<button class="btn-ver" type="button">Ver Perfil</button>
               <button class="btn-aceitar" type="button">Aceitar</button>
               <button class="btn-recusar" type="button">Recusar</button>`
        }
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
        () => void aceitarPerfil(startup),
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
 * Aceita uma startup: devolve o interesse. Como a startup já tinha
 * demonstrado interesse, a API cria o match e mostramos o "É um match!".
 */
async function aceitarPerfil(
  startup: StartupInteresse,
): Promise<void> {
  const card = document.getElementById(startup.id);
  const actions = card?.querySelector('.investor-card-actions');

  if (!card || !actions) {
    return;
  }

  actions.querySelectorAll('button').forEach((botao) => {
    (botao as HTMLButtonElement).disabled = true;
  });

  try {
    try {
      await api.post('/interests', {
        contraparteId: startup.startupId,
      });
    } catch (error) {
      // 409 = interesse já registrado antes; segue para checar o match.
      if (!(error instanceof ApiError && error.status === 409)) {
        throw error;
      }
    }

    const matches = await api.get<Match[]>('/matches');
    const match = matches.find(
      (m) => m.startupId === startup.startupId,
    );

    startup.jaMatch = Boolean(match);
    salvarEFiltrar();

    if (match) {
      abrirModalMatch({
        iniciaisVoce: iniciais(usuario.nome),
        iniciaisOutro: iniciais(startup.nome),
        nomeOutro: startup.nome,
        score: match.scoreCompatibilidade,
        hrefMatches: '../matches/index.html',
      });
    }
  } catch (error) {
    actions.querySelectorAll('button').forEach((botao) => {
      (botao as HTMLButtonElement).disabled = false;
    });
    alert(
      error instanceof ApiError
        ? error.message
        : 'Não foi possível aceitar agora. Tente novamente.',
    );
  }
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
 * Carrega os interesses recebidos e os detalhes de cada startup.
 */
async function carregarInteresses(): Promise<void> {
  try {
    const [recebidos, matches] = await Promise.all([
      api.get<Interesse[]>('/interests/received'),
      api.get<Match[]>('/matches'),
    ]);

    const comMatch = new Set(matches.map((m) => m.startupId));

    const startups = await Promise.all(
      recebidos.map((interesse) =>
        api
          .get<Startup>(`/startups/${interesse.startupId}`)
          .catch(() => null),
      ),
    );

    startupsData = startups
      .filter((st): st is Startup => st !== null)
      .map((st) => ({
        id: `startup-${st.id}`,
        startupId: st.id,
        nome: st.nomeFantasia,
        empresa: `${ESTAGIO_LABEL[st.estagio] ?? st.estagio} · ${st.cidade}/${st.uf}`,
        segmentos: (st.segmentos ?? []).map((seg) => seg.nome),
        jaMatch: comMatch.has(st.id),
      }));
  } catch (error) {
    erroCarga =
      error instanceof ApiError
        ? error.message
        : 'Erro ao carregar os interesses.';
  } finally {
    carregando = false;
    salvarEFiltrar();
  }
}

/**
 * Inicialização da tela.
 */
renderizarSegmentos();

renderizarStartups(
  startupsData,
);

void carregarInteresses();