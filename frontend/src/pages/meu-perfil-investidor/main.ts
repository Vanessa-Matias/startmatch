// Tela: Meu perfil (investidor) — lógica
// =======================================
// Carrega o perfil do investidor logado (GET /investors/me) + os extras do
// navegador (scripts/perfilExtra.ts), preenche o assistente de 3 passos e mostra a
// prévia ao vivo. Ao salvar, grava SÓ no navegador (demonstração): nada vai para o
// banco de dados.

import { api } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { avatarImg, type Genero } from '../../scripts/avatars';
import { escapeHtml, TIPO_INVESTIDOR_LABEL } from '../../scripts/investidor';
import { reduzirFoto } from '../../scripts/mentorDemo';
import {
  ESTAGIOS,
  ESTAGIO_LABEL,
  definirPlanoSimulado,
  dinheiroCurto,
  extraInvestidor,
  planoSimulado,
  salvarExtraInvestidor,
  type ExtraInvestidor,
} from '../../scripts/perfilExtra';
import { PLANOS_INVESTIDOR_INFO, planosOpcoesHtml, seloLinkedin, seloPlano, seloVerificado } from '../../scripts/perfilUi';
import { UFS } from '../../scripts/ufs';
import { iniciarAssistente } from '../../scripts/wizard';
import type { EstagioStartup, Investidor, PlanoAssinatura, Segmento } from '../../scripts/types';

const usuario = requireAuth(['investidor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const form = document.getElementById('form-perfil') as HTMLFormElement;
const successEl = document.getElementById('form-success') as HTMLParagraphElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;
const previaEl = document.getElementById('previa') as HTMLDivElement;
const fotoSlot = document.getElementById('foto-slot') as HTMLElement;
const fotoInput = document.getElementById('foto') as HTMLInputElement;
const btnRemoverFoto = document.getElementById('remover-foto') as HTMLButtonElement;

const campo = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const nomeEl = campo<HTMLInputElement>('nome');
const linkedinEl = campo<HTMLInputElement>('linkedin');
const telefoneEl = campo<HTMLInputElement>('telefone');
const emailEl = campo<HTMLInputElement>('email');
const ticketMinEl = campo<HTMLInputElement>('ticketMin');
const ticketMaxEl = campo<HTMLInputElement>('ticketMax');
const cidadeEl = campo<HTMLInputElement>('cidade');
const ufEl = campo<HTMLSelectElement>('uf');
const procuraEl = campo<HTMLTextAreaElement>('procura');
const bioEl = campo<HTMLTextAreaElement>('bio');
const consentEl = campo<HTMLInputElement>('mostrarContatos');
const segmentosEl = campo<HTMLElement>('segmentos');
const estagiosEl = campo<HTMLElement>('estagios');
const planosEl = campo<HTMLElement>('planos');

let investidor: Investidor;
let fotoAtual = '';
let segmentosDisponiveis: string[] = [];

const generoSelecionado = (): Genero =>
  (form.querySelector<HTMLInputElement>('input[name="genero"]:checked')?.value as Genero | undefined) ?? 'm';

const planoSelecionado = (): PlanoAssinatura =>
  (form.querySelector<HTMLInputElement>('input[name="plano"]:checked')?.value as PlanoAssinatura | undefined) ?? 'basico';

const marcados = (raiz: HTMLElement): string[] =>
  Array.from(raiz.querySelectorAll<HTMLInputElement>('input:checked')).map((i) => i.value);

function lerFormulario(): ExtraInvestidor {
  return {
    ...extraInvestidor(investidor),
    nome: nomeEl.value.trim(),
    telefone: telefoneEl.value.trim(),
    email: emailEl.value.trim(),
    linkedin: linkedinEl.value.trim() || 'https://www.linkedin.com/',
    bio: bioEl.value.trim(),
    procura: procuraEl.value.trim(),
    genero: generoSelecionado(),
    foto: fotoAtual,
    mostrarContatos: consentEl.checked,
    estagios: marcados(estagiosEl) as EstagioStartup[],
    segmentos: marcados(segmentosEl),
    ticketMin: Number(ticketMinEl.value) || 0,
    ticketMax: Number(ticketMaxEl.value) || 0,
    cidade: cidadeEl.value.trim(),
    uf: ufEl.value,
    plano: planoSelecionado(),
    concluido: true,
  };
}

function escolhas(raiz: HTMLElement, nome: string, itens: { valor: string; rotulo: string }[], marcadosIni: string[]): void {
  raiz.innerHTML = itens
    .map(
      (i) => `<label class="escolha"><input type="checkbox" name="${nome}" value="${escapeHtml(i.valor)}" ${marcadosIni.includes(i.valor) ? 'checked' : ''} /><span>${escapeHtml(i.rotulo)}</span></label>`,
    )
    .join('');
}

function desenharPrevia(): void {
  const e = lerFormulario();
  const nome = e.nome || usuario.nome;
  previaEl.innerHTML = `
    <div class="previa-head">
      ${avatarImg(nome, { genero: e.genero, foto: e.foto, tamanho: 56 })}
      <div>
        <p class="previa-nome">${escapeHtml(nome)}</p>
        <p class="previa-cargo">${TIPO_INVESTIDOR_LABEL[investidor.tipo]} · ${escapeHtml(e.cidade)}/${escapeHtml(e.uf)}</p>
      </div>
    </div>
    <div class="selos">${seloVerificado()}${seloLinkedin(e.linkedin)}${seloPlano(e.plano)}</div>
    <p>${escapeHtml(e.bio)}</p>
    <ul class="previa-info">
      <li><strong>Ticket:</strong> ${dinheiroCurto(e.ticketMin)} a ${dinheiroCurto(e.ticketMax)}</li>
      <li><strong>Segmentos:</strong> ${e.segmentos.length ? escapeHtml(e.segmentos.join(', ')) : '—'}</li>
      <li><strong>Estágio:</strong> ${e.estagios.length ? e.estagios.map((s) => ESTAGIO_LABEL[s]).join(', ') : '—'}</li>
      <li><strong>Contatos:</strong> ${e.mostrarContatos ? 'visíveis para startups Plus e Premium' : 'protegidos (você não autorizou)'}</li>
    </ul>
  `;
  fotoSlot.innerHTML = avatarImg(nome, { genero: e.genero, foto: e.foto, tamanho: 96 });
  btnRemoverFoto.hidden = !fotoAtual;
}

function preencher(e: ExtraInvestidor): void {
  nomeEl.value = e.nome;
  linkedinEl.value = e.linkedin;
  telefoneEl.value = e.telefone;
  emailEl.value = e.email;
  ticketMinEl.value = String(e.ticketMin);
  ticketMaxEl.value = String(e.ticketMax);
  cidadeEl.value = e.cidade;
  ufEl.value = e.uf;
  procuraEl.value = e.procura;
  bioEl.value = e.bio;
  consentEl.checked = e.mostrarContatos;
  fotoAtual = e.foto;
  form.querySelector<HTMLInputElement>(`input[name="genero"][value="${e.genero}"]`)!.checked = true;
  escolhas(estagiosEl, 'estagio', ESTAGIOS.map((s) => ({ valor: s, rotulo: ESTAGIO_LABEL[s] })), e.estagios);
  planosEl.innerHTML = planosOpcoesHtml('plano', planoSimulado('investidor') ?? e.plano, PLANOS_INVESTIDOR_INFO);
}

async function init(): Promise<void> {
  for (const uf of UFS) ufEl.add(new Option(uf, uf));

  try {
    investidor = await api.get<Investidor>('/investors/me');
  } catch {
    // sem perfil no banco: usa um modelo vazio só para a tela funcionar
    investidor = {
      id: usuario.id,
      tipo: 'anjo',
      teseInvestimento: '',
      investimentoMin: 50000,
      investimentoMax: 300000,
      cidade: 'Recife',
      uf: 'PE',
      perfilPublico: true,
      planoAssinatura: 'basico',
      segmentos: [],
    };
  }
  investidor = { ...investidor, nome: investidor.nome ?? usuario.nome };
  const extra = extraInvestidor(investidor);
  preencher(extra);

  try {
    const segs = await api.get<Segmento[]>('/segments');
    segmentosDisponiveis = segs.map((s) => s.nome);
  } catch {
    segmentosDisponiveis = extra.segmentos;
  }
  const todos = Array.from(new Set([...segmentosDisponiveis, ...extra.segmentos]));
  escolhas(segmentosEl, 'segmento', todos.map((n) => ({ valor: n, rotulo: n })), extra.segmentos);

  iniciarAssistente(form);
  desenharPrevia();
}

form.addEventListener('input', desenharPrevia);
form.addEventListener('change', desenharPrevia);

fotoInput.addEventListener('change', async () => {
  const arquivo = fotoInput.files?.[0];
  if (!arquivo) return;
  try {
    fotoAtual = await reduzirFoto(arquivo);
    errorEl.textContent = '';
    desenharPrevia();
  } catch (erro) {
    errorEl.textContent = erro instanceof Error ? erro.message : 'Não foi possível usar essa imagem.';
  }
});

btnRemoverFoto.addEventListener('click', () => {
  fotoAtual = '';
  fotoInput.value = '';
  desenharPrevia();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  successEl.textContent = '';
  const extra = lerFormulario();
  if (!extra.nome) {
    errorEl.textContent = 'Informe seu nome completo no passo 1.';
    return;
  }
  if (extra.ticketMax && extra.ticketMin > extra.ticketMax) {
    errorEl.textContent = 'O ticket mínimo não pode ser maior que o máximo.';
    return;
  }
  const ok = salvarExtraInvestidor(investidor.id, extra);
  definirPlanoSimulado('investidor', extra.plano);
  if (!ok) {
    errorEl.textContent = 'Não foi possível salvar neste navegador (a foto pode ser grande demais).';
    return;
  }
  successEl.innerHTML = `Perfil salvo neste navegador. <a href="../perfil-investidor/index.html?id=${investidor.id}">Ver como as startups veem</a>`;
});

void init();
