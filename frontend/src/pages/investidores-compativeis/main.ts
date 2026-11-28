// Tela: Investidores compatíveis — lógica
// ========================================
// 1. Carrega a startup logada (GET /startups/me) e os investidores (GET /investors).
//    Se houver poucos investidores no banco, completa com investidores FICTÍCIOS
//    (scripts/demoData.ts), marcados como "perfil de demonstração".
// 2. Calcula a compatibilidade de cada um (scripts/perfilExtra.ts -> compatibilidade).
// 3. Plano Premium: mostra os 3 mais compatíveis e o botão "Ver outros investidores".
//    Outros planos: mostra a lista desfocada com o convite para o Premium.
//
// A regra é fixa e explicável (não chama o serviço de IA), então responde na hora e
// não gasta o limite de chamadas da IA durante a apresentação.

import { api } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { avatarImg } from '../../scripts/avatars';
import { DEMO_INVESTIDORES } from '../../scripts/demoData';
import { TIPO_INVESTIDOR_LABEL, escapeHtml } from '../../scripts/investidor';
import {
  PLANO_LABEL,
  compatibilidade,
  definirPlanoSimulado,
  dinheiroCurto,
  extraInvestidor,
  planoEfetivo,
  planoSimulado,
  type ResultadoCompat,
} from '../../scripts/perfilExtra';
import { rosetaVerificada, seloDemo, seloVerificado } from '../../scripts/perfilUi';
import type { Investidor, PaginatedResponse, PlanoAssinatura, Startup } from '../../scripts/types';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const conteudoEl = document.getElementById('compat-conteudo') as HTMLDivElement;
const simuladorEl = document.getElementById('simular-plano') as HTMLSelectElement;

interface Item {
  inv: Investidor & { slug?: string; grupo?: boolean };
  demo: boolean;
  res: ResultadoCompat;
}

let startup: Startup;
let itens: Item[] = [];
let mostrarOutros = false;

function href(item: Item): string {
  return item.demo
    ? `../perfil-investidor/index.html?demo=${item.inv.slug}`
    : `../perfil-investidor/index.html?id=${item.inv.id}`;
}

function cartao(item: Item, destaque: boolean): string {
  const extra = extraInvestidor(item.inv);
  const nome = extra.nome;
  const { res } = item;
  return `
    <article class="compat-card ${destaque ? 'compat-card--top' : ''}">
      ${avatarImg(nome, { genero: extra.genero, foto: extra.foto, tipo: item.inv.grupo ? 'startup' : 'pessoa', tamanho: 64 })}
      <div style="min-width:0">
        <h3>${escapeHtml(nome)}${extra.verificado ? rosetaVerificada() : ''}</h3>
        <p class="meta">${TIPO_INVESTIDOR_LABEL[item.inv.tipo]} · ${escapeHtml(item.inv.cidade)}/${escapeHtml(item.inv.uf)} · ${dinheiroCurto(extra.ticketMin)} a ${dinheiroCurto(extra.ticketMax)}</p>
        <div class="selos" style="margin-bottom:6px">${extra.verificado ? seloVerificado() : ''}${item.demo ? seloDemo() : ''}</div>
        ${res.motivos.length ? `<ul class="compat-motivos">${res.motivos.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>` : ''}
        ${res.avisos.length ? `<ul class="compat-avisos">${res.avisos.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="compat-nota">
        <span class="pts">${res.score}</span>
        <small>pontos</small>
        <a class="btn ${destaque ? 'btn-primary' : 'btn-outline'}" href="${href(item)}">Ver perfil</a>
      </div>
    </article>`;
}

function desenhar(): void {
  const plano = planoEfetivo('startup', startup.planoAssinatura);
  const compativeis = itens.filter((i) => i.res.compativel);
  const outros = itens.filter((i) => !i.res.compativel);
  const top = compativeis.slice(0, 3);
  const restoCompativeis = compativeis.slice(3);

  const listaTop = `<div class="compat-lista">${top.map((i) => cartao(i, true)).join('') || '<p class="text-muted">Nenhum investidor compatível encontrado ainda.</p>'}</div>`;

  if (plano !== 'premium') {
    conteudoEl.innerHTML = `
      <div class="compat-bloqueio">
        ${listaTop}
        <div class="compat-cta">
          <div class="compat-cta-box">
            <h2>Recurso do plano Premium</h2>
            <p class="text-muted">Você está no plano <strong>${PLANO_LABEL[plano]}</strong>. No Premium, o StartMatch ordena os investidores que mais combinam com a sua startup e explica o porquê de cada um.</p>
            <a class="btn btn-primary" href="../plano/index.html">Conhecer o plano Premium</a>
          </div>
        </div>
      </div>`;
    return;
  }

  const extras = [...restoCompativeis, ...outros];
  conteudoEl.innerHTML = `
    <p class="text-muted" style="margin-top:0">
      Sua startup busca <strong>${dinheiroCurto(Number(startup.investimentoPretendido))}</strong> em
      ${escapeHtml(startup.segmentos.map((s) => s.nome).join(', ') || 'segmentos a definir')}.
      Veja abaixo quem mais combina.
    </p>
    ${listaTop}
    <div class="compat-mais">
      ${
        extras.length
          ? `<button type="button" class="btn btn-outline" id="btn-outros">${mostrarOutros ? 'Esconder outros investidores' : `Ver outros investidores (${extras.length})`}</button>`
          : ''
      }
    </div>
    ${
      mostrarOutros
        ? `<h2 style="font-size:1.05rem">Outros investidores</h2>
           <p class="text-muted" style="margin-top:0">Combinam menos com a sua startup agora; os avisos mostram o que não bate.</p>
           <div class="compat-lista">${extras.map((i) => cartao(i, false)).join('')}</div>`
        : ''
    }
    <p class="text-muted" style="font-size:0.8rem;margin-top:var(--spacing-lg)">
      A pontuação soma segmento em comum (até 45), valor do pedido dentro do ticket (até 35),
      estágio (até 12) e região (até 8). É calculada por regras do StartMatch, sem enviar dados para fora.
    </p>`;
  document.getElementById('btn-outros')?.addEventListener('click', () => {
    mostrarOutros = !mostrarOutros;
    desenhar();
  });
}

async function init(): Promise<void> {
  const real = planoSimulado('startup');
  simuladorEl.value = real ?? '';

  try {
    startup = await api.get<Startup>('/startups/me');
  } catch {
    startup = {
      id: usuario.id,
      nomeFantasia: usuario.nome,
      descricao: '',
      estagio: 'mvp',
      investimentoPretendido: 250000,
      cidade: 'Recife',
      uf: 'PE',
      planoAssinatura: 'basico',
      segmentos: [{ segmentoId: 1, nome: 'Fintech', principal: true }],
    };
  }

  let reais: Investidor[] = [];
  try {
    reais = (await api.get<PaginatedResponse<Investidor>>('/investors?limit=50')).items;
  } catch {
    reais = [];
  }

  const todos: { inv: Investidor; demo: boolean }[] = [
    ...reais.map((inv) => ({ inv, demo: false })),
    ...DEMO_INVESTIDORES.filter((d) => !reais.some((r) => r.nome === d.nome)).map((inv) => ({ inv, demo: true })),
  ];

  itens = todos
    .map(({ inv, demo }) => {
      const extra = extraInvestidor(inv);
      const res = compatibilidade(
        {
          investimentoPretendido: Number(startup.investimentoPretendido),
          estagio: startup.estagio,
          uf: startup.uf,
          segmentos: startup.segmentos,
        },
        {
          investimentoMin: Number(inv.investimentoMin),
          investimentoMax: Number(inv.investimentoMax),
          uf: inv.uf,
          segmentos: inv.segmentos,
          estagios: extra.estagios,
        },
      );
      return { inv, demo, res };
    })
    .sort((a, b) => b.res.score - a.res.score);

  desenhar();
}

simuladorEl.addEventListener('change', () => {
  definirPlanoSimulado('startup', (simuladorEl.value || null) as PlanoAssinatura | null);
  if (startup) desenhar(); // antes de carregar, o init() desenha com o plano já salvo
});

void init();
