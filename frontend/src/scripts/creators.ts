// src/scripts/creators.ts
//
// "Quem criou o StartMatch" (menu das páginas públicas): ao clicar no nome
// de uma pessoa, abre uma janela com foto, especialidade, o que ela fez no
// projeto e o link para o LinkedIn. Sem JS, o nome continua sendo um link
// direto para o LinkedIn.
//
// Todo texto entra por textContent (nunca innerHTML com dados).

interface Criadora {
  nome: string;
  especialidade: string;
  foto?: string; // sem foto, mostra as iniciais
  efeito?: boolean; // anel tecnológico animado em volta da foto
  linkedin: string;
  fez: string[];
}

const CRIADORAS: Record<string, Criadora> = {
  agnes: {
    nome: 'Agnes Letícia',
    especialidade: 'Desenvolvimento web/mobile',
    efeito: true,
    foto: '/imagens/equipe/agnes.jpg',
    linkedin: 'https://www.linkedin.com/in/agneslribeiro/',
    fez: [
      'Criação do front-end',
      'Estilização do front-end, nas versões web e mobile',
      'Apoio ao design das versões web e mobile',
      'Testes de qualidade (QA)',
    ],
  },
  vanessa: {
    nome: 'Vanessa Matias',
    especialidade: 'Engenharia de Dados',
    efeito: true,
    foto: '/imagens/equipe/vanessa.jpg',
    linkedin: 'https://www.linkedin.com/in/vanessamatiasdev/',
    fez: [
      'Criação do back-end',
      'Criação do front-end',
      'Estilização do front-end, nas versões web e mobile',
      'Implementação da IA',
      'Deploys e controle de versão no Git',
    ],
  },
  wedja: {
    nome: 'Wedja Souza',
    especialidade: 'UX/UI',
    efeito: true,
    foto: '/imagens/equipe/wedja.jpg',
    linkedin: 'https://www.linkedin.com/in/wedja-sousa-43639b19b/',
    fez: [
      'Gestão do projeto: controle das datas de entrega e divisão das tarefas',
      'Design no Figma e das versões web e mobile',
      'Protótipos no Figma',
      'Organização das tarefas no Trello',
      'Criação dos slides e apoio à apresentação',
    ],
  },
};

function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function criarJanela(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'creator-modal';
  dialog.setAttribute('aria-labelledby', 'creator-modal-nome');
  dialog.innerHTML = `
    <button type="button" class="creator-modal-close" aria-label="Fechar">&times;</button>
    <div class="creator-modal-avatar-wrap">
      <span class="avatar-orbit" aria-hidden="true"></span>
      <span class="avatar-orbit avatar-orbit--2" aria-hidden="true"></span>
      <div class="creator-modal-avatar"></div>
    </div>
    <h2 class="creator-modal-nome" id="creator-modal-nome"></h2>
    <span class="section-eyebrow blue creator-modal-especialidade"></span>
    <p class="creator-modal-subtitulo">O que fez no projeto</p>
    <ul class="creator-modal-lista"></ul>
    <a class="btn-pill creator-modal-linkedin" target="_blank" rel="noopener noreferrer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
      Ver no LinkedIn
    </a>
  `;

  dialog
    .querySelector('.creator-modal-close')!
    .addEventListener('click', () => dialog.close());

  // fecha ao clicar fora do cartão (no fundo escurecido)
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.body.appendChild(dialog);
  return dialog;
}

function preencher(dialog: HTMLDialogElement, pessoa: Criadora): void {
  const avatar = dialog.querySelector<HTMLElement>('.creator-modal-avatar')!;
  dialog
    .querySelector('.creator-modal-avatar-wrap')!
    .classList.toggle('is-tech', Boolean(pessoa.efeito));
  avatar.replaceChildren();
  if (pessoa.foto) {
    const img = document.createElement('img');
    img.src = pessoa.foto;
    img.alt = `Foto de ${pessoa.nome}`;
    img.width = 112;
    img.height = 112;
    avatar.appendChild(img);
  } else {
    avatar.textContent = iniciais(pessoa.nome);
  }

  dialog.querySelector('.creator-modal-nome')!.textContent = pessoa.nome;
  dialog.querySelector('.creator-modal-especialidade')!.textContent =
    pessoa.especialidade;

  const lista = dialog.querySelector('.creator-modal-lista')!;
  lista.replaceChildren(
    ...pessoa.fez.map((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }),
  );

  dialog
    .querySelector<HTMLAnchorElement>('.creator-modal-linkedin')!
    .setAttribute('href', pessoa.linkedin);
}

export function initCreators(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    '.nav-creator[data-creator]',
  );
  if (!links.length) return;

  let dialog: HTMLDialogElement | null = null;

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const pessoa = CRIADORAS[link.dataset.creator ?? ''];
      if (!pessoa || typeof HTMLDialogElement === 'undefined') return;

      event.preventDefault();
      event.stopPropagation();

      // fecha o menu suspenso antes de abrir a janela (o painel do celular
      // já fecha sozinho ao clicar num link, em publicNav.ts)
      const details = link.closest('details');
      if (details) details.open = false;

      dialog ??= criarJanela();
      preencher(dialog, pessoa);
      dialog.showModal();
    });
  });
}
