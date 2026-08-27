import { Exclude, Expose } from 'class-transformer';
import { OrigemInteresse } from '../../../common/enums';

@Exclude()
export class InterestResponseDto {
  @Expose()
  id: number;

  @Expose()
  startupId: number;

  @Expose()
  investidorId: number;

  @Expose()
  origem: OrigemInteresse;

  @Expose()
  criadoEm: Date;
}
