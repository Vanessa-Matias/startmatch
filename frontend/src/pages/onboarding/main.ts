// Tela: Onboarding — lógica
// ==========================
// Escuta o clique nos 3 botões de escolha de tipo de usuário. Quando um é clicado:
//   1. Salva o tipo escolhido (startup/investidor/mentor) no sessionStorage — um
//      "cofre" temporário do navegador que se apaga quando a aba fecha (diferente do
//      localStorage usado para a sessão de login, que é permanente).
//   2. Redireciona para a tela de cadastro, que lê esse valor salvo para saber que
//      tipo de conta está criando.
//
// (Também liga o fundo animado de "rede de pontos" do painel de marca — puramente
// decorativo, ver scripts/particleNetwork.ts.)

import type { TipoUsuario } from '../../scripts/types';
import { initParticleNetwork } from '../../scripts/particleNetwork';

const particleCanvas = document.getElementById('particle-bg');
if (particleCanvas instanceof HTMLCanvasElement) {
  initParticleNetwork(particleCanvas);
}

const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-tipo]');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const tipo = button.dataset.tipo as TipoUsuario;
    sessionStorage.setItem('sc_tipo_escolhido', tipo);
    window.location.href = '../cadastro/index.html';
  });
});
