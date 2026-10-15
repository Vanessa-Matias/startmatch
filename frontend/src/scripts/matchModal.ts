// Modal "É um match!" — usado nas telas de perfil quando o interesse vira match.
// =============================================================================
//
// Aparece logo depois do clique em "Tenho interesse", quando o outro lado já
// tinha demonstrado interesse e a API criou o match. Traz o botão para a aba
// Matches. Os estilos vão junto (injetados uma vez), então basta importar.

const STYLE_ID = 'match-modal-css';

const CSS = `
  .match-modal { text-align: center; }
  .match-modal-avatars {
    display: flex; align-items: center; justify-content: center;
    gap: 14px; margin: 6px 0 14px;
  }
  .match-modal-avatars .match-avatar {
    width: 64px; height: 64px; min-width: 64px; border-radius: 50%;
    display: grid; place-items: center; font-size: 1.2rem; font-weight: 700;
    color: #fff; background: #2f6feb;
    box-shadow: 0 0 0 3px rgba(47, 111, 235, 0.25);
  }
  .match-modal-avatars .match-avatar--b {
    background: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25);
  }
  .match-modal-heart { font-size: 1.6rem; color: #2f6feb; }
  .match-modal h2 {
    margin: 0 0 6px;
    background: linear-gradient(90deg, #2f6feb, #16a34a);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .match-modal .modal-footer { justify-content: center; flex-wrap: wrap; }
  .match-modal { animation: match-modal-pop 0.45s ease; }
  @keyframes match-modal-pop {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) { .match-modal { animation: none; } }
`;

export interface MatchModalDados {
  iniciaisVoce: string;
  iniciaisOutro: string;
  nomeOutro: string;
  score: number;
  /** Destino do botão principal (aba Matches). */
  hrefMatches: string;
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

export function abrirModalMatch(dados: MatchModalDados): void {
  garantirEstilo();
  document.querySelector('[data-match-modal]')?.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('data-match-modal', '');
  backdrop.innerHTML = `
    <div class="modal match-modal" role="dialog" aria-modal="true" aria-labelledby="match-modal-titulo">
      <div class="match-modal-avatars" aria-hidden="true">
        <span class="match-avatar">${escapeHtml(dados.iniciaisVoce)}</span>
        <span class="match-modal-heart">♥</span>
        <span class="match-avatar match-avatar--b">${escapeHtml(dados.iniciaisOutro)}</span>
      </div>
      <h2 id="match-modal-titulo">É um match!</h2>
      <p class="text-muted">
        Você e <strong>${escapeHtml(dados.nomeOutro)}</strong> demonstraram
        interesse um no outro. Compatibilidade de
        <strong>${dados.score} pts</strong>.
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
