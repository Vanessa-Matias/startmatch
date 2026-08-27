// Tela: Canvas — lógica
// ======================
// Fluxo simples de "carregar e salvar" (não tem criação de item novo, é sempre o
// mesmo registro por startup):
//   1. init(): busca o canvas atual (GET /business-canvas/me) e preenche os 4
//      campos de texto.
//   2. No envio do formulário: manda os 4 campos via PUT /business-canvas/me
//      (sobrescreve o que já existia) e mostra "Canvas salvo com sucesso." em
//      #form-success.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import type { PlanoNegocio } from '../../scripts/types';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const form = document.getElementById('form-canvas') as HTMLFormElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;
const successEl = document.getElementById('form-success') as HTMLParagraphElement;

const propostaValorEl = document.getElementById('propostaValor') as HTMLTextAreaElement;
const modeloReceitaEl = document.getElementById('modeloReceita') as HTMLTextAreaElement;
const publicoAlvoEl = document.getElementById('publicoAlvo') as HTMLTextAreaElement;
const estrategiaMonetizacaoEl = document.getElementById('estrategiaMonetizacao') as HTMLTextAreaElement;

async function init(): Promise<void> {
  const plano = await api.get<PlanoNegocio>('/business-canvas/me');
  propostaValorEl.value = plano.propostaValor;
  modeloReceitaEl.value = plano.modeloReceita;
  publicoAlvoEl.value = plano.publicoAlvo;
  estrategiaMonetizacaoEl.value = plano.estrategiaMonetizacao;
}

init().catch((error) => {
  errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao carregar canvas.';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  successEl.textContent = '';

  const payload = {
    propostaValor: propostaValorEl.value,
    modeloReceita: modeloReceitaEl.value,
    publicoAlvo: publicoAlvoEl.value,
    estrategiaMonetizacao: estrategiaMonetizacaoEl.value,
  };

  try {
    // PUT em vez de POST: sempre substitui o canvas existente (não cria um novo).
    await api.put('/business-canvas/me', payload);
    successEl.textContent = 'Canvas salvo com sucesso.';
  } catch (error) {
    errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao salvar canvas.';
  }
});
