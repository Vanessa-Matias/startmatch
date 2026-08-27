// Tela: Perfil do Investidor — lógica
// =====================================
// Mesma estrutura da tela de cadastro-startup, mas com duas diferenças:
//   - Cada segmento marcado ganha um campo numérico de PRIORIDADE (em vez de um
//     único rádio "principal") — o valor inicial sugerido é a ordem em que o
//     segmento aparece na lista (index + 1), mas o usuário pode alterar.
//   - Valida que investimentoMin não seja maior que investimentoMax antes de enviar.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { MOCK_MODE } from '../../scripts/mock';
import { populateUfSelect } from '../../scripts/ufs';
import type { Investidor, Segmento } from '../../scripts/types';

requireAuth(['investidor']);

const form = document.getElementById('form-investidor') as HTMLFormElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;
const segmentosListEl = document.getElementById('segmentos-list') as HTMLDivElement;
const ufSelect = document.getElementById('uf') as HTMLSelectElement;

populateUfSelect(ufSelect);

async function init(): Promise<void> {
  // MODO DEMONSTRAÇÃO (scripts/mock.ts): em mock mode, GET /*/me NUNCA falha com
// 404 (sempre devolve um perfil de mentira) — se não pularmos essa checagem
// aqui, esta tela nunca apareceria de verdade (sempre redirecionaria pro
// dashboard antes da Agnes conseguir ver/estilizar o formulário). Em modo real
// (MOCK_MODE=false), o comportamento é exatamente o de antes.
  if (!MOCK_MODE) {
    try {
      await api.get<Investidor>('/investors/me');
      // Perfil já existe — não deveria estar nesta tela, manda para o dashboard.
      window.location.href = '../dashboard-investidor/index.html';
      return;
    } catch (error) {
      // 404 é o caminho normal de quem está cadastrando pela primeira vez.
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error;
      }
    }
  }

  const segmentos = await api.get<Segmento[]>('/segments');
  segmentosListEl.innerHTML = segmentos
    .map(
      (segmento, index) => `
        <div class="checkbox-row">
          <input type="checkbox" class="segmento-check" value="${segmento.id}" id="seg-${segmento.id}" />
          <label for="seg-${segmento.id}">${segmento.nome}</label>
          <input
            type="number"
            class="input segmento-prioridade"
            style="width: 70px"
            min="1"
            value="${index + 1}"
            disabled
          />
        </div>
      `,
    )
    .join('');

  // Habilita o campo de prioridade só quando o checkbox do segmento é marcado.
  segmentosListEl.querySelectorAll<HTMLInputElement>('.segmento-check').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const row = checkbox.closest('.checkbox-row') as HTMLDivElement;
      const prioridadeInput = row.querySelector<HTMLInputElement>('.segmento-prioridade')!;
      prioridadeInput.disabled = !checkbox.checked;
    });
  });
}

init().catch((error) => {
  errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao carregar segmentos.';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';

  const checkedRows = Array.from(
    segmentosListEl.querySelectorAll<HTMLInputElement>('.segmento-check:checked'),
  );
  if (checkedRows.length === 0) {
    errorEl.textContent = 'Selecione ao menos um segmento de interesse.';
    return;
  }

  const segmentosPayload = checkedRows.map((checkbox) => {
    const row = checkbox.closest('.checkbox-row') as HTMLDivElement;
    const prioridadeInput = row.querySelector<HTMLInputElement>('.segmento-prioridade')!;
    return { segmentoId: Number(checkbox.value), prioridade: Number(prioridadeInput.value) || 1 };
  });

  const formData = new FormData(form);
  const investimentoMin = Number(formData.get('investimentoMin') ?? 0);
  const investimentoMax = Number(formData.get('investimentoMax') ?? 0);

  if (investimentoMin > investimentoMax) {
    errorEl.textContent = 'O investimento mínimo não pode ser maior que o máximo.';
    return;
  }

  const payload = {
    tipo: String(formData.get('tipo') ?? ''),
    teseInvestimento: String(formData.get('teseInvestimento') ?? ''),
    investimentoMin,
    investimentoMax,
    cidade: String(formData.get('cidade') ?? ''),
    uf: String(formData.get('uf') ?? ''),
    perfilPublico: formData.get('perfilPublico') === 'on',
    segmentos: segmentosPayload,
  };

  try {
    await api.post('/investors', payload);
    window.location.href = '../dashboard-investidor/index.html';
  } catch (error) {
    errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao salvar perfil.';
  }
});
