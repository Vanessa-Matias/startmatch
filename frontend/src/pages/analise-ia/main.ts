// Tela: Análise com IA (Investidor) — lógica
// ===========================================
//
// Fluxo da atividade de IA: Entrada -> Verificação -> IA -> Resultado -> Decisão
// humana. Nada é gravado no banco de dados.
//
// 1) Botão "Analisar com IA": envia o perfil do investidor logado e as startups
//    cadastradas para POST /ai/recomendar-startups. As regras são decididas por
//    código; a IA escreve a justificativa das melhores.
// 2) "Modo de teste": 4 cenários fixos (dados FICTÍCIOS) para POST
//    /ai/analise-compatibilidade — são os testes pedidos pelo professor.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { escapeHtml } from '../../scripts/investidor';
import { iconeSegmento } from '../../scripts/segmentIcons';
import type {
  EstagioStartup,
  Investidor,
  PaginatedResponse,
  Startup,
} from '../../scripts/types';

const usuario = requireAuth(['investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

// ---------- tipos ----------
type SituacaoCnpj = 'ativa' | 'baixada' | 'suspensa' | 'inapta' | 'nao_consultada';
type Decisao = 'sugerir_conversa' | 'nao_recomendar' | 'pendencia';

interface Regra {
  codigo: string;
  nome: string;
  eliminatoria: boolean;
  startup: string;
  investidor: string;
  resultado: 'atende' | 'nao_atende' | 'atencao' | 'pendente' | 'conflito';
  detalhe: string;
}

interface FichaInvestidor {
  nome: string | null;
  cidade: string | null;
  uf: string | null;
  segmentos: string[];
  estagiosAceitos: EstagioStartup[];
  faixaMin: number | null;
  faixaMax: number | null;
  exigeCnpjAtivo: boolean;
}

interface Destaque {
  startupId: number;
  nome: string;
  decisao: Decisao;
  decisaoLabel: string;
  score: number;
  regras: Regra[];
  pendencias: string[];
  evidencias: string[];
  justificativa: string;
  origemJustificativa: 'ia' | 'regras';
}

interface RespostaRecomendacao {
  analisadas: number;
  resumo: Record<Decisao, number>;
  destaques: Destaque[];
  modelo: string | null;
  aviso: string | null;
  limitacao: string;
}

// ---------- rótulos ----------
const ESTAGIOS: { valor: EstagioStartup; rotulo: string }[] = [
  { valor: 'ideacao', rotulo: 'Ideação' },
  { valor: 'mvp', rotulo: 'MVP' },
  { valor: 'operacao', rotulo: 'Operação' },
  { valor: 'scale_up', rotulo: 'Expansão (scale-up)' },
];
const rotuloEstagio = (e: EstagioStartup | null): string =>
  ESTAGIOS.find((x) => x.valor === e)?.rotulo ?? 'não informado';

const RESULTADO_LABEL: Record<Regra['resultado'], string> = {
  atende: 'Atende',
  nao_atende: 'Não atende',
  atencao: 'Atenção',
  pendente: 'Pendente',
  conflito: 'Conflito',
};

const NOTA_CONSULTA = `Consulta externa simulada: situação cadastral do CNPJ (Receita Federal), em ${new Date().toLocaleDateString('pt-BR')}. Nenhuma consulta real é feita.`;

const brl = (v: number | null): string =>
  v === null ? 'não informado' : `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    // 429 = limite de uso. Outros erros mostram o código para facilitar o diagnóstico
    // (ex.: 404 = o back-end usado ainda não tem esta rota).
    return erro.status === 429
      ? erro.message
      : `Não foi possível analisar agora (erro ${erro.status}: ${erro.message}).`;
  }
  console.error('Erro na análise com IA:', erro);
  const detalhe = erro instanceof Error ? `${erro.name}: ${erro.message}` : String(erro);
  return `Não foi possível analisar agora (${detalhe}).`;
}

// ---------- etapas visuais ----------
function etapas(ativa: string | null, feitas: string[]): void {
  document.querySelectorAll<HTMLElement>('#fluxo li').forEach((li) => {
    const id = li.dataset.etapa ?? '';
    li.classList.toggle('is-ativo', id === ativa);
    li.classList.toggle('is-feito', feitas.includes(id));
  });
}

function listaRegras(regras: Regra[]): string {
  return regras
    .map(
      (x) => `<li class="ia-regra">
        <div class="ia-regra-topo">
          <span><strong>${escapeHtml(x.codigo)}</strong> ${escapeHtml(x.nome)}${x.eliminatoria ? ' <span class="text-muted">(elimina)</span>' : ''}</span>
          <span class="ia-tag ia-tag--${x.resultado}">${RESULTADO_LABEL[x.resultado]}</span>
        </div>
        <div class="ia-regra-dados"><span>Startup: ${escapeHtml(x.startup)}</span><span>Investidor: ${escapeHtml(x.investidor)}</span></div>
        <div class="ia-regra-detalhe">${escapeHtml(x.detalhe)}</div>
      </li>`,
    )
    .join('');
}

function itens(lista: string[], vazio: string): string {
  return (lista.length ? lista : [vazio]).map((i) => `<li>${escapeHtml(i)}</li>`).join('');
}

// ======================================================================
// 1) BOTÃO "ANALISAR COM IA" (startups reais + meu perfil)
// ======================================================================
const btnAnalisar = $<HTMLButtonElement>('btn-analisar');
const statusEl = $<HTMLElement>('status');
const erroEl = $<HTMLElement>('erro-entrada');
const estagiosEl = $<HTMLElement>('estagios');
const exigeCnpjEl = $<HTMLInputElement>('exige-cnpj');
const recomendacoesEl = $<HTMLElement>('recomendacoes');

estagiosEl.innerHTML = ESTAGIOS.map(
  (e) =>
    `<label><input type="checkbox" value="${e.valor}" ${e.valor === 'ideacao' ? '' : 'checked'} /> ${escapeHtml(e.rotulo)}</label>`,
).join('');

function estagiosMarcados(): EstagioStartup[] {
  return Array.from(estagiosEl.querySelectorAll<HTMLInputElement>('input:checked')).map(
    (i) => i.value as EstagioStartup,
  );
}

function cardDestaque(d: Destaque, s: Startup | undefined): string {
  const nomesSeg = (s?.segmentos ?? []).map((x) => x.nome);
  const chips = [
    s ? rotuloEstagio(s.estagio) : '',
    s ? `${s.cidade}/${s.uf}` : '',
    s ? `Busca ${brl(Number(s.investimentoPretendido))}` : '',
    ...nomesSeg,
  ].filter(Boolean);
  return `
    <article class="card ia-rec">
      <div class="ia-rec-topo">
        <span class="ia-rec-ico">${iconeSegmento(nomesSeg)}</span>
        <div class="ia-rec-nome">
          <h3>${escapeHtml(d.nome)}</h3>
          <span class="ia-decisao ia-decisao--sm ia-decisao--${d.decisao}">${escapeHtml(d.decisaoLabel)}</span>
        </div>
        <div class="ia-score">${d.score}<small>de 100</small></div>
      </div>
      <ul class="ia-chips">${chips.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
      <p class="ia-rec-just">${escapeHtml(d.justificativa)}</p>
      <p class="ia-origem">${
        d.origemJustificativa === 'ia' ? 'Justificativa escrita por IA.' : 'Justificativa gerada pelas regras.'
      }</p>
      ${d.pendencias.length ? `<div><strong>Pendências</strong><ul class="ia-lista">${itens(d.pendencias, '')}</ul></div>` : ''}
      ${d.evidencias.length ? `<details><summary>Ver evidências</summary><ul class="ia-lista">${itens(d.evidencias, '')}</ul></details>` : ''}
      <details>
        <summary>Ver regras aplicadas</summary>
        <ul class="ia-regras">${listaRegras(d.regras)}</ul>
      </details>
      <div class="ia-humana">
        <button type="button" class="btn btn-accent" data-humana="conversar">Vou iniciar a conversa</button>
        <button type="button" class="btn btn-outline" data-humana="aguardar">Aguardar revisão</button>
        <button type="button" class="btn btn-outline" data-humana="descartar">Descartar</button>
      </div>
      <p class="text-muted ia-humana-msg" hidden></p>
      <div class="ia-rec-rodape">
        <span class="text-muted" style="font-size:0.82rem">A IA só recomenda: a decisão final é sua.</span>
        <a class="btn btn-outline" href="../perfil-startup/index.html?id=${d.startupId}">Ver perfil</a>
      </div>
    </article>`;
}

async function analisarComIa(): Promise<void> {
  erroEl.hidden = true;
  const aceitos = estagiosMarcados();
  if (aceitos.length === 0) {
    erroEl.textContent = 'Marque pelo menos um estágio em "Ajustar critérios da análise".';
    erroEl.hidden = false;
    return;
  }
  btnAnalisar.disabled = true;
  recomendacoesEl.hidden = true;
  statusEl.textContent = 'Lendo seu perfil e as startups…';
  etapas('entrada', []);

  try {
    const [pagina, perfil] = await Promise.all([
      api.get<PaginatedResponse<Startup>>('/startups?limit=50'),
      api.get<Investidor>('/investors/me'),
    ]);
    const startups = pagina.items;
    if (startups.length === 0) {
      statusEl.textContent = 'Ainda não há startups cadastradas para analisar.';
      etapas(null, []);
      return;
    }

    const investidor: FichaInvestidor = {
      nome: perfil.nome ?? null,
      cidade: perfil.cidade ?? null,
      uf: perfil.uf ?? null,
      segmentos: (perfil.segmentos ?? []).map((x) => x.nome),
      estagiosAceitos: aceitos,
      faixaMin: Number(perfil.investimentoMin),
      faixaMax: Number(perfil.investimentoMax),
      exigeCnpjAtivo: exigeCnpjEl.checked,
    };
    const corpo = {
      investidor,
      startups: startups.map((s) => ({
        id: s.id,
        nome: s.nomeFantasia,
        cidade: s.cidade ?? null,
        uf: s.uf ?? null,
        segmentos: (s.segmentos ?? []).map((x) => x.nome),
        estagio: s.estagio ?? null,
        valorPretendido: Number.isFinite(Number(s.investimentoPretendido))
          ? Number(s.investimentoPretendido)
          : null,
        cnpj: s.cnpj ?? null,
        // Consulta ao CNPJ SIMULADA: tem CNPJ cadastrado = situação Ativa.
        situacaoCnpj: (s.cnpj ? 'ativa' : 'nao_consultada') as SituacaoCnpj,
      })),
    };

    statusEl.textContent = 'Aplicando as regras e consultando a IA…';
    etapas('verificacao', ['entrada']);
    const pronto = api.post<RespostaRecomendacao>('/ai/recomendar-startups', corpo);
    window.setTimeout(() => etapas('ia', ['entrada', 'verificacao']), 350);
    const r = await pronto;

    etapas('resultado', ['entrada', 'verificacao', 'ia']);
    const porId = new Map(startups.map((s) => [s.id, s]));
    const { sugerir_conversa: ok, pendencia: pend, nao_recomendar: nao } = r.resumo;
    $<HTMLElement>('resumo').innerHTML =
      `Analisamos <strong>${r.analisadas}</strong> startup${r.analisadas === 1 ? '' : 's'}: ` +
      `<strong>${ok}</strong> com conversa sugerida, <strong>${pend}</strong> com pendência e ` +
      `<strong>${nao}</strong> não recomendada${nao === 1 ? '' : 's'}.`;
    $<HTMLElement>('cards').innerHTML = r.destaques.length
      ? r.destaques.map((d) => cardDestaque(d, porId.get(d.startupId))).join('')
      : '<p class="text-muted">Nenhuma startup combina com os seus critérios agora. Tente ajustar os critérios da análise.</p>';
    $<HTMLElement>('origem-rec').textContent = r.modelo
      ? `Justificativas escritas por IA (modelo ${r.modelo}). A decisão de cada startup foi calculada pelas regras.`
      : `Justificativas geradas pelas regras (modo sem IA).${r.aviso ? ' ' + r.aviso : ''}`;
    $<HTMLElement>('limitacao-rec').textContent = `${NOTA_CONSULTA} ${r.limitacao}`;
    recomendacoesEl.hidden = false;
    recomendacoesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    etapas(null, ['entrada', 'verificacao', 'ia', 'resultado']);
    statusEl.textContent = '';
  } catch (erro) {
    etapas(null, ['entrada']);
    statusEl.textContent = mensagemDeErro(erro);
  } finally {
    btnAnalisar.disabled = false;
  }
}

btnAnalisar.addEventListener('click', () => void analisarComIa());

// ======================================================================
// 2) MODO DE TESTE — escolha o cenário; a IA mostra as startups cadastradas
//    que se encaixam nele
// ======================================================================
const INFO_CENARIO: Record<string, { num: string; nome: string; texto: string }> = {
  t1: {
    num: 'Teste 1',
    nome: 'Startups compatíveis com você',
    texto:
      'Startups cadastradas que atendem ao seu perfil: segmento, estágio, valor pretendido e local. A decisão sai das regras (análise real, com os critérios ajustados acima). Resultado esperado: sugerir conversa.',
  },
  t2: {
    num: 'Teste 2',
    nome: 'Startups incompatíveis com você',
    texto:
      'Simulação: o seu perfil passa a aceitar apenas empresas em expansão (scale-up). Assim, o estágio das startups cadastradas que não estão em expansão as exclui. Resultado esperado: não recomendar.',
  },
  t3: {
    num: 'Teste 3',
    nome: 'Startups com dados contraditórios',
    texto:
      'Simulação: o documento (pitch) de algumas startups cadastradas passa a declarar um estágio diferente do que está na ficha. A IA não decide sozinha. Resultado esperado: pendência para revisão humana.',
  },
  t4: {
    num: 'Teste 4',
    nome: 'Startups com dados insuficientes',
    texto:
      'Simulação: o valor pretendido de algumas startups cadastradas é retirado da ficha, então não dá para comparar com a sua faixa. Resultado esperado: pendência, sem inventar o dado.',
  },
};

const TRECHO_DOC: Record<string, string> = {
  ideacao: 'Estamos na fase de ideação: ainda não temos clientes nem produto lançado.',
  mvp: 'Nosso MVP já está no ar e em testes com os primeiros clientes.',
  operacao: 'Já operamos com clientes pagantes e receita recorrente.',
  scale_up: 'Estamos em expansão, com operação consolidada e crescimento acelerado.',
};

const AMOSTRA_SIMULADA = 3; // quantas startups recebem a condição simulada (testes 3 e 4)

const modoEl = $<HTMLSelectElement>('modo');
const btnTeste = $<HTMLButtonElement>('btn-teste');
const statusTesteEl = $<HTMLElement>('status-teste');
const resultadoEl = $<HTMLElement>('resultado');

function mostrarInfoCenario(): void {
  const i = INFO_CENARIO[modoEl.value];
  $<HTMLElement>('cenario-info').innerHTML =
    `<span class="ia-cenario-num">${escapeHtml(i.num)}</span><strong>${escapeHtml(i.nome)}</strong>${escapeHtml(i.texto)}`;
  resultadoEl.hidden = true;
}

async function rodarTeste(): Promise<void> {
  erroEl.hidden = true;
  const aceitos = estagiosMarcados();
  if (aceitos.length === 0) {
    statusTesteEl.textContent = 'Marque pelo menos um estágio em "Ajustar critérios da análise" (no topo).';
    return;
  }
  btnTeste.disabled = true;
  resultadoEl.hidden = true;
  statusTesteEl.textContent = 'Lendo seu perfil e as startups…';
  try {
    const [pagina, perfil] = await Promise.all([
      api.get<PaginatedResponse<Startup>>('/startups?limit=50'),
      api.get<Investidor>('/investors/me'),
    ]);
    const todas = pagina.items;
    if (todas.length === 0) {
      statusTesteEl.textContent = 'Ainda não há startups cadastradas para analisar.';
      return;
    }
    const modo = modoEl.value;
    const simulado = modo === 't3' || modo === 't4';
    const soExpansao = modo === 't2';
    // Nos testes 3 e 4 a condição é simulada em poucas startups; nos 1 e 2 a análise é real.
    const base = simulado ? todas.slice(0, AMOSTRA_SIMULADA) : todas;

    const investidor: FichaInvestidor = {
      nome: perfil.nome ?? null,
      cidade: perfil.cidade ?? null,
      uf: perfil.uf ?? null,
      segmentos: (perfil.segmentos ?? []).map((x) => x.nome),
      estagiosAceitos: soExpansao ? (['scale_up'] as EstagioStartup[]) : aceitos,
      faixaMin: Number(perfil.investimentoMin),
      faixaMax: Number(perfil.investimentoMax),
      exigeCnpjAtivo: exigeCnpjEl.checked,
    };
    // No modo simulado, a ficha do investidor é ajustada para as startups
    // escolhidas serem compatíveis; assim o único problema é o dado simulado.
    if (simulado) {
      const nomes = new Set(investidor.segmentos);
      const estagios = new Set(investidor.estagiosAceitos);
      let min = investidor.faixaMin ?? 0;
      let max = investidor.faixaMax ?? 0;
      base.forEach((s) => {
        (s.segmentos ?? []).forEach((x) => nomes.add(x.nome));
        estagios.add(s.estagio as EstagioStartup);
        const v = Number(s.investimentoPretendido);
        if (Number.isFinite(v)) {
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
      });
      investidor.segmentos = Array.from(nomes);
      investidor.estagiosAceitos = Array.from(estagios);
      investidor.faixaMin = min;
      investidor.faixaMax = max;
    }

    const startups = base.map((s) => {
      const estagio = s.estagio as EstagioStartup;
      const valor = Number(s.investimentoPretendido);
      const outro: EstagioStartup = estagio === 'ideacao' ? 'operacao' : 'ideacao';
      return {
        id: s.id,
        nome: s.nomeFantasia,
        cidade: s.cidade ?? null,
        uf: s.uf ?? null,
        segmentos: (s.segmentos ?? []).map((x) => x.nome),
        estagio,
        valorPretendido: modo === 't4' ? null : Number.isFinite(valor) ? valor : null,
        cnpj: s.cnpj ?? null,
        // Consulta ao CNPJ SIMULADA: tem CNPJ cadastrado = situação Ativa.
        situacaoCnpj: (s.cnpj || simulado ? 'ativa' : 'nao_consultada') as SituacaoCnpj,
        documento:
          modo === 't3' ? { estagioDeclarado: outro, trecho: TRECHO_DOC[outro] } : null,
      };
    });
    const mostrar: Decisao =
      modo === 't1' ? 'sugerir_conversa' : modo === 't2' ? 'nao_recomendar' : 'pendencia';

    statusTesteEl.textContent = 'Aplicando as regras e consultando a IA…';
    const r = await api.post<RespostaRecomendacao>('/ai/recomendar-startups', {
      investidor,
      startups,
      mostrar,
    });

    const porId = new Map(todas.map((s) => [s.id, s]));
    const n = r.destaques.length;
    $<HTMLElement>('teste-resumo').innerHTML = n
      ? `<strong>${n}</strong> startup${n === 1 ? '' : 's'} neste cenário${
          simulado ? ' (condição simulada em startups cadastradas)' : ` de ${r.analisadas} analisadas`
        }.`
      : 'Nenhuma startup cadastrada se encaixa neste cenário agora.';
    $<HTMLElement>('teste-cards').innerHTML = r.destaques
      .map((d) => cardDestaque(d, porId.get(d.startupId)))
      .join('');
    $<HTMLElement>('origem').textContent = r.modelo
      ? `Justificativas escritas por IA (modelo ${r.modelo}). A decisão de cada startup foi calculada pelas regras.`
      : `Justificativas geradas pelas regras (modo sem IA).${r.aviso ? ' ' + r.aviso : ''}`;
    $<HTMLElement>('limitacao').textContent = `${NOTA_CONSULTA} ${r.limitacao}`;
    resultadoEl.hidden = false;
    resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    statusTesteEl.textContent = '';
  } catch (erro) {
    statusTesteEl.textContent = mensagemDeErro(erro);
  } finally {
    btnTeste.disabled = false;
  }
}

modoEl.addEventListener('change', mostrarInfoCenario);
btnTeste.addEventListener('click', () => void rodarTeste());

// Decisão humana (apenas visual): botões de cada card.
document.addEventListener('click', (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLButtonElement>('[data-humana]');
  if (!b) return;
  const textos: Record<string, string> = {
    conversar: 'Decisão registrada nesta tela: iniciar a conversa.',
    aguardar: 'Decisão registrada nesta tela: aguardar a revisão.',
    descartar: 'Decisão registrada nesta tela: descartar.',
  };
  const msg = b.closest('.ia-rec')?.querySelector<HTMLElement>('.ia-humana-msg');
  if (!msg) return;
  msg.textContent = `${textos[b.dataset.humana ?? ''] ?? ''} (Apenas visual: nada é salvo.)`;
  msg.hidden = false;
});

// ---------- início ----------
etapas('entrada', []);
mostrarInfoCenario();
// O dashboard abre esta tela com ?auto=1 para já rodar a análise.
if (new URLSearchParams(window.location.search).get('auto') === '1') {
  void analisarComIa();
}
