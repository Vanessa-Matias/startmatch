// src/scripts/auth.ts
// ====================

// Tudo relacionado a login/sessão/permissão de tela.

// MODO DEMONSTRAÇÃO (ver scripts/mock.ts): enquanto MOCK_MODE estiver ligado,
// requireAuth() nunca redireciona pra login — em vez disso, fabrica uma sessão
// de mentira na hora, com o papel certo pra tela que pediu (allowedRoles).

import { api } from './api';
import { MOCK_MODE } from './mock';
import { MOCK_USUARIO_POR_TIPO } from './mockData';
import type { TipoUsuario, Usuario } from './types';

const TOKEN_KEY = 'sc_token';
const USER_KEY = 'sc_user';

export interface AuthResponse {
  accessToken: string;
  usuario: Usuario;
}

export function saveSession(
  accessToken: string,
  usuario: Usuario,
): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): Usuario | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null && getUser() !== null;
}

export async function login(
  email: string,
  senha: string,
): Promise<Usuario> {
  const response = await api.post<AuthResponse>(
    '/auth/login',
    { email, senha },
  );

  saveSession(
    response.accessToken,
    response.usuario,
  );

  return response.usuario;
}

export async function register(
  nome: string,
  email: string,
  senha: string,
  tipoUsuario: TipoUsuario,
): Promise<Usuario> {
  const response = await api.post<AuthResponse>(
    '/auth/register',
    {
      nome,
      email,
      senha,
      tipoUsuario,
    },
  );

  saveSession(
    response.accessToken,
    response.usuario,
  );

  return response.usuario;
}

export function logout(): void {
  clearSession();

  window.location.href =
    '/src/pages/login/index.html';
}

// ======================================================
// DASHBOARDS
// ======================================================
//
// IMPORTANTE:
// Os caminhos começam com "/" para serem absolutos a partir
// da raiz do Vite.
//
// Assim evitamos que o navegador monte caminhos relativos
// incorretos dependendo da página em que o usuário está.
//

const DASHBOARD_PATH_BY_ROLE: Record<
  TipoUsuario,
  string
> = {
  startup: '/src/pages/dashboard-startup/index.html',

  investidor:
    '/src/pages/dashboard-investidor/index.html',

  mentor:
    '/src/pages/dashboard-mentor/index.html',

  admin:
    '/src/pages/dashboard-admin/index.html',
};

export function dashboardPathForRole(
  tipo: TipoUsuario,
): string {
  return DASHBOARD_PATH_BY_ROLE[tipo];
}

/**
 * Deve ser chamada no topo do main.ts de toda página protegida.
 */
export function requireAuth(
  allowedRoles?: TipoUsuario[],
): Usuario {

  // ====================================================
  // MODO DEMONSTRAÇÃO
  // ====================================================

  if (MOCK_MODE) {
    const usuarioAtual = getUser();

    const papelValido =
      usuarioAtual &&
      (!allowedRoles ||
        allowedRoles.includes(usuarioAtual.tipo));

    if (papelValido) {
      return usuarioAtual as Usuario;
    }

    const tipo =
      allowedRoles?.[0] ??
      usuarioAtual?.tipo ??
      'startup';

    const usuarioMock =
      MOCK_USUARIO_POR_TIPO[tipo];

    saveSession(
      'mock-token',
      usuarioMock,
    );

    return usuarioMock;
  }

  // ====================================================
  // MODO NORMAL
  // ====================================================

  const usuario = getUser();

  if (!getToken() || !usuario) {
    window.location.href =
      '/src/pages/login/index.html';

    throw new Error(
      'Não autenticado — redirecionando.',
    );
  }

  // ====================================================
  // PAPEL NÃO AUTORIZADO
  // ====================================================

  if (
    allowedRoles &&
    !allowedRoles.includes(usuario.tipo)
  ) {
    window.location.href =
      dashboardPathForRole(usuario.tipo);

    throw new Error(
      'Papel não autorizado — redirecionando.',
    );
  }

  return usuario;
}