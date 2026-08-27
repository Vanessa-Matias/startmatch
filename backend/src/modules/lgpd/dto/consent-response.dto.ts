import { Exclude, Expose } from 'class-transformer';
import { TipoConsentimento } from '../../../common/enums';

@Exclude()
export class ConsentResponseDto {
  @Expose()
  id: number;

  @Expose()
  tipoConsentimento: TipoConsentimento;

  @Expose()
  aceito: boolean;

  @Expose()
  versaoDocumento: string;

  @Expose()
  criadoEm: Date;
}
