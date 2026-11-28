// Modal "É um match!" — usado nas telas de perfil quando o interesse vira match.
// =============================================================================
//
// Aparece logo depois do clique em "Tenho interesse", quando o outro lado já
// tinha demonstrado interesse e a API criou o match. Traz o botão para a aba
// Matches. Os estilos vão junto (injetados uma vez), então basta importar.
//
// Animação (só CSS + alguns <span> criados aqui): as duas fotos entram dos lados,
// um coração em degradê verde/azul "pulsa" no centro e faíscas saem dele.
// Quem prefere menos movimento (prefers-reduced-motion) vê tudo parado.

const STYLE_ID = 'match-modal-css';

const CSS = `
  .match-modal { text-align: center; overflow: hidden; position: relative; }
  .match-palco {
    position: relative; height: 150px; margin: 4px 0 8px;
    display: flex; align-items: center; justify-content: center; gap: 0;
  }
  .match-palco .mm-foto {
    position: relative; z-index: 2;
    width: 84px; height: 84px; border-radius: 50%; overflow: hidden;
    display: grid; place-items: center;
    font-size: 1.5rem; font-weight: 700; color: #fff;
    border: 4px solid #fff;
  }
  .match-palco .mm-foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .match-palco .mm-foto--a {
    background: #2f6feb; box-shadow: 0 0 0 3px rgba(47, 111, 235, 0.4), 0 10px 24px -8px rgba(47, 111, 235, 0.6);
    animation: mm-entra-esq 0.7s cubic-bezier(.2,.9,.3,1.2) both;
  }
  .match-palco .mm-foto--b {
    background: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.4), 0 10px 24px -8px rgba(22, 163, 74, 0.6);
    animation: mm-entra-dir 0.7s cubic-bezier(.2,.9,.3,1.2) both;
  }
  .mm-coracao {
    position: relative; z-index: 3; width: 76px; height: 76px; margin: 0 -14px;
    animation: mm-pop 0.6s 0.55s cubic-bezier(.2,1.6,.4,1) both, mm-batida 1.3s 1.2s ease-in-out infinite;
    filter: drop-shadow(0 6px 14px rgba(22, 163, 74, 0.45));
  }
  .mm-coracao svg { width: 100%; height: 100%; display: block; }
  .mm-anel {
    position: absolute; left: 50%; top: 50%; width: 70px; height: 70px;
    margin: -35px 0 0 -35px; border-radius: 50%; z-index: 1;
    border: 3px solid rgba(34, 197, 94, 0.55);
    opacity: 0; animation: mm-onda 1.8s 0.7s ease-out infinite;
  }
  .mm-anel--2 { border-color: rgba(47, 111, 235, 0.5); animation-delay: 1.3s; }
  .mm-faisca {
    position: absolute; left: 50%; top: 50%; z-index: 4; pointer-events: none;
    width: var(--s, 12px); height: var(--s, 12px); margin: calc(var(--s, 12px) / -2) 0 0 calc(var(--s, 12px) / -2);
    color: var(--c, #2f6feb); opacity: 0;
    animation: mm-faisca 1.5s var(--d, 0.7s) ease-out both;
  }
  .mm-faisca svg { width: 100%; height: 100%; display: block; }
  .match-modal h2 {
    margin: 0 0 6px; font-size: 1.9rem;
    background: linear-gradient(90deg, #2f6feb, #16a34a);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    animation: mm-titulo 0.5s 0.8s ease both;
  }
  .match-modal p { animation: mm-titulo 0.5s 1s ease both; }
  .match-modal .modal-footer { justify-content: center; flex-wrap: wrap; animation: mm-titulo 0.5s 1.15s ease both; }
  .match-modal .mm-sim { display: inline-block; margin-top: 4px; font-size: 0.72rem; color: #9a5b00; background: #fff4e5; border-radius: 999px; padding: 2px 10px; }
  @keyframes mm-entra-esq { from { opacity: 0; transform: translateX(-90px) scale(0.7); } to { opacity: 1; transform: none; } }
  @keyframes mm-entra-dir { from { opacity: 0; transform: translateX(90px) scale(0.7); } to { opacity: 1; transform: none; } }
  @keyframes mm-pop { from { opacity: 0; transform: scale(0) rotate(-20deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
  @keyframes mm-batida { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.18); } 30% { transform: scale(1); } 45% { transform: scale(1.12); } 60% { transform: scale(1); } }
  @keyframes mm-onda { 0% { opacity: 0.9; transform: scale(0.6); } 100% { opacity: 0; transform: scale(2.8); } }
  @keyframes mm-faisca {
    0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0); }
    15% { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.1) rotate(var(--r, 90deg)); }
  }
  @keyframes mm-titulo { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  .match-modal { animation: match-modal-pop 0.45s ease; }
  @keyframes match-modal-pop {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
  }
  @media (max-width: 420px) {
    .match-palco { height: 130px; }
    .match-palco .mm-foto { width: 70px; height: 70px; }
    .mm-coracao { width: 62px; height: 62px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .match-modal, .match-palco .mm-foto--a, .match-palco .mm-foto--b, .mm-coracao,
    .mm-anel, .mm-faisca, .match-modal h2, .match-modal p, .match-modal .modal-footer { animation: none !important; }
    .mm-faisca, .mm-anel { display: none; }
  }
`;

export interface MatchModalDados {
  iniciaisVoce: string;
  iniciaisOutro: string;
  nomeOutro: string;
  score: number;
  /** Destino do botão principal (aba Matches). */
  hrefMatches: string;
  /** Imagens (avatar/logo) das duas pontas; sem elas, mostra as iniciais. */
  imgVoce?: string;
  imgOutro?: string;
  /** true = match de demonstração (mostra o aviso "simulação"). */
  simulado?: boolean;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'SM';
  return partes
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function garantirEstilo(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

const HEART_SVG = `
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="mm-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2f6feb" /><stop offset="1" stop-color="#22c55e" />
      </linearGradient>
    </defs>
    <path d="M32 56 C10 40 4 29 4 20 C4 12 10 6 18 6 C24 6 29 9 32 14 C35 9 40 6 46 6 C54 6 60 12 60 20 C60 29 54 40 32 56 Z" fill="url(#mm-grad)" />
    <path d="M16 18 C17 14 21 12 24 13" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round" />
  </svg>`;

const ESTRELA_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z"/></svg>';
const MINI_CORACAO_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21 C4 15 2 11 2 8 C2 5 4 3 7 3 C9 3 11 4 12 6 C13 4 15 3 17 3 C20 3 22 5 22 8 C22 11 20 15 12 21 Z"/></svg>';

/** Faíscas (estrelas e mini-corações) que saem do coração, em direções aleatórias. */
function faiscasHtml(): string {
  const cores = ['#2f6feb', '#22c55e', '#16a34a', '#60a5fa', '#86efac'];
  const itens: string[] = [];
  const total = 18;
  for (let i = 0; i < total; i += 1) {
    const angulo = (Math.PI * 2 * i) / total + Math.random() * 0.4;
    const raio = 70 + Math.random() * 70;
    const dx = Math.cos(angulo) * raio;
    const dy = Math.sin(angulo) * raio * 0.75;
    const tamanho = 8 + Math.random() * 12;
    const atraso = 0.6 + Math.random() * 0.5;
    const cor = cores[i % cores.length];
    const icone = i % 3 === 0 ? MINI_CORACAO_SVG : ESTRELA_SVG;
    itens.push(
      `<span class="mm-faisca" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--s:${tamanho.toFixed(0)}px;--d:${atraso.toFixed(2)}s;--c:${cor};--r:${(Math.random() * 180 - 90).toFixed(0)}deg">${icone}</span>`,
    );
  }
  return itens.join('');
}

function fotoHtml(classe: string, img: string | undefined, iniciaisTexto: string): string {
  const conteudo = img
    ? `<img src="${escapeHtml(img)}" alt="" />`
    : escapeHtml(iniciaisTexto);
  return `<span class="mm-foto ${classe}">${conteudo}</span>`;
}

export function abrirModalMatch(dados: MatchModalDados): void {
  garantirEstilo();
  document.querySelector('[data-match-modal]')?.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('data-match-modal', '');
  backdrop.innerHTML = `
    <div class="modal match-modal" role="dialog" aria-modal="true" aria-labelledby="match-modal-titulo">
      <div class="match-palco" aria-hidden="true">
        <span class="mm-anel"></span><span class="mm-anel mm-anel--2"></span>
        ${fotoHtml('mm-foto--a', dados.imgVoce, dados.iniciaisVoce)}
        <span class="mm-coracao">${HEART_SVG}</span>
        ${fotoHtml('mm-foto--b', dados.imgOutro, dados.iniciaisOutro)}
        ${faiscasHtml()}
      </div>
      <h2 id="match-modal-titulo">É um match!</h2>
      <p class="text-muted">
        Você e <strong>${escapeHtml(dados.nomeOutro)}</strong> demonstraram
        interesse um no outro. Compatibilidade de
        <strong>${dados.score} pts</strong>.
        ${dados.simulado ? '<br /><span class="mm-sim">simulação para a apresentação</span>' : ''}
      </p>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" data-fechar>Continuar explorando</button>
        <a class="btn btn-primary" href="${escapeHtml(dados.hrefMatches)}">Ver meus matches</a>
      </div>
    </div>
  `;

  const fechar = (): void => {
    backdrop.remove();
    document.removeEventListener('keydown', aoTeclar);
  };
  const aoTeclar = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') fechar();
  };

  backdrop.addEventListener('click', (event) => {
    const alvo = event.target as HTMLElement;
    if (alvo === backdrop || alvo.closest('[data-fechar]')) fechar();
  });
  document.addEventListener('keydown', aoTeclar);

  document.body.appendChild(backdrop);
  (backdrop.querySelector('[data-fechar]') as HTMLButtonElement).focus();
}
