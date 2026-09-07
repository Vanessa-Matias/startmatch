// src/scripts/mockData.ts
// =========================
// Dados de mentira usados pelo "modo demonstração" (ver mock.ts) — deixam o site
// inteiro navegável e com conteúdo real na tela SEM precisar de backend nem banco
// de dados rodando. Pensado pra Agnes conseguir estilizar qualquer tela, na hora,
// sem depender de ninguém subir infraestrutura.
//
// Os nomes/valores aqui são os MESMOS da seed de teste do backend
// (backend/src/database/seeds/usuarios-teste.seed.ts) — quando o banco de dados
// real entrar (Vanessa desliga o modo demonstração, ver mock.ts), os dados que a
// Agnes já viu na tela vão ser bem parecidos com os dados reais.

import type {
  AdminMetrics,
  AuditLogItem,
  Conversa,
  Interesse,
  Investidor,
  Match,
  Mensagem,
  Mentor,
  LgpdSummary,
  PlanoNegocio,
  Segmento,
  Startup,
  Suggestion,
  Usuario,
} from './types';

export const MOCK_SEGMENTOS: Segmento[] = [
  { id: 1, nome: 'Fintech', slug: 'fintech' },
  { id: 2, nome: 'Healthtech', slug: 'healthtech' },
  { id: 3, nome: 'Edtech', slug: 'edtech' },
  { id: 4, nome: 'Agtech', slug: 'agtech' },
  { id: 5, nome: 'SaaS B2B', slug: 'saas-b2b' },
  { id: 6, nome: 'Martech', slug: 'martech' },
  { id: 7, nome: 'Logtech', slug: 'logtech' },
  { id: 8, nome: 'Retailtech', slug: 'retailtech' },
  { id: 9, nome: 'Greentech / Cleantech', slug: 'greentech' },
  { id: 10, nome: 'Cybersecurity', slug: 'cybersecurity' },
  { id: 11, nome: 'Mobtech', slug: 'mobtech' },
  { id: 12, nome: 'Economia Criativa', slug: 'economia-criativa' },
];

export const MOCK_STARTUPS: Startup[] = [
  {
    id: 1,
    nomeFantasia: 'Nortech Soluções',
    descricao: 'Plataforma de gestão financeira para pequenos negócios do Porto Digital.',
    estagio: 'mvp',
    investimentoPretendido: 250000,
    cidade: 'Recife',
    uf: 'PE',
    planoAssinatura: 'basico',
    segmentos: [
      { segmentoId: 1, nome: 'Fintech', principal: true },
      { segmentoId: 5, nome: 'SaaS B2B', principal: false },
    ],
  },
  {
    id: 2,
    nomeFantasia: 'VitalCare Health',
    descricao: 'Telemedicina e acompanhamento remoto de pacientes crônicos.',
    estagio: 'operacao',
    investimentoPretendido: 600000,
    cidade: 'Olinda',
    uf: 'PE',
    planoAssinatura: 'plus',
    segmentos: [{ segmentoId: 2, nome: 'Healthtech', principal: true }],
  },
];

export const MOCK_INVESTIDORES: Investidor[] = [
  {
    id: 1,
    tipo: 'anjo',
    teseInvestimento: 'Fintechs e SaaS B2B em estágio inicial no Nordeste, com foco em Recife.',
    investimentoMin: 100000,
    investimentoMax: 400000,
    cidade: 'Recife',
    uf: 'PE',
    perfilPublico: true,
    planoAssinatura: 'basico',
    segmentos: [
      { segmentoId: 1, nome: 'Fintech', prioridade: 1 },
      { segmentoId: 5, nome: 'SaaS B2B', prioridade: 2 },
    ],
  },
  {
    id: 2,
    tipo: 'vc',
    teseInvestimento: 'Healthtechs em fase de operação/tração no Nordeste.',
    investimentoMin: 300000,
    investimentoMax: 1000000,
    cidade: 'São Paulo',
    uf: 'SP',
    perfilPublico: true,
    planoAssinatura: 'premium',
    segmentos: [{ segmentoId: 2, nome: 'Healthtech', prioridade: 1 }],
  },
];

export const MOCK_MENTORES: Mentor[] = [
  {
    id: 1,
    areaAtuacao: 'Growth e captação de investimento',
    bio: 'Mais de 10 anos ajudando startups do Porto Digital a captar investimento-anjo.',
    especialidades: ['growth', 'fundraising', 'produto'],
    vinculoPortoDigital: true,
    disponibilidade: '2 sessões por mês, terças à tarde.',
    planoAssinatura: 'basico',
  },
  {
    id: 2,
    areaAtuacao: 'Produto e experiência do usuário',
    bio: 'Ex-líder de produto em duas startups do ecossistema nordestino.',
    especialidades: ['produto', 'ux', 'pesquisa com usuários'],
    vinculoPortoDigital: false,
    disponibilidade: '1 sessão por mês, sob consulta.',
    planoAssinatura: 'basico',
  },
];

export const MOCK_MATCH: Match = {
  id: 1,
  startupId: 1,
  investidorId: 1,
  scoreCompatibilidade: 82,
  criadoEm: new Date('2026-08-10T12:00:00Z').toISOString(),
  startup: MOCK_STARTUPS[0],
  investidor: MOCK_INVESTIDORES[0],
};

export const MOCK_MATCHES: Match[] = [MOCK_MATCH];

export const MOCK_SUGGESTIONS_PARA_STARTUP: Suggestion[] = [
  { score: 82, investidor: MOCK_INVESTIDORES[0] },
  { score: 41, investidor: MOCK_INVESTIDORES[1] },
];

export const MOCK_SUGGESTIONS_PARA_INVESTIDOR: Suggestion[] = [
  { score: 82, startup: MOCK_STARTUPS[0] },
  { score: 37, startup: MOCK_STARTUPS[1] },
];

export const MOCK_INTERESSES_RECEBIDOS: Interesse[] = [
  {
    id: 1,
    startupId: 1,
    investidorId: 2,
    origem: 'investidor',
    criadoEm: new Date('2026-08-12T09:00:00Z').toISOString(),
  },
];

export const MOCK_INTERESSES_ENVIADOS: Interesse[] = [
  {
    id: 2,
    startupId: 1,
    investidorId: 1,
    origem: 'startup',
    criadoEm: new Date('2026-08-09T09:00:00Z').toISOString(),
  },
];

export const MOCK_CONVERSA: Conversa = {
  id: 1,
  matchId: 1,
  criadaEm: new Date('2026-08-10T12:05:00Z').toISOString(),
};

export const MOCK_CONVERSAS: Conversa[] = [MOCK_CONVERSA];

export const MOCK_MENSAGENS: Mensagem[] = [
  {
    id: 1,
    conversaId: 1,
    remetenteId: 101,
    conteudo: 'Olá! Vi seu perfil e gostei muito da proposta da Nortech. Podemos conversar?',
    enviadaEm: new Date('2026-08-10T12:06:00Z').toISOString(),
    lida: true,
  },
  {
    id: 2,
    conversaId: 1,
    remetenteId: 100,
    conteudo: 'Olá! Claro, ficamos muito felizes com o interesse. Podemos marcar uma call essa semana.',
    enviadaEm: new Date('2026-08-10T12:20:00Z').toISOString(),
    lida: true,
  },
];

export const MOCK_PLANO_NEGOCIO: PlanoNegocio = {
  propostaValor: 'Gestão financeira simplificada para pequenos negócios do Porto Digital.',
  segmentosClientes: 'Pequenas empresas e MEIs do ecossistema Porto Digital, 1 a 20 funcionários.',
  canais: 'Aplicativo web (PWA), parcerias com aceleradoras locais e indicação entre usuários.',
  relacionamentoClientes: 'Autoatendimento via plataforma, com suporte por chat para dúvidas de conta.',
  fontesReceita: 'Assinatura mensal (SaaS) com planos escalonados por volume de transações.',
  recursosChave: 'Equipe de desenvolvimento, infraestrutura em nuvem e algoritmo de conciliação.',
  atividadesChave: 'Desenvolvimento do produto, suporte ao cliente e integrações bancárias.',
  parceriasChave: 'Bancos parceiros (open finance), contadores e aceleradoras do Porto Digital.',
  estruturaCustos: 'Hospedagem em nuvem, folha de pagamento da equipe técnica e marketing de aquisição.',
};

export const MOCK_ADMIN_METRICS: AdminMetrics = {
  totalUsuarios: 6,
  usuariosPorTipo: { startup: 2, investidor: 2, mentor: 1, admin: 1 },
  totalStartups: 2,
  startupsPorPlano: { basico: 1, plus: 1, premium: 0 },
  startupsPorEstagio: { ideacao: 0, mvp: 1, operacao: 1, scale_up: 0 },
  totalInvestidores: 2,
  investidoresPorPlano: { basico: 1, plus: 0, premium: 1 },
  totalMentores: 2,
  mentoresPortoDigital: 1,
  totalMatches: 1,
};

// IDs de usuário (tabela "usuario") — usados nas mensagens (remetenteId) e na
// listagem de admin-usuarios. 100+ pra não colidir visualmente com os ids de
// perfil (startup/investidor/mentor), que começam em 1.
export const MOCK_USUARIOS: Usuario[] = [
  { id: 100, nome: 'Startup Teste', email: 'startup@teste.com', tipo: 'startup', criadoEm: new Date('2026-08-01T10:00:00Z').toISOString() },
  { id: 103, nome: 'Startup Teste 2', email: 'startup2@teste.com', tipo: 'startup', criadoEm: new Date('2026-08-02T10:00:00Z').toISOString() },
  { id: 101, nome: 'Investidor Teste', email: 'investidor@teste.com', tipo: 'investidor', criadoEm: new Date('2026-08-01T11:00:00Z').toISOString() },
  { id: 104, nome: 'Investidor Teste 2', email: 'investidor2@teste.com', tipo: 'investidor', criadoEm: new Date('2026-08-02T11:00:00Z').toISOString() },
  { id: 102, nome: 'Mentor Teste', email: 'mentor@teste.com', tipo: 'mentor', criadoEm: new Date('2026-08-01T12:00:00Z').toISOString() },
  { id: 105, nome: 'Admin Teste', email: 'admin@teste.com', tipo: 'admin', criadoEm: new Date('2026-08-01T09:00:00Z').toISOString() },
];

// Usuario "logado" de cada papel, usado pelo modo demonstração pra fabricar uma
// sessão instantânea (ver auth.ts / requireAuth) — mesmos ids de MOCK_USUARIOS.
export const MOCK_USUARIO_POR_TIPO: Record<Usuario['tipo'], Usuario> = {
  startup: MOCK_USUARIOS[0],
  investidor: MOCK_USUARIOS[2],
  mentor: MOCK_USUARIOS[4],
  admin: MOCK_USUARIOS[5],
};

// Histórico de auditoria de demonstração (GET /admin/audit-log) — alguns
// eventos plausíveis usando as próprias contas de teste, só para a tela
// admin-auditoria não abrir vazia no modo demonstração.
export const MOCK_AUDIT_LOG: AuditLogItem[] = [
  {
    data: '05/09/2026, 09:12',
    dataISO: '2026-09-05',
    usuario: 'Startup Teste',
    email: 'startup@teste.com',
    tipo: 'cadastro',
    evento: 'Cadastro de conta',
    acao: 'Conta criada como startup',
    resultado: 'Sucesso',
    origem: 'Web',
  },
  {
    data: '05/09/2026, 09:15',
    dataISO: '2026-09-05',
    usuario: 'Investidor Teste',
    email: 'investidor@teste.com',
    tipo: 'cadastro',
    evento: 'Cadastro de conta',
    acao: 'Conta criada como investidor',
    resultado: 'Sucesso',
    origem: 'Web',
  },
  {
    data: '06/09/2026, 08:47',
    dataISO: '2026-09-06',
    usuario: 'Mentor Teste',
    email: 'mentor@teste.com',
    tipo: 'mentor',
    evento: 'Perfil de mentor',
    acao: 'Perfil de mentor criado (Growth e captação de investimento)',
    resultado: 'Sucesso',
    origem: 'Web',
  },
  {
    data: '06/09/2026, 18:03',
    dataISO: '2026-09-06',
    usuario: 'Startup Teste',
    email: 'startup@teste.com',
    tipo: 'lgpd',
    evento: 'Consentimento LGPD',
    acao: 'Consentimento de "termos_uso" aceito',
    resultado: 'Sucesso',
    origem: 'Web',
  },
  {
    data: '07/09/2026, 10:22',
    dataISO: '2026-09-07',
    usuario: 'Investidor Teste',
    email: 'investidor@teste.com',
    tipo: 'login',
    evento: 'Login',
    acao: 'Login realizado',
    resultado: 'Sucesso',
    origem: 'Web',
  },
  {
    data: '07/09/2026, 10:24',
    dataISO: '2026-09-07',
    usuario: 'Admin Teste',
    email: 'admin@teste.com',
    tipo: 'login',
    evento: 'Login',
    acao: 'Tentativa de login com senha incorreta',
    resultado: 'Falha',
    origem: 'Web',
  },
];

// Resumo de consentimentos LGPD de demonstração (GET /admin/lgpd-summary).
export const MOCK_LGPD_SUMMARY: LgpdSummary = {
  totalUsuarios: MOCK_USUARIOS.length,
  totalConsentimentosAceitos: 5,
  porTipo: { termos_uso: 3, privacidade: 1, marketing: 1 },
};

