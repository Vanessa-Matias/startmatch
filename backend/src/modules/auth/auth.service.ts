// auth.service.ts
// ==================
// Regra de negócio de autenticação: cadastro (delega a criação da conta ao
// UsersService, que já cuida do hash de senha), validação de credenciais no
// login e emissão do JWT assinado que o frontend guarda e reenvia em cada
// request. Não lida com HTTP nem validação de formato — isso é do controller
// e dos DTOs.
//
// Também registra os eventos de auditoria de login e cadastro (ver
// modules/audit) — cadastro e login (sucesso e falha) são, junto com o
// consentimento LGPD e o cadastro de mentor, os eventos que alimentam a tela
// admin-auditoria.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Usuario } from '../users/entities/usuario.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from '../../common/interfaces';
import { AuditService } from '../audit/audit.service';
import { TipoEventoAuditoria, ResultadoAuditoria } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const usuario = await this.usersService.create({
      nome: dto.nome,
      email: dto.email,
      senha: dto.senha,
      tipo: dto.tipoUsuario,
    });

    await this.auditService.registrar({
      usuarioId: usuario.id,
      tipoEvento: TipoEventoAuditoria.CADASTRO,
      evento: 'Cadastro de conta',
      acao: `Conta criada como ${dto.tipoUsuario}`,
      resultado: ResultadoAuditoria.SUCESSO,
    });

    return this.buildAuthResponse(usuario);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      const usuario = await this.validateCredentials(dto.email, dto.senha);

      await this.auditService.registrar({
        usuarioId: usuario.id,
        tipoEvento: TipoEventoAuditoria.LOGIN,
        evento: 'Login',
        acao: 'Login realizado',
        resultado: ResultadoAuditoria.SUCESSO,
      });

      return this.buildAuthResponse(usuario);
    } catch (error) {
      // Só é possível registrar a tentativa falha se o e-mail existir (não
      // dá para ligar o log a um usuário que não existe) — evita vazar, via
      // log, se um e-mail está ou não cadastrado.
      const usuarioExistente = await this.usersService.findByEmail(dto.email);
      if (usuarioExistente) {
        await this.auditService.registrar({
          usuarioId: usuarioExistente.id,
          tipoEvento: TipoEventoAuditoria.LOGIN,
          evento: 'Login',
          acao: 'Tentativa de login com senha incorreta',
          resultado: ResultadoAuditoria.FALHA,
        });
      }
      throw error;
    }
  }

  async validateCredentials(email: string, senha: string): Promise<Usuario> {
    const usuario = await this.usersService.findByEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    return usuario;
  }

  private buildAuthResponse(usuario: Usuario): AuthResponseDto {
    const payload: JwtPayload = { sub: usuario.id, tipo: usuario.tipo };
    return {
      accessToken: this.jwtService.sign(payload),
      usuario: plainToInstance(UserResponseDto, usuario),
    };
  }
}
