import { Exclude, Expose } from 'class-transformer';
import { PlanoAssinatura } from '../../../common/enums';

@Exclude()
export class MentorResponseDto {
  @Expose()
  id: number;

  @Expose()
  areaAtuacao: string;

  @Expose()
  bio: string;

  @Expose()
  especialidades: string[];

  @Expose()
  vinculoPortoDigital: boolean;

  @Expose()
  disponibilidade: string;

  @Expose()
  planoAssinatura: PlanoAssinatura;
}
