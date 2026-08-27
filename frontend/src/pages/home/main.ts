// Tela: Home — lógica
// =====================
// Página de apresentação pura (marketing) — não busca dados da API nem exige
// login. Os botões de call-to-action são links comuns (<a href>), sem lógica de
// formulário por trás.
//
// A única coisa que este arquivo faz é ligar o fundo animado de "rede de pontos"
// atrás do hero (puramente decorativo — ver scripts/particleNetwork.ts).

import { initParticleNetwork } from '../../scripts/particleNetwork';

const canvas = document.getElementById('particle-bg');
if (canvas instanceof HTMLCanvasElement) {
  initParticleNetwork(canvas);
}
