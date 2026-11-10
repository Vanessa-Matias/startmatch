import {
  IsEmail,
  IsIn,
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

  // >> O cadastro público só aceita estes 3 perfis. Perfil "admin" NÃO pode ser
  // >> criado por aqui (antes qualquer pessoa conseguia se cadastrar como admin).
  @ApiProperty({
    enum: [TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR, TipoUsuario.MENTOR],
  })
  @IsIn([TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR, TipoUsuario.MENTOR], {
    message: 'Tipo de usuário inválido. Escolha startup, investidor ou mentor.',
  })
  tipoUsuario: TipoUsuario;
}
