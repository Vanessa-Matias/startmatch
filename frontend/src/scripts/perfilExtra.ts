// src/scripts/perfilExtra.ts
// ===========================
// Dados EXTRAS dos perfis de investidor e de startup, só para a demonstração.
//
// O backend ainda não tem estas colunas (biografia, telefone, LinkedIn, foto,
// consentimento de contato, vídeo de pitch...). Por isso, tudo aqui fica só no
// navegador (localStorage), ligado ao id do perfil — mesmo padrão de
// scripts/mentorDemo.ts. NADA vai para o banco de dados.
//
// Quando um campo não foi preenchido, a função "extra…" devolve um texto de
// exemplo coerente (gerado a partir do nome/tese), para o perfil nunca aparecer vazio.
//
// Também aqui ficam:
//   - o plano "simulado" (Básico/Plus/Premium) que a plateia pode trocar na demo;
//   - a regra de COMPATIBILIDADE startup × investidor (segmento, ticket, estágio e
//     região). É uma regra fixa, rápida e explicável — não usa o serviço de IA.

import { generoPorNome, hashTexto, type Genero } from './avatars';
import { demoInvestidor, demoStartup } from './demoData';
import type { EstagioStartup, Investidor, PlanoAssinatura, Startup } from './types';

// ---------------------------------------------------------------------------
// Armazenamento
// ---------------------------------------------------------------------------

function ler<T>(chave: string, padrao: T): T {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? (JSON.parse(valor) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): boolean {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export const PLANO_LABEL: Record<PlanoAssinatura, string> = {
  basico: 'Básico',
  plus: 'Plus',
  premium: 'Premium',
};

export const ESTAGIO_LABEL: Record<EstagioStartup, string> = {
  ideacao: 'Ideação',
  mvp: 'MVP',
  operacao: 'Operação',
  scale_up: 'Scale-up',
};

export const ESTAGIOS: EstagioStartup[] = ['ideacao', 'mvp', 'operacao', 'scale_up'];

export function dinheiro(valor: number): string {
  return `R$ ${Number(valor).toLocaleString('pt-BR')}`;
}

export function dinheiroCurto(valor: number): string {
  if (valor >= 1_000_000) return `R$ ${(valor / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (valor >= 1000) return `R$ ${Math.round(valor / 1000)} mil`;
  return dinheiro(valor);
}

// ---------------------------------------------------------------------------
// Plano simulado (demonstração)
// ---------------------------------------------------------------------------

type DonoPlano = 'startup' | 'investidor';

/** Plano escolhido na tela de demonstração; null = usar o plano real da conta. */
export function planoSimulado(dono: DonoPlano): PlanoAssinatura | null {
  const valor = ler<string | null>(`sm_demo_plano_${dono}`, null);
  return valor === 'basico' || valor === 'plus' || valor === 'premium' ? valor : null;
}

export function definirPlanoSimulado(dono: DonoPlano, plano: PlanoAssinatura | null): void {
  try {
    if (plano) localStorage.setItem(`sm_demo_plano_${dono}`, JSON.stringify(plano));
    else localStorage.removeItem(`sm_demo_plano_${dono}`);
  } catch {
    // sem armazenamento: a escolha só não é lembrada
  }
}

export function planoEfetivo(dono: DonoPlano, planoReal: PlanoAssinatura | undefined): PlanoAssinatura {
  return planoSimulado(dono) ?? planoReal ?? 'basico';
}

export function planoPago(plano: PlanoAssinatura): boolean {
  return plano === 'plus' || plano === 'premium';
}

// ---------------------------------------------------------------------------
// Investidor
// ---------------------------------------------------------------------------

export interface ExtraInvestidor {
  nome: string;
  telefone: string;
  email: string;
  linkedin: string;
  bio: string;
  procura: string;
  genero: Genero;
  /** Foto enviada (data URL). Vazio = usa o desenho gerado. */
  foto: string;
  verificado: boolean;
  /** Consentimento LGPD para mostrar telefone e e-mail às startups com plano pago. */
  mostrarContatos: boolean;
  estagios: EstagioStartup[];
  segmentos: string[];
  ticketMin: number;
  ticketMax: number;
  cidade: string;
  uf: string;
  plano: PlanoAssinatura;
  concluido: boolean;
}

export const LINKEDIN_PADRAO = 'https://www.linkedin.com/';

function slug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
}

function telefoneFicticio(semente: string): string {
  const h = hashTexto(semente);
  const a = 9000 + (h % 1000);
  const b = 1000 + ((h >>> 8) % 9000);
  return `(81) 9${a}-${b}`;
}

const BIOS_INVESTIDOR = [
  'Investe em fundadores do Nordeste desde 2018. Gosta de entrar cedo, ajudar nas primeiras vendas e abrir portas para outros investidores.',
  'Construiu e vendeu uma empresa de tecnologia antes de virar investidor. Hoje divide a experiência com times que querem validar rápido.',
  'Acredita em time forte, mercado claro e tração desde o primeiro cliente. Costuma acompanhar as startups de perto, com reuniões mensais.',
  'Executivo com mais de 15 anos de mercado. Apoia startups com mentoria, contatos comerciais e preparação para as próximas rodadas.',
];

export function extraInvestidorPadrao(inv: Investidor): ExtraInvestidor {
  const demo = 'slug' in inv ? demoInvestidor((inv as { slug: string }).slug) : undefined;
  const nome = inv.nome ?? 'Investidor';
  const segs = (inv.segmentos ?? []).map((s) => s.nome);
  const estagios = demo?.estagios ?? ['mvp', 'operacao'];
  const semente = `${nome}|${inv.id}`;
  return {
    nome,
    telefone: demo?.telefone ?? telefoneFicticio(semente),
    email: demo?.email ?? `${slug(nome) || 'investidor'}@exemplo.com.br`,
    linkedin: LINKEDIN_PADRAO,
    bio: demo?.bio ?? BIOS_INVESTIDOR[hashTexto(semente) % BIOS_INVESTIDOR.length],
    procura:
      demo?.procura ??
      `Startups em ${estagios.map((e) => ESTAGIO_LABEL[e]).join(' ou ')}${segs.length ? ` nos segmentos ${segs.join(', ')}` : ''}, com pedido entre ${dinheiroCurto(Number(inv.investimentoMin))} e ${dinheiroCurto(Number(inv.investimentoMax))}.`,
    genero: demo?.genero ?? generoPorNome(nome),
    foto: '',
    verificado: true,
    mostrarContatos: true,
    estagios,
    segmentos: segs,
    ticketMin: Number(inv.investimentoMin),
    ticketMax: Number(inv.investimentoMax),
    cidade: inv.cidade,
    uf: inv.uf,
    plano: inv.planoAssinatura ?? 'basico',
    concluido: false,
  };
}

export function extraInvestidor(inv: Investidor): ExtraInvestidor {
  return {
    ...extraInvestidorPadrao(inv),
    ...ler<Partial<ExtraInvestidor>>(`sm_investidor_perfil_${inv.id}`, {}),
  };
}

export function salvarExtraInvestidor(id: number, extra: ExtraInvestidor): boolean {
  return gravar(`sm_investidor_perfil_${id}`, extra);
}

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

export interface ExtraStartup {
  nome: string;
  fundador: string;
  generoFundador: Genero;
  email: string;
  telefone: string;
  linkedin: string;
  bio: string;
  /** Cor do logo gerado (0..5). null = automática. */
  logoCor: number | null;
  /** Foto da pessoa fundadora (data URL), opcional. */
  fotoFundador: string;
  estagio: EstagioStartup;
  segmentos: string[];
  investimento: number;
  cidade: string;
  uf: string;
  descricao: string;
  pitchTitulo: string;
  /** Nome do arquivo de vídeo "enviado" (só visual). Vazio = sem vídeo. */
  pitchArquivo: string;
  plano: PlanoAssinatura;
  concluido: boolean;
}

const BIOS_STARTUP = [
  'Começamos com um problema que vivemos na prática e hoje já temos clientes pagando. Buscamos parceiros que nos ajudem a crescer com responsabilidade.',
  'Um time pequeno e dedicado, com produto em uso e feedback semanal dos clientes. O investimento será usado em produto e vendas.',
  'Nascemos no Nordeste para resolver uma dor local com tecnologia. Já validamos o modelo e agora queremos escalar para novas cidades.',
];

export function extraStartupPadrao(st: Startup): ExtraStartup {
  const demo = 'slug' in st ? demoStartup((st as { slug: string }).slug) : undefined;
  const semente = `${st.nomeFantasia}|${st.id}`;
  const fundador = demo?.fundador ?? '';
  return {
    nome: st.nomeFantasia,
    fundador,
    generoFundador: demo?.generoFundador ?? (fundador ? generoPorNome(fundador) : 'f'),
    email: demo?.email ?? `contato@${slug(st.nomeFantasia).replace(/\./g, '') || 'startup'}.exemplo.com.br`,
    telefone: demo?.telefone ?? telefoneFicticio(semente),
    linkedin: LINKEDIN_PADRAO,
    bio: demo?.bio ?? BIOS_STARTUP[hashTexto(semente) % BIOS_STARTUP.length],
    logoCor: null,
    fotoFundador: '',
    estagio: st.estagio,
    segmentos: (st.segmentos ?? []).map((s) => s.nome),
    investimento: Number(st.investimentoPretendido),
    cidade: st.cidade,
    uf: st.uf,
    descricao: st.descricao,
    pitchTitulo: demo?.pitchTitulo ?? `${st.nomeFantasia} em 5 minutos`,
    pitchArquivo: '',
    plano: st.planoAssinatura ?? 'basico',
    concluido: false,
  };
}

export function extraStartup(st: Startup): ExtraStartup {
  return {
    ...extraStartupPadrao(st),
    ...ler<Partial<ExtraStartup>>(`sm_startup_perfil_${st.id}`, {}),
  };
}

export function salvarExtraStartup(id: number, extra: ExtraStartup): boolean {
  return gravar(`sm_startup_perfil_${id}`, extra);
}

// ---------------------------------------------------------------------------
// Compatibilidade startup × investidor (regras fixas)
// ---------------------------------------------------------------------------

export interface DadosStartupCompat {
  investimentoPretendido: number;
  estagio: EstagioStartup;
  uf: string;
  segmentos: { nome: string; principal?: boolean }[];
}

export interface DadosInvestidorCompat {
  investimentoMin: number;
  investimentoMax: number;
  uf: string;
  segmentos: { nome: string }[];
  estagios?: EstagioStartup[];
}

export interface ResultadoCompat {
  score: number;
  /** false = segmento ou valor claramente fora do que o investidor procura. */
  compativel: boolean;
  motivos: string[];
  avisos: string[];
}

const NORDESTE = ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'];

/**
 * Pontua o encaixe entre uma startup e um investidor:
 *   segmento em comum (até 45) + valor pedido dentro da faixa (até 35)
 *   + estágio (até 12) + região (até 8).
 * Sem segmento em comum, ou com valor muito fora da faixa, vira "incompatível".
 */
export function compatibilidade(st: DadosStartupCompat, inv: DadosInvestidorCompat): ResultadoCompat {
  const motivos: string[] = [];
  const avisos: string[] = [];
  let score = 0;

  // 1. segmento
  const nomesInv = inv.segmentos.map((s) => s.nome);
  const comuns = st.segmentos.filter((s) => nomesInv.includes(s.nome));
  const temSegmento = comuns.length > 0;
  if (temSegmento) {
    const principal = comuns.some((s) => s.principal);
    score += principal ? 45 : 32;
    motivos.push(`Mesmo segmento: ${comuns.map((s) => s.nome).join(', ')}`);
  } else {
    avisos.push('Não investe nos segmentos da sua startup');
  }

  // 2. valor pedido × ticket
  const pedido = Number(st.investimentoPretendido);
  const min = Number(inv.investimentoMin);
  const max = Number(inv.investimentoMax);
  let valorOk = true;
  if (pedido >= min && pedido <= max) {
    score += 35;
    motivos.push(`Seu pedido de ${dinheiroCurto(pedido)} cabe no ticket dele (${dinheiroCurto(min)} a ${dinheiroCurto(max)})`);
  } else if (pedido > max && pedido <= max * 1.5) {
    score += 14;
    avisos.push(`Seu pedido passa um pouco do ticket máximo (${dinheiroCurto(max)})`);
  } else if (pedido < min && pedido >= min * 0.6) {
    score += 14;
    avisos.push(`Seu pedido fica um pouco abaixo do ticket mínimo (${dinheiroCurto(min)})`);
  } else {
    valorOk = false;
    avisos.push(
      pedido > max
        ? `Ticket máximo de ${dinheiroCurto(max)}, abaixo do que você precisa`
        : `Ticket mínimo de ${dinheiroCurto(min)}, acima do que você precisa`,
    );
  }

  // 3. estágio
  if (inv.estagios?.length) {
    if (inv.estagios.includes(st.estagio)) {
      score += 12;
      motivos.push(`Investe em startups em ${ESTAGIO_LABEL[st.estagio]}`);
    } else {
      avisos.push(`Costuma investir em ${inv.estagios.map((e) => ESTAGIO_LABEL[e]).join(' ou ')}`);
    }
  } else {
    score += 6;
  }

  // 4. região
  if (inv.uf === st.uf) {
    score += 8;
    motivos.push(`Mesmo estado (${st.uf})`);
  } else if (NORDESTE.includes(inv.uf) && NORDESTE.includes(st.uf)) {
    score += 4;
    motivos.push('Também atua no Nordeste');
  }

  const compativel = temSegmento && valorOk;
  return { score: Math.min(99, Math.max(8, Math.round(score))), compativel, motivos, avisos };
}
