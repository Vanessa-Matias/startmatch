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

function redirectTo(path: string, atrasoMs = REDIRECT_DELAY_MS): void {
  window.setTimeout(() => {
    window.location.href = path;
  }, atrasoMs);
}

// Faz o login e leva a pessoa para o lugar certo (dashboard ou cadastro do perfil).
async function autenticar(email: string, senha: string, atrasoMs = REDIRECT_DELAY_MS): Promise<void> {
  errorEl.textContent = '';
  successEl.textContent = '';

  try {
    const usuario = await login(email, senha);
    successEl.textContent = 'Login efetuado com sucesso!';

    // ADMIN NÃO PASSA PELO CADASTRO DE PERFIL
    if (usuario.tipo === 'admin') {
      redirectTo('../dashboard-admin/index.html', atrasoMs);
      return;
    }

    const checkPath = PROFILE_CHECK_PATH[usuario.tipo];

    try {
      await api.get(checkPath!);
      redirectTo(dashboardPathForRole(usuario.tipo), atrasoMs);
    } catch (profileError) {
      if (profileError instanceof ApiError && profileError.status === 404) {
        redirectTo(CADASTRO_PERFIL_PATH[usuario.tipo], atrasoMs);
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
    throw error;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  void autenticar(String(formData.get('email') ?? ''), String(formData.get('senha') ?? '')).catch(() => {
    // o erro já foi mostrado na tela
  });
});

// ---------------------------------------------------------------------------
// ACESSO RÁPIDO (demonstração)
// ---------------------------------------------------------------------------
// Três botões que entram direto com as contas de teste da apresentação e levam ao
// dashboard do perfil escolhido. Para desligar depois da apresentação, defina
// VITE_DEMO_LOGIN=false na Vercel e faça um novo deploy: a seção some.
// Atenção: as contas de teste precisam existir no banco do ambiente (seed).

const DEMO_LOGIN_ATIVO = (import.meta.env.VITE_DEMO_LOGIN as string | undefined) !== 'false';

const CONTAS_DEMO: { rotulo: string; detalhe: string; email: string; senha: string; tipo: 'startup' | 'investidor' | 'mentor' }[] = [
  { rotulo: 'Startup', detalhe: 'Quero captar', email: 'startup@teste.com', senha: '1', tipo: 'startup' },
  { rotulo: 'Investidor', detalhe: 'Quero investir', email: 'investidor@teste.com', senha: '3', tipo: 'investidor' },
  { rotulo: 'Mentor', detalhe: 'Quero mentorar', email: 'mentor@teste.com', senha: '5', tipo: 'mentor' },
];

// Ícones dos perfis do acesso rápido, no visual do site: cada um num
// quadradinho que segue os níveis de cor dos Planos (claro → azul →
// azul-marinho com neon). Estilo em perfil.css (.acesso-icone).
const SVG_ABRE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const ICONES_PERFIL: Record<'startup' | 'investidor' | 'mentor', string> = {
  // foguete
  startup: `${SVG_ABRE}<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  // gráfico de barras com seta de crescimento
  investidor: `${SVG_ABRE}<path d="M3 21h18"/><rect x="5" y="13" width="3" height="5" rx="0.6"/><rect x="10.5" y="10" width="3" height="8" rx="0.6"/><rect x="16" y="7" width="3" height="11" rx="0.6"/><path d="M4 9l5-4 4 3 7-5"/><path d="M16 3h4v4"/></svg>`,
  // capelo de formatura (mentoria)
  mentor: `${SVG_ABRE}<path d="M22 9L12 4 2 9l10 5 10-5z"/><path d="M6 11.2V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.8"/><path d="M22 9v6"/></svg>`,
};

function iniciarAcessoRapido(): void {
  if (!DEMO_LOGIN_ATIVO) {
    // sem acesso rápido: mostra o formulário normal de e-mail e senha
    document.getElementById('login-real')?.removeAttribute('hidden');
    return;
  }
  const area = document.getElementById('acesso-rapido-area');
  if (!area) return;
  const secao = document.createElement('section');
  secao.className = 'acesso-rapido';
  secao.setAttribute('aria-labelledby', 'acesso-rapido-titulo');
  secao.innerHTML = `
    <h1 id="acesso-rapido-titulo">Acesso rápido para <span class="highlight sm-gradient-text">demonstração</span></h1>
    <p>Escolha um perfil para entrar direto no painel.</p>
    <p class="form-error" id="acesso-erro" role="alert"></p>
    <div class="acesso-botoes">
      ${CONTAS_DEMO.map(
        (c, i) => `
        <button type="button" class="acesso-btn" data-conta="${i}">
          <span class="acesso-icone acesso-icone--${c.tipo}">${ICONES_PERFIL[c.tipo]}</span>
          <span class="acesso-texto"><span>${c.rotulo}</span><small>${c.detalhe}</small></span>
          <svg class="acesso-seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>`,
      ).join('')}
    </div>
  `;
  area.appendChild(secao);

  secao.querySelectorAll<HTMLButtonElement>('button[data-conta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const conta = CONTAS_DEMO[Number(btn.dataset.conta)];
      secao.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = true));
      void autenticar(conta.email, conta.senha, 500).catch(() => {
        secao.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = false));
      });
    });
  });
}

iniciarAcessoRapido();
