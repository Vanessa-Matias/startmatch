// src/scripts/mentorDemo.ts
// ==========================
// Camada de dados da área do MENTOR.
//
//   - PERFIL EXTRA (foto, cargo, empresa, tempo de experiência, LinkedIn): ainda
//     fica só no navegador (localStorage), ligado ao id do mentor. Por isso a
//     startup só vê esses extras quando as duas contas usam o MESMO navegador
//     (caso da apresentação). O que o mentor define de verdade no backend:
//     área, bio, especialidades, dias e horários, duração, mentorias por mês e
//     modalidade (PATCH /mentors/me).
//   - SOLICITAÇÕES e SESSÕES: agora vêm da API (GET /mentorias). As telas
//     Dashboard, Solicitações, Agenda e Histórico chamam
//     carregarMentoriasDoMentor() antes de desenhar e depois leem as listas
//     abaixo. Aceitar/recusar/realizar chama PATCH /mentorias/:id/status.

import { api } from './api';
import type { Mentoria, ModalidadeMentor } from './types';

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

// ---------------------------------------------------------------------------
// Perfil extra do mentor
// ---------------------------------------------------------------------------

export type Modalidade = ModalidadeMentor;

export interface PerfilExtraMentor {
  nome: string;
  cargo: string;
  empresa: string;
  anosExperiencia: number | null;
  linkedin: string;
  /** Foto já reduzida para ~320px, em data URL (JPEG). */
  foto: string;
}

export const MODALIDADE_LABEL: Record<Modalidade, string> = {
  presencial: 'Presencial',
  hibrido: 'Híbrido (presencial ou remoto)',
  remoto: 'Remoto',
};

const PERFIL_VAZIO: PerfilExtraMentor = {
  nome: '',
  cargo: '',
  empresa: '',
  anosExperiencia: null,
  linkedin: '',
  foto: '',
};

export function lerPerfilExtra(mentorId: number): PerfilExtraMentor {
  return { ...PERFIL_VAZIO, ...ler<Partial<PerfilExtraMentor>>(`sm_mentor_perfil_${mentorId}`, {}) };
}

/** Retorna false quando o navegador não conseguiu guardar (ex.: foto grande demais). */
export function salvarPerfilExtra(mentorId: number, perfil: PerfilExtraMentor): boolean {
  return gravar(`sm_mentor_perfil_${mentorId}`, perfil);
}

/** Reduz a imagem escolhida para no máximo `lado` px e devolve um data URL JPEG. */
export function reduzirFoto(arquivo: File, lado = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        const escala = Math.min(1, lado / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  });
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'M';
  return partes
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// ---------------------------------------------------------------------------
// Solicitações de mentoria e sessões (vêm da API)
// ---------------------------------------------------------------------------

export type StatusSolicitacao = 'pendente' | 'aceita' | 'recusada';

export interface Solicitacao {
  /** Id da mentoria (em texto, para usar em data-id). */
  id: string;
  mentoriaId: number;
  startup: string;
  /** Id da startup (para iniciar conversa direta). */
  startupId: number;
  cidade: string;
  tema: string;
  data: string;
  horario: string;
  formato: string;
  mensagem: string;
  /** true quando a sessão aceita já passou do horário e pode ser marcada como realizada. */
  podeConcluir: boolean;
}

export interface SessaoRealizada {
  mentoriaId: number;
  startup: string;
  data: string;
  horario: string;
  /** Duração em horas. */
  horas: number;
  formato: string;
  tema: string;
  codigo: string | null;
}

// Listas preenchidas por carregarMentoriasDoMentor() (export let: quem importa
// sempre enxerga o valor mais recente).
export let SOLICITACOES: Solicitacao[] = [];
export let SESSOES_REALIZADAS: SessaoRealizada[] = [];
let STATUS: Record<string, StatusSolicitacao> = {};

function dataBonita(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });
}

function hora(data: Date): string {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function paraSolicitacao(m: Mentoria): Solicitacao {
  const inicio = new Date(m.dataHora);
  const fim = new Date(inicio.getTime() + m.duracaoMinutos * 60_000);
  return {
    id: String(m.id),
    mentoriaId: m.id,
    startup: m.startupNome,
    startupId: m.startupId,
    cidade: m.startupCidade ? `${m.startupCidade}/${m.startupUf}` : '—',
    tema: m.tema,
    data: dataBonita(m.dataHora),
    horario: `${hora(inicio)} às ${hora(fim)}`,
    formato: MODALIDADE_LABEL[m.modalidade],
    mensagem: m.mensagem || 'Sem mensagem.',
    podeConcluir: m.status === 'aceita' && inicio.getTime() <= Date.now(),
  };
}

function paraSessao(m: Mentoria): SessaoRealizada {
  const inicio = new Date(m.dataHora);
  return {
    mentoriaId: m.id,
    startup: m.startupNome,
    data: inicio.toLocaleDateString('pt-BR'),
    horario: hora(inicio),
    horas: m.duracaoMinutos / 60,
    formato: MODALIDADE_LABEL[m.modalidade],
    tema: m.tema,
    codigo: m.codigoCertificado,
  };
}

/** Busca as mentorias do mentor logado (GET /mentorias) e atualiza as listas. */
export async function carregarMentoriasDoMentor(): Promise<void> {
  const lista = await api.get<Mentoria[]>('/mentorias');
  const recebidas = lista.filter(
    (m) => m.status === 'pendente' || m.status === 'aceita' || m.status === 'recusada',
  );
  SOLICITACOES = recebidas.map(paraSolicitacao);
  STATUS = Object.fromEntries(
    recebidas.map((m) => [String(m.id), m.status as StatusSolicitacao]),
  );
  SESSOES_REALIZADAS = lista.filter((m) => m.status === 'realizada').map(paraSessao);
}

export function statusDe(id: string): StatusSolicitacao {
  return STATUS[id] ?? 'pendente';
}

/** Aceita ou recusa uma solicitação (PATCH /mentorias/:id/status) e recarrega. */
export async function definirStatus(id: string, status: StatusSolicitacao): Promise<void> {
  await api.patch(`/mentorias/${id}/status`, { status });
  await carregarMentoriasDoMentor();
}

/** Marca uma sessão aceita como realizada (gera o certificado) e recarrega. */
export async function marcarRealizada(id: string): Promise<void> {
  await api.patch(`/mentorias/${id}/status`, { status: 'realizada' });
  await carregarMentoriasDoMentor();
}

export function solicitacoesPendentes(): Solicitacao[] {
  return SOLICITACOES.filter((s) => statusDe(s.id) === 'pendente');
}

/** Solicitações aceitas = próximas sessões da agenda. */
export function proximasSessoes(): Solicitacao[] {
  return SOLICITACOES.filter((s) => statusDe(s.id) === 'aceita');
}

export function totalHoras(): number {
  return SESSOES_REALIZADAS.reduce((total, s) => total + s.horas, 0);
}

export function formatarHoras(horas: number): string {
  return `${horas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`;
}
