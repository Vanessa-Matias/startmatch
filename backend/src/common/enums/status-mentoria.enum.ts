// Ciclo de vida de uma mentoria agendada pela startup.
// pendente -> (mentor) aceita ou recusa -> aceita -> (mentor) realizada.
// A startup pode cancelar enquanto estiver pendente ou aceita.
export enum StatusMentoria {
  PENDENTE = 'pendente',
  ACEITA = 'aceita',
  RECUSADA = 'recusada',
  REALIZADA = 'realizada',
  CANCELADA = 'cancelada',
}
