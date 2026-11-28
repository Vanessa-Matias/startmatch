// Tela: Como funciona — lógica
// ==============================
// Página estática, exceto pelo chatbot Stella (FAQ à esquerda, chat à direita):
// o menu numérico roda no navegador, com respostas prontas (chatbot por regras,
// sem IA e sem chamar a API).
// Ver scripts/chatbot.ts e scripts/chatbotData.ts.
import { initChatbot } from '../../scripts/chatbot';
import { initPublicNav } from '../../scripts/publicNav';
import { initReveal } from '../../scripts/reveal';

initReveal();
initPublicNav();
initTimelineProgress();

// Linha do tempo "1 a 6" — só no celular (linha vertical): conforme a pessoa
// rola a tela, o tracejado azul desce de um passo ao outro e as bolinhas
// alcançadas acendem (.is-active). No computador/tablet tudo já aparece
// aceso e completo pelo CSS, sem depender da rolagem.
function initTimelineProgress(): void {
  const timeline = document.querySelector<HTMLElement>('.timeline');
  if (!timeline) return;

  const items = Array.from(
    timeline.querySelectorAll<HTMLElement>('.timeline-item'),
  );
  const badges = items
    .map((item) => item.querySelector<HTMLElement>('.step-badge'))
    .filter((b): b is HTMLElement => b !== null);
  if (badges.length < 2) return;

  const celular = window.matchMedia('(max-width: 720px)');
  let agendado = false;

  function atualizar(): void {
    agendado = false;
    if (!celular.matches) {
      // computador/tablet: tudo aceso pelo CSS, sem classes da rolagem
      items.forEach((item) => item.classList.remove('is-active'));
      return;
    }

    const box = timeline!.getBoundingClientRect();
    const centros = badges.map((b) => {
      const r = b.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const primeiro = centros[0];
    const ultimo = centros[centros.length - 1];

    // ponto da tela que "puxa" o preenchimento: alto o bastante para que,
    // com a página no topo, só o passo 1 esteja aceso
    const gatilho = window.innerHeight * 0.4;
    const fill = Math.min(Math.max(gatilho - primeiro, 0), ultimo - primeiro);

    timeline!.style.setProperty('--line-start', `${primeiro - box.top}px`);
    timeline!.style.setProperty('--fill', `${fill}px`);
    items.forEach((item, i) =>
      item.classList.toggle('is-active', i === 0 || centros[i] <= gatilho),
    );
  }

  function agendar(): void {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(atualizar);
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  agendar();
}

const stella = document.getElementById('stella-chat');
if (stella) initChatbot(stella);
