// src/scripts/demoData.ts
// ========================
// Perfis FICTÍCIOS de investidores e startups, usados só na demonstração.
//
// Servem para:
//   - a tela "Investidores compatíveis" (startup Premium) ter pessoas suficientes
//     para mostrar a IA ordenando, mesmo que o banco tenha poucos investidores;
//   - os perfis abrirem com foto, biografia e contatos nas conversas e matches
//     de exemplo (?demo=<slug> nas telas de perfil).
//
// Nada daqui vem do nem vai para o banco de dados. Os nomes são inventados;
// qualquer semelhança com pessoas reais é coincidência.

import type { Genero } from './avatars';
import type { EstagioStartup, Investidor, Startup } from './types';

export interface DemoInvestidor extends Investidor {
  slug: string;
  nome: string;
  genero: Genero;
  /** true = grupo/fundo (usa logo em vez de rosto). */
  grupo?: boolean;
  bio: string;
  procura: string;
  telefone: string;
  email: string;
  estagios: EstagioStartup[];
}

export interface DemoStartup extends Startup {
  slug: string;
  fundador: string;
  generoFundador: Genero;
  bio: string;
  pitchTitulo: string;
  email: string;
  telefone: string;
}

let proximoId = 9000;
const novoId = (): number => (proximoId += 1);

export const DEMO_INVESTIDORES: DemoInvestidor[] = [
  {
    id: novoId(),
    slug: 'carlos-menezes',
    nome: 'Carlos Menezes',
    genero: 'm',
    tipo: 'anjo',
    teseInvestimento: 'SaaS B2B e fintechs do MVP à operação, com receita recorrente e time técnico forte.',
    investimentoMin: 50000,
    investimentoMax: 300000,
    cidade: 'Recife',
    uf: 'PE',
    perfilPublico: true,
    planoAssinatura: 'premium',
    segmentos: [
      { segmentoId: 5, nome: 'SaaS B2B', prioridade: 1 },
      { segmentoId: 1, nome: 'Fintech', prioridade: 2 },
    ],
    bio: 'Ex-diretor de tecnologia em uma empresa do Porto Digital. Há 8 anos investe como anjo em fundadores do Nordeste e gosta de ajudar nas primeiras vendas B2B.',
    procura: 'Startups em MVP ou operação, com cobrança recorrente e clientes pagantes, que busquem de R$ 50 mil a R$ 300 mil.',
    telefone: '(81) 99871-2043',
    email: 'carlos.menezes@exemplo.com.br',
    estagios: ['mvp', 'operacao'],
  },
  {
    id: novoId(),
    slug: 'fernanda-lins',
    nome: 'Fernanda Lins',
    genero: 'f',
    tipo: 'anjo',
    teseInvestimento: 'Healthtechs e edtechs com tração inicial e impacto social no Nordeste.',
    investimentoMin: 80000,
    investimentoMax: 250000,
    cidade: 'Recife',
    uf: 'PE',
    perfilPublico: true,
    planoAssinatura: 'plus',
    segmentos: [
      { segmentoId: 2, nome: 'Healthtech', prioridade: 1 },
      { segmentoId: 3, nome: 'Edtech', prioridade: 2 },
    ],
    bio: 'Médica e empreendedora. Fundou uma clínica digital e hoje apoia times que usam tecnologia para ampliar o acesso à saúde e à educação.',
    procura: 'Startups de saúde e educação em ideação ou MVP, com fundadores dedicados em tempo integral.',
    telefone: '(81) 99644-1180',
    email: 'fernanda.lins@exemplo.com.br',
    estagios: ['ideacao', 'mvp'],
  },
  {
    id: novoId(),
    slug: 'rede-nordeste-anjos',
    nome: 'Rede Nordeste Anjos',
    genero: 'f',
    grupo: true,
    tipo: 'fundo',
    teseInvestimento: 'Coinvestimento em agronegócio, energia limpa e impacto, com rodadas mensais.',
    investimentoMin: 200000,
    investimentoMax: 800000,
    cidade: 'Fortaleza',
    uf: 'CE',
    perfilPublico: true,
    planoAssinatura: 'premium',
    segmentos: [
      { segmentoId: 4, nome: 'Agtech', prioridade: 1 },
      { segmentoId: 9, nome: 'Greentech / Cleantech', prioridade: 2 },
    ],
    bio: 'Grupo de 24 investidores-anjo do Ceará e de Pernambuco. Avalia startups todo mês e investe em conjunto, dividindo risco e experiência.',
    procura: 'Startups com operação rodando e pedido de R$ 200 mil a R$ 800 mil, dispostas a apresentar o pitch ao grupo.',
    telefone: '(85) 3221-7788',
    email: 'contato@redenordesteanjos.exemplo.com.br',
    estagios: ['operacao', 'scale_up'],
  },
  {
    id: novoId(),
    slug: 'paulo-arruda',
    nome: 'Paulo Arruda',
    genero: 'm',
    tipo: 'anjo',
    teseInvestimento: 'Marketplaces, logística e varejo com modelo de receita recorrente.',
    investimentoMin: 100000,
    investimentoMax: 500000,
    cidade: 'Olinda',
    uf: 'PE',
    perfilPublico: true,
    planoAssinatura: 'plus',
    segmentos: [
      { segmentoId: 7, nome: 'Logtech', prioridade: 1 },
      { segmentoId: 8, nome: 'Retailtech', prioridade: 2 },
    ],
    bio: 'Ex-fundador de um marketplace de entregas vendido em 2021. Investe em operações de logística e comércio e participa do dia a dia como conselheiro.',
    procura: 'Operações em MVP ou em crescimento, com métricas claras de entrega e custo por cliente.',
    telefone: '(81) 99512-6671',
    email: 'paulo.arruda@exemplo.com.br',
    estagios: ['mvp', 'operacao'],
  },
  {
    id: novoId(),
    slug: 'juliana-barros',
    nome: 'Juliana Barros',
    genero: 'f',
    tipo: 'anjo',
    teseInvestimento: 'Fintechs e SaaS B2B de gestão para pequenos negócios.',
    investimentoMin: 150000,
    investimentoMax: 600000,
    cidade: 'Recife',
    uf: 'PE',
    perfilPublico: true,
    planoAssinatura: 'plus',
    segmentos: [
      { segmentoId: 1, nome: 'Fintech', prioridade: 1 },
      { segmentoId: 5, nome: 'SaaS B2B', prioridade: 2 },
      { segmentoId: 6, nome: 'Martech', prioridade: 3 },
    ],
    bio: 'Ex-executiva de banco digital. Apoia fundadoras e fundadores que constroem produtos financeiros simples para quem empreende.',
    procura: 'Fintechs e SaaS em MVP ou operação, com foco em pequenas empresas e pedido entre R$ 150 mil e R$ 600 mil.',
    telefone: '(81) 99733-9054',
    email: 'juliana.barros@exemplo.com.br',
    estagios: ['mvp', 'operacao'],
  },
  {
    id: novoId(),
    slug: 'helena-duarte',
    nome: 'Helena Duarte',
    genero: 'f',
    tipo: 'vc',
    teseInvestimento: 'Rodadas Série A em cibersegurança e fintechs com expansão nacional.',
    investimentoMin: 1500000,
    investimentoMax: 5000000,
    cidade: 'São Paulo',
    uf: 'SP',
    perfilPublico: true,
    planoAssinatura: 'premium',
    segmentos: [
      { segmentoId: 10, nome: 'Cybersecurity', prioridade: 1 },
      { segmentoId: 1, nome: 'Fintech', prioridade: 2 },
    ],
    bio: 'Sócia de um fundo de venture capital. Prefere empresas que já faturam e querem escalar no Brasil inteiro.',
    procura: 'Startups em scale-up com faturamento recorrente e rodadas de R$ 1,5 milhão ou mais.',
    telefone: '(11) 3042-5560',
    email: 'helena.duarte@exemplo.com.br',
    estagios: ['scale_up'],
  },
  {
    id: novoId(),
    slug: 'roberto-siqueira',
    nome: 'Roberto Siqueira',
    genero: 'm',
    tipo: 'corporate',
    teseInvestimento: 'Programa corporativo de cheques pequenos para ideias em educação e economia criativa.',
    investimentoMin: 20000,
    investimentoMax: 60000,
    cidade: 'Salvador',
    uf: 'BA',
    perfilPublico: true,
    planoAssinatura: 'basico',
    segmentos: [
      { segmentoId: 3, nome: 'Edtech', prioridade: 1 },
      { segmentoId: 12, nome: 'Economia Criativa', prioridade: 2 },
    ],
    bio: 'Coordena o programa de inovação aberta de uma empresa de comunicação. Faz aportes pequenos para validar ideias e abrir contratos piloto.',
    procura: 'Ideias em estágio inicial que precisem de um primeiro cheque e de um cliente piloto.',
    telefone: '(71) 99318-4420',
    email: 'roberto.siqueira@exemplo.com.br',
    estagios: ['ideacao'],
  },
];

export const DEMO_STARTUPS: DemoStartup[] = [
  {
    id: novoId(),
    slug: 'agrosense',
    nomeFantasia: 'AgroSense',
    fundador: 'Marina Albuquerque',
    generoFundador: 'f',
    descricao: 'Sensores e dados para irrigação inteligente no Vale do São Francisco.',
    estagio: 'operacao',
    investimentoPretendido: 450000,
    cidade: 'Petrolina',
    uf: 'PE',
    planoAssinatura: 'premium',
    segmentos: [
      { segmentoId: 4, nome: 'Agtech', principal: true },
      { segmentoId: 9, nome: 'Greentech / Cleantech', principal: false },
    ],
    bio: 'Nascemos em uma fazenda de uva em Petrolina. Nossos sensores reduzem até 30% do consumo de água e já monitoram 1.200 hectares.',
    pitchTitulo: 'AgroSense: menos água, mais safra',
    email: 'contato@agrosense.exemplo.com.br',
    telefone: '(87) 99144-2310',
  },
  {
    id: novoId(),
    slug: 'clinica-facil',
    nomeFantasia: 'Clínica Fácil',
    fundador: 'Rafael Tavares',
    generoFundador: 'm',
    descricao: 'Agendamento e prontuário on-line para clínicas de pequeno porte.',
    estagio: 'mvp',
    investimentoPretendido: 180000,
    cidade: 'Recife',
    uf: 'PE',
    planoAssinatura: 'plus',
    segmentos: [
      { segmentoId: 2, nome: 'Healthtech', principal: true },
      { segmentoId: 5, nome: 'SaaS B2B', principal: false },
    ],
    bio: 'Atendemos 40 clínicas de bairro em Recife. O agendamento pelo WhatsApp reduziu em 35% as faltas dos pacientes.',
    pitchTitulo: 'Clínica Fácil em 5 minutos',
    email: 'ola@clinicafacil.exemplo.com.br',
    telefone: '(81) 99620-7788',
  },
  {
    id: novoId(),
    slug: 'edulab',
    nomeFantasia: 'EduLab',
    fundador: 'Beatriz Nogueira',
    generoFundador: 'f',
    descricao: 'Plataforma de reforço escolar com trilhas personalizadas por IA.',
    estagio: 'mvp',
    investimentoPretendido: 120000,
    cidade: 'Caruaru',
    uf: 'PE',
    planoAssinatura: 'basico',
    segmentos: [{ segmentoId: 3, nome: 'Edtech', principal: true }],
    bio: 'Professores e engenheiros em Caruaru criando trilhas de estudo que se adaptam ao ritmo de cada aluno da rede pública.',
    pitchTitulo: 'EduLab: cada aluno no seu ritmo',
    email: 'contato@edulab.exemplo.com.br',
    telefone: '(81) 99455-1209',
  },
  {
    id: novoId(),
    slug: 'rota-verde',
    nomeFantasia: 'Rota Verde',
    fundador: 'Diego Cavalcanti',
    generoFundador: 'm',
    descricao: 'Logística de última milha com veículos elétricos para o comércio local.',
    estagio: 'operacao',
    investimentoPretendido: 320000,
    cidade: 'Jaboatão dos Guararapes',
    uf: 'PE',
    planoAssinatura: 'plus',
    segmentos: [
      { segmentoId: 7, nome: 'Logtech', principal: true },
      { segmentoId: 9, nome: 'Greentech / Cleantech', principal: false },
    ],
    bio: 'Entregamos para 200 lojas do comércio local com uma frota 100% elétrica. Cada entrega evita cerca de 1,2 kg de CO₂.',
    pitchTitulo: 'Rota Verde: a entrega que não polui',
    email: 'contato@rotaverde.exemplo.com.br',
    telefone: '(81) 99388-6402',
  },
];

export function demoInvestidor(slug: string): DemoInvestidor | undefined {
  return DEMO_INVESTIDORES.find((i) => i.slug === slug);
}

export function demoStartup(slug: string): DemoStartup | undefined {
  return DEMO_STARTUPS.find((s) => s.slug === slug);
}
