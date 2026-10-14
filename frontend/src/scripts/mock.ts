// src/scripts/mock.ts
// =====================
// "Modo demonstração": intercepta toda chamada de api.ts ANTES dela ir pra rede e
// devolve dados de mentira (mockData.ts) na hora — o site inteiro fica navegável
// e com conteúdo real na tela sem precisar de backend nem banco de dados rodando.
//
// Isso existe pra Agnes conseguir estilizar QUALQUER tela imediatamente, incluindo
// entrar/cadastrar/ver dashboards de qualquer papel, sem depender de ninguém subir
// Postgres. Quando o banco de dados estiver pronto, a Vanessa desliga isso com UMA
// linha (ver MOCK_MODE logo abaixo) e o site volta a falar com a API de verdade —
// nenhuma tela precisa mudar.
//
// Não precisa mexer neste arquivo para alterações visuais.

import type { AuthResponse } from './auth';
import type {
  Interesse,
  Investidor,
  Mensagem,
  PaginatedResponse,
  Startup,
  TipoUsuario,
  Usuario,
} from './types';
import {
  MOCK_ADMIN_METRICS,
  MOCK_AUDIT_LOG,
  MOCK_CONVERSAS,
  MOCK_INTERESSES_ENVIADOS,
  MOCK_INTERESSES_RECEBIDOS,
  MOCK_INVESTIDORES,
  MOCK_LGPD_SUMMARY,
  MOCK_MATCHES,
  MOCK_MENSAGENS,
  MOCK_MENTORES,
  MOCK_PLANO_NEGOCIO,
  MOCK_SEGMENTOS,
  MOCK_STARTUPS,
  MOCK_SUGGESTIONS_PARA_INVESTIDOR,
  MOCK_SUGGESTIONS_PARA_STARTUP,
  MOCK_USUARIO_POR_TIPO,
  MOCK_USUARIOS,
} from './mockData';

// ============================================================================
// LIGA/DESLIGA O MODO DEMONSTRAÇÃO AQUI
// ============================================================================
// Por padrão o site fala com a API REAL (só aceita e-mails cadastrados).
// O modo demonstração (aceita qualquer e-mail/senha, dados de mentira) só liga
// se existir VITE_MOCK_MODE=true no .env do frontend — use só para estilizar telas.
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

// -----------------------------------------------------------------------------
// PERFIS DO MODO DEMONSTRAÇÃO
// -----------------------------------------------------------------------------
// Cada perfil pertence a um USUÁRIO específico. Startup e Investidor nunca
// compartilham a mesma chave de armazenamento, mesmo quando possuem o mesmo
// número de id no mock.
const USER_KEY = 'sc_user';
const STARTUP_PROFILES_KEY = 'sc_mock_startup_profiles';
const INVESTOR_PROFILES_KEY = 'sc_mock_investor_profiles';

function getMockCurrentUser(): Usuario | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

function readProfileStore<T>(key: string): Record<string, T> {
  const raw = localStorage.getItem(key);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, T>;
  } catch {
    return {};
  }
}

function writeProfileStore<T>(key: string, store: Record<string, T>): void {
  localStorage.setItem(key, JSON.stringify(store));
}

function getStartupForCurrentUser(): Startup {
  const usuario = getMockCurrentUser();
  const store = readProfileStore<Startup>(STARTUP_PROFILES_KEY);
  const saved = usuario ? store[String(usuario.id)] : undefined;

  const startupIdByUserId: Record<number, number> = {
    100: 1,
    103: 2,
  };
  const fallbackId = usuario ? startupIdByUserId[usuario.id] ?? 1 : 1;

  return saved ?? MOCK_STARTUPS.find((startup) => startup.id === fallbackId) ?? MOCK_STARTUPS[0];
}

function getInvestorForCurrentUser(): Investidor {
  const usuario = getMockCurrentUser();
  const store = readProfileStore<Investidor>(INVESTOR_PROFILES_KEY);
  const saved = usuario ? store[String(usuario.id)] : undefined;

  const investorIdByUserId: Record<number, number> = {
    101: 1,
    104: 2,
  };
  const fallbackId = usuario ? investorIdByUserId[usuario.id] ?? 1 : 1;

  return saved ?? MOCK_INVESTIDORES.find((investidor) => investidor.id === fallbackId) ?? MOCK_INVESTIDORES[0];
}

function saveStartupForCurrentUser(body: Record<string, unknown>): Startup {
  const usuario = getMockCurrentUser();
  const current = getStartupForCurrentUser();
  const profile: Startup = {
    ...current,
    ...body,
    id: current.id,
  } as Startup;

  if (usuario) {
    const store = readProfileStore<Startup>(STARTUP_PROFILES_KEY);
    store[String(usuario.id)] = profile;
    writeProfileStore(STARTUP_PROFILES_KEY, store);
  }

  return profile;
}

function saveInvestorForCurrentUser(body: Record<string, unknown>): Investidor {
  const usuario = getMockCurrentUser();
  const current = getInvestorForCurrentUser();
  const profile: Investidor = {
    ...current,
    ...body,
    id: current.id,
  } as Investidor;

  if (usuario) {
    const store = readProfileStore<Investidor>(INVESTOR_PROFILES_KEY);
    store[String(usuario.id)] = profile;
    writeProfileStore(INVESTOR_PROFILES_KEY, store);
  }

  return profile;
}

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paginated<T>(items: T[]): PaginatedResponse<T> {
  return { items, total: items.length, page: 1, limit: Math.max(items.length, 12) };
}

function inferirTipoPorEmail(email: string): TipoUsuario {
  const prefixo = email.split('@')[0]?.toLowerCase() ?? '';
  if (prefixo.startsWith('investidor')) return 'investidor';
  if (prefixo.startsWith('mentor')) return 'mentor';
  if (prefixo.startsWith('admin')) return 'admin';
  return 'startup';
}

/**
 * Simula uma resposta de API para (path, method, body). Path já vem SEM o
 * prefixo /api (ver api.ts) mas COM a query string, ex.: "/startups?uf=PE".
 * Lança um erro parecido com o ApiError real quando não reconhece a rota, pra
 * facilitar notar na hora que uma tela nova chamou um endpoint que o mock ainda
 * não cobre (ver mockData.ts pra estender).
 */
export async function mockRequest<T>(
  path: string,
  method: string,
  bodyRaw?: BodyInit | null,
): Promise<T> {
  await delay();

  const [rota] = path.split('?');
  const body = typeof bodyRaw === 'string' && bodyRaw.length > 0 ? (JSON.parse(bodyRaw) as Record<string, unknown>) : undefined;
  const partes = rota.split('/').filter(Boolean); // ex.: "/startups/5" -> ["startups", "5"]

  // ---------- Autenticação ----------
  if (rota === '/auth/login' && method === 'POST') {
    const email = String(body?.email ?? 'startup@teste.com');
    const tipo = inferirTipoPorEmail(email);
    return { accessToken: 'mock-token', usuario: MOCK_USUARIO_POR_TIPO[tipo] } as AuthResponse as T;
  }
  if (rota === '/auth/register' && method === 'POST') {
    const tipo = (body?.tipoUsuario as TipoUsuario) ?? 'startup';
    const usuario: Usuario = {
      ...MOCK_USUARIO_POR_TIPO[tipo],
      nome: String(body?.nome ?? MOCK_USUARIO_POR_TIPO[tipo].nome),
      email: String(body?.email ?? MOCK_USUARIO_POR_TIPO[tipo].email),
    };
    return { accessToken: 'mock-token', usuario } as AuthResponse as T;
  }

  // ---------- Usuário ----------
  if (rota === '/users/me' && method === 'PATCH') {
    return { ...MOCK_USUARIOS[0], ...body } as T;
  }
  if (rota === '/users' && method === 'GET') {
    return MOCK_USUARIOS as T;
  }

  // ---------- Segmentos ----------
  if (rota === '/segments' && method === 'GET') {
    return MOCK_SEGMENTOS as T;
  }

  // ---------- Startups ----------
  if (rota === '/startups/me' && method === 'GET') {
    return getStartupForCurrentUser() as T;
  }
  if (rota === '/startups' && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    return saveStartupForCurrentUser(body ?? {}) as T;
  }
  if (rota === '/startups' && method === 'GET') {
    return paginated<Startup>(MOCK_STARTUPS) as T;
  }
  if (partes[0] === 'startups' && partes[1] && method === 'GET') {
    const id = Number(partes[1]);
    return (MOCK_STARTUPS.find((s) => s.id === id) ?? MOCK_STARTUPS[0]) as T;
  }

  // ---------- Investidores ----------
  if (rota === '/investors/me' && method === 'GET') {
    return getInvestorForCurrentUser() as T;
  }
  if (rota === '/investors' && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    return saveInvestorForCurrentUser(body ?? {}) as T;
  }
  if (rota === '/investors' && method === 'GET') {
    return paginated<Investidor>(MOCK_INVESTIDORES) as T;
  }
  if (partes[0] === 'investors' && partes[1] && method === 'GET') {
    const id = Number(partes[1]);
    return (MOCK_INVESTIDORES.find((i) => i.id === id) ?? MOCK_INVESTIDORES[0]) as T;
  }

  // ---------- Mentores ----------
  if (rota === '/mentors/me' && method === 'GET') {
    return MOCK_MENTORES[0] as T;
  }
  if (rota === '/mentors' && method === 'POST') {
    return { ...MOCK_MENTORES[0], ...body } as T;
  }
  // Edição do perfil (tela perfil-mentor): atualiza o mentor de mentira em
  // memória, para o restante das telas enxergar a mudança.
  if (rota === '/mentors/me' && method === 'PATCH') {
    Object.assign(MOCK_MENTORES[0], body);
    return MOCK_MENTORES[0] as T;
  }
  if (rota === '/mentors' && method === 'GET') {
    return MOCK_MENTORES as T;
  }
  if (partes[0] === 'mentors' && partes[1] && method === 'GET') {
    const id = Number(partes[1]);
    return (MOCK_MENTORES.find((m) => m.id === id) ?? MOCK_MENTORES[0]) as T;
  }

  // ---------- Interesses ----------
  if (rota === '/interests' && method === 'POST') {
    const interesse: Interesse = {
      id: 999,
      startupId: 1,
      investidorId: 1,
      origem: 'startup',
      criadoEm: new Date().toISOString(),
    };
    return interesse as T;
  }
  if (rota === '/interests/sent') {
    return MOCK_INTERESSES_ENVIADOS as T;
  }
  if (rota === '/interests/received') {
    return MOCK_INTERESSES_RECEBIDOS as T;
  }

  // ---------- Matches ----------
  if (rota === '/matches/suggestions') {
    // Sem saber "quem" está logado aqui (o mock não lê o token), devolve as
    // duas listas concatenadas — cada tela já filtra pelo campo que usa
    // (.startup ou .investidor), então isso não quebra nenhuma tela.
    return [...MOCK_SUGGESTIONS_PARA_STARTUP, ...MOCK_SUGGESTIONS_PARA_INVESTIDOR] as T;
  }
  if (rota === '/matches') {
    return MOCK_MATCHES as T;
  }

  // ---------- Conversas / mensagens ----------
  if (rota === '/conversations') {
    return MOCK_CONVERSAS as T;
  }
  if (partes[0] === 'conversations' && partes[2] === 'messages' && method === 'GET') {
    return MOCK_MENSAGENS as T;
  }
  if (partes[0] === 'conversations' && partes[2] === 'messages' && method === 'POST') {
    const nova: Mensagem = {
      id: MOCK_MENSAGENS.length + 1,
      conversaId: Number(partes[1]),
      remetenteId: 100,
      conteudo: String(body?.conteudo ?? ''),
      enviadaEm: new Date().toISOString(),
      lida: false,
    };
    MOCK_MENSAGENS.push(nova); // só em memória — some ao recarregar a página, e não tem problema pra fins de estilização
    return nova as T;
  }

  // ---------- Business Canvas ----------
  if (rota === '/business-canvas/me') {
    return MOCK_PLANO_NEGOCIO as T;
  }

  // ---------- LGPD / avaliação beta ----------
  if (rota === '/lgpd/consent' && method === 'POST') {
    return { id: 1, tipoConsentimento: body?.tipoConsentimento, aceito: true, versaoDocumento: body?.versaoDocumento, criadoEm: new Date().toISOString() } as T;
  }
  if (rota === '/beta-evaluation' && method === 'POST') {
    return undefined as T;
  }

  // ---------- Admin ----------
  if (rota === '/admin/metrics') {
    return MOCK_ADMIN_METRICS as T;
  }
  if (rota === '/admin/audit-log') {
    return {
      items: MOCK_AUDIT_LOG,
      total: MOCK_AUDIT_LOG.length,
      page: 1,
      limit: MOCK_AUDIT_LOG.length,
    } as T;
  }
  if (rota === '/admin/lgpd-summary') {
    return MOCK_LGPD_SUMMARY as T;
  }

  throw new Error(
    `[mock.ts] Nenhum dado de demonstração cadastrado para ${method} ${path} — adicione um caso em mock.ts ou desligue o MOCK_MODE.`,
  );
}
