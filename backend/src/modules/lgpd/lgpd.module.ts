// lgpd.module.ts
// =================
// Guarda o histórico de consentimento vinculado ao usuarioId. Depende do
// AuditModule só para registrar o evento de auditoria de cada consentimento;
// é exportado porque o AdminModule usa LgpdService.countByTipo()/countTotal()
// no painel agregado de LGPD (GET /admin/lgpd-summary).
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentimentoLgpd } from './entities/consentimento-lgpd.entity';
import { LgpdService } from './lgpd.service';
import { LgpdController } from './lgpd.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentimentoLgpd]), AuditModule],
  controllers: [LgpdController],
  providers: [LgpdService],
  exports: [LgpdService],
})
export class LgpdModule {}
