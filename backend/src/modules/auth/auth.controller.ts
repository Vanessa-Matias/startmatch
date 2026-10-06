// auth.controller.ts
// =====================
// Endpoints públicos de cadastro/login e o único endpoint autenticado do
// módulo (/auth/me, usado pelo frontend pra reidratar a sessão a partir do
// token salvo no localStorage). A validação de credenciais e a emissão do
// JWT ficam no AuthService — este arquivo só expõe as rotas HTTP.
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Cadastra uma nova conta e já devolve o token JWT' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Autentica com e-mail e senha e devolve o token JWT',
  })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso.' })
  @ApiResponse({
    status: 401,
    description: 'Senha ou e-mail incorretos, digite novamente.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Você não possui cadastro. Efetue o seu cadastro para poder acessar a plataforma.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Retorna os dados do usuário logado' })
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: RequestUser): Promise<UserResponseDto> {
    const usuario = await this.usersService.findById(user.id);
    return plainToInstance(UserResponseDto, usuario);
  }
}
