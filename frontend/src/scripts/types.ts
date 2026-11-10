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
  /** Nome do investidor (vem do usuário dono do perfil). */
  nome?: string;
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

// Como a mentoria acontece (o mentor escolhe no perfil).
export type ModalidadeMentor = 'presencial' | 'hibrido' | 'remoto';

// Perfil completo de um Mentor. O mentor é voluntário e NÃO paga assinatura.
// vinculoPortoDigital mostra o selo "Parceiro Porto Digital".
export interface Mentor {
  id: number;
  /** Id do USUÁRIO dono do perfil (usado para iniciar conversa direta). */
  usuarioId: number;
  nome?: string;
  areaAtuacao: string;
  bio: string;
  especialidades: string[];
  vinculoPortoDigital: boolean;
  /** Dias e horários em texto livre. */
  disponibilidade: string;
  /** 30 ou 60. */
  duracaoMinutos: number;
  mentoriasPorMes: number;
  modalidade: ModalidadeMentor;
}

export type StatusMentoria =
  | 'pendente'
  | 'aceita'
  | 'recusada'
  | 'realizada'
  | 'cancelada';

// Mentoria agendada por uma startup com um mentor (GET /mentorias).
export interface Mentoria {
  id: number;
  mentorId: number;
  mentorNome: string;
  mentorUsuarioId: number;
  startupId: number;
  startupNome: string;
  startupUsuarioId: number;
  startupCidade: string;
  startupUf: string;
  dataHora: string;
  tema: string;
  mensagem: string;
  status: StatusMentoria;
  duracaoMinutos: number;
  modalidade: ModalidadeMentor;
  codigoCertificado: string | null;
  realizadaEm: string | null;
  criadoEm: string;
}

// Certificado de uma mentoria realizada (GET /mentorias/:id/certificado).
export interface CertificadoMentoria {
  codigo: string;
  mentorNome: string;
  startupNome: string;
  dataHora: string;
  duracaoMinutos: number;
  modalidade: ModalidadeMentor;
  tema: string;
  emitidoEm: string | null;
}

// Cota mensal do plano (GET /interests/quota e GET /mentorias/quota).
export interface CotaMensal {
  plano: PlanoAssinatura;
  /** null = sem limite. */
  limite: number | null;
  usados: number;
  restantes: number | null;
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

// Conversa de chat. De match: criada automaticamente quando dá match. Direta: o
// mentor conversa com uma startup ou investidor sem precisar de match.
export interface Conversa {
  id: number;
  matchId: number | null;
  tipo: 'match' | 'direta';
  /** Nome de com quem a pessoa está falando. */
  titulo: string;
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

// Business Model Canvas completo (9 blocos), preenchido pela startup na tela
// "canvas". Espelha PlanoNegocio do backend
// (backend/src/modules/business-canvas/entities/plano-negocio.entity.ts).
export interface PlanoNegocio {
  propostaValor: string;
  segmentosClientes: string;
  canais: string;
  relacionamentoClientes: string;
  fontesReceita: string;
  recursosChave: string;
  atividadesChave: string;
  parceriasChave: string;
  estruturaCustos: string;
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

// Um evento do histórico de auditoria (GET /admin/audit-log, tela
// admin-auditoria) — espelha AuditLogItemDto do backend
// (backend/src/modules/audit/dto/audit-log-response.dto.ts).
export interface AuditLogItem {
  data: string;
  dataISO: string;
  usuario: string;
  email: string;
  tipo: 'cadastro' | 'login' | 'plano' | 'mentor' | 'lgpd';
  evento: string;
  acao: string;
  resultado: 'Sucesso' | 'Falha' | 'Pendente';
  origem: string;
}

// Resumo agregado de consentimentos LGPD (GET /admin/lgpd-summary, tela
// admin-lgpd) — espelha LgpdSummary do backend
// (backend/src/modules/admin/admin.service.ts).
export interface LgpdSummary {
  totalUsuarios: number;
  totalConsentimentosAceitos: number;
  porTipo: Record<string, number>;
}

// Formato padrão de erro que o NestJS devolve quando algo dá errado.
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}
