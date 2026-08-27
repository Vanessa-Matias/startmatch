// lgpd.module.ts
// =================
// Módulo isolado — não depende de nem é dependido por outros módulos de
// domínio, só guarda o histórico de consentimento vinculado ao usuarioId.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentimentoLgpd } from './entities/consentimento-lgpd.entity';
import { LgpdService } from './lgpd.service';
import { LgpdController } from './lgpd.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentimentoLgpd])],
  controllers: [LgpdController],
  providers: [LgpdService],
  exports: [LgpdService],
})
export class LgpdModule {}
