import { Exclude, Expose } from 'class-transformer';
import { TipoUsuario } from '../../../common/enums';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  nome: string;

  @Expose()
  email: string;

  @Expose()
  tipo: TipoUsuario;

  @Expose()
  criadoEm: Date;
}
