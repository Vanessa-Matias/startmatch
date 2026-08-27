// src/scripts/auth.ts
// ====================
// Tudo relacionado a login/sessão/permissão de tela. Duas funções são usadas em
// quase toda página do site:
//
//   - requireAuth(['startup'])  -> chamada no topo do main.ts de páginas protegidas.
//     Se o usuário não estiver logado (ou for do tipo errado), ela já redireciona
//     e a página nem chega a carregar o resto.
//   - dashboardPathForRole(tipo) -> descobre qual é o "dashboard padrão" de cada
//     tipo de usuário (startup, investidor, mentor, admin).
//
// MODO DEMONSTRAÇÃO (ver scripts/mock.ts): enquanto MOCK_MODE estiver ligado,
// requireAuth() nunca redireciona pra login — em vez disso, fabrica uma sessão de
// mentira na hora, com o papel certo pra tela que pediu (allowedRoles). É assim
// que a Agnes consegue abrir QUALQUER tela, em QUALQUER ordem, sem se cadastrar
// nem precisar de backend rodando.
//
// Não precisa mexer aqui para alterações visuais.

import { api } from './api';
import { MOCK_MODE } from './mock';
import { MOCK_USUARIO_POR_TIPO } from './mockData';
import type { TipoUsuario, Usuario } from './types';

const TOKEN_KEY = 'sc_token';
const USER_KEY = 'sc_user';

// Formato da resposta do backend em /auth/login e /auth/register — exportado
// porque scripts/mock.ts também usa esse formato pra simular a resposta.
export interface AuthResponse {
  accessToken: string;
  usuario: Usuario;
}

// Salva token + dados do usuário no localStorage do navegador (fica salvo mesmo se
// fechar a aba/navegador).
export function saveSession(accessToken: string, usuario: Usuario): void {
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

// Chama POST /auth/login (real ou mockado, ver scripts/mock.ts) e já salva a
// sessão se der certo. Em modo demonstração, qualquer senha funciona e o papel é
// adivinhado pelo prefixo do e-mail (ex.: investidor@teste.com -> investidor).
export async function login(email: string, senha: string): Promise<Usuario> {
  const response = await api.post<AuthResponse>('/auth/login', { email, senha });
  saveSession(response.accessToken, response.usuario);
  return response.usuario;
}

// Chama POST /auth/register (cria a conta de login — ainda não o "perfil" de
// startup/investidor/mentor, que é preenchido depois numa tela separada).
export async function register(
  nome: string,
  email: string,
  senha: string,
  tipoUsuario: TipoUsuario,
): Promise<Usuario> {
  const response = await api.post<AuthResponse>('/auth/register', {
    nome,
    email,
    senha,
    tipoUsuario,
  });
  saveSession(response.accessToken, response.usuario);
  return response.usuario;
}

export function logout(): void {
  clearSession();
  window.location.href = '../login/index.html';
}

// Mapa "tipo de usuário -> para onde mandar depois do login". Segue a etapa
// "Identificação do perfil" do fluxograma da designer (Aula 02 - PI.pdf): o
// sistema decide sozinho, sem perguntar nada ao usuário — cada papel tem seu
// próprio ambiente.
const DASHBOARD_PATH_BY_ROLE: Record<TipoUsuario, string> = {
  startup: '../dashboard-startup/index.html',
  investidor: '../dashboard-investidor/index.html',
  mentor: '../dashboard-mentor/index.html',
  admin: '../dashboard-admin/index.html',
};

export function dashboardPathForRole(tipo: TipoUsuario): string {
  return DASHBOARD_PATH_BY_ROLE[tipo];
}

/**
 * Deve ser chamada no topo do main.ts de toda página protegida. Redireciona para o
 * login se não houver sessão, ou para o dashboard do usuário se o papel não bater
 * com os permitidos (evita startup acessar tela de investidor e vice-versa).
 *
 * Exemplo de uso (início de um main.ts de tela só para startups):
 *   requireAuth(['startup']);
 *
 * Em MODO DEMONSTRAÇÃO (scripts/mock.ts), esta função nunca redireciona: se não
 * houver sessão, ou se a sessão atual for de um papel que essa tela não aceita,
 * ela fabrica na hora uma sessão de mentira com o primeiro papel de
 * `allowedRoles` (ou "startup", se a tela aceitar qualquer papel) e segue em
 * frente. Isso é o que permite abrir qualquer tela direto pela URL.
 */
export function requireAuth(allowedRoles?: TipoUsuario[]): Usuario {
  if (MOCK_MODE) {
    const usuarioAtual = getUser();
    const papelValido = usuarioAtual && (!allowedRoles || allowedRoles.includes(usuarioAtual.tipo));
    if (papelValido) return usuarioAtual as Usuario;

    const tipo = allowedRoles?.[0] ?? usuarioAtual?.tipo ?? 'startup';
    const usuarioMock = MOCK_USUARIO_POR_TIPO[tipo];
    saveSession('mock-token', usuarioMock);
    return usuarioMock;
  }

  const usuario = getUser();
  if (!getToken() || !usuario) {
    window.location.href = '../login/index.html';
    throw new Error('Não autenticado — redirecionando.');
  }

  if (allowedRoles && !allowedRoles.includes(usuario.tipo)) {
    window.location.href = dashboardPathForRole(usuario.tipo);
    throw new Error('Papel não autorizado — redirecionando.');
  }

  return usuario;
}
