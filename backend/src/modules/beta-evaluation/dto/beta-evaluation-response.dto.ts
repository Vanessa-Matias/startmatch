import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BetaEvaluationResponseDto {
  @Expose()
  id: number;

  @Expose()
  usuarioId?: number;

  @Expose()
  nota: number;

  @Expose()
  comentario?: string;

  @Expose()
  criadoEm: Date;
}
