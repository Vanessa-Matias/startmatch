import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SegmentoResponseDto {
  @Expose()
  id: number;

  @Expose()
  nome: string;

  @Expose()
  slug: string;

  @Expose()
  descricao?: string;
}
