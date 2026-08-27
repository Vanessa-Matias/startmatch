// auth.module.ts
// =================
// Liga o JwtModule (segredo/expiração vêm de configuration.ts, via .env) e a
// JwtStrategy do Passport, que é o que os outros módulos usam através do
// JwtAuthGuard para proteger rotas. Depende de UsersModule porque cadastro e
// login precisam ler/criar linhas em Usuario.
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AppConfig } from '../../config/configuration';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const jwt = configService.get('jwt', { infer: true });
        return {
          secret: jwt.secret,
          signOptions: {
            expiresIn: jwt.expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
