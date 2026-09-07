// admin.module.ts
// =================
// Módulo do painel administrativo (Etapa 7 do fluxo de telas do PDF da designer:
// "Dashboard geral", "Gestão de usuários", indicadores consolidados). Não tem
// entidade própria — só lê dados que já existem em outros módulos (usuário,
// startup, investidor, mentor, match), por isso importa os repositórios direto
// via TypeOrmModule.forFeature em vez de depender dos módulos inteiros.
// Também expõe a leitura de auditoria (AuditModule) e o resumo agregado de
// LGPD (usa o LgpdService, exportado por LgpdModule).
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../users/entities/usuario.entity';
import { Startup } from '../startups/entities/startup.entity';
import { Investidor } from '../investors/entities/investidor.entity';
import { Mentor } from '../mentors/entities/mentor.entity';
import { Match } from '../matches/entities/match.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditModule } from '../audit/audit.module';
import { LgpdModule } from '../lgpd/lgpd.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Startup, Investidor, Mentor, Match]),
    AuditModule,
    LgpdModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
