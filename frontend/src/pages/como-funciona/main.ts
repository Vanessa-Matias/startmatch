// Tela: Como funciona — lógica
// ==============================
// Página estática, exceto pelo chatbot Stella (FAQ à esquerda, chat à direita):
// o menu numérico roda no navegador e perguntas livres vão para POST /api/chat.
// Ver scripts/chatbot.ts e scripts/chatbotData.ts.
import { initChatbot } from '../../scripts/chatbot';
import { initReveal } from '../../scripts/reveal';

initReveal();

const stella = document.getElementById('stella-chat');
if (stella) initChatbot(stella);
