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
  '6 - Planos e valores: Mentores',
  '7 - Mentorias extras (pacotes)',
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
    'Planos para Startups:\n• Básico: grátis\n• Plus: R$ 350/mês, com perfil em destaque, interesses ilimitados e 1 mentoria por mês\n• Premium: R$ 500/mês, com prioridade no match, selo verificado e 3 mentorias por mês',
  '5':
    'Planos para Investidores:\n• Básico: grátis\n• Plus: R$ 400/mês, com filtros avançados e sugestões automáticas\n• Premium: R$ 600/mês, com acesso antecipado a startups, relatórios do ecossistema e matchmaking assistido por mentor',
  '6':
    'Planos para Mentores:\n• Independente: R$ 200/mês. Exige certificados que comprovem as mentorias e dá destaque de perfil na seção de mentorias extras.\n• Rede parceira: 20% de desconto (R$ 160/mês), com badge exclusivo.',
  '7':
    'Mentorias extras: startups Plus ou Premium podem comprar pacotes avulsos de Básico com 5 mentorias online de 30 min (R$ 400, R$ 80 cada), Start com 8 mentorias de 1h (R$ 750, com resumo e próximos passos após cada sessão) ou Premium com 10 mentorias de 1h (R$ 1.200, presenciais ou online, de segunda a sexta). As do plano são usadas primeiro. Mentores assinantes aparecem em destaque nas indicações, e parte do valor é repassada ao mentor.',
  '8':
    'O match compara segmento de atuação, estágio/faixa de investimento e localização. Quando os dois lados demonstram interesse, nasce o match e a conversa é liberada. O cadastro exige consentimento explícito (LGPD), e cada consentimento fica registrado.',
  '9':
    'Ficou com mais dúvidas? Escreva para o suporte do StartMatch:',
};

export const UNKNOWN =
  'Não entendi. Escolha um número de 1 a 9 ou 0 para voltar ao menu.';
