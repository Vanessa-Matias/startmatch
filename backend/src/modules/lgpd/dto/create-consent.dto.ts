import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { TipoConsentimento } from '../../../common/enums';

export class CreateConsentDto {
  @IsEnum(TipoConsentimento)
  tipoConsentimento: TipoConsentimento;

  @IsBoolean()
  aceito: boolean;

  @IsNotEmpty()
  versaoDocumento: string;
}
