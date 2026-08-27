// src/scripts/types.ts
// =====================
// Só definições de tipos do TypeScript — nenhuma lógica aqui. Espelha o formato dos
// dados que o backend (NestJS) devolve nas respostas da API. Se um campo mudar no
// backend, é aqui que se ajusta primeiro (e o editor vai apontar todo lugar do
// frontend que quebrou por causa da mudança).
//
// Não precisa mexer neste arquivo para alterações visuais — só se o formato dos
// dados do backend mudar.

// "União de strings" — o tipo só aceita um desses valores exatos.
export type TipoUsuario = 'startup' | 'investidor' | 'mentor' | 'admin';
export type EstagioStartup = 'ideacao' | 'mvp' | 'operacao' | 'scale_up';
export type TipoInvestidor = 'anjo' | 'vc' | 'fundo' | 'corporate';
export type PlanoAssinatura = 'basico' | 'plus' | 'premium';
export type OrigemInteresse = 'startup' | 'investidor';
export type TipoConsentimento = 'termos_uso' | 'privacidade' | 'marketing';

// Usuário autenticado (tabela "usuario" no backend) — dados básicos de login.
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  criadoEm: string;
}

// Segmento de mercado (ex.: "Fintech", "Healthtech") vindo de GET /segments.
export interface Segmento {
  id: number;
  nome: string;
  slug: string;
  descricao?: string;
}

// Como uma Startup marca seus segmentos: um deles é o "principal" (checkbox + rádio
// na tela de cadastro-startup).
export interface SegmentoSelecionado {
  segmentoId: number;
  nome: string;
  principal: boolean;
}

// Como um Investidor marca seus segmentos de interesse: cada um tem uma prioridade
// numérica (1 = mais prioritário) em vez de um único "principal".
export interface SegmentoPrioridade {
  segmentoId: number;
  nome: string;
  prioridade: number;
}

// Perfil completo de uma Startup (o que aparece na busca/perfil/dashboard).
export interface Startup {
  id: number;
  nomeFantasia: string;
  cnpj?: string;
  descricao: string;
  estagio: EstagioStartup;
  investimentoPretendido: number;
  cidade: string;
  uf: string;
  planoAssinatura: PlanoAssinatura;
  segmentos: SegmentoSelecionado[];
}

// Perfil completo de um Investidor.
export interface Investidor {
  id: number;
  tipo: TipoInvestidor;
  teseInvestimento: string;
  investimentoMin: number;
  investimentoMax: number;
  cidade: string;
  uf: string;
  perfilPublico: boolean;
  planoAssinatura: PlanoAssinatura;
  segmentos: SegmentoPrioridade[];
}

// Perfil completo de um Mentor. vinculoPortoDigital é a flag que dá direito ao
// desconto de assinatura.
export interface Mentor {
  id: number;
  areaAtuacao: string;
  bio: string;
  especialidades: string[];
  vinculoPortoDigital: boolean;
  disponibilidade: string;
  planoAssinatura: PlanoAssinatura;
}

// Registro de "tenho interesse" de uma startup/investidor em outro perfil.
export interface Interesse {
  id: number;
  startupId: number;
  investidorId: number;
  origem: OrigemInteresse;
  criadoEm: string;
}

// Um "match" acontece quando o interesse é mútuo (startup e investidor demonstraram
// interesse um no outro). scoreCompatibilidade vem do algoritmo do backend.
export interface Match {
  id: number;
  startupId: number;
  investidorId: number;
  scoreCompatibilidade: number;
  criadoEm: string;
  startup?: Startup;
  investidor?: Investidor;
}

// Sugestão de compatibilidade mostrada nos dashboards (antes de virar match).
export interface Suggestion {
  score: number;
  startup?: Startup;
  investidor?: Investidor;
}

// Conversa de chat, criada automaticamente quando dá match.
export interface Conversa {
  id: number;
  matchId: number;
  criadaEm: string;
}

// Mensagem individual dentro de uma conversa.
export interface Mensagem {
  id: number;
  conversaId: number;
  remetenteId: number;
  conteudo: string;
  enviadaEm: string;
  lida: boolean;
}

// Business Model Canvas simplificado, preenchido pela startup na tela "canvas".
export interface PlanoNegocio {
  propostaValor: string;
  modeloReceita: string;
  publicoAlvo: string;
  estrategiaMonetizacao: string;
  atualizadoEm?: string;
}

// Formato padrão de respostas paginadas da API (busca de startups/investidores).
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Indicadores agregados do painel administrativo (GET /admin/metrics) — espelha
// AdminMetrics do backend (backend/src/modules/admin/admin.service.ts).
export interface AdminMetrics {
  totalUsuarios: number;
  usuariosPorTipo: Record<string, number>;
  totalStartups: number;
  startupsPorPlano: Record<string, number>;
  startupsPorEstagio: Record<string, number>;
  totalInvestidores: number;
  investidoresPorPlano: Record<string, number>;
  totalMentores: number;
  mentoresPortoDigital: number;
  totalMatches: number;
}

// Formato padrão de erro que o NestJS devolve quando algo dá errado.
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}
