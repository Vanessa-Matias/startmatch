// users.controller.ts
// ======================
// Conta do usuário logado (ver/editar o próprio perfil básico) e a listagem
// completa de usuários usada só pelo painel administrativo. O cadastro em si
// (criação de conta) mora em auth.controller.ts — aqui é só leitura/edição de
// quem já existe.
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TipoUsuario } from '../../common/enums';
import type { RequestUser } from '../../common/interfaces';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Listagem completa de usuários — só para o painel administrativo
  // (Etapa 7 do fluxo de telas: "Gestão de usuários").
  @Get()
  @UseGuards(RolesGuard)
  @Roles(TipoUsuario.ADMIN)
  async findAll(): Promise<UserResponseDto[]> {
    const usuarios = await this.usersService.findAll();
    return plainToInstance(UserResponseDto, usuarios);
  }

  @Get('me')
  async me(@CurrentUser() user: RequestUser): Promise<UserResponseDto> {
    const usuario = await this.usersService.findById(user.id);
    return plainToInstance(UserResponseDto, usuario);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const usuario = await this.usersService.update(user.id, dto);
    return plainToInstance(UserResponseDto, usuario);
  }
}
