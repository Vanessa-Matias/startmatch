// src/scripts/particleNetwork.ts
// =================================
// Fundo animado de "rede de pontos conectados" usado atrás do hero (Home, Login).
// Puramente decorativo — desenha em um <canvas> pontos que se movem devagar e
// linhas entre os que estão perto, dando a sensação de "tecnologia/rede" sem
// depender de nenhuma biblioteca externa (só Canvas 2D, que já vem no navegador).
//
// Uso típico, no main.ts de uma tela que tem um <canvas id="particle-bg"> dentro
// de um container com position:relative:
//
//   import { initParticleNetwork } from '../../scripts/particleNetwork';
//   const canvas = document.getElementById('particle-bg');
//   if (canvas instanceof HTMLCanvasElement) initParticleNetwork(canvas);
//
// Respeita "prefers-reduced-motion": quem tem essa preferência ativada no sistema
// vê os pontos parados (um quadro só), sem animação.

interface ParticleNetworkOptions {
  /** Cor dos pontos "normais" (sem o ALPHA final, que a função preenche). */
  color?: string;
  /** Cor das linhas entre pontos próximos. */
  lineColor?: string;
  /** Cor de destaque para uma fração dos pontos (dá variedade, ex.: verde). */
  accentColor?: string;
  /** Quanto MAIOR, menos pontos (pontos por pixel² de área do canvas). */
  density?: number;
  /** Distância máxima (px) para desenhar uma linha entre dois pontos. */
  maxLinkDist?: number;
  /** Velocidade de deslocamento dos pontos (px por quadro). */
  speed?: number;
}

const DEFAULTS: Required<ParticleNetworkOptions> = {
  color: 'rgba(129, 168, 255, ALPHA)',
  lineColor: 'rgba(99, 143, 255, ALPHA)',
  accentColor: 'rgba(74, 222, 128, ALPHA)',
  density: 13000,
  maxLinkDist: 130,
  speed: 0.18,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  accent: boolean;
}

/**
 * Liga a animação de rede de pontos num <canvas>. Retorna uma função de limpeza
 * (para parar a animação e remover os listeners, caso a tela seja desmontada).
 */
export function initParticleNetwork(canvas: HTMLCanvasElement, opts: ParticleNetworkOptions = {}): () => void {
  const options = { ...DEFAULTS, ...opts };
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return () => {};
  // Variável separada, já com o tipo sem `null`: evita que o TypeScript reclame
  // dentro de drawFrame()/step() (funções aninhadas não "herdam" a checagem acima).
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let particles: Particle[] = [];
  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let frameId = 0;
  let visible = true;

  // Interatividade com o mouse: pontos perto do cursor são levemente repelidos,
  // dando a sensação de a rede "reagir" a quem passa por cima do hero.
  const mouseRadius = 150;
  let mouseX = -9999;
  let mouseY = -9999;
  // Ouve o mousemove no elemento-pai (o canvas tem pointer-events:none pra não
  // atrapalhar cliques no conteúdo por cima), usando o retângulo do canvas pra
  // converter a posição do cursor em coordenadas do canvas.
  const hoverTarget = canvas.parentElement ?? canvas;

  function handleMouseMove(e: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function handleMouseLeave(): void {
    mouseX = -9999;
    mouseY = -9999;
  }

  function resize(): void {
    const rect = canvas.parentElement?.getBoundingClientRect();
    width = rect?.width ?? canvas.clientWidth;
    height = rect?.height ?? canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(18, Math.min(90, Math.floor((width * height) / options.density)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * options.speed,
      vy: (Math.random() - 0.5) * options.speed,
      accent: Math.random() < 0.22,
    }));
  }

  function drawFrame(): void {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.accent ? 2.4 : 1.7, 0, Math.PI * 2);
      ctx.fillStyle = (p.accent ? options.accentColor : options.color).replace('ALPHA', '0.85');
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < options.maxLinkDist) {
          const alpha = (1 - dist / options.maxLinkDist) * 0.5;
          ctx.strokeStyle = options.lineColor.replace('ALPHA', alpha.toFixed(3));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function step(): void {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0 && dist < mouseRadius) {
        const force = (1 - dist / mouseRadius) * 2.2;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }
    }
    drawFrame();
    if (visible && !reduceMotion) frameId = requestAnimationFrame(step);
  }

  function handleVisibility(): void {
    visible = document.visibilityState === 'visible';
    if (visible && !reduceMotion) {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(step);
    }
  }

  resize();
  drawFrame();
  if (!reduceMotion) frameId = requestAnimationFrame(step);

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', handleVisibility);
  if (!reduceMotion) {
    hoverTarget.addEventListener('mousemove', handleMouseMove);
    hoverTarget.addEventListener('mouseleave', handleMouseLeave);
  }

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', handleVisibility);
    hoverTarget.removeEventListener('mousemove', handleMouseMove);
    hoverTarget.removeEventListener('mouseleave', handleMouseLeave);
  };
}
