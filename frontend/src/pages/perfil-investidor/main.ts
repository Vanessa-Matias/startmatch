// Tela: Perfil público do investidor
// ===================================
// Visto pela startup (e por outros investidores). No estilo do perfil do mentor:
// foto, selo "verificado", selo do LinkedIn, biografia, o que procura, faixa de
// investimento e contatos. Os contatos só aparecem se (1) o investidor concordou em
// mostrá-los (LGPD) e (2) a startup que está olhando tem plano Plus ou Premium.
//
// Biografia, foto, LinkedIn e contatos são dados de demonstração guardados no
// navegador (scripts/perfilExtra.ts). "?demo=<slug>" abre um investidor fictício
// (scripts/demoData.ts), usado nas conversas e matches de exemplo.

import { api, ApiError } from '../../scripts/api';
import { requireAuth } from '../../scripts/auth';
import { renderNav } from '../../scripts/nav';
import { abrirModalMatch, iniciais } from '../../scripts/matchModal';
import { TIPO_INVESTIDOR_LABEL, escapeHtml } from '../../scripts/investidor';
import { avatarImg, avatarSrc } from '../../scripts/avatars';
import { demoInvestidor } from '../../scripts/demoData';
import { carregarMeuPerfil } from '../../scripts/meuPerfil';
import {
  ESTAGIO_LABEL,
  dinheiro,
  extraInvestidor,
  planoPago,
} from '../../scripts/perfilExtra';
import { blocoContatos, rosetaVerificada, seloDemo, seloLinkedin, seloPlano, seloVerificado } from '../../scripts/perfilUi';
import type { Investidor, Match, PlanoAssinatura } from '../../scripts/types';

const usuario = requireAuth(['startup', 'investidor']);

renderNav(document.getElementById('nav-links') as HTMLElement, usuario.tipo);

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const slugDemo = params.get('demo');

const detalheEl = document.getElementById('perfil-detalhe') as HTMLDivElement;
const btnInteresse = document.getElementById('btn-interesse') as HTMLButtonElement;
const errorEl = document.getElementById('form-error') as HTMLParagraphElement;

let investidorAtual: Investidor | null = null;

if (!id && !slugDemo) {
  detalheEl.innerHTML = `<p class="form-error">Perfil do investidor inválido.</p>`;
  btnInteresse.hidden = true;
  throw new Error('ID do investidor não informado.');
}

function renderInvestidor(investidor: Investidor, planoDoVisitante: PlanoAssinatura, ehDemo: boolean): void {
  const extra = extraInvestidor(investidor);
  const nome = extra.nome || TIPO_INVESTIDOR_LABEL[investidor.tipo];
  const demo = slugDemo ? demoInvestidor(slugDemo) : undefined;
  const imagem = avatarImg(nome, {
    genero: extra.genero,
    foto: extra.foto,
    tamanho: 112,
    tipo: demo?.grupo ? 'startup' : 'pessoa',
  });
  const ehStartupPaga = usuario.tipo === 'startup' && planoPago(planoDoVisitante);
  const segmentos = (investidor.segmentos ?? []).map((s) => `<span class="badge">${escapeHtml(s.nome)}</span>`).join('');
  const estagios = extra.estagios.map((e) => `<span class="badge">${ESTAGIO_LABEL[e]}</span>`).join('');

  detalheEl.innerHTML = `
    <div class="hero-perfil">
      ${imagem}
      <div class="hero-perfil-info">
        <h1>${escapeHtml(nome)}${extra.verificado ? rosetaVerificada() : ''}</h1>
        <p class="sub">${TIPO_INVESTIDOR_LABEL[investidor.tipo]} · ${escapeHtml(investidor.cidade)}/${escapeHtml(investidor.uf)}</p>
        <div class="selos">
          ${extra.verificado ? seloVerificado() : ''}
          ${seloLinkedin(extra.linkedin)}
          ${seloPlano(extra.plano)}
          ${ehDemo ? seloDemo() : ''}
        </div>
      </div>
    </div>

    <div class="perfil-grade">
      <div>
        <section class="perfil-bloco">
          <h2>Sobre</h2>
          <p>${escapeHtml(extra.bio)}</p>
        </section>

        <section class="perfil-bloco">
          <h2>O que procura</h2>
          <p>${escapeHtml(extra.procura)}</p>
          <div class="chips">${estagios}</div>
        </section>

        <section class="perfil-bloco">
          <h2>Tese de investimento</h2>
          <p>${escapeHtml(investidor.teseInvestimento)}</p>
        </section>

        <section class="perfil-bloco">
          <h2>Segmentos de interesse</h2>
          <div class="chips">${segmentos}</div>
        </section>
      </div>

      <aside>
        <section class="perfil-bloco">
          <h2>Faixa de investimento</h2>
          <p><strong>${dinheiro(extra.ticketMin)}</strong> a <strong>${dinheiro(extra.ticketMax)}</strong></p>
        </section>

        <section class="perfil-bloco">
          <h2>Contatos</h2>
          ${blocoContatos({
            contato: { telefone: extra.telefone, email: extra.email },
            consentiu: extra.mostrarContatos,
            podeVer: ehStartupPaga || usuario.tipo === 'investidor',
            quem: nome,
            hrefPlanos: '../plano/index.html',
          })}
        </section>

        <section class="perfil-bloco" id="acoes-slot"></section>
      </aside>
    </div>
  `;

  // o botão "Tenho interesse" (que já existe na página) vai para a coluna lateral
  const slot = document.getElementById('acoes-slot') as HTMLElement;
  slot.append(btnInteresse, errorEl);
}

function marcarInteresseRegistrado(): void {
  btnInteresse.disabled = true;
  btnInteresse.textContent = 'Interesse registrado';
}

async function carregarPerfil(): Promise<void> {
  try {
    const demo = slugDemo ? demoInvestidor(slugDemo) : undefined;
    if (slugDemo && !demo) throw new ApiError(404, 'Investidor de demonstração não encontrado.');

    const meu = await carregarMeuPerfil(usuario);
    const investidor = demo ?? (await api.get<Investidor>(`/investors/${id}`));

    investidorAtual = investidor;
    renderInvestidor(investidor, meu.plano, Boolean(demo));

    // Apenas startups podem demonstrar interesse em investidores.
    if (usuario.tipo !== 'startup') btnInteresse.hidden = true;
  } catch (error) {
    detalheEl.innerHTML = `
      <p class="form-error">
        ${error instanceof ApiError ? error.message : 'Erro ao carregar perfil do investidor.'}
      </p>
    `;
    btnInteresse.hidden = true;
  }
}

async function abrirMatch(score: number, simulado: boolean): Promise<void> {
  const meu = await carregarMeuPerfil(usuario);
  const extra = investidorAtual ? extraInvestidor(investidorAtual) : null;
  const nomeOutro =
    extra?.nome ??
    (investidorAtual
      ? `Investidor (${investidorAtual.cidade}/${investidorAtual.uf})`
      : 'o investidor');
  abrirModalMatch({
    iniciaisVoce: iniciais(meu.nome),
    iniciaisOutro: iniciais(nomeOutro),
    nomeOutro,
    score,
    hrefMatches: '../matches/index.html',
    imgVoce: meu.img,
    imgOutro: extra
      ? avatarSrc(nomeOutro, {
          genero: extra.genero,
          foto: extra.foto,
          tipo: slugDemo && demoInvestidor(slugDemo)?.grupo ? 'startup' : 'pessoa',
        })
      : undefined,
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
    const match = matches.find((m) => m.investidorId === Number(id));
    if (!match) return;
    await abrirMatch(match.scoreCompatibilidade, false);
  } catch {
    // O interesse já foi salvo; se a checagem falhar, o match continua
    // disponível na aba Matches.
  }
}

btnInteresse.addEventListener('click', async () => {
  errorEl.textContent = '';

  // Investidor de demonstração: não existe no banco. O interesse é "retribuído"
  // na hora, só para mostrar a animação de match na apresentação.
  if (slugDemo) {
    marcarInteresseRegistrado();
    window.setTimeout(() => void abrirMatch(88, true), 700);
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
