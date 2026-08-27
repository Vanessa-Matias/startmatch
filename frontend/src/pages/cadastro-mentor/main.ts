// Tela: Perfil do Mentor — lógica
// =================================
// Mais simples que as telas de startup/investidor (sem seleção de segmentos).
// Único cuidado especial: o campo "especialidades" é digitado como texto separado
// por vírgula no formulário, mas o backend espera um array de strings — a conversão
// acontece no envio (split(',') + trim + remove vazios).

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { MOCK_MODE } from '../../scripts/mock';
import type { Mentor } from '../../scripts/types';

requireAuth(['mentor']);

const form = document.getElementById('form-mentor') as HTMLFormElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;

async function init(): Promise<void> {
  // MODO DEMONSTRAÇÃO (scripts/mock.ts): em mock mode, GET /mentors/me NUNCA
  // falha com 404 (sempre devolve um perfil de mentira) — se não pularmos essa
  // checagem aqui, esta tela nunca apareceria de verdade (sempre redirecionaria
  // pro dashboard antes da Agnes conseguir ver/estilizar o formulário). Em modo
  // real (MOCK_MODE=false), o comportamento é exatamente o de antes.
  if (MOCK_MODE) return;

  try {
    await api.get<Mentor>('/mentors/me');
    // Perfil já existe — não deveria estar nesta tela.
    window.location.href = '../dashboard-mentor/index.html';
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) {
      throw error;
    }
  }
}

init().catch((error) => {
  errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao carregar perfil.';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';

  const formData = new FormData(form);
  // "growth, produto, fundraising" -> ["growth", "produto", "fundraising"]
  const especialidades = String(formData.get('especialidades') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const payload = {
    areaAtuacao: String(formData.get('areaAtuacao') ?? ''),
    bio: String(formData.get('bio') ?? ''),
    especialidades,
    disponibilidade: String(formData.get('disponibilidade') ?? ''),
    vinculoPortoDigital: formData.get('vinculoPortoDigital') === 'on',
  };

  try {
    await api.post('/mentors', payload);
    window.location.href = '../dashboard-mentor/index.html';
  } catch (error) {
    errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao salvar perfil.';
  }
});
