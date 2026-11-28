// src/scripts/matchSimulado.ts
// =============================
// SIMULAÇÃO DE MATCH E DE CONVERSA, só no frontend (para apresentação).
//
// Nada daqui vai para o backend nem para o banco de dados: os matches de
// exemplo e as mensagens trocadas com eles ficam no sessionStorage do
// navegador, que é apagado quando a aba é fechada. Os matches e mensagens
// reais continuam vindo da API normalmente.
//
// Usado por:
//   - matches/   -> mostra os matches de exemplo e o botão "Simular novo match"
//   - mensagens/ -> lista as conversas simuladas e deixa trocar mensagens,
//                   com uma resposta automática do outro lado
//
// Para o MENTOR, as conversas simuladas são as startups que pediram mentoria
// (scripts/mentorDemo.ts -> SOLICITACOES): cada uma chega com a mensagem do pedido.

import { SOLICITACOES } from './mentorDemo';
import type { Genero } from './avatars';
import type { Usuario } from './types';

type Tipo = Usuario['tipo'];

export type PapelContraparte = 'investidor' | 'mentor' | 'startup';

export interface MensagemSimulada {
  minha: boolean;
  texto: string;
  /** Horário exibido ao lado da mensagem (ex.: "09:12"). */
  hora?: string;
  /** Rótulo do dia, mostrado antes da mensagem (ex.: "Ontem"). */
  dia?: string;
}

export interface MatchExemplo {
  id: string;
  nome: string;
  localizacao: string;
  descricao: string;
  score: number;
  /** Primeira mensagem que o outro lado "manda" ao abrir a conversa. */
  saudacao: string;
  /** Quem é do outro lado (define o rótulo e o tipo de imagem). */
  papel: PapelContraparte;
  genero?: Genero;
  /** Conversa já em andamento (se faltar, começa só com a saudação). */
  historico?: MensagemSimulada[];
  /** Link para o perfil de demonstração da pessoa/startup. */
  perfilHref?: string;
  /** Texto curto de apoio na lista (ex.: "Mentora · Captação"). */
  subtitulo?: string;
}

const PERFIL_INV = '../perfil-investidor/index.html?demo=';
const PERFIL_ST = '../perfil-startup/index.html?demo=';

const EXEMPLOS_PARA_STARTUP: MatchExemplo[] = [
  {
    id: 'carlos-menezes',
    nome: 'Carlos Menezes',
    papel: 'investidor',
    genero: 'm',
    localizacao: 'Recife/PE',
    descricao: 'Investidor-anjo em SaaS B2B e fintechs, do MVP à operação. Tickets de R$ 50 mil a R$ 300 mil.',
    score: 92,
    perfilHref: `${PERFIL_INV}carlos-menezes`,
    saudacao: 'Olá! Gostei muito do perfil de vocês. Podemos marcar uma conversa para eu entender melhor a tração?',
    historico: [
      { minha: false, dia: 'Ontem', hora: '09:12', texto: 'Olá! Gostei muito do perfil de vocês. Podemos marcar uma conversa para eu entender melhor a tração?' },
      { minha: true, hora: '09:20', texto: 'Oi, Carlos! Agradecemos o interesse. Hoje temos 12 clientes pagantes e receita recorrente de R$ 18 mil por mês.' },
      { minha: false, hora: '09:31', texto: 'Muito bom para esse estágio. E o cancelamento (churn) nos últimos três meses?' },
      { minha: true, hora: '09:38', texto: 'Ficou em 2,1% ao mês. Posso mandar o deck e a planilha de métricas por aqui?' },
      { minha: false, dia: 'Hoje', hora: '08:45', texto: 'Perfeito, mande sim. Que tal uma call na quinta, às 15h?' },
    ],
  },
  {
    id: 'fernanda-lins',
    nome: 'Fernanda Lins',
    papel: 'investidor',
    genero: 'f',
    localizacao: 'Recife/PE',
    descricao: 'Foco em healthtechs e edtechs com tração inicial no Nordeste.',
    score: 85,
    perfilHref: `${PERFIL_INV}fernanda-lins`,
    saudacao: 'Oi! Vi que temos interesse mútuo. Vocês já têm clientes pagantes?',
    historico: [
      { minha: false, dia: 'Ontem', hora: '17:30', texto: 'Oi! Vi que temos interesse mútuo. Vocês já têm clientes pagantes?' },
      { minha: true, hora: '17:44', texto: 'Oi, Fernanda! Sim, 12 clientes pagantes e uma lista de espera de 30 empresas.' },
      { minha: false, hora: '17:52', texto: 'Excelente. Gostaria de conhecer o time. Podem me apresentar em 5 minutos pelo vídeo do perfil?' },
    ],
  },
  {
    id: 'rede-nordeste-anjos',
    nome: 'Rede Nordeste Anjos',
    papel: 'investidor',
    localizacao: 'Fortaleza/CE',
    descricao: 'Grupo de investidores-anjo que coinveste em startups de impacto e agronegócio.',
    score: 78,
    perfilHref: `${PERFIL_INV}rede-nordeste-anjos`,
    saudacao: 'Olá! Nosso grupo se reúne todo mês para avaliar startups. Querem apresentar o pitch na próxima rodada?',
  },
  {
    id: 'paulo-arruda',
    nome: 'Paulo Arruda',
    papel: 'investidor',
    genero: 'm',
    localizacao: 'Olinda/PE',
    descricao: 'Ex-fundador, investe em marketplaces e logística com modelo de receita recorrente.',
    score: 81,
    perfilHref: `${PERFIL_INV}paulo-arruda`,
    saudacao: 'E aí! Já empreendi no setor de vocês. Bora trocar uma ideia sobre o modelo de receita?',
  },
];

/** Conversas de mentoria da startup: aparecem em Mensagens, mas não são "matches". */
const MENTORES_PARA_STARTUP: MatchExemplo[] = [
  {
    id: 'mariana-albuquerque',
    nome: 'Mariana Albuquerque',
    papel: 'mentor',
    genero: 'f',
    localizacao: 'Recife/PE',
    descricao: 'Mentora em estratégia e captação de investimento.',
    score: 0,
    subtitulo: 'Mentora · Captação e pitch',
    saudacao: 'Oi! Vi o pedido de mentoria de vocês sobre captação.',
    historico: [
      { minha: false, dia: 'Segunda', hora: '14:05', texto: 'Oi! Vi o pedido de mentoria de vocês sobre captação. Pelo que li, o pitch está forte, mas o slide de mercado pode melhorar.' },
      { minha: true, hora: '14:18', texto: 'Obrigado, Mariana! Estávamos justamente com dúvida sobre como apresentar o tamanho do mercado.' },
      { minha: false, hora: '14:25', texto: 'Comecem pelo mercado que vocês conseguem atender nos próximos 18 meses e depois mostrem o potencial maior.' },
      { minha: true, hora: '14:40', texto: 'Faz sentido! Vamos refazer o slide e levar para a sessão de quarta.' },
      { minha: false, dia: 'Hoje', hora: '10:02', texto: 'Combinado. Confirmei nossa sessão de quarta às 10h, por vídeo. Mandem o deck antes, por favor.' },
    ],
  },
];

const EXEMPLOS_PARA_INVESTIDOR: MatchExemplo[] = [
  {
    id: 'agrosense',
    nome: 'AgroSense',
    papel: 'startup',
    localizacao: 'Petrolina/PE',
    descricao: 'Sensores e dados para irrigação inteligente no Vale do São Francisco.',
    score: 90,
    perfilHref: `${PERFIL_ST}agrosense`,
    saudacao: 'Olá! Obrigado pelo interesse. Podemos enviar nosso deck e os números do último trimestre.',
    historico: [
      { minha: false, dia: 'Ontem', hora: '11:10', texto: 'Olá! Obrigado pelo interesse. Podemos enviar nosso deck e os números do último trimestre.' },
      { minha: true, hora: '11:26', texto: 'Boa tarde, Marina! Mande sim. Me interessa saber quantos hectares já estão monitorados e o custo por sensor.' },
      { minha: false, hora: '11:40', texto: 'Hoje são 1.200 hectares, e o custo por sensor caiu 22% com o novo fornecedor. Enviei o deck por aqui.' },
      { minha: true, dia: 'Hoje', hora: '08:15', texto: 'Li o material. Podemos marcar uma visita à operação em Petrolina na próxima semana?' },
    ],
  },
  {
    id: 'clinica-facil',
    nome: 'Clínica Fácil',
    papel: 'startup',
    localizacao: 'Recife/PE',
    descricao: 'Agendamento e prontuário on-line para clínicas de pequeno porte.',
    score: 84,
    perfilHref: `${PERFIL_ST}clinica-facil`,
    saudacao: 'Oi! Que bom o match. Hoje atendemos 40 clínicas em Recife. Quer agendar uma demo?',
    historico: [
      { minha: true, dia: 'Segunda', hora: '16:00', texto: 'Olá, Rafael! Gostei do produto. Qual a meta de clientes para os próximos seis meses?' },
      { minha: false, hora: '16:22', texto: 'Oi! Que bom o match. Hoje atendemos 40 clínicas em Recife e queremos chegar a 120 até junho.' },
      { minha: true, hora: '16:30', texto: 'Ambicioso, mas viável. Quanto do investimento seria para vendas?' },
      { minha: false, dia: 'Hoje', hora: '09:05', texto: 'Cerca de 60%. Quer agendar uma demo com o time na sexta?' },
    ],
  },
  {
    id: 'edulab',
    nome: 'EduLab',
    papel: 'startup',
    localizacao: 'Caruaru/PE',
    descricao: 'Plataforma de reforço escolar com trilhas personalizadas por IA.',
    score: 77,
    perfilHref: `${PERFIL_ST}edulab`,
    saudacao: 'Olá! Estamos abrindo nossa rodada anjo. Podemos conversar esta semana?',
  },
  {
    id: 'rota-verde',
    nome: 'Rota Verde',
    papel: 'startup',
    localizacao: 'Jaboatão/PE',
    descricao: 'Logística de última milha com veículos elétricos para o comércio local.',
    score: 82,
    perfilHref: `${PERFIL_ST}rota-verde`,
    saudacao: 'Oi! Ficamos felizes com o match. Quer conhecer nossa operação de perto?',
  },
];

const RESPOSTAS = [
  'Perfeito! Vou anotar aqui. Qual o melhor horário para uma call?',
  'Ótimo, obrigado pelas informações!',
  'Combinado. Te mando um convite pelo e-mail ainda hoje.',
  'Muito bom! Vamos seguir conversando por aqui.',
];

function horaAgora(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Quantos matches de exemplo aparecem antes de clicar em "Simular novo match". */
const INICIAIS = 3;

function ler<T>(chave: string, padrao: T): T {
  try {
    const valor = sessionStorage.getItem(chave);
    return valor ? (JSON.parse(valor) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    sessionStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // sem armazenamento (aba anônima etc.): a simulação só não é lembrada
  }
}

// Conversas do mentor: uma por startup que solicitou mentoria.
const EXEMPLOS_PARA_MENTOR: MatchExemplo[] = SOLICITACOES.map((s) => ({
  id: s.id,
  nome: s.startup,
  localizacao: s.cidade,
  descricao: s.tema,
  score: 0,
  saudacao: `Olá! Somos a ${s.startup} e enviamos uma solicitação de mentoria sobre "${s.tema}" para ${s.data}, ${s.horario}. ${s.mensagem}`,
  papel: 'startup' as const,
}));

export function exemplosPara(tipo: Tipo): MatchExemplo[] {
  if (tipo === 'mentor') return EXEMPLOS_PARA_MENTOR;
  return tipo === 'startup' ? EXEMPLOS_PARA_STARTUP : EXEMPLOS_PARA_INVESTIDOR;
}

/** Matches de exemplo já "feitos" nesta aba (os iniciais + os simulados). */
export function matchesSimulados(tipo: Tipo): MatchExemplo[] {
  // o mentor recebe todas as conversas de solicitação de uma vez
  if (tipo === 'mentor') return EXEMPLOS_PARA_MENTOR;
  if (tipo === 'admin') return [];
  const qtd = ler<number>(`sm_sim_qtd_${tipo}`, INICIAIS);
  return exemplosPara(tipo).slice(0, qtd);
}

/** Cria mais um match de exemplo. Retorna null quando todos já foram usados. */
export function simularNovoMatch(tipo: Tipo): MatchExemplo | null {
  const todos = exemplosPara(tipo);
  const qtd = ler<number>(`sm_sim_qtd_${tipo}`, INICIAIS);
  const novo = todos[qtd];
  if (!novo) return null;
  gravar(`sm_sim_qtd_${tipo}`, qtd + 1);
  return novo;
}

/**
 * Todas as conversas de exemplo que aparecem em Mensagens: os matches já feitos
 * + (para a startup) as conversas com mentores.
 */
export function conversasSimuladas(tipo: Tipo): MatchExemplo[] {
  const matches = matchesSimulados(tipo);
  return tipo === 'startup' ? [...matches, ...MENTORES_PARA_STARTUP] : matches;
}

export function temMaisParaSimular(tipo: Tipo): boolean {
  return matchesSimulados(tipo).length < exemplosPara(tipo).length;
}

export function buscarSimulado(tipo: Tipo, id: string): MatchExemplo | undefined {
  return conversasSimuladas(tipo).find((m) => m.id === id);
}

/** Mensagens da conversa simulada (começa com a saudação do outro lado). */
export function mensagensSimuladas(exemplo: MatchExemplo): MensagemSimulada[] {
  return ler<MensagemSimulada[]>(
    `sm_sim_msgs_${exemplo.id}`,
    exemplo.historico ?? [{ minha: false, texto: exemplo.saudacao }],
  );
}

export function enviarMensagemSimulada(exemplo: MatchExemplo, texto: string): MensagemSimulada[] {
  const mensagens = [...mensagensSimuladas(exemplo), { minha: true, texto, hora: horaAgora() }];
  gravar(`sm_sim_msgs_${exemplo.id}`, mensagens);
  return mensagens;
}

/** Resposta automática do outro lado, para a conversa parecer viva na demonstração. */
export function responderSimulado(exemplo: MatchExemplo): MensagemSimulada[] {
  const atuais = mensagensSimuladas(exemplo);
  const enviadas = atuais.filter((m) => m.minha).length;
  const resposta = RESPOSTAS[(enviadas - 1 + RESPOSTAS.length) % RESPOSTAS.length];
  const mensagens = [...atuais, { minha: false, texto: resposta, hora: horaAgora() }];
  gravar(`sm_sim_msgs_${exemplo.id}`, mensagens);
  return mensagens;
}
