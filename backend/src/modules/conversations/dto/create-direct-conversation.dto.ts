import { Type } from 'class-transformer';
import { IsIn, IsInt } from 'class-validator';

// Mentor inicia conversa direta com uma startup ou investidor.
// tipo = 'startup' ou 'investidor'; perfilId = id do PERFIL (o mesmo das telas de
// busca), não o id do usuário.
export class CreateDirectConversationDto {
  @IsIn(['startup', 'investidor'])
  tipo: 'startup' | 'investidor';

  @Type(() => Number)
  @IsInt()
  perfilId: number;
}
