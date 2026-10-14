// src/scripts/chatbot.ts
// =======================
// Chatbot "Stella" da tela Como funciona. Duas camadas:
// Menu numérico (0 a 9): respostas prontas em chatbotData.ts, sem rede e sem
// backend. Qualquer texto fora do menu faz a Stella pedir para escolher um número.
// Todo texto entra na tela por textContent (nunca innerHTML), então nada que o
// usuário escreva vira HTML.
import {
  ANSWERS,
  BACK_HINT,
  MENU,
  PROMPT_HELP,
  SUPPORT_EMAIL,
  UNKNOWN,
  WELCOME,
} from './chatbotData';

export function initChatbot(root: HTMLElement): void {
  const log = root.querySelector<HTMLElement>('[data-chat-log]');
  const form = root.querySelector<HTMLFormElement>('[data-chat-form]');
  const input = root.querySelector<HTMLInputElement>('[data-chat-input]');
  if (!log || !form || !input) return;

  let iniciado = false;

  function addMensagem(texto: string, quem: 'bot' | 'user'): HTMLElement {
    const bolha = document.createElement('div');
    bolha.className = `chat-msg chat-msg--${quem}`;
    bolha.textContent = texto;
    log!.appendChild(bolha);
    log!.scrollTop = log!.scrollHeight;
    return bolha;
  }

  function addSuporte(): void {
    const bolha = addMensagem(`${ANSWERS['9']}\n`, 'bot');
    const link = document.createElement('a');
    link.href = `mailto:${SUPPORT_EMAIL}?subject=D%C3%BAvida%20StartMatch`;
    link.textContent = SUPPORT_EMAIL;
    bolha.appendChild(link);
    addMensagem(BACK_HINT, 'bot');
  }

  function mostrarMenu(): void {
    addMensagem(MENU, 'bot');
  }

  function iniciar(): void {
    if (iniciado) return;
    iniciado = true;
    addMensagem(PROMPT_HELP, 'bot');
    mostrarMenu();
  }

  function tratar(textoBruto: string): void {
    const texto = textoBruto.trim();
    if (!texto) return;
    addMensagem(texto, 'user');

    if (texto === '0' || /^menu$/i.test(texto)) {
      mostrarMenu();
      return;
    }
    if (/^[1-8]$/.test(texto)) {
      addMensagem(ANSWERS[texto], 'bot');
      addMensagem(BACK_HINT, 'bot');
      return;
    }
    if (texto === '9') {
      addSuporte();
      return;
    }
    if (/^\d+$/.test(texto)) {
      addMensagem(UNKNOWN, 'bot');
      return;
    }
    if (/^(oi|ol[aá]|bom dia|boa tarde|boa noite|ajuda)\b/i.test(texto)) {
      addMensagem('Olá! Como posso ajudar?', 'bot');
      mostrarMenu();
      return;
    }
    addMensagem(UNKNOWN, 'bot');
  }

  addMensagem(WELCOME, 'bot');

  input.addEventListener('focus', iniciar);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    iniciar();
    const valor = input.value;
    input.value = '';
    tratar(valor);
  });
}
