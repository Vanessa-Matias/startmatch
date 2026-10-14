// Tela: Login — lógica
// =====================
// Ao enviar o formulário:
//   1. Chama login(email, senha) (scripts/auth.ts), que fala com o backend e salva
//      o token se der certo.
//   2. Verifica se o usuário já preencheu o perfil do seu tipo (ex.: uma startup
//      chamando GET /startups/me). Se SIM -> vai direto pro dashboard. Se NÃO
//      (backend responde 404) -> vai para a tela de cadastro daquele perfil
//      específico (é o caso de alguém que criou a conta mas não terminou o cadastro).
//   3. Se o login der certo, mostra "Login efetuado com sucesso!" em #form-success
//      por um instante antes de redirecionar.
//   4. Se o login falhar, mostra o erro em #form-error: senha/e-mail errado ->
//      "Senha ou e-mail incorretos, digite novamente."; e-mail sem cadastro ->
//      "Você não possui cadastro. Efetue o seu cadastro para poder acessar a plataforma."
//      (as mensagens vêm do backend, em auth.service.ts).
//
// (Também liga o fundo animado de "rede de pontos" do painel de marca — puramente
// decorativo, ver scripts/particleNetwork.ts.)

import { api, ApiError } from '../../scripts/api';
import { login, dashboardPathForRole } from '../../scripts/auth';
import { initParticleNetwork } from '../../scripts/particleNetwork';
import { initPasswordToggles } from '../../scripts/passwordToggle';
import type { TipoUsuario } from '../../scripts/types';

// olhinho de mostrar/ocultar senha
initPasswordToggles();

const particleCanvas = document.getElementById('particle-bg');
if (particleCanvas instanceof HTMLCanvasElement) {
  initParticleNetwork(particleCanvas);
}

// Endpoint que confirma se o perfil daquele tipo de usuário já existe.
// admin não tem perfil de negócio, por isso é `null`.
const PROFILE_CHECK_PATH: Record<TipoUsuario, string | null> = {
  startup: '/startups/me',
  investidor: '/investors/me',
  mentor: '/mentors/me',
  admin: null,
};

// Para onde mandar cada tipo de usuário caso o perfil ainda não exista (404).
const CADASTRO_PERFIL_PATH: Record<TipoUsuario, string> = {
  startup: '../cadastro-startup/index.html',
  investidor: '../cadastro-investidor/index.html',
  mentor: '../cadastro-mentor/index.html',
  admin: '../dashboard-admin/index.html', // nunca usado de fato (admin não tem checkPath), mas mantém o tipo completo
};

const form = document.getElementById('form-login') as HTMLFormElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;
const successEl = document.getElementById('form-success') as HTMLParagraphElement;

// Tempo que a mensagem de sucesso fica visível antes de ir para a próxima tela.
const REDIRECT_DELAY_MS = 1200;

function redirectTo(path: string): void {
  window.setTimeout(() => {
    window.location.href = path;
  }, REDIRECT_DELAY_MS);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  successEl.textContent = '';

  const formData = new FormData(form);
  const email = String(formData.get('email') ?? '');
  const senha = String(formData.get('senha') ?? '');

  try {
    const usuario = await login(email, senha);
    successEl.textContent = 'Login efetuado com sucesso!';

    // ADMIN NÃO PASSA PELO CADASTRO DE PERFIL
    if (usuario.tipo === 'admin') {
      redirectTo('../dashboard-admin/index.html');
      return;
    }

    const checkPath = PROFILE_CHECK_PATH[usuario.tipo];

    try {
      await api.get(checkPath!);
      redirectTo(dashboardPathForRole(usuario.tipo));
    } catch (profileError) {
      if (profileError instanceof ApiError && profileError.status === 404) {
        redirectTo(CADASTRO_PERFIL_PATH[usuario.tipo]);
      } else {
        throw profileError;
      }
    }
  } catch (error) {
    successEl.textContent = '';
    errorEl.textContent =
      error instanceof ApiError
        ? error.message
        : 'Erro ao entrar.';
  }
});
