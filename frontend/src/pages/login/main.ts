// Tela: Login — lógica
// =====================
// Ao enviar o formulário:
//   1. Chama login(email, senha) (scripts/auth.ts), que fala com o backend e salva
//      o token se der certo.
//   2. Verifica se o usuário já preencheu o perfil do seu tipo (ex.: uma startup
//      chamando GET /startups/me). Se SIM -> vai direto pro dashboard. Se NÃO
//      (backend responde 404) -> vai para a tela de cadastro daquele perfil
//      específico (é o caso de alguém que criou a conta mas não terminou o cadastro).
//   3. Se o login falhar (senha errada, etc.), mostra o erro em #form-error.
//
// (Também liga o fundo animado de "rede de pontos" do painel de marca — puramente
// decorativo, ver scripts/particleNetwork.ts.)

import { api, ApiError } from '../../scripts/api';
import { login, dashboardPathForRole } from '../../scripts/auth';
import { initParticleNetwork } from '../../scripts/particleNetwork';
import type { TipoUsuario } from '../../scripts/types';

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

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';

  const formData = new FormData(form);
  const email = String(formData.get('email') ?? '');
  const senha = String(formData.get('senha') ?? '');

  try {
    const usuario = await login(email, senha);

    // ADMIN NÃO PASSA PELO CADASTRO DE PERFIL
    if (usuario.tipo === 'admin') {
      window.location.href = '../dashboard-admin/index.html';
      return;
    }

    const checkPath = PROFILE_CHECK_PATH[usuario.tipo];

    try {
      await api.get(checkPath!);
      window.location.href = dashboardPathForRole(usuario.tipo);
    } catch (profileError) {
      if (profileError instanceof ApiError && profileError.status === 404) {
        window.location.href = CADASTRO_PERFIL_PATH[usuario.tipo];
      } else {
        throw profileError;
      }
    }
  } catch (error) {
    errorEl.textContent =
      error instanceof ApiError
        ? error.message
        : 'Erro ao entrar.';
  }
});
