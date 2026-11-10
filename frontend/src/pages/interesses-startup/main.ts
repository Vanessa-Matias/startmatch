// Tela: Interesses para Startups
// ==============================
// Mostra os INVESTIDORES que demonstraram interesse na investidor
// (GET /interests/received). "Aceitar" devolve o interesse (POST /interests):
// como o interesse passa a ser mútuo, a API cria o match e a tela mostra o
// "É um match!". Os segmentos servem de filtro sobre a lista.
// É o espelho da tela interesses-investidor.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { abrirModalMatch, iniciais } from '../../scripts/matchModal';
import { escapeHtml, TIPO_INVESTIDOR_LABEL } from '../../scripts/investidor';
import type { Interesse, Match, Investidor } from '../../scripts/types';

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

const investidoresGrid = document.getElementById(
  'investidores-grid',
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

interface InvestidorInteresse {
  id: string;
  investidorId: number;
  nome: string;
  empresa: string;
  segmentos: string[];
  /** true quando já existe match com este investidor. */
  jaMatch: boolean;
}

let investidoresData: InvestidorInteresse[] = [];
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
  renderizarInvestidores(
    obterInvestidoresFiltrados(),
  );
}

/**
 * Retorna os investidores filtrados pelos segmentos
 * e também pelo campo de pesquisa.
 */
function obterInvestidoresFiltrados(): InvestidorInteresse[] {
  const texto = textoBusca.value
    .trim()
    .toLowerCase();

  return investidoresData.filter((investidor) => {
    /*
     * FILTRO 1 — SEGMENTOS
     *
     * Se nenhum segmento foi selecionado,
     * todos os investidores podem aparecer.
     *
     * Se houver segmentos selecionados,
     * o investidor precisa possuir pelo menos
     * um dos segmentos escolhidos.
     */
    const segmentoCompativel =
      selecoes.length === 0 ||
      investidor.segmentos.some((segmento) =>
        selecoes.includes(segmento),
      );

    if (!segmentoCompativel) {
      return false;
    }

    /*
     * FILTRO 2 — PESQUISA POR TEXTO
     *
     * A pesquisa verifica:
     * - nome da investidor;
     * - empresa;
     * - segmentos.
     */
    if (texto.length === 0) {
      return true;
    }

    const conteudoInvestidor = [
      investidor.nome,
      investidor.empresa,
      investidor.segmentos.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return conteudoInvestidor.includes(texto);
  });
}

/**
 * Renderiza os cards dos investidores.
 */
function renderizarInvestidores(
  investidores: InvestidorInteresse[],
): void {
  investidoresGrid.innerHTML = '';

  if (carregando) {
    investidoresGrid.innerHTML = `
      <div class="empty-state">Carregando interesses…</div>
    `;
    return;
  }

  if (erroCarga) {
    investidoresGrid.innerHTML = `
      <div class="empty-state">${escapeHtml(erroCarga)}</div>
    `;
    return;
  }

  if (investidores.length === 0) {
    investidoresGrid.innerHTML = `
      <div class="empty-state">
        ${
          investidoresData.length === 0
            ? 'Nenhuma investidor demonstrou interesse em você ainda.'
            : 'Nenhuma investidor encontrada para os filtros selecionados.'
        }
      </div>
    `;

    return;
  }

  investidores.forEach((investidor) => {
    const card = document.createElement('div');

    card.className = 'investor-card';
    card.id = investidor.id;

    card.innerHTML = `
      <div class="investor-card-header">
        <div class="investor-info">
          <h3>${escapeHtml(investidor.nome)}</h3>

          <p>${escapeHtml(investidor.empresa)}</p>
        </div>
      </div>

      <div class="investor-card-body">
        <strong>Tese e segmentos:</strong>
        ${escapeHtml(investidor.segmentos.join(', '))}
      </div>

      <div class="investor-card-actions">
        ${
          investidor.jaMatch
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
        () => verPerfil(investidor),
      );

    card
      .querySelector('.btn-aceitar')
      ?.addEventListener(
        'click',
        () => void aceitarPerfil(investidor),
      );

    card
      .querySelector('.btn-recusar')
      ?.addEventListener(
        'click',
        () => recusarPerfil(investidor.id),
      );

    investidoresGrid.appendChild(card);
  });
}

/**
 * Salva/atualiza os filtros e renderiza os resultados.
 */
function salvarEFiltrar(): void {
  renderizarInvestidores(
    obterInvestidoresFiltrados(),
  );
}

/**
 * Abre o modal com os dados da investidor.
 */
function verPerfil(
  investidor: InvestidorInteresse,
): void {
  modalNome.textContent = investidor.nome;

  modalEmpresa.textContent =
    investidor.empresa;

  modalAportes.textContent =
    investidor.segmentos.join(', ');

  modal.classList.add('active');
}

/**
 * Fecha o modal.
 */
function fecharModal(): void {
  modal.classList.remove('active');
}

/**
 * Recusa um investidor.
 */
function recusarPerfil(
  investidorCardId: string,
): void {
  const card =
    document.getElementById(investidorCardId);

  if (!card) {
    return;
  }

  card.classList.add('fade-out');

  setTimeout(() => {
    investidoresData =
      investidoresData.filter(
        (investidor) =>
          investidor.id !== investidorCardId,
      );

    salvarEFiltrar();
  }, 300);
}

/**
 * Aceita uma investidor: devolve o interesse. Como a investidor já tinha
 * demonstrado interesse, a API cria o match e mostramos o "É um match!".
 */
async function aceitarPerfil(
  investidor: InvestidorInteresse,
): Promise<void> {
  const card = document.getElementById(investidor.id);
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
        contraparteId: investidor.investidorId,
      });
    } catch (error) {
      // 409 = interesse já registrado antes; segue para checar o match.
      if (!(error instanceof ApiError && error.status === 409)) {
        throw error;
      }
    }

    const matches = await api.get<Match[]>('/matches');
    const match = matches.find(
      (m) => m.investidorId === investidor.investidorId,
    );

    investidor.jaMatch = Boolean(match);
    salvarEFiltrar();

    if (match) {
      abrirModalMatch({
        iniciaisVoce: iniciais(usuario.nome),
        iniciaisOutro: iniciais(investidor.nome),
        nomeOutro: investidor.nome,
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
    renderizarInvestidores(
      obterInvestidoresFiltrados(),
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
 * Carrega os interesses recebidos e os detalhes de cada investidor.
 */
async function carregarInteresses(): Promise<void> {
  try {
    const [recebidos, matches] = await Promise.all([
      api.get<Interesse[]>('/interests/received'),
      api.get<Match[]>('/matches'),
    ]);

    const comMatch = new Set(matches.map((m) => m.investidorId));

    const investidores = await Promise.all(
      recebidos.map((interesse) =>
        api
          .get<Investidor>(`/investors/${interesse.investidorId}`)
          .catch(() => null),
      ),
    );

    investidoresData = investidores
      .filter((inv): inv is Investidor => inv !== null)
      .map((inv) => ({
        id: `investidor-${inv.id}`,
        investidorId: inv.id,
        nome: inv.nome ?? `Investidor #${inv.id}`,
        empresa: `${TIPO_INVESTIDOR_LABEL[inv.tipo] ?? inv.tipo} · ${inv.cidade}/${inv.uf}`,
        segmentos: (inv.segmentos ?? []).map((seg) => seg.nome),
        jaMatch: comMatch.has(inv.id),
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

renderizarInvestidores(
  investidoresData,
);

void carregarInteresses();