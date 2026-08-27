import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MessageResponseDto {
  @Expose()
  id: number;

  @Expose()
  conversaId: number;

  @Expose()
  remetenteId: number;

  @Expose()
  conteudo: string;

  @Expose()
  enviadaEm: Date;

  @Expose()
  lida: boolean;
}
