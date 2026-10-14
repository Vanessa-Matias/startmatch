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
import type { Usuario } from './types';

type Tipo = Usuario['tipo'];

export interface MatchExemplo {
  id: string;
  nome: string;
  localizacao: string;
  descricao: string;
  score: number;
  /** Primeira mensagem que o outro lado "manda" ao abrir a conversa. */
  saudacao: string;
}

export interface MensagemSimulada {
  minha: boolean;
  texto: string;
}

const EXEMPLOS_PARA_STARTUP: MatchExemplo[] = [
  {
    id: 'carlos-menezes',
    nome: 'Carlos Menezes',
    localizacao: 'Recife/PE',
    descricao: 'Investidor-anjo em SaaS B2B e fintechs, do MVP à operação. Tickets de R$ 50 mil a R$ 300 mil.',
    score: 92,
    saudacao: 'Olá! Gostei muito do perfil de vocês. Podemos marcar uma conversa para eu entender melhor a tração?',
  },
  {
    id: 'fernanda-lins',
    nome: 'Fernanda Lins',
    localizacao: 'Recife/PE',
    descricao: 'Foco em healthtechs e edtechs com tração inicial no Nordeste.',
    score: 85,
    saudacao: 'Oi! Vi que temos interesse mútuo. Vocês já têm clientes pagantes?',
  },
  {
    id: 'rede-nordeste-anjos',
    nome: 'Rede Nordeste Anjos',
    localizacao: 'Fortaleza/CE',
    descricao: 'Grupo de investidores-anjo que coinveste em startups de impacto e agronegócio.',
    score: 78,
    saudacao: 'Olá! Nosso grupo se reúne todo mês para avaliar startups. Querem apresentar o pitch na próxima rodada?',
  },
  {
    id: 'paulo-arruda',
    nome: 'Paulo Arruda',
    localizacao: 'Olinda/PE',
    descricao: 'Ex-fundador, investe em marketplaces e logística com modelo de receita recorrente.',
    score: 81,
    saudacao: 'E aí! Já empreendi no setor de vocês. Bora trocar uma ideia sobre o modelo de receita?',
  },
];

const EXEMPLOS_PARA_INVESTIDOR: MatchExemplo[] = [
  {
    id: 'agrosense',
    nome: 'AgroSense',
    localizacao: 'Petrolina/PE',
    descricao: 'Sensores e dados para irrigação inteligente no Vale do São Francisco.',
    score: 90,
    saudacao: 'Olá! Obrigado pelo interesse. Podemos enviar nosso deck e os números do último trimestre.',
  },
  {
    id: 'clinica-facil',
    nome: 'Clínica Fácil',
    localizacao: 'Recife/PE',
    descricao: 'Agendamento e prontuário on-line para clínicas de pequeno porte.',
    score: 84,
    saudacao: 'Oi! Que bom o match. Hoje atendemos 40 clínicas em Recife. Quer agendar uma demo?',
  },
  {
    id: 'edulab',
    nome: 'EduLab',
    localizacao: 'Caruaru/PE',
    descricao: 'Plataforma de reforço escolar com trilhas personalizadas por IA.',
    score: 77,
    saudacao: 'Olá! Estamos abrindo nossa rodada anjo. Podemos conversar esta semana?',
  },
  {
    id: 'rota-verde',
    nome: 'Rota Verde',
    localizacao: 'Jaboatão/PE',
    descricao: 'Logística de última milha com veículos elétricos para o comércio local.',
    score: 82,
    saudacao: 'Oi! Ficamos felizes com o match. Quer conhecer nossa operação de perto?',
  },
];

const RESPOSTAS = [
  'Perfeito! Vou anotar aqui. Qual o melhor horário para uma call?',
  'Ótimo, obrigado pelas informações!',
  'Combinado. Te mando um convite pelo e-mail ainda hoje.',
  'Muito bom! Vamos seguir conversando por aqui.',
];

/** Quantos matches de exemplo aparecem antes de clicar em "Simular novo match". */
const INICIAIS = 2;

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

export function temMaisParaSimular(tipo: Tipo): boolean {
  return matchesSimulados(tipo).length < exemplosPara(tipo).length;
}

export function buscarSimulado(tipo: Tipo, id: string): MatchExemplo | undefined {
  return matchesSimulados(tipo).find((m) => m.id === id);
}

/** Mensagens da conversa simulada (começa com a saudação do outro lado). */
export function mensagensSimuladas(exemplo: MatchExemplo): MensagemSimulada[] {
  return ler<MensagemSimulada[]>(`sm_sim_msgs_${exemplo.id}`, [
    { minha: false, texto: exemplo.saudacao },
  ]);
}

export function enviarMensagemSimulada(exemplo: MatchExemplo, texto: string): MensagemSimulada[] {
  const mensagens = [...mensagensSimuladas(exemplo), { minha: true, texto }];
  gravar(`sm_sim_msgs_${exemplo.id}`, mensagens);
  return mensagens;
}

/** Resposta automática do outro lado, para a conversa parecer viva na demonstração. */
export function responderSimulado(exemplo: MatchExemplo): MensagemSimulada[] {
  const atuais = mensagensSimuladas(exemplo);
  const enviadas = atuais.filter((m) => m.minha).length;
  const resposta = RESPOSTAS[(enviadas - 1 + RESPOSTAS.length) % RESPOSTAS.length];
  const mensagens = [...atuais, { minha: false, texto: resposta }];
  gravar(`sm_sim_msgs_${exemplo.id}`, mensagens);
  return mensagens;
}
