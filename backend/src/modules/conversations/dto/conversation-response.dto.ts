import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ConversationResponseDto {
  @Expose()
  id: number;

  @Expose()
  matchId: number;

  @Expose()
  criadaEm: Date;
}
