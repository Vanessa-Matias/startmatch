// Resposta de uma conversa: já traz o nome de com quem a pessoa está falando.
export class ConversationResponseDto {
  id: number;
  // Preenchido só nas conversas de match.
  matchId: number | null;
  // 'match' (startup e investidor) ou 'direta' (mentor com startup/investidor).
  tipo: 'match' | 'direta';
  // Nome da outra pessoa (ou da startup/investidor).
  titulo: string;
  criadaEm: Date;
}
