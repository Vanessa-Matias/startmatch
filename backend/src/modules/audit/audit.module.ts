// audit.module.ts
// ==================
// Módulo de auditoria. Não tem controller próprio — a leitura (`GET
// /admin/audit-log`) fica no AdminModule, junto dos outros indicadores
// administrativos; este módulo só expõe o AuditService para os módulos que
// precisam registrar eventos (auth, lgpd, mentors).
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAuditoria } from './entities/log-auditoria.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogAuditoria])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
