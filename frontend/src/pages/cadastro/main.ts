// Tela: Cadastro (conta de login) — lógica
// ==========================================
// 1. Lê o tipo de usuário escolhido no onboarding (salvo em sessionStorage). Se não
//    achar nada (ex.: usuário digitou a URL direto sem passar pelo onboarding),
//    manda de volta para lá.
// 2. Ao enviar o formulário: cria a conta via register() (scripts/auth.ts) e, se
//    der certo, registra o consentimento LGPD (termos de uso + política de
//    privacidade) — obrigatório por lei, já que o checkbox era required.
// 3. Redireciona para a tela de cadastro do PERFIL específico daquele tipo
//    (cadastro-startup / cadastro-investidor / cadastro-mentor).
//
// (Também liga o fundo animado de "rede de pontos" do painel de marca — puramente
// decorativo, ver scripts/particleNetwork.ts.)

import { api, ApiError } from '../../scripts/api';
import { register } from '../../scripts/auth';
import { initParticleNetwork } from '../../scripts/particleNetwork';
import { initPasswordToggles } from '../../scripts/passwordToggle';
import type { TipoUsuario } from '../../scripts/types';

// olhinho de mostrar/ocultar senha
initPasswordToggles();

const particleCanvas = document.getElementById('particle-bg');
if (particleCanvas instanceof HTMLCanvasElement) {
  initParticleNetwork(particleCanvas);
}

const tipo = sessionStorage.getItem('sc_tipo_escolhido') as TipoUsuario | null;

if (!tipo) {
  window.location.href = '../onboarding/index.html';
  throw new Error('Papel não escolhido — redirecionando para o onboarding.');
}

// Texto mostrado acima do formulário, confirmando qual tipo de conta está sendo criada.
const TIPO_LABEL: Record<TipoUsuario, string> = {
  startup: 'Criando conta como Startup.',
  investidor: 'Criando conta como Investidor.',
  mentor: 'Criando conta como Mentor.',
  admin: 'Criando conta.',
};

// Próxima tela depois que a conta de login é criada — o cadastro do PERFIL de negócio.
const CADASTRO_PERFIL_PATH: Record<TipoUsuario, string> = {
  startup: '../cadastro-startup/index.html',
  investidor: '../cadastro-investidor/index.html',
  mentor: '../cadastro-mentor/index.html',
  admin: '../dashboard-admin/index.html', // admin não se autocadastra pelo site público (ver tela onboarding)
};

const descricaoEl = document.getElementById('tipo-descricao') as HTMLParagraphElement;
descricaoEl.textContent = TIPO_LABEL[tipo];

const form = document.getElementById('form-cadastro') as HTMLFormElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;

// Versão do documento de termos/privacidade aceito — se o texto legal mudar no
// futuro, incrementar esse número ajuda a saber quem aceitou qual versão.
const VERSAO_DOCUMENTO = '1.0';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';

  const formData = new FormData(form);
  const nome = String(formData.get('nome') ?? '');
  const email = String(formData.get('email') ?? '');
  const senha = String(formData.get('senha') ?? '');

  try {
    await register(nome, email, senha, tipo);

    // Registra os dois consentimentos LGPD em paralelo (não precisa esperar um
    // terminar para começar o outro).
    await Promise.all([
      api.post('/lgpd/consent', {
        tipoConsentimento: 'termos_uso',
        aceito: true,
        versaoDocumento: VERSAO_DOCUMENTO,
      }),
      api.post('/lgpd/consent', {
        tipoConsentimento: 'privacidade',
        aceito: true,
        versaoDocumento: VERSAO_DOCUMENTO,
      }),
    ]);

    sessionStorage.removeItem('sc_tipo_escolhido');
    window.location.href = CADASTRO_PERFIL_PATH[tipo];
  } catch (error) {
    errorEl.textContent = error instanceof ApiError ? error.message : 'Erro ao criar conta.';
  }
});
