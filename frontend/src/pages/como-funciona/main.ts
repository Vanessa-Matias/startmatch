// Tela: Como funciona — lógica
// ==============================
// Página estática, exceto pelo chatbot Stella (FAQ à esquerda, chat à direita):
// o menu numérico roda no navegador, com respostas prontas (chatbot por regras,
// sem IA e sem chamar a API).
// Ver scripts/chatbot.ts e scripts/chatbotData.ts.
import { initChatbot } from '../../scripts/chatbot';
import { initReveal } from '../../scripts/reveal';

initReveal();

const stella = document.getElementById('stella-chat');
if (stella) initChatbot(stella);
