// Tela: Alertas de risco (Admin) — PROTÓTIPO VISUAL
// ====================================================
// Mockup da squad "Detecção de anomalias" (atividade de Metodologia Ágil e IAs).
// Tudo acontece no navegador: os alertas abaixo são exemplos fixos e NADA é lido
// ou gravado no banco de dados ou no back-end. As decisões (Confirmar / Falso
// positivo) ficam só na memória da página e, por conveniência, no
// localStorage deste navegador; o botão "Restaurar exemplo" limpa tudo.
// Todo texto entra na tela escapado (nada vira HTML).
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['admin']);

renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

type Severidade = 'alta' | 'media' | 'baixa';
type Decisao = 'confirmado' | 'falso_positivo';

interface Alerta {
  chave: string;
  titulo: string;
  severidade: Severidade;
  pontuacao: number;
  alvo: string;
  quando: string;
  descricao: string;
  evidencias: string[];
}

interface Revisao {
  decisao: Decisao;
  observacao: string;
}

// Exemplos fictícios, um por regra de detecção.
const ALERTAS: Alerta[] = [
  {
    chave: 'ex-1',
    titulo: 'Muitos interesses em pouco tempo',
    severidade: 'alta',
    pontuacao: 80,
    alvo: 'Investidor de exemplo (investidor)',
    quando: 'Hoje, 14:08',
    descricao:
      'O perfil demonstrou interesse em muitos outros perfis de uma só vez. Pode ser uso automatizado ou spam, mas também pode ser um usuário animado com o produto.',
    evidencias: [
      '9 interesses em 16 min.',
      'Limite de atenção: 8 interesses em 60 min.',
      'Conta criada há poucas horas (a pontuação sobe).',
    ],
  },
  {
    chave: 'ex-2',
    titulo: 'Vários cadastros do mesmo domínio',
    severidade: 'media',
    pontuacao: 60,
    alvo: '@empresaexemplo.com',
    quando: 'Hoje, 14:07',
    descricao:
      'Muitas contas foram criadas com e-mails do mesmo domínio em pouco tempo. Pode ser criação de contas falsas, ou uma empresa/turma cadastrando a equipe (falso positivo comum).',
    evidencias: [
      '6 cadastros em 5 min.',
      'Tipos de conta: startup, investidor.',
      'Limite de atenção: 5 cadastros em 60 min.',
    ],
  },
  {
    chave: 'ex-3',
    titulo: 'Várias senhas incorretas seguidas',
    severidade: 'media',
    pontuacao: 60,
    alvo: 'Startup de exemplo',
    quando: 'Hoje, 14:17',
    descricao:
      'Houve várias tentativas de login com senha incorreta na mesma conta. Pode ser tentativa automatizada de invasão ou apenas alguém que esqueceu a senha (falso positivo comum).',
    evidencias: [
      '6 tentativas falhas em 5 min.',
      'Limite de atenção: 5 falhas em 30 min.',
    ],
  },
  {
    chave: 'ex-4',
    titulo: 'E-mail descartável no cadastro',
    severidade: 'baixa',
    pontuacao: 30,
    alvo: 'Mentor de exemplo (mentor)',
    quando: 'Hoje, 13:55',
    descricao:
      'A conta usa um serviço de e-mail temporário. Isso dificulta contato e verificação, mas por si só não prova má-fé.',
    evidencias: ['Domínio do e-mail consta na lista de e-mails descartáveis.'],
  },
];

const STORAGE_KEY = 'sm_alertas_demo';

const listaEl = document.getElementById('lista-alertas') as HTMLElement;
const filtrosEl = document.getElementById('filtros') as HTMLElement;

type Filtro = 'pendentes' | 'todos' | 'confirmado' | 'falso_positivo';
let filtro: Filtro = 'pendentes';
let revisoes: Record<string, Revisao> = lerRevisoes();

function lerRevisoes(): Record<string, Revisao> {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? (JSON.parse(bruto) as Record<string, Revisao>) : {};
  } catch {
    return {};
  }
}

function salvarRevisoes(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(revisoes));
  } catch {
    // Sem localStorage (janela anônima, por exemplo): continua só na memória.
  }
}

function escapar(valor: string): string {
  return valor
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const ROTULO: Record<Severidade, string> = {
  alta: 'Severidade alta',
  media: 'Severidade média',
  baixa: 'Severidade baixa',
};

const CLASSE: Record<Severidade, string> = {
  alta: 'badge-danger-soft',
  media: 'badge-warning-soft',
  baixa: 'badge-plan badge-plan--blue',
};

function atualizarResumo(): void {
  const valores = Object.values(revisoes);
  const confirmados = valores.filter((r) => r.decisao === 'confirmado').length;
  const falsos = valores.filter((r) => r.decisao === 'falso_positivo').length;
  const set = (id: string, v: string): void => {
    (document.getElementById(id) as HTMLElement).textContent = v;
  };
  set('kpi-total', String(ALERTAS.length));
  set('kpi-pendentes', String(ALERTAS.length - confirmados - falsos));
  set('kpi-confirmados', String(confirmados));
  set('kpi-falsos', String(falsos));
  set(
    'kpi-precisao',
    confirmados + falsos === 0
      ? 'Sem revisões'
      : `${Math.round((confirmados / (confirmados + falsos)) * 100)}%`,
  );
}

function cardAlerta(a: Alerta): string {
  const rev = revisoes[a.chave];
  const revisado = rev
    ? `<p class="alerta-revisado alerta-revisado--${rev.decisao}">
         ${rev.decisao === 'confirmado' ? 'Confirmado pelo administrador' : 'Marcado como falso positivo'}${
           rev.observacao ? `: ${escapar(rev.observacao)}` : ''
         }
       </p>`
    : '';

  return `
    <article class="card alerta alerta--${a.severidade}">
      <div class="alerta-topo">
        <h3 class="alerta-titulo">${escapar(a.titulo)}</h3>
        <span class="badge ${CLASSE[a.severidade]}">${ROTULO[a.severidade]}</span>
        <span class="alerta-pontos">Pontuação ${a.pontuacao}/100</span>
      </div>
      <p><strong>${escapar(a.alvo)}</strong> · ${escapar(a.quando)}</p>
      <p class="text-muted">${escapar(a.descricao)}</p>
      <ul class="alerta-evidencias">
        ${a.evidencias.map((e) => `<li>${escapar(e)}</li>`).join('')}
      </ul>
      ${revisado}
      <div class="alerta-acoes">
        <input class="input" type="text" maxlength="300" placeholder="Observação (opcional)"
               data-obs="${a.chave}" aria-label="Observação sobre o alerta" />
        <button type="button" class="btn btn-primary" data-decisao="confirmado" data-chave="${a.chave}">Confirmar</button>
        <button type="button" class="btn btn-outline" data-decisao="falso_positivo" data-chave="${a.chave}">Falso positivo</button>
      </div>
    </article>`;
}

function renderizar(): void {
  atualizarResumo();
  const itens = ALERTAS.filter((a) => {
    if (filtro === 'todos') return true;
    if (filtro === 'pendentes') return !revisoes[a.chave];
    return revisoes[a.chave]?.decisao === filtro;
  });
  listaEl.innerHTML = itens.length
    ? itens.map(cardAlerta).join('')
    : `<p class="text-muted">${
        filtro === 'pendentes'
          ? 'Todos os alertas já foram revisados. Veja o filtro "Todos" ou clique em "Restaurar exemplo".'
          : 'Nenhum alerta neste filtro.'
      }</p>`;
}

listaEl.addEventListener('click', (event) => {
  const botao = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-decisao]');
  if (!botao) return;
  const chave = botao.dataset.chave ?? '';
  const campo = Array.from(listaEl.querySelectorAll<HTMLInputElement>('input[data-obs]')).find(
    (el) => el.dataset.obs === chave,
  );
  revisoes[chave] = {
    decisao: botao.dataset.decisao as Decisao,
    observacao: campo?.value.trim() ?? '',
  };
  salvarRevisoes();
  renderizar();
});

filtrosEl.addEventListener('click', (event) => {
  const botao = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!botao) return;
  if (botao.id === 'btn-restaurar') {
    revisoes = {};
    salvarRevisoes();
    renderizar();
    return;
  }
  const novo = botao.dataset.filtro as Filtro | undefined;
  if (!novo) return;
  filtro = novo;
  filtrosEl.querySelectorAll<HTMLButtonElement>('button[data-filtro]').forEach((b) => {
    b.classList.toggle('btn-primary', b.dataset.filtro === filtro);
    b.classList.toggle('btn-outline', b.dataset.filtro !== filtro);
  });
  renderizar();
});

renderizar();
