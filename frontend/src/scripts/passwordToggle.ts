// src/scripts/passwordToggle.ts
// ==============================
// Coloca um botão de "olhinho" dentro de cada campo de senha da tela, para
// mostrar/ocultar o que foi digitado. Basta chamar initPasswordToggles() no
// main.ts da tela: ele encontra todos os <input type="password"> sozinho.
//
// O botão troca o type do input entre "password" e "text", atualiza o ícone e
// o aria-label/aria-pressed (leitores de tela anunciam "Mostrar senha" /
// "Ocultar senha"). Estilo em components.css (.password-field).

const EYE_OPEN =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10.3 10.3 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

export function initPasswordToggles(root: ParentNode = document): void {
  root.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((input) => {
    if (input.parentElement?.classList.contains('password-field')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'password-field';
    input.parentNode?.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'password-toggle';

    function update(visible: boolean): void {
      input.type = visible ? 'text' : 'password';
      button.innerHTML = visible ? EYE_CLOSED : EYE_OPEN;
      button.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
      button.setAttribute('aria-pressed', String(visible));
    }

    button.addEventListener('click', () => {
      update(input.type === 'password');
      input.focus();
    });

    update(false);
    wrapper.appendChild(button);
  });
}
