// Tela: Canvas — lógica
// ======================

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { PlanoNegocio } from '../../scripts/types';

const usuario = requireAuth(['startup']);

renderNav(
  document.getElementById('nav-links') as HTMLElement,
  usuario.tipo
);

const form = document.getElementById('form-canvas') as HTMLFormElement;

const errorEl = document.getElementById(
  'form-error'
) as HTMLParagraphElement;

const successEl = document.getElementById(
  'form-success'
) as HTMLParagraphElement;

const propostaValorEl = document.getElementById(
  'propostaValor'
) as HTMLTextAreaElement;

const segmentosClientesEl = document.getElementById(
  'segmentosClientes'
) as HTMLTextAreaElement;

const canaisEl = document.getElementById(
  'canais'
) as HTMLTextAreaElement;

const relacionamentoClientesEl = document.getElementById(
  'relacionamentoClientes'
) as HTMLTextAreaElement;

const fontesReceitaEl = document.getElementById(
  'fontesReceita'
) as HTMLTextAreaElement;

const recursosChaveEl = document.getElementById(
  'recursosChave'
) as HTMLTextAreaElement;

const atividadesChaveEl = document.getElementById(
  'atividadesChave'
) as HTMLTextAreaElement;

const parceriasChaveEl = document.getElementById(
  'parceriasChave'
) as HTMLTextAreaElement;

const estruturaCustosEl = document.getElementById(
  'estruturaCustos'
) as HTMLTextAreaElement;

async function init(): Promise<void> {
  try {
    // Verifica se existe um Canvas para a startup,
    // mas não carrega os dados salvos nos campos.
    await api.get<PlanoNegocio>('/business-canvas/me');

    // Os campos permanecem vazios ao abrir a tela.
    // Os textos de orientação continuam no HTML.
  } catch (error) {
    // Se ainda não existir um Canvas salvo para a startup,
    // a tela deve abrir normalmente com os campos vazios.
    if (error instanceof ApiError) {
      errorEl.textContent = '';
      return;
    }

    errorEl.textContent = '';
  }
}

init();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  errorEl.textContent = '';
  successEl.textContent = '';

  const payload = {
    propostaValor: propostaValorEl.value,
    modeloReceita: fontesReceitaEl.value,
    publicoAlvo: segmentosClientesEl.value,
    estrategiaMonetizacao: canaisEl.value,
  };

  try {
    await api.put('/business-canvas/me', payload);

    successEl.textContent = 'Canvas salvo com sucesso.';
  } catch (error) {
    errorEl.textContent =
      error instanceof ApiError
        ? error.message
        : 'Erro ao salvar canvas.';
  }
});