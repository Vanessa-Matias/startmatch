import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoUsuario } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  nome: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(8)
  senha: string;

  @ApiProperty({ enum: TipoUsuario })
  @IsEnum(TipoUsuario)
  tipoUsuario: TipoUsuario;
}
