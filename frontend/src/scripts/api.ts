// src/scripts/api.ts
// ===================
// Camada única de comunicação com o backend. TODA chamada de rede do frontend passa
// por aqui (pelo objeto `api` exportado no final) — nenhuma tela usa `fetch()`
// diretamente. Vantagens: o token de login é anexado automaticamente em toda
// requisição, e erros de sessão expirada (401) são tratados num lugar só.
//
// Você (Agnes) provavelmente não vai precisar mexer neste arquivo para alterações
// visuais — ele não tem nenhum HTML/CSS, só lógica de rede.
//
// MODO DEMONSTRAÇÃO: enquanto MOCK_MODE (scripts/mock.ts) estiver ligado, NENHUMA
// chamada daqui sai pra rede de verdade — request() devolve direto os dados de
// mentira de scripts/mockData.ts. Quando o banco de dados estiver pronto, desligar
// o MOCK_MODE faz o site inteiro voltar a falar com a API real, sem mudar nada
// nas telas.

import type { ApiErrorBody } from './types';
import { MOCK_MODE, mockRequest } from './mock';

// Em desenvolvimento, VITE_API_URL não é definida e cai no padrão '/api', que o Vite
// redireciona para o backend local (ver proxy em vite.config.ts).
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

// Chaves usadas no localStorage do navegador para guardar a sessão.
const TOKEN_KEY = 'sc_token';
const USER_KEY = 'sc_user';

// Erro customizado que carrega o status HTTP (401, 404, 409...) junto com a
// mensagem — assim cada tela pode decidir o que fazer dependendo do status
// (ex.: 404 em "/startups/me" significa "ainda não preencheu o perfil").
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Chamado sempre que o backend responde 401 (sessão expirada/inválida): limpa os
// dados salvos e manda o usuário de volta para o login (a menos que ele já esteja lá).
function handleUnauthorized(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  const isLoginPage = window.location.pathname.includes('/pages/login/');
  if (!isLoginPage) {
    window.location.href = '/src/pages/login/index.html';
  }
}

// Função central: monta a URL, injeta o header de autenticação (Bearer token) e
// converte qualquer erro HTTP em ApiError. `<T>` é o tipo de dado esperado na
// resposta (ex.: request<Startup[]>(...)).
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (MOCK_MODE) {
    return mockRequest<T>(path, options.method ?? 'GET', options.body as BodyInit | null | undefined);
  }

  const token = getStoredToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Nas rotas de autenticação (/auth/login, /auth/register) o 401 significa
  // "senha ou e-mail incorretos", não "sessão expirada" — então deixamos passar
  // para o tratamento de erro abaixo, que exibe a mensagem enviada pelo backend.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    handleUnauthorized();
    throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
  }

  if (!res.ok) {
    // O NestJS pode devolver "message" como string única ou array de strings
    // (quando é erro de validação de vários campos) — aqui juntamos tudo numa frase.
    const body = (await res.json().catch(() => ({ message: res.statusText }))) as ApiErrorBody;
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

// Objeto exportado e usado em todas as telas: api.get(...), api.post(...), etc.
// Exemplo de uso numa tela: `const startup = await api.get<Startup>('/startups/me')`
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
