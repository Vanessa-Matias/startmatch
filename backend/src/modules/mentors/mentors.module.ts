// mentors.module.ts
// ====================
// Exporta MentorsService pelo mesmo motivo de startups/investors: admin
// (métricas — total de mentores, vínculo Porto Digital) depende dele.
// Depende do AuditModule para registrar o evento de auditoria de
// criação/atualização de perfil de mentor.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentor } from './entities/mentor.entity';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor]), AuditModule],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [MentorsService],
})
export class MentorsModule {}
