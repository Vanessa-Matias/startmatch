// src/scripts/chatbotData.ts
// ===========================
// Textos do menu numérico da Stella (assistente virtual do StartMatch). Tudo
// que ela responde está aqui (menu numérico, sem IA e sem backend).

export const SUPPORT_EMAIL = 'suporte@startmatch.com.br';

export const BOT_NAME = 'Stella';

export const WELCOME =
  'Olá! Eu sou a Stella, assistente virtual do StartMatch. Clique na caixa de mensagem para começar.';

export const PROMPT_HELP =
  'Escolha um número de 1 a 9 para escolher sua dúvida ou 0 para voltar ao menu.';

export const MENU = [
  'Menu da Stella:',
  '1 - O que é o StartMatch',
  '2 - Para quem é e para que serve',
  '3 - Como me cadastrar',
  '4 - Planos e valores: Startups',
  '5 - Planos e valores: Investidores',
  '6 - Mentores (voluntários e gratuitos)',
  '7 - Mentorias: como funcionam',
  '8 - Como funciona o match e a segurança dos dados',
  '9 - Falar com o suporte por e-mail',
].join('\n');

export const BACK_HINT = 'Digite 0 para voltar ao menu.';

export const ANSWERS: Record<string, string> = {
  '1':
    'O StartMatch é uma plataforma de matchmaking entre startups, investidores-anjo e mentores, focada no ecossistema do Nordeste e do Porto Digital (Recife). Ele aproxima quem precisa de capital e orientação de quem pode oferecer.',
  '2':
    'Startups: encontram investidores e mentores. Investidores: descobrem startups alinhadas à sua tese. Mentores: oferecem mentorias e ganham visibilidade. Serve para tornar essas conexões mais rápidas e objetivas.',
  '3':
    'Clique em "Criar conta", escolha seu perfil (startup, investidor ou mentor), informe nome, e-mail e uma senha de exatamente 8 caracteres (letras e/ou números), aceite os termos e complete o seu perfil. Criar a conta é grátis.',
  '4':
    'Planos para Startups:\n• Básico: grátis\n• Plus: R$ 550/mês, com interesses ilimitados e 1 mentoria por mês\n• Premium: R$ 800/mês, com prioridade no match, destaque na seção Premium dos investidores, relatório de compatibilidade, selo verificado e 2 mentorias por mês\n(No Básico a startup pode demonstrar até 3 interesses por mês.)',
  '5':
    'Planos para Investidores:\n• Básico: grátis\n• Plus: R$ 700/mês, com dashboard completo, filtros avançados e interesses ilimitados\n• Premium: R$ 1.200/mês, com seção Premium, aviso de novas startups compatíveis, relatórios e exportação de listas\n(No Básico o investidor tem dashboard simples, filtros básicos e até 3 interesses por mês.)',
  '6':
    'Mentores são voluntários e não pagam assinatura. Eles ganham selo de verificado, badge de Parceiro Porto Digital, certificado a cada mentoria realizada e podem conversar diretamente com startups e investidores. Cada mentor define duração (30 min ou 1h), quantas mentorias faz por mês, dias, horários e modalidade (presencial, híbrido ou remoto).',
  '7':
    'Mentorias: a startup do plano Plus tem 1 mentoria por mês e a do Premium tem 2. No Básico não há mentorias incluídas. Você escolhe o mentor, pede o horário, o mentor aceita ou recusa e, depois da sessão, ele marca como realizada e o certificado é gerado.',
  '8':
    'O match compara segmento de atuação, estágio/faixa de investimento e localização. Quando os dois lados demonstram interesse, nasce o match e a conversa é liberada. O cadastro exige consentimento explícito (LGPD), e cada consentimento fica registrado.',
  '9':
    'Ficou com mais dúvidas? Escreva para o suporte do StartMatch:',
};

export const UNKNOWN =
  'Não entendi. Escolha um número de 1 a 9 ou 0 para voltar ao menu.';
