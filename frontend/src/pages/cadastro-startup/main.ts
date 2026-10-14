// Tela: Perfil da Startup — lógica
// ==================================
// Fluxo:
//   1. requireAuth(['startup']) — só startups logadas chegam aqui.
//   2. init(): verifica se o perfil já existe (GET /startups/me). Se já existe,
//      pula direto para o dashboard (evita re-cadastro). Se não existe (404 é
//      esperado aqui — é o caminho normal de quem está cadastrando pela primeira
//      vez), busca a lista de segmentos (GET /segments) e monta dinamicamente um
//      checkbox + rádio "principal" para cada um.
//   3. Ao marcar um checkbox de segmento, o rádio "principal" correspondente é
//      habilitado (só pode escolher "principal" entre os segmentos já marcados).
//   4. No envio do formulário: valida que pelo menos um segmento foi marcado e que
//      um deles foi escolhido como principal, monta o payload e envia POST /startups.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { MOCK_MODE } from '../../scripts/mock';
import { populateUfSelect } from '../../scripts/ufs';
import type { Segmento, Startup } from '../../scripts/types';

const usuario = requireAuth(['startup']);
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const form = document.getElementById('form-startup') as HTMLFormElement;
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
      await api.get<Startup>('/startups/me');
      // Perfil já existe — não deveria estar nesta tela, manda para o dashboard.
      window.location.href = '../dashboard-startup/index.html';
      return;
    } catch (error) {
      // 404 aqui é o caso NORMAL (perfil ainda não criado) — qualquer outro erro é
      // realmente inesperado e deve "estourar" para o catch lá embaixo.
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error;
      }
    }
  }

  // Monta a lista de segmentos dinamicamente: um checkbox + rádio "principal" (que
  // começa desabilitado) por segmento retornado da API.
  const segmentos = await api.get<Segmento[]>('/segments');
  segmentosListEl.innerHTML = segmentos
    .map(
      (segmento) => `
        <div class="checkbox-row">
          <input type="checkbox" class="segmento-check" value="${segmento.id}" id="seg-${segmento.id}" />
          <label for="seg-${segmento.id}">${segmento.nome}</label>
          <input type="radio" name="principal" class="segmento-principal" value="${segmento.id}" disabled />
          <label for="seg-${segmento.id}" class="text-muted" style="font-weight:400">principal</label>
        </div>
      `,
    )
    .join('');

  // Habilita/desabilita o rádio "principal" conforme o checkbox do mesmo segmento
  // é marcado/desmarcado.
  segmentosListEl.querySelectorAll<HTMLInputElement>('.segmento-check').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const row = checkbox.closest('.checkbox-row') as HTMLDivElement;
      const radio = row.querySelector<HTMLInputElement>('.segmento-principal')!;
      radio.disabled = !checkbox.checked;
      if (!checkbox.checked) radio.checked = false;
    });
  });
}

init().catch((error) => {
  errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao carregar segmentos.';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';

  const checked = Array.from(
    segmentosListEl.querySelectorAll<HTMLInputElement>('.segmento-check:checked'),
  );
  if (checked.length === 0) {
    errorEl.textContent = 'Selecione ao menos um segmento.';
    return;
  }

  const principalInput = segmentosListEl.querySelector<HTMLInputElement>(
    '.segmento-principal:checked',
  );
  if (!principalInput) {
    errorEl.textContent = 'Marque qual segmento é o principal.';
    return;
  }

  // Monta o array de segmentos no formato esperado pelo backend: cada um marca se
  // é o principal comparando seu value com o valor do rádio selecionado.
  const segmentosPayload = checked.map((checkbox) => ({
    segmentoId: Number(checkbox.value),
    principal: checkbox.value === principalInput.value,
  }));

  const formData = new FormData(form);
  const payload = {
    nomeFantasia: String(formData.get('nomeFantasia') ?? ''),
    cnpj: String(formData.get('cnpj') ?? '') || undefined,
    descricao: String(formData.get('descricao') ?? ''),
    estagio: String(formData.get('estagio') ?? ''),
    investimentoPretendido: Number(formData.get('investimentoPretendido') ?? 0),
    cidade: String(formData.get('cidade') ?? ''),
    uf: String(formData.get('uf') ?? ''),
    segmentos: segmentosPayload,
  };

  try {
    await api.post('/startups', payload);
    window.location.href = '../dashboard-startup/index.html';
  } catch (error) {
    errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao salvar perfil.';
  }
});
