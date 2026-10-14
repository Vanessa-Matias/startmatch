// src/scripts/reveal.ts
// =======================
// Animação de entrada dos cards ao rolar a página: cada elemento .sm-reveal só
// "sobe e aparece" quando entra na tela (IntersectionObserver). Sem JS ou sem
// suporte do navegador, a classe js-reveal nunca é ativada e os cards aparecem
// normalmente pelo CSS de global.css.
export function initReveal(): void {
  if (!('IntersectionObserver' in window)) return;
  const itens = document.querySelectorAll<HTMLElement>('.sm-reveal');
  if (itens.length === 0) return;

  document.documentElement.classList.add('js-reveal');
  const observer = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observer.unobserve(entrada.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  itens.forEach((el) => observer.observe(el));
}
