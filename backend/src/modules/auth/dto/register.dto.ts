import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoUsuario } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'Wedja Sousa' })
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'wedja@teste.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', minLength: 8, maxLength: 8 })
  @MinLength(8)
  @MaxLength(8)
  senha: string;

  @ApiProperty({ enum: TipoUsuario })
  @IsEnum(TipoUsuario)
  tipoUsuario: TipoUsuario;
}
