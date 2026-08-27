import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { TipoUsuario } from '../../../common/enums';

export class CreateUserDto {
  nome: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  senha: string;

  @IsEnum(TipoUsuario)
  tipo: TipoUsuario;
}
