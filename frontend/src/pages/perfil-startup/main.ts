// Tela: Perfil público da startup
// ================================
// Visto pelo investidor (e por outras startups). Mostra logo, biografia, o que a
// startup busca, o selo do LinkedIn da pessoa fundadora e — nos planos Plus e
// Premium — o vídeo de pitch de 5 minutos. O vídeo é só VISUAL (não existe arquivo
// de verdade) e tudo que é extra (bio, logo, LinkedIn) fica no navegador
// (scripts/perfilExtra.ts). "?demo=<slug>" abre uma startup fictícia.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { abrirModalMatch, iniciais } from '../../scripts/matchModal';
import { escapeHtml } from '../../scripts/investidor';
import { avatarImg, avatarSrc } from '../../scripts/avatars';
import { demoStartup } from '../../scripts/demoData';
import { carregarMeuPerfil } from '../../scripts/meuPerfil';
import {
  ESTAGIO_LABEL,
  dinheiro,
  extraStartup,
  planoEfetivo,
  planoPago,
} from '../../scripts/perfilExtra';
import {
  iniciarPitch,
  pitchBloqueadoHtml,
  pitchPlayerHtml,
  seloDemo,
  seloLinkedin,
  seloPlano,
  seloVerificado,
  rosetaVerificada,
} from '../../scripts/perfilUi';
import type { Match, Startup } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);

renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const slugDemo = params.get('demo');

const detalheEl = document.getElementById('perfil-detalhe') as HTMLDivElement;
const btnInteresse = document.getElementById('btn-interesse') as HTMLButtonElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;

let startupAtual: Startup | null = null;

if (!id && !slugDemo) {
  detalheEl.innerHTML = `<p class="form-error">Perfil da startup inválido.</p>`;
  btnInteresse.hidden = true;
  throw new Error('ID da startup não informado.');
}

function renderStartup(startup: Startup, ehDemo: boolean, ehMeu: boolean): void {
  const extra = extraStartup(startup);
  const demo = slugDemo ? demoStartup(slugDemo) : undefined;
  const nome = extra.nome || startup.nomeFantasia;
  const plano = ehMeu ? planoEfetivo('startup', startup.planoAssinatura) : startup.planoAssinatura;
  const logo = avatarImg(nome, { tipo: 'startup', cor: extra.logoCor ?? undefined, tamanho: 112 });
  const segmentos = (startup.segmentos ?? [])
    .map((s) => `<span class="badge">${escapeHtml(s.nome)}${s.principal ? ' ★' : ''}</span>`)
    .join('');
  const fundador = extra.fundador || demo?.fundador || '';

  let pitch = '';
  if (planoPago(plano)) {
    pitch = pitchPlayerHtml(extra.pitchTitulo);
  } else if (ehMeu) {
    pitch = pitchBloqueadoHtml('Disponível nos planos Plus e Premium. Faça upgrade para mostrar seu pitch de 5 minutos aos investidores.');
  }

  detalheEl.innerHTML = `
    <div class="hero-perfil">
      ${logo}
      <div class="hero-perfil-info">
        <h1>${escapeHtml(nome)}${plano === 'premium' ? rosetaVerificada() : ''}</h1>
        <p class="sub">${escapeHtml(startup.cidade)}/${escapeHtml(startup.uf)} · ${ESTAGIO_LABEL[startup.estagio] ?? startup.estagio}</p>
        <div class="selos">
          ${plano === 'premium' ? seloVerificado('Startup verificada') : ''}
          ${fundador ? seloLinkedin(extra.linkedin, `LinkedIn de ${fundador.split(' ')[0]}`) : seloLinkedin(extra.linkedin)}
          ${seloPlano(plano)}
          ${ehDemo ? seloDemo() : ''}
        </div>
      </div>
    </div>

    <div class="perfil-grade">
      <div>
        ${pitch ? `<section class="perfil-bloco"><h2>Pitch de 5 minutos</h2>${pitch}</section>` : ''}

        <section class="perfil-bloco">
          <h2>Sobre a startup</h2>
          <p>${escapeHtml(startup.descricao)}</p>
          <p style="margin-top:10px">${escapeHtml(extra.bio)}</p>
        </section>

        <section class="perfil-bloco">
          <h2>Segmentos</h2>
          <div class="chips">${segmentos}</div>
        </section>
      </div>

      <aside>
        <section class="perfil-bloco">
          <h2>Investimento pretendido</h2>
          <p><strong>${dinheiro(Number(startup.investimentoPretendido))}</strong></p>
        </section>

        ${
          fundador
            ? `<section class="perfil-bloco">
                <h2>Fundação</h2>
                <div style="display:flex;align-items:center;gap:12px">
                  ${avatarImg(fundador, { genero: extra.generoFundador, foto: extra.fotoFundador, tamanho: 52 })}
                  <div><strong>${escapeHtml(fundador)}</strong><br /><span class="text-muted">Fundação e liderança</span></div>
                </div>
              </section>`
            : ''
        }

        <section class="perfil-bloco" id="acoes-slot"></section>
      </aside>
    </div>
  `;

  iniciarPitch(detalheEl);
  const slot = document.getElementById('acoes-slot') as HTMLElement;
  slot.append(btnInteresse, errorEl);
}

function marcarInteresseRegistrado(): void {
  btnInteresse.disabled = true;
  btnInteresse.textContent = 'Interesse registrado';
}

async function carregarPerfil(): Promise<void> {
  try {
    const demo = slugDemo ? demoStartup(slugDemo) : undefined;
    if (slugDemo && !demo) throw new ApiError(404, 'Startup de demonstração não encontrada.');

    const startup = demo ?? (await api.get<Startup>(`/startups/${id}`));
    startupAtual = startup;

    // é a minha própria startup? (para respeitar o plano simulado na demonstração)
    let ehMeu = false;
    if (usuario.tipo === 'startup' && !demo) {
      const meu = await carregarMeuPerfil(usuario);
      ehMeu = meu.startup?.id === startup.id;
    }
    renderStartup(startup, Boolean(demo), ehMeu);

    // Apenas investidores podem demonstrar interesse em uma startup.
    if (usuario.tipo !== 'investidor') btnInteresse.hidden = true;
  } catch (error) {
    detalheEl.innerHTML = `
      <p class="form-error">
        ${error instanceof ApiError ? error.message : 'Erro ao carregar perfil da startup.'}
      </p>
    `;
    btnInteresse.hidden = true;
  }
}

async function abrirMatch(score: number, simulado: boolean): Promise<void> {
  const meu = await carregarMeuPerfil(usuario);
  const extra = startupAtual ? extraStartup(startupAtual) : null;
  const nome = extra?.nome ?? startupAtual?.nomeFantasia ?? 'a startup';
  abrirModalMatch({
    iniciaisVoce: iniciais(meu.nome),
    iniciaisOutro: iniciais(nome),
    nomeOutro: nome,
    score,
    hrefMatches: '../matches/index.html',
    imgVoce: meu.img,
    imgOutro: avatarSrc(nome, { tipo: 'startup', cor: extra?.logoCor ?? undefined }),
    simulado,
  });
}

/*
 * Depois do interesse, confere se o outro lado já tinha demonstrado
 * interesse: nesse caso a API criou o match e mostramos o "É um match!".
 */
async function avisarSeDeuMatch(): Promise<void> {
  try {
    const matches = await api.get<Match[]>('/matches');
    const match = matches.find((m) => m.startupId === Number(id));
    if (!match) return;
    await abrirMatch(match.scoreCompatibilidade, false);
  } catch {
    // O interesse já foi salvo; se a checagem falhar, o match continua
    // disponível na aba Matches.
  }
}

btnInteresse.addEventListener('click', async () => {
  errorEl.textContent = '';

  // Startup de demonstração: não existe no banco. O interesse é "retribuído" na
  // hora, só para mostrar a animação de match na apresentação.
  if (slugDemo) {
    marcarInteresseRegistrado();
    window.setTimeout(() => void abrirMatch(86, true), 700);
    return;
  }

  try {
    await api.post('/interests', { contraparteId: Number(id) });
    marcarInteresseRegistrado();
    await avisarSeDeuMatch();
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      marcarInteresseRegistrado();
      return;
    }
    errorEl.textContent =
      error instanceof ApiError ? error.message : 'Erro ao registrar interesse.';
  }
});

void carregarPerfil();
