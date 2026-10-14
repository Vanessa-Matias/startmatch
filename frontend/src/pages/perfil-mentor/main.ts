// Tela: Perfil do Mentor (edição) — lógica
// =========================================
// Carrega GET /mentors/me + o perfil extra do navegador, preenche o formulário
// e mostra ao lado uma prévia ao vivo do card que a startup vê em Mentorias.
//
// Ao salvar:
//   - PATCH /mentors/me com os campos que o backend já tem
//   - salvarPerfilExtra() com foto, nome, cargo, empresa, experiência,
//     modalidade e LinkedIn (scripts/mentorDemo.ts)

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import {
  MODALIDADE_LABEL,
  iniciais,
  lerPerfilExtra,
  reduzirFoto,
  salvarPerfilExtra,
  type Modalidade,
  type PerfilExtraMentor,
} from '../../scripts/mentorDemo';
import { renderNav } from '../../scripts/nav';
import type { Mentor } from '../../scripts/types';

const usuario = requireAuth(['mentor']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const form = document.getElementById('form-perfil') as HTMLFormElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;
const successEl = document.getElementById('form-success') as HTMLParagraphElement;
const btnSalvar = document.getElementById('btn-salvar') as HTMLButtonElement;
const previaEl = document.getElementById('previa') as HTMLDivElement;
const fotoInput = document.getElementById('foto') as HTMLInputElement;
const btnRemoverFoto = document.getElementById('remover-foto') as HTMLButtonElement;

const campo = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const nomeEl = campo<HTMLInputElement>('nome');
const linkedinEl = campo<HTMLInputElement>('linkedin');
const cargoEl = campo<HTMLInputElement>('cargo');
const empresaEl = campo<HTMLInputElement>('empresa');
const anosEl = campo<HTMLInputElement>('anos');
const modalidadeEl = campo<HTMLSelectElement>('modalidade');
const areaEl = campo<HTMLInputElement>('areaAtuacao');
const bioEl = campo<HTMLTextAreaElement>('bio');
const especialidadesEl = campo<HTMLInputElement>('especialidades');
const disponibilidadeEl = campo<HTMLInputElement>('disponibilidade');
const vinculoEl = campo<HTMLInputElement>('vinculoPortoDigital');

let mentorId: number | null = null;
let fotoAtual = '';

function escapeHtml(texto: string): string {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function listaEspecialidades(): string[] {
  return especialidadesEl.value
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
}

function nomeExibido(): string {
  return nomeEl.value.trim() || usuario.nome || 'Seu nome';
}

function fotoHtml(classe: string): string {
  return fotoAtual
    ? `<img class="${classe}" src="${fotoAtual}" alt="" />`
    : `<span class="${classe} foto-iniciais" aria-hidden="true">${iniciais(nomeExibido())}</span>`;
}

function renderFoto(): void {
  // o elemento troca entre <img> e <span>, então é buscado de novo a cada vez
  const fotoPreviewEl = document.getElementById('foto-preview') as HTMLElement;
  fotoPreviewEl.outerHTML = fotoAtual
    ? `<img id="foto-preview" class="foto-preview" src="${fotoAtual}" alt="Sua foto de perfil" />`
    : `<span id="foto-preview" class="foto-preview foto-iniciais" aria-hidden="true">${iniciais(nomeExibido())}</span>`;
  btnRemoverFoto.hidden = !fotoAtual;
}

// Prévia: o mesmo conteúdo do card e do "Ver perfil" da tela de Mentorias
function renderPrevia(): void {
  const cargoEmpresa = [cargoEl.value.trim(), empresaEl.value.trim()].filter(Boolean).join(' · ');
  const badge = vinculoEl.checked
    ? '<span class="badge-eyebrow badge-eyebrow--green">Mentor da Rede Parceira</span>'
    : '<span class="badge-eyebrow badge-eyebrow--sky">Mentor independente</span>';
  const anos = Number(anosEl.value);
  const tags = listaEspecialidades()
    .map((e) => `<span class="badge">${escapeHtml(e)}</span>`)
    .join('');

  previaEl.innerHTML = `
    <div class="previa-head">
      ${fotoHtml('foto-preview')}
      <div>
        <p class="previa-nome">${escapeHtml(nomeExibido())}</p>
        <p class="previa-cargo">${escapeHtml(cargoEmpresa || 'Cargo · Empresa')}</p>
      </div>
    </div>
    ${badge}
    <p><strong>${escapeHtml(areaEl.value.trim() || 'Área de atuação')}</strong></p>
    ${tags ? `<div class="previa-tags">${tags}</div>` : ''}
    <ul class="previa-info">
      <li><strong>Experiência:</strong> ${anos > 0 ? `${anos} anos` : '—'}</li>
      <li><strong>Modalidade:</strong> ${MODALIDADE_LABEL[modalidadeEl.value as Modalidade]}</li>
      <li><strong>Disponibilidade:</strong> ${escapeHtml(disponibilidadeEl.value.trim() || '—')}</li>
    </ul>
  `;
}

function preencher(mentor: Mentor, extra: PerfilExtraMentor): void {
  nomeEl.value = extra.nome || usuario.nome || '';
  linkedinEl.value = extra.linkedin;
  cargoEl.value = extra.cargo;
  empresaEl.value = extra.empresa;
  anosEl.value = extra.anosExperiencia ? String(extra.anosExperiencia) : '';
  modalidadeEl.value = extra.modalidade;
  areaEl.value = mentor.areaAtuacao ?? '';
  bioEl.value = mentor.bio ?? '';
  especialidadesEl.value = (mentor.especialidades ?? []).join(', ');
  disponibilidadeEl.value = mentor.disponibilidade ?? '';
  vinculoEl.checked = Boolean(mentor.vinculoPortoDigital);
  fotoAtual = extra.foto;
  renderFoto();
  renderPrevia();
}

// prévia atualiza enquanto digita
form.addEventListener('input', () => {
  successEl.textContent = '';
  renderPrevia();
  if (!fotoAtual) renderFoto();
});

fotoInput.addEventListener('change', async () => {
  const arquivo = fotoInput.files?.[0];
  if (!arquivo) return;
  errorEl.textContent = '';
  try {
    fotoAtual = await reduzirFoto(arquivo);
    renderFoto();
    renderPrevia();
  } catch (error) {
    errorEl.textContent = error instanceof Error ? error.message : 'Não foi possível carregar a foto.';
  } finally {
    fotoInput.value = '';
  }
});

btnRemoverFoto.addEventListener('click', () => {
  fotoAtual = '';
  renderFoto();
  renderPrevia();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  successEl.textContent = '';

  const especialidades = listaEspecialidades();
  if (!areaEl.value.trim() || !bioEl.value.trim() || !disponibilidadeEl.value.trim()) {
    errorEl.textContent = 'Preencha área de atuação, "Sobre você" e disponibilidade.';
    return;
  }
  if (especialidades.length === 0) {
    errorEl.textContent = 'Informe ao menos uma especialidade.';
    especialidadesEl.focus();
    return;
  }
  if (mentorId === null) {
    errorEl.textContent = 'Perfil ainda não carregado. Tente novamente em instantes.';
    return;
  }

  btnSalvar.disabled = true;
  btnSalvar.textContent = 'Salvando…';

  try {
    await api.patch<Mentor>('/mentors/me', {
      areaAtuacao: areaEl.value.trim(),
      bio: bioEl.value.trim(),
      especialidades,
      disponibilidade: disponibilidadeEl.value.trim(),
      vinculoPortoDigital: vinculoEl.checked,
    });

    const anos = Number(anosEl.value);
    const salvou = salvarPerfilExtra(mentorId, {
      nome: nomeEl.value.trim(),
      cargo: cargoEl.value.trim(),
      empresa: empresaEl.value.trim(),
      anosExperiencia: anos > 0 ? anos : null,
      modalidade: modalidadeEl.value as Modalidade,
      linkedin: linkedinEl.value.trim(),
      foto: fotoAtual,
    });

    if (!salvou) {
      errorEl.textContent =
        'As informações principais foram salvas, mas o navegador não conseguiu guardar a foto. Tente uma imagem menor.';
    } else {
      successEl.textContent = 'Perfil salvo! As startups já veem as novas informações em Mentorias.';
    }
  } catch (error) {
    errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao salvar perfil.';
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = 'Salvar perfil';
  }
});

async function init(): Promise<void> {
  const mentor = await api.get<Mentor>('/mentors/me');
  mentorId = mentor.id;
  preencher(mentor, lerPerfilExtra(mentor.id));
}

init().catch((error) => {
  errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao carregar perfil.';
});
