// src/scripts/mentorDemo.ts
// ==========================
// Dados da área do MENTOR que ainda não existem no backend, num lugar só, para
// as telas se conectarem entre si:
//
//   perfil-mentor/  -> grava o PERFIL EXTRA (foto, cargo, empresa, tempo de
//                      experiência, modalidade, LinkedIn)
//   mentorias/      -> a startup vê esse perfil extra no card e no "Ver perfil"
//   dashboard-mentor/ , agenda/ , solicitacoes/ , historico-mentorias/
//                   -> usam as SOLICITAÇÕES e SESSÕES abaixo
//   mensagens/      -> cada solicitação vira uma conversa simulada com a startup
//                      (ver scripts/matchSimulado.ts)
//
// Os campos que o backend JÁ tem (área de atuação, bio, especialidades,
// disponibilidade, vínculo com a rede parceira) são salvos de verdade via
// PATCH /mentors/me. Os campos extras ficam no localStorage do navegador, ligados
// ao id do mentor — por isso aparecem para a startup só quando as duas contas
// são usadas no MESMO navegador (caso da apresentação). Para valer entre
// computadores diferentes, o backend precisa ganhar essas colunas (com migration).

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

export type Modalidade = 'online' | 'presencial' | 'ambos';

export interface PerfilExtraMentor {
  nome: string;
  cargo: string;
  empresa: string;
  anosExperiencia: number | null;
  modalidade: Modalidade;
  linkedin: string;
  /** Foto já reduzida para ~320px, em data URL (JPEG). */
  foto: string;
}

export const MODALIDADE_LABEL: Record<Modalidade, string> = {
  online: 'Online',
  presencial: 'Presencial (Recife)',
  ambos: 'Online ou presencial (Recife)',
};

const PERFIL_VAZIO: PerfilExtraMentor = {
  nome: '',
  cargo: '',
  empresa: '',
  anosExperiencia: null,
  modalidade: 'online',
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
// Solicitações de mentoria (recebidas pelo mentor)
// ---------------------------------------------------------------------------

export type StatusSolicitacao = 'pendente' | 'aceita' | 'recusada';

export interface Solicitacao {
  /** Também é o id da conversa simulada em Mensagens (?simulado=<id>). */
  id: string;
  startup: string;
  cidade: string;
  tema: string;
  data: string;
  horario: string;
  formato: string;
  mensagem: string;
}

export const SOLICITACOES: Solicitacao[] = [
  {
    id: 'sol-agrosense',
    startup: 'AgroSense',
    cidade: 'Petrolina/PE',
    tema: 'Captação de investimento e pitch',
    data: '20 de outubro',
    horario: '14:00 às 15:00',
    formato: 'Online',
    mensagem:
      'Estamos abrindo nossa primeira rodada anjo e queremos ajuda para estruturar o pitch e definir o valuation antes de falar com investidores.',
  },
  {
    id: 'sol-edulab',
    startup: 'EduLab',
    cidade: 'Caruaru/PE',
    tema: 'Métricas de produto e tração',
    data: '23 de outubro',
    horario: '16:00 às 17:00',
    formato: 'Online',
    mensagem:
      'Temos 1.200 alunos ativos, mas não sabemos quais métricas mostrar para provar tração. Gostaríamos de uma sessão para organizar isso.',
  },
];

const CHAVE_STATUS = 'sm_mentor_solicitacoes_status';

export function statusSolicitacoes(): Record<string, StatusSolicitacao> {
  return ler<Record<string, StatusSolicitacao>>(CHAVE_STATUS, {});
}

export function statusDe(id: string): StatusSolicitacao {
  return statusSolicitacoes()[id] ?? 'pendente';
}

export function definirStatus(id: string, status: StatusSolicitacao): void {
  gravar(CHAVE_STATUS, { ...statusSolicitacoes(), [id]: status });
}

export function solicitacoesPendentes(): Solicitacao[] {
  return SOLICITACOES.filter((s) => statusDe(s.id) === 'pendente');
}

/** Solicitações aceitas = próximas sessões da agenda. */
export function proximasSessoes(): Solicitacao[] {
  return SOLICITACOES.filter((s) => statusDe(s.id) === 'aceita');
}

// ---------------------------------------------------------------------------
// Sessões já realizadas (histórico)
// ---------------------------------------------------------------------------

export interface SessaoRealizada {
  startup: string;
  data: string;
  horario: string;
  /** Duração em horas. */
  horas: number;
  formato: string;
  tema: string;
}

export const SESSOES_REALIZADAS: SessaoRealizada[] = [
  {
    startup: 'Clínica Fácil',
    data: '02/09/2026',
    horario: '14:00',
    horas: 1,
    formato: 'Online',
    tema: 'Estratégia e crescimento da startup',
  },
  {
    startup: 'Rota Verde',
    data: '16/09/2026',
    horario: '10:00',
    horas: 1,
    formato: 'Presencial',
    tema: 'Modelo de receita recorrente',
  },
  {
    startup: 'Clínica Fácil',
    data: '30/09/2026',
    horario: '14:00',
    horas: 0.5,
    formato: 'Online',
    tema: 'Revisão do pitch para investidores',
  },
];

export function totalHoras(): number {
  return SESSOES_REALIZADAS.reduce((total, s) => total + s.horas, 0);
}

export function formatarHoras(horas: number): string {
  return `${horas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`;
}
