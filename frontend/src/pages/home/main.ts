// Tela: Home — lógica
// =====================
//
// Página pública do StartMatch.
// Não faz chamadas à API e não exige autenticação.
//
// Responsabilidade:
// Inicializar o fundo animado de partículas do Hero.

import { initParticleNetwork } from '../../scripts/particleNetwork';

function iniciarParticulas(): void {
  const canvas = document.getElementById('particle-bg');

  if (!(canvas instanceof HTMLCanvasElement)) {
    console.warn('Canvas #particle-bg não encontrado.');
    return;
  }

  try {
    initParticleNetwork(canvas);
  } catch (erro) {
    console.error(
      'Não foi possível iniciar a animação de partículas:',
      erro
    );
  }
}

// Garante que o canvas exista antes de iniciar a animação.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarParticulas);
} else {
  iniciarParticulas();
}