// Formato de resposta pensado direto para a tela admin-auditoria do frontend
// (frontend/src/pages/admin-auditoria/main.ts, interface EventoAuditoria) —
// os nomes de campo abaixo espelham exatamente o que aquela tela já esperava
// receber, então não foi preciso mudar a lógica de filtro/tabela que a Agnes
// construiu, só ligar a busca de dados reais.
export class AuditLogItemDto {
  data: string; // "07/09/2026, 14:32" — já formatado em pt-BR para exibição direta
  dataISO: string; // "2026-09-07" — usado pelo filtro de data (input type="date")
  usuario: string;
  email: string;
  tipo: 'login' | 'cadastro' | 'plano' | 'mentor' | 'lgpd';
  evento: string;
  acao: string;
  resultado: 'Sucesso' | 'Falha' | 'Pendente';
  origem: string;
}

export class AuditLogResponseDto {
  items: AuditLogItemDto[];
  total: number;
  page: number;
  limit: number;
}
