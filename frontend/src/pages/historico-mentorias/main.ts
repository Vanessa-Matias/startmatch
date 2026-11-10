// Tela: Histórico de mentorias — lógica
// =======================================
//
// As sessões realizadas vêm da API (GET /mentorias, status "realizada") por
// scripts/mentorDemo.ts — as mesmas que o Dashboard usa para somar as "Horas de
// mentoria". Cada sessão mostra o código do certificado.

import { requireAuth } from '../../scripts/auth';
import { ApiError } from '../../scripts/api';
import {
  SESSOES_REALIZADAS,
  carregarMentoriasDoMentor,
  formatarHoras,
  iniciais,
  totalHoras,
} from '../../scripts/mentorDemo';
import { renderNav } from '../../scripts/nav';

const usuario = requireAuth(['mentor']);

renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const historicoList = document.getElementById('historico-list') as HTMLElement;

const texto = (id: string, valor: string) => {
  (document.getElementById(id) as HTMLElement).textContent = valor;
};

// Meta de sessões por mês (referência visual da tela)
const META_MENSAL = 5;

function atualizarResumo(): void {
  const totalSessoes = SESSOES_REALIZADAS.length;
  const startupsUnicas = new Set(SESSOES_REALIZADAS.map((s) => s.startup));

  texto('horas-realizadas', formatarHoras(totalHoras()));
  texto('mentorias-concluidas', String(totalSessoes));
  texto('startups-atendidas', String(startupsUnicas.size));
  texto('sessoes-realizadas', String(totalSessoes));

  const realizadas = Math.min(totalSessoes, META_MENSAL);
  texto('meta-mentorias', `${realizadas} / ${META_MENSAL}`);
  (document.getElementById('progresso-mentorias') as HTMLElement).style.width =
    `${Math.min((realizadas / META_MENSAL) * 100, 100)}%`;
}

function renderSessoes(): void {
  if (SESSOES_REALIZADAS.length === 0) {
    historicoList.innerHTML = '<div class="lista-vazia">Nenhuma sessão registrada ainda.</div>';
    return;
  }

  historicoList.innerHTML = SESSOES_REALIZADAS.map(
    (sessao) => `
      <article class="card item-card">
        <div class="item-card-head">
          <div class="item-card-title">
            <span class="item-avatar" aria-hidden="true">${iniciais(sessao.startup)}</span>
            <div>
              <h3>${sessao.startup}</h3>
              <p>${sessao.tema}</p>
            </div>
          </div>
          <span class="badge-eyebrow badge-eyebrow--green">Concluída</span>
        </div>

        <div class="item-details">
          <div><span class="item-detail-label">Data</span><span class="item-detail-value">${sessao.data}</span></div>
          <div><span class="item-detail-label">Horário</span><span class="item-detail-value">${sessao.horario}</span></div>
          <div><span class="item-detail-label">Duração</span><span class="item-detail-value">${formatarHoras(sessao.horas)}</span></div>
          <div><span class="item-detail-label">Formato</span><span class="item-detail-value">${sessao.formato}</span></div>
          <div><span class="item-detail-label">Certificado</span><span class="item-detail-value">${sessao.codigo ?? '—'}</span></div>
        </div>
      </article>
    `,
  ).join('');
}

async function init(): Promise<void> {
  await carregarMentoriasDoMentor();
  atualizarResumo();
  renderSessoes();
}

init().catch((error) => {
  historicoList.innerHTML = `<div class="lista-vazia">${
    error instanceof ApiError ? error.message : 'Erro ao carregar o histórico.'
  }</div>`;
});
