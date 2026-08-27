// Tela: Configurações — lógica
// ==============================
// Única tela que TODOS os tipos de usuário conseguem acessar (requireAuth() sem
// argumentos = qualquer papel logado serve). Faz 3 coisas independentes:
//
//   1. Monta o menu de navegação (#nav-links) via scripts/nav.ts — mesmo helper
//      usado em toda tela autenticada, garante que o menu siga o fluxograma da
//      designer (Aula 02 - PI.pdf) em vez de uma lista fixa só desta tela.
//   2. Carrega e permite editar o nome da conta (e-mail é só leitura).
//   3. Formulário de avaliação beta (nota 1-5 + comentário opcional).
//
// O plano de assinatura SAIU desta tela — agora é a tela própria "Plano"
// (src/pages/plano/), no menu de Startup/Investidor. Aqui só deixamos um lembrete
// (#plano-nota) apontando para lá, quando o papel do usuário tiver essa tela.
//
// Também tem o botão "Sair" (logout), que limpa a sessão salva no navegador.

import { api, ApiError } from '../../scripts/api';
import { requireAuth, logout } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';

// requireAuth() sem lista de papéis permitidos = qualquer tipo de usuário logado
// pode acessar esta tela (diferente da maioria das outras, que restringe o papel).
const usuario = requireAuth();
renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const nomeEl = document.getElementById('nome') as HTMLInputElement;
const emailEl = document.getElementById('email') as HTMLInputElement;
const contaErrorEl = document.getElementById('form-conta-error') as HTMLParagraphElement;
const contaSuccessEl = document.getElementById('form-conta-success') as HTMLParagraphElement;
const formConta = document.getElementById('form-conta') as HTMLFormElement;

const planoNotaEl = document.getElementById('plano-nota') as HTMLParagraphElement;

const formAvaliacao = document.getElementById('form-avaliacao') as HTMLFormElement;
const avaliacaoSuccessEl = document.getElementById('form-avaliacao-success') as HTMLParagraphElement;

// Só startup e investidor têm uma tela "Plano" própria no menu (ver scripts/nav.ts).
// Mentor vê o plano dentro do próprio dashboard; admin não tem plano de assinatura.
if (usuario.tipo === 'startup' || usuario.tipo === 'investidor') {
  planoNotaEl.innerHTML = 'Quer ver ou trocar seu plano de assinatura? Acesse <a href="../plano/index.html">Plano</a>.';
}

function init(): void {
  nomeEl.value = usuario.nome;
  emailEl.value = usuario.email;
}

init();

formConta.addEventListener('submit', async (event) => {
  event.preventDefault();
  contaErrorEl.textContent = '';
  contaSuccessEl.textContent = '';

  try {
    await api.patch('/users/me', { nome: nomeEl.value });
    contaSuccessEl.textContent = 'Dados salvos com sucesso.';
  } catch (error) {
    contaErrorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao salvar dados.';
  }
});

formAvaliacao.addEventListener('submit', async (event) => {
  event.preventDefault();
  avaliacaoSuccessEl.textContent = '';

  const formData = new FormData(formAvaliacao);
  const nota = Number(formData.get('nota'));
  const comentario = String(formData.get('comentario') ?? '').trim() || undefined;

  try {
    await api.post('/beta-evaluation', { nota, comentario });
    avaliacaoSuccessEl.textContent = 'Obrigado pela avaliação!';
    formAvaliacao.reset();
  } catch (error) {
    avaliacaoSuccessEl.textContent =
      error instanceof ApiError ? error.message : 'Erro ao enviar avaliação.';
  }
});

document.getElementById('btn-logout')!.addEventListener('click', logout);
