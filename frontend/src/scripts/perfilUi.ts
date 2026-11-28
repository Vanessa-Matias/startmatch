// src/scripts/perfilUi.ts
// ========================
// Pedaços de tela reaproveitados pelos perfis (selos, contatos com LGPD, player do pitch).
// Devolvem HTML em texto, para usar dentro de innerHTML. Estilos em styles/perfil.css.

import { escapeHtml } from './investidor';
import { PLANO_LABEL } from './perfilExtra';
import type { PlanoAssinatura } from './types';

const ICONE_CHECK =
  '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clip-rule="evenodd"/></svg>';

const ICONE_LINKEDIN =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.1zM5.3 7.4a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2zm1.8 13H3.6V9h3.5v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>';

/** Roseta azul de "verificado" (mesmo estilo do selo dos mentores), para ao lado do nome. */
export function rosetaVerificada(): string {
  return `<svg class="selo-verificado" viewBox="0 0 24 24" role="img" aria-label="Perfil verificado" style="width:1em;height:1em;vertical-align:-0.12em;margin-left:6px"><title>Perfil verificado</title><path fill="#0095f6" d="M12.00 2.40Q15.26 -0.17 16.80 3.69Q20.91 3.09 20.31 7.20Q24.17 8.74 21.60 12.00Q24.17 15.26 20.31 16.80Q20.91 20.91 16.80 20.31Q15.26 24.17 12.00 21.60Q8.74 24.17 7.20 20.31Q3.09 20.91 3.69 16.80Q-0.17 15.26 2.40 12.00Q-0.17 8.74 3.69 7.20Q3.09 3.09 7.20 3.69Q8.74 -0.17 12.00 2.40Z"/><path fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7.8 12.3l2.8 2.8 5.6-5.8"/></svg>`;
}

export function seloVerificado(rotulo = 'Investidor verificado'): string {
  return `<span class="selo selo--verificado" title="Identidade e perfil conferidos pela equipe StartMatch">${ICONE_CHECK}${escapeHtml(rotulo)}</span>`;
}

/** Selo clicável que abre o LinkedIn em outra aba. */
export function seloLinkedin(url: string, rotulo = 'LinkedIn'): string {
  const seguro = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return `<a class="selo selo--linkedin" href="${escapeHtml(seguro)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${escapeHtml(rotulo)} em nova aba">${ICONE_LINKEDIN}${escapeHtml(rotulo)}</a>`;
}

export function seloPlano(plano: PlanoAssinatura): string {
  return `<span class="selo selo--plano ${plano}">Plano ${PLANO_LABEL[plano]}</span>`;
}

export function seloDemo(): string {
  return '<span class="selo selo--demo" title="Perfil fictício usado na demonstração">Perfil de demonstração</span>';
}

export interface DadosContato {
  telefone: string;
  email: string;
}

/**
 * Bloco de contatos (LGPD):
 *   - sem consentimento da pessoa -> "Contatos protegidos";
 *   - com consentimento, mas o plano de quem olha é Básico -> convite para assinar;
 *   - com consentimento e plano Plus/Premium -> mostra telefone e e-mail.
 */
export function blocoContatos(opcoes: {
  contato: DadosContato;
  consentiu: boolean;
  podeVer: boolean;
  quem: string;
  hrefPlanos: string;
}): string {
  const { contato, consentiu, podeVer, quem, hrefPlanos } = opcoes;
  const nota =
    '<p class="lgpd-nota">Exibido porque a pessoa concordou em mostrar os dados pessoais (LGPD, Lei 13.709/2018). Use apenas para o contato profissional.</p>';
  if (!consentiu) {
    return `<div class="contatos-bloqueado"><strong>Contatos protegidos.</strong> ${escapeHtml(quem)} não autorizou mostrar telefone e e-mail. Use o botão de interesse ou as mensagens da plataforma.</div>`;
  }
  if (!podeVer) {
    return `<div class="contatos-bloqueado"><strong>Contatos disponíveis nos planos Plus e Premium.</strong> Assine um plano pago para ver telefone e e-mail de ${escapeHtml(quem)}.<br /><a class="btn btn-primary" href="${escapeHtml(hrefPlanos)}">Ver planos</a></div>`;
  }
  return `<ul class="contatos">
    <li><span class="rotulo">Telefone</span><a href="tel:${escapeHtml(contato.telefone.replace(/[^\d+]/g, ''))}">${escapeHtml(contato.telefone)}</a></li>
    <li><span class="rotulo">E-mail</span><a href="mailto:${escapeHtml(contato.email)}">${escapeHtml(contato.email)}</a></li>
  </ul>${nota}`;
}

// ---------------------------------------------------------------------------
// Player do pitch de 5 minutos — SÓ VISUAL (não existe vídeo de verdade)
// ---------------------------------------------------------------------------

const DURACAO_SEG = 300;

export function pitchPlayerHtml(titulo: string): string {
  const ondas = Array.from({ length: 22 }, () => '<span></span>').join('');
  return `
    <div class="pitch" data-pitch>
      <div class="pitch-tela">
        <span class="pitch-titulo">${escapeHtml(titulo)}</span>
        <button type="button" class="pitch-play" data-pitch-play aria-label="Reproduzir pitch de 5 minutos">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="pitch-ondas" aria-hidden="true">${ondas}</div>
      </div>
      <div class="pitch-barra"><span class="pitch-prog" data-pitch-prog></span></div>
      <div class="pitch-info">
        <span data-pitch-tempo>0:00 / 5:00</span>
        <span class="selo selo--demo">Prévia visual do vídeo</span>
      </div>
    </div>`;
}

function formatarTempo(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Liga o botão play do player (a "reprodução" é só uma barra que anda mais rápido). */
export function iniciarPitch(raiz: ParentNode): void {
  raiz.querySelectorAll<HTMLElement>('[data-pitch]').forEach((player) => {
    const botao = player.querySelector<HTMLButtonElement>('[data-pitch-play]');
    const barra = player.querySelector<HTMLElement>('[data-pitch-prog]');
    const tempo = player.querySelector<HTMLElement>('[data-pitch-tempo]');
    if (!botao || !barra || !tempo) return;

    let segundos = 0;
    let timer: number | undefined;

    const pintar = (): void => {
      barra.style.width = `${(segundos / DURACAO_SEG) * 100}%`;
      tempo.textContent = `${formatarTempo(segundos)} / 5:00`;
    };
    const parar = (): void => {
      window.clearInterval(timer);
      timer = undefined;
      player.classList.remove('pitch--tocando');
      botao.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
      botao.setAttribute('aria-label', 'Reproduzir pitch de 5 minutos');
    };

    botao.addEventListener('click', () => {
      if (timer) {
        parar();
        return;
      }
      if (segundos >= DURACAO_SEG) segundos = 0;
      player.classList.add('pitch--tocando');
      botao.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
      botao.setAttribute('aria-label', 'Pausar pitch');
      // 1 segundo "do vídeo" a cada 60 ms: os 5 minutos passam em ~18 s
      timer = window.setInterval(() => {
        segundos += 1;
        pintar();
        if (segundos >= DURACAO_SEG) parar();
      }, 60);
    });
  });
}

/** Mostra "Plus"/"Premium" necessários quando o pitch está bloqueado pelo plano. */
export function pitchBloqueadoHtml(mensagem: string): string {
  return `<div class="pitch-trava"><strong>Vídeo de pitch</strong><br />${escapeHtml(mensagem)}</div>`;
}

// ---------------------------------------------------------------------------
// Escolha de plano (assistente "Meu perfil") — só visual, nada é cobrado
// ---------------------------------------------------------------------------

interface InfoPlano {
  plano: PlanoAssinatura;
  preco: string;
  itens: string[];
}

export const PLANOS_STARTUP_INFO: InfoPlano[] = [
  { plano: 'basico', preco: 'Grátis', itens: ['Perfil da startup', 'Até 3 interesses por mês'] },
  {
    plano: 'plus',
    preco: 'R$ 550/mês',
    itens: ['Interesses ilimitados', 'Vídeo de pitch de 5 minutos', 'Contatos dos investidores', '1 mentoria por mês'],
  },
  {
    plano: 'premium',
    preco: 'R$ 800/mês',
    itens: ['Tudo do Plus', 'Investidores compatíveis (IA)', 'Selo de startup verificada', '2 mentorias por mês'],
  },
];

export const PLANOS_INVESTIDOR_INFO: InfoPlano[] = [
  { plano: 'basico', preco: 'Grátis', itens: ['Dashboard simples', 'Até 3 interesses por mês'] },
  { plano: 'plus', preco: 'R$ 700/mês', itens: ['Dashboard completo', 'Filtros avançados', 'Interesses ilimitados'] },
  {
    plano: 'premium',
    preco: 'R$ 1.200/mês',
    itens: ['Tudo do Plus', 'Aviso de novas startups compatíveis', 'Relatórios e exportação de listas'],
  },
];

export function planosOpcoesHtml(nomeCampo: string, atual: PlanoAssinatura, planos: InfoPlano[]): string {
  return `<div class="plano-opcoes" role="radiogroup" aria-label="Plano">${planos
    .map(
      (p) => `
      <label class="plano-opcao">
        <input type="radio" name="${nomeCampo}" value="${p.plano}" ${p.plano === atual ? 'checked' : ''} />
        <strong>${PLANO_LABEL[p.plano]}</strong>
        <span class="preco">${escapeHtml(p.preco)}</span>
        <ul>${p.itens.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
      </label>`,
    )
    .join('')}</div>`;
}
