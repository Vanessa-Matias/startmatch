// src/scripts/wizard.ts
// ======================
// Assistente de 3 passos usado em "Meu perfil" (investidor e startup).
// Só controla qual passo aparece; o conteúdo e o salvamento ficam em cada tela.
//
// HTML esperado:
//   <ol class="stepper"><li data-passo="1">…</li>…</ol>
//   <section class="form-section passo" data-passo="1">…</section> (1, 2 e 3)
//   botões [data-ant] (voltar) e [data-prox] (avançar) dentro dos passos

export function iniciarAssistente(raiz: ParentNode, total = 3): { ir(n: number): void } {
  const itens = Array.from(raiz.querySelectorAll<HTMLElement>('.stepper li[data-passo]'));
  const passos = Array.from(raiz.querySelectorAll<HTMLElement>('.passo[data-passo]'));
  let atual = 1;

  function ir(n: number, rolar = true): void {
    atual = Math.min(total, Math.max(1, n));
    passos.forEach((p) => {
      p.hidden = Number(p.dataset.passo) !== atual;
    });
    itens.forEach((li) => {
      const num = Number(li.dataset.passo);
      li.classList.toggle('ativo', num === atual);
      li.classList.toggle('feito', num < atual);
      if (num === atual) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    const topo = itens[0]?.parentElement;
    if (rolar) topo?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  itens.forEach((li) => li.addEventListener('click', () => ir(Number(li.dataset.passo))));
  raiz.querySelectorAll<HTMLElement>('[data-prox]').forEach((b) => b.addEventListener('click', () => ir(atual + 1)));
  raiz.querySelectorAll<HTMLElement>('[data-ant]').forEach((b) => b.addEventListener('click', () => ir(atual - 1)));

  ir(1, false);
  return { ir };
}
