// Tela: Meu perfil (startup) — lógica
// ====================================
// Carrega a startup logada (GET /startups/me) + os extras do navegador
// (scripts/perfilExtra.ts), preenche o assistente de 3 passos e mostra a prévia ao
// vivo. O vídeo de pitch é SÓ VISUAL: o arquivo escolhido não é enviado a lugar
// nenhum, só mostramos uma barra de envio e o nome. Ao salvar, grava apenas no
// navegador (demonstração): nada vai para o banco de dados.

import { api } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { TOTAL_CORES_LOGO, avatarImg, logoStartup } from '../../scripts/avatars';
import { escapeHtml } from '../../scripts/investidor';
import {
  ESTAGIOS,
  ESTAGIO_LABEL,
  definirPlanoSimulado,
  dinheiro,
  extraStartup,
  planoPago,
  planoSimulado,
  salvarExtraStartup,
  type ExtraStartup,
} from '../../scripts/perfilExtra';
import { PLANOS_STARTUP_INFO, planosOpcoesHtml, seloLinkedin, seloPlano } from '../../scripts/perfilUi';
import { UFS } from '../../scripts/ufs';
import { iniciarAssistente } from '../../scripts/wizard';
import type { EstagioStartup, PlanoAssinatura, Segmento, Startup } from '../../scripts/types';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const form = document.getElementById('form-perfil') as HTMLFormElement;
const successEl = document.getElementById('form-success') as HTMLParagraphElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;
const previaEl = document.getElementById('previa') as HTMLDivElement;
const logoSlot = document.getElementById('logo-slot') as HTMLElement;
const coresEl = document.getElementById('cores-logo') as HTMLElement;
const pitchArea = document.getElementById('pitch-area') as HTMLElement;
const planosEl = document.getElementById('planos') as HTMLElement;
const segmentosEl = document.getElementById('segmentos') as HTMLElement;

const campo = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const nomeEl = campo<HTMLInputElement>('nome');
const fundadorEl = campo<HTMLInputElement>('fundador');
const linkedinEl = campo<HTMLInputElement>('linkedin');
const emailEl = campo<HTMLInputElement>('email');
const cidadeEl = campo<HTMLInputElement>('cidade');
const ufEl = campo<HTMLSelectElement>('uf');
const descricaoEl = campo<HTMLInputElement>('descricao');
const estagioEl = campo<HTMLSelectElement>('estagio');
const investimentoEl = campo<HTMLInputElement>('investimento');
const bioEl = campo<HTMLTextAreaElement>('bio');

let startup: Startup;
let logoCor: number | null = null;
let pitchArquivo = '';
let pitchTitulo = '';

const planoSelecionado = (): PlanoAssinatura =>
  (form.querySelector<HTMLInputElement>('input[name="plano"]:checked')?.value as PlanoAssinatura | undefined) ?? 'basico';

function lerFormulario(): ExtraStartup {
  return {
    ...extraStartup(startup),
    nome: nomeEl.value.trim(),
    fundador: fundadorEl.value.trim(),
    linkedin: linkedinEl.value.trim() || 'https://www.linkedin.com/',
    email: emailEl.value.trim(),
    cidade: cidadeEl.value.trim(),
    uf: ufEl.value,
    descricao: descricaoEl.value.trim(),
    estagio: estagioEl.value as EstagioStartup,
    investimento: Number(investimentoEl.value) || 0,
    segmentos: Array.from(segmentosEl.querySelectorAll<HTMLInputElement>('input:checked')).map((i) => i.value),
    bio: bioEl.value.trim(),
    logoCor,
    pitchArquivo,
    pitchTitulo: pitchTitulo || `${nomeEl.value.trim() || 'Startup'} em 5 minutos`,
    plano: planoSelecionado(),
    concluido: true,
  };
}

function desenharCores(): void {
  coresEl.innerHTML = Array.from({ length: TOTAL_CORES_LOGO }, (_, i) => {
    const src = logoStartup('S', i);
    return `<button type="button" data-cor="${i}" aria-label="Cor ${i + 1}" aria-pressed="${logoCor === i}" style="background:url('${src}') center/cover"></button>`;
  }).join('');
  coresEl.querySelectorAll<HTMLButtonElement>('button').forEach((b) =>
    b.addEventListener('click', () => {
      logoCor = Number(b.dataset.cor);
      desenharCores();
      desenharPrevia();
    }),
  );
}

// ---- Pitch (visual) ----
function desenharPitch(): void {
  const pago = planoPago(planoSelecionado());
  if (!pago) {
    pitchArea.innerHTML = `<div class="pitch-trava"><strong>Disponível nos planos Plus e Premium.</strong><br />Escolha um plano pago abaixo para liberar o vídeo de pitch de 5 minutos no seu perfil.</div>`;
    return;
  }
  if (pitchArquivo) {
    pitchArea.innerHTML = `<div class="upload-pitch"><p><strong>${escapeHtml(pitchArquivo)}</strong><br /><span class="text-muted">Vídeo de 5:00 · pronto (prévia visual)</span></p><label class="btn btn-outline" for="pitch-arquivo">Trocar vídeo</label><input class="visually-hidden" id="pitch-arquivo" type="file" accept="video/*" /></div>`;
  } else {
    pitchArea.innerHTML = `<div class="upload-pitch"><p>Arraste ou escolha um vídeo de até 5 minutos.</p><label class="btn btn-outline" for="pitch-arquivo">Escolher vídeo</label><input class="visually-hidden" id="pitch-arquivo" type="file" accept="video/*" /><div class="upload-prog" id="upload-prog" hidden><span></span></div></div>`;
  }
  const input = document.getElementById('pitch-arquivo') as HTMLInputElement | null;
  input?.addEventListener('change', () => {
    const arquivo = input.files?.[0];
    if (!arquivo) return;
    simularEnvio(arquivo.name);
  });
}

// Só visual: uma barra que enche em ~2 s e depois mostra o nome do arquivo.
function simularEnvio(nome: string): void {
  const caixa = pitchArea.querySelector<HTMLElement>('.upload-pitch');
  if (!caixa) return;
  caixa.innerHTML = `<p><strong>${escapeHtml(nome)}</strong><br /><span class="text-muted">Enviando…</span></p><div class="upload-prog"><span></span></div>`;
  const barra = caixa.querySelector<HTMLElement>('.upload-prog span') as HTMLElement;
  let pct = 0;
  const timer = window.setInterval(() => {
    pct += 8;
    barra.style.width = `${Math.min(100, pct)}%`;
    if (pct >= 100) {
      window.clearInterval(timer);
      pitchArquivo = nome;
      desenharPitch();
      desenharPrevia();
    }
  }, 150);
}

function desenharPrevia(): void {
  const e = lerFormulario();
  const nome = e.nome || startup.nomeFantasia;
  logoSlot.innerHTML = avatarImg(nome, { tipo: 'startup', cor: e.logoCor ?? undefined, tamanho: 96 });
  previaEl.innerHTML = `
    <div class="previa-head">
      ${avatarImg(nome, { tipo: 'startup', cor: e.logoCor ?? undefined, tamanho: 56 })}
      <div>
        <p class="previa-nome">${escapeHtml(nome)}</p>
        <p class="previa-cargo">${escapeHtml(e.cidade)}/${escapeHtml(e.uf)} · ${ESTAGIO_LABEL[e.estagio]}</p>
      </div>
    </div>
    <div class="selos">${seloLinkedin(e.linkedin)}${seloPlano(e.plano)}</div>
    <p>${escapeHtml(e.descricao)}</p>
    <p class="text-muted">${escapeHtml(e.bio)}</p>
    <ul class="previa-info">
      <li><strong>Busca:</strong> ${dinheiro(e.investimento)}</li>
      <li><strong>Segmentos:</strong> ${e.segmentos.length ? escapeHtml(e.segmentos.join(', ')) : '—'}</li>
      <li><strong>Pitch de 5 min:</strong> ${planoPago(e.plano) ? (e.pitchArquivo ? 'enviado' : 'ainda sem vídeo') : 'disponível no plano Plus ou Premium'}</li>
    </ul>
  `;
}

function preencher(e: ExtraStartup): void {
  nomeEl.value = e.nome;
  fundadorEl.value = e.fundador;
  linkedinEl.value = e.linkedin;
  emailEl.value = e.email;
  cidadeEl.value = e.cidade;
  ufEl.value = e.uf;
  descricaoEl.value = e.descricao;
  estagioEl.value = e.estagio;
  investimentoEl.value = String(e.investimento);
  bioEl.value = e.bio;
  logoCor = e.logoCor;
  pitchArquivo = e.pitchArquivo;
  pitchTitulo = e.pitchTitulo;
  planosEl.innerHTML = planosOpcoesHtml('plano', planoSimulado('startup') ?? e.plano, PLANOS_STARTUP_INFO);
}

async function init(): Promise<void> {
  for (const uf of UFS) ufEl.add(new Option(uf, uf));
  for (const s of ESTAGIOS) estagioEl.add(new Option(ESTAGIO_LABEL[s], s));

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
      segmentos: [],
    };
  }
  const extra = extraStartup(startup);
  preencher(extra);
  desenharCores();

  let nomesSegmentos = extra.segmentos;
  try {
    nomesSegmentos = (await api.get<Segmento[]>('/segments')).map((s) => s.nome);
  } catch {
    // mantém só os segmentos que a startup já tem
  }
  const todos = Array.from(new Set([...nomesSegmentos, ...extra.segmentos]));
  segmentosEl.innerHTML = todos
    .map(
      (n) => `<label class="escolha"><input type="checkbox" name="segmento" value="${escapeHtml(n)}" ${extra.segmentos.includes(n) ? 'checked' : ''} /><span>${escapeHtml(n)}</span></label>`,
    )
    .join('');

  iniciarAssistente(form);
  desenharPitch();
  desenharPrevia();
}

form.addEventListener('input', desenharPrevia);
form.addEventListener('change', (event) => {
  if ((event.target as HTMLInputElement).name === 'plano') desenharPitch();
  desenharPrevia();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  successEl.textContent = '';
  const extra = lerFormulario();
  if (!extra.nome) {
    errorEl.textContent = 'Informe o nome da startup no passo 1.';
    return;
  }
  const ok = salvarExtraStartup(startup.id, extra);
  definirPlanoSimulado('startup', extra.plano);
  if (!ok) {
    errorEl.textContent = 'Não foi possível salvar neste navegador.';
    return;
  }
  successEl.innerHTML = `Perfil salvo neste navegador. <a href="../perfil-startup/index.html?id=${startup.id}">Ver como os investidores veem</a>`;
});

void init();
